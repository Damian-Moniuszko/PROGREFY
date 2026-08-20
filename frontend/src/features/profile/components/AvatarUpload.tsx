import { useState } from "react";
import { uploadAvatar } from "../api/profile.api";

interface Props {
  token: string;
}

export default function AvatarUpload({ token }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");

  async function handleUpload() {
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      await uploadAvatar(token, formData);
      setMessage("Zdjęcie zostało zaktualizowane");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Błąd przesyłania zdjęcia");
    }
  }

  return (
    <section className="avatar-upload">
      <input
        type="file"
        accept="image/*"
        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
      />

      <button type="button" onClick={handleUpload}>
        Zmień avatar
      </button>

      {message && <p>{message}</p>}
    </section>
  );
}
