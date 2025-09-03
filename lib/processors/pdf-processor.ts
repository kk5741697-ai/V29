import { RealPDFProcessor } from "./real-pdf-processor"

export interface PDFProcessingOptions {
  quality?: number
  password?: string
  permissions?: string[]
  watermarkText?: string
  watermarkOpacity?: number
  compressionLevel?: "low" | "medium" | "high" | "maximum"
  outputFormat?: "pdf" | "png" | "jpeg" | "webp"
  dpi?: number
  pageRanges?: Array<{ from: number; to: number }>
  mergeMode?: "sequential" | "interleave" | "custom"
  addBookmarks?: boolean
  preserveMetadata?: boolean
  selectedPages?: string[]
  extractMode?: string
  equalParts?: number
  optimizeImages?: boolean
  removeMetadata?: boolean
  position?: string
  fontSize?: number
  color?: string
  pageSize?: string
  orientation?: string
  margin?: number
  fitToPage?: boolean
  maintainAspectRatio?: boolean
  conversionMode?: string
  preserveLayout?: boolean
  preserveImages?: boolean
  preserveFormatting?: boolean
  language?: string
  imageQuality?: number
  colorMode?: string
  userPassword?: string
  ownerPassword?: string
  allowPrinting?: boolean
  allowCopying?: boolean
  allowModifying?: boolean
  allowAnnotations?: boolean
  encryptionLevel?: string
  sortBy?: string
  removeBlankPages?: boolean
  addPageNumbers?: boolean
  pageNumberPosition?: string
}

export interface PDFPageInfo {
  pageNumber: number
  width: number
  height: number
  thumbnail: string
  rotation: number
  selected?: boolean
}

export class PDFProcessor {
  static async mergePDFs(files: File[], options: PDFProcessingOptions = {}): Promise<Uint8Array> {
    return RealPDFProcessor.mergePDFs(files, options)
  }

  static async splitPDF(file: File, ranges: Array<{ from: number; to: number }>, options: PDFProcessingOptions = {}): Promise<Uint8Array[]> {
    const selectedPages = options.selectedPages || []
    return RealPDFProcessor.splitPDF(file, selectedPages, options)
  }

  static async compressPDF(file: File, options: PDFProcessingOptions = {}): Promise<Uint8Array> {
    return RealPDFProcessor.compressPDF(file, options)
  }

  static async addPasswordProtection(file: File, password: string, permissions: string[] = []): Promise<Uint8Array> {
    return RealPDFProcessor.addPasswordProtection(file, password, permissions)
  }

  static async addWatermark(file: File, watermarkText: string, options: PDFProcessingOptions = {}): Promise<Uint8Array> {
    return RealPDFProcessor.addWatermark(file, watermarkText, options)
  }

  static async pdfToImages(file: File, options: PDFProcessingOptions = {}): Promise<Blob[]> {
    return RealPDFProcessor.pdfToImages(file, options)
  }

  static async pdfToWord(file: File, options: PDFProcessingOptions = {}): Promise<Uint8Array> {
    return RealPDFProcessor.pdfToWord(file, options)
  }

  static async imagesToPDF(imageFiles: File[], options: PDFProcessingOptions = {}): Promise<Uint8Array> {
    return RealPDFProcessor.imagesToPDF(imageFiles, options)
  }

  static async getPDFInfo(file: File): Promise<{ pageCount: number; pages: PDFPageInfo[] }> {
    return RealPDFProcessor.getPDFInfo(file)
  }
}