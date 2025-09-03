"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { BarChart3, Download, Copy, Settings } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { BarcodeProcessor } from "@/lib/barcode-processor"
import { AdBanner } from "@/components/ads/ad-banner"

export default function BarcodeGeneratorPage() {
  const [content, setContent] = useState("123456789012")
  const [barcodeType, setBarcodeType] = useState("CODE128")
  const [width, setWidth] = useState(2)
  const [height, setHeight] = useState(100)
  const [displayValue, setDisplayValue] = useState(true)
  const [fontSize, setFontSize] = useState(20)
  const [textAlign, setTextAlign] = useState("center")
  const [textPosition, setTextPosition] = useState("bottom")
  const [backgroundColor, setBackgroundColor] = useState("#ffffff")
  const [lineColor, setLineColor] = useState("#000000")
  const [barcodeDataUrl, setBarcodeDataUrl] = useState("")

  const barcodeTypes = [
    { value: "CODE128", label: "Code 128", description: "Most versatile, supports all ASCII characters" },
    { value: "EAN13", label: "EAN-13", description: "13-digit European Article Number" },
    { value: "EAN8", label: "EAN-8", description: "8-digit European Article Number" },
    { value: "UPC", label: "UPC-A", description: "12-digit Universal Product Code" },
    { value: "CODE39", label: "Code 39", description: "Alphanumeric barcode" },
    { value: "ITF14", label: "ITF-14", description: "14-digit shipping container code" },
    { value: "MSI", label: "MSI", description: "Modified Plessey code" },
    { value: "pharmacode", label: "Pharmacode", description: "Pharmaceutical binary code" },
    { value: "codabar", label: "Codabar", description: "Used in libraries and blood banks" }
  ]

  useEffect(() => {
    generateBarcode()
  }, [content, barcodeType, width, height, displayValue, fontSize, backgroundColor, lineColor, textAlign, textPosition])

  const generateBarcode = async () => {
    try {
      if (!content.trim()) {
        setBarcodeDataUrl("")
        return
      }

      const barcodeOptions = {
        width,
        height,
        displayValue,
        fontSize,
        textAlign: textAlign as "left" | "center" | "right",
        textPosition: textPosition as "top" | "bottom",
        backgroundColor,
        lineColor,
        margin: 20
      }

      const dataUrl = BarcodeProcessor.generateBarcode(content, barcodeType, barcodeOptions)
      setBarcodeDataUrl(dataUrl)
    } catch (error) {
      console.error("Barcode generation failed:", error)
      setBarcodeDataUrl("")
      toast({
        title: "Barcode generation failed",
        description: error instanceof Error ? error.message : "Please check your input and try again",
        variant: "destructive"
      })
    }
  }

  const downloadBarcode = (format: string) => {
    if (!barcodeDataUrl) {
      toast({
        title: "No barcode to download",
        description: "Please generate a barcode first",
        variant: "destructive"
      })
      return
    }

    const link = document.createElement("a")
    link.download = `barcode.${format}`
    link.href = barcodeDataUrl
    link.click()

    toast({
      title: "Download started",
      description: `Barcode downloaded as ${format.toUpperCase()}`
    })
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content)
    toast({
      title: "Copied to clipboard",
      description: "Barcode content has been copied"
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* QR Tool Navigation */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-wrap gap-2 justify-center">
            <Button variant="outline" size="sm" asChild>
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
            <Button variant="default" size="sm" asChild>
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
            <BarChart3 className="h-8 w-8 text-accent" />
            <h1 className="text-3xl font-heading font-bold text-foreground">Barcode Generator</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Generate professional barcodes in multiple formats including Code 128, EAN-13, UPC, and more.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Content Input */}
          <Card>
            <CardHeader>
              <CardTitle>Barcode Content</CardTitle>
              <CardDescription>Enter the data to encode in your barcode</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="content">Content</Label>
                <Input
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter barcode content"
                />
              </div>

              <div>
                <Label htmlFor="barcode-type">Barcode Type</Label>
                <Select value={barcodeType} onValueChange={setBarcodeType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {barcodeTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-muted-foreground">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Barcode Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Barcode Preview</CardTitle>
              <CardDescription>Live preview of your generated barcode</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              {barcodeDataUrl ? (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border">
                    <img
                      src={barcodeDataUrl}
                      alt="Generated Barcode"
                      className="mx-auto max-w-full h-auto"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </div>
                  
                  {/* Canvas Ad */}
                  <div className="my-4">
                    <AdBanner 
                      adSlot="barcode-canvas"
                      adFormat="auto"
                      className="w-full"
                    />
                  </div>
                  
                  <div className="flex space-x-2 justify-center">
                    <Button onClick={() => downloadBarcode("png")}>
                      <Download className="h-4 w-4 mr-2" />
                      PNG
                    </Button>
                    <Button variant="outline" onClick={() => downloadBarcode("svg")}>
                      <span className="text-xs">SVG</span>
                    </Button>
                    <Button variant="outline" onClick={copyToClipboard}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-muted-foreground">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Enter content to generate barcode</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customization Options */}
          <Card>
            <CardHeader>
              <CardTitle>Customization</CardTitle>
              <CardDescription>Adjust barcode appearance and formatting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="width">Bar Width</Label>
                  <Input
                    id="width"
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(Math.max(1, Math.min(10, Number(e.target.value))))}
                    min={1}
                    max={10}
                  />
                </div>
                <div>
                  <Label htmlFor="height">Bar Height</Label>
                  <Input
                    id="height"
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(Math.max(20, Math.min(200, Number(e.target.value))))}
                    min={20}
                    max={200}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="display-value"
                  checked={displayValue}
                  onCheckedChange={setDisplayValue}
                />
                <Label htmlFor="display-value">Display text below barcode</Label>
              </div>

              {displayValue && (
                <>
                  <div>
                    <Label htmlFor="font-size">Font Size</Label>
                    <Input
                      id="font-size"
                      type="number"
                      value={fontSize}
                      onChange={(e) => setFontSize(Math.max(8, Math.min(48, Number(e.target.value))))}
                      min={8}
                      max={48}
                    />
                  </div>

                  <div>
                    <Label htmlFor="text-align">Text Alignment</Label>
                    <Select value={textAlign} onValueChange={setTextAlign}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="text-position">Text Position</Label>
                    <Select value={textPosition} onValueChange={setTextPosition}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="top">Top</SelectItem>
                        <SelectItem value="bottom">Bottom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bg-color">Background</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-8 h-8 border rounded cursor-pointer"
                    />
                    <Input
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="line-color">Bars Color</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={lineColor}
                      onChange={(e) => setLineColor(e.target.value)}
                      className="w-8 h-8 border rounded cursor-pointer"
                    />
                    <Input
                      value={lineColor}
                      onChange={(e) => setLineColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}