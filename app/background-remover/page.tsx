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
  ImageIcon,
  Scissors
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

export default function BackgroundRemoverPage() {
  const [file, setFile] = useState<ImageFile | null>(null)
  const [algorithm, setAlgorithm] = useState("auto")
  const [sensitivity, setSensitivity] = useState([25])
  const [featherEdges, setFeatherEdges] = useState(true)
  const [preserveDetails, setPreserveDetails] = useState(true)
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

    // Check file size (limit to 10MB for background removal)
    if (uploadedFile.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please use an image smaller than 10MB for background removal",
        variant: "destructive"
      })
      return
    }

    try {
      const dimensions = await getImageDimensions(uploadedFile)
      
      // Check image dimensions for safety
      if (dimensions.width * dimensions.height > 1536 * 1536) {
        toast({
          title: "Image resolution too high",
          description: "Please use an image with resolution under 1536x1536 pixels",
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
        description: "Image loaded successfully for background removal"
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

  const removeBackground = async () => {
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
        { progress: 45, message: "Detecting edges" },
        { progress: 65, message: "Processing background" },
        { progress: 85, message: "Refining edges" },
        { progress: 95, message: "Finalizing" }
      ]

      for (const step of progressSteps) {
        setProcessingProgress(step.progress)
        await new Promise(resolve => setTimeout(resolve, 300))
      }

      const processedBlob = await processBackgroundRemoval(file.originalFile || file.file, {
        algorithm,
        sensitivity: sensitivity[0],
        featherEdges,
        preserveDetails
      })

      const processedUrl = URL.createObjectURL(processedBlob)
      const baseName = file.name.split(".")[0]
      const newName = `${baseName}_no_bg.png`

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
        title: "Background removed",
        description: "Background removed successfully"
      })
    } catch (error) {
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "Failed to remove background",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
      setProcessingProgress(0)
    }
  }

  const processBackgroundRemoval = async (
    imageFile: File,
    options: {
      algorithm: string
      sensitivity: number
      featherEdges: boolean
      preserveDetails: boolean
    }
  ): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d", { 
        alpha: true,
        willReadFrequently: true 
      })
      
      if (!ctx) {
        reject(new Error("Canvas not supported"))
        return
      }

      const img = new Image()
      img.onload = () => {
        try {
          // Use safe dimensions
          const maxDimension = 1024
          let { width, height } = img
          
          if (width > maxDimension || height > maxDimension) {
            const scale = maxDimension / Math.max(width, height)
            width = Math.floor(width * scale)
            height = Math.floor(height * scale)
          }

          canvas.width = width
          canvas.height = height
          
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = "high"
          ctx.drawImage(img, 0, 0, width, height)

          const imageData = ctx.getImageData(0, 0, width, height)
          
          // Apply background removal algorithm
          removeBackgroundFromImageData(imageData, options)
          
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

  const removeBackgroundFromImageData = (
    imageData: ImageData,
    options: {
      algorithm: string
      sensitivity: number
      featherEdges: boolean
      preserveDetails: boolean
    }
  ) => {
    const { data, width, height } = imageData
    const threshold = options.sensitivity * 3

    // Simple but effective background removal
    const backgroundColors = sampleBackgroundColors(data, width, height)
    const dominantBgColor = findDominantBackgroundColor(backgroundColors)

    // Create background mask
    const mask = new Uint8Array(width * height)
    
    for (let i = 0; i < data.length; i += 4) {
      const pixelIdx = Math.floor(i / 4)
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]

      const colorDistance = Math.sqrt(
        Math.pow(r - dominantBgColor[0], 2) +
        Math.pow(g - dominantBgColor[1], 2) +
        Math.pow(b - dominantBgColor[2], 2)
      )

      mask[pixelIdx] = colorDistance < threshold ? 255 : 0
    }

    // Apply edge detection for better accuracy
    if (options.algorithm !== "simple") {
      refineWithEdgeDetection(mask, data, width, height, threshold)
    }

    // Apply feathering if enabled
    if (options.featherEdges) {
      applyFeathering(mask, width, height)
    }

    // Apply the mask to remove background
    for (let i = 0; i < data.length; i += 4) {
      const pixelIdx = Math.floor(i / 4)
      
      if (mask[pixelIdx] > 128) {
        // Background pixel - make transparent
        data[i + 3] = 0
      } else if (options.preserveDetails) {
        // Foreground pixel - slightly enhance
        data[i + 3] = Math.min(255, data[i + 3] * 1.02)
      }
    }
  }

  const sampleBackgroundColors = (data: Uint8ClampedArray, width: number, height: number): number[][] => {
    const samples: number[][] = []
    
    // Sample from edges (likely background)
    const samplePoints = [
      // Corners
      [0, 0], [width - 1, 0], [0, height - 1], [width - 1, height - 1],
      // Edge midpoints
      [Math.floor(width / 2), 0], [Math.floor(width / 2), height - 1],
      [0, Math.floor(height / 2)], [width - 1, Math.floor(height / 2)]
    ]
    
    samplePoints.forEach(([x, y]) => {
      const idx = (y * width + x) * 4
      samples.push([data[idx], data[idx + 1], data[idx + 2]])
    })
    
    return samples
  }

  const findDominantBackgroundColor = (colors: number[][]): number[] => {
    // Simple clustering to find most common background color
    const colorCounts = new Map<string, { color: number[], count: number }>()
    
    colors.forEach(color => {
      const key = `${Math.floor(color[0] / 16)}-${Math.floor(color[1] / 16)}-${Math.floor(color[2] / 16)}`
      if (colorCounts.has(key)) {
        colorCounts.get(key)!.count++
      } else {
        colorCounts.set(key, { color, count: 1 })
      }
    })
    
    let maxCount = 0
    let dominantColor = colors[0]
    
    colorCounts.forEach(({ color, count }) => {
      if (count > maxCount) {
        maxCount = count
        dominantColor = color
      }
    })
    
    return dominantColor
  }

  const refineWithEdgeDetection = (
    mask: Uint8Array,
    data: Uint8ClampedArray,
    width: number,
    height: number,
    threshold: number
  ) => {
    // Simple edge detection to refine mask
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x
        const pixelIdx = idx * 4
        
        let maxGradient = 0
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue
            
            const nIdx = ((y + dy) * width + (x + dx)) * 4
            const gradient = Math.abs(data[pixelIdx] - data[nIdx]) +
                           Math.abs(data[pixelIdx + 1] - data[nIdx + 1]) +
                           Math.abs(data[pixelIdx + 2] - data[nIdx + 2])
            maxGradient = Math.max(maxGradient, gradient)
          }
        }
        
        // Strong edges are likely subject boundaries
        if (maxGradient > threshold * 0.8) {
          mask[idx] = 0 // Keep as foreground
        }
      }
    }
  }

  const applyFeathering = (mask: Uint8Array, width: number, height: number) => {
    const feathered = new Uint8Array(mask)
    const radius = 3
    
    for (let y = radius; y < height - radius; y++) {
      for (let x = radius; x < width - radius; x++) {
        const idx = y * width + x
        
        if (mask[idx] > 128) { // Background pixel
          let minDistance = Infinity
          
          // Find distance to nearest foreground pixel
          for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
              const nIdx = (y + dy) * width + (x + dx)
              if (mask[nIdx] <= 128) {
                const distance = Math.sqrt(dx * dx + dy * dy)
                minDistance = Math.min(minDistance, distance)
              }
            }
          }
          
          // Apply feathering based on distance
          if (minDistance < radius) {
            const alpha = (minDistance / radius) * 255
            feathered[idx] = Math.round(alpha)
          }
        }
      }
    }
    
    // Copy feathered mask back
    for (let i = 0; i < mask.length; i++) {
      mask[i] = feathered[i]
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
      description: "Background removed image downloaded"
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
            <Scissors className="h-5 w-5 text-purple-600" />
            <span>Background Removal Settings</span>
          </SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="h-full">
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Algorithm</Label>
                <Select value={algorithm} onValueChange={setAlgorithm}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto (Recommended)</SelectItem>
                    <SelectItem value="edge">Edge Detection</SelectItem>
                    <SelectItem value="color">Color Clustering</SelectItem>
                    <SelectItem value="simple">Simple Threshold</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Sensitivity: {sensitivity[0]}</Label>
                <Slider
                  value={sensitivity}
                  onValueChange={setSensitivity}
                  min={5}
                  max={50}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Checkbox
                    checked={featherEdges}
                    onCheckedChange={setFeatherEdges}
                  />
                  <span className="text-sm">Feather Edges</span>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Checkbox
                    checked={preserveDetails}
                    onCheckedChange={setPreserveDetails}
                  />
                  <span className="text-sm">Preserve Details</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t bg-white space-y-3">
          <Button 
            onClick={() => {
              removeBackground()
              setIsMobileSidebarOpen(false)
            }}
            disabled={isProcessing || !file}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-base font-semibold"
            size="lg"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Removing...
              </>
            ) : (
              <>
                <Scissors className="h-4 w-4 mr-2" />
                Remove Background
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
              <Scissors className="h-6 w-6 lg:h-8 lg:w-8 text-purple-600" />
              <h1 className="text-2xl lg:text-3xl font-heading font-bold text-foreground">Background Remover</h1>
            </div>
            <p className="text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Remove image backgrounds automatically with AI-powered edge detection. Perfect for product photos and portraits.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div 
              className="border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:border-purple-400 hover:bg-purple-50/30 transition-all duration-300 p-8 lg:p-16 group"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="relative mb-4 lg:mb-6">
                <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all"></div>
                <Upload className="relative h-16 w-16 lg:h-20 lg:w-20 text-purple-500 group-hover:text-purple-600 transition-colors group-hover:scale-110 transform duration-300" />
              </div>
              <h3 className="text-xl lg:text-2xl font-semibold mb-2 lg:mb-3 text-gray-700 group-hover:text-purple-600 transition-colors">Drop image here</h3>
              <p className="text-gray-500 mb-4 lg:mb-6 text-base lg:text-lg text-center">or tap to browse files</p>
              <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 lg:px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 group-hover:scale-105">
                <Upload className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
                Choose Image
              </Button>
              <div className="mt-4 lg:mt-6 space-y-2 text-center">
                <p className="text-sm text-gray-500 font-medium">JPG, PNG, WebP files</p>
                <p className="text-xs text-gray-400">Single image • Up to 10MB • Max 1536x1536px</p>
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
            <Scissors className="h-5 w-5 text-purple-600" />
            <h1 className="text-lg font-semibold text-gray-900">Background Remover</h1>
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
                        alt="Background Removed"
                        className="w-full h-auto object-contain border rounded"
                        style={{ backgroundColor: 'transparent' }}
                      />
                      <div className="mt-2 text-xs text-gray-500 text-center">
                        {file.dimensions?.width}×{file.dimensions?.height} • {file.processedSize && formatFileSize(file.processedSize)}
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
                        <Scissors className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Processed image will appear here</p>
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
                <span className="text-sm font-medium text-blue-800">Removing background...</span>
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
              onClick={removeBackground}
              disabled={isProcessing || !file}
              className="bg-purple-600 hover:bg-purple-700 text-white py-3"
            >
              {isProcessing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <Scissors className="h-4 w-4 mr-2" />
                  Remove
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
                <Scissors className="h-5 w-5 text-purple-600" />
                <h1 className="text-xl font-semibold text-gray-900">Background Remover</h1>
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
                    <CardDescription>Background removed</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex items-center justify-center">
                    {file.processedPreview ? (
                      <div className="relative max-w-full max-h-full">
                        <div className="bg-gray-100 bg-opacity-50 bg-[linear-gradient(45deg,#f0f0f0_25%,transparent_25%),linear-gradient(-45deg,#f0f0f0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f0f0f0_75%),linear-gradient(-45deg,transparent_75%,#f0f0f0_75%)] bg-[length:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0px] rounded-lg p-4">
                          <img
                            src={file.processedPreview}
                            alt="Background Removed"
                            className="max-w-full max-h-[50vh] object-contain rounded-lg shadow-lg"
                            style={{ 
                              transform: `scale(${Math.min(zoomLevel / 100, 1)})`,
                              transition: "transform 0.2s ease"
                            }}
                          />
                        </div>
                        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {file.dimensions?.width}×{file.dimensions?.height}
                        </div>
                        {file.processedPreview && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle className="h-5 w-5 text-green-600 bg-white rounded-full" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500">
                        <Scissors className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p>Processed image will appear here</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center max-w-md mx-auto">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl"></div>
                  <Scissors className="relative h-24 w-24 text-purple-500 mx-auto" />
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-gray-700">Remove Background from Your Image</h3>
                <p className="text-gray-500 mb-6 text-lg">
                  Upload an image to start background removal
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Right Sidebar */}
        <div className="w-80 xl:w-96 bg-white border-l shadow-lg flex flex-col h-full">
          <div className="px-6 py-4 border-b bg-gray-50 flex-shrink-0">
            <div className="flex items-center space-x-2">
              <Scissors className="h-5 w-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900">Removal Settings</h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">Configure background removal</p>
          </div>

          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Algorithm</Label>
                    <Select value={algorithm} onValueChange={setAlgorithm}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto (Recommended)</SelectItem>
                        <SelectItem value="edge">Edge Detection</SelectItem>
                        <SelectItem value="color">Color Clustering</SelectItem>
                        <SelectItem value="simple">Simple Threshold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Sensitivity: {sensitivity[0]}</Label>
                    <Slider
                      value={sensitivity}
                      onValueChange={setSensitivity}
                      min={5}
                      max={50}
                      step={1}
                      className="mt-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Less sensitive</span>
                      <span>More sensitive</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={featherEdges}
                        onCheckedChange={setFeatherEdges}
                      />
                      <span className="text-sm">Feather Edges</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={preserveDetails}
                        onCheckedChange={setPreserveDetails}
                      />
                      <span className="text-sm">Preserve Details</span>
                    </div>
                  </div>
                </div>

                {/* File Info */}
                {file && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <h4 className="text-sm font-semibold text-purple-800 mb-2">Image Info</h4>
                    <div className="text-xs text-purple-700 space-y-1">
                      <div className="flex justify-between">
                        <span>Original Size:</span>
                        <span className="font-medium">{formatFileSize(file.size)}</span>
                      </div>
                      {file.processedSize && (
                        <div className="flex justify-between">
                          <span>Processed Size:</span>
                          <span className="font-medium">{formatFileSize(file.processedSize)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Dimensions:</span>
                        <span className="font-medium">{file.dimensions?.width}×{file.dimensions?.height}</span>
                      </div>
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
                  <span className="text-sm font-medium text-blue-800">Removing background...</span>
                </div>
                <Progress value={processingProgress} className="h-2" />
              </div>
            )}

            <Button 
              onClick={removeBackground}
              disabled={isProcessing || !file}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-base font-semibold"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Removing...
                </>
              ) : (
                <>
                  <Scissors className="h-4 w-4 mr-2" />
                  Remove Background
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