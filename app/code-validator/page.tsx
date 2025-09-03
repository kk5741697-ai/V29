"use client"

import { TextToolLayout } from "@/components/text-tool-layout"
import { CheckCircle } from "lucide-react"

const codeValidatorExamples = [
  {
    name: "Valid JSON",
    content: `{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "zipCode": "10001"
  },
  "hobbies": ["reading", "coding", "hiking"]
}`,
  },
  {
    name: "Invalid JSON",
    content: `{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "zipCode": "10001"
  },
  "hobbies": ["reading", "coding", "hiking",]
}`,
  },
  {
    name: "HTML Document",
    content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Page</title>
</head>
<body>
    <header>
        <h1>Welcome</h1>
    </header>
    <main>
        <p>This is a test paragraph.</p>
        <div class="container">
            <span>Content here</span>
        </div>
    </main>
</body>
</html>`,
  },
]

const codeValidatorOptions = [
  {
    key: "codeType",
    label: "Code Type",
    type: "select" as const,
    defaultValue: "auto",
    selectOptions: [
      { value: "auto", label: "Auto Detect" },
      { value: "json", label: "JSON" },
      { value: "xml", label: "XML" },
      { value: "html", label: "HTML" },
      { value: "css", label: "CSS" },
      { value: "javascript", label: "JavaScript" },
      { value: "yaml", label: "YAML" },
    ],
  },
  {
    key: "strictMode",
    label: "Strict Validation",
    type: "checkbox" as const,
    defaultValue: true,
  },
  {
    key: "checkSyntax",
    label: "Check Syntax",
    type: "checkbox" as const,
    defaultValue: true,
  },
  {
    key: "validateStructure",
    label: "Validate Structure",
    type: "checkbox" as const,
    defaultValue: true,
  },
  {
    key: "showWarnings",
    label: "Show Warnings",
    type: "checkbox" as const,
    defaultValue: true,
  },
]

function processCodeValidator(input: string, options: any = {}) {
  try {
    const codeType = options.codeType === "auto" ? detectCodeType(input) : options.codeType
    const validation = validateCodeByType(input, codeType, options)
    
    let output = ""
    const issues: string[] = []
    const warnings: string[] = []

    if (validation.isValid) {
      output = "✅ VALID " + codeType.toUpperCase() + "\n\n"
      output += "No syntax errors found.\n"
      
      if (validation.formatted) {
        output += "\n" + "=".repeat(50) + "\n"
        output += "FORMATTED VERSION:\n"
        output += "=".repeat(50) + "\n\n"
        output += validation.formatted
      }
    } else {
      output = "❌ INVALID " + codeType.toUpperCase() + "\n\n"
      output += "Errors found:\n"
      validation.errors?.forEach((error, index) => {
        output += `${index + 1}. ${error}\n`
        issues.push(error)
      })
    }

    if (options.showWarnings && validation.warnings) {
      output += "\n⚠️  WARNINGS:\n"
      validation.warnings.forEach((warning, index) => {
        output += `${index + 1}. ${warning}\n`
        warnings.push(warning)
      })
    }

    const stats = {
      "Code Type": codeType.toUpperCase(),
      "Status": validation.isValid ? "Valid" : "Invalid",
      "Errors": validation.errors?.length || 0,
      "Warnings": validation.warnings?.length || 0,
      "Lines": input.split('\n').length,
    }

    return { output, stats }
  } catch (error) {
    return {
      output: "",
      error: "Code validation failed",
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
  if (trimmed.includes('{') && (trimmed.includes('color:') || trimmed.includes('margin:'))) {
    return "css"
  }
  if (trimmed.includes('function') || trimmed.includes('const') || trimmed.includes('let')) {
    return "javascript"
  }
  
  return "json"
}

function validateCodeByType(input: string, codeType: string, options: any) {
  switch (codeType) {
    case "json":
      return validateJSON(input, options)
    case "xml":
      return validateXML(input, options)
    case "html":
      return validateHTML(input, options)
    case "css":
      return validateCSS(input, options)
    case "javascript":
      return validateJavaScript(input, options)
    case "yaml":
      return validateYAML(input, options)
    default:
      return { isValid: true, warnings: ["Unknown code type"] }
  }
}

function validateJSON(input: string, options: any) {
  try {
    const parsed = JSON.parse(input)
    const formatted = JSON.stringify(parsed, null, 2)
    const warnings: string[] = []
    
    // Check for common issues
    if (input.includes(',]') || input.includes(',}')) {
      warnings.push("Trailing commas detected (not standard JSON)")
    }
    
    if (options.showWarnings) {
      if (typeof parsed === 'object' && Object.keys(parsed).length > 50) {
        warnings.push("Large object with many properties")
      }
    }
    
    return { 
      isValid: true, 
      formatted,
      warnings: warnings.length > 0 ? warnings : undefined
    }
  } catch (error) {
    return { 
      isValid: false, 
      errors: [error instanceof Error ? error.message : "Invalid JSON syntax"]
    }
  }
}

function validateXML(input: string, options: any) {
  try {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(input, "text/xml")
    const parseError = xmlDoc.querySelector("parsererror")
    
    if (parseError) {
      return { 
        isValid: false, 
        errors: ["XML parsing error: " + parseError.textContent]
      }
    }
    
    const warnings: string[] = []
    if (options.showWarnings && !input.includes('<?xml')) {
      warnings.push("Missing XML declaration")
    }
    
    return { 
      isValid: true,
      warnings: warnings.length > 0 ? warnings : undefined
    }
  } catch (error) {
    return { 
      isValid: false, 
      errors: ["XML validation failed"]
    }
  }
}

function validateHTML(input: string, options: any) {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Check for basic HTML structure
  if (!input.includes('<html') && !input.includes('<HTML')) {
    warnings.push("Missing <html> tag")
  }
  
  if (!input.includes('<head') && !input.includes('<HEAD')) {
    warnings.push("Missing <head> section")
  }
  
  if (!input.includes('<body') && !input.includes('<BODY')) {
    warnings.push("Missing <body> section")
  }
  
  // Check for unclosed tags
  const openTags = (input.match(/<[^\/][^>]*>/g) || []).length
  const closeTags = (input.match(/<\/[^>]*>/g) || []).length
  const selfClosing = (input.match(/<[^>]*\/>/g) || []).length
  
  if (openTags - selfClosing !== closeTags) {
    errors.push("Mismatched HTML tags detected")
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    warnings: warnings.length > 0 ? warnings : undefined
  }
}

function validateCSS(input: string, options: any) {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Check for balanced braces
  const openBraces = (input.match(/{/g) || []).length
  const closeBraces = (input.match(/}/g) || []).length
  
  if (openBraces !== closeBraces) {
    errors.push("Mismatched braces in CSS")
  }
  
  // Check for common CSS issues
  if (options.showWarnings) {
    if (input.includes('!important')) {
      warnings.push("Usage of !important detected")
    }
    
    if (input.match(/color:\s*#[0-9a-f]{3,6}/gi)) {
      const colors = input.match(/color:\s*#[0-9a-f]{3,6}/gi) || []
      if (colors.length > 10) {
        warnings.push("Many color declarations found - consider using CSS variables")
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    warnings: warnings.length > 0 ? warnings : undefined
  }
}

function validateJavaScript(input: string, options: any) {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Check for balanced braces and parentheses
  const openBraces = (input.match(/{/g) || []).length
  const closeBraces = (input.match(/}/g) || []).length
  const openParens = (input.match(/\(/g) || []).length
  const closeParens = (input.match(/\)/g) || []).length
  
  if (openBraces !== closeBraces) {
    errors.push("Mismatched braces in JavaScript")
  }
  
  if (openParens !== closeParens) {
    errors.push("Mismatched parentheses in JavaScript")
  }
  
  // Check for common issues
  if (options.showWarnings) {
    if (input.includes('var ')) {
      warnings.push("Usage of 'var' detected - consider using 'let' or 'const'")
    }
    
    if (input.includes('==') && !input.includes('===')) {
      warnings.push("Loose equality (==) detected - consider using strict equality (===)")
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    warnings: warnings.length > 0 ? warnings : undefined
  }
}

function validateYAML(input: string, options: any) {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Basic YAML validation
  const lines = input.split('\n')
  
  lines.forEach((line, index) => {
    if (line.trim() && line.includes(':') && !line.trim().startsWith('#')) {
      const colonIndex = line.indexOf(':')
      const beforeColon = line.substring(0, colonIndex).trim()
      if (!beforeColon) {
        errors.push(`Invalid key on line ${index + 1}`)
      }
    }
  })
  
  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    warnings: warnings.length > 0 ? warnings : undefined
  }
}

export default function CodeValidatorPage() {
  return (
    <TextToolLayout
      title="Code Validator"
      description="Validate syntax and structure of JSON, XML, HTML, CSS, JavaScript, and YAML code with detailed error reporting."
      icon={CheckCircle}
      placeholder="Paste your code here to validate..."
      outputPlaceholder="Validation results will appear here..."
      processFunction={processCodeValidator}
      options={codeValidatorOptions}
      examples={codeValidatorExamples}
      fileExtensions={[".json", ".xml", ".html", ".css", ".js", ".yaml"]}
      supportFileUpload={true}
      supportUrlInput={true}
    />
  )
}