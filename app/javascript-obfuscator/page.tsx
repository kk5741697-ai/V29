"use client"

import { TextToolLayout } from "@/components/text-tool-layout"
import { Shield } from "lucide-react"

const jsObfuscatorExamples = [
  {
    name: "Simple Function",
    content: `function greetUser(name) {
  const message = "Hello, " + name + "!";
  console.log(message);
  return message;
}

greetUser("World");`,
  },
  {
    name: "API Call",
    content: `const API_KEY = "your-secret-key";
const BASE_URL = "https://api.example.com";

async function fetchData(endpoint) {
  const response = await fetch(BASE_URL + endpoint, {
    headers: {
      'Authorization': 'Bearer ' + API_KEY
    }
  });
  return response.json();
}`,
  },
]

const obfuscatorOptions = [
  {
    key: "level",
    label: "Obfuscation Level",
    type: "select" as const,
    defaultValue: "medium",
    selectOptions: [
      { value: "light", label: "Light (Variable names only)" },
      { value: "medium", label: "Medium (Variables + strings)" },
      { value: "heavy", label: "Heavy (Full obfuscation)" },
    ],
  },
  {
    key: "renameVariables",
    label: "Rename Variables",
    type: "checkbox" as const,
    defaultValue: true,
  },
  {
    key: "stringEncoding",
    label: "Encode Strings",
    type: "checkbox" as const,
    defaultValue: true,
  },
  {
    key: "removeComments",
    label: "Remove Comments",
    type: "checkbox" as const,
    defaultValue: true,
  },
]

function processJavaScriptObfuscation(input: string, options: any = {}) {
  try {
    let output = input

    // Remove comments
    if (options.removeComments) {
      output = output.replace(/\/\/.*$/gm, "")
      output = output.replace(/\/\*[\s\S]*?\*\//g, "")
    }

    // Variable name obfuscation
    if (options.renameVariables) {
      const variableMap = new Map()
      let varCounter = 0

      // Find variable declarations
      const varPattern = /(?:var|let|const)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g
      let match
      while ((match = varPattern.exec(input)) !== null) {
        const varName = match[1]
        if (!variableMap.has(varName)) {
          variableMap.set(varName, `_0x${varCounter.toString(16)}`)
          varCounter++
        }
      }

      // Replace variable names
      variableMap.forEach((obfuscated, original) => {
        const regex = new RegExp(`\\b${original}\\b`, 'g')
        output = output.replace(regex, obfuscated)
      })
    }

    // String encoding
    if (options.stringEncoding) {
      output = output.replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, (match, str) => {
        const encoded = btoa(str).split('').reverse().join('')
        return `atob("${encoded}".split('').reverse().join(''))`
      })
    }

    // Additional obfuscation based on level
    switch (options.level) {
      case "heavy":
        // Add dummy code
        output = `(function(){${output}})();`
        // Add random variables
        output = `var _0xdummy = Math.random();\n${output}`
        break
      case "medium":
        // Wrap in IIFE
        output = `(function(){${output}})();`
        break
    }

    // Minify
    output = output
      .replace(/\s+/g, " ")
      .replace(/;\s*}/g, "}")
      .replace(/\s*{\s*/g, "{")
      .trim()

    const stats = {
      "Original Size": `${input.length} chars`,
      "Obfuscated Size": `${output.length} chars`,
      "Size Change": `${((output.length / input.length - 1) * 100).toFixed(1)}%`,
      "Obfuscation Level": options.level || "medium",
    }

    return { output, stats }
  } catch (error) {
    return {
      output: "",
      error: "JavaScript obfuscation failed",
    }
  }
}

export default function JavaScriptObfuscatorPage() {
  return (
    <TextToolLayout
      title="JavaScript Obfuscator"
      description="Obfuscate JavaScript code to protect intellectual property and make reverse engineering difficult."
      icon={Shield}
      placeholder="Paste your JavaScript here..."
      outputPlaceholder="Obfuscated JavaScript will appear here..."
      processFunction={processJavaScriptObfuscation}
      options={obfuscatorOptions}
      examples={jsObfuscatorExamples}
      fileExtensions={[".js", ".min.js"]}
    />
  )
}