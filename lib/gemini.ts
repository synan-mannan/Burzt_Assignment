import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function transcribeAudio(
  audioBuffer: Buffer,
  mimeType: string,
): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const base64Audio = audioBuffer.toString("base64");

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType,
              data: base64Audio,
            },
          },
          {
            text: "Transcribe this audio file accurately. Return only the transcription text without any additional commentary or formatting.",
          },
        ],
      },
    ],
  });

  const response = await result.response;
  const text = response.text();

  if (!text || text.trim().length === 0) {
    throw new Error("No transcription received from Gemini API");
  }

  return text.trim();
}
