"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GitCompare, Copy, Download, RefreshCw } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface DiffResult {
  type: "added" | "removed" | "unchanged" | "modified"
  content: string
  lineNumber?: number
  oldLineNumber?: number
  newLineNumber?: number
}

export default function CodeDiffPage() {
  const [originalCode, setOriginalCode] = useState("")
  const [modifiedCode, setModifiedCode] = useState("")
  const [diffFormat, setDiffFormat] = useState("unified")
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false)
  const [ignoreCase, setIgnoreCase] = useState(false)
  const [contextLines, setContextLines] = useState(3)
  const [diffResults, setDiffResults] = useState<DiffResult[]>([])

  const calculateDiff = () => {
    let original = originalCode
    let modified = modifiedCode

    // Apply ignore options
    if (ignoreCase) {
      original = original.toLowerCase()
      modified = modified.toLowerCase()
    }

    if (ignoreWhitespace) {
      original = original.replace(/\s+/g, " ").trim()
      modified = modified.replace(/\s+/g, " ").trim()
    }

    const originalLines = original.split("\n")
    const modifiedLines = modified.split("\n")
    const results: DiffResult[] = []

    // Simple diff algorithm
    const maxLines = Math.max(originalLines.length, modifiedLines.length)
    
    for (let i = 0; i < maxLines; i++) {
      const originalLine = originalLines[i] || ""
      const modifiedLine = modifiedLines[i] || ""

      if (originalLine === modifiedLine) {
        results.push({
          type: "unchanged",
          content: originalLine,
          lineNumber: i + 1,
          oldLineNumber: i + 1,
          newLineNumber: i + 1
        })
      } else {
        if (originalLines[i] !== undefined) {
          results.push({
            type: "removed",
            content: originalLines[i],
            lineNumber: i + 1,
            oldLineNumber: i + 1
          })
        }
        if (modifiedLines[i] !== undefined) {
          results.push({
            type: "added",
            content: modifiedLines[i],
            lineNumber: i + 1,
            newLineNumber: i + 1
          })
        }
      }
    }

    setDiffResults(results)
  }

  const copyDiff = () => {
    const diffText = generateDiffOutput(diffResults, diffFormat)
    navigator.clipboard.writeText(diffText)
    toast({
      title: "Copied to clipboard",
      description: "Diff results copied"
    })
  }

  const downloadDiff = () => {
    const diffText = generateDiffOutput(diffResults, diffFormat)
    const blob = new Blob([diffText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "code-diff.patch"
    link.click()
    URL.revokeObjectURL(url)
  }

  const generateDiffOutput = (results: DiffResult[], format: string): string => {
    switch (format) {
      case "unified":
        return generateUnifiedDiff(results)
      case "side-by-side":
        return generateSideBySideDiff(results)
      case "context":
        return generateContextDiff(results)
      default:
        return results.map(result => {
          const prefix = result.type === "added" ? "+ " : result.type === "removed" ? "- " : "  "
          return prefix + result.content
        }).join("\n")
    }
  }

  const generateUnifiedDiff = (results: DiffResult[]): string => {
    let output = "--- Original\n+++ Modified\n"
    
    results.forEach(result => {
      const prefix = result.type === "added" ? "+" : result.type === "removed" ? "-" : " "
      output += prefix + result.content + "\n"
    })
    
    return output
  }

  const generateSideBySideDiff = (results: DiffResult[]): string => {
    let output = "ORIGINAL".padEnd(50) + " | " + "MODIFIED\n"
    output += "=".repeat(50) + " | " + "=".repeat(50) + "\n"
    
    results.forEach(result => {
      const leftSide = result.type === "removed" || result.type === "unchanged" ? result.content : ""
      const rightSide = result.type === "added" || result.type === "unchanged" ? result.content : ""
      
      output += leftSide.padEnd(50) + " | " + rightSide + "\n"
    })
    
    return output
  }

  const generateContextDiff = (results: DiffResult[]): string => {
    let output = "*** Original\n--- Modified\n"
    
    results.forEach(result => {
      const prefix = result.type === "added" ? "+ " : result.type === "removed" ? "- " : "  "
      output += prefix + result.content + "\n"
    })
    
    return output
  }

  const loadExample = () => {
    setOriginalCode(`function greetUser(name) {
  console.log("Hello, " + name);
  return "Hello, " + name;
}

const users = ["Alice", "Bob"];
users.forEach(user => greetUser(user));`)

    setModifiedCode(`function greetUser(name, greeting = "Hello") {
  const message = greeting + ", " + name + "!";
  console.log(message);
  return message;
}

const users = ["Alice", "Bob", "Charlie"];
users.forEach(user => greetUser(user, "Hi"));`)

    calculateDiff()
  }

  const addedCount = diffResults.filter(r => r.type === "added").length
  const removedCount = diffResults.filter(r => r.type === "removed").length
  const unchangedCount = diffResults.filter(r => r.type === "unchanged").length

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-4">
            <GitCompare className="h-8 w-8 text-accent" />
            <h1 className="text-3xl font-heading font-bold text-foreground">Code Diff Checker</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Compare two code files and highlight differences with multiple diff formats and advanced options.
          </p>
        </div>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Original Code</CardTitle>
                <CardDescription>Enter the original version of your code</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={originalCode}
                  onChange={(e) => setOriginalCode(e.target.value)}
                  placeholder="Paste your original code here..."
                  className="min-h-[300px] font-mono text-sm"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Modified Code</CardTitle>
                <CardDescription>Enter the modified version of your code</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={modifiedCode}
                  onChange={(e) => setModifiedCode(e.target.value)}
                  placeholder="Paste your modified code here..."
                  className="min-h-[300px] font-mono text-sm"
                />
              </CardContent>
            </Card>
          </div>

          {/* Options and Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Diff Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div>
                  <Label htmlFor="diff-format">Diff Format</Label>
                  <Select value={diffFormat} onValueChange={setDiffFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unified">Unified Diff</SelectItem>
                      <SelectItem value="side-by-side">Side by Side</SelectItem>
                      <SelectItem value="context">Context Diff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ignore-whitespace"
                    checked={ignoreWhitespace}
                    onCheckedChange={setIgnoreWhitespace}
                  />
                  <Label htmlFor="ignore-whitespace">Ignore Whitespace</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ignore-case"
                    checked={ignoreCase}
                    onCheckedChange={setIgnoreCase}
                  />
                  <Label htmlFor="ignore-case">Ignore Case</Label>
                </div>

                <div className="flex space-x-2">
                  <Button onClick={calculateDiff} disabled={!originalCode || !modifiedCode}>
                    <GitCompare className="h-4 w-4 mr-2" />
                    Compare
                  </Button>
                  <Button variant="outline" onClick={loadExample}>
                    Example
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {diffResults.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Diff Results</CardTitle>
                    <CardDescription>Code comparison results</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={copyDiff}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Diff
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadDiff}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Statistics */}
                <div className="flex space-x-4 mb-6">
                  <Badge className="bg-green-100 text-green-800">
                    +{addedCount} Added
                  </Badge>
                  <Badge className="bg-red-100 text-red-800">
                    -{removedCount} Removed
                  </Badge>
                  <Badge variant="secondary">
                    {unchangedCount} Unchanged
                  </Badge>
                </div>

                {/* Diff Display */}
                <Tabs value={diffFormat} onValueChange={setDiffFormat}>
                  <TabsList>
                    <TabsTrigger value="unified">Unified</TabsTrigger>
                    <TabsTrigger value="side-by-side">Side by Side</TabsTrigger>
                    <TabsTrigger value="context">Context</TabsTrigger>
                  </TabsList>

                  <TabsContent value="unified">
                    <div className="bg-gray-50 border rounded-lg p-4 max-h-96 overflow-y-auto">
                      <div className="font-mono text-sm space-y-1">
                        {diffResults.map((result, index) => (
                          <div
                            key={index}
                            className={`p-1 rounded ${
                              result.type === "added"
                                ? "bg-green-100 text-green-800"
                                : result.type === "removed"
                                  ? "bg-red-100 text-red-800"
                                  : "text-gray-600"
                            }`}
                          >
                            <span className="inline-block w-6 text-center font-bold">
                              {result.type === "added" ? "+" : result.type === "removed" ? "-" : " "}
                            </span>
                            <span>{result.content}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="side-by-side">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Original</h4>
                        <div className="bg-gray-50 border rounded-lg p-4 max-h-96 overflow-y-auto">
                          <div className="font-mono text-sm space-y-1">
                            {diffResults
                              .filter(r => r.type === "removed" || r.type === "unchanged")
                              .map((result, index) => (
                                <div
                                  key={index}
                                  className={`p-1 rounded ${
                                    result.type === "removed" ? "bg-red-100 text-red-800" : "text-gray-600"
                                  }`}
                                >
                                  {result.content}
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Modified</h4>
                        <div className="bg-gray-50 border rounded-lg p-4 max-h-96 overflow-y-auto">
                          <div className="font-mono text-sm space-y-1">
                            {diffResults
                              .filter(r => r.type === "added" || r.type === "unchanged")
                              .map((result, index) => (
                                <div
                                  key={index}
                                  className={`p-1 rounded ${
                                    result.type === "added" ? "bg-green-100 text-green-800" : "text-gray-600"
                                  }`}
                                >
                                  {result.content}
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="context">
                    <div className="bg-gray-50 border rounded-lg p-4 max-h-96 overflow-y-auto">
                      <div className="font-mono text-sm space-y-1">
                        {diffResults.map((result, index) => (
                          <div
                            key={index}
                            className={`p-1 rounded ${
                              result.type === "added"
                                ? "bg-green-100 text-green-800"
                                : result.type === "removed"
                                  ? "bg-red-100 text-red-800"
                                  : "text-gray-600"
                            }`}
                          >
                            <span className="inline-block w-8 text-center text-xs text-gray-500">
                              {result.oldLineNumber || result.newLineNumber || ""}
                            </span>
                            <span className="inline-block w-6 text-center font-bold">
                              {result.type === "added" ? "+" : result.type === "removed" ? "-" : " "}
                            </span>
                            <span>{result.content}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}