"use client"

import { useState, useEffect, useRef } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { RealQRProcessor } from "@/lib/processors/real-qr-processor"
import { QrCode, Download, Copy, Upload, Eye, EyeOff } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { AdBanner } from "@/components/ads/ad-banner"
import { useSearchParams } from "next/navigation"

const qrStyles = [
  { value: "square", label: "Square", description: "Classic square modules" },
  { value: "rounded", label: "Rounded", description: "Rounded corner modules" },
  { value: "dots", label: "Dots", description: "Circular dot modules" },
  { value: "diamond", label: "Diamond", description: "Diamond shaped modules" },
  { value: "star", label: "Star", description: "Star shaped modules" },
  { value: "heart", label: "Heart", description: "Heart shaped modules" },
  { value: "circle", label: "Circle", description: "Perfect circle modules" },
  { value: "leaf", label: "Leaf", description: "Leaf shaped modules" },
  { value: "classy", label: "Classy", description: "Elegant rounded style" },
  { value: "fluid", label: "Fluid", description: "Smooth flowing style" },
]

const eyeStyles = [
  { value: "square", label: "Square Eyes" },
  { value: "rounded", label: "Rounded Eyes" },
  { value: "leaf", label: "Leaf Eyes" },
  { value: "circle", label: "Circle Eyes" },
  { value: "diamond", label: "Diamond Eyes" },
]

export default function QRCodeGeneratorPage() {
  const searchParams = useSearchParams()
  const initialType = searchParams.get("type") || "text"
  
  const [qrType, setQrType] = useState(initialType)
  const [qrContent, setQrContent] = useState("")
  const [qrDataUrl, setQrDataUrl] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  
  // QR Options
  const [qrSize, setQrSize] = useState(1000)
  const [margin, setMargin] = useState(4)
  const [darkColor, setDarkColor] = useState("#000000")
  const [lightColor, setLightColor] = useState("#ffffff")
  const [errorCorrection, setErrorCorrection] = useState("M")
  
  // Style Options
  const [qrStyle, setQrStyle] = useState("square")
  const [eyeStyle, setEyeStyle] = useState("square")
  const [dataStyle, setDataStyle] = useState("square")
  
  // Logo Options
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoSize, setLogoSize] = useState(15)
  const [logoMargin, setLogoMargin] = useState(10)
  
  // Type-specific data
  const [urlData, setUrlData] = useState("")
  const [textData, setTextData] = useState("")
  const [emailData, setEmailData] = useState({ email: "", subject: "", body: "" })
  const [phoneData, setPhoneData] = useState("")
  const [smsData, setSmsData] = useState({ phone: "", message: "" })
  const [wifiData, setWifiData] = useState({ ssid: "", password: "", security: "WPA", hidden: false })
  const [vcardData, setVcardData] = useState({
    firstName: "", lastName: "", organization: "", phone: "", email: "", url: "", address: ""
  })
  const [eventData, setEventData] = useState({
    title: "", location: "", startDate: "", endDate: "", description: ""
  })
  const [locationData, setLocationData] = useState({ latitude: "", longitude: "" })
  
  const [showPassword, setShowPassword] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    generateQRCode()
  }, [qrType, qrContent, qrSize, margin, darkColor, lightColor, errorCorrection, qrStyle, logoFile, logoSize])

  useEffect(() => {
    updateQRContent()
  }, [qrType, urlData, textData, emailData, phoneData, smsData, wifiData, vcardData, eventData, locationData])

  const updateQRContent = () => {
    let content = ""
    
    switch (qrType) {
      case "url":
        content = urlData
        break
      case "text":
        content = textData
        break
      case "email":
        content = `mailto:${emailData.email}?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`
        break
      case "phone":
        content = `tel:${phoneData}`
        break
      case "sms":
        content = `sms:${smsData.phone}?body=${encodeURIComponent(smsData.message)}`
        break
      case "wifi":
        content = RealQRProcessor.generateWiFiQR(wifiData.ssid, wifiData.password, wifiData.security as any, wifiData.hidden)
        break
      case "vcard":
        content = RealQRProcessor.generateVCardQR(vcardData)
        break
      case "event":
        content = `BEGIN:VEVENT\nSUMMARY:${eventData.title}\n${eventData.location ? `LOCATION:${eventData.location}\n` : ""}DTSTART:${eventData.startDate.replace(/[-:]/g, "")}00Z\n${eventData.endDate ? `DTEND:${eventData.endDate.replace(/[-:]/g, "")}00Z\n` : ""}${eventData.description ? `DESCRIPTION:${eventData.description}\n` : ""}END:VEVENT`
        break
      case "location":
        content = `geo:${locationData.latitude},${locationData.longitude}`
        break
      default:
        content = textData
    }
    
    setQrContent(content)
  }

  const generateQRCode = async () => {
    if (!qrContent.trim()) {
      setQrDataUrl("")
      return
    }

    setIsGenerating(true)
    
    try {
      const qrDataURL = await RealQRProcessor.generateQRCode(qrContent, {
        width: qrSize,
        margin,
        color: { dark: darkColor, light: lightColor },
        errorCorrectionLevel: errorCorrection as any,
        style: {
          shape: qrStyle as any,
          eyeShape: eyeStyle as any,
          dataShape: dataStyle as any
        },
        logo: logoFile ? {
          file: logoFile,
          size: logoSize,
          margin: logoMargin
        } : undefined
      })
      
      setQrDataUrl(qrDataURL)
    } catch (error) {
      console.error("QR generation failed:", error)
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate QR code",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadQR = (format: string) => {
    if (!qrDataUrl) return

    const link = document.createElement("a")
    link.download = `qr-code.${format}`
    link.href = qrDataUrl
    link.click()

    toast({
      title: "Download started",
      description: `QR code downloaded as ${format.toUpperCase()}`
    })
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(qrContent)
    toast({
      title: "Copied to clipboard",
      description: "QR code content copied"
    })
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      setLogoFile(file)
    }
  }

  const renderTypeSpecificInputs = () => {
    switch (qrType) {
      case "url":
        return (
          <div>
            <Label htmlFor="url">Website URL</Label>
            <Input
              id="url"
              type="url"
              value={urlData}
              onChange={(e) => setUrlData(e.target.value)}
              placeholder="https://example.com"
            />
          </div>
        )

      case "text":
        return (
          <div>
            <Label htmlFor="text">Text Content</Label>
            <Textarea
              id="text"
              value={textData}
              onChange={(e) => setTextData(e.target.value)}
              placeholder="Enter your text here..."
              rows={4}
            />
          </div>
        )

      case "email":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={emailData.email}
                onChange={(e) => setEmailData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="contact@example.com"
              />
            </div>
            <div>
              <Label htmlFor="subject">Subject (Optional)</Label>
              <Input
                id="subject"
                value={emailData.subject}
                onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Email subject"
              />
            </div>
            <div>
              <Label htmlFor="body">Message (Optional)</Label>
              <Textarea
                id="body"
                value={emailData.body}
                onChange={(e) => setEmailData(prev => ({ ...prev, body: e.target.value }))}
                placeholder="Email message"
                rows={3}
              />
            </div>
          </div>
        )

      case "phone":
        return (
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={phoneData}
              onChange={(e) => setPhoneData(e.target.value)}
              placeholder="+1234567890"
            />
          </div>
        )

      case "sms":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="sms-phone">Phone Number</Label>
              <Input
                id="sms-phone"
                type="tel"
                value={smsData.phone}
                onChange={(e) => setSmsData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+1234567890"
              />
            </div>
            <div>
              <Label htmlFor="sms-message">Message</Label>
              <Textarea
                id="sms-message"
                value={smsData.message}
                onChange={(e) => setSmsData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Your message here..."
                rows={3}
              />
            </div>
          </div>
        )

      case "wifi":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="wifi-ssid">Network Name (SSID)</Label>
              <Input
                id="wifi-ssid"
                value={wifiData.ssid}
                onChange={(e) => setWifiData(prev => ({ ...prev, ssid: e.target.value }))}
                placeholder="MyWiFiNetwork"
              />
            </div>
            <div>
              <Label htmlFor="wifi-password">Password</Label>
              <div className="relative">
                <Input
                  id="wifi-password"
                  type={showPassword ? "text" : "password"}
                  value={wifiData.password}
                  onChange={(e) => setWifiData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="WiFi password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="wifi-security">Security Type</Label>
              <Select value={wifiData.security} onValueChange={(value) => setWifiData(prev => ({ ...prev, security: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WPA">WPA/WPA2</SelectItem>
                  <SelectItem value="WEP">WEP</SelectItem>
                  <SelectItem value="nopass">No Password</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="wifi-hidden"
                checked={wifiData.hidden}
                onCheckedChange={(checked) => setWifiData(prev => ({ ...prev, hidden: !!checked }))}
              />
              <Label htmlFor="wifi-hidden">Hidden Network</Label>
            </div>
          </div>
        )

      case "vcard":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vcard-first">First Name</Label>
                <Input
                  id="vcard-first"
                  value={vcardData.firstName}
                  onChange={(e) => setVcardData(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="John"
                />
              </div>
              <div>
                <Label htmlFor="vcard-last">Last Name</Label>
                <Input
                  id="vcard-last"
                  value={vcardData.lastName}
                  onChange={(e) => setVcardData(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Doe"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="vcard-org">Organization</Label>
              <Input
                id="vcard-org"
                value={vcardData.organization}
                onChange={(e) => setVcardData(prev => ({ ...prev, organization: e.target.value }))}
                placeholder="Company Name"
              />
            </div>
            <div>
              <Label htmlFor="vcard-phone">Phone</Label>
              <Input
                id="vcard-phone"
                type="tel"
                value={vcardData.phone}
                onChange={(e) => setVcardData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+1234567890"
              />
            </div>
            <div>
              <Label htmlFor="vcard-email">Email</Label>
              <Input
                id="vcard-email"
                type="email"
                value={vcardData.email}
                onChange={(e) => setVcardData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="john@example.com"
              />
            </div>
            <div>
              <Label htmlFor="vcard-url">Website</Label>
              <Input
                id="vcard-url"
                type="url"
                value={vcardData.url}
                onChange={(e) => setVcardData(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://example.com"
              />
            </div>
            <div>
              <Label htmlFor="vcard-address">Address</Label>
              <Textarea
                id="vcard-address"
                value={vcardData.address}
                onChange={(e) => setVcardData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="123 Main St, City, State, ZIP"
                rows={2}
              />
            </div>
          </div>
        )

      case "event":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="event-title">Event Title</Label>
              <Input
                id="event-title"
                value={eventData.title}
                onChange={(e) => setEventData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Meeting Title"
              />
            </div>
            <div>
              <Label htmlFor="event-location">Location</Label>
              <Input
                id="event-location"
                value={eventData.location}
                onChange={(e) => setEventData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Conference Room A"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="event-start">Start Date & Time</Label>
                <Input
                  id="event-start"
                  type="datetime-local"
                  value={eventData.startDate}
                  onChange={(e) => setEventData(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="event-end">End Date & Time</Label>
                <Input
                  id="event-end"
                  type="datetime-local"
                  value={eventData.endDate}
                  onChange={(e) => setEventData(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="event-description">Description</Label>
              <Textarea
                id="event-description"
                value={eventData.description}
                onChange={(e) => setEventData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Event description..."
                rows={3}
              />
            </div>
          </div>
        )

      case "location":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={locationData.latitude}
                  onChange={(e) => setLocationData(prev => ({ ...prev, latitude: e.target.value }))}
                  placeholder="37.7749"
                />
              </div>
              <div>
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={locationData.longitude}
                  onChange={(e) => setLocationData(prev => ({ ...prev, longitude: e.target.value }))}
                  placeholder="-122.4194"
                />
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* QR Tool Navigation */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-wrap gap-2 justify-center">
            <Button variant="default" size="sm" asChild>
              <a href="/qr-code-generator">QR Generator</a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="/wifi-qr-code-generator">WiFi QR</a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="/email-qr-code-generator">Email QR</a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="/vcard-qr-code-generator">vCard QR</a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="/qr-scanner">QR Scanner</a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="/barcode-generator">Barcode</a>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-4">
            <QrCode className="h-8 w-8 text-accent" />
            <h1 className="text-3xl font-heading font-bold text-foreground">QR Code Generator</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Create custom QR codes with logos, colors, and multiple data types. Perfect for marketing and business use.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Left Panel - Configuration */}
          <div className="space-y-6">
            {/* QR Type Selection */}
            <Card>
              <CardHeader>
                <CardTitle>QR Code Type</CardTitle>
                <CardDescription>Choose what type of data to encode</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={qrType} onValueChange={setQrType}>
                  <TabsList className="grid grid-cols-3 lg:grid-cols-4 gap-1">
                    <TabsTrigger value="text">Text</TabsTrigger>
                    <TabsTrigger value="url">URL</TabsTrigger>
                    <TabsTrigger value="email">Email</TabsTrigger>
                    <TabsTrigger value="phone">Phone</TabsTrigger>
                    <TabsTrigger value="sms">SMS</TabsTrigger>
                    <TabsTrigger value="wifi">WiFi</TabsTrigger>
                    <TabsTrigger value="vcard">Contact</TabsTrigger>
                    <TabsTrigger value="event">Event</TabsTrigger>
                    <TabsTrigger value="location">Location</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>

            {/* Content Input */}
            <Card>
              <CardHeader>
                <CardTitle>Content</CardTitle>
                <CardDescription>Enter the data for your QR code</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {renderTypeSpecificInputs()}
              </CardContent>
            </Card>

            {/* Customization */}
            <Card>
              <CardHeader>
                <CardTitle>Customization</CardTitle>
                <CardDescription>Customize appearance and styling</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Size and Margin */}
                <div className="space-y-4">
                  <div>
                    <Label>Size: {qrSize}px</Label>
                    <Slider
                      value={[qrSize]}
                      onValueChange={([value]) => setQrSize(value)}
                      min={200}
                      max={2000}
                      step={50}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Margin: {margin}</Label>
                    <Slider
                      value={[margin]}
                      onValueChange={([value]) => setMargin(value)}
                      min={0}
                      max={10}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                </div>

                {/* Colors */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Foreground Color</Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <input
                        type="color"
                        value={darkColor}
                        onChange={(e) => setDarkColor(e.target.value)}
                        className="w-10 h-8 border rounded cursor-pointer"
                      />
                      <Input
                        value={darkColor}
                        onChange={(e) => setDarkColor(e.target.value)}
                        className="flex-1 font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Background Color</Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <input
                        type="color"
                        value={lightColor}
                        onChange={(e) => setLightColor(e.target.value)}
                        className="w-10 h-8 border rounded cursor-pointer"
                      />
                      <Input
                        value={lightColor}
                        onChange={(e) => setLightColor(e.target.value)}
                        className="flex-1 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Error Correction */}
                <div>
                  <Label>Error Correction Level</Label>
                  <Select value={errorCorrection} onValueChange={setErrorCorrection}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {qrStyles.map((style) => (
                        <SelectItem key={style.value} value={style.value}>
                          <div>
                            <div className="font-medium">{style.label}</div>
                            <div className="text-xs text-muted-foreground">{style.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                      <SelectItem value="H">High (30%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Eye Style</Label>
                  <Select value={eyeStyle} onValueChange={setEyeStyle}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {eyeStyles.map((style) => (
                        <SelectItem key={style.value} value={style.value}>
                          {style.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Style Options */}
                <div className="space-y-4">
                  <div>
                    <Label>QR Style</Label>
                    <Select value={qrStyle} onValueChange={setQrStyle}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="square">Square (Recommended)</SelectItem>
                        <SelectItem value="rounded">Rounded</SelectItem>
                        <SelectItem value="dots">Dots</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Logo Upload */}
                <div className="space-y-4">
                  <Label>Logo (Optional)</Label>
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      onClick={() => logoInputRef.current?.click()}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {logoFile ? logoFile.name : "Upload Logo"}
                    </Button>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    
                    {logoFile && (
                      <div className="space-y-2">
                        <div>
                          <Label>Logo Size: {logoSize}%</Label>
                          <Slider
                            value={[logoSize]}
                            onValueChange={([value]) => setLogoSize(value)}
                            min={5}
                            max={25}
                            step={1}
                            className="mt-2"
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLogoFile(null)}
                        >
                          Remove Logo
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Preview and Download */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>QR Code Preview</CardTitle>
                <CardDescription>Live preview of your QR code</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                {qrDataUrl ? (
                  <div className="space-y-4">
                    <div className="relative inline-block">
                      <img
                        src={qrDataUrl}
                        alt="Generated QR Code"
                        className="mx-auto border rounded-lg shadow-lg bg-white p-4"
                        style={{ maxWidth: "400px", width: "100%" }}
                      />
                      
                      {/* Canvas Ad */}
                      <div className="my-4">
                        <AdBanner 
                          adSlot="qr-generator-canvas"
                          adFormat="auto"
                          className="w-full"
                        />
                      </div>
                      {isGenerating && (
                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 justify-center">
                      <Button onClick={() => downloadQR("png")}>
                        <Download className="h-4 w-4 mr-2" />
                        PNG
                      </Button>
                      <Button variant="outline" onClick={() => downloadQR("svg")}>
                        SVG
                      </Button>
                      <Button variant="outline" onClick={copyToClipboard}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Data
                      </Button>
                    </div>

                    {/* QR Info */}
                    <div className="bg-muted p-3 rounded-lg text-left">
                      <h4 className="font-medium mb-2">QR Code Information</h4>
                      <div className="text-sm space-y-1">
                        <div><strong>Type:</strong> {qrType.toUpperCase()}</div>
                        <div><strong>Size:</strong> {qrSize}×{qrSize}px</div>
                        <div><strong>Error Correction:</strong> {errorCorrection}</div>
                        <div><strong>Data Length:</strong> {qrContent.length} characters</div>
                        {logoFile && <div><strong>Logo:</strong> {logoFile.name}</div>}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-muted-foreground">
                    <QrCode className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Enter content to generate QR code</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Raw Data Preview */}
            {qrContent && (
              <Card>
                <CardHeader>
                  <CardTitle>Raw Data</CardTitle>
                  <CardDescription>The actual data encoded in the QR code</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-3 rounded font-mono text-sm break-all max-h-32 overflow-y-auto">
                    {qrContent}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}