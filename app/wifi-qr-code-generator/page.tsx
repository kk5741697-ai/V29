"use client"

import { useState, useEffect, useRef } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { 
  Upload, 
  Download, 
  CheckCircle,
  X,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Settings,
  Wifi,
  Eye,
  EyeOff
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { RealQRProcessor } from "@/lib/processors/real-qr-processor"
import { AdBanner } from "@/components/ads/ad-banner"

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

export default function WiFiQRCodeGeneratorPage() {
  const [qrDataUrl, setQrDataUrl] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [showUploadArea, setShowUploadArea] = useState(true)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(100)
  
  // WiFi Data
  const [wifiData, setWifiData] = useState({
    ssid: "",
    password: "",
    security: "WPA",
    hidden: false
  })
  
  // QR Options
  const [qrSize, setQrSize] = useState(1000)
  const [margin, setMargin] = useState(4)
  const [darkColor, setDarkColor] = useState("#000000")
  const [lightColor, setLightColor] = useState("#ffffff")
  const [errorCorrection, setErrorCorrection] = useState("M")
  
  // Style Options
  const [qrStyle, setQrStyle] = useState("square")
  const [eyeStyle, setEyeStyle] = useState("square")
  
  // Logo Options
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoSize, setLogoSize] = useState(15)
  
  const [showPassword, setShowPassword] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    generateQRCode()
  }, [wifiData, qrSize, margin, darkColor, lightColor, errorCorrection, qrStyle, eyeStyle, logoFile, logoSize])

  const generateQRCode = async () => {
    if (!wifiData.ssid.trim()) {
      setQrDataUrl("")
      return
    }

    setIsGenerating(true)
    
    try {
      const wifiString = RealQRProcessor.generateWiFiQR(
        wifiData.ssid, 
        wifiData.password, 
        wifiData.security as any, 
        wifiData.hidden
      )
      
      const qrDataURL = await RealQRProcessor.generateQRCode(wifiString, {
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
      })
      
      setQrDataUrl(qrDataURL)
      setShowUploadArea(false)
    } catch (error) {
      console.error("QR generation failed:", error)
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate WiFi QR code",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadQR = (format: string) => {
    if (!qrDataUrl) return

    const link = document.createElement("a")
    link.download = `wifi-qr-code.${format}`
    link.href = qrDataUrl
    link.click()

    toast({
      title: "Download started",
      description: `WiFi QR code downloaded as ${format.toUpperCase()}`
    })
  }

  const resetTool = () => {
    setWifiData({ ssid: "", password: "", security: "WPA", hidden: false })
    setQrDataUrl("")
    setShowUploadArea(true)
    setIsMobileSidebarOpen(false)
    setLogoFile(null)
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      setLogoFile(file)
    }
  }

  // Mobile Sidebar Component
  const MobileSidebar = () => (
    <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
      <SheetContent side="bottom" className="h-[80vh] p-0">
        <SheetHeader className="px-6 py-4 border-b bg-gray-50">
          <SheetTitle className="flex items-center space-x-2">
            <Wifi className="h-5 w-5 text-green-600" />
            <span>WiFi QR Settings</span>
          </SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="h-full">
          <div className="p-6 space-y-6">
            {/* WiFi Configuration */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="h-px bg-gray-200 flex-1"></div>
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">WiFi Network</Label>
                <div className="h-px bg-gray-200 flex-1"></div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Network Name (SSID)</Label>
                <Input
                  value={wifiData.ssid}
                  onChange={(e) => setWifiData(prev => ({ ...prev, ssid: e.target.value }))}
                  placeholder="MyWiFiNetwork"
                  className="h-10"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={wifiData.password}
                    onChange={(e) => setWifiData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="WiFi password"
                    className="h-10 pr-10"
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
                <Label className="text-sm font-medium">Security Type</Label>
                <Select value={wifiData.security} onValueChange={(value) => setWifiData(prev => ({ ...prev, security: value }))}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WPA">WPA/WPA2</SelectItem>
                    <SelectItem value="WEP">WEP</SelectItem>
                    <SelectItem value="nopass">No Password</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Checkbox
                  checked={wifiData.hidden}
                  onCheckedChange={(checked) => setWifiData(prev => ({ ...prev, hidden: !!checked }))}
                />
                <span className="text-sm">Hidden Network</span>
              </div>
            </div>

            {/* QR Customization */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="h-px bg-gray-200 flex-1"></div>
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">QR Style</Label>
                <div className="h-px bg-gray-200 flex-1"></div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">QR Style</Label>
                <Select value={qrStyle} onValueChange={setQrStyle}>
                  <SelectTrigger className="h-10">
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
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Eye Style</Label>
                <Select value={eyeStyle} onValueChange={setEyeStyle}>
                  <SelectTrigger className="h-10">
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
          </div>
        </ScrollArea>
        
        {/* Mobile Footer */}
        <div className="p-4 border-t bg-white space-y-3">
          <Button 
            onClick={() => {
              generateQRCode()
            }}
            disabled={isGenerating || !wifiData.ssid.trim()}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-base font-semibold"
            size="lg"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <Wifi className="h-4 w-4 mr-2" />
                Generate WiFi QR
              </>
            )}
          </Button>

          {qrDataUrl && (
            <Button 
              onClick={() => downloadQR("png")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-base font-semibold"
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

  // Show upload area if no QR generated
  if (showUploadArea && !qrDataUrl) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-2 lg:py-3">
            <AdBanner 
              adSlot="tool-header-banner"
              adFormat="auto"
              className="max-w-4xl mx-auto"
            />
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 lg:py-8">
          <div className="text-center mb-6 lg:mb-8">
            <div className="inline-flex items-center space-x-2 mb-4">
              <Wifi className="h-6 w-6 lg:h-8 lg:w-8 text-green-600" />
              <h1 className="text-2xl lg:text-3xl font-heading font-bold text-foreground">WiFi QR Code Generator</h1>
            </div>
            <p className="text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Create QR codes for WiFi networks. Users can scan to connect automatically without typing passwords.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-gray-500 p-8 lg:p-16">
              <div className="relative mb-4 lg:mb-6">
                <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl"></div>
                <Wifi className="relative h-16 w-16 lg:h-20 lg:w-20 text-green-500" />
              </div>
              <h3 className="text-xl lg:text-2xl font-semibold mb-2 lg:mb-3 text-gray-700">Configure WiFi Network</h3>
              <p className="text-gray-500 mb-4 lg:mb-6 text-base lg:text-lg text-center">Enter your WiFi details to generate QR code</p>
              <Button 
                onClick={() => setIsMobileSidebarOpen(true)}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 lg:px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Settings className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
                Configure WiFi
              </Button>
            </div>
          </div>
        </div>

        <Footer />
        <MobileSidebar />
      </div>
    )
  }

  // QR Code interface
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Mobile Layout */}
      <div className="lg:hidden">
        <div className="bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2">
            <Wifi className="h-5 w-5 text-green-600" />
            <h1 className="text-lg font-semibold text-gray-900">WiFi QR Generator</h1>
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
              <CardTitle className="text-sm">WiFi QR Code</CardTitle>
            </CardHeader>
            <CardContent>
              {qrDataUrl ? (
                <div className="relative">
                  <div className="qr-preview-container p-4 rounded-lg">
                    <img
                      src={qrDataUrl}
                      alt="WiFi QR Code"
                      className="w-full h-auto object-contain border rounded"
                    />
                  </div>
                  <div className="mt-2 text-xs text-gray-500 text-center">
                    {qrSize}×{qrSize}px • {wifiData.ssid}
                  </div>
                  <div className="absolute top-2 right-2">
                    <CheckCircle className="h-5 w-5 text-green-600 bg-white rounded-full" />
                  </div>
                </div>
              ) : (
                <div className="aspect-square bg-gray-100 rounded border flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Wifi className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">WiFi QR code will appear here</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Canvas Ad */}
          <div className="mt-6">
            <AdBanner 
              adSlot="wifi-qr-canvas"
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
              className="bg-green-600 hover:bg-green-700 text-white py-3"
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
                <Wifi className="h-5 w-5 text-green-600" />
                <h1 className="text-xl font-semibold text-gray-900">WiFi QR Code Generator</h1>
              </div>
              <Badge variant="secondary">WiFi Mode</Badge>
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
                <div className="qr-preview-container p-8 rounded-lg">
                  <img
                    src={qrDataUrl}
                    alt="WiFi QR Code"
                    className="max-w-full max-h-[70vh] object-contain border border-gray-300 rounded-lg shadow-lg bg-white"
                    style={{ 
                      transform: `scale(${Math.min(zoomLevel / 100, 1)})`,
                      transition: "transform 0.2s ease"
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
                  <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl"></div>
                  <Wifi className="relative h-24 w-24 text-green-500 mx-auto" />
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-gray-700">Create WiFi QR Code</h3>
                <p className="text-gray-500 mb-6 text-lg">
                  Configure your WiFi network details to generate QR code
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Right Sidebar */}
        <div className="w-80 xl:w-96 bg-white border-l shadow-lg flex flex-col h-full">
          <div className="px-6 py-4 border-b bg-gray-50 flex-shrink-0">
            <div className="flex items-center space-x-2">
              <Wifi className="h-5 w-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">WiFi Configuration</h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">Configure WiFi network and QR style</p>
          </div>

          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6 space-y-6">
                {/* WiFi Configuration */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="h-px bg-gray-200 flex-1"></div>
                    <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">WiFi Network</Label>
                    <div className="h-px bg-gray-200 flex-1"></div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Network Name (SSID)</Label>
                    <Input
                      value={wifiData.ssid}
                      onChange={(e) => setWifiData(prev => ({ ...prev, ssid: e.target.value }))}
                      placeholder="MyWiFiNetwork"
                      className="h-9"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Password</Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={wifiData.password}
                        onChange={(e) => setWifiData(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="WiFi password"
                        className="h-9 pr-10"
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
                    <Label className="text-sm font-medium">Security Type</Label>
                    <Select value={wifiData.security} onValueChange={(value) => setWifiData(prev => ({ ...prev, security: value }))}>
                      <SelectTrigger className="h-9">
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
                      checked={wifiData.hidden}
                      onCheckedChange={(checked) => setWifiData(prev => ({ ...prev, hidden: !!checked }))}
                    />
                    <span className="text-sm">Hidden Network</span>
                  </div>
                </div>

                {/* QR Customization */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="h-px bg-gray-200 flex-1"></div>
                    <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">QR Style</Label>
                    <div className="h-px bg-gray-200 flex-1"></div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">QR Style</Label>
                    <Select value={qrStyle} onValueChange={setQrStyle}>
                      <SelectTrigger className="h-9">
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
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Eye Style</Label>
                    <Select value={eyeStyle} onValueChange={setEyeStyle}>
                      <SelectTrigger className="h-9">
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

                {/* Sidebar Ad */}
                <AdBanner 
                  adSlot="wifi-qr-sidebar"
                  adFormat="auto"
                  className="w-full"
                />
              </div>
            </ScrollArea>
          </div>

          <div className="p-6 border-t bg-gray-50 space-y-3 flex-shrink-0">
            <Button 
              onClick={generateQRCode}
              disabled={isGenerating || !wifiData.ssid.trim()}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-base font-semibold"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Wifi className="h-4 w-4 mr-2" />
                  Generate WiFi QR
                </>
              )}
            </Button>

            {qrDataUrl && (
              <div className="flex space-x-2">
                <Button 
                  onClick={() => downloadQR("png")}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3"
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
              </div>
            )}

            {/* WiFi Info */}
            {wifiData.ssid && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-green-800 mb-2">WiFi Info</h4>
                <div className="text-xs text-green-700 space-y-1">
                  <div className="flex justify-between">
                    <span>Network:</span>
                    <span className="font-medium">{wifiData.ssid}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Security:</span>
                    <span className="font-medium">{wifiData.security}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hidden:</span>
                    <span className="font-medium">{wifiData.hidden ? "Yes" : "No"}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}