"use client"

import { TextToolLayout } from "@/components/text-tool-layout"
import { Code } from "lucide-react"

const phpExamples = [
  {
    name: "Basic PHP",
    content: `<?php
class User {
private $name;
private $email;
public function __construct($name, $email) {
$this->name = $name;
$this->email = $email;
}
public function getName() {
return $this->name;
}
public function getEmail() {
return $this->email;
}
}
$user = new User("John Doe", "john@example.com");
echo "Name: " . $user->getName();
?>`,
  },
  {
    name: "Database Connection",
    content: `<?php
$host = 'localhost';
$dbname = 'mydb';
$username = 'user';
$password = 'pass';
try {
$pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$stmt = $pdo->prepare("SELECT * FROM users WHERE active = ?");
$stmt->execute([1]);
$users = $stmt->fetchAll(PDO::FETCH_ASSOC);
foreach ($users as $user) {
echo $user['name'] . "\n";
}
} catch (PDOException $e) {
echo "Error: " . $e->getMessage();
}
?>`,
  },
]

const phpOptions = [
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
    defaultValue: 4,
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

function processPHP(input: string, options: any = {}) {
  try {
    let output = input

    // Remove comments
    if (options.removeComments) {
      output = output.replace(/\/\/.*$/gm, "")
      output = output.replace(/\/\*[\s\S]*?\*\//g, "")
      output = output.replace(/#.*$/gm, "")
    }

    if (options.format === "minify") {
      output = output
        .replace(/\s+/g, " ")
        .replace(/;\s*}/g, ";}")
        .replace(/\s*{\s*/g, "{")
        .replace(/;\s*/g, ";")
        .trim()
    } else {
      // Beautify PHP
      const indentStr = typeof options.indent === "number" ? " ".repeat(options.indent) : "\t"
      output = beautifyPHP(output, indentStr)
    }

    const stats = {
      "Original Size": `${input.length} chars`,
      "Formatted Size": `${output.length} chars`,
      "Classes": `${(input.match(/class\s+\w+/gi) || []).length}`,
      "Functions": `${(input.match(/function\s+\w+/gi) || []).length}`,
      "Variables": `${(input.match(/\$\w+/g) || []).length}`,
    }

    return { output, stats }
  } catch (error) {
    return {
      output: "",
      error: "PHP formatting failed",
    }
  }
}

function beautifyPHP(code: string, indent: string): string {
  const lines = code.split('\n')
  const result: string[] = []
  let level = 0
  
  lines.forEach(line => {
    const trimmed = line.trim()
    
    if (trimmed === '') {
      result.push('')
      return
    }
    
    // Decrease indent for closing braces
    if (trimmed.startsWith('}')) {
      level = Math.max(0, level - 1)
    }
    
    result.push(indent.repeat(level) + trimmed)
    
    // Increase indent for opening braces
    if (trimmed.endsWith('{')) {
      level++
    }
  })
  
  return result.join('\n')
}

function validatePHP(input: string) {
  if (!input.trim()) {
    return { isValid: false, error: "Input cannot be empty" }
  }
  
  // Basic PHP validation
  const openBraces = (input.match(/{/g) || []).length
  const closeBraces = (input.match(/}/g) || []).length
  
  if (openBraces !== closeBraces) {
    return { isValid: false, error: "Mismatched braces in PHP" }
  }
  
  return { isValid: true }
}

export default function PHPFormatterPage() {
  return (
    <TextToolLayout
      title="PHP Formatter"
      description="Beautify and format PHP code with proper indentation and syntax highlighting."
      icon={Code}
      placeholder="Paste your PHP code here..."
      outputPlaceholder="Formatted PHP will appear here..."
      processFunction={processPHP}
      validateFunction={validatePHP}
      options={phpOptions}
      examples={phpExamples}
      fileExtensions={[".php"]}
    />
  )
}