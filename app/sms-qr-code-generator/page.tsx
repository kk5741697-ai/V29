"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function SMSQRCodeGeneratorPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace("/qr-code-generator?type=sms")
  }, [router])

  return null
}

export const metadata = {
  title: "SMS QR Code Generator - Create QR Codes for Text Messages",
  description: "Generate QR codes for SMS messages with pre-filled text. Perfect for marketing campaigns and quick messaging.",
  keywords: "SMS QR code, text message QR code, messaging QR generator"
}