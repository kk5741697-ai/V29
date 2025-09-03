"use client"

import { TextToolLayout } from "@/components/text-tool-layout"
import { Archive } from "lucide-react"

const codeMinifierExamples = [
  {
    name: "JavaScript Code",
    content: `function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price * items[i].quantity;
  }
  return total;
}

const cart = [
  { name: "Product A", price: 29.99, quantity: 2 },
  { name: "Product B", price: 15.50, quantity: 1 }
];

console.log("Total:", calculateTotal(cart));`,
  },
  {
    name: "CSS Styles",
    content: `body {
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
  background-color: #f5f5f5;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.button:hover {
  background-color: #0056b3;
}`,
  },
  {
    name: "HTML Markup",
    content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Example Page</title>
</head>
<body>
    <header>
        <nav>
            <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>
    
    <main>
        <section id="home">
            <h1>Welcome to Our Site</h1>
            <p>This is a sample paragraph with some content.</p>
        </section>
    </main>
    
    <footer>
        <p>&copy; 2024 Example Company</p>
    </footer>
</body>
</html>`,
  },
]

const codeMinifierOptions = [
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
    key: "removeComments",
    label: "Remove Comments",
    type: "checkbox" as const,
    defaultValue: true,
  },
  {
    key: "removeWhitespace",
    label: "Remove Extra Whitespace",
    type: "checkbox" as const,
    defaultValue: true,
  },
  {
    key: "preserveNewlines",
    label: "Preserve Some Newlines",
    type: "checkbox" as const,
    defaultValue: false,
  },
  {
    key: "aggressiveMinify",
    label: "Aggressive Minification",
    type: "checkbox" as const,
    defaultValue: false,
  },
]

function processCodeMinifier(input: string, options: any = {}) {
  try {
    let output = input
    const codeType = options.codeType === "auto" ? detectCodeType(input) : options.codeType

    // Remove comments based on code type
    if (options.removeComments) {
      switch (codeType) {
        case "javascript":
        case "css":
          output = output.replace(/\/\/.*$/gm, "")
          output = output.replace(/\/\*[\s\S]*?\*\//g, "")
          break
        case "html":
        case "xml":
          output = output.replace(/<!--[\s\S]*?-->/g, "")
          break
        case "json":
          // JSON doesn't support comments
          break
      }
    }

    // Remove extra whitespace
    if (options.removeWhitespace) {
      switch (codeType) {
        case "javascript":
          output = minifyJavaScript(output, options)
          break
        case "css":
          output = minifyCSS(output, options)
          break
        case "html":
          output = minifyHTML(output, options)
          break
        case "json":
          output = minifyJSON(output, options)
          break
        case "xml":
          output = minifyXML(output, options)
          break
        default:
          output = output.replace(/\s+/g, " ").trim()
      }
    }

    const originalSize = input.length
    const minifiedSize = output.length
    const savings = originalSize > 0 ? ((originalSize - minifiedSize) / originalSize) * 100 : 0

    const stats = {
      "Code Type": codeType.toUpperCase(),
      "Original Size": `${originalSize} chars`,
      "Minified Size": `${minifiedSize} chars`,
      "Size Reduction": `${savings.toFixed(1)}%`,
      "Compression Ratio": `${(minifiedSize / originalSize).toFixed(2)}:1`,
    }

    return { output, stats }
  } catch (error) {
    return {
      output: "",
      error: "Code minification failed",
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
  if (trimmed.includes('function') || trimmed.includes('const') || trimmed.includes('let') || trimmed.includes('=>')) {
    return "javascript"
  }
  
  return "javascript" // Default
}

function minifyJavaScript(code: string, options: any): string {
  let minified = code
    .replace(/\s+/g, " ")
    .replace(/;\s*}/g, "}")
    .replace(/\s*{\s*/g, "{")
    .replace(/;\s*/g, ";")
    .replace(/,\s*/g, ",")
    .replace(/\s*=\s*/g, "=")
    .replace(/\s*\+\s*/g, "+")
    .replace(/\s*-\s*/g, "-")
    .trim()

  if (options.aggressiveMinify) {
    minified = minified
      .replace(/console\.log\([^)]*\);?/g, "")
      .replace(/debugger;?/g, "")
  }

  if (options.preserveNewlines) {
    minified = minified.replace(/}/g, "}\n").replace(/;(?=[a-zA-Z])/g, ";\n")
  }

  return minified
}

function minifyCSS(code: string, options: any): string {
  let minified = code
    .replace(/\s+/g, " ")
    .replace(/;\s*}/g, "}")
    .replace(/\s*{\s*/g, "{")
    .replace(/;\s*/g, ";")
    .replace(/,\s*/g, ",")
    .replace(/:\s*/g, ":")
    .trim()

  if (options.aggressiveMinify) {
    // Remove unnecessary semicolons before closing braces
    minified = minified.replace(/;}/g, "}")
    // Optimize colors
    minified = minified.replace(/#([0-9a-f])\1([0-9a-f])\2([0-9a-f])\3/gi, "#$1$2$3")
  }

  return minified
}

function minifyHTML(code: string, options: any): string {
  let minified = code
    .replace(/>\s+</g, "><")
    .replace(/\s+/g, " ")
    .trim()

  if (options.aggressiveMinify) {
    minified = minified
      .replace(/\s*=\s*/g, "=")
      .replace(/"\s+/g, '"')
      .replace(/\s+"/g, '"')
  }

  return minified
}

function minifyJSON(code: string, options: any): string {
  try {
    const parsed = JSON.parse(code)
    return JSON.stringify(parsed)
  } catch {
    return code.replace(/\s+/g, " ").trim()
  }
}

function minifyXML(code: string, options: any): string {
  return code
    .replace(/>\s+</g, "><")
    .replace(/\s+/g, " ")
    .trim()
}

function validateCode(input: string) {
  if (!input.trim()) {
    return { isValid: false, error: "Input cannot be empty" }
  }
  return { isValid: true }
}

export default function CodeMinifierPage() {
  return (
    <TextToolLayout
      title="Code Minifier"
      description="Minify JavaScript, CSS, HTML, JSON, and XML code to reduce file size and improve performance."
      icon={Archive}
      placeholder="Paste your code here..."
      outputPlaceholder="Minified code will appear here..."
      processFunction={processCodeMinifier}
      validateFunction={validateCode}
      options={codeMinifierOptions}
      examples={codeMinifierExamples}
      fileExtensions={[".js", ".css", ".html", ".json", ".xml"]}
      supportFileUpload={true}
      supportUrlInput={true}
    />
  )
}