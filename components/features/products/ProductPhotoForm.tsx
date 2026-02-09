"use client";

import * as React from "react";
import { uploadProductPhoto } from "@/services/product-photo.service";

interface ProductPhotoFormProps {
  productId?: number | null;
  onUploaded?: () => void;
}

interface PreviewFile {
  file: File;
  preview: string;
  isPrimary: boolean;
  isUploading: boolean;
}

export function ProductPhotoForm({ productId, onUploaded }: ProductPhotoFormProps) {
  const [previews, setPreviews] = React.useState<PreviewFile[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);
  const canUpload = Boolean(productId);
  const maxFiles = 4;

  function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    if (selected.length > maxFiles) {
      setError(`Solo puedes subir hasta ${maxFiles} imágenes.`);
      return;
    }
    setError(null);

    const nextPreviews: PreviewFile[] = selected.map((file, i) => ({
      file,
      preview: URL.createObjectURL(file),
      isPrimary: i === 0, // por defecto la primera es principal
      isUploading: false,
    }));
    setPreviews(nextPreviews);
  }

  function removeFile(index: number) {
    setPreviews((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (!next.some(p => p.isPrimary) && next.length > 0) next[0].isPrimary = true;
      return next;
    });
  }

  function setPrimary(index: number) {
    setPreviews((prev) =>
      prev.map((p, i) => ({ ...p, isPrimary: i === index }))
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!canUpload) {
      setError("Guarda el producto primero para subir una foto.");
      return;
    }
    if (previews.length === 0) {
      setError("Selecciona al menos una imagen.");
      return;
    }

    const updatedPreviews = previews.map(p => ({ ...p, isUploading: true }));
    setPreviews(updatedPreviews);

    try {
      for (let i = 0; i < previews.length; i++) {
        const p = previews[i];
        await uploadProductPhoto(productId!, p.file, p.isPrimary);
        setPreviews((prev) =>
          prev.map((item, j) =>
            j === i ? { ...item, isUploading: false } : item
          )
        );
      }
      setMessage("¡Imágenes subidas correctamente!");
      setPreviews([]);
      onUploaded?.();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error subiendo las imágenes";
      setError(msg);
      setPreviews((prev) => prev.map(p => ({ ...p, isUploading: false })));
    }
  }

  return (
    <div className="rounded border border-gray-200 p-4 bg-white shadow-md">
      <h3 className="text-lg font-semibold mb-2">Subir fotos del producto</h3>
      <p className="text-sm text-gray-600 mb-3">
        Puedes subir hasta {maxFiles} imágenes. Selecciona la principal.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          disabled={!canUpload}
          onChange={handleFilesChange}
          className="block w-full text-sm text-gray-600 border border-gray-300 rounded px-3 py-2 cursor-pointer"
        />

        {previews.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
            {previews.map((p, index) => (
              <div
                key={p.file.name + index}
                className="relative border rounded overflow-hidden"
              >
                <img
                  src={p.preview}
                  alt={`Preview ${index + 1}`}
                  className={`w-full h-24 object-cover ${
                    p.isUploading ? "opacity-50" : ""
                  }`}
                />
                {p.isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="loader border-t-4 border-blue-600 w-6 h-6 rounded-full animate-spin"></div>
                  </div>
                )}
                <div className="absolute top-1 left-1 flex items-center space-x-1">
                  <input
                    type="radio"
                    checked={p.isPrimary}
                    onChange={() => setPrimary(index)}
                    className="w-4 h-4"
                    disabled={p.isUploading}
                  />
                  <span className="text-white text-xs font-bold">Principal</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute top-1 right-1 text-white text-xs bg-red-600 rounded px-1"
                  disabled={p.isUploading}
                >
                  X
                </button>
              </div>
            ))}
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-green-600">{message}</p>}

        <button
          type="submit"
          disabled={!canUpload || previews.length === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Subir imágenes
        </button>
      </form>

      <style jsx>{`
        .loader {
          border-top-color: transparent;
        }
      `}</style>
    </div>
  );
}
