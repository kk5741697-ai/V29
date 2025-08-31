"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function EventQRCodeGeneratorPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace("/qr-code-generator?type=event")
  }, [router])

  return null
}

export const metadata = {
  title: "Event QR Code Generator - Create QR Codes for Calendar Events",
  description: "Generate QR codes for calendar events. Users can scan to add events directly to their calendar.",
  keywords: "event QR code, calendar QR code, meeting QR generator"
}