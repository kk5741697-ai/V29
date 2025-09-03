"use client"

import { TextToolLayout } from "@/components/text-tool-layout"
import { RefreshCw } from "lucide-react"

const htmlToPhpExamples = [
  {
    name: "Simple HTML",
    content: `<div class="container">
  <h1>Welcome to My Site</h1>
  <p>This is a paragraph with some content.</p>
  <a href="/contact">Contact Us</a>
</div>`,
  },
  {
    name: "Form HTML",
    content: `<form action="/submit" method="post">
  <div class="form-group">
    <label for="name">Name:</label>
    <input type="text" id="name" name="name" required>
  </div>
  <div class="form-group">
    <label for="email">Email:</label>
    <input type="email" id="email" name="email" required>
  </div>
  <button type="submit">Submit</button>
</form>`,
  },
]

const htmlToPhpOptions = [
  {
    key: "outputStyle",
    label: "Output Style",
    type: "select" as const,
    defaultValue: "echo",
    selectOptions: [
      { value: "echo", label: "Echo Statements" },
      { value: "heredoc", label: "Heredoc Syntax" },
      { value: "variable", label: "Variable Assignment" },
    ],
  },
  {
    key: "escapeQuotes",
    label: "Escape Quotes",
    type: "checkbox" as const,
    defaultValue: true,
  },
  {
    key: "addPhpTags",
    label: "Add PHP Tags",
    type: "checkbox" as const,
    defaultValue: true,
  },
]

function processHtmlToPhp(input: string, options: any = {}) {
  try {
    if (!input.trim()) {
      return { output: "", error: "Input cannot be empty" }
    }

    let html = input.trim()
    let output = ""

    // Escape quotes if needed
    if (options.escapeQuotes) {
      html = html.replace(/"/g, '\\"').replace(/'/g, "\\'")
    }

    switch (options.outputStyle) {
      case "heredoc":
        output = `$html = <<<HTML
${html}
HTML;`
        break
      
      case "variable":
        const lines = html.split('\n')
        output = lines.map((line, index) => {
          const varName = index === 0 ? '$html' : '$html .='
          return `${varName} "${line.trim()}";`
        }).join('\n')
        break
      
      default: // echo
        const htmlLines = html.split('\n')
        output = htmlLines.map(line => `echo "${line.trim()}";`).join('\n')
    }

    // Add PHP tags
    if (options.addPhpTags) {
      output = `<?php\n${output}\n?>`
    }

    const stats = {
      "Input Lines": input.split('\n').length,
      "Output Lines": output.split('\n').length,
      "HTML Tags": (input.match(/<[^>]+>/g) || []).length,
      "Output Style": options.outputStyle || "echo",
    }

    return { output, stats }
  } catch (error) {
    return {
      output: "",
      error: "HTML to PHP conversion failed",
    }
  }
}

export default function HtmlToPhpPage() {
  return (
    <TextToolLayout
      title="HTML to PHP Converter"
      description="Convert HTML markup to PHP echo statements, heredoc syntax, or variable assignments."
      icon={RefreshCw}
      placeholder="Paste your HTML here..."
      outputPlaceholder="PHP code will appear here..."
      processFunction={processHtmlToPhp}
      options={htmlToPhpOptions}
      examples={htmlToPhpExamples}
      fileExtensions={[".php"]}
    />
  )
}