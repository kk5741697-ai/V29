"use client"

import { TextToolLayout } from "@/components/text-tool-layout"
import { FileCode } from "lucide-react"

const jsExamples = [
  {
    name: "Function Declaration",
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
    name: "ES6 Features",
    content: `const users = [
  { id: 1, name: "John", age: 30, active: true },
  { id: 2, name: "Jane", age: 25, active: false },
  { id: 3, name: "Bob", age: 35, active: true }
];

const activeUsers = users
  .filter(user => user.active)
  .map(user => ({
    ...user,
    displayName: \`\${user.name} (\${user.age})\`
  }));

const getUserById = (id) => users.find(user => user.id === id);`,
  },
  {
    name: "Async/Await",
    content: `async function fetchUserData(userId) {
  try {
    const response = await fetch(\`/api/users/\${userId}\`);
    
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    
    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error("Failed to fetch user data:", error);
    return null;
  }
}

// Usage
fetchUserData(123).then(user => {
  if (user) {
    console.log("User loaded:", user.name);
  }
});`,
  },
]

const jsOptions = [
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
    defaultValue: 2,
    selectOptions: [
      { value: 2, label: "2 Spaces" },
      { value: 4, label: "4 Spaces" },
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
    key: "removeConsole",
    label: "Remove console.log",
    type: "checkbox" as const,
    defaultValue: false,
  },
]

function processJavaScript(input: string, options: any = {}) {
  try {
    let output = input

    // Remove comments
    if (options.removeComments) {
      output = output.replace(/\/\/.*$/gm, "")
      output = output.replace(/\/\*[\s\S]*?\*\//g, "")
    }

    // Remove console statements
    if (options.removeConsole) {
      output = output.replace(/console\.(log|warn|error|info|debug)\([^)]*\);?/g, "")
    }

    if (options.format === "minify") {
      output = output
        .replace(/\s+/g, " ")
        .replace(/;\s*}/g, "}")
        .replace(/\s*{\s*/g, "{")
        .replace(/;\s*/g, ";")
        .replace(/,\s*/g, ",")
        .replace(/\s*=\s*/g, "=")
        .trim()
    } else {
      // Beautify
      const indentStr = typeof options.indent === "number" ? " ".repeat(options.indent) : "\t"
      output = beautifyJavaScript(output, indentStr)
    }

    const originalSize = input.length
    const processedSize = output.length
    const savings = originalSize > 0 ? ((originalSize - processedSize) / originalSize) * 100 : 0

    const stats = {
      "Original Size": `${originalSize} chars`,
      "Processed Size": `${processedSize} chars`,
      "Size Change": `${savings.toFixed(1)}%`,
      "Functions": `${(input.match(/function\s+\w+/g) || []).length}`,
      "Variables": `${(input.match(/(?:var|let|const)\s+\w+/g) || []).length}`,
    }

    return { output, stats }
  } catch (error) {
    return {
      output: "",
      error: "JavaScript processing failed",
    }
  }
}

function beautifyJavaScript(code: string, indent: string): string {
  let result = ""
  let level = 0
  let inString = false
  let stringChar = ""
  let inComment = false
  let inLineComment = false

  for (let i = 0; i < code.length; i++) {
    const char = code[i]
    const nextChar = code[i + 1]
    const prevChar = code[i - 1]

    // Handle comments
    if (!inString && char === "/" && nextChar === "*") {
      inComment = true
      result += char
      continue
    }
    if (inComment && char === "*" && nextChar === "/") {
      inComment = false
      result += char
      continue
    }
    if (!inString && char === "/" && nextChar === "/") {
      inLineComment = true
      result += char
      continue
    }
    if (inLineComment && char === "\n") {
      inLineComment = false
      result += char + indent.repeat(level)
      continue
    }

    if (inComment || inLineComment) {
      result += char
      continue
    }

    // Handle strings
    if ((char === '"' || char === "'" || char === "`") && prevChar !== "\\") {
      if (!inString) {
        inString = true
        stringChar = char
      } else if (char === stringChar) {
        inString = false
        stringChar = ""
      }
      result += char
      continue
    }

    if (inString) {
      result += char
      continue
    }

    // Handle braces and indentation
    if (char === "{") {
      result += char + "\n" + indent.repeat(++level)
    } else if (char === "}") {
      level = Math.max(0, level - 1)
      result = result.trimEnd() + "\n" + indent.repeat(level) + char
      if (nextChar && nextChar !== ";" && nextChar !== "," && nextChar !== ")") {
        result += "\n" + indent.repeat(level)
      }
    } else if (char === ";") {
      result += char
      if (nextChar && nextChar !== "\n" && nextChar !== "}") {
        result += "\n" + indent.repeat(level)
      }
    } else if (char === "\n") {
      result += char + indent.repeat(level)
    } else {
      result += char
    }
  }

  return result.replace(/\n\s*\n\s*\n/g, "\n\n").trim()
}

function validateJavaScript(input: string) {
  if (!input.trim()) {
    return { isValid: false, error: "Input cannot be empty" }
  }
  
  const openBraces = (input.match(/{/g) || []).length
  const closeBraces = (input.match(/}/g) || []).length
  const openParens = (input.match(/\(/g) || []).length
  const closeParens = (input.match(/\)/g) || []).length
  
  if (openBraces !== closeBraces) {
    return { isValid: false, error: "Mismatched braces in JavaScript" }
  }
  
  if (openParens !== closeParens) {
    return { isValid: false, error: "Mismatched parentheses in JavaScript" }
  }
  
  return { isValid: true }
}

export default function JavaScriptFormatterPage() {
  return (
    <TextToolLayout
      title="JavaScript Formatter"
      description="Beautify, minify, and format JavaScript code with syntax validation and optimization options."
      icon={FileCode}
      placeholder="Paste your JavaScript here..."
      outputPlaceholder="Formatted JavaScript will appear here..."
      processFunction={processJavaScript}
      validateFunction={validateJavaScript}
      options={jsOptions}
      examples={jsExamples}
      fileExtensions={[".js", ".mjs"]}
    />
  )
}