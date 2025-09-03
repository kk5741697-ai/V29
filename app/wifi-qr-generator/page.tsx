"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function WiFiQRGeneratorPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace("/wifi-qr-code-generator")
  }, [router])
  return null
}