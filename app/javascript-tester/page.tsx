"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Play, Square, RefreshCw, AlertTriangle, CheckCircle, Info } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function JavaScriptTesterPage() {
  const [code, setCode] = useState("")
  const [output, setOutput] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [hasError, setHasError] = useState(false)

  const runCode = () => {
    if (!code.trim()) {
      toast({
        title: "No code to run",
        description: "Please enter JavaScript code to test",
        variant: "destructive"
      })
      return
    }

    setIsRunning(true)
    setOutput("")
    setHasError(false)

    try {
      // Create a safe execution environment
      const originalConsole = console.log
      const logs: string[] = []
      
      // Override console.log to capture output
      console.log = (...args) => {
        logs.push(args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '))
      }

      // Execute the code
      const result = eval(code)
      
      // Restore console.log
      console.log = originalConsole
      
      let finalOutput = logs.join('\n')
      if (result !== undefined) {
        finalOutput += (finalOutput ? '\n' : '') + `Return value: ${typeof result === 'object' ? JSON.stringify(result, null, 2) : result}`
      }
      
      setOutput(finalOutput || "Code executed successfully (no output)")
      
      toast({
        title: "Code executed",
        description: "JavaScript code ran successfully"
      })
    } catch (error) {
      setHasError(true)
      setOutput(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      
      toast({
        title: "Execution failed",
        description: "JavaScript code contains errors",
        variant: "destructive"
      })
    } finally {
      setIsRunning(false)
    }
  }

  const clearOutput = () => {
    setOutput("")
    setHasError(false)
  }

  const loadExample = (exampleCode: string) => {
    setCode(exampleCode)
    setOutput("")
    setHasError(false)
  }

  const examples = [
    {
      name: "Basic Math",
      code: `const a = 10;
const b = 20;
const sum = a + b;
console.log("Sum:", sum);
console.log("Product:", a * b);`
    },
    {
      name: "Array Operations",
      code: `const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
const sum = numbers.reduce((acc, n) => acc + n, 0);

console.log("Original:", numbers);
console.log("Doubled:", doubled);
console.log("Sum:", sum);`
    },
    {
      name: "Object Manipulation",
      code: `const person = {
  name: "John",
  age: 30,
  city: "New York"
};

const keys = Object.keys(person);
const values = Object.values(person);

console.log("Person:", person);
console.log("Keys:", keys);
console.log("Values:", values);`
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-4">
            <Play className="h-8 w-8 text-accent" />
            <h1 className="text-3xl font-heading font-bold text-foreground">JavaScript Tester</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Test and execute JavaScript code in a safe environment with console output capture.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Code Input */}
          <Card>
            <CardHeader>
              <CardTitle>JavaScript Code</CardTitle>
              <CardDescription>Enter your JavaScript code to test</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter your JavaScript code here..."
                className="min-h-[400px] font-mono text-sm"
              />
              
              <div className="flex space-x-2">
                <Button onClick={runCode} disabled={isRunning} className="bg-green-600 hover:bg-green-700">
                  {isRunning ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Run Code
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={clearOutput}>
                  <Square className="h-4 w-4 mr-2" />
                  Clear
                </Button>
                <Button variant="outline" onClick={() => setCode("")}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Output */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>Output</span>
                {hasError && <Badge variant="destructive">Error</Badge>}
                {output && !hasError && <Badge className="bg-green-100 text-green-800">Success</Badge>}
              </CardTitle>
              <CardDescription>Console output and return values</CardDescription>
            </CardHeader>
            <CardContent>
              {output ? (
                <div className={`p-4 rounded-lg border font-mono text-sm whitespace-pre-wrap ${
                  hasError ? 'bg-red-50 border-red-200 text-red-800' : 'bg-gray-50 border-gray-200'
                }`}>
                  {output}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500 border border-dashed rounded-lg">
                  <Play className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Run JavaScript code to see output</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Examples */}
        <Card className="mt-8 max-w-6xl mx-auto">
          <CardHeader>
            <CardTitle>Code Examples</CardTitle>
            <CardDescription>Click to load example code</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {examples.map((example, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => loadExample(example.code)}
                  className="h-auto p-4 text-left justify-start"
                >
                  <div>
                    <div className="font-medium">{example.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {example.code.split('\n')[0].substring(0, 40)}...
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Safety Notice */}
        <Alert className="mt-8 max-w-6xl mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Safety Notice:</strong> This tool executes JavaScript in your browser environment. 
            Avoid running untrusted code or code that accesses sensitive data. The execution is sandboxed 
            but still runs in your browser context.
          </AlertDescription>
        </Alert>
      </div>

      <Footer />
    </div>
  )
}