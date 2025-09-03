import { ProductionQRProcessor } from "./production-qr-processor"

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
    return ProductionQRProcessor.generateQRCode(text, {
      width: options.width,
      margin: options.margin,
      color: options.color,
      
      errorCorrectionLevel: options.errorCorrectionLevel,
      style: options.style as any
    })
  }

  static generateWiFiQR(ssid: string, password: string, security: "WPA" | "WEP" | "nopass" = "WPA", hidden = false): string {
    return ProductionQRProcessor.generateWiFiQR(ssid, password, security, hidden)
  }

  static generateVCardQR(contact: any): string {
    return ProductionQRProcessor.generateVCardQR(contact)
  }

  static async scanQRCode(imageFile: File): Promise<QRScanResult> {
    return ProductionQRProcessor.scanQRCode(imageFile)
  }
}