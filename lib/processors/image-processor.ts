// Import real processors
import { RealImageProcessor } from "./real-image-processor"
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
    return RealImageProcessor.resizeImage(file, options)
  }
  static async compressImage(file: File, options: ImageProcessingOptions): Promise<Blob> {
    return RealImageProcessor.compressImage(file, options)
  }
  static async convertFormat(file: File, format: "jpeg" | "png" | "webp", options: ImageProcessingOptions = {}): Promise<Blob> {
    return RealImageProcessor.convertFormat(file, format, options)
  }
  static async cropImage(file: File, cropArea: any, options: ImageProcessingOptions): Promise<Blob> {
    return RealImageProcessor.cropImage(file, cropArea, options)
  }
  static async rotateImage(file: File, options: ImageProcessingOptions): Promise<Blob> {
    return RealImageProcessor.rotateImage(file, options)
  }
  static async applyFilters(file: File, options: ImageProcessingOptions): Promise<Blob> {
    return RealImageProcessor.applyFilters(file, options)
  }
  static async addWatermark(file: File, watermarkText: string, options: ImageProcessingOptions): Promise<Blob> {
    return RealImageProcessor.addWatermark(file, watermarkText, options)
  }
}