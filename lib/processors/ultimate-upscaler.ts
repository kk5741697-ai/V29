// Ultimate Image Upscaler - Production-ready with crash prevention
export interface UltimateUpscaleOptions {
  scaleFactor?: number
  maxOutputDimension?: number
  primaryAlgorithm?: "auto" | "lanczos" | "bicubic" | "esrgan" | "real-esrgan" | "waifu2x" | "srcnn" | "edsr"
  secondaryAlgorithm?: "lanczos" | "bicubic" | "mitchell" | "catmull-rom"
  hybridMode?: boolean
  enableContentAnalysis?: boolean
  contentType?: "auto" | "photo" | "art" | "text" | "mixed"
  enhanceDetails?: boolean
  reduceNoise?: boolean
  sharpenAmount?: number
  colorEnhancement?: boolean
  contrastBoost?: number
  multiPass?: boolean
  memoryOptimized?: boolean
  chunkProcessing?: boolean
  outputFormat?: "png" | "jpeg" | "webp"
  quality?: number
  progressCallback?: (progress: number, stage: string) => void
  debugMode?: boolean
}

export interface UpscaleResult {
  processedBlob: Blob
  actualScaleFactor: number
  finalDimensions: { width: number; height: number }
  algorithmsUsed: string[]
  processingTime: number
  qualityMetrics: {
    sharpness: number
    noise: number
    artifacts: number
  }
}

export class UltimateImageUpscaler {
  private static readonly MAX_SAFE_PIXELS = 1024 * 1024 // 1MP for stability
  private static readonly MAX_OUTPUT_PIXELS = 1536 * 1536 // 2.3MP max output
  private static readonly MAX_FILE_SIZE = 25 * 1024 * 1024 // 25MB limit
  
  static async upscaleImage(
    imageFile: File,
    options: UltimateUpscaleOptions = {}
  ): Promise<UpscaleResult> {
    const startTime = Date.now()
    
    try {
      // Enhanced safety checks
      if (imageFile.size > this.MAX_FILE_SIZE) {
        throw new Error(`File too large (${Math.round(imageFile.size / (1024 * 1024))}MB). Maximum 25MB allowed.`)
      }

      if (!imageFile.type.startsWith('image/')) {
        throw new Error("Invalid file type. Please upload an image file.")
      }

      options.progressCallback?.(5, "Loading image")
      
      // Load image with safety checks
      const { canvas, ctx, originalDimensions } = await this.loadImageSafely(imageFile, options)
      
      options.progressCallback?.(15, "Analyzing image content")
      
      // Analyze image for optimal processing
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const analysis = this.analyzeImageForUpscaling(imageData)
      
      options.progressCallback?.(25, "Calculating optimal scale")
      
      // Calculate safe scale factor
      const { actualScaleFactor, targetDimensions } = this.calculateSafeScale(
        canvas.width,
        canvas.height,
        options.scaleFactor || 2,
        options.maxOutputDimension
      )
      
      if (actualScaleFactor < 1.1) {
        throw new Error("Scale factor too small or image too large for upscaling")
      }
      
      options.progressCallback?.(35, "Running upscaling algorithm")
      
      // Apply upscaling
      const upscaledCanvas = await this.applyUpscaling(canvas, actualScaleFactor, analysis, options)
      
      options.progressCallback?.(70, "Applying enhancements")
      
      // Apply enhancements
      await this.applyEnhancements(upscaledCanvas, analysis, options)
      
      options.progressCallback?.(90, "Creating output")
      
      // Create final blob
      const processedBlob = await this.createOutputBlob(upscaledCanvas, options)
      
      options.progressCallback?.(100, "Complete")
      
      // Calculate quality metrics
      const qualityMetrics = this.calculateQualityMetrics(upscaledCanvas)
      
      // Cleanup memory
      this.cleanupMemory([canvas, upscaledCanvas])
      
      return {
        processedBlob,
        actualScaleFactor,
        finalDimensions: targetDimensions,
        algorithmsUsed: [options.primaryAlgorithm || "auto"],
        processingTime: Date.now() - startTime,
        qualityMetrics
      }
    } catch (error) {
      options.progressCallback?.(0, "Error occurred")
      console.error("Image upscaling failed:", error)
      throw new Error(error instanceof Error ? error.message : "Image upscaling failed")
    }
  }

  private static async loadImageSafely(
    file: File,
    options: UltimateUpscaleOptions
  ): Promise<{ canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; originalDimensions: { width: number; height: number } }> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      
      img.onload = () => {
        try {
          const originalDimensions = { width: img.naturalWidth, height: img.naturalHeight }
          
          // Calculate safe processing dimensions
          let workingWidth = img.naturalWidth
          let workingHeight = img.naturalHeight
          
          // Pre-scale if image is too large
          if (workingWidth * workingHeight > this.MAX_SAFE_PIXELS) {
            const scale = Math.sqrt(this.MAX_SAFE_PIXELS / (workingWidth * workingHeight))
            workingWidth = Math.floor(workingWidth * scale)
            workingHeight = Math.floor(workingHeight * scale)
          }
          
          // Apply max dimensions
          const maxDim = Math.min(options.maxOutputDimension || 1024, 1024)
          if (workingWidth > maxDim || workingHeight > maxDim) {
            const scale = maxDim / Math.max(workingWidth, workingHeight)
            workingWidth = Math.floor(workingWidth * scale)
            workingHeight = Math.floor(workingHeight * scale)
          }
          
          // Create canvas
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

  private static calculateSafeScale(
    currentWidth: number,
    currentHeight: number,
    requestedScale: number,
    maxOutputDimension?: number
  ): { actualScaleFactor: number; targetDimensions: { width: number; height: number } } {
    let actualScaleFactor = Math.min(requestedScale, 3) // Max 3x scale for safety
    
    // Calculate target dimensions
    let targetWidth = Math.floor(currentWidth * actualScaleFactor)
    let targetHeight = Math.floor(currentHeight * actualScaleFactor)
    
    // Apply max output dimension limit
    const maxDim = Math.min(maxOutputDimension || 1536, 1536)
    if (targetWidth > maxDim || targetHeight > maxDim) {
      const scale = Math.min(maxDim / targetWidth, maxDim / targetHeight)
      actualScaleFactor *= scale
      targetWidth = Math.floor(currentWidth * actualScaleFactor)
      targetHeight = Math.floor(currentHeight * actualScaleFactor)
    }
    
    // Check output pixel limit
    if (targetWidth * targetHeight > this.MAX_OUTPUT_PIXELS) {
      const scale = Math.sqrt(this.MAX_OUTPUT_PIXELS / (targetWidth * targetHeight))
      actualScaleFactor *= scale
      targetWidth = Math.floor(currentWidth * actualScaleFactor)
      targetHeight = Math.floor(currentHeight * actualScaleFactor)
    }
    
    return {
      actualScaleFactor,
      targetDimensions: { width: targetWidth, height: targetHeight }
    }
  }

  private static analyzeImageForUpscaling(imageData: ImageData): {
    contentType: "photo" | "art" | "text" | "mixed"
    hasSharpEdges: boolean
    noiseLevel: number
    colorComplexity: number
    isPixelArt: boolean
    compressionArtifacts: number
  } {
    const { data, width, height } = imageData
    
    let edgeCount = 0
    let highFreqCount = 0
    let noiseCount = 0
    let totalSamples = 0
    
    const uniqueColors = new Set<string>()
    
    // Sample every 4th pixel for performance
    for (let y = 1; y < height - 1; y += 4) {
      for (let x = 1; x < width - 1; x += 4) {
        const idx = (y * width + x) * 4
        const r = data[idx]
        const g = data[idx + 1]
        const b = data[idx + 2]
        
        totalSamples++
        
        // Track unique colors
        const colorKey = `${Math.floor(r/16)}-${Math.floor(g/16)}-${Math.floor(b/16)}`
        uniqueColors.add(colorKey)
        
        // Calculate gradient
        let maxGradient = 0
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue
            
            const nIdx = ((y + dy) * width + (x + dx)) * 4
            const gradient = Math.abs(data[idx] - data[nIdx]) +
                           Math.abs(data[idx + 1] - data[nIdx + 1]) +
                           Math.abs(data[idx + 2] - data[nIdx + 2])
            maxGradient = Math.max(maxGradient, gradient)
          }
        }
        
        if (maxGradient > 40) edgeCount++
        if (maxGradient > 120) highFreqCount++
        
        // Check for noise
        if (this.isNoisePixel(data, x, y, width, height)) {
          noiseCount++
        }
      }
    }
    
    const colorComplexity = uniqueColors.size / totalSamples
    const edgeRatio = edgeCount / totalSamples
    const noiseLevel = noiseCount / totalSamples
    
    // Determine content type
    let contentType: "photo" | "art" | "text" | "mixed" = "mixed"
    
    if (highFreqCount / totalSamples > 0.15) {
      contentType = "text"
    } else if (colorComplexity < 0.05 && edgeRatio > 0.3) {
      contentType = "art"
    } else if (noiseLevel < 0.1) {
      contentType = "photo"
    }
    
    return {
      contentType,
      hasSharpEdges: edgeRatio > 0.2,
      noiseLevel,
      colorComplexity,
      isPixelArt: colorComplexity < 0.03 && edgeRatio > 0.4,
      compressionArtifacts: this.detectCompressionArtifacts(data, width, height)
    }
  }

  private static isNoisePixel(
    data: Uint8ClampedArray,
    x: number,
    y: number,
    width: number,
    height: number
  ): boolean {
    if (x < 1 || x >= width - 1 || y < 1 || y >= height - 1) return false
    
    const centerIdx = (y * width + x) * 4
    const centerBrightness = (data[centerIdx] + data[centerIdx + 1] + data[centerIdx + 2]) / 3
    
    let neighborSum = 0
    let neighborCount = 0
    
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue
        
        const nIdx = ((y + dy) * width + (x + dx)) * 4
        const neighborBrightness = (data[nIdx] + data[nIdx + 1] + data[nIdx + 2]) / 3
        neighborSum += neighborBrightness
        neighborCount++
      }
    }
    
    const avgNeighbor = neighborSum / neighborCount
    const deviation = Math.abs(centerBrightness - avgNeighbor)
    
    return deviation > 25
  }

  private static detectCompressionArtifacts(data: Uint8ClampedArray, width: number, height: number): number {
    let artifactCount = 0
    let totalBlocks = 0
    
    // Check for 8x8 block patterns
    for (let y = 0; y < height - 8; y += 8) {
      for (let x = 0; x < width - 8; x += 8) {
        totalBlocks++
        
        let blockVariance = 0
        let blockMean = 0
        
        // Calculate block statistics
        for (let by = 0; by < 8; by++) {
          for (let bx = 0; bx < 8; bx++) {
            const idx = ((y + by) * width + (x + bx)) * 4
            const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3
            blockMean += brightness
          }
        }
        blockMean /= 64
        
        for (let by = 0; by < 8; by++) {
          for (let bx = 0; bx < 8; bx++) {
            const idx = ((y + by) * width + (x + bx)) * 4
            const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3
            blockVariance += Math.pow(brightness - blockMean, 2)
          }
        }
        blockVariance /= 64
        
        // Low variance indicates compression artifacts
        if (blockVariance < 50) {
          artifactCount++
        }
      }
    }
    
    return artifactCount / totalBlocks
  }

  private static async applyUpscaling(
    sourceCanvas: HTMLCanvasElement,
    scaleFactor: number,
    analysis: any,
    options: UltimateUpscaleOptions
  ): Promise<HTMLCanvasElement> {
    const algorithm = options.primaryAlgorithm || "auto"
    
    if (algorithm === "auto") {
      return this.autoSelectUpscaling(sourceCanvas, scaleFactor, analysis, options)
    }
    
    switch (algorithm) {
      case "lanczos":
        return this.lanczosUpscaling(sourceCanvas, scaleFactor, options)
      case "bicubic":
        return this.bicubicUpscaling(sourceCanvas, scaleFactor, options)
      case "esrgan":
        return this.esrganStyleUpscaling(sourceCanvas, scaleFactor, options)
      case "waifu2x":
        return this.waifu2xStyleUpscaling(sourceCanvas, scaleFactor, options)
      case "srcnn":
        return this.srcnnStyleUpscaling(sourceCanvas, scaleFactor, options)
      default:
        return this.lanczosUpscaling(sourceCanvas, scaleFactor, options)
    }
  }

  private static async autoSelectUpscaling(
    sourceCanvas: HTMLCanvasElement,
    scaleFactor: number,
    analysis: any,
    options: UltimateUpscaleOptions
  ): Promise<HTMLCanvasElement> {
    // Intelligent algorithm selection
    if (analysis.isPixelArt || analysis.contentType === "art") {
      return this.waifu2xStyleUpscaling(sourceCanvas, scaleFactor, options)
    } else if (analysis.contentType === "photo" && analysis.compressionArtifacts > 0.1) {
      return this.esrganStyleUpscaling(sourceCanvas, scaleFactor, options)
    } else if (analysis.contentType === "text" || analysis.hasSharpEdges) {
      return this.lanczosUpscaling(sourceCanvas, scaleFactor, options)
    } else {
      return this.bicubicUpscaling(sourceCanvas, scaleFactor, options)
    }
  }

  private static async lanczosUpscaling(
    sourceCanvas: HTMLCanvasElement,
    scaleFactor: number,
    options: UltimateUpscaleOptions
  ): Promise<HTMLCanvasElement> {
    const targetWidth = Math.floor(sourceCanvas.width * scaleFactor)
    const targetHeight = Math.floor(sourceCanvas.height * scaleFactor)
    
    const resultCanvas = document.createElement("canvas")
    const resultCtx = resultCanvas.getContext("2d")!
    resultCanvas.width = targetWidth
    resultCanvas.height = targetHeight
    
    // Use high-quality browser scaling as base
    resultCtx.imageSmoothingEnabled = true
    resultCtx.imageSmoothingQuality = "high"
    resultCtx.drawImage(sourceCanvas, 0, 0, targetWidth, targetHeight)
    
    // Apply sharpening to compensate for smoothing
    const imageData = resultCtx.getImageData(0, 0, targetWidth, targetHeight)
    this.applySharpen(imageData.data, targetWidth, targetHeight, 20)
    resultCtx.putImageData(imageData, 0, 0)
    
    return resultCanvas
  }

  private static async bicubicUpscaling(
    sourceCanvas: HTMLCanvasElement,
    scaleFactor: number,
    options: UltimateUpscaleOptions
  ): Promise<HTMLCanvasElement> {
    const targetWidth = Math.floor(sourceCanvas.width * scaleFactor)
    const targetHeight = Math.floor(sourceCanvas.height * scaleFactor)
    
    const resultCanvas = document.createElement("canvas")
    const resultCtx = resultCanvas.getContext("2d")!
    resultCanvas.width = targetWidth
    resultCanvas.height = targetHeight
    
    // Multi-pass scaling for better quality
    if (scaleFactor > 2) {
      const intermediateScale = Math.sqrt(scaleFactor)
      const intermediateCanvas = document.createElement("canvas")
      const intermediateCtx = intermediateCanvas.getContext("2d")!
      
      intermediateCanvas.width = Math.floor(sourceCanvas.width * intermediateScale)
      intermediateCanvas.height = Math.floor(sourceCanvas.height * intermediateScale)
      
      intermediateCtx.imageSmoothingEnabled = true
      intermediateCtx.imageSmoothingQuality = "high"
      intermediateCtx.drawImage(sourceCanvas, 0, 0, intermediateCanvas.width, intermediateCanvas.height)
      
      resultCtx.imageSmoothingEnabled = true
      resultCtx.imageSmoothingQuality = "high"
      resultCtx.drawImage(intermediateCanvas, 0, 0, targetWidth, targetHeight)
    } else {
      resultCtx.imageSmoothingEnabled = true
      resultCtx.imageSmoothingQuality = "high"
      resultCtx.drawImage(sourceCanvas, 0, 0, targetWidth, targetHeight)
    }
    
    return resultCanvas
  }

  private static async esrganStyleUpscaling(
    sourceCanvas: HTMLCanvasElement,
    scaleFactor: number,
    options: UltimateUpscaleOptions
  ): Promise<HTMLCanvasElement> {
    // ESRGAN-style upscaling for photos
    const result = await this.bicubicUpscaling(sourceCanvas, scaleFactor, options)
    
    // Apply photographic enhancements
    const ctx = result.getContext("2d")!
    const imageData = ctx.getImageData(0, 0, result.width, result.height)
    
    // Enhance details
    this.enhancePhotographicDetails(imageData.data, result.width, result.height)
    
    // Reduce compression artifacts
    this.reduceCompressionArtifacts(imageData.data, result.width, result.height)
    
    ctx.putImageData(imageData, 0, 0)
    
    return result
  }

  private static async waifu2xStyleUpscaling(
    sourceCanvas: HTMLCanvasElement,
    scaleFactor: number,
    options: UltimateUpscaleOptions
  ): Promise<HTMLCanvasElement> {
    // Waifu2x-style upscaling for anime/art
    const targetWidth = Math.floor(sourceCanvas.width * scaleFactor)
    const targetHeight = Math.floor(sourceCanvas.height * scaleFactor)
    
    const resultCanvas = document.createElement("canvas")
    const resultCtx = resultCanvas.getContext("2d")!
    resultCanvas.width = targetWidth
    resultCanvas.height = targetHeight
    
    // Use nearest neighbor for sharp edges
    resultCtx.imageSmoothingEnabled = false
    resultCtx.drawImage(sourceCanvas, 0, 0, targetWidth, targetHeight)
    
    // Apply selective smoothing
    const imageData = resultCtx.getImageData(0, 0, targetWidth, targetHeight)
    this.applySelectiveSmoothing(imageData.data, targetWidth, targetHeight)
    resultCtx.putImageData(imageData, 0, 0)
    
    return resultCanvas
  }

  private static async srcnnStyleUpscaling(
    sourceCanvas: HTMLCanvasElement,
    scaleFactor: number,
    options: UltimateUpscaleOptions
  ): Promise<HTMLCanvasElement> {
    // SRCNN-style super-resolution
    const result = await this.bicubicUpscaling(sourceCanvas, scaleFactor, options)
    
    // Apply detail enhancement
    const ctx = result.getContext("2d")!
    const imageData = ctx.getImageData(0, 0, result.width, result.height)
    
    this.enhanceDetails(imageData.data, result.width, result.height)
    this.reduceNoise(imageData.data, result.width, result.height)
    
    ctx.putImageData(imageData, 0, 0)
    
    return result
  }

  private static async applyEnhancements(
    canvas: HTMLCanvasElement,
    analysis: any,
    options: UltimateUpscaleOptions
  ): Promise<void> {
    const ctx = canvas.getContext("2d")!
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    
    if (options.enhanceDetails) {
      this.enhanceDetails(data, canvas.width, canvas.height)
    }
    
    if (options.reduceNoise) {
      this.reduceNoise(data, canvas.width, canvas.height)
    }
    
    if (options.sharpenAmount && options.sharpenAmount > 0) {
      this.applySharpen(data, canvas.width, canvas.height, options.sharpenAmount)
    }
    
    if (options.colorEnhancement) {
      this.enhanceColors(data, canvas.width, canvas.height)
    }
    
    ctx.putImageData(imageData, 0, 0)
  }

  private static enhanceDetails(data: Uint8ClampedArray, width: number, height: number): void {
    const enhanced = new Uint8ClampedArray(data)
    
    for (let y = 2; y < height - 2; y++) {
      for (let x = 2; x < width - 2; x++) {
        const idx = (y * width + x) * 4
        
        for (let c = 0; c < 3; c++) {
          let sum = 0
          let center = data[idx + c] * 25
          
          // 5x5 neighborhood
          for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -2; dx <= 2; dx++) {
              const nIdx = ((y + dy) * width + (x + dx)) * 4 + c
              sum += data[nIdx]
            }
          }
          
          const highPass = center - sum
          const enhancement = highPass * 0.1
          enhanced[idx + c] = Math.max(0, Math.min(255, data[idx + c] + enhancement))
        }
      }
    }
    
    // Blend enhanced version
    for (let i = 0; i < data.length; i += 4) {
      for (let c = 0; c < 3; c++) {
        data[i + c] = Math.round(data[i + c] * 0.8 + enhanced[i + c] * 0.2)
      }
    }
  }

  private static enhancePhotographicDetails(data: Uint8ClampedArray, width: number, height: number): void {
    const enhanced = new Uint8ClampedArray(data)
    
    // Local contrast enhancement
    for (let y = 3; y < height - 3; y++) {
      for (let x = 3; x < width - 3; x++) {
        const idx = (y * width + x) * 4
        
        for (let c = 0; c < 3; c++) {
          let localSum = 0
          let localCount = 0
          
          // 7x7 neighborhood
          for (let dy = -3; dy <= 3; dy++) {
            for (let dx = -3; dx <= 3; dx++) {
              const nIdx = ((y + dy) * width + (x + dx)) * 4 + c
              localSum += data[nIdx]
              localCount++
            }
          }
          
          const localAvg = localSum / localCount
          const centerValue = data[idx + c]
          
          const contrast = (centerValue - localAvg) * 0.2
          enhanced[idx + c] = Math.max(0, Math.min(255, centerValue + contrast))
        }
      }
    }
    
    // Blend enhanced version
    for (let i = 0; i < data.length; i += 4) {
      for (let c = 0; c < 3; c++) {
        data[i + c] = Math.round(data[i + c] * 0.75 + enhanced[i + c] * 0.25)
      }
    }
  }

  private static reduceCompressionArtifacts(data: Uint8ClampedArray, width: number, height: number): void {
    const filtered = new Uint8ClampedArray(data)
    
    // Apply bilateral filtering to reduce artifacts
    for (let y = 2; y < height - 2; y++) {
      for (let x = 2; x < width - 2; x++) {
        const centerIdx = (y * width + x) * 4
        
        for (let c = 0; c < 3; c++) {
          let weightSum = 0
          let valueSum = 0
          const centerValue = data[centerIdx + c]
          
          for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -2; dx <= 2; dx++) {
              const nIdx = ((y + dy) * width + (x + dx)) * 4 + c
              const neighborValue = data[nIdx]
              
              const spatialWeight = Math.exp(-(dx * dx + dy * dy) / 8)
              const colorWeight = Math.exp(-Math.pow(centerValue - neighborValue, 2) / 800)
              const weight = spatialWeight * colorWeight
              
              weightSum += weight
              valueSum += neighborValue * weight
            }
          }
          
          filtered[centerIdx + c] = Math.round(valueSum / weightSum)
        }
      }
    }
    
    // Blend filtered version
    for (let i = 0; i < data.length; i += 4) {
      for (let c = 0; c < 3; c++) {
        data[i + c] = Math.round(data[i + c] * 0.7 + filtered[i + c] * 0.3)
      }
    }
  }

  private static applySelectiveSmoothing(data: Uint8ClampedArray, width: number, height: number): void {
    const smoothed = new Uint8ClampedArray(data)
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const centerIdx = (y * width + x) * 4
        
        // Calculate edge strength
        let edgeStrength = 0
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue
            
            const nIdx = ((y + dy) * width + (x + dx)) * 4
            const gradient = Math.abs(data[centerIdx] - data[nIdx]) +
                           Math.abs(data[centerIdx + 1] - data[nIdx + 1]) +
                           Math.abs(data[centerIdx + 2] - data[nIdx + 2])
            edgeStrength = Math.max(edgeStrength, gradient)
          }
        }
        
        // Apply smoothing only to non-edge areas
        if (edgeStrength < 40) {
          for (let c = 0; c < 3; c++) {
            let sum = 0
            let count = 0
            
            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                const nIdx = ((y + dy) * width + (x + dx)) * 4 + c
                sum += data[nIdx]
                count++
              }
            }
            
            smoothed[centerIdx + c] = Math.round(sum / count)
          }
        }
      }
    }
    
    // Apply smoothed version
    for (let i = 0; i < data.length; i += 4) {
      for (let c = 0; c < 3; c++) {
        data[i + c] = smoothed[i + c]
      }
    }
  }

  private static reduceNoise(data: Uint8ClampedArray, width: number, height: number): void {
    const filtered = new Uint8ClampedArray(data)
    
    // Simple noise reduction
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const centerIdx = (y * width + x) * 4
        
        for (let c = 0; c < 3; c++) {
          let sum = 0
          let count = 0
          
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const nIdx = ((y + dy) * width + (x + dx)) * 4 + c
              sum += data[nIdx]
              count++
            }
          }
          
          const avg = sum / count
          const centerValue = data[centerIdx + c]
          
          // Reduce noise while preserving edges
          if (Math.abs(centerValue - avg) < 30) {
            filtered[centerIdx + c] = Math.round(avg)
          } else {
            filtered[centerIdx + c] = centerValue
          }
        }
      }
    }
    
    // Apply filtered version
    for (let i = 0; i < data.length; i += 4) {
      for (let c = 0; c < 3; c++) {
        data[i + c] = filtered[i + c]
      }
    }
  }

  private static applySharpen(data: Uint8ClampedArray, width: number, height: number, amount: number): void {
    const sharpened = new Uint8ClampedArray(data)
    const factor = amount / 100
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const centerIdx = (y * width + x) * 4
        
        for (let c = 0; c < 3; c++) {
          let sum = 0
          let center = data[centerIdx + c] * 9
          
          // 3x3 neighborhood
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const nIdx = ((y + dy) * width + (x + dx)) * 4 + c
              sum += data[nIdx]
            }
          }
          
          const highPass = center - sum
          const enhancement = highPass * factor * 0.15
          sharpened[centerIdx + c] = Math.max(0, Math.min(255, data[centerIdx + c] + enhancement))
        }
      }
    }
    
    // Apply sharpened version
    for (let i = 0; i < data.length; i += 4) {
      for (let c = 0; c < 3; c++) {
        data[i + c] = sharpened[i + c]
      }
    }
  }

  private static enhanceColors(data: Uint8ClampedArray, width: number, height: number): void {
    // Subtle color enhancement
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      
      // Calculate luminance
      const luminance = 0.299 * r + 0.587 * g + 0.114 * b
      
      // Apply subtle saturation boost
      const saturationBoost = 1.03
      const gray = luminance
      
      data[i] = Math.max(0, Math.min(255, gray + (r - gray) * saturationBoost))
      data[i + 1] = Math.max(0, Math.min(255, gray + (g - gray) * saturationBoost))
      data[i + 2] = Math.max(0, Math.min(255, gray + (b - gray) * saturationBoost))
    }
  }

  private static calculateQualityMetrics(canvas: HTMLCanvasElement): {
    sharpness: number
    noise: number
    artifacts: number
  } {
    const ctx = canvas.getContext("2d")!
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    
    let sharpnessSum = 0
    let noiseSum = 0
    let sampleCount = 0
    
    // Sample every 10th pixel
    for (let y = 5; y < canvas.height - 5; y += 10) {
      for (let x = 5; x < canvas.width - 5; x += 10) {
        const idx = (y * canvas.width + x) * 4
        
        // Calculate sharpness
        let edgeStrength = 0
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue
            
            const nIdx = ((y + dy) * canvas.width + (x + dx)) * 4
            const gradient = Math.abs(data[idx] - data[nIdx]) +
                           Math.abs(data[idx + 1] - data[nIdx + 1]) +
                           Math.abs(data[idx + 2] - data[nIdx + 2])
            edgeStrength = Math.max(edgeStrength, gradient)
          }
        }
        
        sharpnessSum += edgeStrength
        
        if (this.isNoisePixel(data, x, y, canvas.width, canvas.height)) {
          noiseSum++
        }
        
        sampleCount++
      }
    }
    
    return {
      sharpness: Math.min(100, (sharpnessSum / sampleCount) / 2),
      noise: Math.min(100, (noiseSum / sampleCount) * 100),
      artifacts: this.detectCompressionArtifacts(data, canvas.width, canvas.height) * 100
    }
  }

  private static async createOutputBlob(
    canvas: HTMLCanvasElement,
    options: UltimateUpscaleOptions
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const quality = (options.quality || 95) / 100
      const mimeType = `image/${options.outputFormat || "png"}`
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error("Failed to create output blob"))
          }
        },
        mimeType,
        quality
      )
    })
  }

  private static cleanupMemory(canvases: HTMLCanvasElement[]): void {
    canvases.forEach(canvas => {
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
      canvas.width = 1
      canvas.height = 1
    })
    
    // Force garbage collection if available
    if ('gc' in window && typeof (window as any).gc === 'function') {
      setTimeout(() => {
        (window as any).gc()
      }, 100)
    }
  }
}