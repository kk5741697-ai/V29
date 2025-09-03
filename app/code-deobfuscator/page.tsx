"use client"

import { TextToolLayout } from "@/components/text-tool-layout"
import { Unlock } from "lucide-react"

const codeDeobfuscatorExamples = [
  {
    name: "Obfuscated JavaScript",
    content: `var _0x1a2b=['Hello','World','log'];function _0x3c4d(_0x5e6f){var _0x7g8h=_0x1a2b[0]+', '+_0x1a2b[1]+'!';console[_0x1a2b[2]](_0x7g8h);return _0x7g8h;}_0x3c4d();`,
  },
  {
    name: "Minified with Hex Variables",
    content: `var _0xa1b2c3='Hello',_0xd4e5f6='World';function _0x123abc(){var _0x456def=_0xa1b2c3+' '+_0xd4e5f6;console.log(_0x456def);return _0x456def;}_0x123abc();`,
  },
]

const codeDeobfuscatorOptions = [
  {
    key: "deobfuscationLevel",
    label: "Deobfuscation Level",
    type: "select" as const,
    defaultValue: "medium",
    selectOptions: [
      { value: "light", label: "Light (Basic cleanup)" },
      { value: "medium", label: "Medium (Variable restoration)" },
      { value: "heavy", label: "Heavy (Full analysis)" },
    ],
  },
  {
    key: "restoreVariableNames",
    label: "Restore Variable Names",
    type: "checkbox" as const,
    defaultValue: true,
  },
  {
    key: "decodeStrings",
    label: "Decode Strings",
    type: "checkbox" as const,
    defaultValue: true,
  },
  {
    key: "removeDeadCode",
    label: "Remove Dead Code",
    type: "checkbox" as const,
    defaultValue: true,
  },
  {
    key: "beautifyOutput",
    label: "Beautify Output",
    type: "checkbox" as const,
    defaultValue: true,
  },
]

function processCodeDeobfuscator(input: string, options: any = {}) {
  try {
    let output = input

    // Remove dead code
    if (options.removeDeadCode) {
      output = output.replace(/var\s+_0x[a-f0-9]+\s*=\s*Math\.random\(\)[^;]*;/g, "")
      output = output.replace(/if\s*\(\s*_0x[a-f0-9]+\s*>\s*1\s*\)[^}]*}/g, "")
    }

    // Decode strings
    if (options.decodeStrings) {
      // Look for encoded strings and try to decode them
      output = output.replace(/atob\("([^"]+)"\)/g, (match, encoded) => {
        try {
          return `"${atob(encoded)}"`
        } catch {
          return match
        }
      })
    }

    // Restore variable names
    if (options.restoreVariableNames) {
      const variableMap = new Map()
      let varCounter = 0

      // Find hex variable names and create meaningful replacements
      const hexVarPattern = /_0x[a-f0-9]+/g
      const hexVars = new Set(output.match(hexVarPattern) || [])
      
      hexVars.forEach(hexVar => {
        const meaningfulName = this.generateMeaningfulName(varCounter++)
        variableMap.set(hexVar, meaningfulName)
      })

      // Replace hex variables with meaningful names
      variableMap.forEach((meaningful, hex) => {
        const regex = new RegExp(`\\b${hex}\\b`, 'g')
        output = output.replace(regex, meaningful)
      })
    }

    // Beautify if requested
    if (options.beautifyOutput) {
      output = this.beautifyJavaScript(output)
    }

    const stats = {
      "Original Size": `${input.length} chars`,
      "Deobfuscated Size": `${output.length} chars`,
      "Hex Variables Found": (input.match(/_0x[a-f0-9]+/g) || []).length,
      "Deobfuscation Level": options.deobfuscationLevel || "medium",
      "Readability": "Improved",
    }

    return { output, stats }
  } catch (error) {
    return {
      output: "",
      error: "Code deobfuscation failed",
    }
  }
}

function generateMeaningfulName(index: number): string {
  const names = [
    'variable', 'data', 'result', 'value', 'item', 'element', 'content', 'text',
    'config', 'options', 'params', 'args', 'response', 'request', 'handler',
    'callback', 'promise', 'async', 'await', 'function', 'method', 'property'
  ]
  return names[index % names.length] + (index >= names.length ? Math.floor(index / names.length) : '')
}

function beautifyJavaScript(code: string): string {
  const lines = code.split('\n')
  const result: string[] = []
  let level = 0
  
  lines.forEach(line => {
    const trimmed = line.trim()
    
    if (trimmed === '') {
      result.push('')
      return
    }
    
    if (trimmed.startsWith('}')) {
      level = Math.max(0, level - 1)
    }
    
    result.push("  ".repeat(level) + trimmed)
    
    if (trimmed.endsWith('{')) {
      level++
    }
  })
  
  return result.join('\n')
}

export default function CodeDeobfuscatorPage() {
  return (
    <TextToolLayout
      title="Code Deobfuscator"
      description="Deobfuscate and restore readability to obfuscated JavaScript code with variable name restoration."
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