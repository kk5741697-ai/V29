"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function VCardQRGeneratorPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace("/qr-code-generator?type=vcard")
  }, [router])
  return null
}