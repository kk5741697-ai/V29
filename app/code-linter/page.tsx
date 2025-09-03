"use client"

import { TextToolLayout } from "@/components/text-tool-layout"
import { CheckCircle } from "lucide-react"

const codeLinterExamples = [
  {
    name: "JavaScript with Issues",
    content: `var userName = "john";
var userAge = 25;
var userEmail = "john@example.com"

function getUserInfo() {
  if (userName == "john") {
    console.log("User found");
    return {
      name: userName,
      age: userAge,
      email: userEmail
    }
  }
}

function calculateAge(birthYear) {
  return 2024 - birthYear
}

// Unused function
function unusedFunction() {
  var temp = "unused";
  return temp;
}`,
  },
  {
    name: "Python with Style Issues",
    content: `import os,sys,json

def calculate_total(items):
    total=0
    for item in items:
        if item['price']>0:
            total+=item['price']*item['quantity']
    return total

def process_user_data(user_data):
    if user_data:
        if 'name' in user_data:
            if len(user_data['name'])>0:
                return user_data['name'].upper()
    return None

class userManager:
    def __init__(self):
        self.users=[]
    
    def add_user(self,name,email):
        user={'name':name,'email':email}
        self.users.append(user)`,
  },
]

const codeLinterOptions = [
  {
    key: "language",
    label: "Language",
    type: "select" as const,
    defaultValue: "auto",
    selectOptions: [
      { value: "auto", label: "Auto Detect" },
      { value: "javascript", label: "JavaScript" },
      { value: "python", label: "Python" },
      { value: "java", label: "Java" },
      { value: "csharp", label: "C#" },
      { value: "go", label: "Go" },
    ],
  },
  {
    key: "strictness",
    label: "Strictness Level",
    type: "select" as const,
    defaultValue: "medium",
    selectOptions: [
      { value: "relaxed", label: "Relaxed (Major issues only)" },
      { value: "medium", label: "Medium (Standard rules)" },
      { value: "strict", label: "Strict (All style issues)" },
      { value: "pedantic", label: "Pedantic (Every detail)" },
    ],
  },
  {
    key: "checkSyntax",
    label: "Check Syntax Errors",
    type: "checkbox" as const,
    defaultValue: true,
  },
  {
    key: "checkStyle",
    label: "Check Style Issues",
    type: "checkbox" as const,
    defaultValue: true,
  },
  {
    key: "checkComplexity",
    label: "Check Complexity",
    type: "checkbox" as const,
    defaultValue: true,
  },
  {
    key: "checkSecurity",
    label: "Check Security Issues",
    type: "checkbox" as const,
    defaultValue: true,
  },
  {
    key: "checkPerformance",
    label: "Check Performance",
    type: "checkbox" as const,
    defaultValue: false,
  },
  {
    key: "autoFix",
    label: "Auto-fix Issues",
    type: "checkbox" as const,
    defaultValue: false,
  },
]

function processCodeLinter(input: string, options: any = {}) {
  try {
    const language = options.language === "auto" ? detectLanguage(input) : options.language
    const lintResults = lintCode(input, language, options)
    
    let output = `CODE LINTING REPORT\n`
    output += `${"=".repeat(50)}\n\n`
    output += `Language: ${language.toUpperCase()}\n`
    output += `Strictness: ${options.strictness}\n`
    output += `Generated: ${new Date().toLocaleString()}\n\n`

    // Summary
    const totalIssues = lintResults.errors.length + lintResults.warnings.length + lintResults.info.length
    output += `SUMMARY\n`
    output += `${"-".repeat(20)}\n`
    output += `Total Issues: ${totalIssues}\n`
    output += `Errors: ${lintResults.errors.length}\n`
    output += `Warnings: ${lintResults.warnings.length}\n`
    output += `Info: ${lintResults.info.length}\n`
    output += `Overall Score: ${lintResults.score}/100\n\n`

    // Errors
    if (lintResults.errors.length > 0) {
      output += `ERRORS (${lintResults.errors.length})\n`
      output += `${"-".repeat(20)}\n`
      lintResults.errors.forEach((error, index) => {
        output += `${index + 1}. Line ${error.line}: ${error.message}\n`
        output += `   Rule: ${error.rule}\n`
        output += `   Code: ${error.code}\n\n`
      })
    }

    // Warnings
    if (lintResults.warnings.length > 0) {
      output += `WARNINGS (${lintResults.warnings.length})\n`
      output += `${"-".repeat(20)}\n`
      lintResults.warnings.forEach((warning, index) => {
        output += `${index + 1}. Line ${warning.line}: ${warning.message}\n`
        output += `   Rule: ${warning.rule}\n`
        output += `   Code: ${warning.code}\n\n`
      })
    }

    // Info/Style issues
    if (lintResults.info.length > 0) {
      output += `STYLE ISSUES (${lintResults.info.length})\n`
      output += `${"-".repeat(20)}\n`
      lintResults.info.forEach((info, index) => {
        output += `${index + 1}. Line ${info.line}: ${info.message}\n`
        output += `   Rule: ${info.rule}\n`
        output += `   Code: ${info.code}\n\n`
      })
    }

    // Suggestions
    if (lintResults.suggestions.length > 0) {
      output += `IMPROVEMENT SUGGESTIONS\n`
      output += `${"-".repeat(20)}\n`
      lintResults.suggestions.forEach((suggestion, index) => {
        output += `${index + 1}. ${suggestion}\n`
      })
      output += `\n`
    }

    // Auto-fixed code
    if (options.autoFix && lintResults.fixedCode) {
      output += `AUTO-FIXED CODE\n`
      output += `${"-".repeat(20)}\n`
      output += lintResults.fixedCode
    }

    const stats = {
      "Language": language.toUpperCase(),
      "Total Issues": totalIssues,
      "Errors": lintResults.errors.length,
      "Warnings": lintResults.warnings.length,
      "Score": `${lintResults.score}/100`,
      "Fixable": lintResults.fixableIssues,
    }

    return { output, stats }
  } catch (error) {
    return {
      output: "",
      error: "Code linting failed",
    }
  }
}

function detectLanguage(code: string): string {
  if (code.includes('function') && code.includes('const')) return "javascript"
  if (code.includes('def ') && code.includes(':')) return "python"
  if (code.includes('public class') && code.includes('static')) return "java"
  if (code.includes('using System') && code.includes('namespace')) return "csharp"
  if (code.includes('package main') && code.includes('func')) return "go"
  
  return "javascript"
}

function lintCode(code: string, language: string, options: any) {
  const errors: any[] = []
  const warnings: any[] = []
  const info: any[] = []
  const suggestions: string[] = []
  let fixedCode = code
  let fixableIssues = 0

  const lines = code.split('\n')
  
  // Syntax checking
  if (options.checkSyntax) {
    const syntaxIssues = checkSyntax(code, language)
    errors.push(...syntaxIssues.errors)
    warnings.push(...syntaxIssues.warnings)
  }
  
  // Style checking
  if (options.checkStyle) {
    const styleIssues = checkStyle(code, language, lines, options.strictness)
    warnings.push(...styleIssues.warnings)
    info.push(...styleIssues.info)
    suggestions.push(...styleIssues.suggestions)
    
    if (options.autoFix) {
      fixedCode = styleIssues.fixedCode || fixedCode
      fixableIssues += styleIssues.fixableCount || 0
    }
  }
  
  // Complexity checking
  if (options.checkComplexity) {
    const complexityIssues = checkComplexity(code, language, lines)
    warnings.push(...complexityIssues.warnings)
    suggestions.push(...complexityIssues.suggestions)
  }
  
  // Security checking
  if (options.checkSecurity) {
    const securityIssues = checkSecurity(code, language, lines)
    errors.push(...securityIssues.errors)
    warnings.push(...securityIssues.warnings)
    suggestions.push(...securityIssues.suggestions)
  }
  
  // Performance checking
  if (options.checkPerformance) {
    const performanceIssues = checkPerformance(code, language, lines)
    warnings.push(...performanceIssues.warnings)
    suggestions.push(...performanceIssues.suggestions)
  }
  
  // Calculate score
  const totalIssues = errors.length + warnings.length + info.length
  const score = Math.max(0, 100 - (errors.length * 10) - (warnings.length * 5) - (info.length * 2))
  
  return {
    errors,
    warnings,
    info,
    suggestions,
    score,
    fixedCode: options.autoFix ? fixedCode : null,
    fixableIssues
  }
}

function checkSyntax(code: string, language: string) {
  const errors: any[] = []
  const warnings: any[] = []
  
  if (language === "javascript") {
    // Check for unmatched braces
    const openBraces = (code.match(/{/g) || []).length
    const closeBraces = (code.match(/}/g) || []).length
    
    if (openBraces !== closeBraces) {
      errors.push({
        line: 1,
        message: "Unmatched braces detected",
        rule: "syntax-error",
        code: "{ ... }"
      })
    }
    
    // Check for unmatched parentheses
    const openParens = (code.match(/\(/g) || []).length
    const closeParens = (code.match(/\)/g) || []).length
    
    if (openParens !== closeParens) {
      errors.push({
        line: 1,
        message: "Unmatched parentheses detected",
        rule: "syntax-error",
        code: "( ... )"
      })
    }
  }
  
  return { errors, warnings }
}

function checkStyle(code: string, language: string, lines: string[], strictness: string) {
  const warnings: any[] = []
  const info: any[] = []
  const suggestions: string[] = []
  let fixedCode = code
  let fixableCount = 0
  
  if (language === "javascript") {
    lines.forEach((line, index) => {
      const lineNum = index + 1
      const trimmed = line.trim()
      
      // Check for var usage
      if (trimmed.includes('var ')) {
        warnings.push({
          line: lineNum,
          message: "Use 'let' or 'const' instead of 'var'",
          rule: "no-var",
          code: trimmed
        })
        
        if (strictness !== "relaxed") {
          fixedCode = fixedCode.replace(/var /g, 'const ')
          fixableCount++
        }
      }
      
      // Check for loose equality
      if (trimmed.includes('==') && !trimmed.includes('===')) {
        warnings.push({
          line: lineNum,
          message: "Use strict equality (===) instead of loose equality (==)",
          rule: "eqeqeq",
          code: trimmed
        })
      }
      
      // Check line length
      if (line.length > 120) {
        info.push({
          line: lineNum,
          message: "Line too long (>120 characters)",
          rule: "max-len",
          code: trimmed.substring(0, 50) + "..."
        })
      }
      
      // Check for missing semicolons
      if (trimmed.length > 0 && !trimmed.endsWith(';') && !trimmed.endsWith('{') && !trimmed.endsWith('}')) {
        if (strictness === "strict" || strictness === "pedantic") {
          info.push({
            line: lineNum,
            message: "Missing semicolon",
            rule: "semi",
            code: trimmed
          })
        }
      }
    })
    
    // Global suggestions
    if (code.includes('var ')) {
      suggestions.push("Replace 'var' declarations with 'let' or 'const'")
    }
    if (code.includes('==') && !code.includes('===')) {
      suggestions.push("Use strict equality operators (=== and !==)")
    }
    if (!code.includes('use strict')) {
      suggestions.push("Add 'use strict' directive for better error checking")
    }
  }
  
  if (language === "python") {
    lines.forEach((line, index) => {
      const lineNum = index + 1
      const trimmed = line.trim()
      
      // Check indentation
      if (line.length > 0 && line.length - line.trimStart().length !== 0 && (line.length - line.trimStart().length) % 4 !== 0) {
        warnings.push({
          line: lineNum,
          message: "Inconsistent indentation (should be 4 spaces)",
          rule: "indentation",
          code: line.substring(0, 20) + "..."
        })
      }
      
      // Check naming conventions
      if (trimmed.includes('class ') && /class\s+[a-z]/.test(trimmed)) {
        warnings.push({
          line: lineNum,
          message: "Class names should use PascalCase",
          rule: "class-naming",
          code: trimmed
        })
      }
      
      // Check for long lines
      if (line.length > 79) {
        info.push({
          line: lineNum,
          message: "Line too long (>79 characters, PEP 8)",
          rule: "line-length",
          code: trimmed.substring(0, 50) + "..."
        })
      }
    })
  }
  
  return { warnings, info, suggestions, fixedCode, fixableCount }
}

function checkComplexity(code: string, language: string, lines: string[]) {
  const warnings: any[] = []
  const suggestions: string[] = []
  
  // Check function length
  const functions = extractFunctions(code, language)
  functions.forEach(func => {
    if (func.lineCount > 50) {
      warnings.push({
        line: func.startLine,
        message: `Function '${func.name}' is too long (${func.lineCount} lines)`,
        rule: "max-function-length",
        code: func.name
      })
    }
    
    if (func.complexity > 10) {
      warnings.push({
        line: func.startLine,
        message: `Function '${func.name}' has high complexity (${func.complexity})`,
        rule: "complexity",
        code: func.name
      })
    }
  })
  
  // Check nesting depth
  const maxNesting = calculateMaxNesting(code)
  if (maxNesting > 4) {
    warnings.push({
      line: 1,
      message: `Deep nesting detected (${maxNesting} levels)`,
      rule: "max-depth",
      code: "nested blocks"
    })
    suggestions.push("Consider extracting nested logic into separate functions")
  }
  
  return { warnings, suggestions }
}

function checkSecurity(code: string, language: string, lines: string[]) {
  const errors: any[] = []
  const warnings: any[] = []
  const suggestions: string[] = []
  
  if (language === "javascript") {
    // Check for eval usage
    if (code.includes('eval(')) {
      errors.push({
        line: findLineWithPattern(lines, /eval\(/),
        message: "Use of eval() is dangerous and should be avoided",
        rule: "no-eval",
        code: "eval(...)"
      })
    }
    
    // Check for innerHTML usage
    if (code.includes('innerHTML')) {
      warnings.push({
        line: findLineWithPattern(lines, /innerHTML/),
        message: "innerHTML can lead to XSS vulnerabilities",
        rule: "no-inner-html",
        code: "element.innerHTML"
      })
      suggestions.push("Use textContent or createElement instead of innerHTML")
    }
    
    // Check for hardcoded secrets
    const secretPatterns = [
      /password\s*[:=]\s*["'][^"']+["']/i,
      /api[_-]?key\s*[:=]\s*["'][^"']+["']/i,
      /secret\s*[:=]\s*["'][^"']+["']/i,
    ]
    
    secretPatterns.forEach(pattern => {
      if (pattern.test(code)) {
        warnings.push({
          line: findLineWithPattern(lines, pattern),
          message: "Potential hardcoded secret detected",
          rule: "no-hardcoded-secrets",
          code: "***hidden***"
        })
      }
    })
  }
  
  return { errors, warnings, suggestions }
}

function checkPerformance(code: string, language: string, lines: string[]) {
  const warnings: any[] = []
  const suggestions: string[] = []
  
  if (language === "javascript") {
    // Check for inefficient loops
    if (code.includes('for (') && code.includes('.length')) {
      const forLoops = code.match(/for\s*\([^)]*\.length[^)]*\)/g) || []
      if (forLoops.length > 0) {
        warnings.push({
          line: findLineWithPattern(lines, /for\s*\([^)]*\.length/),
          message: "Cache array length in loops for better performance",
          rule: "cache-array-length",
          code: "for (i = 0; i < arr.length; i++)"
        })
        suggestions.push("Cache array length: const len = arr.length; for (let i = 0; i < len; i++)")
      }
    }
    
    // Check for inefficient DOM queries
    if (code.includes('document.getElementById') || code.includes('document.querySelector')) {
      const domQueries = (code.match(/document\.(getElementById|querySelector)/g) || []).length
      if (domQueries > 3) {
        suggestions.push("Consider caching DOM element references")
      }
    }
  }
  
  return { warnings, suggestions }
}

function extractFunctions(code: string, language: string) {
  const functions: any[] = []
  
  if (language === "javascript") {
    const functionPattern = /function\s+(\w+)\s*\([^)]*\)\s*{/g
    let match
    
    while ((match = functionPattern.exec(code)) !== null) {
      const startIndex = match.index
      const startLine = code.substring(0, startIndex).split('\n').length
      
      // Find function end (simplified)
      let braceCount = 1
      let endIndex = match.index + match[0].length
      
      while (braceCount > 0 && endIndex < code.length) {
        if (code[endIndex] === '{') braceCount++
        if (code[endIndex] === '}') braceCount--
        endIndex++
      }
      
      const funcCode = code.substring(startIndex, endIndex)
      const lineCount = funcCode.split('\n').length
      const complexity = calculateFunctionComplexity(funcCode)
      
      functions.push({
        name: match[1],
        startLine,
        lineCount,
        complexity,
        code: funcCode
      })
    }
  }
  
  return functions
}

function calculateFunctionComplexity(funcCode: string): number {
  const complexityKeywords = ['if', 'else', 'while', 'for', 'switch', 'case', 'catch', '&&', '||', '?']
  let complexity = 1
  
  complexityKeywords.forEach(keyword => {
    const matches = funcCode.match(new RegExp(`\\b${keyword}\\b`, 'g')) || []
    complexity += matches.length
  })
  
  return complexity
}

function calculateMaxNesting(code: string): number {
  let maxDepth = 0
  let currentDepth = 0
  
  for (const char of code) {
    if (char === '{') {
      currentDepth++
      maxDepth = Math.max(maxDepth, currentDepth)
    } else if (char === '}') {
      currentDepth = Math.max(0, currentDepth - 1)
    }
  }
  
  return maxDepth
}

function findLineWithPattern(lines: string[], pattern: RegExp): number {
  for (let i = 0; i < lines.length; i++) {
    if (pattern.test(lines[i])) {
      return i + 1
    }
  }
  return 1
}

export default function CodeLinterPage() {
  return (
    <TextToolLayout
      title="Code Linter"
      description="Analyze code for syntax errors, style issues, complexity problems, and security vulnerabilities."
      icon={CheckCircle}
      placeholder="Paste your code here to lint..."
      outputPlaceholder="Linting report will appear here..."
      processFunction={processCodeLinter}
      options={codeLinterOptions}
      examples={codeLinterExamples}
      fileExtensions={[".js", ".py", ".java", ".cs", ".go"]}
      supportFileUpload={true}
      supportUrlInput={true}
    />
  )
}