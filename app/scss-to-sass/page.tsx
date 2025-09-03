"use client"

import { TextToolLayout } from "@/components/text-tool-layout"
import { Palette } from "lucide-react"

const scssToSassExamples = [
  {
    name: "Basic SCSS",
    content: `$primary-color: #3498db;
$secondary-color: #2ecc71;
$font-size: 16px;

.header {
  background-color: $primary-color;
  color: white;
  padding: 20px;
  
  .nav {
    display: flex;
    justify-content: space-between;
    
    a {
      color: white;
      text-decoration: none;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
}`,
  },
  {
    name: "Mixins and Functions",
    content: `@mixin button-style($bg-color, $text-color) {
  background-color: $bg-color;
  color: $text-color;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    opacity: 0.8;
  }
}

.btn-primary {
  @include button-style(#007bff, white);
}

.btn-secondary {
  @include button-style(#6c757d, white);
}`,
  },
  {
    name: "Nested Rules",
    content: `$breakpoints: (
  small: 576px,
  medium: 768px,
  large: 992px
);

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
  
  @media (max-width: map-get($breakpoints, medium)) {
    padding: 0 10px;
  }
  
  .content {
    display: grid;
    grid-template-columns: 1fr 3fr;
    gap: 20px;
    
    .sidebar {
      background: #f8f9fa;
      padding: 20px;
    }
    
    .main {
      padding: 20px;
    }
  }
}`,
  },
]

const scssToSassOptions = [
  {
    key: "indentType",
    label: "Indentation",
    type: "select" as const,
    defaultValue: "spaces",
    selectOptions: [
      { value: "spaces", label: "2 Spaces" },
      { value: "tabs", label: "Tabs" },
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
    label: "Sort Properties",
    type: "checkbox" as const,
    defaultValue: false,
  },
]

function processScssToSass(input: string, options: any = {}) {
  try {
    if (!input.trim()) {
      return { output: "", error: "Input cannot be empty" }
    }

    let output = input
    
    // Remove semicolons
    output = output.replace(/;/g, "")
    
    // Remove braces and adjust indentation
    output = convertBracesToIndentation(output, options.indentType === "tabs" ? "\t" : "  ")
    
    // Remove comments if not preserving
    if (!options.preserveComments) {
      output = output.replace(/\/\*[\s\S]*?\*\//g, "")
      output = output.replace(/\/\/.*$/gm, "")
    }
    
    // Sort properties if requested
    if (options.sortProperties) {
      output = sortSassProperties(output)
    }
    
    // Clean up extra whitespace
    output = output.replace(/\n\s*\n\s*\n/g, "\n\n")
    output = output.trim()

    const stats = {
      "Input Format": "SCSS",
      "Output Format": "SASS",
      "Lines": output.split('\n').length,
      "Variables": (output.match(/\$[\w-]+/g) || []).length,
      "Mixins": (output.match(/@mixin/g) || []).length,
      "Selectors": (output.match(/^[.#]?[\w-]+\s*$/gm) || []).length,
    }

    return { output, stats }
  } catch (error) {
    return {
      output: "",
      error: error instanceof Error ? error.message : "SCSS to SASS conversion failed",
    }
  }
}

function convertBracesToIndentation(scss: string, indentStr: string): string {
  const lines = scss.split('\n')
  const result: string[] = []
  let indentLevel = 0
  
  lines.forEach(line => {
    const trimmedLine = line.trim()
    
    if (trimmedLine === '') {
      result.push('')
      return
    }
    
    // Handle closing braces
    if (trimmedLine === '}') {
      indentLevel = Math.max(0, indentLevel - 1)
      return
    }
    
    // Add current line with proper indentation
    const indent = indentStr.repeat(indentLevel)
    
    if (trimmedLine.endsWith('{')) {
      // Remove opening brace and add line
      const lineWithoutBrace = trimmedLine.slice(0, -1).trim()
      result.push(indent + lineWithoutBrace)
      indentLevel++
    } else {
      result.push(indent + trimmedLine)
    }
  })
  
  return result.join('\n')
}

function sortSassProperties(sass: string): string {
  const lines = sass.split('\n')
  const result: string[] = []
  let currentBlock: string[] = []
  let currentIndent = ""
  
  lines.forEach(line => {
    const trimmed = line.trim()
    const indent = line.match(/^\s*/)?.[0] || ""
    
    if (trimmed === "" || trimmed.startsWith('$') || trimmed.startsWith('@') || 
        trimmed.includes(':') === false) {
      // Not a property, flush current block and add line
      if (currentBlock.length > 0) {
        currentBlock.sort()
        result.push(...currentBlock.map(prop => currentIndent + prop))
        currentBlock = []
      }
      result.push(line)
      currentIndent = indent
    } else {
      // Property line, add to current block
      currentBlock.push(trimmed)
      currentIndent = indent
    }
  })
  
  // Flush remaining block
  if (currentBlock.length > 0) {
    currentBlock.sort()
    result.push(...currentBlock.map(prop => currentIndent + prop))
  }
  
  return result.join('\n')
}

function validateScss(input: string) {
  if (!input.trim()) {
    return { isValid: false, error: "Input cannot be empty" }
  }
  
  // Basic SCSS validation
  const openBraces = (input.match(/{/g) || []).length
  const closeBraces = (input.match(/}/g) || []).length
  
  if (openBraces !== closeBraces) {
    return { isValid: false, error: "Mismatched braces in SCSS" }
  }
  
  return { isValid: true }
}

export default function ScssToSassPage() {
  return (
    <TextToolLayout
      title="SCSS to SASS"
      description="Convert SCSS (Sassy CSS) to SASS indented syntax format."
      icon={Palette}
      placeholder="Paste or type your SCSS here..."
      outputPlaceholder="Converted SASS will appear here..."
      processFunction={processScssToSass}
      validateFunction={validateScss}
      options={scssToSassOptions}
      examples={scssToSassExamples}
      fileExtensions={[".sass"]}
    />
  )
}