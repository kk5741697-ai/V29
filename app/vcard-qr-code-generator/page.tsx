"use client"

import { QRToolsLayout } from "@/components/qr-tools-layout"
import { User } from "lucide-react"
import { RealQRProcessor } from "@/lib/processors/real-qr-processor"

const vcardDataFields = [
  {
    key: "firstName",
    label: "First Name",
    type: "text" as const,
    defaultValue: "",
    placeholder: "John",
    section: "Contact Info",
  },
  {
    key: "lastName",
    label: "Last Name",
    type: "text" as const,
    defaultValue: "",
    placeholder: "Doe",
    section: "Contact Info",
  },
  {
    key: "organization",
    label: "Organization",
    type: "text" as const,
    defaultValue: "",
    placeholder: "Company Name",
    section: "Contact Info",
  },
  {
    key: "phone",
    label: "Phone",
    type: "text" as const,
    defaultValue: "",
    placeholder: "+1234567890",
    section: "Contact Info",
  },
  {
    key: "email",
    label: "Email",
    type: "text" as const,
    defaultValue: "",
    placeholder: "john@example.com",
    section: "Contact Info",
  },
  {
    key: "url",
    label: "Website",
    type: "text" as const,
    defaultValue: "",
    placeholder: "https://example.com",
    section: "Contact Info",
  },
  {
    key: "address",
    label: "Address",
    type: "textarea" as const,
    defaultValue: "",
    placeholder: "123 Main St, City, State, ZIP",
    rows: 2,
    section: "Contact Info",
  },
]

const vcardExamples = [
  {
    name: "Business Card",
    data: {
      firstName: "John",
      lastName: "Smith",
      organization: "Tech Solutions Inc",
      phone: "+1-555-123-4567",
      email: "john.smith@techsolutions.com",
      url: "https://techsolutions.com",
      address: "123 Business Ave, Tech City, TC 12345"
    }
  },
  {
    name: "Personal Contact",
    data: {
      firstName: "Jane",
      lastName: "Doe",
      organization: "",
      phone: "+1-555-987-6543",
      email: "jane.doe@email.com",
      url: "",
      address: ""
    }
  },
  {
    name: "Freelancer",
    data: {
      firstName: "Alex",
      lastName: "Designer",
      organization: "Creative Studio",
      phone: "+1-555-456-7890",
      email: "alex@creativestudio.com",
      url: "https://alexdesigner.com",
      address: "456 Creative St, Design City, DC 67890"
    }
  }
]

async function generateVCardQR(data: any, options: any): Promise<string> {
  const vcardString = RealQRProcessor.generateVCardQR(data)
  return RealQRProcessor.generateQRCode(vcardString, options)
}

function validateVCardData(data: any): { isValid: boolean; error?: string } {
  if ((!data.firstName || data.firstName.trim() === "") && 
      (!data.lastName || data.lastName.trim() === "") && 
      (!data.email || data.email.trim() === "")) {
    return { isValid: false, error: "Please provide at least a name or email address" }
  }
  
  // Validate email if provided
  if (data.email && data.email.trim() !== "") {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      return { isValid: false, error: "Please enter a valid email address" }
    }
  }
  
  return { isValid: true }
}

export default function VCardQRCodeGeneratorPage() {
  return (
    <QRToolsLayout
      title="vCard QR Code Generator"
      description="Create QR codes for contact information. Perfect for business cards and networking events."
      icon={User}
      qrType="Contact"
      dataFields={vcardDataFields}
      generateFunction={generateVCardQR}
      validateFunction={validateVCardData}
      examples={vcardExamples}
    />
  )
}