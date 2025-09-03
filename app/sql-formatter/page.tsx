"use client"

import { TextToolLayout } from "@/components/text-tool-layout"
import { Database } from "lucide-react"

const sqlExamples = [
  {
    name: "SELECT Query",
    content: `SELECT u.id, u.name, u.email, p.title, p.created_at FROM users u LEFT JOIN posts p ON u.id = p.user_id WHERE u.active = 1 AND p.published = true ORDER BY p.created_at DESC LIMIT 10;`,
  },
  {
    name: "Complex JOIN",
    content: `SELECT o.order_id, c.customer_name, p.product_name, oi.quantity, oi.price FROM orders o INNER JOIN customers c ON o.customer_id = c.customer_id INNER JOIN order_items oi ON o.order_id = oi.order_id INNER JOIN products p ON oi.product_id = p.product_id WHERE o.order_date >= '2024-01-01' AND o.status = 'completed';`,
  },
  {
    name: "CREATE TABLE",
    content: `CREATE TABLE users (id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(100) NOT NULL, email VARCHAR(255) UNIQUE NOT NULL, password_hash VARCHAR(255) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);`,
  },
]

const sqlOptions = [
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
    key: "keywordCase",
    label: "Keyword Case",
    type: "select" as const,
    defaultValue: "upper",
    selectOptions: [
      { value: "upper", label: "UPPERCASE" },
      { value: "lower", label: "lowercase" },
      { value: "preserve", label: "Preserve Original" },
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
]

function processSQL(input: string, options: any = {}) {
  try {
    let output = input.trim()

    // Remove comments if requested
    if (options.removeComments) {
      output = output.replace(/--.*$/gm, "")
      output = output.replace(/\/\*[\s\S]*?\*\//g, "")
    }

    if (options.format === "minify") {
      // Minify SQL
      output = output
        .replace(/\s+/g, " ")
        .replace(/\s*([(),;])\s*/g, "$1")
        .replace(/\s*(=|<|>|<=|>=|!=|<>)\s*/g, " $1 ")
        .trim()
    } else {
      // Beautify SQL
      output = beautifySQL(output, options)
    }

    const stats = {
      "Original Size": `${input.length} chars`,
      "Formatted Size": `${output.length} chars`,
      "Statements": `${(output.match(/;/g) || []).length}`,
      "Tables": `${(output.match(/FROM\s+\w+/gi) || []).length}`,
    }

    return { output, stats }
  } catch (error) {
    return {
      output: "",
      error: "SQL formatting failed",
    }
  }
}

function beautifySQL(sql: string, options: any): string {
  const indentStr = typeof options.indent === "number" ? " ".repeat(options.indent) : "\t"
  
  // SQL keywords that should be on new lines
  const keywords = [
    'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN',
    'GROUP BY', 'HAVING', 'ORDER BY', 'LIMIT', 'OFFSET', 'UNION', 'UNION ALL',
    'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP', 'TRUNCATE'
  ]

  let formatted = sql

  // Apply keyword case
  if (options.keywordCase === "upper") {
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
      formatted = formatted.replace(regex, keyword.toUpperCase())
    })
  } else if (options.keywordCase === "lower") {
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
      formatted = formatted.replace(regex, keyword.toLowerCase())
    })
  }

  // Add line breaks before major keywords
  keywords.forEach(keyword => {
    const regex = new RegExp(`\\s+(${keyword})\\s+`, 'gi')
    formatted = formatted.replace(regex, `\n$1 `)
  })

  // Format SELECT columns
  formatted = formatted.replace(/SELECT\s+(.+?)\s+FROM/gi, (match, columns) => {
    const columnList = columns.split(',').map((col: string) => col.trim()).join(',\n' + indentStr)
    return `SELECT\n${indentStr}${columnList}\nFROM`
  })

  // Clean up extra whitespace
  formatted = formatted
    .replace(/\n\s*\n/g, '\n')
    .replace(/^\s+|\s+$/g, '')
    .split('\n')
    .map(line => line.trim())
    .join('\n')

  return formatted
}

function validateSQL(input: string) {
  if (!input.trim()) {
    return { isValid: false, error: "Input cannot be empty" }
  }
  
  // Basic SQL validation
  const openParens = (input.match(/\(/g) || []).length
  const closeParens = (input.match(/\)/g) || []).length
  
  if (openParens !== closeParens) {
    return { isValid: false, error: "Mismatched parentheses in SQL" }
  }
  
  return { isValid: true }
}

export default function SQLFormatterPage() {
  return (
    <TextToolLayout
      title="SQL Formatter"
      description="Format, beautify, and minify SQL queries with proper indentation and keyword formatting."
      icon={Database}
      placeholder="Paste your SQL query here..."
      outputPlaceholder="Formatted SQL will appear here..."
      processFunction={processSQL}
      validateFunction={validateSQL}
      options={sqlOptions}
      examples={sqlExamples}
      fileExtensions={[".sql"]}
    />
  )
}