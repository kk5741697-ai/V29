"use client"

import { TextToolLayout } from "@/components/text-tool-layout"
import { FileCode } from "lucide-react"

const jsonToTomlExamples = [
  {
    name: "Simple Object",
    content: `{
  "name": "My App",
  "version": "1.0.0",
  "description": "A sample application"
}`,
  },
  {
    name: "Nested Configuration",
    content: `{
  "database": {
    "host": "localhost",
    "port": 5432,
    "name": "mydb",
    "credentials": {
      "username": "admin",
      "password": "secret"
    }
  },
  "server": {
    "port": 3000,
    "ssl": true
  }
}`,
  },
  {
    name: "Array Data",
    content: `{
  "dependencies": ["react", "next", "typescript"],
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "config": {
    "features": ["auth", "api", "ui"],
    "environment": "production"
  }
}`,
  },
]

const jsonToTomlOptions = [
  {
    key: "preserveComments",
    label: "Preserve Comments",
    type: "checkbox" as const,
    defaultValue: true,
  },
  {
    key: "sortKeys",
    label: "Sort Keys",
    type: "checkbox" as const,
    defaultValue: false,
  },
  {
    key: "indentSize",
    label: "Indent Size",
    type: "select" as const,
    defaultValue: 2,
    selectOptions: [
      { value: "2", label: "2 Spaces" },
      { value: "4", label: "4 Spaces" },
    ],
  },
]

function processJsonToToml(input: string, options: any = {}) {
  try {
    if (!input.trim()) {
      return { output: "", error: "Input cannot be empty" }
    }

    // Parse JSON
    const jsonData = JSON.parse(input)
    
    // Convert to TOML format
    const tomlOutput = convertToToml(jsonData, options)
    
    const stats = {
      "Input Format": "JSON",
      "Output Format": "TOML",
      "Objects": countObjects(jsonData),
      "Arrays": countArrays(jsonData),
      "Properties": countProperties(jsonData),
    }

    return { output: tomlOutput, stats }
  } catch (error) {
    return {
      output: "",
      error: error instanceof Error ? error.message : "Invalid JSON format",
    }
  }
}

function convertToToml(obj: any, options: any = {}, depth = 0): string {
  const indent = " ".repeat((options.indentSize || 2) * depth)
  let toml = ""
  
  if (typeof obj === "object" && obj !== null && !Array.isArray(obj)) {
    const keys = options.sortKeys ? Object.keys(obj).sort() : Object.keys(obj)
    
    keys.forEach(key => {
      const value = obj[key]
      
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        // Nested object - create section
        toml += `\n${indent}[${key}]\n`
        toml += convertToToml(value, options, depth + 1)
      } else if (Array.isArray(value)) {
        // Array
        if (value.every(item => typeof item !== "object")) {
          // Simple array
          const arrayStr = value.map(item => 
            typeof item === "string" ? `"${item}"` : item
          ).join(", ")
          toml += `${indent}${key} = [${arrayStr}]\n`
        } else {
          // Array of objects
          value.forEach((item, index) => {
            toml += `\n${indent}[[${key}]]\n`
            toml += convertToToml(item, options, depth + 1)
          })
        }
      } else {
        // Simple value
        const formattedValue = typeof value === "string" ? `"${value}"` : value
        toml += `${indent}${key} = ${formattedValue}\n`
      }
    })
  }
  
  return toml
}

function countObjects(obj: any): number {
  let count = 0
  if (typeof obj === "object" && obj !== null && !Array.isArray(obj)) {
    count = 1
    Object.values(obj).forEach(value => {
      count += countObjects(value)
    })
  } else if (Array.isArray(obj)) {
    obj.forEach(item => {
      count += countObjects(item)
    })
  }
  return count
}

function countArrays(obj: any): number {
  let count = 0
  if (Array.isArray(obj)) {
    count = 1
    obj.forEach(item => {
      count += countArrays(item)
    })
  } else if (typeof obj === "object" && obj !== null) {
    Object.values(obj).forEach(value => {
      count += countArrays(value)
    })
  }
  return count
}

function countProperties(obj: any): number {
  let count = 0
  if (typeof obj === "object" && obj !== null && !Array.isArray(obj)) {
    count = Object.keys(obj).length
    Object.values(obj).forEach(value => {
      count += countProperties(value)
    })
  } else if (Array.isArray(obj)) {
    obj.forEach(item => {
      count += countProperties(item)
    })
  }
  return count
}

function validateJson(input: string) {
  if (!input.trim()) {
    return { isValid: false, error: "Input cannot be empty" }
  }
  
  try {
    JSON.parse(input)
    return { isValid: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Invalid JSON format"
    return { 
      isValid: false, 
      error: errorMessage
    }
  }
}

export default function JsonToTomlConverterPage() {
  return (
    <TextToolLayout
      title="JSON to TOML Converter"
      description="Convert JSON data to TOML format with proper formatting and validation."
      icon={FileCode}
      placeholder="Paste or type your JSON data here..."
      outputPlaceholder="Converted TOML will appear here..."
      processFunction={processJsonToToml}
      validateFunction={validateJson}
      options={jsonToTomlOptions}
      examples={jsonToTomlExamples}
      fileExtensions={[".toml", ".tml"]}
    />
  )
}