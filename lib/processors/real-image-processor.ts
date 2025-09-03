export interface RealImageOptions {
  width?: number
  height?: number
  quality?: number
  outputFormat?: "jpeg" | "png" | "webp"
  maintainAspectRatio?: boolean
  backgroundColor?: string
  compressionLevel?: "low" | "medium" | "high" | "maximum"
  filters?: {
    brightness?: number
    contrast?: number
    saturation?: number
    blur?: number
    sepia?: boolean
    grayscale?: boolean
  }
  watermarkText?: string
  watermarkOpacity?: number
  position?: string
  textColor?: string
  fontSize?: number
  watermarkImage?: File
  flipDirection?: string
  customRotation?: number
  cropArea?: { x: number; y: number; width: number; height: number }
}

export class RealImageProcessor {
  static async resizeImage(file: File, options: RealImageOptions): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d", { alpha: true, willReadFrequently: false })
      if (!ctx) {
        reject(new Error("Canvas not supported"))
        return
      }

      const img = new Image()
      img.onload = () => {
        try {
          let targetWidth = options.width || img.naturalWidth
          let targetHeight = options.height || img.naturalHeight

          // Maintain aspect ratio if requested
          if (options.maintainAspectRatio && options.width && options.height) {
            const aspectRatio = img.naturalWidth / img.naturalHeight
            if (targetWidth / targetHeight > aspectRatio) {
              targetWidth = targetHeight * aspectRatio
            } else {
              targetHeight = targetWidth / aspectRatio
            }
          }

          // Ensure minimum dimensions
          targetWidth = Math.max(1, Math.floor(targetWidth))
          targetHeight = Math.max(1, Math.floor(targetHeight))

          canvas.width = targetWidth
          canvas.height = targetHeight

          // Add background color for non-PNG formats
          if (options.backgroundColor && options.outputFormat !== "png") {
            ctx.fillStyle = options.backgroundColor
            ctx.fillRect(0, 0, targetWidth, targetHeight)
          }

          // High quality resize with proper settings
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = "high"
          
          // Use different algorithms based on scale
          const scale = Math.min(targetWidth / img.naturalWidth, targetHeight / img.naturalHeight)
          if (scale < 0.5) {
            // Downscaling - use area averaging for better quality
            this.drawImageWithAreaAveraging(ctx, img, 0, 0, targetWidth, targetHeight)
          } else {
            ctx.drawImage(img, 0, 0, targetWidth, targetHeight)
          }

          // Convert to blob with proper quality
          const quality = Math.max(0.1, Math.min(1.0, (options.quality || 90) / 100))
          const mimeType = `image/${options.outputFormat || "png"}`

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob)
              } else {
                reject(new Error("Failed to create blob"))
              }
            },
            mimeType,
            quality
          )
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => reject(new Error("Failed to load image"))
      img.crossOrigin = "anonymous"
      img.src = URL.createObjectURL(file)
    })
  }

  private static drawImageWithAreaAveraging(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    dx: number,
    dy: number,
    dw: number,
    dh: number
  ): void {
    // For significant downscaling, use multiple passes for better quality
    const scale = Math.min(dw / img.naturalWidth, dh / img.naturalHeight)
    
    if (scale < 0.5) {
      // Multi-pass downscaling
      let currentCanvas = document.createElement("canvas")
      let currentCtx = currentCanvas.getContext("2d")!
      currentCanvas.width = img.naturalWidth
      currentCanvas.height = img.naturalHeight
      currentCtx.drawImage(img, 0, 0)
      
      let currentScale = 1
      while (currentScale > scale * 2) {
        const newScale = currentScale * 0.5
        const newWidth = Math.floor(img.naturalWidth * newScale)
        const newHeight = Math.floor(img.naturalHeight * newScale)
        
        const newCanvas = document.createElement("canvas")
        const newCtx = newCanvas.getContext("2d")!
        newCanvas.width = newWidth
        newCanvas.height = newHeight
        
        newCtx.imageSmoothingEnabled = true
        newCtx.imageSmoothingQuality = "high"
        newCtx.drawImage(currentCanvas, 0, 0, newWidth, newHeight)
        
        currentCanvas = newCanvas
        currentCtx = newCtx
        currentScale = newScale
      }
      
      // Final scaling
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = "high"
      ctx.drawImage(currentCanvas, dx, dy, dw, dh)
    } else {
      ctx.drawImage(img, dx, dy, dw, dh)
    }
  }

  static async compressImage(file: File, options: RealImageOptions): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d", { alpha: true, willReadFrequently: false })
      if (!ctx) {
        reject(new Error("Canvas not supported"))
        return
      }

      const img = new Image()
      img.onload = () => {
        try {
          // Real compression with actual size reduction
          let scale = 1
          let quality = 0.9

          switch (options.compressionLevel) {
            case "low":
              scale = 0.98
              quality = 0.92
              break
            case "medium":
              scale = 0.85
              quality = 0.75
              break
            case "high":
              scale = 0.7
              quality = 0.6
              break
            case "maximum":
              scale = 0.5
              quality = 0.4
              break
          }

          const targetWidth = Math.max(1, Math.floor(img.naturalWidth * scale))
          const targetHeight = Math.max(1, Math.floor(img.naturalHeight * scale))

          canvas.width = targetWidth
          canvas.height = targetHeight

          // Use different smoothing based on compression level
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = options.compressionLevel === "maximum" ? "medium" : "high"
          
          // Apply compression-specific optimizations
          if (options.compressionLevel === "maximum") {
            // Apply slight blur to reduce high-frequency details
            ctx.filter = "blur(0.5px)"
          }
          
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight)

          // Apply additional quality reduction if specified
          if (options.quality) {
            quality = Math.min(quality, options.quality / 100)
          }

          // Force JPEG for better compression unless PNG specifically requested
          const outputFormat = options.outputFormat || (options.compressionLevel === "maximum" ? "jpeg" : "webp")
          const mimeType = `image/${outputFormat}`

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob)
              } else {
                reject(new Error("Failed to create blob"))
              }
            },
            mimeType,
            quality
          )
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => reject(new Error("Failed to load image"))
      img.crossOrigin = "anonymous"
      img.src = URL.createObjectURL(file)
    })
  }

  static async convertFormat(file: File, format: "jpeg" | "png" | "webp", options: RealImageOptions = {}): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d", { alpha: format === "png" })
      if (!ctx) {
        reject(new Error("Canvas not supported"))
        return
      }

      const img = new Image()
      img.onload = () => {
        try {
          canvas.width = img.naturalWidth
          canvas.height = img.naturalHeight

          // Add white background for JPEG
          if (format === "jpeg") {
            ctx.fillStyle = options.backgroundColor || "#ffffff"
            ctx.fillRect(0, 0, canvas.width, canvas.height)
          }

          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = "high"
          ctx.drawImage(img, 0, 0)

          const quality = Math.max(0.1, Math.min(1.0, (options.quality || 90) / 100))
          const mimeType = `image/${format}`

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob)
              } else {
                reject(new Error("Failed to create blob"))
              }
            },
            mimeType,
            quality
          )
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => reject(new Error("Failed to load image"))
      img.crossOrigin = "anonymous"
      img.src = URL.createObjectURL(file)
    })
  }

  static async cropImage(file: File, cropArea: any, options: RealImageOptions): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d", { alpha: true })
      if (!ctx) {
        reject(new Error("Canvas not supported"))
        return
      }

      const img = new Image()
      img.onload = () => {
        try {
          const { x, y, width, height } = cropArea

          // Convert percentage to pixels with proper bounds checking
          const sourceX = Math.max(0, Math.min(img.naturalWidth - 1, (x / 100) * img.naturalWidth))
          const sourceY = Math.max(0, Math.min(img.naturalHeight - 1, (y / 100) * img.naturalHeight))
          const sourceWidth = Math.max(1, Math.min(img.naturalWidth - sourceX, (width / 100) * img.naturalWidth))
          const sourceHeight = Math.max(1, Math.min(img.naturalHeight - sourceY, (height / 100) * img.naturalHeight))

          canvas.width = Math.floor(sourceWidth)
          canvas.height = Math.floor(sourceHeight)

          // Add background if needed
          if (options.backgroundColor && options.outputFormat !== "png") {
            ctx.fillStyle = options.backgroundColor
            ctx.fillRect(0, 0, canvas.width, canvas.height)
          }

          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = "high"
          ctx.drawImage(
            img,
            sourceX, sourceY, sourceWidth, sourceHeight,
            0, 0, canvas.width, canvas.height
          )

          const quality = Math.max(0.1, Math.min(1.0, (options.quality || 95) / 100))
          const mimeType = `image/${options.outputFormat || "png"}`

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob)
              } else {
                reject(new Error("Failed to create blob"))
              }
            },
            mimeType,
            quality
          )
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => reject(new Error("Failed to load image"))
      img.crossOrigin = "anonymous"
      img.src = URL.createObjectURL(file)
    })
  }

  static async rotateImage(file: File, options: RealImageOptions): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d", { alpha: true })
      if (!ctx) {
        reject(new Error("Canvas not supported"))
        return
      }

      const img = new Image()
      img.onload = () => {
        try {
          const angle = ((options.customRotation || 0) % 360) * Math.PI / 180

          // Calculate new canvas size after rotation
          const cos = Math.abs(Math.cos(angle))
          const sin = Math.abs(Math.sin(angle))
          const newWidth = Math.ceil(img.naturalWidth * cos + img.naturalHeight * sin)
          const newHeight = Math.ceil(img.naturalWidth * sin + img.naturalHeight * cos)

          canvas.width = newWidth
          canvas.height = newHeight

          // Add background if needed
          if (options.backgroundColor && options.outputFormat !== "png") {
            ctx.fillStyle = options.backgroundColor
            ctx.fillRect(0, 0, newWidth, newHeight)
          }

          // Move to center and rotate
          ctx.translate(newWidth / 2, newHeight / 2)
          ctx.rotate(angle)
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = "high"
          ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2)

          const quality = Math.max(0.1, Math.min(1.0, (options.quality || 95) / 100))
          const mimeType = `image/${options.outputFormat || "png"}`

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob)
              } else {
                reject(new Error("Failed to create blob"))
              }
            },
            mimeType,
            quality
          )
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => reject(new Error("Failed to load image"))
      img.crossOrigin = "anonymous"
      img.src = URL.createObjectURL(file)
    })
  }

  static async applyFilters(file: File, options: RealImageOptions): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d", { alpha: true })
      if (!ctx) {
        reject(new Error("Canvas not supported"))
        return
      }

      const img = new Image()
      img.onload = () => {
        try {
          canvas.width = img.naturalWidth
          canvas.height = img.naturalHeight

          // Build CSS filter string with proper bounds
          const filters = options.filters || {}
          const filterArray = []

          if (filters.brightness !== undefined && filters.brightness !== 100) {
            const brightness = Math.max(0, Math.min(300, filters.brightness))
            filterArray.push(`brightness(${brightness}%)`)
          }
          if (filters.contrast !== undefined && filters.contrast !== 100) {
            const contrast = Math.max(0, Math.min(300, filters.contrast))
            filterArray.push(`contrast(${contrast}%)`)
          }
          if (filters.saturation !== undefined && filters.saturation !== 100) {
            const saturation = Math.max(0, Math.min(300, filters.saturation))
            filterArray.push(`saturate(${saturation}%)`)
          }
          if (filters.blur !== undefined && filters.blur > 0) {
            const blur = Math.max(0, Math.min(50, filters.blur))
            filterArray.push(`blur(${blur}px)`)
          }
          if (filters.sepia) {
            filterArray.push("sepia(100%)")
          }
          if (filters.grayscale) {
            filterArray.push("grayscale(100%)")
          }

          if (filterArray.length > 0) {
            ctx.filter = filterArray.join(" ")
          }

          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = "high"
          ctx.drawImage(img, 0, 0)

          const quality = Math.max(0.1, Math.min(1.0, (options.quality || 95) / 100))
          const mimeType = `image/${options.outputFormat || "png"}`

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob)
              } else {
                reject(new Error("Failed to create blob"))
              }
            },
            mimeType,
            quality
          )
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => reject(new Error("Failed to load image"))
      img.crossOrigin = "anonymous"
      img.src = URL.createObjectURL(file)
    })
  }

  static async addWatermark(file: File, watermarkText: string, options: RealImageOptions): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d", { alpha: true })
      if (!ctx) {
        reject(new Error("Canvas not supported"))
        return
      }

      const img = new Image()
      img.onload = async () => {
        try {
          canvas.width = img.naturalWidth
          canvas.height = img.naturalHeight

          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = "high"
          ctx.drawImage(img, 0, 0)

          // Add text watermark
          if (watermarkText && !options.watermarkImage) {
            ctx.save()
            ctx.globalAlpha = Math.max(0.1, Math.min(1.0, options.watermarkOpacity || 0.5))

            const fontSize = options.fontSize || Math.min(canvas.width, canvas.height) * 0.05
            ctx.font = `bold ${fontSize}px Arial`
            ctx.fillStyle = options.textColor || "#ffffff"
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"

            // Add shadow for better visibility
            ctx.shadowColor = "rgba(0, 0, 0, 0.8)"
            ctx.shadowBlur = 4
            ctx.shadowOffsetX = 2
            ctx.shadowOffsetY = 2

            let x = canvas.width / 2
            let y = canvas.height / 2

            switch (options.position) {
              case "top-left":
                x = fontSize
                y = fontSize * 2
                ctx.textAlign = "left"
                break
              case "top-right":
                x = canvas.width - fontSize
                y = fontSize * 2
                ctx.textAlign = "right"
                break
              case "bottom-left":
                x = fontSize
                y = canvas.height - fontSize
                ctx.textAlign = "left"
                break
              case "bottom-right":
                x = canvas.width - fontSize
                y = canvas.height - fontSize
                ctx.textAlign = "right"
                break
              case "diagonal":
                ctx.translate(canvas.width / 2, canvas.height / 2)
                ctx.rotate(-Math.PI / 4)
                x = 0
                y = 0
                break
            }

            ctx.fillText(watermarkText, x, y)
            ctx.restore()
          }

          // Add image watermark
          if (options.watermarkImage) {
            await this.addImageWatermark(ctx, canvas, options.watermarkImage, options)
          }

          const quality = Math.max(0.1, Math.min(1.0, (options.quality || 95) / 100))
          const mimeType = `image/${options.outputFormat || "png"}`

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob)
              } else {
                reject(new Error("Failed to create blob"))
              }
            },
            mimeType,
            quality
          )
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => reject(new Error("Failed to load image"))
      img.crossOrigin = "anonymous"
      img.src = URL.createObjectURL(file)
    })
  }

  private static async addImageWatermark(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    watermarkFile: File,
    options: RealImageOptions
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const watermarkImg = new Image()
      
      watermarkImg.onload = () => {
        try {
          ctx.save()
          ctx.globalAlpha = Math.max(0.1, Math.min(1.0, options.watermarkOpacity || 0.5))

          const watermarkSize = Math.min(canvas.width, canvas.height) * 0.2
          let x = canvas.width - watermarkSize - 20
          let y = canvas.height - watermarkSize - 20

          switch (options.position) {
            case "top-left":
              x = 20
              y = 20
              break
            case "top-right":
              x = canvas.width - watermarkSize - 20
              y = 20
              break
            case "bottom-left":
              x = 20
              y = canvas.height - watermarkSize - 20
              break
            case "center":
              x = (canvas.width - watermarkSize) / 2
              y = (canvas.height - watermarkSize) / 2
              break
          }

          ctx.drawImage(watermarkImg, x, y, watermarkSize, watermarkSize)
          ctx.restore()
          resolve()
        } catch (error) {
          reject(error)
        }
      }

      watermarkImg.onerror = () => reject(new Error("Failed to load watermark image"))
      watermarkImg.crossOrigin = "anonymous"
      watermarkImg.src = URL.createObjectURL(watermarkFile)
    })
  }
}