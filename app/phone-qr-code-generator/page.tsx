"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function PhoneQRCodeGeneratorPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace("/qr-code-generator?type=phone")
  }, [router])

  return null
}

export const metadata = {
  title: "Phone QR Code Generator - Create QR Codes for Phone Numbers",
  description: "Generate QR codes for phone numbers. Users can scan to call directly without typing the number.",
  keywords: "phone QR code, call QR code, telephone QR generator"
}