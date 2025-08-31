import Upscaler from 'upscaler'

export interface ProfessionalUpscaleOptions {
  scale?: number
  model?: 'esrgan-thick' | 'esrgan-slim' | 'gans' | 'pixel-upsampler'
  output?: 'tensor' | 'base64' | 'blob'
  patchSize?: number
  padding?: number
  progress?: (progress: number) => void
}

export interface UpscaleResult {
  processedBlob: Blob
  actualScale: number
  finalDimensions: { width: number; height: number }
  modelUsed: string
  processingTime: number
}

export class ProfessionalUpscaler {
  private static upscaler: Upscaler | null = null
  private static modelLoaded = false

  static async initializeUpscaler(model: string = 'esrgan-thick'): Promise<void> {
    if (this.upscaler && this.modelLoaded) return

    try {
      this.upscaler = new Upscaler({
        model: model as any,
        warmupSizes: [
          { patchSize: 64, padding: 4 },
          { patchSize: 128, padding: 8 }
        ]
      })

      // Warm up the model
      await this.upscaler.warmup([
        { patchSize: 64, padding: 4 },
        { patchSize: 128, padding: 8 }
      ])

      this.modelLoaded = true
      console.log(`Professional upscaler (${model}) initialized successfully`)
    } catch (error) {
      console.error("Failed to initialize upscaler:", error)
      throw new Error("Failed to initialize professional upscaler")
    }
  }

  static async upscaleImage(
    imageFile: File,
    options: ProfessionalUpscaleOptions = {}
  ): Promise<UpscaleResult> {
    const startTime = Date.now()
    
    try {
      // File validation
      if (imageFile.size > 15 * 1024 * 1024) {
        throw new Error("File too large. Please use an image smaller than 15MB.")
      }

      if (!imageFile.type.startsWith('image/')) {
        throw new Error("Invalid file type. Please upload an image file.")
      }

      // Get image dimensions for validation
      const dimensions = await this.getImageDimensions(imageFile)
      
      if (dimensions.width * dimensions.height > 1024 * 1024) {
        throw new Error("Image resolution too high. Please use an image under 1024x1024 pixels.")
      }

      // Select optimal model and settings
      const selectedModel = this.selectOptimalModel(imageFile, dimensions, options.model)
      const scale = Math.min(options.scale || 2, 4) // Max 4x for safety
      
      // Initialize upscaler with selected model
      await this.initializeUpscaler(selectedModel)
      
      if (!this.upscaler) {
        throw new Error("Upscaler not initialized")
      }

      // Calculate optimal patch size based on image
      const patchSize = this.calculateOptimalPatchSize(dimensions)
      const padding = Math.floor(patchSize / 8)

      // Process image
      const upscaledImage = await this.upscaler.upscale(imageFile, {
        output: 'base64',
        patchSize,
        padding,
        progress: options.progress
      })

      // Convert to blob
      const processedBlob = await this.base64ToBlob(upscaledImage as string, 'image/png')
      
      // Calculate final dimensions
      const finalDimensions = {
        width: Math.floor(dimensions.width * scale),
        height: Math.floor(dimensions.height * scale)
      }

      return {
        processedBlob,
        actualScale: scale,
        finalDimensions,
        modelUsed: selectedModel,
        processingTime: Date.now() - startTime
      }
    } catch (error) {
      console.error("Professional upscaling failed:", error)
      throw new Error(error instanceof Error ? error.message : "Image upscaling failed")
    }
  }

  private static async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
      img.onerror = () => reject(new Error("Failed to load image"))
      img.src = URL.createObjectURL(file)
    })
  }

  private static selectOptimalModel(
    file: File, 
    dimensions: { width: number; height: number },
    preferredModel?: string
  ): string {
    if (preferredModel) return preferredModel

    const fileName = file.name.toLowerCase()
    const pixelCount = dimensions.width * dimensions.height

    // Select model based on content and performance
    if (fileName.includes('anime') || fileName.includes('art') || fileName.includes('cartoon')) {
      return 'gans' // Best for anime/art
    } else if (fileName.includes('photo') || fileName.includes('portrait')) {
      return 'esrgan-thick' // Best for photos
    } else if (pixelCount < 256 * 256) {
      return 'esrgan-thick' // High quality for small images
    } else if (pixelCount < 512 * 512) {
      return 'esrgan-slim' // Balanced for medium images
    } else {
      return 'pixel-upsampler' // Fastest for large images
    }
  }

  private static calculateOptimalPatchSize(dimensions: { width: number; height: number }): number {
    const pixelCount = dimensions.width * dimensions.height
    
    if (pixelCount < 128 * 128) {
      return 64
    } else if (pixelCount < 256 * 256) {
      return 128
    } else if (pixelCount < 512 * 512) {
      return 256
    } else {
      return 512
    }
  }

  private static async base64ToBlob(base64: string, mimeType: string): Promise<Blob> {
    const response = await fetch(`data:${mimeType};base64,${base64}`)
    return response.blob()
  }

  // Batch upscaling
  static async batchUpscale(
    files: File[],
    options: ProfessionalUpscaleOptions = {},
    onProgress?: (current: number, total: number) => void
  ): Promise<UpscaleResult[]> {
    const results: UpscaleResult[] = []
    
    // Initialize once for batch processing
    const selectedModel = this.selectOptimalModel(files[0], await this.getImageDimensions(files[0]), options.model)
    await this.initializeUpscaler(selectedModel)
    
    for (let i = 0; i < files.length; i++) {
      try {
        const result = await this.upscaleImage(files[i], {
          ...options,
          model: selectedModel
        })
        results.push(result)
        
        onProgress?.(i + 1, files.length)
      } catch (error) {
        console.error(`Failed to upscale ${files[i].name}:`, error)
      }
    }
    
    return results
  }
}