"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function TextQRCodeGeneratorPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace("/qr-code-generator?type=text")
  }, [router])

  return null
}

export const metadata = {
  title: "Text QR Code Generator - Create QR Codes for Text",
  description: "Generate QR codes for plain text content. Perfect for sharing messages, notes, and information.",
  keywords: "text QR code, message QR code, plain text QR generator"
}