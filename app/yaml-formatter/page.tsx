"use client"

import { TextToolLayout } from "@/components/text-tool-layout"
import { FileText } from "lucide-react"

const yamlExamples = [
  {
    name: "Configuration",
    content: `name: MyApp
version: 1.0.0
description: A sample application
database:
  host: localhost
  port: 5432
  name: mydb
  credentials:
    username: admin
    password: secret
server:
  port: 3000
  ssl: true
features:
  - authentication
  - api
  - dashboard`,
  },
  {
    name: "Docker Compose",
    content: `version: '3.8'
services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - db
  db:
    image: postgres:13
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - db_data:/var/lib/postgresql/data
volumes:
  db_data:`,
  },
]

const yamlOptions = [
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
    defaultValue: 2,
    selectOptions: [
      { value: 2, label: "2 Spaces" },
      { value: 4, label: "4 Spaces" },
    ],
  },
  {
    key: "sortKeys",
    label: "Sort Keys",
    type: "checkbox" as const,
    defaultValue: false,
  },
]

function processYAML(input: string, options: any = {}) {
  try {
    if (!input.trim()) {
      return { output: "", error: "Input cannot be empty" }
    }

    let output = input

    if (options.format === "minify") {
      // Basic YAML minification
      output = output
        .replace(/\n\s*\n/g, '\n')
        .replace(/^\s+$/gm, '')
        .trim()
    } else {
      // Beautify YAML
      const indentSize = options.indent || 2
      output = beautifyYAML(output, indentSize, options.sortKeys)
    }

    const stats = {
      "Original Size": `${input.length} chars`,
      "Formatted Size": `${output.length} chars`,
      "Lines": output.split('\n').length,
      "Keys": (output.match(/^\s*\w+:/gm) || []).length,
      "Arrays": (output.match(/^\s*-\s/gm) || []).length,
    }

    return { output, stats }
  } catch (error) {
    return {
      output: "",
      error: "YAML formatting failed",
    }
  }
}

function beautifyYAML(yaml: string, indentSize: number, sortKeys: boolean): string {
  const lines = yaml.split('\n')
  const result: string[] = []
  const indentStr = " ".repeat(indentSize)
  
  let currentLevel = 0
  
  lines.forEach(line => {
    const trimmed = line.trim()
    
    if (trimmed === '') {
      result.push('')
      return
    }
    
    // Calculate indentation level
    const leadingSpaces = line.length - line.trimStart().length
    const level = Math.floor(leadingSpaces / indentSize)
    
    result.push(indentStr.repeat(level) + trimmed)
  })
  
  return result.join('\n')
}

function validateYAML(input: string) {
  if (!input.trim()) {
    return { isValid: false, error: "Input cannot be empty" }
  }
  
  // Basic YAML validation
  const lines = input.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.trim() && line.includes(':') && !line.trim().startsWith('#')) {
      const colonIndex = line.indexOf(':')
      const beforeColon = line.substring(0, colonIndex).trim()
      if (!beforeColon) {
        return { isValid: false, error: `Invalid key on line ${i + 1}` }
      }
    }
  }
  
  return { isValid: true }
}

export default function YAMLFormatterPage() {
  return (
    <TextToolLayout
      title="YAML Formatter"
      description="Format, validate, and beautify YAML configuration files with proper indentation and structure."
      icon={FileText}
      placeholder="Paste your YAML here..."
      outputPlaceholder="Formatted YAML will appear here..."
      processFunction={processYAML}
      validateFunction={validateYAML}
      options={yamlOptions}
      examples={yamlExamples}
      fileExtensions={[".yml", ".yaml"]}
    />
  )
}