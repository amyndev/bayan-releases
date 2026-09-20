import { supabase } from "@/lib/supabase"
import { optimizeImage, type OptimizationResult, type OptimizeImageOptions } from "./image-optimizer"

export type StorageBucket = "stories" | "characters" | "places"

export interface UploadImageOptions extends OptimizeImageOptions {
  bucket?: StorageBucket | string
  folder?: string
}

export interface UploadResult {
  publicUrl: string
  path: string
  stats: OptimizationResult
}

export const DEFAULT_STORAGE_BUCKET: StorageBucket = "stories"

/**
 * Optimizes an image (converts to WebP if smaller) and uploads it to Supabase Storage.
 */
export async function uploadOptimizedImage(
  file: File,
  options: UploadImageOptions = {}
): Promise<UploadResult> {
  const { bucket = DEFAULT_STORAGE_BUCKET, folder, ...optimizeOpts } = options

  // 1. Optimize image in the browser (downscale, compress, WebP conversion)
  const stats = await optimizeImage(file, optimizeOpts)

  // 2. Generate a sanitized, unique filename
  const cleanBase = stats.fileName
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 40)

  const extension = stats.format === "webp" ? "webp" : file.name.split(".").pop() || "jpg"
  const uniqueId = crypto.randomUUID().slice(0, 8)
  const filename = `${Date.now()}-${cleanBase}-${uniqueId}.${extension}`
  const path = folder ? `${folder}/${filename}` : filename

  const contentType = stats.format === "webp" ? "image/webp" : file.type || "image/jpeg"

  // 3. Upload the optimized Blob to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, stats.blob, {
      contentType,
      cacheControl: "31536000",
      upsert: false,
    })

  if (uploadError) {
    console.error("Supabase Storage upload error:", uploadError)
    throw new Error(
      `Storage upload failed: ${uploadError.message}. Make sure public bucket "${bucket}" exists and has an INSERT policy.`
    )
  }

  // 4. Retrieve the public URL
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)

  return {
    publicUrl: data.publicUrl,
    path,
    stats,
  }
}

/**
 * Deletes an image from Supabase storage by path or full public URL.
 */
export async function deleteImageFromStorage(
  pathOrUrl: string,
  explicitBucket?: StorageBucket | string
): Promise<void> {
  try {
    let bucket = explicitBucket || DEFAULT_STORAGE_BUCKET
    let filePath = pathOrUrl

    // Auto-detect bucket from public URL if present
    const match = pathOrUrl.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/)
    if (match) {
      bucket = match[1]
      filePath = match[2]
    }

    if (!filePath) return

    const { error } = await supabase.storage.from(bucket).remove([filePath])
    if (error) {
      console.warn("Storage deletion warning:", error)
    }
  } catch (err) {
    console.warn("Error deleting image from storage:", err)
  }
}
