export interface BarcodeOptions {
  width?: number
  height?: number
  displayValue?: boolean
  fontSize?: number
  textAlign?: "left" | "center" | "right"
  textPosition?: "top" | "bottom"
  backgroundColor?: string
  lineColor?: string
  margin?: number
}

export class BarcodeProcessor {
  static async generateBarcode(content: string, type: string, options: BarcodeOptions = {}): Promise<string> {
    try {
      if (!content.trim()) {
        throw new Error("Barcode content cannot be empty")
      }

      // Validate content based on barcode type
      this.validateBarcodeContent(content, type)

      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")!
      
      const barWidth = Math.max(1, options.width || 2)
      const barHeight = Math.max(20, options.height || 100)
      const textHeight = options.displayValue ? (options.fontSize || 20) + 10 : 0
      const margin = Math.max(0, options.margin || 20)
      
      // Calculate canvas size
      const barsCount = this.calculateBarsCount(content, type)
      
      canvas.width = barsCount * barWidth + margin * 2
      canvas.height = barHeight + textHeight + margin * 2

      // Background
      ctx.fillStyle = options.backgroundColor || "#ffffff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Generate barcode pattern
      ctx.fillStyle = options.lineColor || "#000000"
      let x = margin

      const pattern = this.generateBarcodePattern(content, type)
      
      pattern.forEach((bar) => {
        if (bar === 1) {
          ctx.fillRect(x, margin, barWidth, barHeight)
        }
        x += barWidth
      })

      // Add text if enabled
      if (options.displayValue) {
        ctx.fillStyle = options.lineColor || "#000000"
        ctx.font = `${options.fontSize || 20}px monospace`
        ctx.textAlign = options.textAlign as CanvasTextAlign || "center"
        
        const textX = options.textAlign === "center" ? canvas.width / 2 : 
                     options.textAlign === "right" ? canvas.width - margin : margin
        const textY = options.textPosition === "top" ? (options.fontSize || 20) + margin : canvas.height - margin
        
        ctx.fillText(content, textX, textY)
      }

      return canvas.toDataURL("image/png")
    } catch (error) {
      console.error("Barcode generation failed:", error)
      throw new Error("Failed to generate barcode")
    }
  }

  private static validateBarcodeContent(content: string, type: string): void {
    switch (type) {
      case "EAN13":
        if (!/^\d{13}$/.test(content)) {
          throw new Error("EAN-13 requires exactly 13 digits")
        }
        break
      case "EAN8":
        if (!/^\d{8}$/.test(content)) {
          throw new Error("EAN-8 requires exactly 8 digits")
        }
        break
      case "UPC":
        if (!/^\d{12}$/.test(content)) {
          throw new Error("UPC requires exactly 12 digits")
        }
        break
      case "CODE39":
        if (!/^[A-Z0-9\-. $\/+%]+$/.test(content)) {
          throw new Error("Code 39 supports only uppercase letters, numbers, and specific symbols")
        }
        break
      case "CODE128":
        if (content.length > 80) {
          throw new Error("Code 128 content too long (max 80 characters)")
        }
        break
    }
  }

  private static calculateBarsCount(content: string, type: string): number {
    switch (type) {
      case "EAN13":
        return 95
      case "EAN8":
        return 67
      case "UPC":
        return 95
      case "CODE39":
        return content.length * 13 + 25
      case "CODE128":
        return content.length * 11 + 35
      default:
        return content.length * 11 + 20
    }
  }

  private static generateBarcodePattern(content: string, type: string): number[] {
    const pattern: number[] = []
    
    switch (type) {
      case "CODE128":
        // Start pattern
        pattern.push(...[1,1,0,1,0,1,1,0])
        
        // Data patterns
        for (let i = 0; i < content.length; i++) {
          const char = content.charCodeAt(i)
          const charPattern = this.getCode128Pattern(char)
          pattern.push(...charPattern)
        }
        
        // Stop pattern
        pattern.push(...[1,1,0,0,1,1,1,0,1,0,1])
        break
        
      default:
        // Generic pattern
        for (let i = 0; i < content.length; i++) {
          const char = content.charCodeAt(i)
          const charPattern = char % 2 === 0 ? [1,0,1,1,0,1,0,1] : [1,1,0,1,0,1,1,0]
          pattern.push(...charPattern)
        }
    }
    
    return pattern
  }

  private static getCode128Pattern(charCode: number): number[] {
    const patterns = [
      [1,1,0,1,1,0,0,1,1,0,0],
      [1,1,0,0,1,1,0,1,1,0,0],
      [1,0,0,1,1,0,0,1,1,1,0],
      [1,0,1,1,0,0,1,1,0,1,0],
      [1,0,1,0,0,1,1,0,1,1,0],
      [1,1,0,1,0,1,0,0,1,1,0],
      [1,1,0,1,0,0,1,0,1,1,0],
      [1,0,1,1,0,1,0,1,1,0,0],
    ]
    return patterns[charCode % patterns.length]
  }
}