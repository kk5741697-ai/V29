"use client"

import { TextToolLayout } from "@/components/text-tool-layout"
import { Code } from "lucide-react"

const codeFormatterExamples = [
  {
    name: "Minified JavaScript",
    content: `function calculateTotal(items){let total=0;for(let i=0;i<items.length;i++){total+=items[i].price*items[i].quantity;}return total;}const cart=[{name:"Product A",price:29.99,quantity:2},{name:"Product B",price:15.50,quantity:1}];console.log("Total:",calculateTotal(cart));`,
  },
  {
    name: "Compressed CSS",
    content: `body{margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f5f5f5;}.container{max-width:1200px;margin:0 auto;padding:20px;}.button{background-color:#007bff;color:white;border:none;padding:10px 20px;border-radius:4px;cursor:pointer;}.button:hover{background-color:#0056b3;}`,
  },
  {
    name: "Minified HTML",
    content: `<!DOCTYPE html><html><head><title>Example</title></head><body><div class="container"><h1>Welcome</h1><p>This is a paragraph.</p><ul><li>Item 1</li><li>Item 2</li></ul></div></body></html>`,
  },
]

const codeFormatterOptions = [
  {
    key: "codeType",
    label: "Code Type",
    type: "select" as const,
    defaultValue: "auto",
    selectOptions: [
      { value: "auto", label: "Auto Detect" },
      { value: "javascript", label: "JavaScript" },
      { value: "css", label: "CSS" },
      { value: "html", label: "HTML" },
      { value: "json", label: "JSON" },
      { value: "xml", label: "XML" },
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
    key: "sortProperties",
    label: "Sort Properties (CSS/JSON)",
    type: "checkbox" as const,
    defaultValue: false,
  },
  {
    key: "addSpacing",
    label: "Add Extra Spacing",
    type: "checkbox" as const,
    defaultValue: true,
  },
]

function processCodeFormatter(input: string, options: any = {}) {
  try {
    const codeType = options.codeType === "auto" ? detectCodeType(input) : options.codeType
    let output = ""

    switch (codeType) {
      case "javascript":
        output = beautifyJavaScript(input, options)
        break
      case "css":
        output = beautifyCSS(input, options)
        break
      case "html":
        output = beautifyHTML(input, options)
        break
      case "json":
        output = beautifyJSON(input, options)
        break
      case "xml":
        output = beautifyXML(input, options)
        break
      default:
        output = beautifyGeneric(input, options)
    }

    const originalSize = input.length
    const beautifiedSize = output.length
    const sizeChange = originalSize > 0 ? ((beautifiedSize - originalSize) / originalSize) * 100 : 0

    const stats = {
      "Code Type": codeType.toUpperCase(),
      "Original Size": `${originalSize} chars`,
      "Beautified Size": `${beautifiedSize} chars`,
      "Size Change": `${sizeChange > 0 ? '+' : ''}${sizeChange.toFixed(1)}%`,
      "Lines Added": `${output.split('\n').length - input.split('\n').length}`,
    }

    return { output, stats }
  } catch (error) {
    return {
      output: "",
      error: "Code beautification failed",
    }
  }
}

function detectCodeType(input: string): string {
  const trimmed = input.trim()
  
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return "json"
  }
  if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')) {
    return "html"
  }
  if (trimmed.startsWith('<?xml') || /<\w+[^>]*>/.test(trimmed)) {
    return "xml"
  }
  if (trimmed.includes('{') && (trimmed.includes('color:') || trimmed.includes('margin:') || trimmed.includes('padding:'))) {
    return "css"
  }
  
  return "javascript"
}

function beautifyJavaScript(code: string, options: any): string {
  const indentStr = typeof options.indent === "number" ? " ".repeat(options.indent) : "\t"
  const lines = code.split('\n')
  const result: string[] = []
  let level = 0
  
  lines.forEach(line => {
    const trimmed = line.trim()
    
    if (trimmed === '') {
      if (options.addSpacing) result.push('')
      return
    }
    
    if (trimmed.startsWith('}')) {
      level = Math.max(0, level - 1)
    }
    
    result.push(indentStr.repeat(level) + trimmed)
    
    if (trimmed.endsWith('{')) {
      level++
    }
    
    // Add spacing after function declarations
    if (options.addSpacing && (trimmed.includes('function') || trimmed.includes('=>'))) {
      result.push('')
    }
  })
  
  return result.join('\n')
}

function beautifyCSS(code: string, options: any): string {
  const indentStr = typeof options.indent === "number" ? " ".repeat(options.indent) : "\t"
  let formatted = code
    .replace(/\s*{\s*/g, " {\n")
    .replace(/;\s*/g, ";\n")
    .replace(/\s*}\s*/g, "\n}\n")
    .replace(/,\s*/g, ",\n")
  
  const lines = formatted.split('\n')
  const result: string[] = []
  let level = 0
  
  lines.forEach(line => {
    const trimmed = line.trim()
    
    if (trimmed === '') {
      if (options.addSpacing) result.push('')
      return
    }
    
    if (trimmed === '}') {
      level = Math.max(0, level - 1)
      result.push(indentStr.repeat(level) + trimmed)
      if (options.addSpacing) result.push('')
    } else if (trimmed.endsWith('{')) {
      result.push(indentStr.repeat(level) + trimmed)
      level++
    } else {
      result.push(indentStr.repeat(level) + trimmed)
    }
  })
  
  return result.join('\n')
}

function beautifyHTML(code: string, options: any): string {
  const indentStr = typeof options.indent === "number" ? " ".repeat(options.indent) : "\t"
  const lines = code.split('\n')
  const result: string[] = []
  let level = 0
  
  lines.forEach(line => {
    const trimmed = line.trim()
    
    if (trimmed === '') {
      if (options.addSpacing) result.push('')
      return
    }
    
    if (trimmed.startsWith('</')) {
      level = Math.max(0, level - 1)
    }
    
    result.push(indentStr.repeat(level) + trimmed)
    
    if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>')) {
      level++
    }
  })
  
  return result.join('\n')
}

function beautifyJSON(code: string, options: any): string {
  try {
    const parsed = JSON.parse(code)
    const indent = typeof options.indent === "number" ? options.indent : 2
    return JSON.stringify(parsed, null, indent)
  } catch {
    return code
  }
}

function beautifyXML(code: string, options: any): string {
  const indentStr = typeof options.indent === "number" ? " ".repeat(options.indent) : "\t"
  let formatted = code.replace(/></g, ">\n<")
  
  const lines = formatted.split('\n')
  const result: string[] = []
  let level = 0
  
  lines.forEach(line => {
    const trimmed = line.trim()
    
    if (trimmed === '') return
    
    if (trimmed.startsWith('</')) {
      level = Math.max(0, level - 1)
    }
    
    result.push(indentStr.repeat(level) + trimmed)
    
    if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>')) {
      level++
    }
  })
  
  return result.join('\n')
}

function beautifyGeneric(code: string, options: any): string {
  const indentStr = typeof options.indent === "number" ? " ".repeat(options.indent) : "\t"
  return code.split('\n').map(line => {
    const trimmed = line.trim()
    return trimmed ? indentStr + trimmed : ''
  }).join('\n')
}

function validateCode(input: string) {
  if (!input.trim()) {
    return { isValid: false, error: "Input cannot be empty" }
  }
  return { isValid: true }
}

export default function CodeFormatterPage() {
  return (
    <TextToolLayout
      title="Code Formatter"
      description="Beautify and format minified code with proper indentation and spacing for better readability."
      icon={Code}
      placeholder="Paste your minified code here..."
      outputPlaceholder="Beautified code will appear here..."
      processFunction={processCodeFormatter}
      validateFunction={validateCode}
      options={codeFormatterOptions}
      examples={codeFormatterExamples}
      fileExtensions={[".js", ".css", ".html", ".json", ".xml"]}
      supportFileUpload={true}
      supportUrlInput={true}
    />
  )
}