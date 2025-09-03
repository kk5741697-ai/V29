"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { 
  Upload, 
  Download, 
  CheckCircle,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Settings,
  QrCode,
  Copy
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { RealQRProcessor } from "@/lib/processors/real-qr-processor"
import { AdBanner } from "@/components/ads/ad-banner"

interface ToolOption {
  key: string
  label: string
  type: "text" | "textarea" | "select" | "checkbox" | "slider" | "color" | "file"
  defaultValue: any
  min?: number
  max?: number
  step?: number
  selectOptions?: Array<{ value: string; label: string }>
  section?: string
  condition?: (options: any) => boolean
  placeholder?: string
  rows?: number
}

interface QRToolsLayoutProps {
  title: string
  description: string
  icon: any
  qrType: string
  dataFields: ToolOption[]
  styleOptions?: ToolOption[]
  generateFunction: (data: any, options: any) => Promise<string>
  validateFunction?: (data: any) => { isValid: boolean; error?: string }
  examples?: Array<{ name: string; data: any }>
}

export function QRToolsLayout({
  title,
  description,
  icon: Icon,
  qrType,
  dataFields,
  styleOptions = [],
  generateFunction,
  validateFunction,
  examples = []
}: QRToolsLayoutProps) {
  const [qrDataUrl, setQrDataUrl] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(100)
  
  // Data state
  const [qrData, setQrData] = useState<Record<string, any>>({})
  
  // Style options state
  const [qrSize, setQrSize] = useState(1000)
  const [margin, setMargin] = useState(4)
  const [darkColor, setDarkColor] = useState("#000000")
  const [lightColor, setLightColor] = useState("#ffffff")
  const [errorCorrection, setErrorCorrection] = useState("M")
  const [qrStyle, setQrStyle] = useState("square")
  const [eyeStyle, setEyeStyle] = useState("square")
  
  // Logo options
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoSize, setLogoSize] = useState(15)
  
  const logoInputRef = useRef<HTMLInputElement>(null)

  // Initialize data fields with defaults
  useEffect(() => {
    const defaultData: Record<string, any> = {}
    dataFields.forEach(field => {
      defaultData[field.key] = field.defaultValue
    })
    setQrData(defaultData)
  }, [dataFields])

  // Generate QR code when data or options change
  useEffect(() => {
    generateQRCode()
  }, [qrData, qrSize, margin, darkColor, lightColor, errorCorrection, qrStyle, eyeStyle, logoFile, logoSize])

  const generateQRCode = async () => {
    // Validate data first
    if (validateFunction) {
      const validation = validateFunction(qrData)
      if (!validation.isValid) {
        setQrDataUrl("")
        return
      }
    }

    // Check if required fields are filled
    const hasRequiredData = dataFields.some(field => 
      qrData[field.key] && qrData[field.key].toString().trim() !== ""
    )

    if (!hasRequiredData) {
      setQrDataUrl("")
      return
    }

    setIsGenerating(true)
    
    try {
      const qrOptions = {
        width: qrSize,
        margin,
        color: { dark: darkColor, light: lightColor },
        errorCorrectionLevel: errorCorrection as any,
        style: {
          shape: qrStyle as any,
          eyeShape: eyeStyle as any,
        },
        logo: logoFile ? {
          file: logoFile,
          size: logoSize,
        } : undefined
      }
      
      const qrDataURL = await generateFunction(qrData, qrOptions)
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
    link.download = `${qrType}-qr-code.${format}`
    link.href = qrDataUrl
    link.click()

    toast({
      title: "Download started",
      description: `${title} downloaded as ${format.toUpperCase()}`
    })
  }

  const copyQRData = () => {
    const dataString = JSON.stringify(qrData, null, 2)
    navigator.clipboard.writeText(dataString)
    toast({
      title: "Copied to clipboard",
      description: "QR code data copied"
    })
  }

  const resetTool = () => {
    const defaultData: Record<string, any> = {}
    dataFields.forEach(field => {
      defaultData[field.key] = field.defaultValue
    })
    setQrData(defaultData)
    setQrDataUrl("")
    setIsMobileSidebarOpen(false)
    setLogoFile(null)
  }

  const loadExample = (exampleData: any) => {
    setQrData(exampleData)
    setIsMobileSidebarOpen(false)
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      setLogoFile(file)
    }
  }

  const updateQRData = (key: string, value: any) => {
    setQrData(prev => ({ ...prev, [key]: value }))
  }

  // Mobile Sidebar Component
  const MobileSidebar = () => (
    <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
      <SheetContent side="bottom" className="h-[85vh] p-0">
        <SheetHeader className="px-6 py-4 border-b bg-gray-50">
          <SheetTitle className="flex items-center space-x-2">
            <Icon className="h-5 w-5 text-blue-600" />
            <span>{title} Settings</span>
          </SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="h-full">
          <div className="p-6 space-y-6">
            {/* Data Fields */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="h-px bg-gray-200 flex-1"></div>
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{qrType} Data</Label>
                <div className="h-px bg-gray-200 flex-1"></div>
              </div>
              
              {dataFields.map((field) => {
                if (field.condition && !field.condition(qrData)) {
                  return null
                }

                return (
                  <div key={field.key} className="space-y-2">
                    <Label className="text-sm font-medium">{field.label}</Label>
                    
                    {field.type === "text" && (
                      <Input
                        value={qrData[field.key] || ""}
                        onChange={(e) => updateQRData(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className="h-10"
                      />
                    )}

                    {field.type === "textarea" && (
                      <Textarea
                        value={qrData[field.key] || ""}
                        onChange={(e) => updateQRData(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        rows={field.rows || 3}
                      />
                    )}

                    {field.type === "select" && (
                      <Select
                        value={qrData[field.key]?.toString() || field.defaultValue?.toString()}
                        onValueChange={(value) => updateQRData(field.key, value)}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {field.selectOptions?.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {field.type === "checkbox" && (
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Checkbox
                          checked={qrData[field.key] || false}
                          onCheckedChange={(checked) => updateQRData(field.key, checked)}
                        />
                        <span className="text-sm">{field.label}</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Style Options */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="h-px bg-gray-200 flex-1"></div>
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">QR Style</Label>
                <div className="h-px bg-gray-200 flex-1"></div>
              </div>
              
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

              {/* Logo Upload */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Logo (Optional)</Label>
                <Button
                  variant="outline"
                  onClick={() => logoInputRef.current?.click()}
                  className="w-full h-10"
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

              {/* Examples */}
              {examples.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Examples</Label>
                  <div className="space-y-2">
                    {examples.map((example, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        onClick={() => loadExample(example.data)}
                        className="w-full h-auto p-3 text-left justify-start"
                      >
                        <div>
                          <div className="font-medium text-sm">{example.name}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
        
        {/* Mobile Footer */}
        <div className="p-4 border-t bg-white space-y-3 flex-shrink-0">
          <Button 
            onClick={generateQRCode}
            disabled={isGenerating}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-base font-semibold"
            size="lg"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <Icon className="h-4 w-4 mr-2" />
                Generate QR Code
              </>
            )}
          </Button>

          {qrDataUrl && (
            <Button 
              onClick={() => downloadQR("png")}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-base font-semibold"
              size="lg"
            >
              <Download className="h-4 w-4 mr-2" />
              Download QR Code
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )

  // Direct QR Code interface - no upload area
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

      {/* Mobile Layout */}
      <div className="lg:hidden">
        <div className="bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2">
            <Icon className="h-5 w-5 text-blue-600" />
            <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={resetTool}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-4 min-h-[60vh]">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{title}</CardTitle>
            </CardHeader>
            <CardContent>
              {qrDataUrl ? (
                <div className="relative">
                  <div className="bg-white p-4 rounded-lg border">
                    <img
                      src={qrDataUrl}
                      alt={`${title} QR Code`}
                      className="w-full h-auto object-contain max-w-full max-h-[400px] mx-auto"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </div>
                  <div className="mt-2 text-xs text-gray-500 text-center">
                    {qrSize}×{qrSize}px
                  </div>
                  <div className="absolute top-2 right-2">
                    <CheckCircle className="h-5 w-5 text-green-600 bg-white rounded-full" />
                  </div>
                </div>
              ) : (
                <div className="aspect-square bg-gray-100 rounded border flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <QrCode className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Configure {qrType.toLowerCase()} to generate QR code</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Canvas Ad */}
          <div className="mt-6">
            <AdBanner 
              adSlot={`${qrType}-qr-canvas`}
              adFormat="auto"
              className="w-full"
              mobileOptimized={true}
            />
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 space-y-3 z-30">
          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={() => setIsMobileSidebarOpen(true)}
              variant="outline"
              className="py-3"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            
            <Button 
              onClick={() => downloadQR("png")}
              disabled={!qrDataUrl}
              className="bg-blue-600 hover:bg-blue-700 text-white py-3"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>

        <MobileSidebar />
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex h-[calc(100vh-8rem)] w-full overflow-hidden">
        {/* Left Canvas */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-white border-b px-6 py-3 flex items-center justify-between shadow-sm flex-shrink-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Icon className="h-5 w-5 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
              </div>
              <Badge variant="secondary">{qrType} Mode</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={resetTool}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              {qrDataUrl && (
                <div className="flex items-center space-x-1 border rounded-md">
                  <Button variant="ghost" size="sm" onClick={() => setZoomLevel(prev => Math.max(25, prev - 25))}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm px-2">{zoomLevel}%</span>
                  <Button variant="ghost" size="sm" onClick={() => setZoomLevel(prev => Math.min(400, prev + 25))}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setZoomLevel(100)}>
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Canvas Content */}
          <div className="flex-1 overflow-hidden flex items-center justify-center p-6">
            {qrDataUrl ? (
              <div className="relative max-w-full max-h-full">
                <div className="bg-white p-8 rounded-lg border shadow-lg">
                  <img
                    src={qrDataUrl}
                    alt={`${title} QR Code`}
                    className="max-w-full max-h-[70vh] object-contain mx-auto"
                    style={{ 
                      transform: `scale(${Math.min(zoomLevel / 100, 1)})`,
                      transition: "transform 0.2s ease",
                      imageRendering: 'pixelated'
                    }}
                  />
                </div>
                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {qrSize}×{qrSize}px
                </div>
                <div className="absolute top-2 right-2">
                  <CheckCircle className="h-5 w-5 text-green-600 bg-white rounded-full" />
                </div>
              </div>
            ) : (
              <div className="text-center max-w-md mx-auto">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl"></div>
                  <Icon className="relative h-24 w-24 text-blue-500 mx-auto" />
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-gray-700">Create {qrType} QR Code</h3>
                <p className="text-gray-500 mb-6 text-lg">
                  Configure your {qrType.toLowerCase()} details to generate QR code
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Right Sidebar */}
        <div className="w-80 xl:w-96 bg-white border-l shadow-lg flex flex-col h-full">
          <div className="px-6 py-4 border-b bg-gray-50 flex-shrink-0">
            <div className="flex items-center space-x-2">
              <Icon className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">{qrType} Configuration</h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">Configure {qrType.toLowerCase()} data and QR style</p>
          </div>

          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6 space-y-6">
                {/* Data Fields */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="h-px bg-gray-200 flex-1"></div>
                    <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{qrType} Data</Label>
                    <div className="h-px bg-gray-200 flex-1"></div>
                  </div>
                  
                  {dataFields.map((field) => {
                    if (field.condition && !field.condition(qrData)) {
                      return null
                    }

                    return (
                      <div key={field.key} className="space-y-2">
                        <Label className="text-sm font-medium">{field.label}</Label>
                        
                        {field.type === "text" && (
                          <Input
                            value={qrData[field.key] || ""}
                            onChange={(e) => updateQRData(field.key, e.target.value)}
                            placeholder={field.placeholder}
                            className="h-9"
                          />
                        )}

                        {field.type === "textarea" && (
                          <Textarea
                            value={qrData[field.key] || ""}
                            onChange={(e) => updateQRData(field.key, e.target.value)}
                            placeholder={field.placeholder}
                            rows={field.rows || 3}
                          />
                        )}

                        {field.type === "select" && (
                          <Select
                            value={qrData[field.key]?.toString() || field.defaultValue?.toString()}
                            onValueChange={(value) => updateQRData(field.key, value)}
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {field.selectOptions?.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}

                        {field.type === "checkbox" && (
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={qrData[field.key] || false}
                              onCheckedChange={(checked) => updateQRData(field.key, checked)}
                            />
                            <span className="text-sm">{field.label}</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Style Options */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="h-px bg-gray-200 flex-1"></div>
                    <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">QR Style</Label>
                    <div className="h-px bg-gray-200 flex-1"></div>
                  </div>
                  
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

                  <div className="grid grid-cols-2 gap-3">
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

                  {/* Logo Upload */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Logo (Optional)</Label>
                    <Button
                      variant="outline"
                      onClick={() => logoInputRef.current?.click()}
                      className="w-full h-9"
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

                  {/* Examples */}
                  {examples.length > 0 && (
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Examples</Label>
                      <div className="space-y-2">
                        {examples.map((example, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            onClick={() => loadExample(example.data)}
                            className="w-full h-auto p-3 text-left justify-start"
                          >
                            <div>
                              <div className="font-medium text-sm">{example.name}</div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sidebar Ad */}
                <AdBanner 
                  adSlot={`${qrType}-qr-sidebar`}
                  adFormat="auto"
                  className="w-full"
                />
              </div>
            </ScrollArea>
          </div>

          <div className="p-6 border-t bg-gray-50 space-y-3 flex-shrink-0">
            <Button 
              onClick={generateQRCode}
              disabled={isGenerating}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-base font-semibold"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Icon className="h-4 w-4 mr-2" />
                  Generate QR Code
                </>
              )}
            </Button>

            {qrDataUrl && (
              <div className="flex space-x-2">
                <Button 
                  onClick={() => downloadQR("png")}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3"
                >
                  <Download className="h-4 w-4 mr-2" />
                  PNG
                </Button>
                <Button 
                  onClick={() => downloadQR("svg")}
                  variant="outline"
                  className="flex-1"
                >
                  SVG
                </Button>
                <Button 
                  onClick={copyQRData}
                  variant="outline"
                  className="flex-1"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}