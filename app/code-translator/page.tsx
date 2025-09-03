"use client"

import { TextToolLayout } from "@/components/text-tool-layout"
import { Languages } from "lucide-react"

const codeTranslatorExamples = [
  {
    name: "JavaScript to Python",
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
    name: "Python to JavaScript",
    content: `def calculate_total(items):
    total = 0
    for item in items:
        total += item['price'] * item['quantity']
    return total

cart = [
    {'name': 'Product A', 'price': 29.99, 'quantity': 2},
    {'name': 'Product B', 'price': 15.50, 'quantity': 1}
]

print("Total:", calculate_total(cart))`,
  },
]

const codeTranslatorOptions = [
  {
    key: "fromLanguage",
    label: "From Language",
    type: "select" as const,
    defaultValue: "javascript",
    selectOptions: [
      { value: "javascript", label: "JavaScript" },
      { value: "python", label: "Python" },
      { value: "java", label: "Java" },
      { value: "csharp", label: "C#" },
      { value: "go", label: "Go" },
      { value: "rust", label: "Rust" },
    ],
  },
  {
    key: "toLanguage",
    label: "To Language",
    type: "select" as const,
    defaultValue: "python",
    selectOptions: [
      { value: "javascript", label: "JavaScript" },
      { value: "python", label: "Python" },
      { value: "java", label: "Java" },
      { value: "csharp", label: "C#" },
      { value: "go", label: "Go" },
      { value: "rust", label: "Rust" },
    ],
  },
  {
    key: "preserveComments",
    label: "Preserve Comments",
    type: "checkbox" as const,
    defaultValue: true,
  },
  {
    key: "addTypeHints",
    label: "Add Type Hints",
    type: "checkbox" as const,
    defaultValue: true,
  },
  {
    key: "optimizeForTarget",
    label: "Optimize for Target Language",
    type: "checkbox" as const,
    defaultValue: true,
  },
]

function processCodeTranslator(input: string, options: any = {}) {
  try {
    const { fromLanguage, toLanguage } = options
    
    if (fromLanguage === toLanguage) {
      return { output: input, stats: { "Status": "No translation needed" } }
    }
    
    const translatedCode = translateCode(input, fromLanguage, toLanguage, options)
    
    const stats = {
      "From Language": fromLanguage.toUpperCase(),
      "To Language": toLanguage.toUpperCase(),
      "Original Lines": input.split('\n').length,
      "Translated Lines": translatedCode.split('\n').length,
      "Translation": "Completed",
    }

    return { output: translatedCode, stats }
  } catch (error) {
    return {
      output: "",
      error: "Code translation failed",
    }
  }
}

function translateCode(code: string, fromLang: string, toLang: string, options: any): string {
  let translated = code
  
  // JavaScript to Python
  if (fromLang === "javascript" && toLang === "python") {
    translated = jsToPython(code, options)
  }
  // Python to JavaScript
  else if (fromLang === "python" && toLang === "javascript") {
    translated = pythonToJs(code, options)
  }
  // JavaScript to Java
  else if (fromLang === "javascript" && toLang === "java") {
    translated = jsToJava(code, options)
  }
  // Add more language pairs as needed
  else {
    translated = genericTranslation(code, fromLang, toLang, options)
  }
  
  return translated
}

function jsToython(code: string, options: any): string {
  let python = code
  
  // Function declarations
  python = python.replace(/function\s+(\w+)\s*\(([^)]*)\)\s*{/g, 'def $1($2):')
  
  // Variable declarations
  python = python.replace(/(?:const|let|var)\s+(\w+)\s*=\s*/g, '$1 = ')
  
  // Console.log to print
  python = python.replace(/console\.log\(/g, 'print(')
  
  // Array/Object syntax
  python = python.replace(/\[([^\]]*)\]/g, '[$1]')
  python = python.replace(/{([^}]*)}/g, '{$1}')
  
  // For loops
  python = python.replace(/for\s*\(\s*let\s+(\w+)\s*=\s*0;\s*\1\s*<\s*([^;]+);\s*\1\+\+\s*\)/g, 'for $1 in range($2)')
  
  // Camel case to snake case
  python = python.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()
  
  // Remove semicolons and braces
  python = python.replace(/;/g, '')
  python = python.replace(/}/g, '')
  
  // Fix indentation
  python = fixPythonIndentation(python)
  
  if (options.addTypeHints) {
    python = addPythonTypeHints(python)
  }
  
  return python
}

function pythonToJs(code: string, options: any): string {
  let js = code
  
  // Function definitions
  js = js.replace(/def\s+(\w+)\s*\(([^)]*)\):/g, 'function $1($2) {')
  
  // Print to console.log
  js = js.replace(/print\(/g, 'console.log(')
  
  // Snake case to camel case
  js = js.replace(/(\w+)_(\w)/g, (match, p1, p2) => p1 + p2.toUpperCase())
  
  // Add semicolons and braces
  js = addJavaScriptSyntax(js)
  
  if (options.addTypeHints) {
    js = addJavaScriptTypes(js)
  }
  
  return js
}

function jsToJava(code: string, options: any): string {
  let java = code
  
  // Add class wrapper
  java = `public class GeneratedCode {\n${java}\n}`
  
  // Function to method
  java = java.replace(/function\s+(\w+)\s*\(([^)]*)\)\s*{/g, 'public static void $1($2) {')
  
  // Variable declarations
  java = java.replace(/(?:const|let|var)\s+(\w+)\s*=\s*/g, 'var $1 = ')
  
  // Console.log to System.out.println
  java = java.replace(/console\.log\(/g, 'System.out.println(')
  
  if (options.addTypeHints) {
    java = addJavaTypes(java)
  }
  
  return java
}

function genericTranslation(code: string, fromLang: string, toLang: string, options: any): string {
  let translated = code
  
  // Add translation header
  translated = `// Translated from ${fromLang.toUpperCase()} to ${toLang.toUpperCase()}\n`
  translated += `// Note: This is a basic translation. Manual review recommended.\n\n`
  translated += code
  
  return translated
}

function fixPythonIndentation(code: string): string {
  const lines = code.split('\n')
  const result: string[] = []
  let indentLevel = 0
  
  lines.forEach(line => {
    const trimmed = line.trim()
    
    if (trimmed === '') {
      result.push('')
      return
    }
    
    if (trimmed.endsWith(':')) {
      result.push('    '.repeat(indentLevel) + trimmed)
      indentLevel++
    } else {
      result.push('    '.repeat(indentLevel) + trimmed)
    }
  })
  
  return result.join('\n')
}

function addJavaScriptSyntax(code: string): string {
  const lines = code.split('\n')
  const result: string[] = []
  let braceLevel = 0
  
  lines.forEach(line => {
    const trimmed = line.trim()
    
    if (trimmed === '') {
      result.push('')
      return
    }
    
    if (trimmed.endsWith(':')) {
      result.push(trimmed.replace(':', ' {'))
      braceLevel++
    } else {
      result.push(trimmed + (trimmed.includes('return') || trimmed.includes('console.log') ? ';' : ''))
    }
  })
  
  // Add closing braces
  for (let i = 0; i < braceLevel; i++) {
    result.push('}')
  }
  
  return result.join('\n')
}

function addPythonTypeHints(code: string): string {
  return code.replace(/def\s+(\w+)\s*\(([^)]*)\):/g, (match, funcName, params) => {
    const typedParams = params.split(',').map((param: string) => {
      const trimmed = param.trim()
      if (!trimmed) return trimmed
      
      const type = inferParameterType(trimmed)
      return `${trimmed}: ${type}`
    }).join(', ')
    
    return `def ${funcName}(${typedParams}) -> Any:`
  })
}

function addJavaScriptTypes(code: string): string {
  return code.replace(/function\s+(\w+)\s*\(([^)]*)\)\s*{/g, (match, funcName, params) => {
    const typedParams = params.split(',').map((param: string) => {
      const trimmed = param.trim()
      if (!trimmed) return trimmed
      
      const type = inferParameterType(trimmed)
      return `${trimmed}: ${type}`
    }).join(', ')
    
    return `function ${funcName}(${typedParams}): any {`
  })
}

function addJavaTypes(code: string): string {
  return code.replace(/var\s+(\w+)\s*=/g, 'Object $1 =')
}

function inferParameterType(param: string): string {
  const name = param.toLowerCase()
  
  if (name.includes('id') || name.includes('count')) return "number"
  if (name.includes('name') || name.includes('text')) return "string"
  if (name.includes('is') || name.includes('has')) return "boolean"
  if (name.includes('array') || name.includes('items')) return "Array"
  if (name.includes('object') || name.includes('data')) return "Object"
  
  return "any"
}

export default function CodeTranslatorPage() {
  return (
    <TextToolLayout
      title="Code Translator"
      description="Translate code between programming languages with syntax conversion and type inference."
      icon={Languages}
      placeholder="Paste your code here to translate..."
      outputPlaceholder="Translated code will appear here..."
      processFunction={processCodeTranslator}
      options={codeTranslatorOptions}
      examples={codeTranslatorExamples}
      fileExtensions={[".js", ".py", ".java", ".cs", ".go", ".rs"]}
      supportFileUpload={true}
      supportUrlInput={true}
    />
  )
}