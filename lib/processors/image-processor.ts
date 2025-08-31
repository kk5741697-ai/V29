// Optimized image processor with memory management and crash prevention
export interface ImageProcessingOptions {
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
  useImageWatermark?: boolean
  watermarkImageUrl?: string
  watermarkImage?: string
  flipDirection?: string
  customRotation?: number
  cropArea?: { x: number; y: number; width: number; height: number }
  cropMode?: "percentage" | "pixels"
}

export class ImageProcessor {
  private static readonly MAX_SAFE_PIXELS = 1024 * 1024 // 1MP max for stability
  private static readonly MAX_CANVAS_SIZE = 2048 // Max canvas dimension
  
  // Enhanced memory management
  private static activeCanvases = new Set<HTMLCanvasElement>()
  
  static async resizeImage(file: File, options: ImageProcessingOptions): Promise<Blob> {
    // Enhanced safety checks
    if (file.size > 10 * 1024 * 1024) {
      throw new Error("File too large. Please use an image smaller than 10MB.")
    }

    return this.processImageSafely(file, (canvas, ctx, img) => {
      this.activeCanvases.add(canvas)
      const targetWidth = options.width || img.naturalWidth
      const targetHeight = options.height || img.naturalHeight
      
      // Calculate safe dimensions
      const { safeWidth, safeHeight } = this.calculateSafeDimensions(
        targetWidth, 
        targetHeight, 
        options.maintainAspectRatio,
        img.naturalWidth / img.naturalHeight
      )
      
      canvas.width = safeWidth
      canvas.height = safeHeight
      
      // Apply background if not PNG
      if (options.backgroundColor && options.outputFormat !== "png") {
        ctx.fillStyle = options.backgroundColor
        ctx.fillRect(0, 0, safeWidth, safeHeight)
      }
      
      // High quality resize
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = "high"
      ctx.drawImage(img, 0, 0, safeWidth, safeHeight)
      
      this.activeCanvases.delete(canvas)
    }, options)
  }

  static async compressImage(file: File, options: ImageProcessingOptions): Promise<Blob> {
    // Enhanced safety checks
    if (file.size > 15 * 1024 * 1024) {
      throw new Error("File too large. Please use an image smaller than 15MB.")
    }

    return this.processImageSafely(file, (canvas, ctx, img) => {
      this.activeCanvases.add(canvas)
      // Calculate compression dimensions
      let { width, height } = this.getOptimalCompressionSize(
        img.naturalWidth, 
        img.naturalHeight, 
        options.compressionLevel || "medium"
      )
      
      canvas.width = width
      canvas.height = height
      
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = "medium" // Balance quality vs performance
      ctx.drawImage(img, 0, 0, width, height)
      
      this.activeCanvases.delete(canvas)
    }, options)
  }

  static async convertFormat(file: File, format: "jpeg" | "png" | "webp", options: ImageProcessingOptions = {}): Promise<Blob> {
    return this.processImageSafely(file, (canvas, ctx, img) => {
      this.activeCanvases.add(canvas)
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      
      // Add background for JPEG
      if (format === "jpeg") {
        ctx.fillStyle = options.backgroundColor || "#ffffff"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
      
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = "high"
      ctx.drawImage(img, 0, 0)
      
      this.activeCanvases.delete(canvas)
    }, { ...options, outputFormat: format })
  }

  static async cropImage(file: File, cropArea: any, options: ImageProcessingOptions): Promise<Blob> {
    return this.processImageSafely(file, (canvas, ctx, img) => {
      this.activeCanvases.add(canvas)
      const { x, y, width, height } = cropArea
      
      // Convert percentage to pixels
      const sourceX = (x / 100) * img.naturalWidth
      const sourceY = (y / 100) * img.naturalHeight
      const sourceWidth = (width / 100) * img.naturalWidth
      const sourceHeight = (height / 100) * img.naturalHeight
      
      // Ensure safe crop dimensions
      const { safeWidth, safeHeight } = this.calculateSafeDimensions(sourceWidth, sourceHeight)
      
      canvas.width = safeWidth
      canvas.height = safeHeight
      
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = "high"
      ctx.drawImage(
        img,
        sourceX, sourceY, sourceWidth, sourceHeight,
        0, 0, safeWidth, safeHeight
      )
      
      this.activeCanvases.delete(canvas)
    }, options)
  }

  static async rotateImage(file: File, options: ImageProcessingOptions): Promise<Blob> {
    return this.processImageSafely(file, (canvas, ctx, img) => {
      this.activeCanvases.add(canvas)
      const angle = (options.customRotation || 0) * Math.PI / 180
      
      // Calculate rotated dimensions
      const cos = Math.abs(Math.cos(angle))
      const sin = Math.abs(Math.sin(angle))
      const newWidth = img.naturalWidth * cos + img.naturalHeight * sin
      const newHeight = img.naturalWidth * sin + img.naturalHeight * cos
      
      const { safeWidth, safeHeight } = this.calculateSafeDimensions(newWidth, newHeight)
      
      canvas.width = safeWidth
      canvas.height = safeHeight
      
      // Apply rotation
      ctx.translate(safeWidth / 2, safeHeight / 2)
      ctx.rotate(angle)
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = "high"
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2)
      
      this.activeCanvases.delete(canvas)
    }, options)
  }

  static async applyFilters(file: File, options: ImageProcessingOptions): Promise<Blob> {
    return this.processImageSafely(file, (canvas, ctx, img) => {
      this.activeCanvases.add(canvas)
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      
      // Build filter string
      const filters = options.filters || {}
      const filterArray = []
      
      if (filters.brightness !== undefined && filters.brightness !== 100) {
        filterArray.push(`brightness(${Math.max(0, Math.min(300, filters.brightness))}%)`)
      }
      if (filters.contrast !== undefined && filters.contrast !== 100) {
        filterArray.push(`contrast(${Math.max(0, Math.min(300, filters.contrast))}%)`)
      }
      if (filters.saturation !== undefined && filters.saturation !== 100) {
        filterArray.push(`saturate(${Math.max(0, Math.min(300, filters.saturation))}%)`)
      }
      if (filters.blur !== undefined && filters.blur > 0) {
        filterArray.push(`blur(${Math.max(0, Math.min(50, filters.blur))}px)`)
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
      
      this.activeCanvases.delete(canvas)
    }, options)
  }

  static async addWatermark(file: File, watermarkText: string, options: ImageProcessingOptions): Promise<Blob> {
    return this.processImageSafely(file, (canvas, ctx, img) => {
      this.activeCanvases.add(canvas)
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = "high"
      ctx.drawImage(img, 0, 0)
      
      // Add watermark
      if (watermarkText && !options.useImageWatermark) {
        ctx.save()
        ctx.globalAlpha = options.watermarkOpacity || 0.5
        
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
        }
        
        ctx.fillText(watermarkText, x, y)
        ctx.restore()
      }
      
      this.activeCanvases.delete(canvas)
    }, options)
  }

  // Core safe processing function
  private static async processImageSafely(
    file: File,
    processor: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, img: HTMLImageElement) => void,
    options: ImageProcessingOptions
  ): Promise<Blob> {
    // Memory safety checks
    if (file.size > 10 * 1024 * 1024) { // 10MB limit for stability
      throw new Error("Image too large. Please use an image smaller than 10MB.")
    }

    // Check if too many canvases are active (prevent memory overload)
    if (this.activeCanvases.size > 2) {
      throw new Error("Too many images being processed. Please wait for current operations to complete.")
    }

    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d", { 
        alpha: true,
        willReadFrequently: false, // Better performance
        desynchronized: true
      })
      
      if (!ctx) {
        reject(new Error("Canvas not supported"))
        return
      }

      const img = new Image()
      img.onload = () => {
        try {
          // Additional safety check for image dimensions
          if (img.naturalWidth * img.naturalHeight > this.MAX_SAFE_PIXELS * 0.5) {
            // Very conservative scaling for large images
            const scale = Math.sqrt((this.MAX_SAFE_PIXELS * 0.5) / (img.naturalWidth * img.naturalHeight))
            const tempCanvas = document.createElement("canvas")
            const tempCtx = tempCanvas.getContext("2d")!
            
            tempCanvas.width = Math.floor(img.naturalWidth * scale)
            tempCanvas.height = Math.floor(img.naturalHeight * scale)
            
            tempCtx.imageSmoothingEnabled = true
            tempCtx.imageSmoothingQuality = "high"
            tempCtx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height)
            
            // Create new image from scaled canvas
            const scaledImg = new Image()
            scaledImg.onload = () => {
              processor(canvas, ctx, scaledImg)
              this.finalizeCanvas(canvas, options, resolve, reject)
            }
            scaledImg.src = tempCanvas.toDataURL()
            return
          }
          
          processor(canvas, ctx, img)
          this.finalizeCanvas(canvas, options, resolve, reject)
        } catch (error) {
          this.activeCanvases.delete(canvas)
          reject(error)
        }
      }

      img.onerror = () => reject(new Error("Failed to load image"))
      img.crossOrigin = "anonymous"
      img.src = URL.createObjectURL(file)
    })
  }

  private static calculateSafeDimensions(
    targetWidth: number, 
    targetHeight: number, 
    maintainAspectRatio = true,
    aspectRatio?: number
  ) {
    let safeWidth = Math.min(targetWidth, this.MAX_CANVAS_SIZE)
    let safeHeight = Math.min(targetHeight, this.MAX_CANVAS_SIZE)
    
    // Ensure we don't exceed pixel limit
    if (safeWidth * safeHeight > this.MAX_SAFE_PIXELS * 0.8) {
      const scale = Math.sqrt((this.MAX_SAFE_PIXELS * 0.8) / (safeWidth * safeHeight))
      safeWidth = Math.floor(safeWidth * scale)
      safeHeight = Math.floor(safeHeight * scale)
    }
    
    // Maintain aspect ratio if requested
    if (maintainAspectRatio && aspectRatio) {
      if (safeWidth / safeHeight > aspectRatio) {
        safeWidth = Math.floor(safeHeight * aspectRatio)
      } else {
        safeHeight = Math.floor(safeWidth / aspectRatio)
      }
    }
    
    return { safeWidth: Math.max(1, safeWidth), safeHeight: Math.max(1, safeHeight) }
  }

  private static getOptimalCompressionSize(
    originalWidth: number, 
    originalHeight: number, 
    level: string
  ) {
    let scale = 1
    
    switch (level) {
      case "low":
        scale = 0.95
        break
      case "medium":
        scale = 0.8
        break
      case "high":
        scale = 0.6
        break
      case "maximum":
        scale = 0.4
        break
    }
    
    const width = Math.floor(originalWidth * scale)
    const height = Math.floor(originalHeight * scale)
    
    return this.calculateSafeDimensions(width, height, true, originalWidth / originalHeight)
  }

  private static finalizeCanvas(
    canvas: HTMLCanvasElement,
    options: ImageProcessingOptions,
    resolve: (blob: Blob) => void,
    reject: (error: Error) => void
  ): void {
    try {
      const quality = Math.max(0.1, Math.min(1.0, (options.quality || 90) / 100))
      const mimeType = `image/${options.outputFormat || "png"}`
      
      canvas.toBlob(
        (blob) => {
          this.activeCanvases.delete(canvas)
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
      this.activeCanvases.delete(canvas)
      reject(new Error("Failed to finalize image"))
    }
  }

  // Memory cleanup utility
  static cleanupMemory(): void {
    // Clean up active canvases
    this.activeCanvases.forEach(canvas => {
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
      canvas.width = 1
      canvas.height = 1
    })
    this.activeCanvases.clear()
    
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
  
  // Prevent memory leaks during navigation
  static handlePageUnload(): void {
    this.cleanupMemory()
  }
}

// Auto-cleanup on page unload
if (typeof window !== "undefined") {
  window.addEventListener('beforeunload', () => {
    ImageProcessor.handlePageUnload()
  })
  
  // Periodic cleanup
  setInterval(() => {
    // More frequent cleanup
      ImageProcessor.cleanupMemory()
  }, 15000) // Every 15 seconds
  
  // Emergency cleanup on memory pressure
  if ('memory' in performance) {
    setInterval(() => {
      const memInfo = (performance as any).memory
      if (memInfo && memInfo.usedJSHeapSize > memInfo.jsHeapSizeLimit * 0.8) {
        console.warn('High memory usage detected, cleaning up...')
        ImageProcessor.cleanupMemory()
      }
    }, 5000)
  }
}