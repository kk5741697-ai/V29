"use client"

import { TextToolLayout } from "@/components/text-tool-layout"
import { FileSpreadsheet } from "lucide-react"

const jsonToCsvExamples = [
  {
    name: "User Data",
    content: `[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "age": 30,
    "active": true
  },
  {
    "id": 2,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "age": 25,
    "active": false
  },
  {
    "id": 3,
    "name": "Bob Johnson",
    "email": "bob@example.com",
    "age": 35,
    "active": true
  }
]`,
  },
  {
    name: "Product Catalog",
    content: `[
  {
    "sku": "PROD001",
    "name": "Wireless Headphones",
    "price": 99.99,
    "category": "Electronics",
    "inStock": true,
    "tags": ["audio", "wireless"]
  },
  {
    "sku": "PROD002", 
    "name": "Coffee Mug",
    "price": 12.50,
    "category": "Kitchen",
    "inStock": false,
    "tags": ["ceramic", "dishwasher-safe"]
  }
]`,
  },
]

const jsonToCsvOptions = [
  {
    key: "delimiter",
    label: "Delimiter",
    type: "select" as const,
    defaultValue: ",",
    selectOptions: [
      { value: ",", label: "Comma (,)" },
      { value: ";", label: "Semicolon (;)" },
      { value: "\t", label: "Tab" },
      { value: "|", label: "Pipe (|)" },
    ],
  },
  {
    key: "includeHeaders",
    label: "Include Headers",
    type: "checkbox" as const,
    defaultValue: true,
  },
  {
    key: "flattenArrays",
    label: "Flatten Arrays",
    type: "checkbox" as const,
    defaultValue: true,
  },
  {
    key: "quoteStrings",
    label: "Quote String Values",
    type: "checkbox" as const,
    defaultValue: true,
  },
]

function processJsonToCsv(input: string, options: any = {}) {
  try {
    if (!input.trim()) {
      return { output: "", error: "Input cannot be empty" }
    }

    const data = JSON.parse(input)
    
    if (!Array.isArray(data)) {
      return { output: "", error: "JSON must be an array of objects" }
    }

    if (data.length === 0) {
      return { output: "", error: "JSON array is empty" }
    }

    const delimiter = options.delimiter || ","
    const rows: string[] = []

    // Get all unique keys from all objects
    const allKeys = new Set<string>()
    data.forEach((item: any) => {
      if (typeof item === 'object' && item !== null) {
        Object.keys(item).forEach(key => allKeys.add(key))
      }
    })

    const headers = Array.from(allKeys)

    // Add headers if requested
    if (options.includeHeaders) {
      rows.push(headers.join(delimiter))
    }

    // Convert each object to CSV row
    data.forEach((item: any) => {
      const row = headers.map(header => {
        let value = item[header]
        
        if (value === undefined || value === null) {
          return ""
        }
        
        // Handle arrays
        if (Array.isArray(value)) {
          value = options.flattenArrays ? value.join('; ') : JSON.stringify(value)
        } else if (typeof value === 'object') {
          value = JSON.stringify(value)
        } else {
          value = String(value)
        }
        
        // Quote strings if they contain delimiter or quotes
        if (options.quoteStrings && (value.includes(delimiter) || value.includes('"') || value.includes('\n'))) {
          value = `"${value.replace(/"/g, '""')}"`
        }
        
        return value
      })
      
      rows.push(row.join(delimiter))
    })

    const output = rows.join('\n')

    const stats = {
      "Input Objects": data.length,
      "Output Rows": rows.length,
      "Columns": headers.length,
      "Delimiter": delimiter === "\t" ? "Tab" : delimiter,
    }

    return { output, stats }
  } catch (error) {
    return {
      output: "",
      error: error instanceof Error ? error.message : "JSON to CSV conversion failed",
    }
  }
}

export default function JsonToCsvPage() {
  return (
    <TextToolLayout
      title="JSON to CSV Converter"
      description="Convert JSON arrays to CSV format with customizable delimiters and formatting options."
      icon={FileSpreadsheet}
      placeholder="Paste your JSON array here..."
      outputPlaceholder="CSV data will appear here..."
      processFunction={processJsonToCsv}
      options={jsonToCsvOptions}
      examples={jsonToCsvExamples}
      fileExtensions={[".csv"]}
    />
  )
}