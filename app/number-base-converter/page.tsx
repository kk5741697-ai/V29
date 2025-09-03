"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator, Copy, ArrowUpDown } from "lucide-react"
import { toast } from "@/hooks/use-toast"

const numberBases = [
  { value: "2", label: "Binary (Base 2)", example: "1010" },
  { value: "8", label: "Octal (Base 8)", example: "12" },
  { value: "10", label: "Decimal (Base 10)", example: "10" },
  { value: "16", label: "Hexadecimal (Base 16)", example: "A" },
]

export default function NumberBaseConverterPage() {
  const [inputValue, setInputValue] = useState("10")
  const [fromBase, setFromBase] = useState("10")
  const [toBase, setToBase] = useState("2")
  const [result, setResult] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    convertNumber()
  }, [inputValue, fromBase, toBase])

  const convertNumber = () => {
    try {
      if (!inputValue.trim()) {
        setResult("")
        setError("")
        return
      }

      // Validate input for the selected base
      if (!isValidForBase(inputValue, parseInt(fromBase))) {
        setError(`Invalid input for base ${fromBase}`)
        setResult("")
        return
      }

      // Convert to decimal first
      const decimalValue = parseInt(inputValue, parseInt(fromBase))
      
      if (isNaN(decimalValue)) {
        setError("Invalid number")
        setResult("")
        return
      }

      // Convert to target base
      const convertedValue = decimalValue.toString(parseInt(toBase)).toUpperCase()
      setResult(convertedValue)
      setError("")
    } catch (error) {
      setError("Conversion failed")
      setResult("")
    }
  }

  const isValidForBase = (value: string, base: number): boolean => {
    const validChars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".substring(0, base)
    return value.toUpperCase().split("").every(char => validChars.includes(char))
  }

  const swapBases = () => {
    const temp = fromBase
    setFromBase(toBase)
    setToBase(temp)
    setInputValue(result || "")
  }

  const copyResult = () => {
    navigator.clipboard.writeText(result)
    toast({
      title: "Copied to clipboard",
      description: "Converted number copied"
    })
  }

  const loadExample = (base: string) => {
    const examples = {
      "2": "1010",
      "8": "12",
      "10": "10",
      "16": "A"
    }
    setInputValue(examples[base as keyof typeof examples] || "10")
    setFromBase(base)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-4">
            <Calculator className="h-8 w-8 text-accent" />
            <h1 className="text-3xl font-heading font-bold text-foreground">Number Base Converter</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Convert numbers between different bases: binary, decimal, hexadecimal, and octal with validation and examples.
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Main Converter */}
          <Card>
            <CardHeader>
              <CardTitle>Number Base Conversion</CardTitle>
              <CardDescription>Enter a number and select source and target bases</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Input */}
              <div>
                <Label htmlFor="input-number">Input Number</Label>
                <Input
                  id="input-number"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value.toUpperCase())}
                  placeholder="Enter number"
                  className="text-lg font-mono"
                />
                {error && (
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                )}
              </div>

              {/* Base Selection */}
              <div className="grid grid-cols-5 gap-4 items-end">
                <div className="col-span-2">
                  <Label htmlFor="from-base">From Base</Label>
                  <Select value={fromBase} onValueChange={setFromBase}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {numberBases.map((base) => (
                        <SelectItem key={base.value} value={base.value}>
                          {base.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-center">
                  <Button variant="outline" size="icon" onClick={swapBases}>
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </div>

                <div className="col-span-2">
                  <Label htmlFor="to-base">To Base</Label>
                  <Select value={toBase} onValueChange={setToBase}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {numberBases.map((base) => (
                        <SelectItem key={base.value} value={base.value}>
                          {base.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Result */}
              <div className="p-6 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-2">Converted Number</div>
                  <div className="text-3xl font-bold font-mono">
                    {result || "0"}
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    {inputValue} (base {fromBase}) = {result} (base {toBase})
                  </div>
                  <Button variant="outline" size="sm" onClick={copyResult} disabled={!result} className="mt-3">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Result
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Examples */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Examples</CardTitle>
              <CardDescription>Click to load example numbers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {numberBases.map((base) => (
                  <Button
                    key={base.value}
                    variant="outline"
                    onClick={() => loadExample(base.value)}
                    className="h-auto p-3 text-left justify-start"
                  >
                    <div>
                      <div className="font-medium">{base.label.split(" ")[0]}</div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {base.example}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Conversion Table */}
          <Card>
            <CardHeader>
              <CardTitle>Common Conversions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Decimal</th>
                      <th className="text-left p-2">Binary</th>
                      <th className="text-left p-2">Octal</th>
                      <th className="text-left p-2">Hexadecimal</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono">
                    {Array.from({ length: 16 }, (_, i) => (
                      <tr key={i} className="border-b">
                        <td className="p-2">{i}</td>
                        <td className="p-2">{i.toString(2)}</td>
                        <td className="p-2">{i.toString(8)}</td>
                        <td className="p-2">{i.toString(16).toUpperCase()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}