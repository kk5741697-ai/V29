"use client"

import { TextToolLayout } from "@/components/text-tool-layout"
import { Shield } from "lucide-react"

const codeObfuscatorExamples = [
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
    name: "API Configuration",
    content: `const API_CONFIG = {
  baseURL: "https://api.example.com",
  apiKey: "your-secret-key",
  timeout: 5000,
  retries: 3
};

function makeRequest(endpoint, data) {
  return fetch(API_CONFIG.baseURL + endpoint, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + API_CONFIG.apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
}`,
  },
]

const codeObfuscatorOptions = [
  {
    key: "obfuscationLevel",
    label: "Obfuscation Level",
    type: "select" as const,
    defaultValue: "medium",
    selectOptions: [
      { value: "light", label: "Light (Variable names only)" },
      { value: "medium", label: "Medium (Variables + strings)" },
      { value: "heavy", label: "Heavy (Full obfuscation)" },
      { value: "extreme", label: "Extreme (Maximum protection)" },
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
    key: "controlFlowFlattening",
    label: "Control Flow Flattening",
    type: "checkbox" as const,
    defaultValue: false,
  },
  {
    key: "deadCodeInjection",
    label: "Dead Code Injection",
    type: "checkbox" as const,
    defaultValue: false,
  },
  {
    key: "removeComments",
    label: "Remove Comments",
    type: "checkbox" as const,
    defaultValue: true,
  },
]

function processCodeObfuscator(input: string, options: any = {}) {
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

    // Control flow flattening
    if (options.controlFlowFlattening) {
      output = `var _0xswitch = 0; while(true) { switch(_0xswitch) { case 0: ${output.replace(/;/g, '; _0xswitch++; break; case ' + Math.floor(Math.random() * 1000) + ':')} break; default: return; } }`
    }

    // Dead code injection
    if (options.deadCodeInjection) {
      const deadCode = `var _0xdead = Math.random(); if(_0xdead > 1) { console.log("dead"); }`
      output = deadCode + '\n' + output
    }

    // Additional obfuscation based on level
    switch (options.obfuscationLevel) {
      case "extreme":
        // Add multiple layers
        output = `(function(_0xa,_0xb){return _0xa+_0xb;})(function(){${output}}, Math.random());`
        // Add dummy variables
        output = `var _0xdummy1 = Math.random(), _0xdummy2 = Date.now();\n${output}`
        break
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
      "Obfuscation Level": options.obfuscationLevel || "medium",
      "Variables Renamed": (input.match(/(?:var|let|const)\s+[a-zA-Z_$]/g) || []).length,
    }

    return { output, stats }
  } catch (error) {
    return {
      output: "",
      error: "Code obfuscation failed",
    }
  }
}

export default function CodeObfuscatorPage() {
  return (
    <TextToolLayout
      title="Code Obfuscator"
      description="Obfuscate JavaScript code to protect intellectual property and make reverse engineering difficult."
      icon={Shield}
      placeholder="Paste your JavaScript code here..."
      outputPlaceholder="Obfuscated code will appear here..."
      processFunction={processCodeObfuscator}
      options={codeObfuscatorOptions}
      examples={codeObfuscatorExamples}
      fileExtensions={[".js", ".min.js"]}
      supportFileUpload={true}
      supportUrlInput={true}
    />
  )
}