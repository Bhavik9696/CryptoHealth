import { useState, useRef, DragEvent, ChangeEvent } from 'react'
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react'
import { cn, formatFileSize } from '@/lib/utils'
import { ALLOWED_EXTENSIONS, ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB } from '@/lib/constants'

type UploadState = 'idle' | 'selected' | 'uploading' | 'processing' | 'success' | 'error'

interface ReportUploadProps {
  onFileSelected: (file: File) => void
  onClear: () => void
  selectedFile: File | null
  uploadState: UploadState
  progress?: number
  error?: string
}

export function ReportUpload({
  onFileSelected,
  onClear,
  selectedFile,
  uploadState,
  progress = 0,
  error,
}: ReportUploadProps) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function validateFile(file: File): string | null {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return `File type not allowed. Please upload: ${ALLOWED_EXTENSIONS.join(', ')}`
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`
    }
    return null
  }

  function handleFile(file: File) {
    const err = validateFile(file)
    if (err) {
      alert(err)
      return
    }
    onFileSelected(file)
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  if (uploadState === 'uploading' || uploadState === 'processing') {
    return (
      <div className="border border-slate-200 rounded-xl p-8 bg-slate-50 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-900 font-medium">
          {uploadState === 'uploading' ? 'Uploading Report...' : 'Processing...'}
        </p>
        {uploadState === 'uploading' && (
          <>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-slate-500 text-sm">{progress}% — Please do not close this page.</p>
          </>
        )}
      </div>
    )
  }

  if (uploadState === 'success') {
    return (
      <div className="border border-teal-200 rounded-xl p-8 bg-teal-50 text-center space-y-3">
        <CheckCircle className="w-12 h-12 text-teal-600 mx-auto" />
        <p className="text-teal-700 font-semibold">Report uploaded successfully!</p>
      </div>
    )
  }

  if (selectedFile) {
    return (
      <div className="border border-teal-200 rounded-xl p-5 bg-teal-50 flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center shrink-0">
          <File className="w-5 h-5 text-teal-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-teal-900 font-medium text-sm truncate">{selectedFile.name}</p>
          <p className="text-teal-700/70 text-xs">{formatFileSize(selectedFile.size)}</p>
        </div>
        <button
          onClick={onClear}
          className="text-teal-600 hover:text-teal-800 p-1 rounded transition-colors"
          aria-label="Remove selected file"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    )
  }

  if (error) {
    return (
      <div className="border border-red-200 rounded-xl p-8 bg-red-50 text-center space-y-3">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <p className="text-red-700 font-medium">{error}</p>
        <button
          onClick={() => inputRef.current?.click()}
          className="text-red-600 hover:underline text-sm font-medium"
        >
          Try again
        </button>
        <input ref={inputRef} type="file" accept={ALLOWED_EXTENSIONS.join(',')} className="hidden" onChange={onChange} />
      </div>
    )
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      className={cn(
        'border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200',
        dragging
          ? 'border-teal-500 bg-teal-50'
          : 'border-slate-300 hover:border-teal-500 hover:bg-slate-50 bg-white'
      )}
      role="button"
      aria-label="Upload medical report file"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
    >
      <Upload className="w-10 h-10 text-slate-400 mx-auto mb-4" />
      <p className="text-slate-900 font-medium mb-1">Drag & Drop File Here</p>
      <p className="text-slate-500 text-sm mb-3">or</p>
      <span className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 shadow-sm rounded-lg text-sm font-medium transition-colors">
        Browse Files
      </span>
      <p className="text-slate-500 text-xs mt-4">
        Supported: PDF, JPG, PNG, WebP · Max {MAX_FILE_SIZE_MB}MB
      </p>
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_EXTENSIONS.join(',')}
        className="hidden"
        onChange={onChange}
        aria-label="Select file to upload"
      />
    </div>
  )
}
