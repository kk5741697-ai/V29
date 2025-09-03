"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { QrCode } from "lucide-react"
import { Download, Copy, Upload, RefreshCw } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { QRProcessor } from "@/lib/qr-processor"
import { AdBanner } from "@/components/ads/ad-banner"

export default function QRCodeGeneratorPage() {
  const [qrType, setQrType] = useState("text")
  const [content, setContent] = useState("")
  const [url, setUrl] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [qrSize, setQrSize] = useState(1000)
  const [margin, setMargin] = useState(4)
  const [darkColor, setDarkColor] = useState("#000000")
  const [lightColor, setLightColor] = useState("#ffffff")
  const [errorCorrection, setErrorCorrection] = useState("M")
  const [qrDataUrl, setQrDataUrl] = useState("")
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoSize, setLogoSize] = useState(15)
  
  const logoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    generateQRCode()
  }, [qrType, content, url, email, phone, qrSize, margin, darkColor, lightColor, errorCorrection, logoFile, logoSize])

  const generateQRCode = async () => {
    try {
      let qrContent = ""
      
      switch (qrType) {
        case "url":
          qrContent = url
          break
        case "email":
          qrContent = `mailto:${email}`
          break
        case "phone":
          qrContent = `tel:${phone}`
          break
        case "text":
        default:
          qrContent = content
          break
      }
      
      if (!qrContent.trim()) {
        setQrDataUrl("")
        return
      }
      
      const qrOptions = {
        width: qrSize,
        margin,
        color: { dark: darkColor, light: lightColor },
        errorCorrectionLevel: errorCorrection as any
      }
      
      const qrDataURL = await QRProcessor.generateQRCode(qrContent, qrOptions)
      setQrDataUrl(qrDataURL)
    } catch (error) {
      console.error("QR generation failed:", error)
      setQrDataUrl("")
      toast({
        title: "QR generation failed",
        description: error instanceof Error ? error.message : "Failed to generate QR code",
        variant: "destructive"
      })
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

  const copyQRData = () => {
    const dataString = JSON.stringify({ qrType, content, url, email, phone }, null, 2)
    navigator.clipboard.writeText(dataString)
    toast({
      title: "Copied to clipboard",
      description: "QR code data copied"
    })
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      setLogoFile(file)
    }
  }

  const loadExample = (exampleType: string) => {
    switch (exampleType) {
      case "url":
        setQrType("url")
        setUrl("https://pixoratools.com")
        break
      case "email":
        setQrType("email")
        setEmail("contact@pixoratools.com")
        break
      case "text":
        setQrType("text")
        setContent("Hello, World! This is a QR code with text content.")
        break
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

      {/* Top Ad Banner */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-2 lg:py-3">
          <AdBanner 
            adSlot="tool-header-banner"
            adFormat="auto"
            className="max-w-4xl mx-auto"
          />
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Content Input */}
          <Card>
            <CardHeader>
              <CardTitle>QR Code Content</CardTitle>
              <CardDescription>Enter the data to encode in your QR code</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="qr-type">QR Code Type</Label>
                <Select value={qrType} onValueChange={setQrType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="url">URL</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {qrType === "text" && (
                <div>
                  <Label htmlFor="content">Text Content</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter your text here..."
                    rows={4}
                  />
                </div>
              )}

              {qrType === "url" && (
                <div>
                  <Label htmlFor="url">Website URL</Label>
                  <Input
                    id="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
              )}

              {qrType === "email" && (
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@example.com"
                  />
                </div>
              )}

              {qrType === "phone" && (
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1234567890"
                  />
                </div>
              )}

              <div className="pt-4 border-t">
                <Label className="text-sm font-medium">Examples</Label>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  <Button
                    variant="outline"
                    onClick={() => loadExample("url")}
                    className="justify-start"
                  >
                    Website URL
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => loadExample("email")}
                    className="justify-start"
                  >
                    Contact Email
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => loadExample("text")}
                    className="justify-start"
                  >
                    Simple Text
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* QR Code Preview */}
          <Card>
            <CardHeader>
              <CardTitle>QR Code Preview</CardTitle>
              <CardDescription>Live preview of your generated QR code</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              {qrDataUrl ? (
                <div className="space-y-4">
                  <div className="qr-preview-container p-4 rounded-lg">
                    <img
                      src={qrDataUrl}
                      alt="Generated QR Code"
                      className="mx-auto max-w-full h-auto"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </div>
                  
                  {/* Canvas Ad */}
                  <div className="my-4">
                    <AdBanner 
                      adSlot="qr-canvas"
                      adFormat="auto"
                      className="w-full"
                    />
                  </div>
                  
                  <div className="flex space-x-2 justify-center">
                    <Button onClick={() => downloadQR("png")}>
                      <Download className="h-4 w-4 mr-2" />
                      PNG
                    </Button>
                    <Button variant="outline" onClick={() => downloadQR("svg")}>
                      SVG
                    </Button>
                    <Button variant="outline" onClick={copyQRData}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
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

          {/* Customization Options */}
          <Card>
            <CardHeader>
              <CardTitle>Customization</CardTitle>
              <CardDescription>Adjust QR code appearance and styling</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Size: {qrSize}px</Label>
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
                <Label className="text-sm font-medium">Margin: {margin}</Label>
                <Slider
                  value={[margin]}
                  onValueChange={([value]) => setMargin(value)}
                  min={0}
                  max={10}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">Foreground</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <input
                      type="color"
                      value={darkColor}
                      onChange={(e) => setDarkColor(e.target.value)}
                      className="w-8 h-8 border rounded cursor-pointer"
                    />
                    <Input
                      value={darkColor}
                      onChange={(e) => setDarkColor(e.target.value)}
                      className="flex-1 font-mono text-xs"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm">Background</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <input
                      type="color"
                      value={lightColor}
                      onChange={(e) => setLightColor(e.target.value)}
                      className="w-8 h-8 border rounded cursor-pointer"
                    />
                    <Input
                      value={lightColor}
                      onChange={(e) => setLightColor(e.target.value)}
                      className="flex-1 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="error-correction">Error Correction</Label>
                <Select value={errorCorrection} onValueChange={setErrorCorrection}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">Low (7%)</SelectItem>
                    <SelectItem value="M">Medium (15%)</SelectItem>
                    <SelectItem value="Q">Quartile (25%)</SelectItem>
                    <SelectItem value="H">High (30%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Logo (Optional)</Label>
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
                  <div>
                    <Label className="text-sm font-medium">Logo Size: {logoSize}%</Label>
                    <Slider
                      value={[logoSize]}
                      onValueChange={([value]) => setLogoSize(value)}
                      min={5}
                      max={25}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}