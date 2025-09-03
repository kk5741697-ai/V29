"use client"

import { TextToolLayout } from "@/components/text-tool-layout"
import { FileCode } from "lucide-react"

const swiftExamples = [
  {
    name: "Swift Class and Protocol",
    content: `import Foundation;import UIKit;protocol UserRepositoryProtocol{func save(user:User)throws->User;func findById(id:UUID)->User?;func findAll()->[User];func delete(id:UUID)throws->Bool}struct User:Codable{let id:UUID;var name:String;var email:String;let createdAt:Date;var roles:[String];init(name:String,email:String){self.id=UUID();self.name=name;self.email=email;self.createdAt=Date();self.roles=["user"]}func isValid()->Bool{return!name.trimmingCharacters(in:.whitespaces).isEmpty&&email.contains("@")}mutating func addRole(_ role:String){if!role.isEmpty&&!roles.contains(role){roles.append(role)}}func hasRole(_ role:String)->Bool{return roles.contains{$0.caseInsensitiveCompare(role)==.orderedSame}}}class UserRepository:UserRepositoryProtocol{private var users:[UUID:User]=[:]
func save(user:User)throws->User{users[user.id]=user;return user}
func findById(id:UUID)->User?{return users[id]}
func findAll()->[User]{return Array(users.values)}
func delete(id:UUID)throws->Bool{return users.removeValue(forKey:id)!=nil}}class UserService{private let repository:UserRepositoryProtocol;private let emailService:EmailService
init(repository:UserRepositoryProtocol,emailService:EmailService){self.repository=repository;self.emailService=emailService}
func createUser(name:String,email:String)async throws->User{guard!name.trimmingCharacters(in:.whitespaces).isEmpty else{throw ValidationError.emptyName}
guard email.contains("@")else{throw ValidationError.invalidEmail}
let user=User(name:name.trimmingCharacters(in:.whitespaces),email:email.lowercased())
let savedUser=try repository.save(user:user)
try await emailService.sendWelcomeEmail(to:savedUser)
return savedUser}
func getUserById(_ id:UUID)->User?{return repository.findById(id:id)}
func getAllUsers()->[User]{return repository.findAll()}}enum ValidationError:Error{case emptyName;case invalidEmail;case userNotFound}`,
  },
  {
    name: "Swift SwiftUI View",
    content: `import SwiftUI;import Combine;struct ContentView:View{@StateObject private var viewModel=UserViewModel();@State private var showingAddUser=false;@State private var searchText=""
var filteredUsers:[User]{if searchText.isEmpty{return viewModel.users}else{return viewModel.users.filter{$0.name.localizedCaseInsensitiveContains(searchText)||$0.email.localizedCaseInsensitiveContains(searchText)}}}
var body:some View{NavigationView{VStack{SearchBar(text:$searchText).padding(.horizontal)
List(filteredUsers,id:\.id){user in UserRowView(user:user).onTapGesture{viewModel.selectUser(user)}.swipeActions(edge:.trailing){Button("Delete",role:.destructive){viewModel.deleteUser(user)}}}
.refreshable{await viewModel.refreshUsers()}
Spacer()}
.navigationTitle("Users")
.navigationBarTitleDisplayMode(.large)
.toolbar{ToolbarItem(placement:.navigationBarTrailing){Button("Add User"){showingAddUser=true}.foregroundColor(.blue)}}
.sheet(isPresented:$showingAddUser){AddUserView(viewModel:viewModel)}
.alert("Error",isPresented:.constant(viewModel.errorMessage!=nil)){Button("OK"){viewModel.clearError()}}message:{if let error=viewModel.errorMessage{Text(error)}}}}
struct UserRowView:View{let user:User
var body:some View{HStack{VStack(alignment:.leading,spacing:4){Text(user.name).font(.headline).foregroundColor(.primary)
Text(user.email).font(.subheadline).foregroundColor(.secondary)
Text("Created: \(user.createdAt,style:.date)").font(.caption).foregroundColor(.gray)}
Spacer()
VStack(alignment:.trailing){ForEach(user.roles,id:\.self){role in Text(role).font(.caption).padding(.horizontal,8).padding(.vertical,2).background(Color.blue.opacity(0.1)).foregroundColor(.blue).cornerRadius(4)}}}.padding(.vertical,4)}}`,
  },
]

const swiftOptions = [
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
      { value: 4, label: "4 Spaces (Swift Standard)" },
      { value: "tab", label: "Tabs" },
    ],
  },
  {
    key: "sortImports",
    label: "Sort Imports",
    type: "checkbox" as const,
    defaultValue: true,
  },
  {
    key: "groupImports",
    label: "Group Imports",
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

function processSwift(input: string, options: any = {}) {
  try {
    let output = input

    // Remove comments if requested
    if (options.removeComments) {
      output = output.replace(/\/\/.*$/gm, "")
      output = output.replace(/\/\*[\s\S]*?\*\//g, "")
    }

    // Sort and group imports
    if (options.sortImports || options.groupImports) {
      output = formatSwiftImports(output, options)
    }

    if (options.format === "minify") {
      output = output
        .replace(/\s+/g, " ")
        .replace(/;\s*}/g, "}")
        .replace(/\s*{\s*/g, "{")
        .trim()
    } else {
      // Beautify Swift
      const indentStr = options.indent === "tab" ? "\t" : " ".repeat(options.indent || 4)
      output = beautifySwift(output, indentStr)
    }

    const stats = {
      "Original Size": `${input.length} chars`,
      "Formatted Size": `${output.length} chars`,
      "Classes": `${(input.match(/class\s+\w+/g) || []).length}`,
      "Structs": `${(input.match(/struct\s+\w+/g) || []).length}`,
      "Protocols": `${(input.match(/protocol\s+\w+/g) || []).length}`,
      "Functions": `${(input.match(/func\s+\w+/g) || []).length}`,
      "Extensions": `${(input.match(/extension\s+\w+/g) || []).length}`,
    }

    return { output, stats }
  } catch (error) {
    return {
      output: "",
      error: "Swift formatting failed",
    }
  }
}

function formatSwiftImports(code: string, options: any): string {
  const lines = code.split('\n')
  const foundationImports: string[] = []
  const uiImports: string[] = []
  const thirdPartyImports: string[] = []
  const otherLines: string[] = []
  
  lines.forEach(line => {
    const trimmed = line.trim()
    
    if (trimmed.startsWith('import ')) {
      const importPath = trimmed.replace('import ', '')
      
      if (importPath.startsWith('Foundation') || importPath.startsWith('CoreFoundation')) {
        foundationImports.push(trimmed)
      } else if (importPath.startsWith('UI') || importPath.startsWith('SwiftUI') || importPath.startsWith('AppKit')) {
        uiImports.push(trimmed)
      } else {
        thirdPartyImports.push(trimmed)
      }
    } else {
      otherLines.push(line)
    }
  })
  
  if (options.sortImports) {
    foundationImports.sort()
    uiImports.sort()
    thirdPartyImports.sort()
  }
  
  let result = ""
  
  // Add imports with grouping
  if (options.groupImports) {
    if (foundationImports.length > 0) {
      result += foundationImports.join('\n') + '\n\n'
    }
    if (uiImports.length > 0) {
      result += uiImports.join('\n') + '\n\n'
    }
    if (thirdPartyImports.length > 0) {
      result += thirdPartyImports.join('\n') + '\n\n'
    }
  } else {
    const allImports = foundationImports.concat(uiImports, thirdPartyImports)
    if (allImports.length > 0) {
      result += allImports.join('\n') + '\n\n'
    }
  }
  
  // Add remaining code
  result += otherLines.join('\n')
  
  return result
}

function beautifySwift(code: string, indent: string): string {
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

function validateSwift(input: string) {
  if (!input.trim()) {
    return { isValid: false, error: "Input cannot be empty" }
  }
  
  // Basic Swift validation
  const openBraces = (input.match(/{/g) || []).length
  const closeBraces = (input.match(/}/g) || []).length
  
  if (openBraces !== closeBraces) {
    return { isValid: false, error: "Mismatched braces in Swift code" }
  }
  
  return { isValid: true }
}

export default function SwiftFormatterPage() {
  return (
    <TextToolLayout
      title="Swift Formatter"
      description="Format and beautify Swift code following Swift conventions with import organization."
      icon={FileCode}
      placeholder="Paste your Swift code here..."
      outputPlaceholder="Formatted Swift will appear here..."
      processFunction={processSwift}
      validateFunction={validateSwift}
      options={swiftOptions}
      examples={swiftExamples}
      fileExtensions={[".swift"]}
      supportFileUpload={true}
      supportUrlInput={true}
    />
  )
}