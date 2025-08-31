"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function BatchQRGeneratorPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace("/bulk-qr-generator")
  }, [router])

  return null
}

export const metadata = {
  title: "Batch QR Code Generator - Generate Multiple QR Codes",
  description: "Generate multiple QR codes at once from CSV data or text lists. Perfect for bulk operations and batch processing.",
  keywords: "batch QR generator, bulk QR codes, multiple QR codes, CSV QR generator"
}