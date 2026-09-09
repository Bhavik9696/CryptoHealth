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
      <div className="border border-slate-700 rounded-xl p-8 bg-slate-800/40 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-white font-medium">
          {uploadState === 'uploading' ? 'Uploading Report...' : 'Processing...'}
        </p>
        {uploadState === 'uploading' && (
          <>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-sky-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-slate-400 text-sm">{progress}% — Please do not close this page.</p>
          </>
        )}
      </div>
    )
  }

  if (uploadState === 'success') {
    return (
      <div className="border border-emerald-500/30 rounded-xl p-8 bg-emerald-500/5 text-center space-y-3">
        <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
        <p className="text-emerald-400 font-semibold">Report uploaded successfully!</p>
      </div>
    )
  }

  if (selectedFile) {
    return (
      <div className="border border-sky-500/40 rounded-xl p-5 bg-sky-500/5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-sky-500/15 flex items-center justify-center shrink-0">
          <File className="w-5 h-5 text-sky-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium text-sm truncate">{selectedFile.name}</p>
          <p className="text-slate-400 text-xs">{formatFileSize(selectedFile.size)}</p>
        </div>
        <button
          onClick={onClear}
          className="text-slate-400 hover:text-white p-1 rounded transition-colors"
          aria-label="Remove selected file"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    )
  }

  if (error) {
    return (
      <div className="border border-red-500/30 rounded-xl p-8 bg-red-500/5 text-center space-y-3">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
        <p className="text-red-400 font-medium">{error}</p>
        <button
          onClick={() => inputRef.current?.click()}
          className="text-sky-400 hover:underline text-sm"
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
          ? 'border-sky-500 bg-sky-500/10'
          : 'border-slate-700 hover:border-sky-500/50 hover:bg-slate-800/40 bg-slate-800/20'
      )}
      role="button"
      aria-label="Upload medical report file"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
    >
      <Upload className="w-10 h-10 text-slate-400 mx-auto mb-4" />
      <p className="text-white font-medium mb-1">Drag & Drop File Here</p>
      <p className="text-slate-400 text-sm mb-3">or</p>
      <span className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-lg text-sm font-medium transition-colors">
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
