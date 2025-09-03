"use client"

import { TextToolLayout } from "@/components/text-tool-layout"
import { BarChart3 } from "lucide-react"

const codeAnalyzerExamples = [
  {
    name: "JavaScript Function",
    content: `function calculateUserStats(users) {
  const totalUsers = users.length;
  const activeUsers = users.filter(user => user.isActive);
  const averageAge = users.reduce((sum, user) => sum + user.age, 0) / totalUsers;
  
  return {
    total: totalUsers,
    active: activeUsers.length,
    inactive: totalUsers - activeUsers.length,
    averageAge: Math.round(averageAge),
    oldestUser: Math.max(...users.map(u => u.age)),
    youngestUser: Math.min(...users.map(u => u.age))
  };
}

const users = [
  { name: "John", age: 30, isActive: true },
  { name: "Jane", age: 25, isActive: false },
  { name: "Bob", age: 35, isActive: true }
];

console.log(calculateUserStats(users));`,
  },
  {
    name: "Python Class",
    content: `class UserManager:
    def __init__(self):
        self.users = []
        self.active_count = 0
    
    def add_user(self, name, email, age):
        user = {
            'id': len(self.users) + 1,
            'name': name,
            'email': email,
            'age': age,
            'is_active': True
        }
        self.users.append(user)
        self.active_count += 1
        return user
    
    def deactivate_user(self, user_id):
        for user in self.users:
            if user['id'] == user_id and user['is_active']:
                user['is_active'] = False
                self.active_count -= 1
                return True
        return False
    
    def get_statistics(self):
        if not self.users:
            return {'total': 0, 'active': 0, 'average_age': 0}
        
        total_age = sum(user['age'] for user in self.users)
        return {
            'total': len(self.users),
            'active': self.active_count,
            'average_age': total_age / len(self.users)
        }`,
  },
]

const codeAnalyzerOptions = [
  {
    key: "analysisType",
    label: "Analysis Type",
    type: "select" as const,
    defaultValue: "comprehensive",
    selectOptions: [
      { value: "comprehensive", label: "Comprehensive Analysis" },
      { value: "complexity", label: "Complexity Analysis" },
      { value: "structure", label: "Structure Analysis" },
      { value: "quality", label: "Code Quality" },
    ],
  },
  {
    key: "codeLanguage",
    label: "Language",
    type: "select" as const,
    defaultValue: "auto",
    selectOptions: [
      { value: "auto", label: "Auto Detect" },
      { value: "javascript", label: "JavaScript" },
      { value: "python", label: "Python" },
      { value: "java", label: "Java" },
      { value: "csharp", label: "C#" },
      { value: "cpp", label: "C++" },
      { value: "go", label: "Go" },
      { value: "rust", label: "Rust" },
    ],
  },
  {
    key: "includeMetrics",
    label: "Include Metrics",
    type: "checkbox" as const,
    defaultValue: true,
  },
  {
    key: "includeSuggestions",
    label: "Include Suggestions",
    type: "checkbox" as const,
    defaultValue: true,
  },
  {
    key: "detailedReport",
    label: "Detailed Report",
    type: "checkbox" as const,
    defaultValue: false,
  },
]

function processCodeAnalyzer(input: string, options: any = {}) {
  try {
    if (!input.trim()) {
      return { output: "", error: "Input cannot be empty" }
    }

    const language = options.codeLanguage === "auto" ? detectLanguage(input) : options.codeLanguage
    const analysis = analyzeCode(input, language, options)
    
    let output = `CODE ANALYSIS REPORT\n`
    output += `${"=".repeat(50)}\n\n`
    output += `Language: ${language.toUpperCase()}\n`
    output += `Analysis Type: ${options.analysisType}\n`
    output += `Generated: ${new Date().toLocaleString()}\n\n`

    // Basic Metrics
    output += `BASIC METRICS\n`
    output += `${"-".repeat(20)}\n`
    output += `Lines of Code: ${analysis.metrics.linesOfCode}\n`
    output += `Non-Empty Lines: ${analysis.metrics.nonEmptyLines}\n`
    output += `Comment Lines: ${analysis.metrics.commentLines}\n`
    output += `Characters: ${analysis.metrics.characters}\n\n`

    // Language-specific metrics
    if (options.includeMetrics && analysis.languageMetrics) {
      output += `${language.toUpperCase()} METRICS\n`
      output += `${"-".repeat(20)}\n`
      Object.entries(analysis.languageMetrics).forEach(([key, value]) => {
        output += `${key}: ${value}\n`
      })
      output += `\n`
    }

    // Complexity Analysis
    if (options.analysisType === "comprehensive" || options.analysisType === "complexity") {
      output += `COMPLEXITY ANALYSIS\n`
      output += `${"-".repeat(20)}\n`
      output += `Cyclomatic Complexity: ${analysis.complexity.cyclomatic}\n`
      output += `Nesting Depth: ${analysis.complexity.maxNesting}\n`
      output += `Function Count: ${analysis.complexity.functionCount}\n\n`
    }

    // Code Quality
    if (options.analysisType === "comprehensive" || options.analysisType === "quality") {
      output += `CODE QUALITY\n`
      output += `${"-".repeat(20)}\n`
      output += `Quality Score: ${analysis.quality.score}/100\n`
      output += `Maintainability: ${analysis.quality.maintainability}\n`
      output += `Readability: ${analysis.quality.readability}\n\n`
    }

    // Issues and Suggestions
    if (options.includeSuggestions && analysis.suggestions.length > 0) {
      output += `SUGGESTIONS\n`
      output += `${"-".repeat(20)}\n`
      analysis.suggestions.forEach((suggestion, index) => {
        output += `${index + 1}. ${suggestion}\n`
      })
      output += `\n`
    }

    // Detailed breakdown
    if (options.detailedReport) {
      output += `DETAILED BREAKDOWN\n`
      output += `${"-".repeat(20)}\n`
      output += `Average Line Length: ${(analysis.metrics.characters / analysis.metrics.linesOfCode).toFixed(1)} chars\n`
      output += `Comment Ratio: ${((analysis.metrics.commentLines / analysis.metrics.linesOfCode) * 100).toFixed(1)}%\n`
      output += `Code Density: ${((analysis.metrics.nonEmptyLines / analysis.metrics.linesOfCode) * 100).toFixed(1)}%\n`
    }

    const stats = {
      "Language": language.toUpperCase(),
      "Lines": analysis.metrics.linesOfCode,
      "Functions": analysis.complexity.functionCount,
      "Quality Score": `${analysis.quality.score}/100`,
      "Complexity": analysis.complexity.cyclomatic,
    }

    return { output, stats }
  } catch (error) {
    return {
      output: "",
      error: "Code analysis failed",
    }
  }
}

function detectLanguage(code: string): string {
  if (code.includes('function') && code.includes('const')) return "javascript"
  if (code.includes('def ') && code.includes(':')) return "python"
  if (code.includes('public class') && code.includes('static')) return "java"
  if (code.includes('using System') && code.includes('namespace')) return "csharp"
  if (code.includes('#include') && code.includes('int main')) return "cpp"
  if (code.includes('package main') && code.includes('func')) return "go"
  if (code.includes('fn ') && code.includes('let')) return "rust"
  
  return "javascript"
}

function analyzeCode(code: string, language: string, options: any) {
  const lines = code.split('\n')
  const nonEmptyLines = lines.filter(line => line.trim()).length
  const commentLines = countCommentLines(code, language)
  
  const metrics = {
    linesOfCode: lines.length,
    nonEmptyLines,
    commentLines,
    characters: code.length,
  }

  const languageMetrics = getLanguageSpecificMetrics(code, language)
  const complexity = calculateComplexity(code, language)
  const quality = assessQuality(code, language, metrics)
  const suggestions = generateSuggestions(code, language, quality)

  return {
    metrics,
    languageMetrics,
    complexity,
    quality,
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
    case "xml":
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
      }
    case "python":
      return {
        "Functions": (code.match(/def\s+\w+/g) || []).length,
        "Classes": (code.match(/class\s+\w+/g) || []).length,
        "Imports": (code.match(/^import\s+|^from\s+/gm) || []).length,
        "Decorators": (code.match(/@\w+/g) || []).length,
      }
    case "java":
      return {
        "Classes": (code.match(/class\s+\w+/g) || []).length,
        "Methods": (code.match(/public|private|protected\s+[\w<>\[\]]+\s+\w+\s*\(/g) || []).length,
        "Interfaces": (code.match(/interface\s+\w+/g) || []).length,
        "Annotations": (code.match(/@\w+/g) || []).length,
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
  let complexity = 1 // Base complexity
  
  cyclomaticKeywords.forEach(keyword => {
    const matches = code.match(new RegExp(`\\b${keyword}\\b`, 'g')) || []
    complexity += matches.length
  })
  
  const maxNesting = calculateMaxNesting(code)
  const functionCount = (code.match(/function|def|func\s+\w+/g) || []).length
  
  return {
    cyclomatic: complexity,
    maxNesting,
    functionCount
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

function assessQuality(code: string, language: string, metrics: any) {
  let score = 100
  const issues: string[] = []
  
  // Line length check
  const longLines = code.split('\n').filter(line => line.length > 120).length
  if (longLines > 0) {
    score -= longLines * 2
    issues.push(`${longLines} lines exceed 120 characters`)
  }
  
  // Comment ratio
  const commentRatio = metrics.commentLines / metrics.linesOfCode
  if (commentRatio < 0.1) {
    score -= 10
    issues.push("Low comment ratio (< 10%)")
  }
  
  // Language-specific quality checks
  switch (language) {
    case "javascript":
      if (code.includes('var ')) {
        score -= 5
        issues.push("Usage of 'var' instead of 'let'/'const'")
      }
      if (code.includes('==') && !code.includes('===')) {
        score -= 5
        issues.push("Usage of loose equality (==)")
      }
      break
    case "python":
      if (code.includes('import *')) {
        score -= 5
        issues.push("Wildcard imports detected")
      }
      break
  }
  
  const maintainability = score > 80 ? "High" : score > 60 ? "Medium" : "Low"
  const readability = score > 85 ? "Excellent" : score > 70 ? "Good" : score > 50 ? "Fair" : "Poor"
  
  return {
    score: Math.max(0, score),
    maintainability,
    readability,
    issues
  }
}

function generateSuggestions(code: string, language: string, quality: any): string[] {
  const suggestions: string[] = []
  
  quality.issues.forEach((issue: string) => {
    if (issue.includes("comment ratio")) {
      suggestions.push("Add more comments to explain complex logic")
    }
    if (issue.includes("var")) {
      suggestions.push("Replace 'var' with 'let' or 'const' for better scoping")
    }
    if (issue.includes("loose equality")) {
      suggestions.push("Use strict equality (===) instead of loose equality (==)")
    }
    if (issue.includes("120 characters")) {
      suggestions.push("Break long lines into multiple lines for better readability")
    }
  })
  
  // General suggestions based on language
  switch (language) {
    case "javascript":
      if (code.includes('function') && !code.includes('const')) {
        suggestions.push("Consider using arrow functions for shorter syntax")
      }
      break
    case "python":
      if (!code.includes('"""') && !code.includes("'''")) {
        suggestions.push("Add docstrings to functions and classes")
      }
      break
  }
  
  return suggestions
}

export default function CodeAnalyzerPage() {
  return (
    <TextToolLayout
      title="Code Analyzer"
      description="Analyze code complexity, quality, and structure with detailed metrics and improvement suggestions."
      icon={BarChart3}
      placeholder="Paste your code here to analyze..."
      outputPlaceholder="Analysis report will appear here..."
      processFunction={processCodeAnalyzer}
      options={codeAnalyzerOptions}
      examples={codeAnalyzerExamples}
      fileExtensions={[".js", ".py", ".java", ".cs", ".cpp", ".go", ".rs"]}
      supportFileUpload={true}
      supportUrlInput={true}
    />
  )
}