"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function QRCodeReaderPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace("/qr-scanner")
  }, [router])

  return null
}

export const metadata = {
  title: "QR Code Reader - Scan and Decode QR Codes",
  description: "Read and decode QR codes from images. Upload QR code images to extract and format the contained data.",
  keywords: "QR code reader, QR scanner, decode QR code, read QR code"
}