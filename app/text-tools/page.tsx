import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ToolCard } from "@/components/tool-card"
import { FileText, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function generateViewport() {
  return {
    width: 'device-width',
    initialScale: 1,
    themeColor: '#3b82f6',
  }
}

const textTools = [
  {
    title: "JSON Formatter",
    description: "Beautify, validate, and minify JSON data with syntax highlighting and error detection.",
    href: "/json-formatter",
    icon: FileText,
    category: "Text Tools",
  },
  {
    title: "JavaScript Formatter",
    description: "Beautify, minify, and format JavaScript code with syntax validation and optimization options.",
    href: "/javascript-formatter",
    icon: FileText,
    category: "Text Tools",
  },
  {
    title: "JavaScript Obfuscator",
    description: "Obfuscate JavaScript code to protect intellectual property and make reverse engineering difficult.",
    href: "/javascript-obfuscator",
    icon: FileText,
    category: "Text Tools",
  },
  {
    title: "JavaScript Tester",
    description: "Test and execute JavaScript code in a safe environment with console output capture.",
    href: "/javascript-tester",
    icon: FileText,
    category: "Text Tools",
  },
  {
    title: "JavaScript Escape/Unescape",
    description: "Escape or unescape JavaScript strings, regular expressions, and Unicode characters.",
    href: "/javascript-escape",
    icon: FileText,
    category: "Text Tools",
  },
  {
    title: "SQL Formatter",
    description: "Format, beautify, and minify SQL queries with proper indentation and keyword formatting.",
    href: "/sql-formatter",
    icon: FileText,
    category: "Text Tools",
  },
  {
    title: "PHP Formatter",
    description: "Beautify and format PHP code with proper indentation and syntax highlighting.",
    href: "/php-formatter",
    icon: FileText,
    category: "Text Tools",
  },
  {
    title: "Python Formatter",
    description: "Format and beautify Python code following PEP 8 standards with proper indentation.",
    href: "/python-formatter",
    icon: FileText,
    category: "Text Tools",
  },
  {
    title: "YAML Formatter",
    description: "Format, validate, and beautify YAML configuration files with proper indentation.",
    href: "/yaml-formatter",
    icon: FileText,
    category: "Text Tools",
  },
  {
    title: "HTML to Markdown",
    description: "Convert HTML markup to clean Markdown format with support for tables and formatting.",
    href: "/html-to-markdown",
    icon: FileText,
    category: "Text Tools",
  },
  {
    title: "HTML to PHP",
    description: "Convert HTML markup to PHP echo statements, heredoc syntax, or variable assignments.",
    href: "/html-to-php",
    icon: FileText,
    category: "Text Tools",
  },
  {
    title: "JSON to CSV",
    description: "Convert JSON arrays to CSV format with customizable delimiters and formatting options.",
    href: "/json-to-csv",
    icon: FileText,
    category: "Text Tools",
  },
  {
    title: "XML to JSON",
    description: "Convert XML documents to JSON format with attribute preservation and array handling.",
    href: "/xml-to-json",
    icon: FileText,
    category: "Text Tools",
  },
  {
    title: "Base64 to Text",
    description: "Decode Base64 strings to text or encode text to Base64 with URL-safe options.",
    href: "/base64-to-text",
    icon: FileText,
    category: "Text Tools",
  },
  {
    title: "Base64 Encoder/Decoder",
    description: "Encode text to Base64 or decode Base64 strings back to text with URL-safe options.",
    href: "/base64-encoder",
    icon: FileText,
    category: "Text Tools",
  },
  {
    title: "URL Encoder/Decoder",
    description: "Encode URLs and query parameters or decode URL-encoded strings for web development.",
    href: "/url-encoder",
    icon: FileText,
    category: "Text Tools",
  },
  {
    title: "Text Case Converter",
    description: "Convert text between different cases: lowercase, UPPERCASE, Title Case, camelCase, and more.",
    href: "/text-case-converter",
    icon: FileText,
    category: "Text Tools",
  },
  {
    title: "Hash Generator",
    description: "Generate MD5, SHA-1, SHA-256, and SHA-512 hashes for data integrity and security.",
    href: "/hash-generator",
    icon: FileText,
    category: "Text Tools",
  },
  {
    title: "XML Formatter",
    description: "Format, validate, and beautify XML documents with syntax highlighting and error detection.",
    href: "/xml-formatter",
    icon: FileText,
    category: "Text Tools",
  },
  {
    title: "HTML Formatter",
    description: "Clean up and format HTML code with proper indentation and syntax highlighting.",
    href: "/html-formatter",
    icon: FileText,
    category: "Text Tools",
  },
  {
    title: "CSS Minifier",
    description: "Minify CSS code to reduce file size and improve website loading performance.",
    href: "/css-minifier",
    icon: FileText,
    category: "Text Tools",
  },
  {
    title: "JavaScript Minifier",
    description: "Compress JavaScript code while preserving functionality to optimize web performance.",
    href: "/js-minifier",
    icon: FileText,
    category: "Text Tools",
  },
  {
    title: "JSON to TOML Converter",
    description: "Convert JSON data to TOML format with proper formatting and validation.",
    href: "/json-to-toml",
    icon: FileText,
    category: "Text Tools",
  },
  {
    title: "SCSS to SASS Converter",
    description: "Convert SCSS (Sassy CSS) to SASS indented syntax format.",
    href: "/scss-to-sass",
    icon: FileText,
    category: "Text Tools",
  },
]

export default function TextToolsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>

          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 rounded-lg bg-green-500/10">
              <FileText className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-heading font-bold text-foreground">Text & Code Tools</h1>
              <p className="text-muted-foreground">
                65+ professional tools for formatting, validating, and converting text and code
              </p>
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {textTools.map((tool) => (
            <ToolCard key={tool.title} {...tool} />
          ))}
        </div>

        {/* Coming Soon */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">More text and code tools coming soon!</p>
          <p className="text-sm text-muted-foreground">
            Have a suggestion?{" "}
            <Link href="/contact" className="text-accent hover:underline">
              Let us know
            </Link>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  )
}
