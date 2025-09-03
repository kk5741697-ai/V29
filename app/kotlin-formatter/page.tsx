"use client"

import { TextToolLayout } from "@/components/text-tool-layout"
import { FileCode } from "lucide-react"

const kotlinExamples = [
  {
    name: "Kotlin Data Classes",
    content: `package com.example.demo
import kotlinx.serialization.Serializable
import java.time.LocalDateTime
@Serializable data class User(val id:Long,val name:String,val email:String,val createdAt:LocalDateTime=LocalDateTime.now(),val roles:MutableList<String>=mutableListOf("user")){fun isValid():Boolean=name.isNotBlank()&&email.contains("@")
fun addRole(role:String){if(role.isNotBlank()&&!roles.contains(role)){roles.add(role)}}
fun hasRole(role:String):Boolean=roles.contains(role,ignoreCase=true)}
class UserRepository{private val users=mutableMapOf<Long,User>()
fun save(user:User):User{users[user.id]=user;return user}
fun findById(id:Long):User?=users[id]
fun findAll():List<User>=users.values.toList()
fun findByEmail(email:String):User?=users.values.find{it.email.equals(email,ignoreCase=true)}
fun deleteById(id:Long):Boolean=users.remove(id)!=null
fun findByRole(role:String):List<User>=users.values.filter{it.hasRole(role)}}
class UserService(private val repository:UserRepository){suspend fun createUser(name:String,email:String):Result<User>{return try{if(name.isBlank())return Result.failure(IllegalArgumentException("Name cannot be blank"))
if(!email.contains("@"))return Result.failure(IllegalArgumentException("Invalid email format"))
val user=User(id=System.currentTimeMillis(),name=name.trim(),email=email.lowercase())
val savedUser=repository.save(user)
Result.success(savedUser)}catch(e:Exception){Result.failure(e)}}
suspend fun getUserById(id:Long):User?=repository.findById(id)
suspend fun getAllUsers():List<User>=repository.findAll()
suspend fun updateUserRoles(id:Long,roles:List<String>):Result<User>{val user=repository.findById(id)?:return Result.failure(NoSuchElementException("User not found"))
user.roles.clear()
roles.forEach{user.addRole(it)}
return Result.success(repository.save(user))}}`,
  },
  {
    name: "Kotlin Extensions and DSL",
    content: `package com.example.extensions
import kotlinx.coroutines.*
import kotlin.time.Duration
import kotlin.time.Duration.Companion.seconds
fun<T>List<T>.second():T?=if(size>=2)this[1]else null
fun<T>List<T>.secondOrNull():T?=getOrNull(1)
fun String.isValidEmail():Boolean=this.contains("@")&&this.contains(".")
fun<T>T.applyIf(condition:Boolean,block:T.()->T):T=if(condition)this.block()else this
inline fun<T>Iterable<T>.sumByLong(selector:(T)->Long):Long{var sum=0L;for(element in this){sum+=selector(element)};return sum}
class HttpClientBuilder{private var timeout:Duration=30.seconds;private var retries:Int=3;private val headers=mutableMapOf<String,String>()
fun timeout(duration:Duration)=apply{this.timeout=duration}
fun retries(count:Int)=apply{this.retries=count}
fun header(name:String,value:String)=apply{headers[name]=value}
fun build():HttpClient=HttpClient(timeout,retries,headers.toMap())}
fun httpClient(block:HttpClientBuilder.()->Unit):HttpClient{return HttpClientBuilder().apply(block).build()}
data class HttpClient(val timeout:Duration,val retries:Int,val headers:Map<String,String>){suspend fun get(url:String):String{repeat(retries){try{delay(100);return"Response from $url"}catch(e:Exception){if(it==retries-1)throw e}}
return""}}
suspend fun main(){val client=httpClient{timeout(10.seconds);retries(5);header("User-Agent","MyApp/1.0")}
val response=client.get("https://api.example.com/users")
println("Response: $response")
val numbers=listOf(1,2,3,4,5)
val doubled=numbers.map{it*2}.filter{it>4}
println("Doubled and filtered: $doubled")
val users=listOf("john@example.com","invalid-email","jane@test.com")
val validEmails=users.filter{it.isValidEmail()}
println("Valid emails: $validEmails")}`,
  },
]

const kotlinOptions = [
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
      { value: 4, label: "4 Spaces (Kotlin Standard)" },
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

function processKotlin(input: string, options: any = {}) {
  try {
    let output = input

    // Remove comments if requested
    if (options.removeComments) {
      output = output.replace(/\/\/.*$/gm, "")
      output = output.replace(/\/\*[\s\S]*?\*\//g, "")
    }

    // Sort and group imports
    if (options.sortImports || options.groupImports) {
      output = formatKotlinImports(output, options)
    }

    if (options.format === "minify") {
      output = output
        .replace(/\s+/g, " ")
        .replace(/;\s*}/g, "}")
        .replace(/\s*{\s*/g, "{")
        .trim()
    } else {
      // Beautify Kotlin
      const indentStr = options.indent === "tab" ? "\t" : " ".repeat(options.indent || 4)
      output = beautifyKotlin(output, indentStr)
    }

    const stats = {
      "Original Size": `${input.length} chars`,
      "Formatted Size": `${output.length} chars`,
      "Classes": `${(input.match(/class\s+\w+/g) || []).length}`,
      "Data Classes": `${(input.match(/data class\s+\w+/g) || []).length}`,
      "Functions": `${(input.match(/fun\s+\w+/g) || []).length}`,
      "Extensions": `${(input.match(/fun\s+\w+\.\w+/g) || []).length}`,
      "Lambdas": `${(input.match(/{[^}]*->/g) || []).length}`,
    }

    return { output, stats }
  } catch (error) {
    return {
      output: "",
      error: "Kotlin formatting failed",
    }
  }
}

function formatKotlinImports(code: string, options: any): string {
  const lines = code.split('\n')
  const kotlinImports: string[] = []
  const javaImports: string[] = []
  const thirdPartyImports: string[] = []
  const otherLines: string[] = []
  
  lines.forEach(line => {
    const trimmed = line.trim()
    
    if (trimmed.startsWith('import ')) {
      const importPath = trimmed.replace('import ', '')
      
      if (importPath.startsWith('kotlin')) {
        kotlinImports.push(trimmed)
      } else if (importPath.startsWith('java') || importPath.startsWith('javax')) {
        javaImports.push(trimmed)
      } else {
        thirdPartyImports.push(trimmed)
      }
    } else {
      otherLines.push(line)
    }
  })
  
  if (options.sortImports) {
    kotlinImports.sort()
    javaImports.sort()
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
    if (kotlinImports.length > 0) {
      result += kotlinImports.join('\n') + '\n\n'
    }
    if (javaImports.length > 0) {
      result += javaImports.join('\n') + '\n\n'
    }
    if (thirdPartyImports.length > 0) {
      result += thirdPartyImports.join('\n') + '\n\n'
    }
  } else {
    const allImports = kotlinImports.concat(javaImports, thirdPartyImports)
    if (allImports.length > 0) {
      result += allImports.join('\n') + '\n\n'
    }
  }
  
  // Add remaining code
  result += otherLines.join('\n')
  
  return result
}

function beautifyKotlin(code: string, indent: string): string {
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

function validateKotlin(input: string) {
  if (!input.trim()) {
    return { isValid: false, error: "Input cannot be empty" }
  }
  
  // Basic Kotlin validation
  const openBraces = (input.match(/{/g) || []).length
  const closeBraces = (input.match(/}/g) || []).length
  
  if (openBraces !== closeBraces) {
    return { isValid: false, error: "Mismatched braces in Kotlin code" }
  }
  
  return { isValid: true }
}

export default function KotlinFormatterPage() {
  return (
    <TextToolLayout
      title="Kotlin Formatter"
      description="Format and beautify Kotlin code with import organization and modern Kotlin conventions."
      icon={FileCode}
      placeholder="Paste your Kotlin code here..."
      outputPlaceholder="Formatted Kotlin will appear here..."
      processFunction={processKotlin}
      validateFunction={validateKotlin}
      options={kotlinOptions}
      examples={kotlinExamples}
      fileExtensions={[".kt", ".kts"]}
      supportFileUpload={true}
      supportUrlInput={true}
    />
  )
}