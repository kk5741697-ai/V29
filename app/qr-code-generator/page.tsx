"use client"

import { QRToolsLayout } from "@/components/qr-tools-layout"
import { QrCode } from "lucide-react"
import { RealQRProcessor } from "@/lib/processors/real-qr-processor"

const qrDataFields = [
  {
    key: "qrType",
    label: "QR Code Type",
    type: "select" as const,
    defaultValue: "text",
    selectOptions: [
      { value: "text", label: "Text" },
      { value: "url", label: "URL" },
      { value: "email", label: "Email" },
      { value: "phone", label: "Phone" },
      { value: "sms", label: "SMS" },
      { value: "wifi", label: "WiFi" },
      { value: "vcard", label: "Contact" },
      { value: "event", label: "Event" },
      { value: "location", label: "Location" },
    ],
    section: "QR Type",
  },
  {
    key: "content",
    label: "Content",
    type: "textarea" as const,
    defaultValue: "",
    placeholder: "Enter your content here...",
    rows: 4,
    section: "Content",
    condition: (data) => data.qrType === "text"
  },
  {
    key: "url",
    label: "Website URL",
    type: "text" as const,
    defaultValue: "",
    placeholder: "https://example.com",
    section: "Content",
    condition: (data) => data.qrType === "url"
  },
  {
    key: "email",
    label: "Email Address",
    type: "text" as const,
    defaultValue: "",
    placeholder: "contact@example.com",
    section: "Content",
    condition: (data) => data.qrType === "email"
  },
  {
    key: "phone",
    label: "Phone Number",
    type: "text" as const,
    defaultValue: "",
    placeholder: "+1234567890",
    section: "Content",
    condition: (data) => data.qrType === "phone"
  },
]

const qrExamples = [
  {
    name: "Website URL",
    data: {
      qrType: "url",
      url: "https://pixoratools.com",
      content: ""
    }
  },
  {
    name: "Contact Email",
    data: {
      qrType: "email",
      email: "contact@pixoratools.com",
      content: ""
    }
  },
  {
    name: "Simple Text",
    data: {
      qrType: "text",
      content: "Hello, World! This is a QR code with text content.",
      url: "",
      email: "",
      phone: ""
    }
  }
]

async function generateQR(data: any, options: any): Promise<string> {
  let content = ""
  
  switch (data.qrType) {
    case "url":
      content = data.url || ""
      break
    case "email":
      content = `mailto:${data.email || ""}`
      break
    case "phone":
      content = `tel:${data.phone || ""}`
      break
    case "text":
    default:
      content = data.content || ""
      break
  }
  
  if (!content.trim()) {
    throw new Error("Please enter content for the QR code")
  }
  
  return RealQRProcessor.generateQRCode(content, options)
}

function validateQRData(data: any): { isValid: boolean; error?: string } {
  switch (data.qrType) {
    case "url":
      if (!data.url || data.url.trim() === "") {
        return { isValid: false, error: "URL is required" }
      }
      try {
        new URL(data.url)
      } catch {
        return { isValid: false, error: "Please enter a valid URL" }
      }
      break
    case "email":
      if (!data.email || data.email.trim() === "") {
        return { isValid: false, error: "Email address is required" }
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(data.email)) {
        return { isValid: false, error: "Please enter a valid email address" }
      }
      break
    case "phone":
      if (!data.phone || data.phone.trim() === "") {
        return { isValid: false, error: "Phone number is required" }
      }
      break
    case "text":
      if (!data.content || data.content.trim() === "") {
        return { isValid: false, error: "Text content is required" }
      }
      break
  }
  
  return { isValid: true }
}

export default function QRCodeGeneratorPage() {
  return (
    <QRToolsLayout
      title="QR Code Generator"
      description="Create custom QR codes with logos, colors, and multiple data types. Perfect for marketing and business use."
      icon={QrCode}
      qrType="QR"
      dataFields={qrDataFields}
      generateFunction={generateQR}
      validateFunction={validateQRData}
      examples={qrExamples}
    />
  )
}