"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function EmailQRCodeGeneratorPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace("/qr-code-generator?type=email")
  }, [router])

  return null
}

export const metadata = {
  title: "Email QR Code Generator - Create QR Codes for Email",
  description: "Generate QR codes for email addresses with pre-filled subject and message. Perfect for contact forms and business cards.",
  keywords: "email QR code, mailto QR code, contact QR generator"
}