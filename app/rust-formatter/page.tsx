"use client"

import { TextToolLayout } from "@/components/text-tool-layout"
import { FileCode } from "lucide-react"

const rustExamples = [
  {
    name: "Rust Structs and Impl",
    content: `use std::collections::HashMap;use serde::{Deserialize,Serialize};#[derive(Debug,Clone,Serialize,Deserialize)]pub struct User{pub id:u32,pub name:String,pub email:String,pub created_at:chrono::DateTime<chrono::Utc>,}impl User{pub fn new(name:String,email:String)->Self{Self{id:rand::random(),name,email,created_at:chrono::Utc::now(),}}pub fn is_valid(&self)->bool{!self.name.is_empty()&&self.email.contains('@')}pub fn update_email(&mut self,new_email:String)->Result<(),String>{if new_email.contains('@'){self.email=new_email;Ok(())}else{Err("Invalid email format".to_string())}}}#[derive(Debug)]pub struct UserRepository{users:HashMap<u32,User>,}impl UserRepository{pub fn new()->Self{Self{users:HashMap::new(),}}pub fn add_user(&mut self,user:User)->u32{let id=user.id;self.users.insert(id,user);id}pub fn get_user(&self,id:u32)->Option<&User>{self.users.get(&id)}pub fn get_all_users(&self)->Vec<&User>{self.users.values().collect()}pub fn update_user(&mut self,id:u32,user:User)->Result<(),String>{if self.users.contains_key(&id){self.users.insert(id,user);Ok(())}else{Err("User not found".to_string())}}}`,
  },
  {
    name: "Rust Error Handling",
    content: `use std::fs::File;use std::io::{self,Read,Write};use std::path::Path;#[derive(Debug)]enum FileError{IoError(io::Error),InvalidFormat,EmptyFile,}impl From<io::Error>for FileError{fn from(error:io::Error)->Self{FileError::IoError(error)}}type Result<T>=std::result::Result<T,FileError>;fn read_config_file<P:AsRef<Path>>(path:P)->Result<String>{let mut file=File::open(path)?;let mut contents=String::new();file.read_to_string(&mut contents)?;if contents.trim().is_empty(){return Err(FileError::EmptyFile);}if !contents.starts_with('{'){return Err(FileError::InvalidFormat);}Ok(contents)}fn write_config_file<P:AsRef<Path>>(path:P,data:&str)->Result<()>{let mut file=File::create(path)?;file.write_all(data.as_bytes())?;file.sync_all()?;Ok(())}fn process_config()->Result<()>{match read_config_file("config.json"){Ok(contents)=>{println!("Config loaded: {}",contents);write_config_file("backup.json",&contents)?;println!("Backup created successfully");}Err(FileError::IoError(e))=>eprintln!("IO Error: {}",e),Err(FileError::InvalidFormat)=>eprintln!("Invalid config format"),Err(FileError::EmptyFile)=>eprintln!("Config file is empty"),}Ok(())}fn main(){if let Err(e)=process_config(){eprintln!("Failed to process config: {:?}",e);std::process::exit(1);}}`,
  },
]

const rustOptions = [
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
      { value: 4, label: "4 Spaces (Rust Standard)" },
      { value: "tab", label: "Tabs" },
    ],
  },
  {
    key: "sortImports",
    label: "Sort Use Statements",
    type: "checkbox" as const,
    defaultValue: true,
  },
  {
    key: "groupImports",
    label: "Group Use Statements",
    type: "checkbox" as const,
    defaultValue: true,
  },
  {
    key: "removeComments",
    label: "Remove Comments",
    type: "checkbox" as const,
    defaultValue: false,
  },
]

function processRust(input: string, options: any = {}) {
  try {
    let output = input

    // Remove comments if requested
    if (options.removeComments) {
      output = output.replace(/\/\/.*$/gm, "")
      output = output.replace(/\/\*[\s\S]*?\*\//g, "")
    }

    // Sort and group use statements
    if (options.sortImports || options.groupImports) {
      output = formatRustUseStatements(output, options)
    }

    if (options.format === "minify") {
      output = output
        .replace(/\s+/g, " ")
        .replace(/;\s*}/g, "}")
        .replace(/\s*{\s*/g, "{")
        .trim()
    } else {
      // Beautify Rust
      const indentStr = options.indent === "tab" ? "\t" : " ".repeat(options.indent || 4)
      output = beautifyRust(output, indentStr)
    }

    const stats = {
      "Original Size": `${input.length} chars`,
      "Formatted Size": `${output.length} chars`,
      "Functions": `${(input.match(/fn\s+\w+/g) || []).length}`,
      "Structs": `${(input.match(/struct\s+\w+/g) || []).length}`,
      "Enums": `${(input.match(/enum\s+\w+/g) || []).length}`,
      "Traits": `${(input.match(/trait\s+\w+/g) || []).length}`,
      "Impl Blocks": `${(input.match(/impl\s+/g) || []).length}`,
    }

    return { output, stats }
  } catch (error) {
    return {
      output: "",
      error: "Rust formatting failed",
    }
  }
}

function formatRustUseStatements(code: string, options: any): string {
  const lines = code.split('\n')
  const useStatements: string[] = []
  const stdUses: string[] = []
  const crateUses: string[] = []
  const localUses: string[] = []
  const otherLines: string[] = []
  
  lines.forEach(line => {
    const trimmed = line.trim()
    
    if (trimmed.startsWith('use ')) {
      const usePath = trimmed.replace('use ', '').replace(';', '')
      
      if (usePath.startsWith('std::')) {
        stdUses.push(trimmed)
      } else if (usePath.includes('::') && !usePath.startsWith('crate::') && !usePath.startsWith('super::') && !usePath.startsWith('self::')) {
        crateUses.push(trimmed)
      } else {
        localUses.push(trimmed)
      }
    } else {
      otherLines.push(line)
    }
  })
  
  if (options.sortImports) {
    stdUses.sort()
    crateUses.sort()
    localUses.sort()
  }
  
  let result = ""
  
  // Add use statements with grouping
  if (options.groupImports) {
    if (stdUses.length > 0) {
      result += stdUses.join('\n') + '\n\n'
    }
    if (crateUses.length > 0) {
      result += crateUses.join('\n') + '\n\n'
    }
    if (localUses.length > 0) {
      result += localUses.join('\n') + '\n\n'
    }
  } else {
    const allUses = stdUses.concat(crateUses, localUses)
    if (allUses.length > 0) {
      result += allUses.join('\n') + '\n\n'
    }
  }
  
  // Add remaining code
  result += otherLines.join('\n')
  
  return result
}

function beautifyRust(code: string, indent: string): string {
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
    if (trimmed === '}' || trimmed.startsWith('} ')) {
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

function validateRust(input: string) {
  if (!input.trim()) {
    return { isValid: false, error: "Input cannot be empty" }
  }
  
  // Basic Rust validation
  const openBraces = (input.match(/{/g) || []).length
  const closeBraces = (input.match(/}/g) || []).length
  
  if (openBraces !== closeBraces) {
    return { isValid: false, error: "Mismatched braces in Rust code" }
  }
  
  return { isValid: true }
}

export default function RustFormatterPage() {
  return (
    <TextToolLayout
      title="Rust Formatter"
      description="Format and beautify Rust code following rustfmt standards with use statement grouping."
      icon={FileCode}
      placeholder="Paste your Rust code here..."
      outputPlaceholder="Formatted Rust will appear here..."
      processFunction={processRust}
      validateFunction={validateRust}
      options={rustOptions}
      examples={rustExamples}
      fileExtensions={[".rs"]}
      supportFileUpload={true}
      supportUrlInput={true}
    />
  )
}