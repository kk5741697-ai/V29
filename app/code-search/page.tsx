"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Copy, Download, RefreshCw, FileText } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface SearchResult {
  lineNumber: number
  content: string
  matchStart: number
  matchEnd: number
  context: {
    before: string[]
    after: string[]
  }
}

export default function CodeSearchPage() {
  const [code, setCode] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [replaceTerm, setReplaceTerm] = useState("")
  const [searchMode, setSearchMode] = useState("text")
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [wholeWord, setWholeWord] = useState(false)
  const [contextLines, setContextLines] = useState(2)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [replacedCode, setReplacedCode] = useState("")

  const performSearch = () => {
    if (!code.trim() || !searchTerm.trim()) {
      setSearchResults([])
      return
    }

    const lines = code.split('\n')
    const results: SearchResult[] = []
    
    let searchPattern: RegExp
    
    try {
      if (searchMode === "regex") {
        const flags = caseSensitive ? "g" : "gi"
        searchPattern = new RegExp(searchTerm, flags)
      } else {
        const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const pattern = wholeWord ? `\\b${escapedTerm}\\b` : escapedTerm
        const flags = caseSensitive ? "g" : "gi"
        searchPattern = new RegExp(pattern, flags)
      }
      
      lines.forEach((line, lineIndex) => {
        let match
        while ((match = searchPattern.exec(line)) !== null) {
          const contextBefore = lines.slice(
            Math.max(0, lineIndex - contextLines),
            lineIndex
          )
          const contextAfter = lines.slice(
            lineIndex + 1,
            Math.min(lines.length, lineIndex + 1 + contextLines)
          )
          
          results.push({
            lineNumber: lineIndex + 1,
            content: line,
            matchStart: match.index,
            matchEnd: match.index + match[0].length,
            context: {
              before: contextBefore,
              after: contextAfter
            }
          })
          
          if (!searchPattern.global) break
        }
      })
      
      setSearchResults(results)
      
      toast({
        title: "Search complete",
        description: `Found ${results.length} match${results.length !== 1 ? 'es' : ''}`
      })
    } catch (error) {
      toast({
        title: "Search failed",
        description: "Invalid search pattern",
        variant: "destructive"
      })
    }
  }

  const performReplace = () => {
    if (!code.trim() || !searchTerm.trim()) {
      toast({
        title: "Replace failed",
        description: "Please enter code and search term",
        variant: "destructive"
      })
      return
    }

    try {
      let searchPattern: RegExp
      
      if (searchMode === "regex") {
        const flags = caseSensitive ? "g" : "gi"
        searchPattern = new RegExp(searchTerm, flags)
      } else {
        const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const pattern = wholeWord ? `\\b${escapedTerm}\\b` : escapedTerm
        const flags = caseSensitive ? "g" : "gi"
        searchPattern = new RegExp(pattern, flags)
      }
      
      const replaced = code.replace(searchPattern, replaceTerm)
      setReplacedCode(replaced)
      
      const replacements = (code.match(searchPattern) || []).length
      
      toast({
        title: "Replace complete",
        description: `Made ${replacements} replacement${replacements !== 1 ? 's' : ''}`
      })
    } catch (error) {
      toast({
        title: "Replace failed",
        description: "Invalid search pattern",
        variant: "destructive"
      })
    }
  }

  const highlightMatch = (content: string, start: number, end: number): string => {
    return (
      content.substring(0, start) +
      '<mark class="bg-yellow-200 font-bold">' +
      content.substring(start, end) +
      '</mark>' +
      content.substring(end)
    )
  }

  const copyResults = () => {
    const resultsText = searchResults.map(result => 
      `Line ${result.lineNumber}: ${result.content}`
    ).join('\n')
    
    navigator.clipboard.writeText(resultsText)
    toast({
      title: "Copied to clipboard",
      description: "Search results copied"
    })
  }

  const loadExample = () => {
    setCode(`function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price * items[i].quantity;
  }
  return total;
}

function calculateTax(amount, rate) {
  return amount * rate;
}

function calculateFinalPrice(items, taxRate) {
  const subtotal = calculateTotal(items);
  const tax = calculateTax(subtotal, taxRate);
  return subtotal + tax;
}`)
    setSearchTerm("calculate")
    setReplaceTerm("compute")
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-4">
            <Search className="h-8 w-8 text-accent" />
            <h1 className="text-3xl font-heading font-bold text-foreground">Code Search & Replace</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Search and replace text in code with regex support, context display, and advanced matching options.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Code Input */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Code Input</CardTitle>
                <CardDescription>Enter your code to search through</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Paste your code here..."
                  className="min-h-[400px] font-mono text-sm"
                />
              </CardContent>
            </Card>

            {/* Replaced Code */}
            {replacedCode && (
              <Card>
                <CardHeader>
                  <CardTitle>Replaced Code</CardTitle>
                  <CardDescription>Code after replacements</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={replacedCode}
                    readOnly
                    className="min-h-[300px] font-mono text-sm"
                  />
                  <div className="flex space-x-2 mt-4">
                    <Button onClick={() => navigator.clipboard.writeText(replacedCode)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button variant="outline" onClick={() => setCode(replacedCode)}>
                      Use as Input
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Search Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Search & Replace</CardTitle>
                <CardDescription>Configure your search parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="search-term">Search For</Label>
                  <Input
                    id="search-term"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Enter search term or regex..."
                    className="font-mono"
                  />
                </div>

                <div>
                  <Label htmlFor="replace-term">Replace With</Label>
                  <Input
                    id="replace-term"
                    value={replaceTerm}
                    onChange={(e) => setReplaceTerm(e.target.value)}
                    placeholder="Enter replacement text..."
                    className="font-mono"
                  />
                </div>

                <div>
                  <Label htmlFor="search-mode">Search Mode</Label>
                  <Select value={searchMode} onValueChange={setSearchMode}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text Search</SelectItem>
                      <SelectItem value="regex">Regular Expression</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="case-sensitive"
                      checked={caseSensitive}
                      onCheckedChange={setCaseSensitive}
                    />
                    <Label htmlFor="case-sensitive">Case Sensitive</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="whole-word"
                      checked={wholeWord}
                      onCheckedChange={setWholeWord}
                    />
                    <Label htmlFor="whole-word">Whole Word</Label>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button onClick={performSearch} className="flex-1">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                  <Button onClick={performReplace} variant="outline" className="flex-1">
                    Replace All
                  </Button>
                </div>

                <Button variant="outline" onClick={loadExample} className="w-full">
                  Load Example
                </Button>
              </CardContent>
            </Card>

            {/* Search Results */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Search Results</CardTitle>
                    <CardDescription>
                      {searchResults.length} match{searchResults.length !== 1 ? 'es' : ''} found
                    </CardDescription>
                  </div>
                  {searchResults.length > 0 && (
                    <Button variant="outline" size="sm" onClick={copyResults}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {searchResults.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {searchResults.map((result, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline">Line {result.lineNumber}</Badge>
                        </div>
                        <div 
                          className="font-mono text-sm bg-gray-50 p-2 rounded"
                          dangerouslySetInnerHTML={{
                            __html: highlightMatch(result.content, result.matchStart, result.matchEnd)
                          }}
                        />
                        {result.context.before.length > 0 && (
                          <div className="mt-2">
                            <Label className="text-xs text-gray-500">Context Before:</Label>
                            <div className="font-mono text-xs text-gray-600">
                              {result.context.before.map((line, i) => (
                                <div key={i}>{line}</div>
                              ))}
                            </div>
                          </div>
                        )}
                        {result.context.after.length > 0 && (
                          <div className="mt-2">
                            <Label className="text-xs text-gray-500">Context After:</Label>
                            <div className="font-mono text-xs text-gray-600">
                              {result.context.after.map((line, i) => (
                                <div key={i}>{line}</div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Enter search term to find matches</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}