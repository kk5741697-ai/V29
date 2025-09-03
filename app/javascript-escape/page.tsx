"use client"

import { TextToolLayout } from "@/components/text-tool-layout"
import { Code } from "lucide-react"

const jsEscapeExamples = [
  {
    name: "String with Quotes",
    content: `He said "Hello World" and she replied 'Hi there!'`,
  },
  {
    name: "Special Characters",
    content: `Line 1
Line 2	Tab here
Backslash: \\
Unicode: ñáéíóú`,
  },
  {
    name: "JSON String",
    content: `{"name": "John", "message": "Hello \"World\"!"}`,
  },
]

const escapeOptions = [
  {
    key: "operation",
    label: "Operation",
    type: "select" as const,
    defaultValue: "escape",
    selectOptions: [
      { value: "escape", label: "Escape JavaScript" },
      { value: "unescape", label: "Unescape JavaScript" },
    ],
  },
  {
    key: "escapeType",
    label: "Escape Type",
    type: "select" as const,
    defaultValue: "string",
    selectOptions: [
      { value: "string", label: "String Literal" },
      { value: "regex", label: "Regular Expression" },
      { value: "unicode", label: "Unicode Escape" },
    ],
  },
]

function processJavaScriptEscape(input: string, options: any = {}) {
  try {
    let output: string

    if (options.operation === "unescape") {
      // Unescape JavaScript
      output = input
        .replace(/\\"/g, '"')
        .replace(/\\'/g, "'")
        .replace(/\\\\/g, "\\")
        .replace(/\\n/g, "\n")
        .replace(/\\r/g, "\r")
        .replace(/\\t/g, "\t")
        .replace(/\\b/g, "\b")
        .replace(/\\f/g, "\f")
        .replace(/\\v/g, "\v")
        .replace(/\\0/g, "\0")
        .replace(/\\u([0-9a-fA-F]{4})/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)))
        .replace(/\\x([0-9a-fA-F]{2})/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)))
    } else {
      // Escape JavaScript
      switch (options.escapeType) {
        case "regex":
          output = input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
          break
        case "unicode":
          output = input.replace(/[^\x20-\x7E]/g, (char) => {
            const code = char.charCodeAt(0)
            return code > 255 ? `\\u${code.toString(16).padStart(4, '0')}` : `\\x${code.toString(16).padStart(2, '0')}`
          })
          break
        default: // string
          output = input
            .replace(/\\/g, "\\\\")
            .replace(/"/g, '\\"')
            .replace(/'/g, "\\'")
            .replace(/\n/g, "\\n")
            .replace(/\r/g, "\\r")
            .replace(/\t/g, "\\t")
            .replace(/\b/g, "\\b")
            .replace(/\f/g, "\\f")
            .replace(/\v/g, "\\v")
            .replace(/\0/g, "\\0")
      }
    }

    const stats = {
      "Input Length": `${input.length} chars`,
      "Output Length": `${output.length} chars`,
      "Operation": options.operation === "escape" ? "Escaped" : "Unescaped",
      "Type": options.escapeType || "string",
    }

    return { output, stats }
  } catch (error) {
    return {
      output: "",
      error: "JavaScript escape/unescape failed",
    }
  }
}

export default function JavaScriptEscapePage() {
  return (
    <TextToolLayout
      title="JavaScript Escape/Unescape"
      description="Escape or unescape JavaScript strings, regular expressions, and Unicode characters for safe code embedding."
      icon={Code}
      placeholder="Enter text to escape or unescape..."
      outputPlaceholder="Escaped/unescaped text will appear here..."
      processFunction={processJavaScriptEscape}
      options={escapeOptions}
      examples={jsEscapeExamples}
      fileExtensions={[".js", ".txt"]}
    />
  )
}