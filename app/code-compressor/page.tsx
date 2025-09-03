"use client"

import { TextToolLayout } from "@/components/text-tool-layout"
import { Archive } from "lucide-react"

const codeCompressorExamples = [
  {
    name: "JavaScript with Comments",
    content: `// This is a user management system
function UserManager() {
  // Initialize user array
  this.users = [];
  
  // Add a new user
  this.addUser = function(name, email) {
    // Validate input
    if (!name || !email) {
      throw new Error('Name and email are required');
    }
    
    // Create user object
    const user = {
      id: Date.now(),
      name: name,
      email: email,
      created: new Date()
    };
    
    // Add to array
    this.users.push(user);
    return user;
  };
}`,
  },
  {
    name: "CSS with Spacing",
    content: `/* Main layout styles */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #ffffff;
}

/* Button styles */
.button {
  display: inline-block;
  padding: 12px 24px;
  background-color: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.button:hover {
  background-color: #0056b3;
}`,
  },
]

const codeCompressorOptions = [
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
    ],
  },
  {
    key: "compressionLevel",
    label: "Compression Level",
    type: "select" as const,
    defaultValue: "medium",
    selectOptions: [
      { value: "light", label: "Light (Safe compression)" },
      { value: "medium", label: "Medium (Balanced)" },
      { value: "heavy", label: "Heavy (Aggressive)" },
      { value: "extreme", label: "Extreme (Maximum)" },
    ],
  },
  {
    key: "removeComments",
    label: "Remove Comments",
    type: "checkbox" as const,
    defaultValue: true,
  },
  {
    key: "removeWhitespace",
    label: "Remove Whitespace",
    type: "checkbox" as const,
    defaultValue: true,
  },
  {
    key: "shortenVariables",
    label: "Shorten Variable Names",
    type: "checkbox" as const,
    defaultValue: false,
  },
  {
    key: "optimizeCode",
    label: "Optimize Code Structure",
    type: "checkbox" as const,
    defaultValue: false,
  },
]

function processCodeCompressor(input: string, options: any = {}) {
  try {
    const codeType = options.codeType === "auto" ? detectCodeType(input) : options.codeType
    let output = input

    // Remove comments based on code type
    if (options.removeComments) {
      switch (codeType) {
        case "javascript":
        case "css":
          output = output.replace(/\/\/.*$/gm, "")
          output = output.replace(/\/\*[\s\S]*?\*\//g, "")
          break
        case "html":
          output = output.replace(/<!--[\s\S]*?-->/g, "")
          break
        case "json":
          // JSON doesn't support comments
          break
      }
    }

    // Remove whitespace
    if (options.removeWhitespace) {
      switch (codeType) {
        case "javascript":
          output = compressJavaScript(output, options)
          break
        case "css":
          output = compressCSS(output, options)
          break
        case "html":
          output = compressHTML(output, options)
          break
        case "json":
          output = compressJSON(output, options)
          break
        default:
          output = output.replace(/\s+/g, " ").trim()
      }
    }

    // Shorten variable names
    if (options.shortenVariables && codeType === "javascript") {
      output = shortenVariableNames(output)
    }

    // Optimize code structure
    if (options.optimizeCode) {
      output = optimizeCodeStructure(output, codeType, options.compressionLevel)
    }

    const originalSize = input.length
    const compressedSize = output.length
    const savings = originalSize > 0 ? ((originalSize - compressedSize) / originalSize) * 100 : 0

    const stats = {
      "Code Type": codeType.toUpperCase(),
      "Original Size": `${originalSize} chars`,
      "Compressed Size": `${compressedSize} chars`,
      "Size Reduction": `${savings.toFixed(1)}%`,
      "Compression Ratio": `${(compressedSize / originalSize).toFixed(2)}:1`,
      "Compression Level": options.compressionLevel || "medium",
    }

    return { output, stats }
  } catch (error) {
    return {
      output: "",
      error: "Code compression failed",
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
  if (trimmed.includes('{') && (trimmed.includes('color:') || trimmed.includes('margin:'))) {
    return "css"
  }
  if (trimmed.includes('function') || trimmed.includes('const') || trimmed.includes('let')) {
    return "javascript"
  }
  
  return "javascript"
}

function compressJavaScript(code: string, options: any): string {
  let compressed = code
    .replace(/\s+/g, " ")
    .replace(/;\s*}/g, "}")
    .replace(/\s*{\s*/g, "{")
    .replace(/;\s*/g, ";")
    .replace(/,\s*/g, ",")
    .replace(/\s*=\s*/g, "=")
    .replace(/\s*\+\s*/g, "+")
    .replace(/\s*-\s*/g, "-")
    .trim()

  if (options.compressionLevel === "extreme") {
    compressed = compressed
      .replace(/console\.log\([^)]*\);?/g, "")
      .replace(/debugger;?/g, "")
      .replace(/\s*\?\s*/g, "?")
      .replace(/\s*:\s*/g, ":")
  }

  return compressed
}

function compressCSS(code: string, options: any): string {
  let compressed = code
    .replace(/\s+/g, " ")
    .replace(/;\s*}/g, "}")
    .replace(/\s*{\s*/g, "{")
    .replace(/;\s*/g, ";")
    .replace(/,\s*/g, ",")
    .replace(/:\s*/g, ":")
    .trim()

  if (options.compressionLevel === "extreme") {
    compressed = compressed
      .replace(/;}/g, "}")
      .replace(/#([0-9a-f])\1([0-9a-f])\2([0-9a-f])\3/gi, "#$1$2$3")
      .replace(/0\.(\d+)/g, ".$1")
  }

  return compressed
}

function compressHTML(code: string, options: any): string {
  let compressed = code
    .replace(/>\s+</g, "><")
    .replace(/\s+/g, " ")
    .trim()

  if (options.compressionLevel === "extreme") {
    compressed = compressed
      .replace(/\s*=\s*/g, "=")
      .replace(/"\s+/g, '"')
      .replace(/\s+"/g, '"')
  }

  return compressed
}

function compressJSON(code: string, options: any): string {
  try {
    const parsed = JSON.parse(code)
    return JSON.stringify(parsed)
  } catch {
    return code.replace(/\s+/g, " ").trim()
  }
}

function shortenVariableNames(code: string): string {
  const variableMap = new Map()
  let varCounter = 0

  // Find variable declarations
  const varPattern = /(?:var|let|const)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g
  let match
  while ((match = varPattern.exec(code)) !== null) {
    const varName = match[1]
    if (!variableMap.has(varName) && varName.length > 2) {
      const shortName = generateShortName(varCounter++)
      variableMap.set(varName, shortName)
    }
  }

  // Replace variable names
  variableMap.forEach((short, original) => {
    const regex = new RegExp(`\\b${original}\\b`, 'g')
    code = code.replace(regex, short)
  })

  return code
}

function generateShortName(index: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz'
  let name = ''
  let num = index
  
  do {
    name = chars[num % 26] + name
    num = Math.floor(num / 26)
  } while (num > 0)
  
  return name
}

function optimizeCodeStructure(code: string, codeType: string, level: string): string {
  switch (codeType) {
    case "javascript":
      if (level === "extreme") {
        // Convert function declarations to expressions
        code = code.replace(/function\s+(\w+)\s*\(/g, 'var $1=function(')
        // Combine variable declarations
        code = code.replace(/var\s+(\w+);var\s+(\w+)/g, 'var $1,$2')
      }
      break
    case "css":
      if (level === "heavy" || level === "extreme") {
        // Merge similar selectors
        code = optimizeCSSSelectors(code)
      }
      break
  }
  
  return code
}

function optimizeCSSSelectors(css: string): string {
  // Basic CSS optimization - merge similar properties
  return css.replace(/(\w+):\s*([^;]+);\s*\1:\s*([^;]+);/g, '$1:$3;')
}

export default function CodeDeobfuscatorPage() {
  return (
    <TextToolLayout
      title="Code Deobfuscator"
      description="Deobfuscate and restore readability to minified or obfuscated code with variable name restoration."
      icon={Unlock}
      placeholder="Paste your obfuscated code here..."
      outputPlaceholder="Deobfuscated code will appear here..."
      processFunction={processCodeDeobfuscator}
      options={codeDeobfuscatorOptions}
      examples={codeDeobfuscatorExamples}
      fileExtensions={[".js", ".min.js"]}
      supportFileUpload={true}
      supportUrlInput={true}
    />
  )
}