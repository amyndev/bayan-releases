export interface OptimizeImageOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
}

export interface OptimizationResult {
  blob: Blob
  fileName: string
  format: string
  originalSize: number
  optimizedSize: number
  savedBytes: number
  savedPercent: number
}

/**
 * Optimizes an image (JPEG, JPG, PNG) using browser canvas API:
 * 1. Downscales if exceeding maxWidth / maxHeight while preserving aspect ratio.
 * 2. Compresses and converts to .webp.
 * 3. Compares size: if the WebP result is smaller, uses WebP; otherwise falls back to original.
 */
export async function optimizeImage(
  file: File,
  options: OptimizeImageOptions = {}
): Promise<OptimizationResult> {
  const { maxWidth = 1920, maxHeight = 1920, quality = 0.82 } = options

  // If already SVG or animated gif, don't convert to canvas
  if (file.type === "image/svg+xml" || file.type === "image/gif") {
    return {
      blob: file,
      fileName: file.name,
      format: file.type.split("/")[1] || "original",
      originalSize: file.size,
      optimizedSize: file.size,
      savedBytes: 0,
      savedPercent: 0,
    }
  }

  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)

      let { width, height } = img

      // Calculate scaled dimensions if necessary
      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        } else {
          width = Math.round((width * maxHeight) / height)
          height = maxHeight
        }
      }

      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext("2d")
      if (!ctx) {
        reject(new Error("Unable to create canvas context for image optimization."))
        return
      }

      // Draw image onto canvas
      ctx.drawImage(img, 0, 0, width, height)

      // Convert to WebP
      canvas.toBlob(
        (webpBlob) => {
          if (!webpBlob) {
            // Fallback to original if conversion fails
            resolve({
              blob: file,
              fileName: file.name,
              format: file.type.split("/")[1] || "original",
              originalSize: file.size,
              optimizedSize: file.size,
              savedBytes: 0,
              savedPercent: 0,
            })
            return
          }

          const baseName = file.name.replace(/\.[^/.]+$/, "")

          // Check if WebP achieved compression compared to original
          if (webpBlob.size < file.size) {
            const savedBytes = file.size - webpBlob.size
            const savedPercent = Math.round((savedBytes / file.size) * 100)

            resolve({
              blob: webpBlob,
              fileName: `${baseName}.webp`,
              format: "webp",
              originalSize: file.size,
              optimizedSize: webpBlob.size,
              savedBytes,
              savedPercent,
            })
          } else {
            // Original was already smaller or more efficient
            resolve({
              blob: file,
              fileName: file.name,
              format: file.type.split("/")[1] || "original",
              originalSize: file.size,
              optimizedSize: file.size,
              savedBytes: 0,
              savedPercent: 0,
            })
          }
        },
        "image/webp",
        quality
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error("Failed to load image for optimization."))
    }

    img.src = objectUrl
  })
}

/**
 * Format bytes into human-readable size (e.g. 1.2 MB or 420 KB)
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}
