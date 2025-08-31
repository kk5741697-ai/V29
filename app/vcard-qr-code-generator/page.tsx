"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function VCardQRCodeGeneratorPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace("/qr-code-generator?type=vcard")
  }, [router])

  return null
}

export const metadata = {
  title: "vCard QR Code Generator - Create QR Codes for Contact Information",
  description: "Generate QR codes for contact information. Perfect for business cards and networking events.",
  keywords: "vCard QR code, contact QR code, business card QR generator"
}