"use client"

import { TextToolLayout } from "@/components/text-tool-layout"
import { RefreshCw } from "lucide-react"

const codeConverterExamples = [
  {
    name: "JSON to YAML",
    content: `{
  "name": "MyApp",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.0.0",
    "typescript": "^4.9.0"
  },
  "scripts": {
    "dev": "next dev",
    "build": "next build"
  }
}`,
  },
  {
    name: "CSV to JSON",
    content: `name,age,email,city
John Doe,30,john@example.com,New York
Jane Smith,25,jane@example.com,Los Angeles
Bob Johnson,35,bob@example.com,Chicago`,
  },
  {
    name: "XML to JSON",
    content: `<?xml version="1.0" encoding="UTF-8"?>
<users>
  <user id="1">
    <name>John Doe</name>
    <email>john@example.com</email>
    <age>30</age>
  </user>
  <user id="2">
    <name>Jane Smith</name>
    <email>jane@example.com</email>
    <age>25</age>
  </user>
</users>`,
  },
]

const codeConverterOptions = [
  {
    key: "fromFormat",
    label: "From Format",
    type: "select" as const,
    defaultValue: "json",
    selectOptions: [
      { value: "json", label: "JSON" },
      { value: "yaml", label: "YAML" },
      { value: "xml", label: "XML" },
      { value: "csv", label: "CSV" },
      { value: "toml", label: "TOML" },
      { value: "ini", label: "INI" },
    ],
  },
  {
    key: "toFormat",
    label: "To Format",
    type: "select" as const,
    defaultValue: "yaml",
    selectOptions: [
      { value: "json", label: "JSON" },
      { value: "yaml", label: "YAML" },
      { value: "xml", label: "XML" },
      { value: "csv", label: "CSV" },
      { value: "toml", label: "TOML" },
      { value: "ini", label: "INI" },
    ],
  },
  {
    key: "indent",
    label: "Indentation",
    type: "select" as const,
    defaultValue: 2,
    selectOptions: [
      { value: 2, label: "2 Spaces" },
      { value: 4, label: "4 Spaces" },
      { value: "tab", label: "Tabs" },
    ],
  },
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
]

function processCodeConverter(input: string, options: any = {}) {
  try {
    if (!input.trim()) {
      return { output: "", error: "Input cannot be empty" }
    }

    const { fromFormat, toFormat } = options
    
    if (fromFormat === toFormat) {
      return { output: input, stats: { "Status": "No conversion needed" } }
    }

    // Parse input based on source format
    let data: any
    
    switch (fromFormat) {
      case "json":
        data = JSON.parse(input)
        break
      case "yaml":
        data = parseYAML(input)
        break
      case "xml":
        data = parseXML(input)
        break
      case "csv":
        data = parseCSV(input)
        break
      case "toml":
        data = parseTOML(input)
        break
      case "ini":
        data = parseINI(input)
        break
      default:
        throw new Error(`Unsupported source format: ${fromFormat}`)
    }

    // Convert to target format
    let output: string
    
    switch (toFormat) {
      case "json":
        output = JSON.stringify(data, null, options.indent || 2)
        break
      case "yaml":
        output = convertToYAML(data, options)
        break
      case "xml":
        output = convertToXML(data, options)
        break
      case "csv":
        output = convertToCSV(data, options)
        break
      case "toml":
        output = convertToTOML(data, options)
        break
      case "ini":
        output = convertToINI(data, options)
        break
      default:
        throw new Error(`Unsupported target format: ${toFormat}`)
    }

    const stats = {
      "From Format": fromFormat.toUpperCase(),
      "To Format": toFormat.toUpperCase(),
      "Input Size": `${input.length} chars`,
      "Output Size": `${output.length} chars`,
      "Conversion": "Successful",
    }

    return { output, stats }
  } catch (error) {
    return {
      output: "",
      error: error instanceof Error ? error.message : "Conversion failed",
    }
  }
}

// Simplified parsers (in production, use proper libraries)
function parseYAML(input: string): any {
  // Basic YAML parsing simulation
  const lines = input.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'))
  const result: any = {}
  
  lines.forEach(line => {
    if (line.includes(':')) {
      const [key, value] = line.split(':').map(s => s.trim())
      result[key] = value || ""
    }
  })
  
  return result
}

function parseXML(input: string): any {
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(input, "text/xml")
  return xmlToObject(xmlDoc.documentElement)
}

function xmlToObject(element: Element): any {
  const result: any = {}
  
  if (element.children.length === 0) {
    return element.textContent || ""
  }
  
  Array.from(element.children).forEach(child => {
    const tagName = child.tagName
    const value = xmlToObject(child)
    
    if (result[tagName]) {
      if (!Array.isArray(result[tagName])) {
        result[tagName] = [result[tagName]]
      }
      result[tagName].push(value)
    } else {
      result[tagName] = value
    }
  })
  
  return result
}

function parseCSV(input: string): any[] {
  const lines = input.split('\n').filter(line => line.trim())
  if (lines.length < 2) return []
  
  const headers = lines[0].split(',').map(h => h.trim())
  const data = lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim())
    const obj: any = {}
    headers.forEach((header, index) => {
      obj[header] = values[index] || ""
    })
    return obj
  })
  
  return data
}

function parseTOML(input: string): any {
  // Basic TOML parsing simulation
  const result: any = {}
  const lines = input.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'))
  
  lines.forEach(line => {
    if (line.includes('=')) {
      const [key, value] = line.split('=').map(s => s.trim())
      result[key] = value.replace(/['"]/g, '')
    }
  })
  
  return result
}

function parseINI(input: string): any {
  const result: any = {}
  const lines = input.split('\n').filter(line => line.trim())
  let currentSection = 'default'
  
  lines.forEach(line => {
    const trimmed = line.trim()
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      currentSection = trimmed.slice(1, -1)
      result[currentSection] = {}
    } else if (trimmed.includes('=')) {
      const [key, value] = trimmed.split('=').map(s => s.trim())
      if (!result[currentSection]) result[currentSection] = {}
      result[currentSection][key] = value
    }
  })
  
  return result
}

// Simplified converters
function convertToYAML(data: any, options: any): string {
  const indent = " ".repeat(options.indent || 2)
  return convertObjectToYAML(data, 0, indent)
}

function convertObjectToYAML(obj: any, level: number, indent: string): string {
  if (typeof obj !== 'object' || obj === null) {
    return String(obj)
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => `\n${indent.repeat(level)}- ${convertObjectToYAML(item, level + 1, indent)}`).join('')
  }
  
  return Object.entries(obj).map(([key, value]) => {
    if (typeof value === 'object' && value !== null) {
      return `\n${indent.repeat(level)}${key}:${convertObjectToYAML(value, level + 1, indent)}`
    }
    return `\n${indent.repeat(level)}${key}: ${value}`
  }).join('')
}

function convertToXML(data: any, options: any): string {
  const indent = " ".repeat(options.indent || 2)
  return `<?xml version="1.0" encoding="UTF-8"?>\n<root>\n${convertObjectToXML(data, 1, indent)}\n</root>`
}

function convertObjectToXML(obj: any, level: number, indent: string): string {
  if (typeof obj !== 'object' || obj === null) {
    return String(obj)
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => `${indent.repeat(level)}<item>${convertObjectToXML(item, level + 1, indent)}</item>`).join('\n')
  }
  
  return Object.entries(obj).map(([key, value]) => {
    if (typeof value === 'object' && value !== null) {
      return `${indent.repeat(level)}<${key}>\n${convertObjectToXML(value, level + 1, indent)}\n${indent.repeat(level)}</${key}>`
    }
    return `${indent.repeat(level)}<${key}>${value}</${key}>`
  }).join('\n')
}

function convertToCSV(data: any, options: any): string {
  if (!Array.isArray(data)) {
    data = [data]
  }
  
  if (data.length === 0) return ""
  
  const headers = Object.keys(data[0])
  const csvLines = [headers.join(',')]
  
  data.forEach((item: any) => {
    const values = headers.map(header => item[header] || "")
    csvLines.push(values.join(','))
  })
  
  return csvLines.join('\n')
}

function convertToTOML(data: any, options: any): string {
  return Object.entries(data).map(([key, value]) => {
    if (typeof value === 'object' && value !== null) {
      return `[${key}]\n${Object.entries(value).map(([k, v]) => `${k} = "${v}"`).join('\n')}`
    }
    return `${key} = "${value}"`
  }).join('\n\n')
}

function convertToINI(data: any, options: any): string {
  return Object.entries(data).map(([section, values]) => {
    if (typeof values === 'object' && values !== null) {
      return `[${section}]\n${Object.entries(values).map(([k, v]) => `${k}=${v}`).join('\n')}`
    }
    return `${section}=${values}`
  }).join('\n\n')
}

export default function CodeConverterPage() {
  return (
    <TextToolLayout
      title="Code Converter"
      description="Convert between different code formats: JSON, YAML, XML, CSV, TOML, and INI with validation."
      icon={RefreshCw}
      placeholder="Paste your code here to convert..."
      outputPlaceholder="Converted code will appear here..."
      processFunction={processCodeConverter}
      options={codeConverterOptions}
      examples={codeConverterExamples}
      fileExtensions={[".json", ".yaml", ".xml", ".csv", ".toml", ".ini"]}
      supportFileUpload={true}
      supportUrlInput={true}
    />
  )
}