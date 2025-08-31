import { removeBackground, Config, preload } from '@imgly/background-removal'

export interface ProfessionalBackgroundOptions {
  model?: 'u2net' | 'u2netp' | 'u2net_human_seg' | 'u2net_cloth_seg' | 'silueta'
  output?: {
    format?: 'image/png' | 'image/jpeg' | 'image/webp'
    quality?: number
    type?: 'foreground' | 'background' | 'mask'
  }
  progress?: (key: string, current: number, total: number) => void
  debug?: boolean
}

export interface ProcessingResult {
  processedBlob: Blob
  confidence: number
  processingTime: number
  modelUsed: string
}

export class ProfessionalBackgroundProcessor {
  private static modelLoaded = false
  private static isLoading = false

  static async initializeModel(model: string = 'u2net'): Promise<void> {
    if (this.modelLoaded || this.isLoading) return

    this.isLoading = true
    
    try {
      // Preload the model for better performance
      await preload({
        model: model as any,
        debug: false
      })
      
      this.modelLoaded = true
      console.log(`Professional background removal model (${model}) loaded successfully`)
    } catch (error) {
      console.error("Failed to load professional model:", error)
      throw new Error("Failed to initialize professional background removal")
    } finally {
      this.isLoading = false
    }
  }

  static async removeBackground(
    imageFile: File,
    options: ProfessionalBackgroundOptions = {}
  ): Promise<ProcessingResult> {
    const startTime = Date.now()
    
    try {
      // File size validation
      if (imageFile.size > 20 * 1024 * 1024) {
        throw new Error("File too large. Please use an image smaller than 20MB.")
      }

      if (!imageFile.type.startsWith('image/')) {
        throw new Error("Invalid file type. Please upload an image file.")
      }

      // Select optimal model based on content
      const selectedModel = this.selectOptimalModel(imageFile, options.model)
      
      // Initialize model if needed
      await this.initializeModel(selectedModel)

      // Configure processing
      const config: Config = {
        model: selectedModel as any,
        output: {
          format: options.output?.format || 'image/png',
          quality: (options.output?.quality || 95) / 100,
          type: options.output?.type || 'foreground'
        },
        progress: options.progress,
        debug: options.debug || false
      }

      // Process with professional library
      const blob = await removeBackground(imageFile, config)
      
      // Calculate confidence based on model and file characteristics
      const confidence = this.calculateConfidence(selectedModel, imageFile)
      
      return {
        processedBlob: blob,
        confidence,
        processingTime: Date.now() - startTime,
        modelUsed: selectedModel
      }
    } catch (error) {
      console.error("Professional background removal failed:", error)
      throw new Error(error instanceof Error ? error.message : "Background removal failed")
    }
  }

  private static selectOptimalModel(file: File, preferredModel?: string): string {
    if (preferredModel) return preferredModel

    const fileName = file.name.toLowerCase()
    const fileSize = file.size

    // Select model based on content type and performance needs
    if (fileName.includes('portrait') || fileName.includes('person') || fileName.includes('selfie')) {
      return 'u2net_human_seg' // Best for people
    } else if (fileName.includes('product') || fileName.includes('object')) {
      return 'u2net' // Best general purpose
    } else if (fileSize < 2 * 1024 * 1024) {
      return 'u2net' // High quality for smaller files
    } else if (fileSize < 5 * 1024 * 1024) {
      return 'u2netp' // Faster for medium files
    } else {
      return 'silueta' // Fastest for large files
    }
  }

  private static calculateConfidence(model: string, file: File): number {
    let baseConfidence = 0.85

    // Adjust confidence based on model
    switch (model) {
      case 'u2net':
        baseConfidence = 0.92
        break
      case 'u2net_human_seg':
        baseConfidence = 0.95
        break
      case 'u2net_cloth_seg':
        baseConfidence = 0.88
        break
      case 'u2netp':
        baseConfidence = 0.85
        break
      case 'silueta':
        baseConfidence = 0.80
        break
    }

    // Adjust based on file characteristics
    if (file.size < 1024 * 1024) {
      baseConfidence += 0.05 // Smaller files usually process better
    } else if (file.size > 10 * 1024 * 1024) {
      baseConfidence -= 0.1 // Larger files may have issues
    }

    return Math.min(0.98, Math.max(0.6, baseConfidence))
  }

  // Batch processing for multiple images
  static async batchRemoveBackground(
    files: File[],
    options: ProfessionalBackgroundOptions = {},
    onProgress?: (current: number, total: number) => void
  ): Promise<ProcessingResult[]> {
    const results: ProcessingResult[] = []
    
    // Initialize model once for batch processing
    const selectedModel = this.selectOptimalModel(files[0], options.model)
    await this.initializeModel(selectedModel)
    
    for (let i = 0; i < files.length; i++) {
      try {
        const result = await this.removeBackground(files[i], {
          ...options,
          model: selectedModel // Use same model for consistency
        })
        results.push(result)
        
        onProgress?.(i + 1, files.length)
      } catch (error) {
        console.error(`Failed to process ${files[i].name}:`, error)
        // Continue with other files
      }
    }
    
    return results
  }
}