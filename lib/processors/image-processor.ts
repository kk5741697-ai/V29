// Import production processors
import { ProductionImageProcessor } from "./production-image-processor"

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
  watermarkImage?: File
  flipDirection?: string
  customRotation?: number
  cropArea?: { x: number; y: number; width: number; height: number }
}

export class ImageProcessor {
  static async resizeImage(file: File, options: ImageProcessingOptions): Promise<Blob> {
    return ProductionImageProcessor.processImage(file, {
      width: options.width,
      height: options.height,
      quality: options.quality,
      outputFormat: options.outputFormat,
      maintainAspectRatio: options.maintainAspectRatio,
      backgroundColor: options.backgroundColor,
      memoryOptimized: true
    })
  }

  static async compressImage(file: File, options: ImageProcessingOptions): Promise<Blob> {
    return ProductionImageProcessor.processImage(file, {
      quality: options.quality,
      outputFormat: options.outputFormat,
      compressionLevel: options.compressionLevel,
      optimizeForWeb: true,
      memoryOptimized: true
    })
  }

  static async convertFormat(file: File, format: "jpeg" | "png" | "webp", options: ImageProcessingOptions = {}): Promise<Blob> {
    return ProductionImageProcessor.processImage(file, {
      outputFormat: format,
      quality: options.quality,
      backgroundColor: options.backgroundColor,
      memoryOptimized: true
    })
  }

  static async cropImage(file: File, cropArea: any, options: ImageProcessingOptions): Promise<Blob> {
    return ProductionImageProcessor.processImage(file, {
      cropArea,
      cropMode: "percentage",
      quality: options.quality,
      outputFormat: options.outputFormat,
      backgroundColor: options.backgroundColor,
      memoryOptimized: true
    })
  }

  static async rotateImage(file: File, options: ImageProcessingOptions): Promise<Blob> {
    return ProductionImageProcessor.processImage(file, {
      rotation: options.customRotation,
      quality: options.quality,
      outputFormat: options.outputFormat,
      backgroundColor: options.backgroundColor,
      memoryOptimized: true
    })
  }

  static async applyFilters(file: File, options: ImageProcessingOptions): Promise<Blob> {
    return ProductionImageProcessor.processImage(file, {
      filters: options.filters,
      quality: options.quality,
      outputFormat: options.outputFormat,
      memoryOptimized: true
    })
  }

  static async addWatermark(file: File, watermarkText: string, options: ImageProcessingOptions): Promise<Blob> {
    return ProductionImageProcessor.processImage(file, {
      watermark: {
        text: watermarkText,
        opacity: options.watermarkOpacity,
        position: options.position as any,
        color: options.textColor,
        fontSize: options.fontSize,
        shadow: true
      },
      quality: options.quality,
      outputFormat: options.outputFormat,
      memoryOptimized: true
    })
  }
}