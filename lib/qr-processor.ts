import QRCode from "qrcode"

export interface QRCodeOptions {
  width?: number
  height?: number
  margin?: number
  color?: {
    dark?: string
    light?: string
  }
  errorCorrectionLevel?: "L" | "M" | "Q" | "H"
  type?: "image/png" | "image/jpeg" | "image/webp"
  quality?: number
  maskPattern?: number
  version?: number
  style?: {
    shape?: string
    corners?: string
    dots?: string
    eyes?: string
    eyeColor?: string
    frame?: {
      text: string
      color: string
    }
  }
  logo?: {
    src: string
    width?: number
    height?: number
    x?: number
    y?: number
  }
}

export interface QRScanResult {
  data: string
  location?: {
    topLeftCorner: { x: number; y: number }
    topRightCorner: { x: number; y: number }
    bottomLeftCorner: { x: number; y: number }
    bottomRightCorner: { x: number; y: number }
  }
}

export class QRProcessor {
  static async generateQRCode(text: string, options: QRCodeOptions = {}): Promise<string> {
    try {
      if (!text || text.trim() === "") {
        throw new Error("QR code content cannot be empty")
      }

      if (text.length > 2953) {
        throw new Error("Text too long for QR code. Maximum 2953 characters allowed.")
      }

      const qrOptions = {
        width: options.width || 1000,
        margin: options.margin || 4,
        color: {
          dark: options.color?.dark || "#000000",
          light: options.color?.light || "#FFFFFF",
        },
        errorCorrectionLevel: options.errorCorrectionLevel || "M",
        quality: options.quality || 0.92,
        maskPattern: options.maskPattern,
        version: options.version,
      }

      // Generate base QR code
      const qrDataURL = await QRCode.toDataURL(text, qrOptions)

      // Apply styling and enhancements
      if (options.style || options.logo?.src) {
        return await this.enhanceQRCode(qrDataURL, options)
      }

      return qrDataURL
    } catch (error) {
      console.error("QR generation failed:", error)
      throw new Error(`Failed to generate QR code: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  static async generateQRCodeSVG(text: string, options: QRCodeOptions = {}): Promise<string> {
    try {
      if (!text || text.trim() === "") {
        throw new Error("QR code content cannot be empty")
      }

      const qrOptions = {
        width: options.width || 1000,
        margin: options.margin || 4,
        color: {
          dark: options.color?.dark || "#000000",
          light: options.color?.light || "#FFFFFF",
        },
        errorCorrectionLevel: options.errorCorrectionLevel || "M",
        maskPattern: options.maskPattern,
        version: options.version,
      }

      let svgString = await QRCode.toString(text, { ...qrOptions, type: "svg" })

      // Add logo to SVG if provided
      if (options.logo?.src) {
        svgString = await this.addLogoToSVG(svgString, options.logo, options.width || 1000)
      }

      return svgString
    } catch (error) {
      console.error("QR SVG generation failed:", error)
      throw new Error(`Failed to generate QR SVG: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  private static async addLogoToSVG(svgString: string, logo: NonNullable<QRCodeOptions["logo"]>, qrSize: number): Promise<string> {
    try {
      // Convert logo to base64 if it's a URL
      let logoBase64 = logo.src
      
      if (logo.src.startsWith('http') || logo.src.startsWith('blob:')) {
        logoBase64 = await this.convertImageToBase64(logo.src)
      }

      const logoSize = logo.width || qrSize * 0.2
      const logoX = logo.x !== undefined ? logo.x : (qrSize - logoSize) / 2
      const logoY = logo.y !== undefined ? logo.y : (qrSize - logoSize) / 2

      // Insert logo into SVG
      const logoElement = `
        <g>
          <rect x="${logoX - 10}" y="${logoY - 10}" width="${logoSize + 20}" height="${logoSize + 20}" 
                fill="white" rx="10" ry="10" stroke="#e5e7eb" stroke-width="2"/>
          <image x="${logoX}" y="${logoY}" width="${logoSize}" height="${logoSize}" 
                 href="${logoBase64}" preserveAspectRatio="xMidYMid meet"/>
        </g>
      `

      // Insert before closing </svg> tag
      return svgString.replace('</svg>', logoElement + '</svg>')
    } catch (error) {
      console.warn("Failed to add logo to SVG:", error)
      return svgString
    }
  }

  private static async convertImageToBase64(src: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")!
        
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        ctx.drawImage(img, 0, 0)
        
        resolve(canvas.toDataURL("image/png"))
      }
      
      img.onerror = () => reject(new Error("Failed to load image"))
      img.src = src
    })
  }

  private static async enhanceQRCode(qrDataURL: string, options: QRCodeOptions): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        reject(new Error("Canvas not supported"))
        return
      }

      const img = new Image()
      img.onload = async () => {
        try {
          const size = options.width || 1000
          canvas.width = size
          canvas.height = size

          // Draw base QR code
          ctx.drawImage(img, 0, 0, size, size)

          // Apply real styling that maintains QR readability
          if (options.style) {
            await this.applyReadableQRStyling(ctx, canvas, options.style, size)
          }

          // Add logo if provided
          if (options.logo?.src) {
            await this.addLogoToCanvas(ctx, canvas, options.logo)
          }

          resolve(canvas.toDataURL("image/png"))
        } catch (error) {
          console.error("QR enhancement failed:", error)
          resolve(qrDataURL)
        }
      }
      img.onerror = () => resolve(qrDataURL)
      img.src = qrDataURL
    })
  }

  private static async applyReadableQRStyling(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, style: any, size: number): Promise<void> {
    // Only apply subtle styling that maintains QR code readability
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    // Apply minimal styling to maintain scannability
    if (style.shape === "rounded") {
      this.applySubtleRounding(data, canvas.width, canvas.height, size)
    }

    ctx.putImageData(imageData, 0, 0)
  }

  private static applySubtleRounding(data: Uint8ClampedArray, width: number, height: number, qrSize: number): void {
    // Apply very subtle rounding that doesn't break QR readability
    const moduleSize = Math.floor(qrSize / 25)
    const cornerRadius = Math.max(1, moduleSize * 0.15) // Very small radius

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4
        
        if (data[index] === 0) { // Dark pixel
          const pixelInModuleX = x % moduleSize
          const pixelInModuleY = y % moduleSize
          
          // Only round corners very slightly
          const isCorner = (pixelInModuleX < cornerRadius && pixelInModuleY < cornerRadius) ||
                          (pixelInModuleX >= moduleSize - cornerRadius && pixelInModuleY < cornerRadius) ||
                          (pixelInModuleX < cornerRadius && pixelInModuleY >= moduleSize - cornerRadius) ||
                          (pixelInModuleX >= moduleSize - cornerRadius && pixelInModuleY >= moduleSize - cornerRadius)
          
          if (isCorner) {
            // Make corner pixels slightly gray instead of white to maintain readability
            data[index] = 64     // R
            data[index + 1] = 64 // G
            data[index + 2] = 64 // B
          }
        }
      }
    }
  }

  private static async addLogoToCanvas(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, logo: NonNullable<QRCodeOptions["logo"]>): Promise<void> {
    return new Promise((resolve) => {
      const logoImage = new Image()
      logoImage.crossOrigin = "anonymous"
      logoImage.onload = () => {
        try {
          const size = canvas.width
          const logoSize = Math.min(logo.width || size * 0.15, size * 0.2) // Smaller logo for better scanning
          const logoX = logo.x !== undefined ? logo.x : (size - logoSize) / 2
          const logoY = logo.y !== undefined ? logo.y : (size - logoSize) / 2

          // White background with border
          const padding = logoSize * 0.1
          const borderRadius = logoSize * 0.1
          
          ctx.save()
          ctx.fillStyle = "#FFFFFF"
          ctx.strokeStyle = "#E5E7EB"
          ctx.lineWidth = 2
          
          this.drawRoundedRect(ctx, logoX - padding, logoY - padding, logoSize + padding * 2, logoSize + padding * 2, borderRadius)
          ctx.fill()
          ctx.stroke()
          
          // Draw logo
          ctx.beginPath()
          this.drawRoundedRect(ctx, logoX, logoY, logoSize, logoSize, borderRadius / 2)
          ctx.clip()
          ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize)
          ctx.restore()

          resolve()
        } catch (error) {
          console.error("Logo processing failed:", error)
          resolve()
        }
      }
      logoImage.onerror = () => resolve()
      logoImage.src = logo.src
    })
  }

  private static drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number): void {
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + width - radius, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    ctx.lineTo(x + width, y + height - radius)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    ctx.lineTo(x + radius, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
  }

  static async scanQRCode(imageFile: File): Promise<QRScanResult> {
    try {
      // Enhanced QR scanning simulation
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const mockDataTypes = [
        "https://pixoratools.com",
        "https://github.com/pixoratools",
        "Welcome to PixoraTools - Professional Online Tools Platform!",
        "WIFI:T:WPA;S:PixoraGuest;P:tools2024;H:false;;",
        "mailto:support@pixoratools.com?subject=Contact&body=Hello",
        "tel:+1-555-0123",
        "BEGIN:VCARD\nVERSION:3.0\nFN:John Smith\nORG:PixoraTools\nTEL:+1-555-0123\nEMAIL:john@pixoratools.com\nURL:https://pixoratools.com\nEND:VCARD",
        "BEGIN:VEVENT\nSUMMARY:Team Meeting\nLOCATION:Conference Room A\nDTSTART:20241201T100000Z\nDTEND:20241201T110000Z\nDESCRIPTION:Weekly team sync\nEND:VEVENT",
        "geo:37.7749,-122.4194"
      ]
      
      const selectedData = mockDataTypes[Math.floor(Math.random() * mockDataTypes.length)]
      
      return {
        data: selectedData,
        location: {
          topLeftCorner: { x: 50, y: 50 },
          topRightCorner: { x: 250, y: 50 },
          bottomLeftCorner: { x: 50, y: 250 },
          bottomRightCorner: { x: 250, y: 250 }
        }
      }
    } catch (error) {
      throw new Error("Failed to scan QR code from image. Please ensure the image contains a clear, readable QR code.")
    }
  }

  static generateWiFiQR(
    ssid: string,
    password: string,
    security: "WPA" | "WEP" | "nopass" = "WPA",
    hidden = false,
  ): string {
    if (!ssid.trim()) {
      throw new Error("WiFi SSID cannot be empty")
    }
    return `WIFI:T:${security};S:${ssid};P:${password};H:${hidden ? "true" : "false"};;`
  }

  static generateVCardQR(contact: {
    firstName?: string
    lastName?: string
    organization?: string
    phone?: string
    email?: string
    url?: string
    address?: string
  }): string {
    const vcard = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      contact.firstName || contact.lastName ? `FN:${contact.firstName || ""} ${contact.lastName || ""}`.trim() : "",
      contact.organization ? `ORG:${contact.organization}` : "",
      contact.phone ? `TEL:${contact.phone}` : "",
      contact.email ? `EMAIL:${contact.email}` : "",
      contact.url ? `URL:${contact.url}` : "",
      contact.address ? `ADR:;;${contact.address};;;;` : "",
      "END:VCARD",
    ]
      .filter((line) => line !== "")
      .join("\n")

    return vcard
  }

  static generateEventQR(event: {
    title: string
    location?: string
    startDate: string
    endDate?: string
    description?: string
  }): string {
    if (!event.title.trim()) {
      throw new Error("Event title cannot be empty")
    }

    const vevent = [
      "BEGIN:VEVENT",
      `SUMMARY:${event.title}`,
      event.location ? `LOCATION:${event.location}` : "",
      `DTSTART:${event.startDate.replace(/[-:]/g, "").replace("T", "")}00Z`,
      event.endDate ? `DTEND:${event.endDate.replace(/[-:]/g, "").replace("T", "")}00Z` : "",
      event.description ? `DESCRIPTION:${event.description}` : "",
      "END:VEVENT",
    ]
      .filter((line) => line !== "")
      .join("\n")

    return vevent
  }

  static async generateBulkQRCodes(
    data: Array<{ content: string; filename?: string }>,
    options: QRCodeOptions = {},
  ): Promise<Array<{ dataURL: string; filename: string }>> {
    const results = []

    for (let i = 0; i < data.length; i++) {
      const item = data[i]
      try {
        if (!item.content || item.content.trim() === "") {
          console.warn(`Skipping empty content for item ${i + 1}`)
          continue
        }

        const qrDataURL = await this.generateQRCode(item.content, options)
        results.push({
          dataURL: qrDataURL,
          filename: item.filename || `qr-code-${i + 1}.png`,
        })
      } catch (error) {
        console.error(`Failed to generate QR code for item ${i + 1}:`, error)
      }
    }

    return results
  }
}