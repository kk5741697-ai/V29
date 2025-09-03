"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Copy, 
  Download, 
  Upload, 
  Link, 
  RefreshCw,
  Settings,
  Trash2,
  Eye,
  Share2,
  Heart,
  AlertCircle,
  FileText,
  Menu,
  Undo,
  Redo,
  Save,
  FolderOpen,
  Edit,
  Check,
  X,
  Info
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { AdBanner } from "@/components/ads/ad-banner"

interface ToolOption {
  key: string
  label: string
  type: "text" | "number" | "select" | "checkbox" | "slider" | "color"
  defaultValue: any
  min?: number
  max?: number
  step?: number
  selectOptions?: Array<{ value: string; label: string }>
}

interface TextExample {
  name: string
  content: string
}

interface TextToolLayoutProps {
  title: string
  description: string
  icon: any
  placeholder: string
  outputPlaceholder: string
  processFunction: (input: string, options: any) => { output: string; error?: string; stats?: any }
  validateFunction?: (input: string) => { isValid: boolean; error?: string }
  options?: ToolOption[]
  examples?: TextExample[]
  fileExtensions?: string[]
}

export function TextToolLayout({
  title,
  description,
  icon: Icon,
  placeholder,
  outputPlaceholder,
  processFunction,
  validateFunction,
  options = [],
  examples = [],
  fileExtensions = [".txt"]
}: TextToolLayoutProps) {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [autoUpdate, setAutoUpdate] = useState(true)
  const [error, setError] = useState("")
  const [stats, setStats] = useState<any>(null)
  const [toolOptions, setToolOptions] = useState<Record<string, any>>({})
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Initialize options with defaults
  useEffect(() => {
    const defaultOptions: Record<string, any> = {}
    options.forEach(option => {
      defaultOptions[option.key] = option.defaultValue
    })
    setToolOptions(defaultOptions)
  }, [options])

  useEffect(() => {
    if (autoUpdate && input.trim()) {
      processText()
    } else if (!input.trim()) {
      setOutput("")
      setError("")
      setStats(null)
    }
  }, [input, autoUpdate, toolOptions])

  const processText = () => {
    if (!input.trim()) {
      setOutput("")
      setError("")
      setStats(null)
      return
    }

    if (validateFunction) {
      const validation = validateFunction(input)
      if (!validation.isValid) {
        setError(validation.error || "Invalid input")
        setOutput("")
        setStats(null)
        toast({
          title: "Validation failed",
          description: validation.error || "Invalid input",
          variant: "destructive"
        })
        return
      }
    }

    try {
      const result = processFunction(input, toolOptions)
      setOutput(result.output)
      setError(result.error || "")
      setStats(result.stats)
      
      if (result.output && !result.error) {
        toast({
          title: "Processing complete",
          description: "Text processed successfully"
        })
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Processing failed")
      setOutput("")
      setStats(null)
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "Processing failed",
        variant: "destructive"
      })
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied to clipboard",
        description: "Text has been copied successfully"
      })
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const loadExample = (exampleContent: string) => {
    setInput(exampleContent)
  }

  const getFileExtension = () => {
    return fileExtensions[0] || ".txt"
  }

  // Mobile Options Sidebar
  const MobileOptionsSidebar = () => (
    <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
      <SheetContent side="bottom" className="h-[70vh] p-0">
        <SheetHeader className="px-6 py-4 border-b bg-gray-50">
          <SheetTitle className="flex items-center space-x-2">
            <Icon className="h-5 w-5 text-teal-600" />
            <span>{title} Options</span>
          </SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="h-full">
          <div className="p-6 space-y-6">
            {/* Tool Options */}
            {options.map((option) => (
              <div key={option.key} className="space-y-2">
                <Label className="text-sm font-medium">{option.label}</Label>
                
                {option.type === "select" && (
                  <Select
                    value={toolOptions[option.key]?.toString()}
                    onValueChange={(value) => setToolOptions(prev => ({ ...prev, [option.key]: value }))}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {option.selectOptions?.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {option.type === "checkbox" && (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Checkbox
                      checked={toolOptions[option.key] || false}
                      onCheckedChange={(checked) => setToolOptions(prev => ({ ...prev, [option.key]: checked }))}
                    />
                    <span className="text-sm">{option.label}</span>
                  </div>
                )}

                {option.type === "slider" && (
                  <div className="space-y-3">
                    <Slider
                      value={[toolOptions[option.key] || option.defaultValue]}
                      onValueChange={([value]) => setToolOptions(prev => ({ ...prev, [option.key]: value }))}
                      min={option.min}
                      max={option.max}
                      step={option.step}
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{option.min}</span>
                      <span className="font-medium bg-gray-100 px-2 py-1 rounded">{toolOptions[option.key] || option.defaultValue}</span>
                      <span>{option.max}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Mobile Examples */}
            {examples.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Examples</Label>
                <div className="space-y-2">
                  {examples.map((example, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      onClick={() => {
                        loadExample(example.content)
                        setIsMobileSidebarOpen(false)
                      }}
                      className="w-full h-auto p-3 text-left justify-start"
                    >
                      <div>
                        <div className="font-medium text-sm">{example.name}</div>
                        <div className="text-xs text-gray-500 mt-1 truncate">
                          {example.content.substring(0, 40)}...
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Mobile Ad */}
            <div className="py-4">
              <AdBanner 
                adSlot="mobile-text-sidebar"
                adFormat="auto"
                className="w-full"
                mobileOptimized={true}
              />
            </div>
          </div>
        </ScrollArea>
        
        {/* Mobile Footer */}
        <div className="p-4 border-t bg-white">
          <Button 
            onClick={() => {
              processText()
            }}
            className="w-full bg-teal-500 hover:bg-teal-600 text-white py-3"
          >
            Process Text
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Top Ad Banner */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <AdBanner 
            adSlot="tool-header-banner"
            adFormat="auto"
            className="max-w-4xl mx-auto"
            mobileOptimized={true}
          />
        </div>
      </div>

      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3 lg:py-4">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <span className="text-2xl font-bold text-gray-900">Code</span>
            <Heart className="h-6 w-6 text-teal-500 fill-teal-500" />
            <span className="text-2xl font-bold text-gray-900">Beautify</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 text-center">{title}</h1>
          <div className="flex flex-wrap items-center justify-center gap-2 lg:gap-4 mb-4">
            <Button variant="ghost" className="text-blue-600">
              <Heart className="h-4 w-4 mr-2" />
              Add to Fav
            </Button>
            <Button className="bg-teal-500 hover:bg-teal-600 text-white">
              New
            </Button>
            <Button variant="outline">
              Save & Share
            </Button>
            {/* Mobile Settings Button */}
            {isMobile && options.length > 0 && (
              <Button 
                variant="outline" 
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden"
              >
                <Settings className="h-4 w-4 mr-2" />
                Options
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Interface */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6 mb-6 lg:mb-8">
          {/* Input Panel - 2/5 width */}
          <div className="lg:col-span-2">
            <Card className="bg-white h-full">
              <CardHeader className="pb-2 px-4 lg:px-6 bg-gray-600 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 lg:space-x-2 overflow-x-auto">
                    <Button variant="ghost" size="sm" className="text-white hover:bg-gray-500">
                      <Menu className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-gray-500">
                      <Undo className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-gray-500">
                      <Redo className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-gray-500">
                      <FolderOpen className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-gray-500">
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(input)} className="text-white hover:bg-gray-500">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => downloadFile(input, `input${getFileExtension()}`)} className="text-white hover:bg-gray-500">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setInput("")} className="text-white hover:bg-gray-500">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-gray-500 hidden lg:flex">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-gray-500 hidden lg:flex">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-xs lg:text-sm text-gray-300 italic">Sample</div>
                </div>
                
                <Tabs defaultValue="file" className="w-full hidden lg:block">
                  <TabsList className="grid w-full grid-cols-2 bg-gray-500">
                    <TabsTrigger value="file" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">
                      <FileText className="h-4 w-4 mr-2" />
                      File
                    </TabsTrigger>
                    <TabsTrigger value="url" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">
                      <Link className="h-4 w-4 mr-2" />
                      URL
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent className="px-4 lg:px-6 pt-4 h-[400px] lg:h-[500px] flex flex-col">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={placeholder}
                  className="flex-1 font-mono text-sm resize-none border-0 focus:ring-0 bg-transparent"
                />
                <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                  <span>Ln: {input.split('\n').length} Col: {input.length}</span>
                  <div className="flex space-x-2 lg:space-x-4">
                    <span className="font-mono">T</span>
                    <span className="font-mono">T</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center Section - 1/5 width */}
          <div className="lg:col-span-1 flex flex-col justify-center space-y-4">
            {/* File/URL Tabs */}
            <div className="bg-white rounded-lg border">
              <Tabs defaultValue="file" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="file" className="flex items-center space-x-2">
                    <Upload className="h-4 w-4" />
                    <span>File</span>
                  </TabsTrigger>
                  <TabsTrigger value="url" className="flex items-center space-x-2">
                    <Link className="h-4 w-4" />
                    <span>URL</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Auto Update Checkbox */}
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="auto-update"
                  checked={autoUpdate}
                  onCheckedChange={setAutoUpdate}
                />
                <label htmlFor="auto-update" className="text-sm font-medium">Auto Update</label>
              </div>
            </div>

            {/* Tool Options Card */}
            {options.length > 0 && !isMobile && (
              <Card className="bg-white">
                <CardContent className="p-4 space-y-4">
                  {options.map((option) => (
                    <div key={option.key} className="space-y-2">
                      {option.type === "select" && (
                        <div>
                          <Label className="text-xs font-medium text-gray-600">{option.label}</Label>
                          <Select
                            value={toolOptions[option.key]?.toString()}
                            onValueChange={(value) => setToolOptions(prev => ({ ...prev, [option.key]: value }))}
                          >
                            <SelectTrigger className="h-8 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {option.selectOptions?.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {option.type === "checkbox" && (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={toolOptions[option.key] || false}
                            onCheckedChange={(checked) => setToolOptions(prev => ({ ...prev, [option.key]: checked }))}
                          />
                          <Label className="text-xs font-medium">{option.label}</Label>
                        </div>
                      )}

                      {option.type === "slider" && (
                        <div className="space-y-2">
                          <Label className="text-xs font-medium">{option.label}: {toolOptions[option.key] || option.defaultValue}</Label>
                          <Slider
                            value={[toolOptions[option.key] || option.defaultValue]}
                            onValueChange={([value]) => setToolOptions(prev => ({ ...prev, [option.key]: value }))}
                            min={option.min}
                            max={option.max}
                            step={option.step}
                            className="h-1"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Ad Banner */}
            <div className="bg-white rounded-lg border p-2">
              <AdBanner 
                adSlot="text-tool-center"
                adFormat="auto"
                className="w-full min-h-[200px] border border-gray-300 rounded-lg flex items-center justify-center"
                mobileOptimized={true}
              />
            </div>

            {/* Main CTA Button */}
            <Button 
              onClick={processText}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
              size="lg"
            >
              {title}
            </Button>
            
            {/* Download Button */}
            <Button 
              variant="outline"
              onClick={() => downloadFile(output, `converted${getFileExtension()}`)}
              disabled={!output}
              className="w-full bg-gray-700 text-white border-gray-600 hover:bg-gray-600 py-3"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>

            {/* Additional Tool Links */}
            <div className="space-y-2">
              {title.includes("JSON") && (
                <Button variant="outline" className="w-full text-blue-600 text-sm py-2" asChild>
                  <a href="/json-formatter">JSON Sorter</a>
                </Button>
              )}
              {title.includes("XML") && (
                <Button variant="outline" className="w-full text-blue-600 text-sm py-2" asChild>
                  <a href="/xml-formatter">XML Validator</a>
                </Button>
              )}
              {title.includes("HTML") && (
                <Button variant="outline" className="w-full text-blue-600 text-sm py-2" asChild>
                  <a href="/html-formatter">HTML Minifier</a>
                </Button>
              )}
              {title.includes("CSS") && (
                <Button variant="outline" className="w-full text-blue-600 text-sm py-2" asChild>
                  <a href="/css-minifier">CSS Beautifier</a>
                </Button>
              )}
              {title.includes("JavaScript") && (
                <Button variant="outline" className="w-full text-blue-600 text-sm py-2" asChild>
                  <a href="/js-minifier">JS Beautifier</a>
                </Button>
              )}
              {title.includes("Base64") && (
                <Button variant="outline" className="w-full text-blue-600 text-sm py-2" asChild>
                  <a href="/url-encoder">URL Encoder</a>
                </Button>
              )}
              {title.includes("URL") && (
                <Button variant="outline" className="w-full text-blue-600 text-sm py-2" asChild>
                  <a href="/base64-encoder">Base64 Encoder</a>
                </Button>
              )}
              {title.includes("Hash") && (
                <Button variant="outline" className="w-full text-blue-600 text-sm py-2" asChild>
                  <a href="/password-generator">Password Gen</a>
                </Button>
              )}
              {title.includes("Case") && (
                <Button variant="outline" className="w-full text-blue-600 text-sm py-2" asChild>
                  <a href="/text-diff-checker">Text Diff</a>
                </Button>
              )}
            </div>
          </div>

          {/* Output Panel - 2/5 width */}
          <div className="lg:col-span-2">
            <Card className="bg-white h-full">
              <CardHeader className="pb-2 px-4 lg:px-6 bg-gray-600 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 lg:space-x-2 overflow-x-auto">
                    <Button variant="ghost" size="sm" className="text-white hover:bg-gray-500">
                      <Menu className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(output)} className="text-white hover:bg-gray-500">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => downloadFile(output, `output${getFileExtension()}`)} className="text-white hover:bg-gray-500">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-gray-500 hidden lg:flex">
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-gray-500 hidden lg:flex">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-gray-500 hidden lg:flex">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-xs lg:text-sm font-medium bg-gray-800 text-white px-2 py-1 rounded">
                    Output
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 lg:px-6 pt-4 h-[400px] lg:h-[500px] flex flex-col">
                {error ? (
                  <div className="flex-1 flex items-center justify-center text-red-500 bg-red-50 rounded border">
                    <div className="text-center">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                      <p>{error}</p>
                    </div>
                  </div>
                ) : (
                  <Textarea
                    value={output}
                    readOnly
                    placeholder={outputPlaceholder}
                    className="flex-1 font-mono text-sm resize-none border-0 focus:ring-0 bg-transparent"
                  />
                )}
                <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                  <span>Ln: {output.split('\n').length} Col: {output.length}</span>
                  <div className="flex space-x-2 lg:space-x-4">
                    <span className="font-mono">T</span>
                    <span className="font-mono">T</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats Display */}
        {stats && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(stats).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <div className="text-xl lg:text-2xl font-bold text-gray-900">{value}</div>
                    <div className="text-sm text-gray-600">{key}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Examples */}
        {examples.length > 0 && !isMobile && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {examples.map((example, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => loadExample(example.content)}
                  className="h-auto p-4 text-left justify-start"
                >
                  <div>
                    <div className="font-medium">{example.name}</div>
                    <div className="text-xs text-gray-500 mt-1 truncate">
                      {example.content.substring(0, 50)}...
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Mobile Sticky Bottom Ad */}
        {isMobile && (
          <div className="mt-8 pb-20">
            <AdBanner 
              adSlot="mobile-bottom-sticky"
              adFormat="auto"
              className="w-full"
              mobileOptimized={true}
              sticky={true}
            />
          </div>
        )}
      </div>

      <MobileOptionsSidebar />
      <Footer />
    </div>
  )
}