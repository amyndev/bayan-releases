import * as React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatBytes } from "@/lib/image-optimizer"
import { uploadOptimizedImage, DEFAULT_STORAGE_BUCKET, type StorageBucket, type UploadResult } from "@/lib/storage"
import { Loader2, Sparkles, Trash2, UploadCloud } from "lucide-react"

interface ImageUploaderProps {
  value?: string | null
  onChange: (url: string) => void
  folder?: string
  bucket?: StorageBucket | string
  label?: string
}

export function ImageUploader({
  value,
  onChange,
  folder,
  bucket = DEFAULT_STORAGE_BUCKET,
  label = "Cover Image",
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = React.useState(false)
  const [uploadStats, setUploadStats] = React.useState<UploadResult["stats"] | null>(null)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [isDragOver, setIsDragOver] = React.useState(false)

  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleProcessFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file (JPEG, PNG, or WebP).")
      return
    }

    setIsUploading(true)
    setErrorMessage(null)
    setUploadStats(null)

    try {
      const result = await uploadOptimizedImage(file, {
        bucket,
        folder,
        maxWidth: 1920,
        quality: 0.82,
      })

      onChange(result.publicUrl)
      setUploadStats(result.stats)
    } catch (err: unknown) {
      console.error("Image upload failed:", err)
      setErrorMessage(
        err instanceof Error
          ? err.message
          : `Failed to upload image. Check if Supabase '${bucket}' bucket exists and has an upload policy.`
      )
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleProcessFile(file)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleProcessFile(file)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleRemove = () => {
    onChange("")
    setUploadStats(null)
    setErrorMessage(null)
  }

  return (
    <div className="space-y-2">
      {/* Label */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium leading-none">{label}</span>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-2.5 text-xs text-destructive">
          {errorMessage}
        </div>
      )}

      {/* Active Preview */}
      {value ? (
        <div className="relative overflow-hidden rounded-lg border bg-muted/30">
          <div className="relative aspect-video w-full overflow-hidden bg-muted">
            <img
              src={value}
              alt="Uploaded cover preview"
              className="h-full w-full object-cover"
              onError={(e) => {
                ;(e.target as HTMLElement).style.display = "none"
              }}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-card/80 backdrop-blur-sm">
            {uploadStats ? (
              <Badge variant="secondary" className="gap-1 text-[11px] font-normal">
                <Sparkles className="h-3 w-3 text-emerald-500" />
                <span>
                  {uploadStats.format.toUpperCase()} • {formatBytes(uploadStats.originalSize)} →{" "}
                  {formatBytes(uploadStats.optimizedSize)}
                </span>
                {uploadStats.savedPercent > 0 && (
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    (-{uploadStats.savedPercent}%)
                  </span>
                )}
              </Badge>
            ) : (
              <span className="truncate text-xs text-muted-foreground max-w-[240px]">
                {value}
              </span>
            )}

            <div className="flex items-center gap-1.5 ml-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                Change
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={handleRemove}
                disabled={isUploading}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        // Drag & Drop Upload Zone (Upload Only)
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`group flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-all ${
            isDragOver
              ? "border-primary bg-primary/5 scale-[0.99]"
              : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/20"
          } ${isUploading ? "pointer-events-none opacity-60" : ""}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/jpg"
            onChange={handleFileChange}
            className="hidden"
          />

          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-xs font-medium text-foreground">
                Optimizing & Uploading to Supabase...
              </p>
              <p className="text-[11px] text-muted-foreground">
                Compressing to WebP and uploading to {bucket} bucket
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <UploadCloud className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-foreground">
                  <span className="text-primary hover:underline">Click to upload</span> or drag and drop
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  JPEG, JPG, or PNG • Converted to WebP and compressed
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}
