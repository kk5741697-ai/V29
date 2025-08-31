"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function URLQRCodeGeneratorPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace("/qr-code-generator?type=url")
  }, [router])

  return null
}

export const metadata = {
  title: "URL QR Code Generator - Create QR Codes for Websites",
  description: "Generate QR codes for URLs and websites. Create custom QR codes that link directly to your website or any URL.",
  keywords: "URL QR code, website QR code, link QR generator, QR code for website"
}