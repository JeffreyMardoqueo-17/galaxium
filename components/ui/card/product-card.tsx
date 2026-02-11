'use client'

import React, { useRef, useState } from 'react'
import { Upload, Camera, AlertCircle } from 'lucide-react'
import type { ProductWithPhotosResponse } from '@/types/product'
import { uploadProductPhoto } from '@/services/product-photo.service'

interface ProductCardProps {
  product: ProductWithPhotosResponse
  onPhotoUpdate?: (productId: number) => void
}

interface PreviewFile {
  file: File
  preview: string
  isPrimary: boolean
  isUploading: boolean
}

export function ProductCard({
  product,
  onPhotoUpdate,
}: ProductCardProps) {
  const [showPhotoForm, setShowPhotoForm] = useState(false)
  const [previews, setPreviews] = useState<PreviewFile[]>([])
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const primaryPhoto = product.photos?.find((p) => p.isPrimary) || product.photos?.[0]
  const hasPhotos = (product.photos?.length ?? 0) > 0

  // Obtener URL de la foto (ya sea del servidor o preview local)
  const getPhotoUrl = (photo: any) => {
    if (photo?.photoUrl) return photo.photoUrl // URL del servidor
    if (photo?.file instanceof File) return URL.createObjectURL(photo.file) // Preview local
    return null
  }

  const primaryPhotoUrl = primaryPhoto ? getPhotoUrl(primaryPhoto) : null

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? [])
    if (selected.length > 4) {
      setError('Solo puedes subir hasta 4 imágenes.')
      return
    }
    setError(null)

    const nextPreviews: PreviewFile[] = selected.map((file, i) => ({
      file,
      preview: URL.createObjectURL(file),
      isPrimary: i === 0,
      isUploading: false,
    }))
    setPreviews(nextPreviews)
  }

  const removeFile = (index: number) => {
    setPreviews((prev) => {
      const next = prev.filter((_, i) => i !== index)
      if (!next.some((p) => p.isPrimary) && next.length > 0) {
        next[0].isPrimary = true
      }
      return next
    })
  }

  const setPrimary = (index: number) => {
    setPreviews((prev) =>
      prev.map((p, i) => ({ ...p, isPrimary: i === index }))
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    if (previews.length === 0) {
      setError('Selecciona al menos una imagen.')
      return
    }

    const updatedPreviews = previews.map((p) => ({ ...p, isUploading: true }))
    setPreviews(updatedPreviews)

    try {
      for (let i = 0; i < previews.length; i++) {
        const p = previews[i]
        await uploadProductPhoto(product.id as number, p.file, p.isPrimary)
        setPreviews((prev) =>
          prev.map((item, j) =>
            j === i ? { ...item, isUploading: false } : item
          )
        )
      }
      setMessage('¡Imágenes subidas correctamente!')
      setPreviews([])
      setShowPhotoForm(false)
      onPhotoUpdate?.(product.id as number)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error subiendo las imágenes'
      setError(msg)
      setPreviews((prev) => prev.map((p) => ({ ...p, isUploading: false })))
    }
  }

  return (
    <div className="group overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm hover:shadow-md transition-all">
      {/* Image Container */}
      <div className="relative h-48 w-full overflow-hidden bg-gray-100">
        {primaryPhotoUrl ? (
          <img
            src={primaryPhotoUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100">
            <Camera className="h-12 w-12 text-gray-400" />
          </div>
        )}

        {/* Upload Button Overlay */}
        <button
          onClick={() => setShowPhotoForm(true)}
          className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
        >
          <div className="flex items-center gap-2 rounded-lg bg-white/95 px-4 py-2 text-gray-900">
            <Upload className="h-4 w-4" />
            <span className="text-sm font-medium">
              {hasPhotos ? 'Cambiar' : 'Agregar'} Imagen
            </span>
          </div>
        </button>

        {/* Additional Photos Badge */}
        {hasPhotos && (product.photos?.length ?? 0) > 1 && (
          <div className="absolute bottom-2 right-2 rounded bg-gray-900/80 px-2 py-1 text-xs font-medium text-white">
            +{(product.photos?.length ?? 0) - 1}
          </div>
        )}

        {/* No Price Alert */}
        {(!product.salePrice || product.salePrice === 0) && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-red-100/90 px-2 py-1 rounded text-red-700 text-xs font-medium">
            <AlertCircle className="w-3 h-3" />
            Sin precio
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
          <p className="text-xs text-gray-500 mt-1">{product.sku}</p>
        </div>

        {/* Pricing and Stock */}
        <div className="space-y-1">
          {product.salePrice && product.salePrice > 0 ? (
            <p className="text-sm font-semibold text-gray-900">
              ${product.salePrice.toFixed(2)}
            </p>
          ) : (
            <p className="text-sm font-semibold text-red-600">Sin precio</p>
          )}
          <p className="text-xs text-gray-500">
            Stock: <span className={product.stock && product.stock > product.minimumStock ? 'text-green-600' : 'text-red-600'}>
              {product.stock ?? 0}
            </span> | Mín: {product.minimumStock}
          </p>
        </div>

        {/* Category and Status */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="rounded bg-gray-100 px-2 py-1 text-gray-700">
            {product.categoryName || 'Sin categoría'}
          </span>
          <span
            className={`px-2 py-1 rounded font-medium ${
              product.isActive
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {product.isActive ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      </div>

      {/* Photo Form Modal */}
      {showPhotoForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold">Subir fotos - {product.name}</h3>
            
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Selecciona hasta 4 imágenes
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFilesChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>

            {previews.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {previews.map((p, idx) => (
                  <div key={idx} className="relative border rounded overflow-hidden">
                    <img
                      src={p.preview}
                      alt={`Preview ${idx + 1}`}
                      className={`w-full h-20 object-cover ${p.isUploading ? 'opacity-50' : ''}`}
                    />
                    {p.isUploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <div className="border-2 border-blue-600 border-t-transparent w-4 h-4 rounded-full animate-spin"></div>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      disabled={p.isUploading}
                      className="absolute top-1 right-1 bg-red-600 text-white text-xs rounded px-1 py-0.5 disabled:opacity-50"
                    >
                      X
                    </button>
                    <label className="absolute top-1 left-1 flex items-center gap-1">
                      <input
                        type="radio"
                        checked={p.isPrimary}
                        onChange={() => setPrimary(idx)}
                        disabled={p.isUploading}
                        className="w-3 h-3"
                      />
                      <span className="text-white text-xs font-bold">Principal</span>
                    </label>
                  </div>
                ))}
              </div>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}
            {message && <p className="text-sm text-green-600">{message}</p>}

            <div className="flex gap-2 pt-4">
              <button
                onClick={handleSubmit}
                disabled={previews.length === 0}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition"
              >
                Subir
              </button>
              <button
                onClick={() => {
                  setShowPhotoForm(false)
                  setPreviews([])
                  setError(null)
                  setMessage(null)
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
