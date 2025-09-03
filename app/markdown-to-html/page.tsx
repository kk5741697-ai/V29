"use client"

import { TextToolLayout } from "@/components/text-tool-layout"
import { FileText } from "lucide-react"

const markdownExamples = [
  {
    name: "Basic Markdown",
    content: `# Heading 1
## Heading 2
### Heading 3

This is a paragraph with **bold text** and *italic text*.

- List item 1
- List item 2
- List item 3

1. Numbered item 1
2. Numbered item 2
3. Numbered item 3

[Link to Google](https://google.com)

\`inline code\`

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

> This is a blockquote
> with multiple lines

| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |`,
  },
  {
    name: "Documentation",
    content: `# API Documentation

## Overview
This API provides access to our services.

### Authentication
All requests require an API key:

\`\`\`bash
curl -H "Authorization: Bearer YOUR_API_KEY" \\
  https://api.example.com/endpoint
\`\`\`

### Endpoints

#### GET /users
Returns a list of users.

**Parameters:**
- \`limit\` (optional): Number of users to return
- \`offset\` (optional): Number of users to skip

**Response:**
\`\`\`json
{
  "users": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    }
  ]
}
\`\`\``,
  },
  {
    name: "README",
    content: `# Project Name

A brief description of what this project does.

## Installation

\`\`\`bash
npm install project-name
\`\`\`

## Usage

\`\`\`javascript
import { ProjectName } from 'project-name';

const instance = new ProjectName();
instance.doSomething();
\`\`\`

## Features

- ✅ Feature 1
- ✅ Feature 2
- ⏳ Feature 3 (coming soon)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.`,
  },
]

const markdownOptions = [
  {
    key: "includeCSS",
    label: "Include CSS Styling",
    type: "checkbox" as const,
    defaultValue: true,
  },
  {
    key: "enableCodeHighlight",
    label: "Enable Code Highlighting",
    type: "checkbox" as const,
    defaultValue: true,
  },
  {
    key: "enableTables",
    label: "Enable Tables",
    type: "checkbox" as const,
    defaultValue: true,
  },
  {
    key: "enableTaskLists",
    label: "Enable Task Lists",
    type: "checkbox" as const,
    defaultValue: true,
  },
]

function processMarkdown(input: string, options: any = {}) {
  try {
    if (!input.trim()) {
      return { output: "", error: "Input cannot be empty" }
    }

    let html = convertMarkdownToHTML(input, options)

    if (options.includeCSS) {
      html = addCSSStyles(html)
    }

    const stats = {
      "Input Lines": input.split('\n').length,
      "Output Size": `${html.length} chars`,
      "Headings": (input.match(/^#+\s/gm) || []).length,
      "Links": (input.match(/\[([^\]]+)\]\(([^)]+)\)/g) || []).length,
      "Code Blocks": (input.match(/```[\s\S]*?```/g) || []).length,
    }

    return { output: html, stats }
  } catch (error) {
    return {
      output: "",
      error: error instanceof Error ? error.message : "Markdown conversion failed",
    }
  }
}

function convertMarkdownToHTML(markdown: string, options: any): string {
  let html = markdown

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')

  // Bold and Italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')

  // Code blocks
  if (options.enableCodeHighlight) {
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre><code class="language-${lang || 'text'}">${escapeHtml(code.trim())}</code></pre>`
    })
  } else {
    html = html.replace(/```[\s\S]*?```/g, (match) => {
      const code = match.replace(/```\w*\n?/, '').replace(/```$/, '')
      return `<pre><code>${escapeHtml(code.trim())}</code></pre>`
    })
  }

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')

  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2" />')

  // Lists
  html = html.replace(/^\* (.+)$/gm, '<li>$1</li>')
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>')
  html = html.replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')

  // Wrap consecutive list items
  html = html.replace(/(<li>.*<\/li>)/gs, (match) => {
    if (match.includes('1.') || /^\d+\./.test(match)) {
      return `<ol>${match}</ol>`
    }
    return `<ul>${match}</ul>`
  })

  // Blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')

  // Tables
  if (options.enableTables) {
    html = convertTables(html)
  }

  // Task lists
  if (options.enableTaskLists) {
    html = html.replace(/- \[ \] (.+)$/gm, '<input type="checkbox" disabled> $1<br>')
    html = html.replace(/- \[x\] (.+)$/gm, '<input type="checkbox" checked disabled> $1<br>')
  }

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr>')

  // Paragraphs
  html = html.replace(/\n\n/g, '</p><p>')
  html = `<p>${html}</p>`

  // Clean up empty paragraphs
  html = html.replace(/<p><\/p>/g, '')
  html = html.replace(/<p>(<h[1-6]>)/g, '$1')
  html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1')
  html = html.replace(/<p>(<ul>|<ol>|<blockquote>|<pre>|<hr>)/g, '$1')
  html = html.replace(/(<\/ul>|<\/ol>|<\/blockquote>|<\/pre>|<hr>)<\/p>/g, '$1')

  return html
}

function convertTables(html: string): string {
  const tableRegex = /(\|.+\|\n)+/g
  
  return html.replace(tableRegex, (match) => {
    const lines = match.trim().split('\n')
    if (lines.length < 2) return match

    const headers = lines[0].split('|').map(cell => cell.trim()).filter(cell => cell)
    const separator = lines[1]
    const rows = lines.slice(2).map(line => 
      line.split('|').map(cell => cell.trim()).filter(cell => cell)
    )

    let table = '<table><thead><tr>'
    headers.forEach(header => {
      table += `<th>${header}</th>`
    })
    table += '</tr></thead><tbody>'

    rows.forEach(row => {
      table += '<tr>'
      row.forEach(cell => {
        table += `<td>${cell}</td>`
      })
      table += '</tr>'
    })

    table += '</tbody></table>'
    return table
  })
}

function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

function addCSSStyles(html: string): string {
  const css = `
<style>
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #333;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1, h2, h3, h4, h5, h6 {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
}

h1 { font-size: 2em; border-bottom: 1px solid #eee; padding-bottom: 10px; }
h2 { font-size: 1.5em; }
h3 { font-size: 1.25em; }

p { margin-bottom: 16px; }

code {
  background: #f6f8fa;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'SFMono-Regular', Consolas, monospace;
  font-size: 85%;
}

pre {
  background: #f6f8fa;
  padding: 16px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 16px 0;
}

pre code {
  background: none;
  padding: 0;
}

blockquote {
  border-left: 4px solid #dfe2e5;
  padding-left: 16px;
  margin: 16px 0;
  color: #6a737d;
}

table {
  border-collapse: collapse;
  width: 100%;
  margin: 16px 0;
}

th, td {
  border: 1px solid #dfe2e5;
  padding: 8px 12px;
  text-align: left;
}

th {
  background: #f6f8fa;
  font-weight: 600;
}

ul, ol {
  margin: 16px 0;
  padding-left: 32px;
}

li {
  margin: 4px 0;
}

a {
  color: #0366d6;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

hr {
  border: none;
  border-top: 1px solid #eee;
  margin: 24px 0;
}

img {
  max-width: 100%;
  height: auto;
}
</style>
`

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Converted Markdown</title>
  ${css}
</head>
<body>
  ${html}
</body>
</html>`
}

function validateMarkdown(input: string) {
  if (!input.trim()) {
    return { isValid: false, error: "Input cannot be empty" }
  }
  return { isValid: true }
}

export default function MarkdownToHTMLPage() {
  return (
    <TextToolLayout
      title="Markdown to HTML Converter"
      description="Convert Markdown text to HTML with syntax highlighting, tables, and CSS styling options."
      icon={FileText}
      placeholder="Enter your Markdown here..."
      outputPlaceholder="Converted HTML will appear here..."
      processFunction={processMarkdown}
      validateFunction={validateMarkdown}
      options={markdownOptions}
      examples={markdownExamples}
      fileExtensions={[".html", ".htm"]}
    />
  )
}