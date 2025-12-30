'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, Video } from 'lucide-react'
import { Button } from './Button'

interface FileUploadProps {
  accept?: string
  maxSize?: number // em MB
  onFileSelect: (file: File) => void
  preview?: boolean
  currentFile?: string | null
  label?: string
  error?: string
}

export function FileUpload({
  accept = 'image/*,video/*',
  maxSize = 50,
  onFileSelect,
  preview = true,
  currentFile,
  label,
  error,
}: FileUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentFile || null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    if (file.size > maxSize * 1024 * 1024) {
      alert(`Arquivo muito grande. Tamanho máximo: ${maxSize}MB`)
      return
    }

    onFileSelect(file)

    if (preview) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const removeFile = () => {
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const isVideo = previewUrl?.includes('video') || accept.includes('video')

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      <div
        className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragActive
            ? 'border-primary bg-primary-light'
            : error
            ? 'border-red-300'
            : 'border-gray-300 hover:border-primary-light'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {previewUrl ? (
          <div className="relative">
            {isVideo ? (
              <div className="relative w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <Video className="w-16 h-16 text-gray-400" />
                <video
                  src={previewUrl}
                  className="absolute inset-0 w-full h-full object-cover rounded-lg"
                  controls
                />
              </div>
            ) : (
              <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <button
              onClick={removeFile}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-600 mb-2">
              Arraste e solte o arquivo aqui ou
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              Selecionar Arquivo
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Tamanho máximo: {maxSize}MB
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}




