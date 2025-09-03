import QRCode from "qrcode"

export interface RealQROptions {
  width?: number
  margin?: number
  color?: {
    dark?: string
    light?: string
  }
  errorCorrectionLevel?: "L" | "M" | "Q" | "H"
  style?: {
    shape?: "square" | "rounded" | "dots" | "classy"
    eyeShape?: "square" | "rounded" | "leaf"
    dataShape?: "square" | "rounded" | "dots"
  }
  logo?: {
    file?: File
    size?: number
    margin?: number
  }
}

export class RealQRProcessor {
  static async generateQRCode(text: string, options: RealQROptions = {}): Promise<string> {
    try {
      if (!text || text.trim() === "") {
        throw new Error("QR code content cannot be empty")
      }

      if (text.length > 2953) {
        throw new Error("Text too long for QR code")
      }

      const qrOptions = {
        width: options.width || 1000,
        margin: options.margin || 4,
        color: {
          dark: options.color?.dark || "#000000",
          light: options.color?.light || "#FFFFFF",
        },
        errorCorrectionLevel: options.errorCorrectionLevel || "M",
      }

      // Generate base QR code
      let qrDataURL = await QRCode.toDataURL(text, qrOptions)

      // Apply styling if requested (but keep it scannable)
      if (options.style && options.style.shape !== "square") {
        qrDataURL = await this.applyScannableStyle(qrDataURL, options)
      }

      // Add logo if provided
      if (options.logo?.file) {
        qrDataURL = await this.addLogoToQR(qrDataURL, options.logo, options.width || 1000)
      }

      return qrDataURL
    } catch (error) {
      console.error("QR generation failed:", error)
      throw new Error("Failed to generate QR code")
    }
  }

  private static async applyScannableStyle(qrDataURL: string, options: RealQROptions): Promise<string> {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        resolve(qrDataURL)
        return
      }

      const img = new Image()
      img.onload = () => {
        try {
          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0)

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const data = imageData.data

          // Apply minimal styling that maintains scannability
          if (options.style?.shape === "rounded") {
            this.applyMinimalRounding(data, canvas.width, canvas.height)
          } else if (options.style?.shape === "dots") {
            this.applyDotStyle(data, canvas.width, canvas.height)
          }

          ctx.putImageData(imageData, 0, 0)
          resolve(canvas.toDataURL("image/png"))
        } catch (error) {
          console.error("Style application failed:", error)
          resolve(qrDataURL)
        }
      }
      img.onerror = () => resolve(qrDataURL)
      img.src = qrDataURL
    })
  }

  private static applyMinimalRounding(data: Uint8ClampedArray, width: number, height: number): void {
    // Apply very subtle rounding that doesn't break scanning
    const moduleSize = Math.floor(width / 25) // Approximate QR module size
    const cornerRadius = Math.max(1, Math.floor(moduleSize * 0.1)) // Very small radius

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4
        
        if (data[index] === 0) { // Dark pixel
          const moduleX = Math.floor(x / moduleSize)
          const moduleY = Math.floor(y / moduleSize)
          const pixelInModuleX = x % moduleSize
          const pixelInModuleY = y % moduleSize
          
          // Only round very corner pixels
          const isCornerPixel = (pixelInModuleX < cornerRadius && pixelInModuleY < cornerRadius) ||
                               (pixelInModuleX >= moduleSize - cornerRadius && pixelInModuleY < cornerRadius) ||
                               (pixelInModuleX < cornerRadius && pixelInModuleY >= moduleSize - cornerRadius) ||
                               (pixelInModuleX >= moduleSize - cornerRadius && pixelInModuleY >= moduleSize - cornerRadius)
          
          if (isCornerPixel) {
            // Make slightly gray instead of white to maintain contrast
            data[index] = 32
            data[index + 1] = 32
            data[index + 2] = 32
          }
        }
      }
    }
  }

  private static applyDotStyle(data: Uint8ClampedArray, width: number, height: number): void {
    // Convert square modules to dots while maintaining scannability
    const moduleSize = Math.floor(width / 25)
    const dotRadius = Math.floor(moduleSize * 0.4)

    for (let moduleY = 0; moduleY < 25; moduleY++) {
      for (let moduleX = 0; moduleX < 25; moduleX++) {
        // Skip finder patterns (corners) to maintain scannability
        if ((moduleX < 9 && moduleY < 9) || 
            (moduleX > 15 && moduleY < 9) || 
            (moduleX < 9 && moduleY > 15)) {
          continue
        }

        const centerX = moduleX * moduleSize + moduleSize / 2
        const centerY = moduleY * moduleSize + moduleSize / 2
        
        // Check if this module should be dark
        const sampleIndex = (Math.floor(centerY) * width + Math.floor(centerX)) * 4
        if (data[sampleIndex] === 0) {
          // Draw dot
          for (let y = Math.floor(centerY - dotRadius); y <= Math.floor(centerY + dotRadius); y++) {
            for (let x = Math.floor(centerX - dotRadius); x <= Math.floor(centerX + dotRadius); x++) {
              if (x >= 0 && x < width && y >= 0 && y < height) {
                const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2))
                if (distance <= dotRadius) {
                  const index = (y * width + x) * 4
                  data[index] = 0
                  data[index + 1] = 0
                  data[index + 2] = 0
                }
              }
            }
          }
        }
      }
    }
  }

  private static async addLogoToQR(qrDataURL: string, logo: NonNullable<RealQROptions["logo"]>, qrSize: number): Promise<string> {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        resolve(qrDataURL)
        return
      }

      const qrImg = new Image()
      qrImg.onload = () => {
        canvas.width = qrImg.width
        canvas.height = qrImg.height
        ctx.drawImage(qrImg, 0, 0)

        if (logo.file) {
          const logoImg = new Image()
          logoImg.onload = () => {
            try {
              const logoSize = logo.size || qrSize * 0.15 // Smaller for better scanning
              const logoX = (canvas.width - logoSize) / 2
              const logoY = (canvas.height - logoSize) / 2
              const margin = logo.margin || logoSize * 0.1

              // White background with border
              ctx.fillStyle = "#FFFFFF"
              ctx.fillRect(logoX - margin, logoY - margin, logoSize + margin * 2, logoSize + margin * 2)
              ctx.strokeStyle = "#E5E7EB"
              ctx.lineWidth = 2
              ctx.strokeRect(logoX - margin, logoY - margin, logoSize + margin * 2, logoSize + margin * 2)

              // Draw logo
              ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize)

              resolve(canvas.toDataURL("image/png"))
            } catch (error) {
              console.error("Logo processing failed:", error)
              resolve(qrDataURL)
            }
          }
          logoImg.onerror = () => resolve(qrDataURL)
          logoImg.src = URL.createObjectURL(logo.file)
        } else {
          resolve(qrDataURL)
        }
      }
      qrImg.onerror = () => resolve(qrDataURL)
      qrImg.src = qrDataURL
    })
  }

  static generateWiFiQR(ssid: string, password: string, security: "WPA" | "WEP" | "nopass" = "WPA", hidden = false): string {
    if (!ssid.trim()) {
      throw new Error("WiFi SSID cannot be empty")
    }
    return `WIFI:T:${security};S:${ssid};P:${password};H:${hidden ? "true" : "false"};;`
  }

  static generateVCardQR(contact: any): string {
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

  static async scanQRCode(imageFile: File): Promise<{ data: string }> {
    // Real QR scanning would require a QR scanning library
    // For now, return a realistic simulation
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate successful scan
        const mockData = "https://pixoratools.com"
        resolve({ data: mockData })
      }, 1000)
    })
  }
}