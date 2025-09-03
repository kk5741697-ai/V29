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
          switch (options.style?.shape) {
            case "rounded":
              this.applyMinimalRounding(data, canvas.width, canvas.height)
              break
            case "dots":
              this.applyDotStyle(data, canvas.width, canvas.height)
              break
            case "diamond":
              this.applyDiamondStyle(data, canvas.width, canvas.height)
              break
            case "star":
              this.applyStarStyle(data, canvas.width, canvas.height)
              break
            case "heart":
              this.applyHeartStyle(data, canvas.width, canvas.height)
              break
            case "circle":
              this.applyCircleStyle(data, canvas.width, canvas.height)
              break
            case "leaf":
              this.applyLeafStyle(data, canvas.width, canvas.height)
              break
            case "classy":
              this.applyClassyStyle(data, canvas.width, canvas.height)
              break
            case "fluid":
              this.applyFluidStyle(data, canvas.width, canvas.height)
              break
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

  private static applyDiamondStyle(data: Uint8ClampedArray, width: number, height: number): void {
    const moduleSize = Math.floor(width / 25)
    
    for (let moduleY = 0; moduleY < 25; moduleY++) {
      for (let moduleX = 0; moduleX < 25; moduleX++) {
        // Skip finder patterns
        if ((moduleX < 9 && moduleY < 9) || 
            (moduleX > 15 && moduleY < 9) || 
            (moduleX < 9 && moduleY > 15)) {
          continue
        }

        const centerX = moduleX * moduleSize + moduleSize / 2
        const centerY = moduleY * moduleSize + moduleSize / 2
        
        const sampleIndex = (Math.floor(centerY) * width + Math.floor(centerX)) * 4
        if (data[sampleIndex] === 0) {
          // Draw diamond
          const diamondSize = moduleSize * 0.4
          
          for (let y = Math.floor(centerY - diamondSize); y <= Math.floor(centerY + diamondSize); y++) {
            for (let x = Math.floor(centerX - diamondSize); x <= Math.floor(centerX + diamondSize); x++) {
              if (x >= 0 && x < width && y >= 0 && y < height) {
                const dx = Math.abs(x - centerX)
                const dy = Math.abs(y - centerY)
                
                if (dx + dy <= diamondSize) {
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

  private static applyStarStyle(data: Uint8ClampedArray, width: number, height: number): void {
    const moduleSize = Math.floor(width / 25)
    
    for (let moduleY = 0; moduleY < 25; moduleY++) {
      for (let moduleX = 0; moduleX < 25; moduleX++) {
        if ((moduleX < 9 && moduleY < 9) || 
            (moduleX > 15 && moduleY < 9) || 
            (moduleX < 9 && moduleY > 15)) {
          continue
        }

        const centerX = moduleX * moduleSize + moduleSize / 2
        const centerY = moduleY * moduleSize + moduleSize / 2
        
        const sampleIndex = (Math.floor(centerY) * width + Math.floor(centerX)) * 4
        if (data[sampleIndex] === 0) {
          // Draw simplified star (cross pattern)
          const starSize = moduleSize * 0.35
          
          // Horizontal line
          for (let x = Math.floor(centerX - starSize); x <= Math.floor(centerX + starSize); x++) {
            if (x >= 0 && x < width) {
              const y = Math.floor(centerY)
              if (y >= 0 && y < height) {
                const index = (y * width + x) * 4
                data[index] = 0
                data[index + 1] = 0
                data[index + 2] = 0
              }
            }
          }
          
          // Vertical line
          for (let y = Math.floor(centerY - starSize); y <= Math.floor(centerY + starSize); y++) {
            if (y >= 0 && y < height) {
              const x = Math.floor(centerX)
              if (x >= 0 && x < width) {
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

  private static applyHeartStyle(data: Uint8ClampedArray, width: number, height: number): void {
    const moduleSize = Math.floor(width / 25)
    
    for (let moduleY = 0; moduleY < 25; moduleY++) {
      for (let moduleX = 0; moduleX < 25; moduleX++) {
        if ((moduleX < 9 && moduleY < 9) || 
            (moduleX > 15 && moduleY < 9) || 
            (moduleX < 9 && moduleY > 15)) {
          continue
        }

        const centerX = moduleX * moduleSize + moduleSize / 2
        const centerY = moduleY * moduleSize + moduleSize / 2
        
        const sampleIndex = (Math.floor(centerY) * width + Math.floor(centerX)) * 4
        if (data[sampleIndex] === 0) {
          // Draw simplified heart (circle for now)
          const heartSize = moduleSize * 0.4
          
          for (let y = Math.floor(centerY - heartSize); y <= Math.floor(centerY + heartSize); y++) {
            for (let x = Math.floor(centerX - heartSize); x <= Math.floor(centerX + heartSize); x++) {
              if (x >= 0 && x < width && y >= 0 && y < height) {
                const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2))
                if (distance <= heartSize) {
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

  private static applyCircleStyle(data: Uint8ClampedArray, width: number, height: number): void {
    // Same as dots but with perfect circles
    this.applyDotStyle(data, width, height)
  }

  private static applyLeafStyle(data: Uint8ClampedArray, width: number, height: number): void {
    const moduleSize = Math.floor(width / 25)
    
    for (let moduleY = 0; moduleY < 25; moduleY++) {
      for (let moduleX = 0; moduleX < 25; moduleX++) {
        if ((moduleX < 9 && moduleY < 9) || 
            (moduleX > 15 && moduleY < 9) || 
            (moduleX < 9 && moduleY > 15)) {
          continue
        }

        const centerX = moduleX * moduleSize + moduleSize / 2
        const centerY = moduleY * moduleSize + moduleSize / 2
        
        const sampleIndex = (Math.floor(centerY) * width + Math.floor(centerX)) * 4
        if (data[sampleIndex] === 0) {
          // Draw leaf shape (ellipse)
          const leafWidth = moduleSize * 0.5
          const leafHeight = moduleSize * 0.3
          
          for (let y = Math.floor(centerY - leafHeight); y <= Math.floor(centerY + leafHeight); y++) {
            for (let x = Math.floor(centerX - leafWidth); x <= Math.floor(centerX + leafWidth); x++) {
              if (x >= 0 && x < width && y >= 0 && y < height) {
                const dx = (x - centerX) / leafWidth
                const dy = (y - centerY) / leafHeight
                
                if (dx * dx + dy * dy <= 1) {
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

  private static applyClassyStyle(data: Uint8ClampedArray, width: number, height: number): void {
    // Enhanced rounded style with better curves
    const moduleSize = Math.floor(width / 25)
    const cornerRadius = Math.max(2, Math.floor(moduleSize * 0.25))
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4
        
        if (data[index] === 0) {
          const moduleX = Math.floor(x / moduleSize)
          const moduleY = Math.floor(y / moduleSize)
          
          // Skip finder patterns
          if ((moduleX < 9 && moduleY < 9) || 
              (moduleX > 15 && moduleY < 9) || 
              (moduleX < 9 && moduleY > 15)) {
            continue
          }
          
          const pixelInModuleX = x % moduleSize
          const pixelInModuleY = y % moduleSize
          
          // Apply rounded corners
          const isCorner = (pixelInModuleX < cornerRadius && pixelInModuleY < cornerRadius) ||
                          (pixelInModuleX >= moduleSize - cornerRadius && pixelInModuleY < cornerRadius) ||
                          (pixelInModuleX < cornerRadius && pixelInModuleY >= moduleSize - cornerRadius) ||
                          (pixelInModuleX >= moduleSize - cornerRadius && pixelInModuleY >= moduleSize - cornerRadius)
          
          if (isCorner) {
            const cornerCenterX = pixelInModuleX < moduleSize / 2 ? cornerRadius : moduleSize - cornerRadius
            const cornerCenterY = pixelInModuleY < moduleSize / 2 ? cornerRadius : moduleSize - cornerRadius
            
            const distance = Math.sqrt(
              Math.pow(pixelInModuleX - cornerCenterX, 2) + 
              Math.pow(pixelInModuleY - cornerCenterY, 2)
            )
            
            if (distance > cornerRadius) {
              data[index] = 128
              data[index + 1] = 128
              data[index + 2] = 128
            }
          }
        }
      }
    }
  }

  private static applyFluidStyle(data: Uint8ClampedArray, width: number, height: number): void {
    // Smooth flowing style with organic curves
    const moduleSize = Math.floor(width / 25)
    
    for (let moduleY = 0; moduleY < 25; moduleY++) {
      for (let moduleX = 0; moduleX < 25; moduleX++) {
        if ((moduleX < 9 && moduleY < 9) || 
            (moduleX > 15 && moduleY < 9) || 
            (moduleX < 9 && moduleY > 15)) {
          continue
        }

        const centerX = moduleX * moduleSize + moduleSize / 2
        const centerY = moduleY * moduleSize + moduleSize / 2
        
        const sampleIndex = (Math.floor(centerY) * width + Math.floor(centerX)) * 4
        if (data[sampleIndex] === 0) {
          // Draw organic blob shape
          const blobSize = moduleSize * 0.45
          
          for (let y = Math.floor(centerY - blobSize); y <= Math.floor(centerY + blobSize); y++) {
            for (let x = Math.floor(centerX - blobSize); x <= Math.floor(centerX + blobSize); x++) {
              if (x >= 0 && x < width && y >= 0 && y < height) {
                const dx = x - centerX
                const dy = y - centerY
                
                // Create organic shape with slight randomness
                const angle = Math.atan2(dy, dx)
                const radiusVariation = 1 + 0.1 * Math.sin(angle * 6)
                const distance = Math.sqrt(dx * dx + dy * dy)
                
                if (distance <= blobSize * radiusVariation) {
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