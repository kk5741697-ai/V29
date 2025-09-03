"use client"

import { TextToolLayout } from "@/components/text-tool-layout"
import { Code } from "lucide-react"

const pythonExamples = [
  {
    name: "Class Definition",
    content: `class Calculator:
def __init__(self):
self.history = []
def add(self, a, b):
result = a + b
self.history.append(f"{a} + {b} = {result}")
return result
def get_history(self):
return self.history
calc = Calculator()
print(calc.add(5, 3))
print(calc.get_history())`,
  },
  {
    name: "Data Processing",
    content: `import json
def process_data(data):
processed = []
for item in data:
if item.get('active', False):
processed.append({
'id': item['id'],
'name': item['name'].title(),
'score': item.get('score', 0) * 1.1
})
return processed
sample_data = [
{'id': 1, 'name': 'john', 'active': True, 'score': 85},
{'id': 2, 'name': 'jane', 'active': False, 'score': 92}
]
result = process_data(sample_data)
print(json.dumps(result, indent=2))`,
  },
]

const pythonOptions = [
  {
    key: "format",
    label: "Format",
    type: "select" as const,
    defaultValue: "beautify",
    selectOptions: [
      { value: "beautify", label: "Beautify" },
      { value: "minify", label: "Minify" },
    ],
  },
  {
    key: "indent",
    label: "Indentation",
    type: "select" as const,
    defaultValue: 4,
    selectOptions: [
      { value: 2, label: "2 Spaces" },
      { value: 4, label: "4 Spaces (PEP 8)" },
      { value: "tab", label: "Tabs" },
    ],
  },
  {
    key: "removeComments",
    label: "Remove Comments",
    type: "checkbox" as const,
    defaultValue: false,
  },
  {
    key: "sortImports",
    label: "Sort Imports",
    type: "checkbox" as const,
    defaultValue: true,
  },
]

function processPython(input: string, options: any = {}) {
  try {
    let output = input

    // Remove comments
    if (options.removeComments) {
      output = output.replace(/#.*$/gm, "")
    }

    // Sort imports
    if (options.sortImports) {
      const lines = output.split('\n')
      const imports: string[] = []
      const otherLines: string[] = []
      
      lines.forEach(line => {
        if (line.trim().startsWith('import ') || line.trim().startsWith('from ')) {
          imports.push(line.trim())
        } else {
          otherLines.push(line)
        }
      })
      
      if (imports.length > 0) {
        imports.sort()
        output = imports.join('\n') + '\n\n' + otherLines.join('\n')
      }
    }

    if (options.format === "minify") {
      // Basic Python minification (limited due to indentation significance)
      output = output
        .replace(/\n\s*\n/g, '\n')
        .replace(/^\s+$/gm, '')
        .trim()
    } else {
      // Beautify Python
      const indentStr = typeof options.indent === "number" ? " ".repeat(options.indent) : "\t"
      output = beautifyPython(output, indentStr)
    }

    const stats = {
      "Original Size": `${input.length} chars`,
      "Formatted Size": `${output.length} chars`,
      "Classes": `${(input.match(/^class\s+\w+/gm) || []).length}`,
      "Functions": `${(input.match(/^def\s+\w+/gm) || []).length}`,
      "Imports": `${(input.match(/^(?:import|from)\s+/gm) || []).length}`,
    }

    return { output, stats }
  } catch (error) {
    return {
      output: "",
      error: "Python formatting failed",
    }
  }
}

function beautifyPython(code: string, indent: string): string {
  const lines = code.split('\n')
  const result: string[] = []
  let level = 0
  
  lines.forEach(line => {
    const trimmed = line.trim()
    
    if (trimmed === '') {
      result.push('')
      return
    }
    
    // Decrease indent for dedent keywords
    if (trimmed.startsWith('except') || trimmed.startsWith('elif') || 
        trimmed.startsWith('else') || trimmed.startsWith('finally')) {
      level = Math.max(0, level - 1)
      result.push(indent.repeat(level) + trimmed)
      level++
    } else {
      result.push(indent.repeat(level) + trimmed)
      
      // Increase indent for indent keywords
      if (trimmed.endsWith(':') && 
          (trimmed.startsWith('def ') || trimmed.startsWith('class ') || 
           trimmed.startsWith('if ') || trimmed.startsWith('for ') || 
           trimmed.startsWith('while ') || trimmed.startsWith('try') || 
           trimmed.startsWith('with ') || trimmed.startsWith('elif ') || 
           trimmed.startsWith('else') || trimmed.startsWith('except') || 
           trimmed.startsWith('finally'))) {
        level++
      }
    }
  })
  
  return result.join('\n')
}

export default function PythonFormatterPage() {
  return (
    <TextToolLayout
      title="Python Formatter"
      description="Format and beautify Python code following PEP 8 standards with proper indentation and import sorting."
      icon={Code}
      placeholder="Paste your Python code here..."
      outputPlaceholder="Formatted Python will appear here..."
      processFunction={processPython}
      options={pythonOptions}
      examples={pythonExamples}
      fileExtensions={[".py"]}
    />
  )
}