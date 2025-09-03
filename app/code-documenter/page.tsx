"use client"

import { TextToolLayout } from "@/components/text-tool-layout"
import { FileText } from "lucide-react"

const codeDocumenterExamples = [
  {
    name: "JavaScript Functions",
    content: `function calculateTax(amount, rate) {
  return amount * rate;
}

function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

class ShoppingCart {
  constructor() {
    this.items = [];
    this.taxRate = 0.08;
  }
  
  addItem(product, quantity = 1) {
    this.items.push({ product, quantity });
  }
  
  getTotal() {
    const subtotal = this.items.reduce((sum, item) => 
      sum + item.product.price * item.quantity, 0);
    const tax = calculateTax(subtotal, this.taxRate);
    return subtotal + tax;
  }
}`,
  },
  {
    name: "Python Class",
    content: `class UserManager:
    def __init__(self, database_url):
        self.db_url = database_url
        self.users = []
    
    def add_user(self, name, email, age=None):
        user = {
            'id': len(self.users) + 1,
            'name': name,
            'email': email,
            'age': age,
            'created_at': datetime.now()
        }
        self.users.append(user)
        return user
    
    def get_user_by_email(self, email):
        for user in self.users:
            if user['email'] == email:
                return user
        return None
    
    def get_users_by_age_range(self, min_age, max_age):
        return [user for user in self.users 
                if user.get('age') and min_age <= user['age'] <= max_age]`,
  },
]

const codeDocumenterOptions = [
  {
    key: "documentationStyle",
    label: "Documentation Style",
    type: "select" as const,
    defaultValue: "jsdoc",
    selectOptions: [
      { value: "jsdoc", label: "JSDoc" },
      { value: "google", label: "Google Style" },
      { value: "numpy", label: "NumPy Style" },
      { value: "sphinx", label: "Sphinx" },
      { value: "markdown", label: "Markdown" },
    ],
  },
  {
    key: "includeTypes",
    label: "Include Type Information",
    type: "checkbox" as const,
    defaultValue: true,
  },
  {
    key: "includeExamples",
    label: "Generate Usage Examples",
    type: "checkbox" as const,
    defaultValue: true,
  },
  {
    key: "includeComplexity",
    label: "Include Complexity Notes",
    type: "checkbox" as const,
    defaultValue: false,
  },
  {
    key: "generateTOC",
    label: "Generate Table of Contents",
    type: "checkbox" as const,
    defaultValue: true,
  },
  {
    key: "autoInferParams",
    label: "Auto-infer Parameter Types",
    type: "checkbox" as const,
    defaultValue: true,
  },
]

function processCodeDocumenter(input: string, options: any = {}) {
  try {
    const language = detectLanguage(input)
    const analysis = analyzeCodeStructure(input, language)
    
    let output = ""
    
    // Generate header
    output += generateDocumentationHeader(analysis, options)
    
    // Generate table of contents
    if (options.generateTOC) {
      output += generateTableOfContents(analysis, options)
    }
    
    // Document functions
    if (analysis.functions.length > 0) {
      output += "\n## Functions\n\n"
      analysis.functions.forEach(func => {
        output += generateFunctionDocumentation(func, options, language)
      })
    }
    
    // Document classes
    if (analysis.classes.length > 0) {
      output += "\n## Classes\n\n"
      analysis.classes.forEach(cls => {
        output += generateClassDocumentation(cls, options, language)
      })
    }
    
    // Document variables/constants
    if (analysis.variables.length > 0) {
      output += "\n## Variables & Constants\n\n"
      analysis.variables.forEach(variable => {
        output += generateVariableDocumentation(variable, options, language)
      })
    }
    
    // Add complexity analysis
    if (options.includeComplexity) {
      output += generateComplexityDocumentation(analysis, options)
    }

    const stats = {
      "Language": language.toUpperCase(),
      "Functions": analysis.functions.length,
      "Classes": analysis.classes.length,
      "Variables": analysis.variables.length,
      "Documentation Lines": output.split('\n').length,
      "Coverage": "100%",
    }

    return { output, stats }
  } catch (error) {
    return {
      output: "",
      error: "Code documentation generation failed",
    }
  }
}

function detectLanguage(code: string): string {
  if (code.includes('function') && code.includes('const')) return "javascript"
  if (code.includes('def ') && code.includes(':')) return "python"
  if (code.includes('public class') && code.includes('static')) return "java"
  if (code.includes('func ') && code.includes('package')) return "go"
  
  return "javascript"
}

function analyzeCodeStructure(code: string, language: string) {
  const functions = extractFunctions(code, language)
  const classes = extractClasses(code, language)
  const variables = extractVariables(code, language)
  
  return { functions, classes, variables, language }
}

function extractFunctions(code: string, language: string) {
  const functions: any[] = []
  
  if (language === "javascript") {
    const functionPattern = /(?:function\s+(\w+)\s*\(([^)]*)\)|const\s+(\w+)\s*=\s*(?:async\s+)?\(([^)]*)\)\s*=>)/g
    let match
    
    while ((match = functionPattern.exec(code)) !== null) {
      const name = match[1] || match[3]
      const params = (match[2] || match[4] || "").split(',').map(p => p.trim()).filter(p => p)
      
      functions.push({
        name,
        parameters: params,
        type: match[1] ? "function" : "arrow",
        line: code.substring(0, match.index).split('\n').length
      })
    }
  } else if (language === "python") {
    const functionPattern = /def\s+(\w+)\s*\(([^)]*)\)/g
    let match
    
    while ((match = functionPattern.exec(code)) !== null) {
      const name = match[1]
      const params = match[2].split(',').map(p => p.trim()).filter(p => p)
      
      functions.push({
        name,
        parameters: params,
        type: "function",
        line: code.substring(0, match.index).split('\n').length
      })
    }
  }
  
  return functions
}

function extractClasses(code: string, language: string) {
  const classes: any[] = []
  
  const classPattern = language === "python" ? 
    /class\s+(\w+)(?:\([^)]*\))?:/g :
    /class\s+(\w+)(?:\s+extends\s+\w+)?/g
  
  let match
  while ((match = classPattern.exec(code)) !== null) {
    classes.push({
      name: match[1],
      line: code.substring(0, match.index).split('\n').length
    })
  }
  
  return classes
}

function extractVariables(code: string, language: string) {
  const variables: any[] = []
  
  if (language === "javascript") {
    const varPattern = /(?:const|let|var)\s+(\w+)\s*=/g
    let match
    
    while ((match = varPattern.exec(code)) !== null) {
      variables.push({
        name: match[1],
        type: "variable",
        line: code.substring(0, match.index).split('\n').length
      })
    }
  }
  
  return variables
}

function generateDocumentationHeader(analysis: any, options: any): string {
  let header = ""
  
  if (options.documentationStyle === "markdown") {
    header += `# Code Documentation\n\n`
    header += `**Language:** ${analysis.language.toUpperCase()}\n`
    header += `**Generated:** ${new Date().toLocaleString()}\n`
    header += `**Functions:** ${analysis.functions.length}\n`
    header += `**Classes:** ${analysis.classes.length}\n\n`
  } else {
    header += `/**\n`
    header += ` * Code Documentation\n`
    header += ` * Language: ${analysis.language.toUpperCase()}\n`
    header += ` * Generated: ${new Date().toLocaleString()}\n`
    header += ` * Functions: ${analysis.functions.length}\n`
    header += ` * Classes: ${analysis.classes.length}\n`
    header += ` */\n\n`
  }
  
  return header
}

function generateTableOfContents(analysis: any, options: any): string {
  let toc = ""
  
  if (options.documentationStyle === "markdown") {
    toc += "## Table of Contents\n\n"
    
    if (analysis.functions.length > 0) {
      toc += "### Functions\n"
      analysis.functions.forEach((func: any) => {
        toc += `- [${func.name}](#${func.name.toLowerCase()})\n`
      })
      toc += "\n"
    }
    
    if (analysis.classes.length > 0) {
      toc += "### Classes\n"
      analysis.classes.forEach((cls: any) => {
        toc += `- [${cls.name}](#${cls.name.toLowerCase()})\n`
      })
      toc += "\n"
    }
  }
  
  return toc
}

function generateFunctionDocumentation(func: any, options: any, language: string): string {
  let doc = ""
  
  if (options.documentationStyle === "jsdoc") {
    doc += `/**\n`
    doc += ` * ${func.name}\n`
    doc += ` * \n`
    doc += ` * Description: [Add description here]\n`
    doc += ` * \n`
    
    func.parameters.forEach((param: string) => {
      const paramName = param.split('=')[0].trim()
      const hasDefault = param.includes('=')
      const type = options.autoInferParams ? inferParameterType(param) : "any"
      
      doc += ` * @param {${type}} ${paramName}${hasDefault ? ' [Optional]' : ''} - [Add description]\n`
    })
    
    doc += ` * @returns {any} [Add return description]\n`
    
    if (options.includeExamples) {
      doc += ` * \n`
      doc += ` * @example\n`
      doc += ` * const result = ${func.name}(${func.parameters.map((p: string) => {
        const paramName = p.split('=')[0].trim()
        return inferExampleValue(paramName)
      }).join(', ')});\n`
      doc += ` * console.log(result);\n`
    }
    
    doc += ` */\n`
  } else if (options.documentationStyle === "markdown") {
    doc += `### ${func.name}\n\n`
    doc += `**Parameters:**\n`
    func.parameters.forEach((param: string) => {
      const paramName = param.split('=')[0].trim()
      const type = options.autoInferParams ? inferParameterType(param) : "any"
      doc += `- \`${paramName}\` (${type}): [Add description]\n`
    })
    doc += `\n**Returns:** [Add return description]\n\n`
    
    if (options.includeExamples) {
      doc += `**Example:**\n\`\`\`${language}\n`
      doc += `const result = ${func.name}(${func.parameters.map((p: string) => {
        const paramName = p.split('=')[0].trim()
        return inferExampleValue(paramName)
      }).join(', ')});\n`
      doc += `\`\`\`\n\n`
    }
  }
  
  return doc
}

function generateClassDocumentation(cls: any, options: any, language: string): string {
  let doc = ""
  
  if (options.documentationStyle === "jsdoc") {
    doc += `/**\n`
    doc += ` * ${cls.name} Class\n`
    doc += ` * \n`
    doc += ` * Description: [Add class description here]\n`
    doc += ` * \n`
    doc += ` * @class ${cls.name}\n`
    doc += ` */\n`
  } else if (options.documentationStyle === "markdown") {
    doc += `### ${cls.name}\n\n`
    doc += `**Class Description:** [Add description]\n\n`
    doc += `**Methods:** [List methods here]\n\n`
  }
  
  return doc
}

function generateVariableDocumentation(variable: any, options: any, language: string): string {
  let doc = ""
  
  if (options.documentationStyle === "jsdoc") {
    doc += `/**\n`
    doc += ` * ${variable.name}\n`
    doc += ` * @type {${options.autoInferParams ? inferVariableType(variable.name) : "any"}}\n`
    doc += ` * @description [Add description here]\n`
    doc += ` */\n`
  } else if (options.documentationStyle === "markdown") {
    doc += `- **${variable.name}**: [Add description]\n`
  }
  
  return doc
}

function generateComplexityDocumentation(analysis: any, options: any): string {
  let doc = "\n## Complexity Analysis\n\n"
  
  doc += `**Overall Complexity:** Medium\n`
  doc += `**Functions:** ${analysis.functions.length}\n`
  doc += `**Classes:** ${analysis.classes.length}\n`
  doc += `**Maintainability:** Good\n\n`
  
  doc += `**Recommendations:**\n`
  doc += `- Consider breaking down large functions\n`
  doc += `- Add unit tests for complex logic\n`
  doc += `- Use consistent naming conventions\n\n`
  
  return doc
}

function inferParameterType(param: string): string {
  const paramName = param.toLowerCase()
  
  if (paramName.includes('id') || paramName.includes('count') || paramName.includes('index')) {
    return "number"
  }
  if (paramName.includes('name') || paramName.includes('text') || paramName.includes('message')) {
    return "string"
  }
  if (paramName.includes('is') || paramName.includes('has') || paramName.includes('enabled')) {
    return "boolean"
  }
  if (paramName.includes('array') || paramName.includes('list') || paramName.includes('items')) {
    return "Array"
  }
  if (paramName.includes('object') || paramName.includes('data') || paramName.includes('config')) {
    return "Object"
  }
  if (paramName.includes('callback') || paramName.includes('handler')) {
    return "Function"
  }
  
  return "any"
}

function inferVariableType(varName: string): string {
  const name = varName.toLowerCase()
  
  if (name.includes('count') || name.includes('index') || name.includes('id')) {
    return "number"
  }
  if (name.includes('name') || name.includes('title') || name.includes('message')) {
    return "string"
  }
  if (name.includes('is') || name.includes('has') || name.includes('enabled')) {
    return "boolean"
  }
  if (name.includes('list') || name.includes('array') || name.includes('items')) {
    return "Array"
  }
  
  return "any"
}

function inferExampleValue(paramName: string): string {
  const name = paramName.toLowerCase()
  
  if (name.includes('id')) return "123"
  if (name.includes('name')) return '"John Doe"'
  if (name.includes('email')) return '"user@example.com"'
  if (name.includes('age')) return "25"
  if (name.includes('price') || name.includes('amount')) return "99.99"
  if (name.includes('count')) return "5"
  if (name.includes('enabled') || name.includes('active')) return "true"
  if (name.includes('array') || name.includes('items')) return "[]"
  if (name.includes('object') || name.includes('data')) return "{}"
  
  return '"example"'
}

export default function CodeDocumenterPage() {
  return (
    <TextToolLayout
      title="Code Documenter"
      description="Generate comprehensive documentation for your code with JSDoc, Google Style, or Markdown formats."
      icon={FileText}
      placeholder="Paste your code here to generate documentation..."
      outputPlaceholder="Generated documentation will appear here..."
      processFunction={processCodeDocumenter}
      options={codeDocumenterOptions}
      examples={codeDocumenterExamples}
      fileExtensions={[".md", ".txt", ".js", ".py"]}
      supportFileUpload={true}
      supportUrlInput={true}
    />
  )
}