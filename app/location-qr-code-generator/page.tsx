"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LocationQRCodeGeneratorPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace("/qr-code-generator?type=location")
  }, [router])

  return null
}

export const metadata = {
  title: "Location QR Code Generator - Create QR Codes for GPS Coordinates",
  description: "Generate QR codes for locations and GPS coordinates. Users can scan to open in maps applications.",
  keywords: "location QR code, GPS QR code, map QR generator"
}