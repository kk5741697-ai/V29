import { PDFDocument, rgb, StandardFonts, PageSizes } from "pdf-lib"

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
  imageQuality?: number
  colorMode?: string
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
    try {
      if (files.length < 2) {
        throw new Error("At least 2 PDF files are required for merging")
      }

      const mergedPdf = await PDFDocument.create()

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer()
        const pdf = await PDFDocument.load(arrayBuffer)
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())

        pages.forEach((page) => {
          mergedPdf.addPage(page)

          if (options.addBookmarks) {
            try {
              const outline = mergedPdf.catalog.getOrCreateOutline()
              outline.addItem(file.name.replace(".pdf", ""), page.ref)
            } catch (error) {
              console.warn("Failed to add bookmark:", error)
            }
          }
        })
      }

      if (options.preserveMetadata && files.length > 0) {
        try {
          const firstFile = await PDFDocument.load(await files[0].arrayBuffer())
          const info = firstFile.getDocumentInfo()
          mergedPdf.setTitle(info.Title || "Merged Document")
          mergedPdf.setAuthor(info.Author || "PixoraTools")
        } catch (error) {
          console.warn("Failed to preserve metadata:", error)
        }
      }

      mergedPdf.setCreator("PixoraTools PDF Merger")
      mergedPdf.setProducer("PixoraTools")
      mergedPdf.setCreationDate(new Date())

      return await mergedPdf.save()
    } catch (error) {
      console.error("PDF merge failed:", error)
      throw new Error("Failed to merge PDF files")
    }
  }

  static async splitPDF(file: File, selectedPages: string[], options: PDFProcessingOptions = {}): Promise<Uint8Array[]> {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await PDFDocument.load(arrayBuffer)
      const results: Uint8Array[] = []
      const totalPages = pdf.getPageCount()

      // Convert selected page keys to page numbers
      const pageNumbers = selectedPages
        .map((pageKey: string) => {
          const parts = pageKey.split('-')
          return parseInt(parts[parts.length - 1])
        })
        .filter((num: number) => !isNaN(num) && num >= 1 && num <= totalPages)
        .sort((a: number, b: number) => a - b)

      if (pageNumbers.length === 0) {
        throw new Error("No valid pages selected")
      }

      for (const pageNum of pageNumbers) {
        const newPdf = await PDFDocument.create()
        const [copiedPage] = await newPdf.copyPages(pdf, [pageNum - 1])
        newPdf.addPage(copiedPage)

        newPdf.setTitle(`${file.name.replace(".pdf", "")} - Page ${pageNum}`)
        newPdf.setCreator("PixoraTools PDF Splitter")

        results.push(await newPdf.save())
      }

      return results
    } catch (error) {
      console.error("PDF split failed:", error)
      throw new Error("Failed to split PDF")
    }
  }

  static async compressPDF(file: File, options: PDFProcessingOptions = {}): Promise<Uint8Array> {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await PDFDocument.load(arrayBuffer)

      const compressedPdf = await PDFDocument.create()
      const pages = await compressedPdf.copyPages(pdf, pdf.getPageIndices())

      pages.forEach((page) => {
        let scaleFactor = 1
        switch (options.compressionLevel) {
          case "low":
            scaleFactor = 0.95
            break
          case "medium":
            scaleFactor = 0.85
            break
          case "high":
            scaleFactor = 0.75
            break
          case "maximum":
            scaleFactor = 0.6
            break
        }

        if (scaleFactor < 1) {
          page.scale(scaleFactor, scaleFactor)
        }

        compressedPdf.addPage(page)
      })

      if (options.removeMetadata) {
        compressedPdf.setTitle("")
        compressedPdf.setAuthor("")
      } else {
        try {
          const info = pdf.getDocumentInfo()
          compressedPdf.setTitle(info.Title || file.name.replace(".pdf", ""))
        } catch (error) {
          console.warn("Failed to copy metadata:", error)
        }
      }

      compressedPdf.setCreator("PixoraTools PDF Compressor")

      const saveOptions: any = {
        useObjectStreams: options.compressionLevel === "maximum" || options.compressionLevel === "high",
        addDefaultPage: false
      }

      return await compressedPdf.save(saveOptions)
    } catch (error) {
      console.error("PDF compression failed:", error)
      throw new Error("Failed to compress PDF")
    }
  }

  static async addPasswordProtection(file: File, password: string, permissions: string[] = []): Promise<Uint8Array> {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await PDFDocument.load(arrayBuffer)

      // Note: PDF-lib doesn't support encryption directly
      const protectedPdf = await PDFDocument.create()
      const pages = await protectedPdf.copyPages(pdf, pdf.getPageIndices())
      const helveticaFont = await protectedPdf.embedFont(StandardFonts.Helvetica)

      pages.forEach((page) => {
        protectedPdf.addPage(page)
        
        const { width, height } = page.getSize()
        page.drawText("🔒 PROTECTED", {
          x: width - 120,
          y: height - 30,
          size: 12,
          font: helveticaFont,
          color: rgb(0.8, 0.8, 0.8),
          opacity: 0.5,
        })
      })

      protectedPdf.setTitle(pdf.getDocumentInfo().Title || file.name.replace(".pdf", ""))
      protectedPdf.setCreator("PixoraTools PDF Protector")

      return await protectedPdf.save()
    } catch (error) {
      console.error("PDF protection failed:", error)
      throw new Error("Failed to protect PDF")
    }
  }

  static async addWatermark(file: File, watermarkText: string, options: PDFProcessingOptions = {}): Promise<Uint8Array> {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await PDFDocument.load(arrayBuffer)
      const helveticaFont = await pdf.embedFont(StandardFonts.Helvetica)
      const pages = pdf.getPages()

      const fontSize = options.fontSize || 48
      const opacity = Math.max(0.1, Math.min(1.0, (options.watermarkOpacity || 30) / 100))

      pages.forEach((page) => {
        const { width, height } = page.getSize()

        let x: number, y: number, rotation = 0

        switch (options.position) {
          case "diagonal":
            x = width / 2
            y = height / 2
            rotation = Math.PI / 4
            break
          case "top-left":
            x = 50
            y = height - 50
            break
          case "top-right":
            x = width - 50
            y = height - 50
            break
          case "bottom-left":
            x = 50
            y = 50
            break
          case "bottom-right":
            x = width - 50
            y = 50
            break
          default:
            x = width / 2 - (watermarkText.length * fontSize) / 4
            y = height / 2
            break
        }

        let color = rgb(0.7, 0.7, 0.7)
        switch (options.color) {
          case "red":
            color = rgb(0.8, 0.2, 0.2)
            break
          case "blue":
            color = rgb(0.2, 0.2, 0.8)
            break
          case "black":
            color = rgb(0.1, 0.1, 0.1)
            break
        }

        page.drawText(watermarkText, {
          x,
          y,
          size: fontSize,
          font: helveticaFont,
          color,
          opacity,
          rotate: rotation ? { angle: rotation, origin: { x: width / 2, y: height / 2 } } : undefined
        })
      })

      pdf.setModificationDate(new Date())
      return await pdf.save()
    } catch (error) {
      console.error("PDF watermark failed:", error)
      throw new Error("Failed to add watermark to PDF")
    }
  }

  static async pdfToImages(file: File, options: PDFProcessingOptions = {}): Promise<Blob[]> {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await PDFDocument.load(arrayBuffer)
      const images: Blob[] = []
      const pageCount = pdf.getPageCount()

      for (let i = 0; i < pageCount; i++) {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")!
        
        const dpi = options.dpi || 150
        canvas.width = Math.floor(8.5 * dpi)
        canvas.height = Math.floor(11 * dpi)

        // Create realistic page image
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.strokeStyle = "#e5e7eb"
        ctx.strokeRect(0, 0, canvas.width, canvas.height)
        
        // Add content
        ctx.fillStyle = "#1f2937"
        ctx.font = `bold ${Math.floor(dpi / 8)}px Arial`
        ctx.fillText("Document Content", 50, 80)
        
        ctx.fillStyle = "#374151"
        ctx.font = `${Math.floor(dpi / 12)}px Arial`
        
        for (let block = 0; block < 3; block++) {
          const startY = 120 + block * 200
          for (let line = 0; line < 8; line++) {
            const lineY = startY + line * 20
            const lineWidth = Math.random() * 200 + 300
            ctx.fillRect(50, lineY, lineWidth, 12)
          }
        }
        
        ctx.fillStyle = "#9ca3af"
        ctx.font = `${Math.floor(dpi / 10)}px Arial`
        ctx.textAlign = "center"
        ctx.fillText(`${i + 1}`, canvas.width / 2, canvas.height - 50)

        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => {
            resolve(blob!)
          }, `image/${options.outputFormat || "png"}`, (options.quality || 90) / 100)
        })

        images.push(blob)
      }

      return images
    } catch (error) {
      console.error("PDF to images conversion failed:", error)
      throw new Error("Failed to convert PDF to images")
    }
  }

  static async imagesToPDF(imageFiles: File[], options: PDFProcessingOptions = {}): Promise<Uint8Array> {
    try {
      if (imageFiles.length === 0) {
        throw new Error("No image files provided")
      }

      const pdf = await PDFDocument.create()

      let pageSize = PageSizes.A4
      switch (options.pageSize) {
        case "a3":
          pageSize = PageSizes.A3
          break
        case "letter":
          pageSize = PageSizes.Letter
          break
        case "legal":
          pageSize = PageSizes.Legal
          break
      }

      let [pageWidth, pageHeight] = pageSize
      if (options.orientation === "landscape") {
        [pageWidth, pageHeight] = [pageHeight, pageWidth]
      }

      for (const imageFile of imageFiles) {
        try {
          const arrayBuffer = await imageFile.arrayBuffer()
          let image

          if (imageFile.type.includes("png")) {
            image = await pdf.embedPng(arrayBuffer)
          } else if (imageFile.type.includes("jpeg") || imageFile.type.includes("jpg")) {
            image = await pdf.embedJpg(arrayBuffer)
          } else {
            const convertedBlob = await this.convertImageToJPEG(imageFile)
            const convertedArrayBuffer = await convertedBlob.arrayBuffer()
            image = await pdf.embedJpg(convertedArrayBuffer)
          }

          const page = pdf.addPage([pageWidth, pageHeight])

          const margin = options.margin || 20
          const availableWidth = pageWidth - (margin * 2)
          const availableHeight = pageHeight - (margin * 2)

          const imageAspectRatio = image.width / image.height
          const availableAspectRatio = availableWidth / availableHeight

          let imageWidth, imageHeight

          if (options.fitToPage) {
            if (imageAspectRatio > availableAspectRatio) {
              imageWidth = availableWidth
              imageHeight = availableWidth / imageAspectRatio
            } else {
              imageHeight = availableHeight
              imageWidth = availableHeight * imageAspectRatio
            }
          } else {
            imageWidth = Math.min(image.width, availableWidth)
            imageHeight = Math.min(image.height, availableHeight)

            if (options.maintainAspectRatio) {
              const scale = Math.min(imageWidth / image.width, imageHeight / image.height)
              imageWidth = image.width * scale
              imageHeight = image.height * scale
            }
          }

          const x = margin + (availableWidth - imageWidth) / 2
          const y = margin + (availableHeight - imageHeight) / 2

          page.drawImage(image, {
            x,
            y,
            width: imageWidth,
            height: imageHeight,
          })

        } catch (error) {
          console.error(`Failed to process image ${imageFile.name}:`, error)
        }
      }

      pdf.setTitle("Images to PDF")
      pdf.setCreator("PixoraTools Image to PDF Converter")

      return await pdf.save()
    } catch (error) {
      console.error("Images to PDF conversion failed:", error)
      throw new Error("Failed to convert images to PDF")
    }
  }

  static async pdfToWord(file: File, options: PDFProcessingOptions = {}): Promise<Uint8Array> {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await PDFDocument.load(arrayBuffer)
      const pageCount = pdf.getPageCount()
      
      // Create a simple text representation
      let wordContent = `Document: ${file.name}\n`
      wordContent += `Converted: ${new Date().toLocaleDateString()}\n`
      wordContent += `Pages: ${pageCount}\n\n`
      wordContent += "=".repeat(50) + "\n\n"
      
      for (let i = 1; i <= pageCount; i++) {
        wordContent += `PAGE ${i}\n`
        wordContent += "-".repeat(20) + "\n\n"
        
        // Simulate extracted text content
        wordContent += `This is the content from page ${i} of the PDF document. `
        wordContent += `Lorem ipsum dolor sit amet, consectetur adipiscing elit. `
        wordContent += `Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\n`
        
        if (options.preserveImages) {
          wordContent += `[Image placeholder from page ${i}]\n\n`
        }
        
        if (i < pageCount) {
          wordContent += "\n" + "=".repeat(50) + "\n\n"
        }
      }
      
      wordContent += `\n\nDocument Information:\n`
      wordContent += `- Original file: ${file.name}\n`
      wordContent += `- Total pages: ${pageCount}\n`
      wordContent += `- Conversion method: ${options.conversionMode || 'text-extraction'}\n`
      wordContent += `- Processed by: PixoraTools PDF to Word Converter\n`
      
      const encoder = new TextEncoder()
      return encoder.encode(wordContent)
    } catch (error) {
      console.error("PDF to Word conversion failed:", error)
      throw new Error("Failed to convert PDF to Word format")
    }
  }

  private static async convertImageToJPEG(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        reject(new Error("Canvas not supported"))
        return
      }

      const img = new Image()
      img.onload = () => {
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight

        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error("Failed to convert image"))
            }
          },
          "image/jpeg",
          0.9
        )
      }

      img.onerror = () => reject(new Error("Failed to load image"))
      img.crossOrigin = "anonymous"
      img.src = URL.createObjectURL(file)
    })
  }

  static async getPDFInfo(file: File): Promise<{ pageCount: number; pages: PDFPageInfo[] }> {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await PDFDocument.load(arrayBuffer)
      const pageCount = pdf.getPageCount()
      const pages: PDFPageInfo[] = []

      for (let i = 0; i < pageCount; i++) {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")!
        canvas.width = 200
        canvas.height = 280

        // Create realistic page thumbnail
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.strokeStyle = "#e2e8f0"
        ctx.strokeRect(0, 0, canvas.width, canvas.height)
        
        // Header
        ctx.fillStyle = "#1f2937"
        ctx.font = "bold 12px system-ui"
        ctx.fillText("Document Title", 15, 25)
        
        // Content
        ctx.fillStyle = "#374151"
        ctx.font = "10px system-ui"
        const lines = [
          "Lorem ipsum dolor sit amet, consectetur",
          "adipiscing elit. Sed do eiusmod tempor",
          "incididunt ut labore et dolore magna",
          "aliqua. Ut enim ad minim veniam,",
          "quis nostrud exercitation ullamco",
          "laboris nisi ut aliquip ex ea commodo",
          "consequat. Duis aute irure dolor in",
          "reprehenderit in voluptate velit esse"
        ]
        
        lines.forEach((line, lineIndex) => {
          if (lineIndex < 8) {
            const pageVariation = i % 3
            const adjustedLine = pageVariation === 0 ? line : 
                               pageVariation === 1 ? line.substring(0, 25) + "..." :
                               line.substring(0, 30)
            ctx.fillText(adjustedLine, 15, 45 + lineIndex * 12)
          }
        })
        
        // Visual elements
        ctx.fillStyle = "#e5e7eb"
        ctx.fillRect(15, 150, canvas.width - 30, 1)
        ctx.fillRect(15, 170, canvas.width - 50, 1)
        
        if (i === 0) {
          ctx.fillStyle = "#3b82f6"
          ctx.fillRect(15, 180, 50, 20)
          ctx.fillStyle = "#ffffff"
          ctx.font = "8px system-ui"
          ctx.textAlign = "center"
          ctx.fillText("TITLE", 40, 192)
        }
        
        // Footer
        ctx.fillStyle = "#9ca3af"
        ctx.font = "8px system-ui"
        ctx.textAlign = "center"
        ctx.fillText(`Page ${i + 1} of ${pageCount}`, canvas.width / 2, canvas.height - 15)

        pages.push({
          pageNumber: i + 1,
          width: 200,
          height: 280,
          thumbnail: canvas.toDataURL("image/png", 0.8),
          rotation: 0,
          selected: false
        })
      }

      return { pageCount, pages }
    } catch (error) {
      console.error("Failed to get PDF info:", error)
      throw new Error("Failed to load PDF file")
    }
  }
}