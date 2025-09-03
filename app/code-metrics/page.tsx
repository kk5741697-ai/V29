"use client"

import { TextToolLayout } from "@/components/text-tool-layout"
import { BarChart3 } from "lucide-react"

const codeMetricsExamples = [
  {
    name: "JavaScript Class",
    content: `class UserService {
  constructor(apiClient) {
    this.apiClient = apiClient;
    this.cache = new Map();
  }

  async getUser(id) {
    if (this.cache.has(id)) {
      return this.cache.get(id);
    }

    try {
      const user = await this.apiClient.get(\`/users/\${id}\`);
      this.cache.set(id, user);
      return user;
    } catch (error) {
      console.error('Failed to fetch user:', error);
      throw error;
    }
  }

  async createUser(userData) {
    if (!userData.email || !userData.name) {
      throw new Error('Email and name are required');
    }

    const user = await this.apiClient.post('/users', userData);
    this.cache.set(user.id, user);
    return user;
  }

  clearCache() {
    this.cache.clear();
  }
}`,
  },
  {
    name: "Complex Function",
    content: `function processOrderData(orders, filters = {}) {
  const results = {
    processed: 0,
    errors: 0,
    total: orders.length,
    summary: {}
  };

  for (let i = 0; i < orders.length; i++) {
    const order = orders[i];
    
    try {
      // Validate order
      if (!order.id || !order.customerId) {
        results.errors++;
        continue;
      }

      // Apply filters
      if (filters.status && order.status !== filters.status) {
        continue;
      }

      if (filters.dateRange) {
        const orderDate = new Date(order.createdAt);
        if (orderDate < filters.dateRange.start || orderDate > filters.dateRange.end) {
          continue;
        }
      }

      // Process order
      const processedOrder = {
        ...order,
        total: order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        itemCount: order.items.length,
        processed: true
      };

      // Update summary
      const status = processedOrder.status || 'unknown';
      results.summary[status] = (results.summary[status] || 0) + 1;
      results.processed++;

    } catch (error) {
      console.error(\`Error processing order \${order.id}:\`, error);
      results.errors++;
    }
  }

  return results;
}`,
  },
]

const codeMetricsOptions = [
  {
    key: "analysisDepth",
    label: "Analysis Depth",
    type: "select" as const,
    defaultValue: "comprehensive",
    selectOptions: [
      { value: "basic", label: "Basic Metrics" },
      { value: "standard", label: "Standard Analysis" },
      { value: "comprehensive", label: "Comprehensive" },
      { value: "detailed", label: "Detailed Report" },
    ],
  },
  {
    key: "includeComplexity",
    label: "Include Complexity Analysis",
    type: "checkbox" as const,
    defaultValue: true,
  },
  {
    key: "includeMaintainability",
    label: "Include Maintainability Index",
    type: "checkbox" as const,
    defaultValue: true,
  },
  {
    key: "includeCodeSmells",
    label: "Detect Code Smells",
    type: "checkbox" as const,
    defaultValue: true,
  },
  {
    key: "includeSuggestions",
    label: "Include Improvement Suggestions",
    type: "checkbox" as const,
    defaultValue: true,
  },
]

function processCodeMetrics(input: string, options: any = {}) {
  try {
    const codeType = detectCodeType(input)
    const metrics = analyzeCode(input, codeType, options)
    
    let output = `CODE METRICS REPORT\n`
    output += `${"=".repeat(50)}\n\n`
    output += `Language: ${codeType.toUpperCase()}\n`
    output += `Analysis Depth: ${options.analysisDepth}\n`
    output += `Generated: ${new Date().toLocaleString()}\n\n`

    // Basic Metrics
    output += `BASIC METRICS\n`
    output += `${"-".repeat(20)}\n`
    output += `Lines of Code: ${metrics.basic.linesOfCode}\n`
    output += `Non-Empty Lines: ${metrics.basic.nonEmptyLines}\n`
    output += `Comment Lines: ${metrics.basic.commentLines}\n`
    output += `Blank Lines: ${metrics.basic.blankLines}\n`
    output += `Characters: ${metrics.basic.characters}\n`
    output += `Average Line Length: ${metrics.basic.avgLineLength.toFixed(1)}\n\n`

    // Language-specific metrics
    if (metrics.language) {
      output += `${codeType.toUpperCase()} METRICS\n`
      output += `${"-".repeat(20)}\n`
      Object.entries(metrics.language).forEach(([key, value]) => {
        output += `${key}: ${value}\n`
      })
      output += `\n`
    }

    // Complexity Analysis
    if (options.includeComplexity && metrics.complexity) {
      output += `COMPLEXITY ANALYSIS\n`
      output += `${"-".repeat(20)}\n`
      output += `Cyclomatic Complexity: ${metrics.complexity.cyclomatic}\n`
      output += `Cognitive Complexity: ${metrics.complexity.cognitive}\n`
      output += `Nesting Depth: ${metrics.complexity.maxNesting}\n`
      output += `Function Count: ${metrics.complexity.functionCount}\n`
      output += `Average Function Length: ${metrics.complexity.avgFunctionLength.toFixed(1)}\n\n`
    }

    // Maintainability
    if (options.includeMaintainability && metrics.maintainability) {
      output += `MAINTAINABILITY INDEX\n`
      output += `${"-".repeat(20)}\n`
      output += `Overall Score: ${metrics.maintainability.score}/100\n`
      output += `Readability: ${metrics.maintainability.readability}\n`
      output += `Testability: ${metrics.maintainability.testability}\n`
      output += `Modularity: ${metrics.maintainability.modularity}\n\n`
    }

    // Code Smells
    if (options.includeCodeSmells && metrics.codeSmells.length > 0) {
      output += `CODE SMELLS DETECTED\n`
      output += `${"-".repeat(20)}\n`
      metrics.codeSmells.forEach((smell, index) => {
        output += `${index + 1}. ${smell.type}: ${smell.description}\n`
        if (smell.line) {
          output += `   Line ${smell.line}: ${smell.code}\n`
        }
      })
      output += `\n`
    }

    // Suggestions
    if (options.includeSuggestions && metrics.suggestions.length > 0) {
      output += `IMPROVEMENT SUGGESTIONS\n`
      output += `${"-".repeat(20)}\n`
      metrics.suggestions.forEach((suggestion, index) => {
        output += `${index + 1}. ${suggestion}\n`
      })
      output += `\n`
    }

    // Detailed breakdown
    if (options.analysisDepth === "detailed") {
      output += `DETAILED BREAKDOWN\n`
      output += `${"-".repeat(20)}\n`
      output += `Comment Ratio: ${((metrics.basic.commentLines / metrics.basic.linesOfCode) * 100).toFixed(1)}%\n`
      output += `Code Density: ${((metrics.basic.nonEmptyLines / metrics.basic.linesOfCode) * 100).toFixed(1)}%\n`
      output += `Function Density: ${(metrics.complexity.functionCount / metrics.basic.linesOfCode * 100).toFixed(2)}%\n`
    }

    const stats = {
      "Language": codeType.toUpperCase(),
      "Lines": metrics.basic.linesOfCode,
      "Functions": metrics.complexity.functionCount,
      "Complexity": metrics.complexity.cyclomatic,
      "Maintainability": `${metrics.maintainability.score}/100`,
      "Code Smells": metrics.codeSmells.length,
    }

    return { output, stats }
  } catch (error) {
    return {
      output: "",
      error: "Code metrics analysis failed",
    }
  }
}

function detectCodeType(code: string): string {
  if (code.includes('function') && code.includes('const')) return "javascript"
  if (code.includes('def ') && code.includes(':')) return "python"
  if (code.includes('public class') && code.includes('static')) return "java"
  if (code.includes('using System') && code.includes('namespace')) return "csharp"
  if (code.includes('#include') && code.includes('int main')) return "cpp"
  
  return "javascript"
}

function analyzeCode(code: string, language: string, options: any) {
  const lines = code.split('\n')
  const nonEmptyLines = lines.filter(line => line.trim()).length
  const commentLines = countCommentLines(code, language)
  const blankLines = lines.length - nonEmptyLines
  
  const basic = {
    linesOfCode: lines.length,
    nonEmptyLines,
    commentLines,
    blankLines,
    characters: code.length,
    avgLineLength: code.length / lines.length,
  }

  const language_metrics = getLanguageSpecificMetrics(code, language)
  const complexity = calculateComplexity(code, language)
  const maintainability = assessMaintainability(code, language, basic)
  const codeSmells = detectCodeSmells(code, language)
  const suggestions = generateSuggestions(code, language, maintainability, codeSmells)

  return {
    basic,
    language: language_metrics,
    complexity,
    maintainability,
    codeSmells,
    suggestions
  }
}

function countCommentLines(code: string, language: string): number {
  let commentPattern: RegExp
  
  switch (language) {
    case "python":
      commentPattern = /^\s*#/gm
      break
    case "html":
      commentPattern = /<!--[\s\S]*?-->/g
      break
    default:
      commentPattern = /^\s*(\/\/|\/\*|\*)/gm
  }
  
  return (code.match(commentPattern) || []).length
}

function getLanguageSpecificMetrics(code: string, language: string) {
  switch (language) {
    case "javascript":
      return {
        "Functions": (code.match(/function\s+\w+/g) || []).length,
        "Arrow Functions": (code.match(/=>\s*{?/g) || []).length,
        "Classes": (code.match(/class\s+\w+/g) || []).length,
        "Variables": (code.match(/(?:var|let|const)\s+\w+/g) || []).length,
        "Async Functions": (code.match(/async\s+function/g) || []).length,
        "Promises": (code.match(/\.then\(|\.catch\(/g) || []).length,
        "Callbacks": (code.match(/function\s*\([^)]*\)\s*{/g) || []).length,
      }
    case "python":
      return {
        "Functions": (code.match(/def\s+\w+/g) || []).length,
        "Classes": (code.match(/class\s+\w+/g) || []).length,
        "Imports": (code.match(/^import\s+|^from\s+/gm) || []).length,
        "Decorators": (code.match(/@\w+/g) || []).length,
        "List Comprehensions": (code.match(/\[[^\]]*for\s+\w+\s+in[^\]]*\]/g) || []).length,
      }
    default:
      return {
        "Functions": (code.match(/function|def|func\s+\w+/g) || []).length,
        "Classes": (code.match(/class\s+\w+/g) || []).length,
      }
  }
}

function calculateComplexity(code: string, language: string) {
  const cyclomaticKeywords = ['if', 'else', 'while', 'for', 'switch', 'case', 'catch', 'try', '&&', '||', '?']
  let cyclomatic = 1 // Base complexity
  
  cyclomaticKeywords.forEach(keyword => {
    const matches = code.match(new RegExp(`\\b${keyword}\\b`, 'g')) || []
    cyclomatic += matches.length
  })
  
  // Cognitive complexity (more sophisticated)
  let cognitive = 0
  const cognitivePatterns = [
    { pattern: /if\s*\(/g, weight: 1 },
    { pattern: /else\s+if/g, weight: 1 },
    { pattern: /while\s*\(/g, weight: 1 },
    { pattern: /for\s*\(/g, weight: 1 },
    { pattern: /switch\s*\(/g, weight: 1 },
    { pattern: /catch\s*\(/g, weight: 1 },
    { pattern: /&&|\|\|/g, weight: 1 },
    { pattern: /\?\s*[^:]*:/g, weight: 1 },
  ]
  
  cognitivePatterns.forEach(({ pattern, weight }) => {
    const matches = code.match(pattern) || []
    cognitive += matches.length * weight
  })
  
  const maxNesting = calculateMaxNesting(code)
  const functionCount = (code.match(/function|def|func\s+\w+/g) || []).length
  const avgFunctionLength = functionCount > 0 ? code.split('\n').length / functionCount : 0
  
  return {
    cyclomatic,
    cognitive,
    maxNesting,
    functionCount,
    avgFunctionLength
  }
}

function calculateMaxNesting(code: string): number {
  let maxDepth = 0
  let currentDepth = 0
  
  for (const char of code) {
    if (char === '{' || char === '(') {
      currentDepth++
      maxDepth = Math.max(maxDepth, currentDepth)
    } else if (char === '}' || char === ')') {
      currentDepth = Math.max(0, currentDepth - 1)
    }
  }
  
  return maxDepth
}

function assessMaintainability(code: string, language: string, basic: any) {
  let score = 100
  
  // Line length penalty
  const longLines = code.split('\n').filter(line => line.length > 120).length
  score -= longLines * 2
  
  // Comment ratio
  const commentRatio = basic.commentLines / basic.linesOfCode
  if (commentRatio < 0.1) score -= 15
  if (commentRatio > 0.3) score += 5
  
  // Function length
  const avgFunctionLength = basic.linesOfCode / Math.max(1, (code.match(/function|def/g) || []).length)
  if (avgFunctionLength > 50) score -= 10
  if (avgFunctionLength > 100) score -= 20
  
  // Language-specific penalties
  if (language === "javascript") {
    if (code.includes('var ')) score -= 5
    if (code.includes('==') && !code.includes('===')) score -= 5
    if (code.includes('eval(')) score -= 20
  }
  
  score = Math.max(0, Math.min(100, score))
  
  return {
    score,
    readability: score > 80 ? "Excellent" : score > 60 ? "Good" : score > 40 ? "Fair" : "Poor",
    testability: score > 75 ? "High" : score > 50 ? "Medium" : "Low",
    modularity: score > 70 ? "Good" : score > 40 ? "Fair" : "Poor"
  }
}

function detectCodeSmells(code: string, language: string) {
  const smells: Array<{ type: string; description: string; line?: number; code?: string }> = []
  
  // Long functions
  const functions = code.match(/function\s+\w+[^{]*{[^{}]*(?:{[^{}]*}[^{}]*)*}/g) || []
  functions.forEach(func => {
    if (func.split('\n').length > 50) {
      smells.push({
        type: "Long Function",
        description: "Function is too long and should be broken down"
      })
    }
  })
  
  // Magic numbers
  const magicNumbers = code.match(/\b\d{2,}\b/g) || []
  if (magicNumbers.length > 5) {
    smells.push({
      type: "Magic Numbers",
      description: "Consider using named constants instead of magic numbers"
    })
  }
  
  // Duplicate code
  const lines = code.split('\n')
  const duplicateLines = findDuplicateLines(lines)
  if (duplicateLines.length > 0) {
    smells.push({
      type: "Duplicate Code",
      description: `${duplicateLines.length} duplicate lines found`
    })
  }
  
  // Language-specific smells
  if (language === "javascript") {
    if (code.includes('var ')) {
      smells.push({
        type: "Outdated Syntax",
        description: "Use 'let' or 'const' instead of 'var'"
      })
    }
    
    if (code.includes('==') && !code.includes('===')) {
      smells.push({
        type: "Loose Equality",
        description: "Use strict equality (===) instead of loose equality (==)"
      })
    }
  }
  
  return smells
}

function findDuplicateLines(lines: string[]): string[] {
  const lineCount = new Map()
  const duplicates: string[] = []
  
  lines.forEach(line => {
    const trimmed = line.trim()
    if (trimmed.length > 10) { // Only check substantial lines
      lineCount.set(trimmed, (lineCount.get(trimmed) || 0) + 1)
    }
  })
  
  lineCount.forEach((count, line) => {
    if (count > 1) {
      duplicates.push(line)
    }
  })
  
  return duplicates
}

function generateSuggestions(code: string, language: string, maintainability: any, codeSmells: any[]): string[] {
  const suggestions: string[] = []
  
  if (maintainability.score < 60) {
    suggestions.push("Consider refactoring to improve overall code quality")
  }
  
  if (codeSmells.length > 5) {
    suggestions.push("Address code smells to improve maintainability")
  }
  
  const avgLineLength = code.length / code.split('\n').length
  if (avgLineLength > 100) {
    suggestions.push("Break long lines for better readability")
  }
  
  const commentRatio = (code.match(/\/\/|\/\*|#/g) || []).length / code.split('\n').length
  if (commentRatio < 0.1) {
    suggestions.push("Add more comments to explain complex logic")
  }
  
  // Language-specific suggestions
  if (language === "javascript") {
    if (!code.includes('const') && !code.includes('let')) {
      suggestions.push("Use modern JavaScript features (const, let, arrow functions)")
    }
    
    if (code.includes('function') && !code.includes('=>')) {
      suggestions.push("Consider using arrow functions for shorter syntax")
    }
  }
  
  return suggestions
}

export default function CodeMetricsPage() {
  return (
    <TextToolLayout
      title="Code Metrics Analyzer"
      description="Analyze code quality, complexity, maintainability, and detect code smells with detailed metrics."
      icon={BarChart3}
      placeholder="Paste your code here to analyze..."
      outputPlaceholder="Detailed metrics report will appear here..."
      processFunction={processCodeMetrics}
      options={codeMetricsOptions}
      examples={codeMetricsExamples}
      fileExtensions={[".js", ".py", ".java", ".cs", ".cpp", ".go", ".rs"]}
      supportFileUpload={true}
      supportUrlInput={true}
    />
  )
}