"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Copy, Download, RefreshCw, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface RegexMatch {
  match: string
  index: number
  groups: string[]
}

export default function RegexTesterPage() {
  const [pattern, setPattern] = useState("")
  const [testString, setTestString] = useState("")
  const [flags, setFlags] = useState({
    global: true,
    ignoreCase: false,
    multiline: false,
    dotAll: false,
    unicode: false,
    sticky: false
  })
  const [matches, setMatches] = useState<RegexMatch[]>([])
  const [isValid, setIsValid] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    testRegex()
  }, [pattern, testString, flags])

  const testRegex = () => {
    if (!pattern.trim() || !testString.trim()) {
      setMatches([])
      setIsValid(true)
      setError("")
      return
    }

    try {
      const flagString = Object.entries(flags)
        .filter(([_, enabled]) => enabled)
        .map(([flag, _]) => {
          switch (flag) {
            case 'global': return 'g'
            case 'ignoreCase': return 'i'
            case 'multiline': return 'm'
            case 'dotAll': return 's'
            case 'unicode': return 'u'
            case 'sticky': return 'y'
            default: return ''
          }
        })
        .join('')

      const regex = new RegExp(pattern, flagString)
      const foundMatches: RegexMatch[] = []

      if (flags.global) {
        let match
        while ((match = regex.exec(testString)) !== null) {
          foundMatches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1)
          })
          
          // Prevent infinite loop
          if (!flags.global) break
          if (match.index === regex.lastIndex) {
            regex.lastIndex++
          }
        }
      } else {
        const match = regex.exec(testString)
        if (match) {
          foundMatches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1)
          })
        }
      }

      setMatches(foundMatches)
      setIsValid(true)
      setError("")
    } catch (err) {
      setIsValid(false)
      setError(err instanceof Error ? err.message : "Invalid regular expression")
      setMatches([])
    }
  }

  const highlightMatches = (text: string, matches: RegexMatch[]): string => {
    if (matches.length === 0) return text

    let result = ""
    let lastIndex = 0

    matches.forEach((match, i) => {
      result += text.slice(lastIndex, match.index)
      result += `<mark class="bg-yellow-200 font-bold">${match.match}</mark>`
      lastIndex = match.index + match.match.length
    })

    result += text.slice(lastIndex)
    return result
  }

  const copyPattern = () => {
    navigator.clipboard.writeText(pattern)
    toast({
      title: "Copied to clipboard",
      description: "Regex pattern copied"
    })
  }

  const copyMatches = () => {
    const matchText = matches.map(m => m.match).join('\n')
    navigator.clipboard.writeText(matchText)
    toast({
      title: "Copied to clipboard",
      description: "All matches copied"
    })
  }

  const loadExample = (examplePattern: string, exampleText: string) => {
    setPattern(examplePattern)
    setTestString(exampleText)
  }

  const commonPatterns = [
    {
      name: "Email Validation",
      pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
      testText: "john@example.com\ninvalid-email\njane.doe@company.co.uk\ntest@domain"
    },
    {
      name: "Phone Numbers",
      pattern: "\\+?1?[-\\s]?\\(?\\d{3}\\)?[-\\s]?\\d{3}[-\\s]?\\d{4}",
      testText: "+1 (555) 123-4567\n555-123-4567\n(555) 123 4567\n15551234567\ninvalid-phone"
    },
    {
      name: "URLs",
      pattern: "https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)",
      testText: "https://example.com\nhttp://www.google.com/search?q=test\nhttps://subdomain.example.co.uk/path\nnot-a-url"
    },
    {
      name: "IP Addresses",
      pattern: "\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b",
      testText: "192.168.1.1\n10.0.0.1\n255.255.255.255\n999.999.999.999\n127.0.0.1"
    },
    {
      name: "Credit Card Numbers",
      pattern: "\\b(?:\\d{4}[-\\s]?){3}\\d{4}\\b",
      testText: "4532-1234-5678-9012\n4532 1234 5678 9012\n4532123456789012\n1234-5678-9012\ninvalid-card"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-4">
            <Search className="h-8 w-8 text-accent" />
            <h1 className="text-3xl font-heading font-bold text-foreground">Regex Tester</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Test and debug regular expressions with live matching, group capture, and common pattern examples.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Input Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Regular Expression</CardTitle>
                <CardDescription>Enter your regex pattern and flags</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="pattern">Pattern</Label>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-mono">/</span>
                    <Input
                      id="pattern"
                      value={pattern}
                      onChange={(e) => setPattern(e.target.value)}
                      placeholder="Enter regex pattern..."
                      className={`font-mono ${!isValid ? 'border-red-500' : ''}`}
                    />
                    <span className="text-lg font-mono">/</span>
                    <Button variant="outline" size="sm" onClick={copyPattern}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  {error && (
                    <p className="text-sm text-red-600 mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {error}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Flags</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="global"
                        checked={flags.global}
                        onCheckedChange={(checked) => setFlags(prev => ({ ...prev, global: !!checked }))}
                      />
                      <Label htmlFor="global" className="text-sm">Global (g)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="ignoreCase"
                        checked={flags.ignoreCase}
                        onCheckedChange={(checked) => setFlags(prev => ({ ...prev, ignoreCase: !!checked }))}
                      />
                      <Label htmlFor="ignoreCase" className="text-sm">Ignore Case (i)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="multiline"
                        checked={flags.multiline}
                        onCheckedChange={(checked) => setFlags(prev => ({ ...prev, multiline: !!checked }))}
                      />
                      <Label htmlFor="multiline" className="text-sm">Multiline (m)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="dotAll"
                        checked={flags.dotAll}
                        onCheckedChange={(checked) => setFlags(prev => ({ ...prev, dotAll: !!checked }))}
                      />
                      <Label htmlFor="dotAll" className="text-sm">Dot All (s)</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Test String</CardTitle>
                <CardDescription>Enter text to test your regex against</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={testString}
                  onChange={(e) => setTestString(e.target.value)}
                  placeholder="Enter test string here..."
                  rows={8}
                  className="font-mono text-sm"
                />
              </CardContent>
            </Card>

            {/* Common Patterns */}
            <Card>
              <CardHeader>
                <CardTitle>Common Patterns</CardTitle>
                <CardDescription>Click to load example patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {commonPatterns.map((example, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      onClick={() => loadExample(example.pattern, example.testText)}
                      className="w-full h-auto p-3 text-left justify-start"
                    >
                      <div>
                        <div className="font-medium">{example.name}</div>
                        <div className="text-xs text-gray-500 font-mono mt-1 truncate">
                          {example.pattern}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>Test Results</span>
                  {isValid && matches.length > 0 && (
                    <Badge className="bg-green-100 text-green-800">
                      {matches.length} match{matches.length !== 1 ? 'es' : ''}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>Live regex matching results</CardDescription>
              </CardHeader>
              <CardContent>
                {isValid ? (
                  <div className="space-y-4">
                    {/* Highlighted Text */}
                    <div>
                      <Label className="text-sm font-medium">Highlighted Matches</Label>
                      <div 
                        className="mt-2 p-3 bg-gray-50 border rounded font-mono text-sm whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ 
                          __html: highlightMatches(testString, matches) 
                        }}
                      />
                    </div>

                    {/* Match Details */}
                    {matches.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm font-medium">Match Details</Label>
                          <Button variant="outline" size="sm" onClick={copyMatches}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Matches
                          </Button>
                        </div>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {matches.map((match, index) => (
                            <div key={index} className="p-3 bg-white border rounded">
                              <div className="flex items-center justify-between mb-2">
                                <Badge variant="outline">Match {index + 1}</Badge>
                                <span className="text-xs text-gray-500">Index: {match.index}</span>
                              </div>
                              <div className="font-mono text-sm bg-gray-50 p-2 rounded">
                                "{match.match}"
                              </div>
                              {match.groups.length > 0 && (
                                <div className="mt-2">
                                  <Label className="text-xs font-medium">Groups:</Label>
                                  <div className="space-y-1 mt-1">
                                    {match.groups.map((group, groupIndex) => (
                                      <div key={groupIndex} className="text-xs">
                                        <span className="text-gray-500">Group {groupIndex + 1}:</span>
                                        <span className="font-mono ml-2">"{group}"</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {matches.length === 0 && pattern && testString && (
                      <div className="text-center py-8 text-gray-500">
                        <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No matches found</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-red-500">
                    <AlertCircle className="h-12 w-12 mx-auto mb-3" />
                    <p>Invalid regular expression</p>
                    <p className="text-sm mt-2">{error}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Regex Reference */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Reference</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="basics" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="basics">Basics</TabsTrigger>
                    <TabsTrigger value="quantifiers">Quantifiers</TabsTrigger>
                    <TabsTrigger value="groups">Groups</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="basics" className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><code>.</code> - Any character</div>
                      <div><code>\d</code> - Digit (0-9)</div>
                      <div><code>\w</code> - Word character</div>
                      <div><code>\s</code> - Whitespace</div>
                      <div><code>^</code> - Start of string</div>
                      <div><code>$</code> - End of string</div>
                      <div><code>[abc]</code> - Character set</div>
                      <div><code>[^abc]</code> - Negated set</div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="quantifiers" className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><code>*</code> - 0 or more</div>
                      <div><code>+</code> - 1 or more</div>
                      <div><code>?</code> - 0 or 1</div>
                      <div><code>{`{n}`}</code> - Exactly n</div>
                      <div><code>{`{n,}`}</code> - n or more</div>
                      <div><code>{`{n,m}`}</code> - Between n and m</div>
                      <div><code>*?</code> - Non-greedy *</div>
                      <div><code>+?</code> - Non-greedy +</div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="groups" className="space-y-2">
                    <div className="grid grid-cols-1 gap-2 text-xs">
                      <div><code>(abc)</code> - Capturing group</div>
                      <div><code>(?:abc)</code> - Non-capturing group</div>
                      <div><code>(?=abc)</code> - Positive lookahead</div>
                      <div><code>(?!abc)</code> - Negative lookahead</div>
                      <div><code>(?&lt;=abc)</code> - Positive lookbehind</div>
                      <div><code>(?&lt;!abc)</code> - Negative lookbehind</div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}