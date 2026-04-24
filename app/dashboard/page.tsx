"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { Mic, Upload, Trash2, Loader2, Clock, FileAudio, ArrowRight } from "lucide-react";

type Transcript = {
  id: string;
  text: string;
  createdAt: string;
  filename: string | null;
};

export default function DashboardPage() {
  const [file, setFile] = useState<File | null>(null);
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const fetchTranscripts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/transcripts");
      if (res.ok) {
        const data = await res.json();
        setTranscripts(data);
      }
    } catch (e) {
      console.error("Failed to fetch transcripts", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTranscripts();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        setFile(null);
        return;
      }
      if (!selected.type.startsWith("audio/")) {
        setError("Please select an audio file");
        setFile(null);
        return;
      }
      setError("");
      setFile(selected);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("audio", file);
      formData.append("filename", file.name);

      const res = await fetch("/api/transcripts", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const transcript = await res.json();
        setTranscripts((prev) => [transcript, ...prev]);
        setFile(null);
      } else {
        const data = await res.json().catch(() => ({ message: "Upload failed" }));
        setError(data.error || data.message || "Upload failed");
      }
    } catch (e) {
      setError("An error occurred. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this transcript?")) return;
    try {
      const res = await fetch("/api/transcripts?id=" + id, { method: "DELETE" });
      if (res.ok) {
        setTranscripts((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (e) {
      console.error("Failed to delete", e);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900">
                <Mic className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-zinc-900">Audio Transcription</h1>
                <p className="text-sm text-zinc-500">Admin Dashboard</p>
              </div>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900">Upload Audio</h2>
          <div className="rounded-2xl border border-zinc-200 bg-white p-6">
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700">Audio File</label>
                <div className="flex items-center gap-3">
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-300 border-dashed bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-600 hover:bg-zinc-100 transition-colors">
                    <Upload className="h-4 w-4" />
                    <span>{file ? file.name : "Choose audio file"}</span>
                    <input type="file" accept="audio/*" onChange={handleFileChange} className="hidden" />
                  </label>
                  {file && (
                    <button
                      type="submit"
                      disabled={uploading}
                      className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
                    >
                      {uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ArrowRight className="h-4 w-4" />
                      )}
                      <span>{uploading ? "Transcribing..." : "Transcribe"}</span>
                    </button>
                  )}
                </div>
                <p className="mt-2 text-xs text-zinc-400">Max file size: 10MB. Only audio files supported.</p>
              </div>
              {error && (
                <div className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
              )}
            </form>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-zinc-900">Transcripts</h2>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-zinc-300" />
            </div>
          ) : transcripts.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200 bg-white px-8 py-12 text-center">
              <FileAudio className="mx-auto mb-3 h-12 w-12 text-zinc-300" />
              <p className="text-zinc-500">No transcripts yet. Please upload an audio file to start transcribing.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transcripts.map((t) => (
                <div
                  key={t.id}
                  className="rounded-2xl border border-zinc-200 bg-white p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 text-sm text-zinc-500">
                        <Clock className="h-4 w-4" />
                        <span>{formatDate(t.createdAt)}</span>
                      </div>
                      <p className="text-zinc-900 whitespace-pre-wrap">{t.text}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="rounded-lg p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}