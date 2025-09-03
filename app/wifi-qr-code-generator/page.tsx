"use client"

import { QRToolsLayout } from "@/components/qr-tools-layout"
import { Wifi } from "lucide-react"
import { RealQRProcessor } from "@/lib/processors/real-qr-processor"

const wifiDataFields = [
  {
    key: "ssid",
    label: "Network Name (SSID)",
    type: "text" as const,
    defaultValue: "",
    placeholder: "MyWiFiNetwork",
    section: "WiFi Network",
  },
  {
    key: "password",
    label: "Password",
    type: "text" as const,
    defaultValue: "",
    placeholder: "WiFi password",
    section: "WiFi Network",
  },
  {
    key: "security",
    label: "Security Type",
    type: "select" as const,
    defaultValue: "WPA",
    selectOptions: [
      { value: "WPA", label: "WPA/WPA2" },
      { value: "WEP", label: "WEP" },
      { value: "nopass", label: "No Password" },
    ],
    section: "WiFi Network",
  },
  {
    key: "hidden",
    label: "Hidden Network",
    type: "checkbox" as const,
    defaultValue: false,
    section: "WiFi Network",
  },
]

const wifiExamples = [
  {
    name: "Home WiFi",
    data: {
      ssid: "MyHomeWiFi",
      password: "mypassword123",
      security: "WPA",
      hidden: false
    }
  },
  {
    name: "Guest Network",
    data: {
      ssid: "GuestNetwork",
      password: "",
      security: "nopass",
      hidden: false
    }
  },
  {
    name: "Office WiFi",
    data: {
      ssid: "OfficeSecure",
      password: "CompanyPass2024!",
      security: "WPA",
      hidden: true
    }
  }
]

async function generateWiFiQR(data: any, options: any): Promise<string> {
  const wifiString = RealQRProcessor.generateWiFiQR(
    data.ssid, 
    data.password, 
    data.security as any, 
    data.hidden
  )
  
  return RealQRProcessor.generateQRCode(wifiString, options)
}

function validateWiFiData(data: any): { isValid: boolean; error?: string } {
  if (!data.ssid || data.ssid.trim() === "") {
    return { isValid: false, error: "Network name (SSID) is required" }
  }
  
  if (data.security !== "nopass" && (!data.password || data.password.trim() === "")) {
    return { isValid: false, error: "Password is required for secured networks" }
  }
  
  return { isValid: true }
}

export default function WiFiQRCodeGeneratorPage() {
  return (
    <QRToolsLayout
      title="WiFi QR Code Generator"
      description="Create QR codes for WiFi networks. Users can scan to connect automatically without typing passwords."
      icon={Wifi}
      qrType="WiFi"
      dataFields={wifiDataFields}
      generateFunction={generateWiFiQR}
      validateFunction={validateWiFiData}
      examples={wifiExamples}
    />
  )
}