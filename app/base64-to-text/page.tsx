"use client"

import { TextToolLayout } from "@/components/text-tool-layout"
import { Unlock } from "lucide-react"

const base64Examples = [
  {
    name: "Simple Text",
    content: "SGVsbG8sIFdvcmxkIQ==",
  },
  {
    name: "JSON Data",
    content: "eyJuYW1lIjoiSm9obiIsImFnZSI6MzAsImNpdHkiOiJOZXcgWW9yayJ9",
  },
  {
    name: "URL",
    content: "aHR0cHM6Ly9leGFtcGxlLmNvbS9hcGkvZGF0YT9wYXJhbT12YWx1ZQ==",
  },
]

const base64Options = [
  {
    key: "operation",
    label: "Operation",
    type: "select" as const,
    defaultValue: "decode",
    selectOptions: [
      { value: "decode", label: "Decode from Base64" },
      { value: "encode", label: "Encode to Base64" },
    ],
  },
  {
    key: "urlSafe",
    label: "URL Safe Base64",
    type: "checkbox" as const,
    defaultValue: false,
  },
  {
    key: "outputFormat",
    label: "Output Format",
    type: "select" as const,
    defaultValue: "text",
    selectOptions: [
      { value: "text", label: "Plain Text" },
      { value: "json", label: "JSON (if valid)" },
      { value: "hex", label: "Hexadecimal" },
    ],
  },
]

function processBase64Text(input: string, options: any = {}) {
  try {
    let output: string

    if (options.operation === "encode") {
      // Encode to Base64
      output = btoa(input)
      
      if (options.urlSafe) {
        output = output.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
      }
    } else {
      // Decode from Base64
      let base64Input = input.trim()

      // Handle URL-safe Base64
      if (options.urlSafe) {
        base64Input = base64Input.replace(/-/g, "+").replace(/_/g, "/")
        // Add padding if needed
        while (base64Input.length % 4) {
          base64Input += "="
        }
      }

      const decoded = atob(base64Input)
      
      // Format output based on selected format
      switch (options.outputFormat) {
        case "json":
          try {
            const parsed = JSON.parse(decoded)
            output = JSON.stringify(parsed, null, 2)
          } catch {
            output = decoded // Fall back to plain text if not valid JSON
          }
          break
        case "hex":
          output = Array.from(decoded)
            .map(char => char.charCodeAt(0).toString(16).padStart(2, '0'))
            .join(' ')
          break
        default:
          output = decoded
      }
    }

    const stats = {
      "Input Length": `${input.length} chars`,
      "Output Length": `${output.length} chars`,
      "Operation": options.operation === "encode" ? "Encoded" : "Decoded",
      "Format": options.outputFormat || "text",
    }

    return { output, stats }
  } catch (error) {
    return {
      output: "",
      error: options.operation === "decode" ? "Invalid Base64 format" : "Encoding failed",
    }
  }
}

export default function Base64ToTextPage() {
  return (
    <TextToolLayout
      title="Base64 to Text Converter"
      description="Decode Base64 strings to text or encode text to Base64 with URL-safe options and multiple output formats."
      icon={Unlock}
      placeholder="Enter Base64 to decode or text to encode..."
      outputPlaceholder="Converted text will appear here..."
      processFunction={processBase64Text}
      options={base64Options}
      examples={base64Examples}
      fileExtensions={[".txt", ".b64"]}
    />
  )
}