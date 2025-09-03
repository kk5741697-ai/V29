"use client"

import { TextToolLayout } from "@/components/text-tool-layout"
import { RefreshCw } from "lucide-react"

const xmlToJsonExamples = [
  {
    name: "Simple XML",
    content: `<?xml version="1.0" encoding="UTF-8"?>
<root>
  <user id="1">
    <name>John Doe</name>
    <email>john@example.com</email>
    <age>30</age>
    <active>true</active>
  </user>
  <user id="2">
    <name>Jane Smith</name>
    <email>jane@example.com</email>
    <age>25</age>
    <active>false</active>
  </user>
</root>`,
  },
  {
    name: "RSS Feed",
    content: `<?xml version="1.0"?>
<rss version="2.0">
  <channel>
    <title>Example News</title>
    <description>Latest news and updates</description>
    <link>https://example.com</link>
    <item>
      <title>Breaking News</title>
      <description>Important update about...</description>
      <link>https://example.com/news/1</link>
      <pubDate>Mon, 01 Jan 2024 12:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`,
  },
]

const xmlToJsonOptions = [
  {
    key: "preserveAttributes",
    label: "Preserve Attributes",
    type: "checkbox" as const,
    defaultValue: true,
  },
  {
    key: "arrayElements",
    label: "Convert Repeated Elements to Arrays",
    type: "checkbox" as const,
    defaultValue: true,
  },
  {
    key: "trimWhitespace",
    label: "Trim Whitespace",
    type: "checkbox" as const,
    defaultValue: true,
  },
  {
    key: "parseNumbers",
    label: "Parse Numbers",
    type: "checkbox" as const,
    defaultValue: true,
  },
]

function processXmlToJson(input: string, options: any = {}) {
  try {
    if (!input.trim()) {
      return { output: "", error: "Input cannot be empty" }
    }

    // Parse XML
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(input, "text/xml")
    
    // Check for parsing errors
    const parseError = xmlDoc.querySelector("parsererror")
    if (parseError) {
      return { output: "", error: "Invalid XML format" }
    }

    // Convert to JSON
    const jsonObj = xmlToJsonObject(xmlDoc.documentElement, options)
    const output = JSON.stringify(jsonObj, null, 2)

    const stats = {
      "Input Size": `${input.length} chars`,
      "Output Size": `${output.length} chars`,
      "XML Elements": (input.match(/<[^\/][^>]*>/g) || []).length,
      "JSON Properties": countJsonProperties(jsonObj),
    }

    return { output, stats }
  } catch (error) {
    return {
      output: "",
      error: error instanceof Error ? error.message : "XML to JSON conversion failed",
    }
  }
}

function xmlToJsonObject(element: Element, options: any): any {
  const result: any = {}
  
  // Handle attributes
  if (options.preserveAttributes && element.attributes.length > 0) {
    result['@attributes'] = {}
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i]
      result['@attributes'][attr.name] = attr.value
    }
  }
  
  // Handle child elements
  const children: any = {}
  const childElements = Array.from(element.children)
  
  if (childElements.length === 0) {
    // Leaf node - return text content
    let textContent = element.textContent || ""
    
    if (options.trimWhitespace) {
      textContent = textContent.trim()
    }
    
    if (options.parseNumbers && /^\d+(\.\d+)?$/.test(textContent)) {
      textContent = parseFloat(textContent) as any
    } else if (textContent === "true" || textContent === "false") {
      textContent = textContent === "true" as any
    }
    
    return Object.keys(result).length > 0 ? { ...result, '#text': textContent } : textContent
  }
  
  // Group children by tag name
  childElements.forEach(child => {
    const tagName = child.tagName
    const childValue = xmlToJsonObject(child, options)
    
    if (children[tagName]) {
      // Convert to array if multiple elements with same name
      if (!Array.isArray(children[tagName])) {
        children[tagName] = [children[tagName]]
      }
      children[tagName].push(childValue)
    } else {
      children[tagName] = childValue
    }
  })
  
  return { ...result, ...children }
}

function countJsonProperties(obj: any): number {
  let count = 0
  
  if (typeof obj === 'object' && obj !== null) {
    if (Array.isArray(obj)) {
      obj.forEach(item => {
        count += countJsonProperties(item)
      })
    } else {
      count += Object.keys(obj).length
      Object.values(obj).forEach(value => {
        count += countJsonProperties(value)
      })
    }
  }
  
  return count
}

export default function XmlToJsonPage() {
  return (
    <TextToolLayout
      title="XML to JSON Converter"
      description="Convert XML documents to JSON format with attribute preservation and array handling options."
      icon={RefreshCw}
      placeholder="Paste your XML here..."
      outputPlaceholder="JSON will appear here..."
      processFunction={processXmlToJson}
      options={xmlToJsonOptions}
      examples={xmlToJsonExamples}
      fileExtensions={[".json"]}
    />
  )
}