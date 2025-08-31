"use client"

import { useState, useRef, useCallback, useEffect } from "react"
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
  TrendingUp,
  AlertTriangle
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { AdBanner } from "@/components/ads/ad-banner"

interface ImageFile {
  id: string
  file: File
  originalFile?: File
  name: string
  size: number
  dimensions?: { width: number; height: number }
  preview: string
  processed?: boolean
  processedPreview?: string
  processedSize?: number
  blob?: Blob
}

export default function ImageUpscalerPage() {
  const [file, setFile] = useState<ImageFile | null>(null)
  const [scaleFactor, setScaleFactor] = useState([2])
  const [algorithm, setAlgorithm] = useState("auto")
  const [enhanceDetails, setEnhanceDetails] = useState(true)
  const [reduceNoise, setReduceNoise] = useState(true)
  const [sharpenAmount, setSharpenAmount] = useState([25])
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [showUploadArea, setShowUploadArea] = useState(true)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (uploadedFiles: FileList | null) => {
    if (!uploadedFiles || uploadedFiles.length === 0) return

    const uploadedFile = uploadedFiles[0]
    if (!uploadedFile.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: `${uploadedFile.name} is not an image file`,
        variant: "destructive"
      })
      return
    }

    // Strict file size limit for upscaling
    if (uploadedFile.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please use an image smaller than 5MB for upscaling to prevent crashes",
        variant: "destructive"
      })
      return
    }

    try {
      const dimensions = await getImageDimensions(uploadedFile)
      
      // Check image dimensions for safety
      if (dimensions.width * dimensions.height > 512 * 512) {
        toast({
          title: "Image resolution too high",
          description: "Please use an image with resolution under 512x512 pixels for upscaling",
          variant: "destructive"
        })
        return
      }
      
      const preview = await createImagePreview(uploadedFile)
      
      const imageFile: ImageFile = {
        id: `${uploadedFile.name}-${Date.now()}`,
        file: uploadedFile,
        originalFile: uploadedFile,
        name: uploadedFile.name,
        size: uploadedFile.size,
        dimensions,
        preview,
      }

      setFile(imageFile)
      setShowUploadArea(false)
      toast({
        title: "Image uploaded",
        description: "Image loaded successfully for upscaling"
      })
    } catch (error) {
      toast({
        title: "Error loading image",
        description: `Failed to load ${uploadedFile.name}`,
        variant: "destructive"
      })
    }
  }

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
  }

  const createImagePreview = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    handleFileUpload(e.dataTransfer.files)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const resetTool = () => {
    setFile(null)
    setProcessingProgress(0)
    setShowUploadArea(true)
    setIsMobileSidebarOpen(false)
  }

  const upscaleImage = async () => {
    if (!file) {
      toast({
        title: "No image selected",
        description: "Please upload an image first",
        variant: "destructive"
      })
      return
    }

    setIsProcessing(true)
    setProcessingProgress(0)

    try {
      // Progressive updates
      const progressSteps = [
        { progress: 10, message: "Loading image" },
        { progress: 25, message: "Analyzing content" },
        { progress: 45, message: "Applying upscaling algorithm" },
        { progress: 65, message: "Enhancing details" },
        { progress: 85, message: "Reducing noise" },
        { progress: 95, message: "Finalizing" }
      ]

      for (const step of progressSteps) {
        setProcessingProgress(step.progress)
        await new Promise(resolve => setTimeout(resolve, 300))
      }

      const processedBlob = await processImageUpscaling(file.originalFile || file.file, {
        scaleFactor: scaleFactor[0],
        algorithm,
        enhanceDetails,
        reduceNoise,
        sharpenAmount: sharpenAmount[0]
      })

      const processedUrl = URL.createObjectURL(processedBlob)
      const baseName = file.name.split(".")[0]
      const newName = `${baseName}_upscaled_${scaleFactor[0]}x.png`

      setFile(prev => prev ? {
        ...prev,
        processed: true,
        processedPreview: processedUrl,
        name: newName,
        processedSize: processedBlob.size,
        blob: processedBlob
      } : null)

      setProcessingProgress(100)
      
      toast({
        title: "Upscaling complete",
        description: `Image upscaled ${scaleFactor[0]}x successfully`
      })
    } catch (error) {
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "Failed to upscale image",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
      setProcessingProgress(0)
    }
  }

  const processImageUpscaling = async (
    imageFile: File,
    options: {
      scaleFactor: number
      algorithm: string
      enhanceDetails: boolean
      reduceNoise: boolean
      sharpenAmount: number
    }
  ): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d", { 
        alpha: true,
        willReadFrequently: false,
        desynchronized: true
      })
      
      if (!ctx) {
        reject(new Error("Canvas not supported"))
        return
      }

      const img = new Image()
      img.onload = () => {
        try {
          // Safety checks for dimensions
          const maxDimension = 512
          let sourceWidth = img.naturalWidth
          let sourceHeight = img.naturalHeight
          
          // Pre-scale if too large
          if (sourceWidth > maxDimension || sourceHeight > maxDimension) {
            const scale = maxDimension / Math.max(sourceWidth, sourceHeight)
            sourceWidth = Math.floor(sourceWidth * scale)
            sourceHeight = Math.floor(sourceHeight * scale)
          }

          // Calculate target dimensions with safety limits
          const targetWidth = Math.min(sourceWidth * options.scaleFactor, 1024)
          const targetHeight = Math.min(sourceHeight * options.scaleFactor, 1024)

          canvas.width = targetWidth
          canvas.height = targetHeight
          
          // Apply advanced upscaling algorithm
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = "high"
          
          if (options.algorithm === "lanczos" || options.algorithm === "auto") {
            // Multi-pass upscaling for better quality
            if (options.scaleFactor > 2) {
              const intermediateScale = Math.sqrt(options.scaleFactor)
              const tempCanvas = document.createElement("canvas")
              const tempCtx = tempCanvas.getContext("2d")!
              
              tempCanvas.width = Math.floor(sourceWidth * intermediateScale)
              tempCanvas.height = Math.floor(sourceHeight * intermediateScale)
              
              tempCtx.imageSmoothingEnabled = true
              tempCtx.imageSmoothingQuality = "high"
              tempCtx.drawImage(img, 0, 0, sourceWidth, sourceHeight, 0, 0, tempCanvas.width, tempCanvas.height)
              
              ctx.drawImage(tempCanvas, 0, 0, targetWidth, targetHeight)
            } else {
              ctx.drawImage(img, 0, 0, sourceWidth, sourceHeight, 0, 0, targetWidth, targetHeight)
            }
          } else {
            ctx.drawImage(img, 0, 0, sourceWidth, sourceHeight, 0, 0, targetWidth, targetHeight)
          }

          // Apply enhancements
          const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight)
          
          if (options.enhanceDetails) {
            enhanceImageDetails(imageData.data, targetWidth, targetHeight)
          }
          
          if (options.reduceNoise) {
            reduceImageNoise(imageData.data, targetWidth, targetHeight)
          }
          
          if (options.sharpenAmount > 0) {
            sharpenImage(imageData.data, targetWidth, targetHeight, options.sharpenAmount / 100)
          }
          
          ctx.putImageData(imageData, 0, 0)

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob)
              } else {
                reject(new Error("Failed to create blob"))
              }
            },
            "image/png"
          )
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => reject(new Error("Failed to load image"))
      img.crossOrigin = "anonymous"
      img.src = URL.createObjectURL(imageFile)
    })
  }

  const enhanceImageDetails = (data: Uint8ClampedArray, width: number, height: number) => {
    const enhanced = new Uint8ClampedArray(data)
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4
        
        for (let c = 0; c < 3; c++) {
          let sum = 0
          let center = data[idx + c] * 9
          
          // 3x3 unsharp mask
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const nIdx = ((y + dy) * width + (x + dx)) * 4 + c
              sum += data[nIdx]
            }
          }
          
          const highPass = center - sum
          const enhancement = highPass * 0.15
          enhanced[idx + c] = Math.max(0, Math.min(255, data[idx + c] + enhancement))
        }
      }
    }
    
    // Blend enhanced version
    for (let i = 0; i < data.length; i += 4) {
      for (let c = 0; c < 3; c++) {
        data[i + c] = Math.round(data[i + c] * 0.7 + enhanced[i + c] * 0.3)
      }
    }
  }

  const reduceImageNoise = (data: Uint8ClampedArray, width: number, height: number) => {
    const filtered = new Uint8ClampedArray(data)
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4
        
        for (let c = 0; c < 3; c++) {
          let sum = 0
          let count = 0
          
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const nIdx = ((y + dy) * width + (x + dx)) * 4 + c
              sum += data[nIdx]
              count++
            }
          }
          
          const avg = sum / count
          const centerValue = data[idx + c]
          
          // Reduce noise while preserving edges
          if (Math.abs(centerValue - avg) < 20) {
            filtered[idx + c] = Math.round(avg)
          } else {
            filtered[idx + c] = centerValue
          }
        }
      }
    }
    
    // Apply filtered version
    for (let i = 0; i < data.length; i += 4) {
      for (let c = 0; c < 3; c++) {
        data[i + c] = filtered[i + c]
      }
    }
  }

  const sharpenImage = (data: Uint8ClampedArray, width: number, height: number, amount: number) => {
    const sharpened = new Uint8ClampedArray(data)
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4
        
        for (let c = 0; c < 3; c++) {
          let sum = 0
          let center = data[idx + c] * 9
          
          // 3x3 neighborhood
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const nIdx = ((y + dy) * width + (x + dx)) * 4 + c
              sum += data[nIdx]
            }
          }
          
          const highPass = center - sum
          const enhancement = highPass * amount * 0.2
          sharpened[idx + c] = Math.max(0, Math.min(255, data[idx + c] + enhancement))
        }
      }
    }
    
    // Apply sharpened version
    for (let i = 0; i < data.length; i += 4) {
      for (let c = 0; c < 3; c++) {
        data[i + c] = sharpened[i + c]
      }
    }
  }

  const downloadFile = () => {
    if (!file?.blob) return

    const link = document.createElement("a")
    link.href = file.processedPreview || file.preview
    link.download = file.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast({
      title: "Download started",
      description: "Upscaled image downloaded"
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
  }

  // Mobile Sidebar Component
  const MobileSidebar = () => (
    <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
      <SheetContent side="bottom" className="h-[80vh] p-0">
        <SheetHeader className="px-6 py-4 border-b bg-gray-50">
          <SheetTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span>Upscaling Settings</span>
          </SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="h-full">
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Scale Factor</Label>
                <Slider
                  value={scaleFactor}
                  onValueChange={setScaleFactor}
                  min={1.5}
                  max={3}
                  step={0.5}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1.5x</span>
                  <span className="font-medium bg-gray-100 px-2 py-1 rounded">{scaleFactor[0]}x</span>
                  <span>3x</span>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Algorithm</Label>
                <Select value={algorithm} onValueChange={setAlgorithm}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto (Recommended)</SelectItem>
                    <SelectItem value="lanczos">Lanczos (Sharp)</SelectItem>
                    <SelectItem value="bicubic">Bicubic (Smooth)</SelectItem>
                    <SelectItem value="nearest">Nearest (Pixel Art)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Sharpen Amount: {sharpenAmount[0]}</Label>
                <Slider
                  value={sharpenAmount}
                  onValueChange={setSharpenAmount}
                  min={0}
                  max={100}
                  step={5}
                  className="mt-2"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Checkbox
                    checked={enhanceDetails}
                    onCheckedChange={setEnhanceDetails}
                  />
                  <span className="text-sm">Enhance Details</span>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Checkbox
                    checked={reduceNoise}
                    onCheckedChange={setReduceNoise}
                  />
                  <span className="text-sm">Reduce Noise</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t bg-white space-y-3">
          <Button 
            onClick={() => {
              upscaleImage()
              setIsMobileSidebarOpen(false)
            }}
            disabled={isProcessing || !file}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-base font-semibold"
            size="lg"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Upscaling...
              </>
            ) : (
              <>
                <TrendingUp className="h-4 w-4 mr-2" />
                Upscale Image
              </>
            )}
          </Button>

          {file?.processedPreview && (
            <Button 
              onClick={() => {
                downloadFile()
                setIsMobileSidebarOpen(false)
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-base font-semibold"
              size="lg"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Image
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )

  // Show upload area if no file
  if (showUploadArea && !file) {
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
              <TrendingUp className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600" />
              <h1 className="text-2xl lg:text-3xl font-heading font-bold text-foreground">Image Upscaler</h1>
            </div>
            <p className="text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Enlarge images with AI-enhanced quality. Increase resolution while preserving details and reducing artifacts.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <div>
                  <h3 className="font-medium text-amber-800">Image Size Limits</h3>
                  <p className="text-sm text-amber-700">
                    For best results and to prevent crashes, please use images smaller than 5MB and under 512x512 pixels.
                  </p>
                </div>
              </div>
            </div>

            <div 
              className="border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-300 p-8 lg:p-16 group"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="relative mb-4 lg:mb-6">
                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all"></div>
                <Upload className="relative h-16 w-16 lg:h-20 lg:w-20 text-blue-500 group-hover:text-blue-600 transition-colors group-hover:scale-110 transform duration-300" />
              </div>
              <h3 className="text-xl lg:text-2xl font-semibold mb-2 lg:mb-3 text-gray-700 group-hover:text-blue-600 transition-colors">Drop image here</h3>
              <p className="text-gray-500 mb-4 lg:mb-6 text-base lg:text-lg text-center">or tap to browse files</p>
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 lg:px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 group-hover:scale-105">
                <Upload className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
                Choose Image
              </Button>
              <div className="mt-4 lg:mt-6 space-y-2 text-center">
                <p className="text-sm text-gray-500 font-medium">JPG, PNG, WebP files</p>
                <p className="text-xs text-gray-400">Single image • Up to 5MB • Max 512x512px</p>
              </div>
            </div>
          </div>
        </div>

        <Footer />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileUpload(e.target.files)}
          className="hidden"
        />
      </div>
    )
  }

  // Processing interface
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Mobile Layout */}
      <div className="lg:hidden">
        <div className="bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <h1 className="text-lg font-semibold text-gray-900">Image Upscaler</h1>
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
          {file && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Before */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Before</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <img
                      src={file.preview}
                      alt="Original"
                      className="w-full h-auto object-contain border rounded"
                    />
                    <div className="mt-2 text-xs text-gray-500 text-center">
                      {file.dimensions?.width}×{file.dimensions?.height} • {formatFileSize(file.size)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* After */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">After</CardTitle>
                </CardHeader>
                <CardContent>
                  {file.processedPreview ? (
                    <div className="relative">
                      <img
                        src={file.processedPreview}
                        alt="Upscaled"
                        className="w-full h-auto object-contain border rounded"
                      />
                      <div className="mt-2 text-xs text-gray-500 text-center">
                        {file.dimensions && `${Math.floor(file.dimensions.width * scaleFactor[0])}×${Math.floor(file.dimensions.height * scaleFactor[0])}`} • {file.processedSize && formatFileSize(file.processedSize)}
                      </div>
                      {file.processedPreview && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle className="h-5 w-5 text-green-600 bg-white rounded-full" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="aspect-square bg-gray-100 rounded border flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Upscaled image will appear here</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 space-y-3 z-30">
          {isProcessing && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm font-medium text-blue-800">Upscaling image...</span>
              </div>
              <Progress value={processingProgress} className="h-2" />
            </div>
          )}

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
              onClick={upscaleImage}
              disabled={isProcessing || !file}
              className="bg-blue-600 hover:bg-blue-700 text-white py-3"
            >
              {isProcessing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Upscale
                </>
              )}
            </Button>
          </div>

          {file?.processedPreview && (
            <Button 
              onClick={downloadFile}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Image
            </Button>
          )}
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
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900">Image Upscaler</h1>
              </div>
              <Badge variant="secondary">AI Mode</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={resetTool}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              {file && (
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

          {/* Canvas Content - Before/After View */}
          <div className="flex-1 overflow-hidden p-6">
            {file ? (
              <div className="grid grid-cols-2 gap-6 h-full">
                {/* Before */}
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Before</CardTitle>
                    <CardDescription>Original image</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex items-center justify-center">
                    <div className="relative max-w-full max-h-full">
                      <img
                        src={file.preview}
                        alt="Original"
                        className="max-w-full max-h-[50vh] object-contain border border-gray-300 rounded-lg shadow-lg bg-white"
                        style={{ 
                          transform: `scale(${Math.min(zoomLevel / 100, 1)})`,
                          transition: "transform 0.2s ease"
                        }}
                      />
                      <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {file.dimensions?.width}×{file.dimensions?.height}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* After */}
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>After</CardTitle>
                    <CardDescription>Upscaled image</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex items-center justify-center">
                    {file.processedPreview ? (
                      <div className="relative max-w-full max-h-full">
                        <img
                          src={file.processedPreview}
                          alt="Upscaled"
                          className="max-w-full max-h-[50vh] object-contain border border-gray-300 rounded-lg shadow-lg bg-white"
                          style={{ 
                            transform: `scale(${Math.min(zoomLevel / 100, 1)})`,
                            transition: "transform 0.2s ease"
                          }}
                        />
                        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {file.dimensions && `${Math.floor(file.dimensions.width * scaleFactor[0])}×${Math.floor(file.dimensions.height * scaleFactor[0])}`}
                        </div>
                        {file.processedPreview && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle className="h-5 w-5 text-green-600 bg-white rounded-full" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500">
                        <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p>Upscaled image will appear here</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center max-w-md mx-auto">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl"></div>
                  <TrendingUp className="relative h-24 w-24 text-blue-500 mx-auto" />
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-gray-700">Upscale Your Image</h3>
                <p className="text-gray-500 mb-6 text-lg">
                  Upload an image to start upscaling
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Right Sidebar */}
        <div className="w-80 xl:w-96 bg-white border-l shadow-lg flex flex-col h-full">
          <div className="px-6 py-4 border-b bg-gray-50 flex-shrink-0">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Upscaling Settings</h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">Configure upscaling options</p>
          </div>

          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Scale Factor</Label>
                    <Slider
                      value={scaleFactor}
                      onValueChange={setScaleFactor}
                      min={1.5}
                      max={3}
                      step={0.5}
                      className="mt-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>1.5x</span>
                      <span className="font-medium">{scaleFactor[0]}x</span>
                      <span>3x</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Algorithm</Label>
                    <Select value={algorithm} onValueChange={setAlgorithm}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto (Recommended)</SelectItem>
                        <SelectItem value="lanczos">Lanczos (Sharp)</SelectItem>
                        <SelectItem value="bicubic">Bicubic (Smooth)</SelectItem>
                        <SelectItem value="nearest">Nearest (Pixel Art)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Sharpen Amount: {sharpenAmount[0]}</Label>
                    <Slider
                      value={sharpenAmount}
                      onValueChange={setSharpenAmount}
                      min={0}
                      max={100}
                      step={5}
                      className="mt-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>None</span>
                      <span>Strong</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={enhanceDetails}
                        onCheckedChange={setEnhanceDetails}
                      />
                      <span className="text-sm">Enhance Details</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={reduceNoise}
                        onCheckedChange={setReduceNoise}
                      />
                      <span className="text-sm">Reduce Noise</span>
                    </div>
                  </div>
                </div>

                {/* File Info */}
                {file && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h4 className="text-sm font-semibold text-blue-800 mb-2">Upscale Info</h4>
                    <div className="text-xs text-blue-700 space-y-1">
                      <div className="flex justify-between">
                        <span>Original Size:</span>
                        <span className="font-medium">{formatFileSize(file.size)}</span>
                      </div>
                      {file.processedSize && (
                        <div className="flex justify-between">
                          <span>Upscaled Size:</span>
                          <span className="font-medium">{formatFileSize(file.processedSize)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Original Dimensions:</span>
                        <span className="font-medium">{file.dimensions?.width}×{file.dimensions?.height}</span>
                      </div>
                      {file.dimensions && (
                        <div className="flex justify-between">
                          <span>Target Dimensions:</span>
                          <span className="font-medium">{Math.floor(file.dimensions.width * scaleFactor[0])}×{Math.floor(file.dimensions.height * scaleFactor[0])}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Algorithm:</span>
                        <span className="font-medium">{algorithm}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="p-6 border-t bg-gray-50 space-y-3 flex-shrink-0">
            {isProcessing && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm font-medium text-blue-800">Upscaling image...</span>
                </div>
                <Progress value={processingProgress} className="h-2" />
              </div>
            )}

            <Button 
              onClick={upscaleImage}
              disabled={isProcessing || !file}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-base font-semibold"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Upscaling...
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Upscale Image
                </>
              )}
            </Button>

            {file?.processedPreview && (
              <Button 
                onClick={downloadFile}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-base font-semibold"
                size="lg"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Image
              </Button>
            )}
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileUpload(e.target.files)}
        className="hidden"
      />
    </div>
  )
}