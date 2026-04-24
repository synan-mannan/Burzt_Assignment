import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { transcribeAudio } from "@/lib/gemini";
import { headers } from "next/headers";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/ogg",
  "audio/aac",
  "audio/webm",
];

async function getSessionToken(): Promise<string | null> {
  const h = await headers();
  const cookieHeader = h.get("cookie");
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/better-auth\.session_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

async function getCurrentUser() {
  const token = await getSessionToken();
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });
  return session?.user || null;
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const transcripts = await prisma.transcript.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(transcripts);
  } catch (error) {
    console.error("GET /api/transcripts error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("audio") as File | null;
    const filename = formData.get("filename") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Invalid file type: ${file.type}. Allowed: ${ALLOWED_TYPES.join(", ")}`,
        },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `File too large. Max size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
        },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const transcriptText = await transcribeAudio(buffer, file.type);

    const transcript = await prisma.transcript.create({
      data: {
        text: transcriptText,
        filename: filename || file.name || null,
        userId: user.id,
      },
    });

    return NextResponse.json(transcript, { status: 201 });
  } catch (error) {
    console.error("POST /api/transcripts error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Transcript ID required" },
        { status: 400 },
      );
    }

    const transcript = await prisma.transcript.findUnique({
      where: { id },
    });

    if (!transcript || transcript.userId !== user.id) {
      return NextResponse.json(
        { error: "Transcript not found" },
        { status: 404 },
      );
    }

    await prisma.transcript.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/transcripts error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
