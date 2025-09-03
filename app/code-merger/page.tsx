"use client"

import { TextToolLayout } from "@/components/text-tool-layout"
import { Merge } from "lucide-react"

const codeMergerExamples = [
  {
    name: "Multiple JavaScript Files",
    content: `// File 1: utils.js
function formatDate(date) {
  return date.toLocaleDateString();
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

// File 2: validation.js
function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function validatePhone(phone) {
  const regex = /^\+?[\d\s\-\(\)]+$/;
  return regex.test(phone);
}

// File 3: main.js
const user = {
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+1234567890'
};

console.log('Valid email:', validateEmail(user.email));
console.log('Valid phone:', validatePhone(user.phone));`,
  },
  {
    name: "CSS Modules",
    content: `/* File 1: reset.css */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* File 2: typography.css */
body {
  font-family: Arial, sans-serif;
  line-height: 1.6;
  color: #333;
}

h1, h2, h3 {
  margin-bottom: 1rem;
}

/* File 3: components.css */
.button {
  padding: 12px 24px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  padding: 2rem;
}`,
  },
]

const codeMergerOptions = [
  {
    key: "mergeStrategy",
    label: "Merge Strategy",
    type: "select" as const,
    defaultValue: "concatenate",
    selectOptions: [
      { value: "concatenate", label: "Simple Concatenation" },
      { value: "organize", label: "Organize by Type" },
      { value: "dependencies", label: "Dependency Order" },
      { value: "alphabetical", label: "Alphabetical Order" },
    ],
  },
  {
    key: "addSeparators",
    label: "Add File Separators",
    type: "checkbox" as const,
    defaultValue: true,
  },
  {
    key: "removeComments",
    label: "Remove Comments",
    type: "checkbox" as const,
    defaultValue: false,
  },
  {
    key: "deduplicateImports",
    label: "Deduplicate Imports",
    type: "checkbox" as const,
    defaultValue: true,
  },
  {
    key: "minifyOutput",
    label: "Minify Output",
    type: "checkbox" as const,
    defaultValue: false,
  },
  {
    key: "addSourceMap",
    label: "Add Source Map Comments",
    type: "checkbox" as const,
    defaultValue: false,
  },
]

function processCodeMerger(input: string, options: any = {}) {
  try {
    const files = parseMultipleFiles(input)
    const codeType = detectCodeType(input)
    
    let mergedContent = ""
    
    // Add header
    if (options.addSeparators) {
      mergedContent += `/**\n`
      mergedContent += ` * Merged ${codeType.toUpperCase()} File\n`
      mergedContent += ` * Generated: ${new Date().toISOString()}\n`
      mergedContent += ` * Files: ${files.length}\n`
      mergedContent += ` * Strategy: ${options.mergeStrategy}\n`
      mergedContent += ` */\n\n`
    }
    
    // Process files based on strategy
    const processedFiles = processFilesByStrategy(files, options.mergeStrategy, codeType)
    
    // Deduplicate imports
    if (options.deduplicateImports) {
      const { imports, content } = extractAndDeduplicateImports(processedFiles, codeType)
      if (imports) {
        mergedContent += imports + "\n\n"
      }
      processedFiles.forEach(file => {
        file.content = content[file.name] || file.content
      })
    }
    
    // Merge files
    processedFiles.forEach((file, index) => {
      if (options.addSeparators && index > 0) {
        mergedContent += "\n" + "=".repeat(50) + "\n"
        mergedContent += `// FILE: ${file.name}\n`
        mergedContent += "=".repeat(50) + "\n\n"
      }
      
      let fileContent = file.content
      
      // Remove comments if requested
      if (options.removeComments) {
        fileContent = removeComments(fileContent, codeType)
      }
      
      // Add source map comment
      if (options.addSourceMap) {
        fileContent += `\n//# sourceURL=${file.name}`
      }
      
      mergedContent += fileContent
      
      if (index < processedFiles.length - 1) {
        mergedContent += "\n\n"
      }
    })
    
    // Minify if requested
    if (options.minifyOutput) {
      mergedContent = minifyCode(mergedContent, codeType)
    }

    const stats = {
      "Code Type": codeType.toUpperCase(),
      "Files Merged": files.length,
      "Original Size": `${input.length} chars`,
      "Merged Size": `${mergedContent.length} chars`,
      "Merge Strategy": options.mergeStrategy,
      "Size Change": `${((mergedContent.length / input.length - 1) * 100).toFixed(1)}%`,
    }

    return { output: mergedContent, stats }
  } catch (error) {
    return {
      output: "",
      error: "Code merging failed",
    }
  }
}

function parseMultipleFiles(input: string): Array<{ name: string; content: string }> {
  const files: Array<{ name: string; content: string }> = []
  
  // Look for file separators
  const fileSeparatorPattern = /\/\/\s*FILE:\s*([^\n]+)\n|\/\*\s*FILE:\s*([^*]+)\*\//g
  const sections = input.split(fileSeparatorPattern)
  
  if (sections.length > 1) {
    for (let i = 1; i < sections.length; i += 3) {
      const fileName = sections[i] || sections[i + 1] || `file-${Math.floor(i / 3) + 1}`
      const content = sections[i + 2] || ""
      
      if (content.trim()) {
        files.push({
          name: fileName.trim(),
          content: content.trim()
        })
      }
    }
  } else {
    // Try to split by function/class boundaries
    const functionMatches = input.match(/function\s+\w+[^{]*{[^{}]*(?:{[^{}]*}[^{}]*)*}/g) || []
    const classMatches = input.match(/class\s+\w+[^{]*{[^{}]*(?:{[^{}]*}[^{}]*)*}/g) || []
    
    if (functionMatches.length > 0) {
      functionMatches.forEach((func, index) => {
        const funcName = func.match(/function\s+(\w+)/)?.[1] || `function-${index + 1}`
        files.push({
          name: `${funcName}.js`,
          content: func
        })
      })
    } else if (classMatches.length > 0) {
      classMatches.forEach((cls, index) => {
        const className = cls.match(/class\s+(\w+)/)?.[1] || `class-${index + 1}`
        files.push({
          name: `${className}.js`,
          content: cls
        })
      })
    } else {
      files.push({
        name: "merged-code.txt",
        content: input
      })
    }
  }
  
  return files
}

function processFilesByStrategy(files: Array<{ name: string; content: string }>, strategy: string, codeType: string): Array<{ name: string; content: string }> {
  switch (strategy) {
    case "alphabetical":
      return files.sort((a, b) => a.name.localeCompare(b.name))
    case "organize":
      return organizeByType(files, codeType)
    case "dependencies":
      return organizeBydependencies(files, codeType)
    default:
      return files
  }
}

function organizeByType(files: Array<{ name: string; content: string }>, codeType: string): Array<{ name: string; content: string }> {
  if (codeType === "javascript") {
    const utilities = files.filter(f => f.content.includes('function') && !f.content.includes('class'))
    const classes = files.filter(f => f.content.includes('class'))
    const others = files.filter(f => !f.content.includes('function') && !f.content.includes('class'))
    
    return [...utilities, ...classes, ...others]
  }
  
  return files
}

function organizeBydependencies(files: Array<{ name: string; content: string }>, codeType: string): Array<{ name: string; content: string }> {
  // Simple dependency analysis
  const dependencyGraph = new Map()
  
  files.forEach(file => {
    const dependencies = extractDependencies(file.content, codeType)
    dependencyGraph.set(file.name, dependencies)
  })
  
  // Topological sort (simplified)
  const sorted: Array<{ name: string; content: string }> = []
  const visited = new Set()
  
  function visit(fileName: string) {
    if (visited.has(fileName)) return
    visited.add(fileName)
    
    const file = files.find(f => f.name === fileName)
    if (file) {
      const deps = dependencyGraph.get(fileName) || []
      deps.forEach((dep: string) => visit(dep))
      sorted.push(file)
    }
  }
  
  files.forEach(file => visit(file.name))
  
  return sorted
}

function extractDependencies(content: string, codeType: string): string[] {
  const dependencies: string[] = []
  
  if (codeType === "javascript") {
    // Look for function calls that might be dependencies
    const functionCalls = content.match(/(\w+)\s*\(/g) || []
    functionCalls.forEach(call => {
      const funcName = call.replace(/\s*\(/, '')
      if (funcName && !['console', 'Math', 'Date', 'Object', 'Array'].includes(funcName)) {
        dependencies.push(funcName)
      }
    })
  }
  
  return [...new Set(dependencies)]
}

function extractAndDeduplicateImports(files: Array<{ name: string; content: string }>, codeType: string): { imports: string | null; content: Record<string, string> } {
  const allImports = new Set<string>()
  const contentWithoutImports: Record<string, string> = {}
  
  files.forEach(file => {
    const lines = file.content.split('\n')
    const imports: string[] = []
    const otherLines: string[] = []
    
    lines.forEach(line => {
      if (line.trim().startsWith('import ') || line.trim().startsWith('from ')) {
        imports.push(line.trim())
        allImports.add(line.trim())
      } else {
        otherLines.push(line)
      }
    })
    
    contentWithoutImports[file.name] = otherLines.join('\n')
  })
  
  const sortedImports = Array.from(allImports).sort()
  return {
    imports: sortedImports.length > 0 ? sortedImports.join('\n') : null,
    content: contentWithoutImports
  }
}

function removeComments(code: string, codeType: string): string {
  switch (codeType) {
    case "javascript":
    case "css":
      return code.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "")
    case "html":
      return code.replace(/<!--[\s\S]*?-->/g, "")
    default:
      return code
  }
}

function minifyCode(code: string, codeType: string): string {
  switch (codeType) {
    case "javascript":
      return code.replace(/\s+/g, " ").replace(/;\s*}/g, "}").trim()
    case "css":
      return code.replace(/\s+/g, " ").replace(/;\s*}/g, "}").trim()
    case "html":
      return code.replace(/>\s+</g, "><").trim()
    default:
      return code.replace(/\s+/g, " ").trim()
  }
}

export default function CodeMergerPage() {
  return (
    <TextToolLayout
      title="Code Merger"
      description="Merge multiple code files into a single file with dependency resolution and organization options."
      icon={Merge}
      placeholder="Paste multiple code files here (use // FILE: filename.js comments to separate)..."
      outputPlaceholder="Merged code will appear here..."
      processFunction={processCodeMerger}
      options={codeMergerOptions}
      examples={codeMergerExamples}
      fileExtensions={[".js", ".css", ".html", ".json"]}
      supportFileUpload={true}
      supportUrlInput={true}
    />
  )
}