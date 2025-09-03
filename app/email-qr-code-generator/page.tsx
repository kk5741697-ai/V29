"use client"

import { QRToolsLayout } from "@/components/qr-tools-layout"
import { Mail } from "lucide-react"
import { RealQRProcessor } from "@/lib/processors/real-qr-processor"

const emailDataFields = [
  {
    key: "email",
    label: "Email Address",
    type: "text" as const,
    defaultValue: "",
    placeholder: "contact@example.com",
    section: "Email Details",
  },
  {
    key: "subject",
    label: "Subject (Optional)",
    type: "text" as const,
    defaultValue: "",
    placeholder: "Email subject",
    section: "Email Details",
  },
  {
    key: "body",
    label: "Message (Optional)",
    type: "textarea" as const,
    defaultValue: "",
    placeholder: "Email message",
    rows: 3,
    section: "Email Details",
  },
]

const emailExamples = [
  {
    name: "Contact Email",
    data: {
      email: "contact@company.com",
      subject: "Inquiry from QR Code",
      body: "Hello, I scanned your QR code and would like to get in touch."
    }
  },
  {
    name: "Support Email",
    data: {
      email: "support@company.com",
      subject: "Support Request",
      body: "I need help with..."
    }
  },
  {
    name: "Simple Email",
    data: {
      email: "hello@example.com",
      subject: "",
      body: ""
    }
  }
]

async function generateEmailQR(data: any, options: any): Promise<string> {
  const emailString = `mailto:${data.email}?subject=${encodeURIComponent(data.subject || "")}&body=${encodeURIComponent(data.body || "")}`
  return RealQRProcessor.generateQRCode(emailString, options)
}

function validateEmailData(data: any): { isValid: boolean; error?: string } {
  if (!data.email || data.email.trim() === "") {
    return { isValid: false, error: "Email address is required" }
  }
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(data.email)) {
    return { isValid: false, error: "Please enter a valid email address" }
  }
  
  return { isValid: true }
}

export default function EmailQRCodeGeneratorPage() {
  return (
    <QRToolsLayout
      title="Email QR Code Generator"
      description="Create QR codes for email addresses with pre-filled subject and message. Perfect for business cards and contact sharing."
      icon={Mail}
      qrType="Email"
      dataFields={emailDataFields}
      generateFunction={generateEmailQR}
      validateFunction={validateEmailData}
      examples={emailExamples}
    />
  )
}