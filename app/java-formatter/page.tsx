"use client"

import { TextToolLayout } from "@/components/text-tool-layout"
import { FileCode } from "lucide-react"

const javaExamples = [
  {
    name: "Java Class",
    content: `package com.example.demo;import java.util.*;import java.time.LocalDateTime;import java.util.stream.Collectors;public class UserService{private final Map<Long,User>users=new HashMap<>();private final EmailService emailService;public UserService(EmailService emailService){this.emailService=emailService;}public User createUser(String name,String email)throws ValidationException{if(name==null||name.trim().isEmpty()){throw new ValidationException("Name cannot be empty");}if(email==null||!email.contains("@")){throw new ValidationException("Invalid email format");}User user=new User(generateId(),name.trim(),email.toLowerCase(),LocalDateTime.now());users.put(user.getId(),user);emailService.sendWelcomeEmail(user);return user;}public Optional<User>findUserById(Long id){return Optional.ofNullable(users.get(id));}public List<User>findUsersByName(String name){return users.values().stream().filter(user->user.getName().toLowerCase().contains(name.toLowerCase())).collect(Collectors.toList());}public List<User>getAllUsers(){return new ArrayList<>(users.values());}public boolean deleteUser(Long id){return users.remove(id)!=null;}private Long generateId(){return System.currentTimeMillis()+new Random().nextInt(1000);}}`,
  },
  {
    name: "Java Interface and Enum",
    content: `package com.example.demo;import java.util.List;import java.util.Optional;public interface Repository<T,ID>{T save(T entity);Optional<T>findById(ID id);List<T>findAll();void deleteById(ID id);boolean existsById(ID id);}public enum UserRole{ADMIN("Administrator",100),MODERATOR("Moderator",50),USER("Regular User",10),GUEST("Guest",1);private final String displayName;private final int priority;UserRole(String displayName,int priority){this.displayName=displayName;this.priority=priority;}public String getDisplayName(){return displayName;}public int getPriority(){return priority;}public boolean hasHigherPriorityThan(UserRole other){return this.priority>other.priority;}public static UserRole fromString(String role){for(UserRole userRole:values()){if(userRole.name().equalsIgnoreCase(role)){return userRole;}}throw new IllegalArgumentException("Unknown role: "+role);}}@Entity@Table(name="users")public class User{@Id@GeneratedValue(strategy=GenerationType.IDENTITY)private Long id;@Column(nullable=false)private String name;@Column(unique=true,nullable=false)private String email;@Enumerated(EnumType.STRING)private UserRole role=UserRole.USER;@CreationTimestamp private LocalDateTime createdAt;@UpdateTimestamp private LocalDateTime updatedAt;public User(){}public User(String name,String email){this.name=name;this.email=email;}public Long getId(){return id;}public void setId(Long id){this.id=id;}public String getName(){return name;}public void setName(String name){this.name=name;}public String getEmail(){return email;}public void setEmail(String email){this.email=email;}public UserRole getRole(){return role;}public void setRole(UserRole role){this.role=role;}}`,
  },
]

const javaOptions = [
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
      { value: 4, label: "4 Spaces (Java Standard)" },
      { value: "tab", label: "Tabs" },
    ],
  },
  {
    key: "braceStyle",
    label: "Brace Style",
    type: "select" as const,
    defaultValue: "same-line",
    selectOptions: [
      { value: "same-line", label: "Same Line" },
      { value: "new-line", label: "New Line" },
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

function processJava(input: string, options: any = {}) {
  try {
    let output = input

    // Remove comments if requested
    if (options.removeComments) {
      output = output.replace(/\/\/.*$/gm, "")
      output = output.replace(/\/\*[\s\S]*?\*\//g, "")
    }

    // Sort and group imports
    if (options.sortImports || options.groupImports) {
      output = formatJavaImports(output, options)
    }

    if (options.format === "minify") {
      output = output
        .replace(/\s+/g, " ")
        .replace(/;\s*}/g, "}")
        .replace(/\s*{\s*/g, "{")
        .trim()
    } else {
      // Beautify Java
      const indentStr = options.indent === "tab" ? "\t" : " ".repeat(options.indent || 4)
      output = beautifyJava(output, indentStr, options)
    }

    const stats = {
      "Original Size": `${input.length} chars`,
      "Formatted Size": `${output.length} chars`,
      "Classes": `${(input.match(/class\s+\w+/g) || []).length}`,
      "Interfaces": `${(input.match(/interface\s+\w+/g) || []).length}`,
      "Methods": `${(input.match(/public|private|protected\s+[\w<>\[\]]+\s+\w+\s*\(/g) || []).length}`,
      "Annotations": `${(input.match(/@\w+/g) || []).length}`,
    }

    return { output, stats }
  } catch (error) {
    return {
      output: "",
      error: "Java formatting failed",
    }
  }
}

function formatJavaImports(code: string, options: any): string {
  const lines = code.split('\n')
  const imports: string[] = []
  const javaImports: string[] = []
  const javaxImports: string[] = []
  const thirdPartyImports: string[] = []
  const otherLines: string[] = []
  
  lines.forEach(line => {
    const trimmed = line.trim()
    
    if (trimmed.startsWith('import ')) {
      const importPath = trimmed.replace('import ', '').replace(';', '')
      
      if (importPath.startsWith('java.')) {
        javaImports.push(trimmed)
      } else if (importPath.startsWith('javax.')) {
        javaxImports.push(trimmed)
      } else {
        thirdPartyImports.push(trimmed)
      }
    } else {
      otherLines.push(line)
    }
  })
  
  if (options.sortImports) {
    javaImports.sort()
    javaxImports.sort()
    thirdPartyImports.sort()
  }
  
  let result = ""
  
  // Add package declaration first
  const packageLine = otherLines.find(line => line.trim().startsWith('package '))
  if (packageLine) {
    result += packageLine + '\n\n'
    otherLines.splice(otherLines.indexOf(packageLine), 1)
  }
  
  // Add imports with grouping
  if (options.groupImports) {
    if (javaImports.length > 0) {
      result += javaImports.join('\n') + '\n\n'
    }
    if (javaxImports.length > 0) {
      result += javaxImports.join('\n') + '\n\n'
    }
    if (thirdPartyImports.length > 0) {
      result += thirdPartyImports.join('\n') + '\n\n'
    }
  } else {
    const allImports = javaImports.concat(javaxImports, thirdPartyImports)
    if (allImports.length > 0) {
      result += allImports.join('\n') + '\n\n'
    }
  }
  
  // Add remaining code
  result += otherLines.join('\n')
  
  return result
}

function beautifyJava(code: string, indent: string, options: any): string {
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
    
    // Handle brace style
    if (options.braceStyle === "new-line" && trimmed.endsWith('{')) {
      const lineWithoutBrace = trimmed.substring(0, trimmed.length - 1).trim()
      result.push(indent.repeat(level) + lineWithoutBrace)
      result.push(indent.repeat(level) + '{')
      level++
    } else {
      result.push(indent.repeat(level) + trimmed)
      
      // Increase indent for opening braces
      if (trimmed.endsWith('{')) {
        level++
      }
    }
  })
  
  return result.join('\n')
}

function validateJava(input: string) {
  if (!input.trim()) {
    return { isValid: false, error: "Input cannot be empty" }
  }
  
  // Basic Java validation
  const openBraces = (input.match(/{/g) || []).length
  const closeBraces = (input.match(/}/g) || []).length
  const openParens = (input.match(/\(/g) || []).length
  const closeParens = (input.match(/\)/g) || []).length
  
  if (openBraces !== closeBraces) {
    return { isValid: false, error: "Mismatched braces in Java code" }
  }
  
  if (openParens !== closeParens) {
    return { isValid: false, error: "Mismatched parentheses in Java code" }
  }
  
  return { isValid: true }
}

export default function JavaFormatterPage() {
  return (
    <TextToolLayout
      title="Java Formatter"
      description="Format and beautify Java code with import organization and standard Java conventions."
      icon={FileCode}
      placeholder="Paste your Java code here..."
      outputPlaceholder="Formatted Java will appear here..."
      processFunction={processJava}
      validateFunction={validateJava}
      options={javaOptions}
      examples={javaExamples}
      fileExtensions={[".java"]}
      supportFileUpload={true}
      supportUrlInput={true}
    />
  )
}