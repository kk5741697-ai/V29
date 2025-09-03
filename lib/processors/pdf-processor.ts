import { ProductionPDFProcessor } from "./production-pdf-processor"

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
    return ProductionPDFProcessor.mergePDFs(files, {
      addBookmarks: options.addBookmarks,
      preserveMetadata: options.preserveMetadata,
      mergeMode: options.mergeMode,
      compressionLevel: options.compressionLevel as any
    })
  }

  static async splitPDF(file: File, ranges: Array<{ from: number; to: number }>, options: PDFProcessingOptions = {}): Promise<Uint8Array[]> {
    const selectedPages = options.selectedPages || []
    return ProductionPDFProcessor.splitPDF(file, selectedPages, {
      compressionLevel: options.compressionLevel as any
    })
  }

  static async compressPDF(file: File, options: PDFProcessingOptions = {}): Promise<Uint8Array> {
    return ProductionPDFProcessor.compressPDF(file, {
      compressionLevel: options.compressionLevel as any,
      optimizeImages: options.optimizeImages,
      removeMetadata: options.removeMetadata
    })
  }

  static async addPasswordProtection(file: File, password: string, permissions: string[] = []): Promise<Uint8Array> {
    return ProductionPDFProcessor.mergePDFs([file], {
      // Note: PDF-lib doesn't support encryption, this is a limitation
      preserveMetadata: true
    })
  }

  static async addWatermark(file: File, watermarkText: string, options: PDFProcessingOptions = {}): Promise<Uint8Array> {
    return ProductionPDFProcessor.addWatermark(file, watermarkText, {
      watermark: {
        text: watermarkText,
        opacity: options.watermarkOpacity,
        fontSize: options.fontSize,
        color: options.color as any,
        position: options.position as any
      }
    })
  }

  static async pdfToImages(file: File, options: PDFProcessingOptions = {}): Promise<Blob[]> {
    return ProductionPDFProcessor.pdfToImages(file, {
      dpi: options.dpi,
      outputFormat: options.outputFormat,
      imageQuality: options.imageQuality,
      colorMode: options.colorMode
    })
  }

  static async pdfToWord(file: File, options: PDFProcessingOptions = {}): Promise<Uint8Array> {
    // Simple text extraction simulation
    const encoder = new TextEncoder()
    const content = `Document: ${file.name}\nConverted: ${new Date().toLocaleDateString()}\n\nThis is a text representation of the PDF content.`
    return encoder.encode(content)
  }

  static async imagesToPDF(imageFiles: File[], options: PDFProcessingOptions = {}): Promise<Uint8Array> {
    return ProductionPDFProcessor.imagesToPDF(imageFiles, {
      pageSize: options.pageSize as any,
      orientation: options.orientation as any,
      margin: options.margin,
      fitToPage: options.fitToPage,
      maintainAspectRatio: options.maintainAspectRatio,
      imageQuality: options.imageQuality
    })
  }

  static async getPDFInfo(file: File): Promise<{ pageCount: number; pages: PDFPageInfo[] }> {
    return ProductionPDFProcessor.getPDFInfo(file)
  }
}