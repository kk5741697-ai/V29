"use client"

import { TextToolLayout } from "@/components/text-tool-layout"
import { FileCode } from "lucide-react"

const goExamples = [
  {
    name: "Go Web Server",
    content: `package main
import("fmt";"net/http";"encoding/json";"log";"time")
type User struct{ID int \`json:"id"\`;Name string \`json:"name"\`;Email string \`json:"email"\`;CreatedAt time.Time \`json:"created_at"\`}
var users=[]User{{ID:1,Name:"John Doe",Email:"john@example.com",CreatedAt:time.Now()},{ID:2,Name:"Jane Smith",Email:"jane@example.com",CreatedAt:time.Now()}}
func getUsersHandler(w http.ResponseWriter,r *http.Request){w.Header().Set("Content-Type","application/json");if err:=json.NewEncoder(w).Encode(users);err!=nil{http.Error(w,"Failed to encode users",http.StatusInternalServerError);return}}
func createUserHandler(w http.ResponseWriter,r *http.Request){if r.Method!=http.MethodPost{http.Error(w,"Method not allowed",http.StatusMethodNotAllowed);return}var newUser User;if err:=json.NewDecoder(r.Body).Decode(&newUser);err!=nil{http.Error(w,"Invalid JSON",http.StatusBadRequest);return}newUser.ID=len(users)+1;newUser.CreatedAt=time.Now();users=append(users,newUser);w.Header().Set("Content-Type","application/json");w.WriteHeader(http.StatusCreated);json.NewEncoder(w).Encode(newUser)}
func main(){http.HandleFunc("/users",getUsersHandler);http.HandleFunc("/users/create",createUserHandler);fmt.Println("Server starting on :8080");log.Fatal(http.ListenAndServe(":8080",nil))}`,
  },
  {
    name: "Go Structs and Methods",
    content: `package main
import("fmt";"math";"errors")
type Shape interface{Area()float64;Perimeter()float64}
type Rectangle struct{Width float64;Height float64}
func(r Rectangle)Area()float64{return r.Width*r.Height}
func(r Rectangle)Perimeter()float64{return 2*(r.Width+r.Height)}
type Circle struct{Radius float64}
func(c Circle)Area()float64{return math.Pi*c.Radius*c.Radius}
func(c Circle)Perimeter()float64{return 2*math.Pi*c.Radius}
func calculateTotalArea(shapes[]Shape)float64{total:=0.0;for _,shape:=range shapes{total+=shape.Area()};return total}
func main(){shapes:=[]Shape{Rectangle{Width:10,Height:5},Circle{Radius:3},Rectangle{Width:7,Height:7}};totalArea:=calculateTotalArea(shapes);fmt.Printf("Total area: %.2f\n",totalArea);for i,shape:=range shapes{fmt.Printf("Shape %d: Area=%.2f, Perimeter=%.2f\n",i+1,shape.Area(),shape.Perimeter())}}`,
  },
]

const goOptions = [
  {
    key: "format",
    label: "Format",
    type: "select" as const,
    defaultValue: "beautify",
    selectOptions: [
      { value: "beautify", label: "Beautify" },
      { value: "minify", label: "Minify" },
    ],
  },
  {
    key: "indent",
    label: "Indentation",
    type: "select" as const,
    defaultValue: "tab",
    selectOptions: [
      { value: 2, label: "2 Spaces" },
      { value: 4, label: "4 Spaces" },
      { value: "tab", label: "Tabs (Go Standard)" },
    ],
  },
  {
    key: "sortImports",
    label: "Sort Imports",
    type: "checkbox" as const,
    defaultValue: true,
  },
  {
    key: "groupImports",
    label: "Group Imports",
    type: "checkbox" as const,
    defaultValue: true,
  },
  {
    key: "removeComments",
    label: "Remove Comments",
    type: "checkbox" as const,
    defaultValue: false,
  },
]

function processGo(input: string, options: any = {}) {
  try {
    let output = input

    // Remove comments if requested
    if (options.removeComments) {
      output = output.replace(/\/\/.*$/gm, "")
      output = output.replace(/\/\*[\s\S]*?\*\//g, "")
    }

    // Sort and group imports
    if (options.sortImports || options.groupImports) {
      output = formatGoImports(output, options)
    }

    if (options.format === "minify") {
      output = output
        .replace(/\s+/g, " ")
        .replace(/;\s*}/g, "}")
        .replace(/\s*{\s*/g, "{")
        .trim()
    } else {
      // Beautify Go
      const indentStr = options.indent === "tab" ? "\t" : " ".repeat(options.indent || 4)
      output = beautifyGo(output, indentStr)
    }

    const stats = {
      "Original Size": `${input.length} chars`,
      "Formatted Size": `${output.length} chars`,
      "Functions": `${(input.match(/func\s+\w+/g) || []).length}`,
      "Structs": `${(input.match(/type\s+\w+\s+struct/g) || []).length}`,
      "Interfaces": `${(input.match(/type\s+\w+\s+interface/g) || []).length}`,
      "Imports": `${(input.match(/import\s*\(/g) || []).length + (input.match(/import\s+"[^"]+"/g) || []).length}`,
    }

    return { output, stats }
  } catch (error) {
    return {
      output: "",
      error: "Go formatting failed",
    }
  }
}

function formatGoImports(code: string, options: any): string {
  const lines = code.split('\n')
  const imports: string[] = []
  const standardImports: string[] = []
  const thirdPartyImports: string[] = []
  const otherLines: string[] = []
  let inImportBlock = false
  
  lines.forEach(line => {
    const trimmed = line.trim()
    
    if (trimmed.startsWith('import (')) {
      inImportBlock = true
      return
    }
    
    if (inImportBlock && trimmed === ')') {
      inImportBlock = false
      return
    }
    
    if (inImportBlock || trimmed.startsWith('import "')) {
      const importLine = trimmed.replace(/^import\s*/, '').replace(/[()]/g, '').trim()
      if (importLine) {
        // Categorize imports
        if (importLine.includes('.') || importLine.includes('/')) {
          thirdPartyImports.push(importLine)
        } else {
          standardImports.push(importLine)
        }
      }
    } else {
      otherLines.push(line)
    }
  })
  
  if (options.sortImports) {
    standardImports.sort()
    thirdPartyImports.sort()
  }
  
  let result = ""
  
  // Add package declaration and other non-import lines first
  const packageLine = otherLines.find(line => line.trim().startsWith('package '))
  if (packageLine) {
    result += packageLine + '\n\n'
    otherLines.splice(otherLines.indexOf(packageLine), 1)
  }
  
  // Add imports
  if (standardImports.length > 0 || thirdPartyImports.length > 0) {
    if (options.groupImports && standardImports.length > 0 && thirdPartyImports.length > 0) {
      result += 'import (\n'
      standardImports.forEach(imp => result += `\t${imp}\n`)
      result += '\n'
      thirdPartyImports.forEach(imp => result += `\t${imp}\n`)
      result += ')\n\n'
    } else {
      result += 'import (\n'
      standardImports.concat(thirdPartyImports).forEach(imp => result += `\t${imp}\n`)
      result += ')\n\n'
    }
  }
  
  // Add remaining code
  result += otherLines.join('\n')
  
  return result
}

function beautifyGo(code: string, indent: string): string {
  const lines = code.split('\n')
  const result: string[] = []
  let level = 0
  
  lines.forEach(line => {
    const trimmed = line.trim()
    
    if (trimmed === '') {
      result.push('')
      return
    }
    
    // Decrease indent for closing braces
    if (trimmed === '}' || trimmed.startsWith('} ')) {
      level = Math.max(0, level - 1)
    }
    
    result.push(indent.repeat(level) + trimmed)
    
    // Increase indent for opening braces
    if (trimmed.endsWith('{')) {
      level++
    }
  })
  
  return result.join('\n')
}

function validateGo(input: string) {
  if (!input.trim()) {
    return { isValid: false, error: "Input cannot be empty" }
  }
  
  // Basic Go validation
  const openBraces = (input.match(/{/g) || []).length
  const closeBraces = (input.match(/}/g) || []).length
  
  if (openBraces !== closeBraces) {
    return { isValid: false, error: "Mismatched braces in Go code" }
  }
  
  if (!input.includes('package ')) {
    return { isValid: false, error: "Go code must include a package declaration" }
  }
  
  return { isValid: true }
}

export default function GoFormatterPage() {
  return (
    <TextToolLayout
      title="Go Formatter"
      description="Format and beautify Go code following Go standards with import grouping and gofmt-style formatting."
      icon={FileCode}
      placeholder="Paste your Go code here..."
      outputPlaceholder="Formatted Go will appear here..."
      processFunction={processGo}
      validateFunction={validateGo}
      options={goOptions}
      examples={goExamples}
      fileExtensions={[".go"]}
      supportFileUpload={true}
      supportUrlInput={true}
    />
  )
}