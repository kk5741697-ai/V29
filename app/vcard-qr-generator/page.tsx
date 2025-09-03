"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function VCardQRGeneratorPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace("/vcard-qr-code-generator")
  }, [router])
  return null
}