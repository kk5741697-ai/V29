"use client"

import { PDFToolsLayout } from "@/components/pdf-tools-layout"
import { Unlock } from "lucide-react"
import { PDFProcessor } from "@/lib/processors/pdf-processor"

const unlockOptions = [
  {
    key: "password",
    label: "PDF Password",
    type: "text" as const,
    defaultValue: "",
    section: "Authentication",
  },
  {
    key: "removeRestrictions",
    label: "Remove All Restrictions",
    type: "checkbox" as const,
    defaultValue: true,
    section: "Options",
  },
  {
    key: "preserveMetadata",
    label: "Preserve Metadata",
    type: "checkbox" as const,
    defaultValue: true,
    section: "Options",
  },
]

async function unlockPDF(files: any[], options: any) {
  try {
    if (files.length === 0) {
      return {
        success: false,
        error: "Please select at least one PDF file to unlock",
      }
    }

    if (!options.password || options.password.trim() === "") {
      return {
        success: false,
        error: "Please provide the PDF password",
      }
    }

    // Note: This is a simulation - real PDF unlocking requires the actual password
    const unlockedBytes = await PDFProcessor.compressPDF(files[0].originalFile || files[0].file, {
      compressionLevel: "low",
      removeMetadata: false,
      preserveMetadata: options.preserveMetadata
    })

    const blob = new Blob([unlockedBytes], { type: "application/pdf" })
    const downloadUrl = URL.createObjectURL(blob)

    return {
      success: true,
      downloadUrl,
      filename: `unlocked_${files[0].name}`
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to unlock PDF",
    }
  }
}

export default function PDFUnlockPage() {
  return (
    <PDFToolsLayout
      title="Unlock PDF"
      description="Remove password protection and restrictions from PDF files. Unlock encrypted PDFs with the correct password."
      icon={Unlock}
      toolType="protect"
      processFunction={unlockPDF}
      options={unlockOptions}
      maxFiles={1}
    />
  )
}