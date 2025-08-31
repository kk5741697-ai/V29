"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function WiFiQRCodeGeneratorPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace("/qr-code-generator?type=wifi")
  }, [router])

  return null
}

export const metadata = {
  title: "WiFi QR Code Generator - Create QR Codes for WiFi Networks",
  description: "Generate QR codes for WiFi networks. Users can scan to connect automatically without typing passwords.",
  keywords: "WiFi QR code, wireless QR code, network QR generator"
}