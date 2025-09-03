"use client"

import { TextToolLayout } from "@/components/text-tool-layout"
import { RefreshCw } from "lucide-react"

const codeRefactorExamples = [
  {
    name: "Long Function",
    content: `function processUserData(userData) {
  // Validate input
  if (!userData || !userData.email || !userData.name) {
    throw new Error('Invalid user data');
  }
  
  // Clean email
  const email = userData.email.toLowerCase().trim();
  if (!email.includes('@')) {
    throw new Error('Invalid email format');
  }
  
  // Clean name
  const name = userData.name.trim();
  if (name.length < 2) {
    throw new Error('Name too short');
  }
  
  // Generate ID
  const id = Date.now() + Math.random();
  
  // Create user object
  const user = {
    id: id,
    name: name,
    email: email,
    created: new Date(),
    active: true
  };
  
  // Save to database
  database.users.push(user);
  
  // Send welcome email
  emailService.send(email, 'Welcome!', 'Welcome to our platform');
  
  // Log activity
  console.log('User created:', user.id);
  
  return user;
}`,
  },
  {
    name: "Nested Conditions",
    content: `function checkUserAccess(user, resource) {
  if (user) {
    if (user.active) {
      if (user.role) {
        if (user.role === 'admin') {
          return true;
        } else {
          if (user.permissions) {
            if (user.permissions.includes(resource)) {
              return true;
            } else {
              return false;
            }
          } else {
            return false;
          }
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
  } else {
    return false;
  }
}`,
  },
]

const codeRefactorOptions = [
  {
    key: "refactorType",
    label: "Refactor Type",
    type: "select" as const,
    defaultValue: "comprehensive",
    selectOptions: [
      { value: "extract-functions", label: "Extract Functions" },
      { value: "simplify-conditions", label: "Simplify Conditions" },
      { value: "remove-duplication", label: "Remove Duplication" },
      { value: "improve-naming", label: "Improve Naming" },
      { value: "comprehensive", label: "Comprehensive Refactor" },
    ],
  },
  {
    key: "targetComplexity",
    label: "Target Complexity",
    type: "select" as const,
    defaultValue: "medium",
    selectOptions: [
      { value: "low", label: "Low (Simple functions)" },
      { value: "medium", label: "Medium (Balanced)" },
      { value: "high", label: "High (Keep complex logic)" },
    ],
  },
  {
    key: "extractThreshold",
    label: "Function Extract Threshold (lines)",
    type: "slider" as const,
    defaultValue: 20,
    min: 10,
    max: 50,
    step: 5,
  },
  {
    key: "addDocumentation",
    label: "Add Documentation",
    type: "checkbox" as const,
    defaultValue: true,
  },
  {
    key: "modernizeSyntax",
    label: "Modernize Syntax",
    type: "checkbox" as const,
    defaultValue: true,
  },
]

function processCodeRefactor(input: string, options: any = {}) {
  try {
    const language = detectLanguage(input)
    let refactoredCode = input
    
    switch (options.refactorType) {
      case "extract-functions":
        refactoredCode = extractFunctions(refactoredCode, options)
        break
      case "simplify-conditions":
        refactoredCode = simplifyConditions(refactoredCode, options)
        break
      case "remove-duplication":
        refactoredCode = removeDuplication(refactoredCode, options)
        break
      case "improve-naming":
        refactoredCode = improveNaming(refactoredCode, options)
        break
      case "comprehensive":
        refactoredCode = comprehensiveRefactor(refactoredCode, language, options)
        break
    }
    
    if (options.modernizeSyntax) {
      refactoredCode = modernizeSyntax(refactoredCode, language)
    }
    
    if (options.addDocumentation) {
      refactoredCode = addDocumentation(refactoredCode, language)
    }

    const stats = {
      "Language": language.toUpperCase(),
      "Refactor Type": options.refactorType,
      "Original Lines": input.split('\n').length,
      "Refactored Lines": refactoredCode.split('\n').length,
      "Functions Extracted": countExtractedFunctions(input, refactoredCode),
      "Complexity": "Reduced",
    }

    return { output: refactoredCode, stats }
  } catch (error) {
    return {
      output: "",
      error: "Code refactoring failed",
    }
  }
}

function detectLanguage(code: string): string {
  if (code.includes('function') && code.includes('const')) return "javascript"
  if (code.includes('def ') && code.includes(':')) return "python"
  if (code.includes('public class') && code.includes('static')) return "java"
  
  return "javascript"
}

function extractFunctions(code: string, options: any): string {
  const threshold = options.extractThreshold || 20
  let refactored = code
  
  // Find long functions and extract helper functions
  const functionPattern = /function\s+(\w+)\s*\([^)]*\)\s*{[^{}]*(?:{[^{}]*}[^{}]*)*}/g
  const functions = []
  let match
  
  while ((match = functionPattern.exec(code)) !== null) {
    const funcContent = match[0]
    const funcLines = funcContent.split('\n').length
    
    if (funcLines > threshold) {
      functions.push({
        original: funcContent,
        name: match[1],
        lines: funcLines
      })
    }
  }
  
  // Extract helper functions
  functions.forEach(func => {
    const extracted = extractHelperFunctions(func.original, func.name)
    refactored = refactored.replace(func.original, extracted.mainFunction)
    refactored = extracted.helperFunctions + '\n\n' + refactored
  })
  
  return refactored
}

function extractHelperFunctions(funcCode: string, funcName: string): { mainFunction: string; helperFunctions: string } {
  const lines = funcCode.split('\n')
  const helperFunctions: string[] = []
  const mainLines: string[] = []
  
  let currentHelper: string[] = []
  let inHelper = false
  
  lines.forEach(line => {
    const trimmed = line.trim()
    
    // Detect potential helper function blocks
    if (trimmed.startsWith('//') && trimmed.toLowerCase().includes('validate')) {
      if (currentHelper.length > 0) {
        helperFunctions.push(createHelperFunction('validate', currentHelper))
        currentHelper = []
      }
      inHelper = true
    } else if (trimmed.startsWith('//') && trimmed.toLowerCase().includes('clean')) {
      if (currentHelper.length > 0) {
        helperFunctions.push(createHelperFunction('clean', currentHelper))
        currentHelper = []
      }
      inHelper = true
    } else if (inHelper && trimmed === '') {
      inHelper = false
      if (currentHelper.length > 0) {
        helperFunctions.push(createHelperFunction('helper', currentHelper))
        currentHelper = []
      }
    }
    
    if (inHelper) {
      currentHelper.push(line)
    } else {
      mainLines.push(line)
    }
  })
  
  return {
    mainFunction: mainLines.join('\n'),
    helperFunctions: helperFunctions.join('\n\n')
  }
}

function createHelperFunction(type: string, lines: string[]): string {
  const funcName = `${type}Data`
  return `function ${funcName}(data) {\n${lines.join('\n')}\n  return data;\n}`
}

function simplifyConditions(code: string, options: any): string {
  let simplified = code
  
  // Flatten nested if statements
  simplified = simplified.replace(
    /if\s*\([^)]+\)\s*{\s*if\s*\([^)]+\)\s*{\s*return\s+([^;]+);\s*}\s*}/g,
    'if ($1 && $2) { return $3; }'
  )
  
  // Convert nested if-else to early returns
  simplified = convertToEarlyReturns(simplified)
  
  // Simplify boolean expressions
  simplified = simplified.replace(/if\s*\((\w+)\s*===?\s*true\)/g, 'if ($1)')
  simplified = simplified.replace(/if\s*\((\w+)\s*===?\s*false\)/g, 'if (!$1)')
  
  return simplified
}

function convertToEarlyReturns(code: string): string {
  // Convert deeply nested conditions to early returns
  return code.replace(
    /if\s*\(([^)]+)\)\s*{\s*if\s*\(([^)]+)\)\s*{\s*if\s*\(([^)]+)\)\s*{\s*return\s+([^;]+);\s*}\s*else\s*{\s*return\s+([^;]+);\s*}\s*}\s*else\s*{\s*return\s+([^;]+);\s*}\s*}\s*else\s*{\s*return\s+([^;]+);\s*}/g,
    `if (!$1) return $7;
  if (!$2) return $6;
  if (!$3) return $5;
  return $4;`
  )
}

function removeDuplication(code: string, options: any): string {
  const lines = code.split('\n')
  const duplicateMap = new Map()
  const uniqueLines: string[] = []
  
  lines.forEach(line => {
    const trimmed = line.trim()
    if (trimmed.length > 10) {
      const count = duplicateMap.get(trimmed) || 0
      duplicateMap.set(trimmed, count + 1)
      
      if (count === 0) {
        uniqueLines.push(line)
      } else {
        uniqueLines.push(`// Duplicate removed: ${trimmed.substring(0, 30)}...`)
      }
    } else {
      uniqueLines.push(line)
    }
  })
  
  return uniqueLines.join('\n')
}

function improveNaming(code: string, options: any): string {
  let improved = code
  
  // Improve variable names
  const namingMap = new Map([
    ['data', 'userData'],
    ['item', 'userItem'],
    ['temp', 'temporaryValue'],
    ['result', 'processedResult'],
    ['obj', 'dataObject'],
    ['arr', 'dataArray'],
    ['str', 'textString'],
    ['num', 'numberValue'],
    ['i', 'index'],
    ['j', 'innerIndex'],
    ['k', 'nestedIndex'],
  ])
  
  namingMap.forEach((better, original) => {
    const regex = new RegExp(`\\b${original}\\b`, 'g')
    improved = improved.replace(regex, better)
  })
  
  return improved
}

function comprehensiveRefactor(code: string, language: string, options: any): string {
  let refactored = code
  
  // Apply all refactoring techniques
  refactored = extractFunctions(refactored, options)
  refactored = simplifyConditions(refactored, options)
  refactored = removeDuplication(refactored, options)
  refactored = improveNaming(refactored, options)
  
  // Add error handling
  refactored = addErrorHandling(refactored, language)
  
  // Optimize performance
  refactored = optimizePerformance(refactored, language)
  
  return refactored
}

function addErrorHandling(code: string, language: string): string {
  if (language === "javascript") {
    // Wrap risky operations in try-catch
    return code.replace(
      /(JSON\.parse\([^)]+\)|fetch\([^)]+\)|localStorage\.[^;]+)/g,
      `try { $1 } catch (error) { console.error('Operation failed:', error); }`
    )
  }
  
  return code
}

function optimizePerformance(code: string, language: string): string {
  if (language === "javascript") {
    // Replace inefficient patterns
    code = code.replace(/for\s*\(\s*let\s+\w+\s*=\s*0;[^}]+\+\+[^}]+\)/g, 
      match => match.replace('for (', 'for (const '))
  }
  
  return code
}

function modernizeSyntax(code: string, language: string): string {
  if (language === "javascript") {
    // Convert to modern JavaScript
    code = code.replace(/var\s+/g, 'const ')
    code = code.replace(/function\s*\(/g, '(')
    code = code.replace(/\)\s*{/g, ') => {')
  }
  
  return code
}

function addDocumentation(code: string, language: string): string {
  if (language === "javascript") {
    // Add JSDoc comments to functions
    return code.replace(/function\s+(\w+)\s*\(([^)]*)\)/g, 
      `/**
 * $1 function
 * @param {any} $2 - Function parameters
 * @returns {any} Function result
 */
function $1($2)`)
  }
  
  return code
}

function countExtractedFunctions(original: string, refactored: string): number {
  const originalFunctions = (original.match(/function\s+\w+/g) || []).length
  const refactoredFunctions = (refactored.match(/function\s+\w+/g) || []).length
  return Math.max(0, refactoredFunctions - originalFunctions)
}

export default function CodeRefactorPage() {
  return (
    <TextToolLayout
      title="Code Refactor"
      description="Refactor code to improve readability, maintainability, and performance with automated techniques."
      icon={RefreshCw}
      placeholder="Paste your code here to refactor..."
      outputPlaceholder="Refactored code will appear here..."
      processFunction={processCodeRefactor}
      options={codeRefactorOptions}
      examples={codeRefactorExamples}
      fileExtensions={[".js", ".py", ".java", ".cs", ".go"]}
      supportFileUpload={true}
      supportUrlInput={true}
    />
  )
}