"use client";

import { FormEvent, useState } from "react";

type Props = {
  userId: string;
  onUploaded?: () => void;
};

export function AvatarUploadForm({ userId, onUploaded }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!file) return;

    setIsLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("avatar", file);

    const response = await fetch(`/api/admin/users/${userId}/avatar`, {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error || "Upload that bai");
      setIsLoading(false);
      return;
    }

    setMessage("Da cap nhat avatar");
    setFile(null);
    setIsLoading(false);
    onUploaded?.();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-center gap-2">
      <input
        type="file"
        accept="image/*"
        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        className="max-w-[210px] text-xs text-slate-600 file:mr-2 file:rounded-md file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-brand-700"
      />
      <button
        type="submit"
        disabled={!file || isLoading}
        className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
      >
        {isLoading ? "Dang tai..." : "Doi avatar"}
      </button>
      {message && <span className="text-xs text-slate-600">{message}</span>}
    </form>
  );
}
