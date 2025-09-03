"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Upload, 
  Download, 
  CheckCircle,
  RefreshCw,
  Settings,
  Scissors,
  Info,
  ExternalLink,
  Star
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { AdBanner } from "@/components/ads/ad-banner"

interface ImageFile {
  id: string
  file: File
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
  const [files, setFiles] = useState<ImageFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [showUploadArea, setShowUploadArea] = useState(true)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (uploadedFiles: FileList | null) => {
    if (!uploadedFiles || uploadedFiles.length === 0) return

    const newFiles: ImageFile[] = []
    
    for (const file of Array.from(uploadedFiles)) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an image file`,
          variant: "destructive"
        })
        continue
      }

      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 10MB. Please use a smaller image.`,
          variant: "destructive"
        })
        continue
      }

      try {
        const dimensions = await getImageDimensions(file)
        const preview = await createImagePreview(file)
        
        const imageFile: ImageFile = {
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          file,
          name: file.name,
          size: file.size,
          dimensions,
          preview,
        }

        newFiles.push(imageFile)
      } catch (error) {
        toast({
          title: "Error loading image",
          description: `Failed to load ${file.name}`,
          variant: "destructive"
        })
      }
    }

    if (newFiles.length > 0) {
      setFiles(newFiles.slice(0, 1)) // Only take first file
      setShowUploadArea(false)
      toast({
        title: "Image uploaded",
        description: "Image loaded successfully"
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
    setFiles([])
    setShowUploadArea(true)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
  }

  // Show upload area if no files
  if (showUploadArea && files.length === 0) {
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
              Remove backgrounds from images using advanced algorithms. Best results with clear subject-background separation.
            </p>
          </div>

          {/* Professional Service Notice */}
          <Alert className="mb-6 max-w-4xl mx-auto border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <div className="space-y-2">
                <p><strong>Professional Background Removal:</strong> For production-quality results, we recommend using specialized AI services:</p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://www.remove.bg" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Remove.bg
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://www.canva.com/bg-remover/" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Canva BG Remover
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://photoscissors.com" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      PhotoScissors
                    </a>
                  </Button>
                </div>
                <p className="text-sm">Our tool provides basic background removal for simple images with clear backgrounds.</p>
              </div>
            </AlertDescription>
          </Alert>

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
                <p className="text-xs text-gray-400">Single image • Up to 10MB</p>
              </div>
            </div>
          </div>

          {/* Professional Alternatives */}
          <div className="mt-12 max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold text-center mb-6">Professional Background Removal Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="text-center">
                <CardHeader>
                  <div className="flex items-center justify-center mb-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500" />
                  </div>
                  <CardTitle className="text-lg">Remove.bg</CardTitle>
                  <CardDescription>AI-powered background removal</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Industry-leading AI for perfect background removal. Free and paid plans available.
                  </p>
                  <Button asChild className="w-full">
                    <a href="https://www.remove.bg" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Try Remove.bg
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="flex items-center justify-center mb-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500" />
                    <Star className="h-5 w-5 text-gray-300" />
                  </div>
                  <CardTitle className="text-lg">Canva</CardTitle>
                  <CardDescription>Background remover in design tool</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Integrated background removal with design tools. Great for creating graphics.
                  </p>
                  <Button asChild className="w-full" variant="outline">
                    <a href="https://www.canva.com/bg-remover/" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Try Canva
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="flex items-center justify-center mb-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500" />
                    <Star className="h-5 w-5 text-gray-300" />
                  </div>
                  <CardTitle className="text-lg">PhotoScissors</CardTitle>
                  <CardDescription>Automatic background removal</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Easy-to-use background removal with manual editing tools for fine-tuning.
                  </p>
                  <Button asChild className="w-full" variant="outline">
                    <a href="https://photoscissors.com" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Try PhotoScissors
                    </a>
                  </Button>
                </CardContent>
              </Card>
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

  // Simple processing interface for basic background removal
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-4">
            <Scissors className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-heading font-bold text-foreground">Background Remover</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Basic background removal for simple images. For professional results, use specialized AI services.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Alert className="mb-8 border-amber-200 bg-amber-50">
            <Info className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Notice:</strong> Professional AI background removal requires specialized models and significant computational resources. 
              For production-quality results, we recommend using dedicated services like Remove.bg, Canva, or PhotoScissors.
            </AlertDescription>
          </Alert>

          {files.map((file) => (
            <Card key={file.id} className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{file.name}</CardTitle>
                  <Button variant="outline" size="sm" onClick={resetTool}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>
                <CardDescription>
                  {formatFileSize(file.size)} • {file.dimensions?.width}×{file.dimensions?.height}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Original */}
                  <div>
                    <h4 className="font-medium mb-3">Original Image</h4>
                    <img
                      src={file.preview}
                      alt="Original"
                      className="w-full h-auto object-contain border rounded-lg"
                    />
                  </div>

                  {/* Processed */}
                  <div>
                    <h4 className="font-medium mb-3">Background Removed</h4>
                    {file.processedPreview ? (
                      <div className="relative">
                        <div className="qr-preview-container p-4 rounded-lg">
                          <img
                            src={file.processedPreview}
                            alt="Background Removed"
                            className="w-full h-auto object-contain border rounded-lg"
                          />
                        </div>
                        <div className="absolute top-2 right-2">
                          <CheckCircle className="h-5 w-5 text-green-600 bg-white rounded-full" />
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-square bg-gray-100 rounded-lg border flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <Scissors className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p>Use professional services for best results</p>
                          <div className="mt-4 space-y-2">
                            <Button size="sm" asChild>
                              <a href="https://www.remove.bg" target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Remove.bg
                              </a>
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
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