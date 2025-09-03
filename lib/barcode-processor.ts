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
  static generateBarcode(content: string, type: string, options: BarcodeOptions = {}): string {
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
      
      // Calculate canvas size based on barcode type
      let barsCount = this.calculateBarsCount(content, type)
      
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
        // CODE128 supports all ASCII characters
        if (content.length > 80) {
          throw new Error("Code 128 content too long (max 80 characters)")
        }
        break
    }
  }

  private static calculateBarsCount(content: string, type: string): number {
    switch (type) {
      case "EAN13":
        return 95 // Fixed width for EAN-13
      case "EAN8":
        return 67 // Fixed width for EAN-8
      case "UPC":
        return 95 // Fixed width for UPC
      case "CODE39":
        return content.length * 13 + 25 // Variable width
      case "CODE128":
        return content.length * 11 + 35 // Variable width
      case "ITF14":
        return 14 * 5 + 20 // Fixed width
      default:
        return content.length * 11 + 20 // Default variable width
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
        
        // Checksum (simplified)
        pattern.push(...[1,0,1,1,0,0,1,1,0,1,0])
        
        // Stop pattern
        pattern.push(...[1,1,0,0,1,1,1,0,1,0,1])
        break
        
      case "EAN13":
        // Start guard
        pattern.push(...[1,0,1])
        
        // Left data (6 digits)
        for (let i = 1; i < 7; i++) {
          const digit = parseInt(content[i])
          pattern.push(...this.getEANLeftPattern(digit, i === 1))
        }
        
        // Center guard
        pattern.push(...[0,1,0,1,0])
        
        // Right data (6 digits)
        for (let i = 7; i < 13; i++) {
          const digit = parseInt(content[i])
          pattern.push(...this.getEANRightPattern(digit))
        }
        
        // End guard
        pattern.push(...[1,0,1])
        break
        
      case "EAN8":
        // Start guard
        pattern.push(...[1,0,1])
        
        // Left data (4 digits)
        for (let i = 0; i < 4; i++) {
          const digit = parseInt(content[i])
          pattern.push(...this.getEANLeftPattern(digit, true))
        }
        
        // Center guard
        pattern.push(...[0,1,0,1,0])
        
        // Right data (4 digits)
        for (let i = 4; i < 8; i++) {
          const digit = parseInt(content[i])
          pattern.push(...this.getEANRightPattern(digit))
        }
        
        // End guard
        pattern.push(...[1,0,1])
        break
        
      case "UPC":
        // Similar to EAN13 but with different structure
        pattern.push(...[1,0,1]) // Start
        
        for (let i = 0; i < 6; i++) {
          const digit = parseInt(content[i])
          pattern.push(...this.getEANLeftPattern(digit, true))
        }
        
        pattern.push(...[0,1,0,1,0]) // Center
        
        for (let i = 6; i < 12; i++) {
          const digit = parseInt(content[i])
          pattern.push(...this.getEANRightPattern(digit))
        }
        
        pattern.push(...[1,0,1]) // End
        break
        
      case "CODE39":
        // Start character
        pattern.push(...[1,0,0,1,0,1,1,0,1,0,0,1,0])
        
        for (const char of content) {
          const charPattern = this.getCode39Pattern(char)
          pattern.push(...charPattern)
          pattern.push(0) // Inter-character gap
        }
        
        // Stop character
        pattern.push(...[1,0,0,1,0,1,1,0,1,0,0,1,0])
        break
        
      default:
        // Generic pattern for other types
        for (let i = 0; i < content.length; i++) {
          const char = content.charCodeAt(i)
          const charPattern = char % 2 === 0 ? [1,0,1,1,0,1,0,1] : [1,1,0,1,0,1,1,0]
          pattern.push(...charPattern)
        }
    }
    
    return pattern
  }

  private static getCode128Pattern(charCode: number): number[] {
    // Simplified Code 128 patterns based on ASCII value
    const patterns = [
      [1,1,0,1,1,0,0,1,1,0,0], // Pattern 0
      [1,1,0,0,1,1,0,1,1,0,0], // Pattern 1
      [1,0,0,1,1,0,0,1,1,1,0], // Pattern 2
      [1,0,1,1,0,0,1,1,0,1,0], // Pattern 3
      [1,0,1,0,0,1,1,0,1,1,0], // Pattern 4
      [1,1,0,1,0,1,0,0,1,1,0], // Pattern 5
      [1,1,0,1,0,0,1,0,1,1,0], // Pattern 6
      [1,0,1,1,0,1,0,1,1,0,0], // Pattern 7
    ]
    return patterns[charCode % patterns.length]
  }

  private static getEANLeftPattern(digit: number, isOdd: boolean): number[] {
    const oddPatterns = [
      [0,0,0,1,1,0,1], [0,0,1,1,0,0,1], [0,0,1,0,0,1,1], [0,1,1,1,1,0,1],
      [0,1,0,0,0,1,1], [0,1,1,0,0,0,1], [0,1,0,1,1,1,1], [0,1,1,1,0,1,1],
      [0,1,1,0,1,1,1], [0,0,0,1,0,1,1]
    ]
    const evenPatterns = [
      [0,1,0,0,1,1,1], [0,1,1,0,0,1,1], [0,0,1,1,0,1,1], [0,1,0,0,0,0,1],
      [0,0,1,1,1,0,1], [0,1,1,1,0,0,1], [0,0,0,0,1,0,1], [0,0,1,0,0,0,1],
      [0,0,0,1,0,0,1], [0,0,1,0,1,1,1]
    ]
    
    return isOdd ? oddPatterns[digit] : evenPatterns[digit]
  }

  private static getEANRightPattern(digit: number): number[] {
    const patterns = [
      [1,1,1,0,0,1,0], [1,1,0,0,1,1,0], [1,1,0,1,1,0,0], [1,0,0,0,0,1,0],
      [1,0,1,1,1,0,0], [1,0,0,1,1,1,0], [1,0,1,0,0,0,0], [1,0,0,0,1,0,0],
      [1,0,0,1,0,0,0], [1,1,1,0,1,0,0]
    ]
    return patterns[digit]
  }

  private static getCode39Pattern(char: string): number[] {
    const patterns: Record<string, number[]> = {
      '0': [1,0,1,0,0,1,1,0,1,1,0,1,0],
      '1': [1,1,0,1,0,0,1,0,1,0,1,1,0],
      '2': [1,0,1,1,0,0,1,0,1,0,1,1,0],
      '3': [1,1,0,1,1,0,0,1,0,1,0,1,0],
      '4': [1,0,1,0,0,1,1,0,1,0,1,1,0],
      '5': [1,1,0,1,0,0,1,1,0,1,0,1,0],
      '6': [1,0,1,1,0,0,1,1,0,1,0,1,0],
      '7': [1,0,1,0,0,1,0,1,1,0,1,1,0],
      '8': [1,1,0,1,0,0,1,0,1,1,0,1,0],
      '9': [1,0,1,1,0,0,1,0,1,1,0,1,0],
      'A': [1,1,0,1,0,1,0,0,1,0,1,1,0],
      'B': [1,0,1,1,0,1,0,0,1,0,1,1,0],
      'C': [1,1,0,1,1,0,1,0,0,1,0,1,0],
      'D': [1,0,1,0,1,1,0,0,1,0,1,1,0],
      'E': [1,1,0,1,0,1,1,0,0,1,0,1,0],
      'F': [1,0,1,1,0,1,1,0,0,1,0,1,0],
      ' ': [1,0,1,0,0,1,0,1,0,1,1,0,1],
      '-': [1,0,1,0,0,1,0,1,1,0,1,1,0],
      '.': [1,1,0,1,0,0,1,0,1,0,1,1,0],
      '$': [1,0,1,0,1,0,1,0,1,0,0,1,0],
      '/': [1,0,1,0,1,0,0,1,0,1,0,1,0],
      '+': [1,0,1,0,0,1,0,1,0,1,0,1,0],
      '%': [1,0,0,1,0,1,0,1,0,1,0,1,0],
    }
    
    return patterns[char] || patterns['0']
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
      case "ITF14":
        if (!/^\d{14}$/.test(content)) {
          throw new Error("ITF-14 requires exactly 14 digits")
        }
        break
    }
  }

  private static calculateBarsCount(content: string, type: string): number {
    switch (type) {
      case "EAN13":
        return 95 // Fixed width for EAN-13
      case "EAN8":
        return 67 // Fixed width for EAN-8
      case "UPC":
        return 95 // Fixed width for UPC
      case "CODE39":
        return content.length * 13 + 25 // Variable width
      case "CODE128":
        return content.length * 11 + 35 // Variable width
      case "ITF14":
        return 14 * 5 + 20 // Fixed width
      default:
        return content.length * 11 + 20 // Default variable width
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
        
        // Checksum (simplified)
        pattern.push(...[1,0,1,1,0,0,1,1,0,1,0])
        
        // Stop pattern
        pattern.push(...[1,1,0,0,1,1,1,0,1,0,1])
        break
        
      case "EAN13":
        // Start guard
        pattern.push(...[1,0,1])
        
        // Left data (6 digits)
        for (let i = 1; i < 7; i++) {
          const digit = parseInt(content[i])
          pattern.push(...this.getEANLeftPattern(digit, i === 1))
        }
        
        // Center guard
        pattern.push(...[0,1,0,1,0])
        
        // Right data (6 digits)
        for (let i = 7; i < 13; i++) {
          const digit = parseInt(content[i])
          pattern.push(...this.getEANRightPattern(digit))
        }
        
        // End guard
        pattern.push(...[1,0,1])
        break
        
      case "EAN8":
        // Start guard
        pattern.push(...[1,0,1])
        
        // Left data (4 digits)
        for (let i = 0; i < 4; i++) {
          const digit = parseInt(content[i])
          pattern.push(...this.getEANLeftPattern(digit, true))
        }
        
        // Center guard
        pattern.push(...[0,1,0,1,0])
        
        // Right data (4 digits)
        for (let i = 4; i < 8; i++) {
          const digit = parseInt(content[i])
          pattern.push(...this.getEANRightPattern(digit))
        }
        
        // End guard
        pattern.push(...[1,0,1])
        break
        
      case "UPC":
        // Similar to EAN13 but with different structure
        pattern.push(...[1,0,1]) // Start
        
        for (let i = 0; i < 6; i++) {
          const digit = parseInt(content[i])
          pattern.push(...this.getEANLeftPattern(digit, true))
        }
        
        pattern.push(...[0,1,0,1,0]) // Center
        
        for (let i = 6; i < 12; i++) {
          const digit = parseInt(content[i])
          pattern.push(...this.getEANRightPattern(digit))
        }
        
        pattern.push(...[1,0,1]) // End
        break
        
      case "CODE39":
        // Start character
        pattern.push(...[1,0,0,1,0,1,1,0,1,0,0,1,0])
        
        for (const char of content) {
          const charPattern = this.getCode39Pattern(char)
          pattern.push(...charPattern)
          pattern.push(0) // Inter-character gap
        }
        
        // Stop character
        pattern.push(...[1,0,0,1,0,1,1,0,1,0,0,1,0])
        break
        
      default:
        // Generic pattern for other types
        for (let i = 0; i < content.length; i++) {
          const char = content.charCodeAt(i)
          const charPattern = char % 2 === 0 ? [1,0,1,1,0,1,0,1] : [1,1,0,1,0,1,1,0]
          pattern.push(...charPattern)
        }
    }
    
    return pattern
  }

  private static getCode128Pattern(charCode: number): number[] {
    // Simplified Code 128 patterns based on ASCII value
    const patterns = [
      [1,1,0,1,1,0,0,1,1,0,0], // Pattern 0
      [1,1,0,0,1,1,0,1,1,0,0], // Pattern 1
      [1,0,0,1,1,0,0,1,1,1,0], // Pattern 2
      [1,0,1,1,0,0,1,1,0,1,0], // Pattern 3
      [1,0,1,0,0,1,1,0,1,1,0], // Pattern 4
      [1,1,0,1,0,1,0,0,1,1,0], // Pattern 5
      [1,1,0,1,0,0,1,0,1,1,0], // Pattern 6
      [1,0,1,1,0,1,0,1,1,0,0], // Pattern 7
    ]
    return patterns[charCode % patterns.length]
  }

  private static getEANLeftPattern(digit: number, isOdd: boolean): number[] {
    const oddPatterns = [
      [0,0,0,1,1,0,1], [0,0,1,1,0,0,1], [0,0,1,0,0,1,1], [0,1,1,1,1,0,1],
      [0,1,0,0,0,1,1], [0,1,1,0,0,0,1], [0,1,0,1,1,1,1], [0,1,1,1,0,1,1],
      [0,1,1,0,1,1,1], [0,0,0,1,0,1,1]
    ]
    const evenPatterns = [
      [0,1,0,0,1,1,1], [0,1,1,0,0,1,1], [0,0,1,1,0,1,1], [0,1,0,0,0,0,1],
      [0,0,1,1,1,0,1], [0,1,1,1,0,0,1], [0,0,0,0,1,0,1], [0,0,1,0,0,0,1],
      [0,0,0,1,0,0,1], [0,0,1,0,1,1,1]
    ]
    
    return isOdd ? oddPatterns[digit] : evenPatterns[digit]
  }

  private static getEANRightPattern(digit: number): number[] {
    const patterns = [
      [1,1,1,0,0,1,0], [1,1,0,0,1,1,0], [1,1,0,1,1,0,0], [1,0,0,0,0,1,0],
      [1,0,1,1,1,0,0], [1,0,0,1,1,1,0], [1,0,1,0,0,0,0], [1,0,0,0,1,0,0],
      [1,0,0,1,0,0,0], [1,1,1,0,1,0,0]
    ]
    return patterns[digit]
  }

  private static getCode39Pattern(char: string): number[] {
    const patterns: Record<string, number[]> = {
      '0': [1,0,1,0,0,1,1,0,1,1,0,1,0],
      '1': [1,1,0,1,0,0,1,0,1,0,1,1,0],
      '2': [1,0,1,1,0,0,1,0,1,0,1,1,0],
      '3': [1,1,0,1,1,0,0,1,0,1,0,1,0],
      '4': [1,0,1,0,0,1,1,0,1,0,1,1,0],
      '5': [1,1,0,1,0,0,1,1,0,1,0,1,0],
      '6': [1,0,1,1,0,0,1,1,0,1,0,1,0],
      '7': [1,0,1,0,0,1,0,1,1,0,1,1,0],
      '8': [1,1,0,1,0,0,1,0,1,1,0,1,0],
      '9': [1,0,1,1,0,0,1,0,1,1,0,1,0],
      'A': [1,1,0,1,0,1,0,0,1,0,1,1,0],
      'B': [1,0,1,1,0,1,0,0,1,0,1,1,0],
      'C': [1,1,0,1,1,0,1,0,0,1,0,1,0],
      'D': [1,0,1,0,1,1,0,0,1,0,1,1,0],
      'E': [1,1,0,1,0,1,1,0,0,1,0,1,0],
      'F': [1,0,1,1,0,1,1,0,0,1,0,1,0],
      ' ': [1,0,1,0,0,1,0,1,0,1,1,0,1],
      '-': [1,0,1,0,0,1,0,1,1,0,1,1,0],
      '.': [1,1,0,1,0,0,1,0,1,0,1,1,0],
      '$': [1,0,1,0,1,0,1,0,1,0,0,1,0],
      '/': [1,0,1,0,1,0,0,1,0,1,0,1,0],
      '+': [1,0,1,0,0,1,0,1,0,1,0,1,0],
      '%': [1,0,0,1,0,1,0,1,0,1,0,1,0],
    }
    
    return patterns[char] || patterns['0']
  }
}