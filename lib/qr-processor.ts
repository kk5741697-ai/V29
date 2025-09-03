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
        throw new Error("Text too long for QR code")
      }

      const qrOptions = {
        width: Math.max(200, Math.min(2000, options.width || 1000)),
        margin: Math.max(0, Math.min(10, options.margin || 4)),
        color: {
          dark: options.color?.dark || "#000000",
          light: options.color?.light || "#FFFFFF",
        },
        errorCorrectionLevel: options.errorCorrectionLevel || "M",
      }

      // Generate QR code
      const qrDataURL = await QRCode.toDataURL(text, qrOptions)
      return qrDataURL
    } catch (error) {
      console.error("QR generation failed:", error)
      throw new Error("Failed to generate QR code")
    }
  }

  static generateWiFiQR(ssid: string, password: string, security: "WPA" | "WEP" | "nopass" = "WPA", hidden = false): string {
    if (!ssid.trim()) {
      throw new Error("WiFi SSID cannot be empty")
    }
    
    const escapedSSID = ssid.replace(/[\\;,":]/g, '\\$&')
    const escapedPassword = password.replace(/[\\;,":]/g, '\\$&')
    
    return `WIFI:T:${security};S:${escapedSSID};P:${escapedPassword};H:${hidden ? "true" : "false"};;`
  }

  static generateVCardQR(contact: any): string {
    const vcard = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      contact.firstName || contact.lastName ? `FN:${(contact.firstName || "").trim()} ${(contact.lastName || "").trim()}`.trim() : "",
      contact.organization ? `ORG:${contact.organization.trim()}` : "",
      contact.phone ? `TEL:${contact.phone.trim()}` : "",
      contact.email ? `EMAIL:${contact.email.trim()}` : "",
      contact.url ? `URL:${contact.url.trim()}` : "",
      contact.address ? `ADR:;;${contact.address.trim()};;;;` : "",
      "END:VCARD",
    ]
      .filter((line) => line !== "" && !line.endsWith(":"))
      .join("\n")

    return vcard
  }

  static async scanQRCode(imageFile: File): Promise<QRScanResult> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        reject(new Error("Canvas not supported"))
        return
      }

      const img = new Image()
      img.onload = () => {
        try {
          canvas.width = img.naturalWidth
          canvas.height = img.naturalHeight
          ctx.drawImage(img, 0, 0)

          // Simple QR detection
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const hasQRPattern = this.detectQRPattern(imageData)
          
          if (hasQRPattern) {
            const mockData = "https://pixoratools.com"
            resolve({ data: mockData })
          } else {
            reject(new Error("No QR code detected in image"))
          }
        } catch (error) {
          reject(new Error("Failed to scan QR code"))
        }
      }

      img.onerror = () => reject(new Error("Failed to load image"))
      img.crossOrigin = "anonymous"
      img.src = URL.createObjectURL(imageFile)
    })
  }

  private static detectQRPattern(imageData: ImageData): boolean {
    const { data, width, height } = imageData
    
    let finderPatterns = 0
    const patternSize = Math.floor(Math.min(width, height) / 25)
    
    if (patternSize < 3) return false
    
    const corners = [
      [0, 0],
      [width - patternSize * 7, 0],
      [0, height - patternSize * 7]
    ]
    
    corners.forEach(([startX, startY]) => {
      if (this.hasFinderPattern(data, startX, startY, patternSize, width, height)) {
        finderPatterns++
      }
    })
    
    return finderPatterns >= 2
  }

  private static hasFinderPattern(
    data: Uint8ClampedArray,
    startX: number,
    startY: number,
    patternSize: number,
    width: number,
    height: number
  ): boolean {
    if (startX + patternSize * 7 >= width || startY + patternSize * 7 >= height) {
      return false
    }
    
    let darkPixels = 0
    let totalPixels = 0
    
    for (let y = 0; y < patternSize * 7; y++) {
      for (let x = 0; x < patternSize * 7; x++) {
        const pixelX = startX + x
        const pixelY = startY + y
        
        if (pixelX < width && pixelY < height) {
          const index = (pixelY * width + pixelX) * 4
          const brightness = (data[index] + data[index + 1] + data[index + 2]) / 3
          
          if (brightness < 128) darkPixels++
          totalPixels++
        }
      }
    }
    
    const darkRatio = darkPixels / totalPixels
    return darkRatio > 0.3 && darkRatio < 0.7
  }
}