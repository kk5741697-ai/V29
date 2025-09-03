// Production-grade image processor with enterprise features
export interface ProductionImageOptions {
  // Core options
  width?: number
  height?: number
  quality?: number
  outputFormat?: "jpeg" | "png" | "webp" | "avif"
  maintainAspectRatio?: boolean
  backgroundColor?: string
  
  // Compression options
  compressionLevel?: "lossless" | "low" | "medium" | "high" | "maximum"
  progressive?: boolean
  optimizeForWeb?: boolean
  
  // Advanced processing
  resizeAlgorithm?: "lanczos" | "bicubic" | "bilinear" | "nearest"
  colorSpace?: "sRGB" | "P3" | "Rec2020"
  preserveMetadata?: boolean
  stripMetadata?: boolean
  
  // Filters and effects
  filters?: {
    brightness?: number // 0-200
    contrast?: number // 0-200
    saturation?: number // 0-200
    hue?: number // -180 to 180
    blur?: number // 0-50
    sharpen?: number // 0-100
    noise?: number // 0-100
    vignette?: number // 0-100
    sepia?: boolean
    grayscale?: boolean
    invert?: boolean
  }
  
  // Transformations
  rotation?: number // degrees
  flipHorizontal?: boolean
  flipVertical?: boolean
  
  // Cropping
  cropArea?: { x: number; y: number; width: number; height: number }
  cropMode?: "percentage" | "pixels"
  
  // Watermarking
  watermark?: {
    text?: string
    image?: File
    position?: "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right" | "diagonal"
    opacity?: number // 0-100
    fontSize?: number
    color?: string
    shadow?: boolean
    blend?: "normal" | "multiply" | "overlay" | "soft-light"
  }
  
  // Performance options
  memoryOptimized?: boolean
  chunkProcessing?: boolean
  maxDimensions?: { width: number; height: number }
  progressCallback?: (progress: number) => void
}

export class ProductionImageProcessor {
  private static readonly MAX_SAFE_PIXELS = 16 * 1024 * 1024 // 16MP
  private static readonly MAX_DIMENSION = 8192
  private static readonly CHUNK_SIZE = 1024 * 1024 // 1MP chunks

  static async processImage(file: File, options: ProductionImageOptions): Promise<Blob> {
    try {
      // Validate input
      if (!file.type.startsWith('image/')) {
        throw new Error("Invalid file type. Please upload an image file.")
      }

      if (file.size > 100 * 1024 * 1024) {
        throw new Error("File too large. Maximum 100MB allowed.")
      }

      options.progressCallback?.(10)

      // Load and validate image
      const { canvas, ctx, originalDimensions } = await this.loadImageSafely(file, options)
      
      options.progressCallback?.(30)

      // Apply transformations
      await this.applyTransformations(canvas, ctx, options)
      
      options.progressCallback?.(60)

      // Apply filters and effects
      await this.applyFiltersAndEffects(canvas, ctx, options)
      
      options.progressCallback?.(80)

      // Apply watermark if specified
      if (options.watermark) {
        await this.applyWatermark(canvas, ctx, options.watermark)
      }

      options.progressCallback?.(90)

      // Create optimized output
      const outputBlob = await this.createOptimizedOutput(canvas, options)
      
      options.progressCallback?.(100)

      // Cleanup
      this.cleanupCanvas(canvas)

      return outputBlob
    } catch (error) {
      console.error("Image processing failed:", error)
      throw new Error(error instanceof Error ? error.message : "Image processing failed")
    }
  }

  private static async loadImageSafely(
    file: File,
    options: ProductionImageOptions
  ): Promise<{ canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; originalDimensions: { width: number; height: number } }> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      
      img.onload = () => {
        try {
          const originalDimensions = { width: img.naturalWidth, height: img.naturalHeight }
          
          // Calculate safe processing dimensions
          let workingWidth = img.naturalWidth
          let workingHeight = img.naturalHeight
          
          // Apply max dimensions
          const maxDim = Math.min(options.maxDimensions?.width || this.MAX_DIMENSION, this.MAX_DIMENSION)
          if (workingWidth > maxDim || workingHeight > maxDim) {
            const scale = maxDim / Math.max(workingWidth, workingHeight)
            workingWidth = Math.floor(workingWidth * scale)
            workingHeight = Math.floor(workingHeight * scale)
          }
          
          // Check pixel count for memory safety
          if (workingWidth * workingHeight > this.MAX_SAFE_PIXELS) {
            const scale = Math.sqrt(this.MAX_SAFE_PIXELS / (workingWidth * workingHeight))
            workingWidth = Math.floor(workingWidth * scale)
            workingHeight = Math.floor(workingHeight * scale)
          }
          
          // Create canvas with optimal settings
          const canvas = document.createElement("canvas")
          const ctx = canvas.getContext("2d", {
            alpha: true,
            willReadFrequently: false,
            desynchronized: true
          })
          
          if (!ctx) {
            reject(new Error("Canvas not supported"))
            return
          }
          
          canvas.width = Math.max(1, workingWidth)
          canvas.height = Math.max(1, workingHeight)
          
          // High-quality initial draw
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = "high"
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          
          resolve({ canvas, ctx, originalDimensions })
        } catch (error) {
          reject(new Error("Failed to process image"))
        }
      }
      
      img.onerror = () => reject(new Error("Failed to load image"))
      img.crossOrigin = "anonymous"
      img.src = URL.createObjectURL(file)
    })
  }

  private static async applyTransformations(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    options: ProductionImageOptions
  ): Promise<void> {
    // Apply resize if needed
    if (options.width || options.height) {
      await this.resizeImage(canvas, ctx, options)
    }

    // Apply rotation
    if (options.rotation && options.rotation !== 0) {
      await this.rotateImage(canvas, ctx, options.rotation)
    }

    // Apply flipping
    if (options.flipHorizontal || options.flipVertical) {
      await this.flipImage(canvas, ctx, options.flipHorizontal, options.flipVertical)
    }

    // Apply cropping
    if (options.cropArea) {
      await this.cropImage(canvas, ctx, options.cropArea, options.cropMode)
    }
  }

  private static async resizeImage(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    options: ProductionImageOptions
  ): Promise<void> {
    const currentWidth = canvas.width
    const currentHeight = canvas.height
    
    let targetWidth = options.width || currentWidth
    let targetHeight = options.height || currentHeight

    // Maintain aspect ratio if requested
    if (options.maintainAspectRatio && options.width && options.height) {
      const aspectRatio = currentWidth / currentHeight
      if (targetWidth / targetHeight > aspectRatio) {
        targetWidth = targetHeight * aspectRatio
      } else {
        targetHeight = targetWidth / aspectRatio
      }
    }

    // Ensure minimum dimensions
    targetWidth = Math.max(1, Math.floor(targetWidth))
    targetHeight = Math.max(1, Math.floor(targetHeight))

    if (targetWidth === currentWidth && targetHeight === currentHeight) {
      return // No resize needed
    }

    // Create new canvas for resized image
    const newCanvas = document.createElement("canvas")
    const newCtx = newCanvas.getContext("2d")!
    newCanvas.width = targetWidth
    newCanvas.height = targetHeight

    // Add background if needed
    if (options.backgroundColor && options.outputFormat !== "png") {
      newCtx.fillStyle = options.backgroundColor
      newCtx.fillRect(0, 0, targetWidth, targetHeight)
    }

    // Apply resize algorithm
    const scale = Math.min(targetWidth / currentWidth, targetHeight / currentHeight)
    
    if (scale < 0.5) {
      // Multi-pass downscaling for better quality
      await this.multiPassResize(canvas, newCanvas, newCtx, targetWidth, targetHeight)
    } else {
      // Single pass resize
      newCtx.imageSmoothingEnabled = true
      newCtx.imageSmoothingQuality = "high"
      newCtx.drawImage(canvas, 0, 0, targetWidth, targetHeight)
    }

    // Replace original canvas content
    canvas.width = targetWidth
    canvas.height = targetHeight
    ctx.clearRect(0, 0, targetWidth, targetHeight)
    ctx.drawImage(newCanvas, 0, 0)
  }

  private static async multiPassResize(
    sourceCanvas: HTMLCanvasElement,
    targetCanvas: HTMLCanvasElement,
    targetCtx: CanvasRenderingContext2D,
    targetWidth: number,
    targetHeight: number
  ): Promise<void> {
    let currentCanvas = sourceCanvas
    let currentWidth = sourceCanvas.width
    let currentHeight = sourceCanvas.height
    
    // Resize in steps of 50% until we reach target
    while (currentWidth > targetWidth * 2 || currentHeight > targetHeight * 2) {
      const stepWidth = Math.floor(currentWidth * 0.5)
      const stepHeight = Math.floor(currentHeight * 0.5)
      
      const stepCanvas = document.createElement("canvas")
      const stepCtx = stepCanvas.getContext("2d")!
      stepCanvas.width = stepWidth
      stepCanvas.height = stepHeight
      
      stepCtx.imageSmoothingEnabled = true
      stepCtx.imageSmoothingQuality = "high"
      stepCtx.drawImage(currentCanvas, 0, 0, stepWidth, stepHeight)
      
      currentCanvas = stepCanvas
      currentWidth = stepWidth
      currentHeight = stepHeight
    }
    
    // Final resize to exact target
    targetCtx.imageSmoothingEnabled = true
    targetCtx.imageSmoothingQuality = "high"
    targetCtx.drawImage(currentCanvas, 0, 0, targetWidth, targetHeight)
  }

  private static async rotateImage(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    rotation: number
  ): Promise<void> {
    const angle = ((rotation % 360) * Math.PI) / 180
    const currentWidth = canvas.width
    const currentHeight = canvas.height

    // Calculate new dimensions
    const cos = Math.abs(Math.cos(angle))
    const sin = Math.abs(Math.sin(angle))
    const newWidth = Math.ceil(currentWidth * cos + currentHeight * sin)
    const newHeight = Math.ceil(currentWidth * sin + currentHeight * cos)

    // Create temporary canvas for rotation
    const tempCanvas = document.createElement("canvas")
    const tempCtx = tempCanvas.getContext("2d")!
    tempCanvas.width = newWidth
    tempCanvas.height = newHeight

    // Apply rotation
    tempCtx.translate(newWidth / 2, newHeight / 2)
    tempCtx.rotate(angle)
    tempCtx.imageSmoothingEnabled = true
    tempCtx.imageSmoothingQuality = "high"
    tempCtx.drawImage(canvas, -currentWidth / 2, -currentHeight / 2)

    // Update original canvas
    canvas.width = newWidth
    canvas.height = newHeight
    ctx.clearRect(0, 0, newWidth, newHeight)
    ctx.drawImage(tempCanvas, 0, 0)
  }

  private static async flipImage(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    flipHorizontal: boolean,
    flipVertical: boolean
  ): Promise<void> {
    if (!flipHorizontal && !flipVertical) return

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ctx.save()
    
    if (flipHorizontal) {
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
    }
    
    if (flipVertical) {
      ctx.translate(0, canvas.height)
      ctx.scale(1, -1)
    }

    ctx.putImageData(imageData, 0, 0)
    ctx.restore()
  }

  private static async cropImage(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    cropArea: { x: number; y: number; width: number; height: number },
    cropMode: "percentage" | "pixels" = "percentage"
  ): Promise<void> {
    let sourceX, sourceY, sourceWidth, sourceHeight

    if (cropMode === "pixels") {
      sourceX = Math.max(0, cropArea.x)
      sourceY = Math.max(0, cropArea.y)
      sourceWidth = Math.min(canvas.width - sourceX, cropArea.width)
      sourceHeight = Math.min(canvas.height - sourceY, cropArea.height)
    } else {
      // Percentage mode
      sourceX = Math.max(0, (cropArea.x / 100) * canvas.width)
      sourceY = Math.max(0, (cropArea.y / 100) * canvas.height)
      sourceWidth = Math.min(canvas.width - sourceX, (cropArea.width / 100) * canvas.width)
      sourceHeight = Math.min(canvas.height - sourceY, (cropArea.height / 100) * canvas.height)
    }

    // Ensure minimum crop size
    sourceWidth = Math.max(1, Math.floor(sourceWidth))
    sourceHeight = Math.max(1, Math.floor(sourceHeight))

    // Get cropped image data
    const croppedImageData = ctx.getImageData(sourceX, sourceY, sourceWidth, sourceHeight)

    // Update canvas size and draw cropped image
    canvas.width = sourceWidth
    canvas.height = sourceHeight
    ctx.clearRect(0, 0, sourceWidth, sourceHeight)
    ctx.putImageData(croppedImageData, 0, 0)
  }

  private static async applyFiltersAndEffects(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    options: ProductionImageOptions
  ): Promise<void> {
    if (!options.filters) return

    const filters = options.filters
    const filterArray = []

    // Build CSS filter string with proper bounds
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
    if (filters.hue !== undefined && filters.hue !== 0) {
      const hue = Math.max(-180, Math.min(180, filters.hue))
      filterArray.push(`hue-rotate(${hue}deg)`)
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
    if (filters.invert) {
      filterArray.push("invert(100%)")
    }

    // Apply CSS filters
    if (filterArray.length > 0) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const tempCanvas = document.createElement("canvas")
      const tempCtx = tempCanvas.getContext("2d")!
      tempCanvas.width = canvas.width
      tempCanvas.height = canvas.height
      
      tempCtx.filter = filterArray.join(" ")
      tempCtx.putImageData(imageData, 0, 0)
      
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(tempCanvas, 0, 0)
    }

    // Apply custom effects
    if (filters.sharpen && filters.sharpen > 0) {
      await this.applySharpen(canvas, ctx, filters.sharpen)
    }

    if (filters.noise && filters.noise > 0) {
      await this.applyNoise(canvas, ctx, filters.noise)
    }

    if (filters.vignette && filters.vignette > 0) {
      await this.applyVignette(canvas, ctx, filters.vignette)
    }
  }

  private static async applySharpen(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    intensity: number
  ): Promise<void> {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    const width = canvas.width
    const height = canvas.height
    
    // Unsharp mask algorithm
    const output = new Uint8ClampedArray(data)
    const amount = Math.max(0, Math.min(100, intensity)) / 100
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4
        
        for (let c = 0; c < 3; c++) {
          let sum = 0
          let center = data[idx + c] * 9
          
          // 3x3 convolution kernel
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const kidx = ((y + ky) * width + (x + kx)) * 4 + c
              sum += data[kidx]
            }
          }
          
          const highPass = center - sum
          const sharpened = data[idx + c] + highPass * amount * 0.2
          output[idx + c] = Math.max(0, Math.min(255, sharpened))
        }
      }
    }
    
    ctx.putImageData(new ImageData(output, width, height), 0, 0)
  }

  private static async applyNoise(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    intensity: number
  ): Promise<void> {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    const factor = Math.max(0, Math.min(100, intensity)) / 100
    
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 255 * factor * 0.1
      data[i] = Math.max(0, Math.min(255, data[i] + noise))     // R
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise)) // G
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise)) // B
    }
    
    ctx.putImageData(imageData, 0, 0)
  }

  private static async applyVignette(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    intensity: number
  ): Promise<void> {
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY)
    
    const gradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, maxDistance
    )
    
    const alpha = Math.max(0, Math.min(100, intensity)) / 100
    gradient.addColorStop(0, `rgba(0, 0, 0, 0)`)
    gradient.addColorStop(0.7, `rgba(0, 0, 0, ${alpha * 0.3})`)
    gradient.addColorStop(1, `rgba(0, 0, 0, ${alpha})`)
    
    ctx.save()
    ctx.globalCompositeOperation = "multiply"
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.restore()
  }

  private static async applyWatermark(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    watermark: NonNullable<ProductionImageOptions["watermark"]>
  ): Promise<void> {
    ctx.save()
    ctx.globalAlpha = Math.max(0.1, Math.min(1.0, (watermark.opacity || 50) / 100))

    if (watermark.text) {
      // Text watermark
      const fontSize = watermark.fontSize || Math.min(canvas.width, canvas.height) * 0.05
      ctx.font = `bold ${fontSize}px Arial`
      ctx.fillStyle = watermark.color || "#ffffff"
      
      if (watermark.shadow) {
        ctx.shadowColor = "rgba(0, 0, 0, 0.8)"
        ctx.shadowBlur = 4
        ctx.shadowOffsetX = 2
        ctx.shadowOffsetY = 2
      }

      let x: number, y: number
      
      switch (watermark.position) {
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
          ctx.textAlign = "center"
          break
        default: // center
          x = canvas.width / 2
          y = canvas.height / 2
          ctx.textAlign = "center"
          break
      }

      ctx.textBaseline = "middle"
      ctx.fillText(watermark.text, x, y)
    }

    if (watermark.image) {
      // Image watermark
      await this.addImageWatermark(ctx, canvas, watermark.image, watermark)
    }

    ctx.restore()
  }

  private static async addImageWatermark(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    watermarkFile: File,
    watermark: NonNullable<ProductionImageOptions["watermark"]>
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const watermarkImg = new Image()
      
      watermarkImg.onload = () => {
        try {
          const watermarkSize = Math.min(canvas.width, canvas.height) * 0.2
          let x = canvas.width - watermarkSize - 20
          let y = canvas.height - watermarkSize - 20

          switch (watermark.position) {
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

          // Apply blend mode if specified
          if (watermark.blend && watermark.blend !== "normal") {
            ctx.globalCompositeOperation = watermark.blend
          }

          ctx.drawImage(watermarkImg, x, y, watermarkSize, watermarkSize)
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

  private static async createOptimizedOutput(
    canvas: HTMLCanvasElement,
    options: ProductionImageOptions
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      let quality = (options.quality || 90) / 100
      
      // Apply compression level adjustments
      if (options.compressionLevel) {
        switch (options.compressionLevel) {
          case "lossless":
            quality = 1.0
            break
          case "low":
            quality *= 0.95
            break
          case "medium":
            quality *= 0.8
            break
          case "high":
            quality *= 0.6
            break
          case "maximum":
            quality *= 0.4
            break
        }
      }

      quality = Math.max(0.1, Math.min(1.0, quality))
      
      // Determine optimal output format
      let outputFormat = options.outputFormat || "png"
      
      // Auto-select format for web optimization
      if (options.optimizeForWeb) {
        if (canvas.width * canvas.height > 1024 * 1024) {
          outputFormat = "webp" // Better compression for large images
        } else if (options.compressionLevel === "maximum") {
          outputFormat = "jpeg" // Maximum compression
        }
      }

      const mimeType = `image/${outputFormat}`

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error("Failed to create optimized output"))
          }
        },
        mimeType,
        quality
      )
    })
  }

  private static cleanupCanvas(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
    canvas.width = 1
    canvas.height = 1
  }

  // Batch processing for multiple images
  static async batchProcess(
    files: File[],
    options: ProductionImageOptions,
    onProgress?: (current: number, total: number) => void
  ): Promise<Blob[]> {
    const results: Blob[] = []
    
    for (let i = 0; i < files.length; i++) {
      try {
        const processed = await this.processImage(files[i], {
          ...options,
          progressCallback: undefined // Disable individual progress for batch
        })
        results.push(processed)
        
        onProgress?.(i + 1, files.length)
      } catch (error) {
        console.error(`Failed to process ${files[i].name}:`, error)
        // Continue with other files
      }
    }
    
    return results
  }

  // Memory cleanup utility
  static cleanupMemory(): void {
    // Force garbage collection if available
    if ('gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc()
    }
    
    // Clean up blob URLs
    const images = document.querySelectorAll('img[src^="blob:"]')
    images.forEach(img => {
      if (img instanceof HTMLImageElement) {
        URL.revokeObjectURL(img.src)
      }
    })
  }
}