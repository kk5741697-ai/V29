"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function WiFiQRGeneratorPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace("/qr-code-generator?type=wifi")
  }, [router])
  return null
}