"use client"

import { TextToolLayout } from "@/components/text-tool-layout"
import { FileCode } from "lucide-react"

const csharpExamples = [
  {
    name: "C# Class with Properties",
    content: `using System;using System.Collections.Generic;using System.Linq;using System.Threading.Tasks;namespace UserManagement{public class User{public int Id{get;set;}public string Name{get;set;}public string Email{get;set;}public DateTime CreatedAt{get;set;}public List<string>Roles{get;set;}=new List<string>();public User(){}public User(string name,string email){Name=name;Email=email;CreatedAt=DateTime.UtcNow;Roles.Add("User");}public bool IsValid(){return!string.IsNullOrWhiteSpace(Name)&&!string.IsNullOrWhiteSpace(Email)&&Email.Contains("@");}public void AddRole(string role){if(!string.IsNullOrWhiteSpace(role)&&!Roles.Contains(role)){Roles.Add(role);}}public bool HasRole(string role){return Roles.Contains(role,StringComparer.OrdinalIgnoreCase);}}public interface IUserRepository{Task<User>GetByIdAsync(int id);Task<IEnumerable<User>>GetAllAsync();Task<User>CreateAsync(User user);Task<User>UpdateAsync(User user);Task<bool>DeleteAsync(int id);}public class UserRepository:IUserRepository{private readonly List<User>_users=new List<User>();public async Task<User>GetByIdAsync(int id){await Task.Delay(10);return _users.FirstOrDefault(u=>u.Id==id);}public async Task<IEnumerable<User>>GetAllAsync(){await Task.Delay(10);return _users.ToList();}public async Task<User>CreateAsync(User user){await Task.Delay(10);user.Id=_users.Count+1;user.CreatedAt=DateTime.UtcNow;_users.Add(user);return user;}public async Task<User>UpdateAsync(User user){await Task.Delay(10);var existingUser=_users.FirstOrDefault(u=>u.Id==user.Id);if(existingUser!=null){existingUser.Name=user.Name;existingUser.Email=user.Email;existingUser.Roles=user.Roles;return existingUser;}return null;}public async Task<bool>DeleteAsync(int id){await Task.Delay(10);var user=_users.FirstOrDefault(u=>u.Id==id);if(user!=null){_users.Remove(user);return true;}return false;}}}`,
  },
  {
    name: "C# LINQ and Extension Methods",
    content: `using System;using System.Collections.Generic;using System.Linq;namespace DataProcessing{public static class EnumerableExtensions{public static IEnumerable<T>WhereNotNull<T>(this IEnumerable<T?>source)where T:class{return source.Where(item=>item!=null).Cast<T>();}public static IEnumerable<TResult>SelectMany<T,TResult>(this IEnumerable<T>source,Func<T,IEnumerable<TResult>>selector){return source.SelectMany(selector);}public static Dictionary<TKey,TValue>ToDictionary<T,TKey,TValue>(this IEnumerable<T>source,Func<T,TKey>keySelector,Func<T,TValue>valueSelector)where TKey:notnull{return source.ToDictionary(keySelector,valueSelector);}}public class DataProcessor{private readonly List<Product>_products;public DataProcessor(IEnumerable<Product>products){_products=products?.ToList()??new List<Product>();}public IEnumerable<Product>GetActiveProducts(){return _products.Where(p=>p.IsActive&&p.Stock>0).OrderBy(p=>p.Name);}public IEnumerable<IGrouping<string,Product>>GetProductsByCategory(){return _products.Where(p=>p.IsActive).GroupBy(p=>p.Category).OrderBy(g=>g.Key);}public decimal GetTotalValue(){return _products.Where(p=>p.IsActive).Sum(p=>p.Price*p.Stock);}public Product GetMostExpensiveProduct(){return _products.Where(p=>p.IsActive).OrderByDescending(p=>p.Price).FirstOrDefault();}public IEnumerable<string>GetUniqueCategories(){return _products.Select(p=>p.Category).Distinct().OrderBy(c=>c);}public void UpdatePrices(Func<Product,decimal>priceCalculator){foreach(var product in _products.Where(p=>p.IsActive)){product.Price=priceCalculator(product);}}}}`,
  },
]

const csharpOptions = [
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
      { value: 4, label: "4 Spaces (C# Standard)" },
      { value: "tab", label: "Tabs" },
    ],
  },
  {
    key: "braceStyle",
    label: "Brace Style",
    type: "select" as const,
    defaultValue: "new-line",
    selectOptions: [
      { value: "same-line", label: "Same Line" },
      { value: "new-line", label: "New Line (C# Standard)" },
    ],
  },
  {
    key: "sortUsings",
    label: "Sort Using Statements",
    type: "checkbox" as const,
    defaultValue: true,
  },
  {
    key: "groupUsings",
    label: "Group Using Statements",
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

function processCSharp(input: string, options: any = {}) {
  try {
    let output = input

    // Remove comments if requested
    if (options.removeComments) {
      output = output.replace(/\/\/.*$/gm, "")
      output = output.replace(/\/\*[\s\S]*?\*\//g, "")
    }

    // Sort and group using statements
    if (options.sortUsings || options.groupUsings) {
      output = formatCSharpUsings(output, options)
    }

    if (options.format === "minify") {
      output = output
        .replace(/\s+/g, " ")
        .replace(/;\s*}/g, "}")
        .replace(/\s*{\s*/g, "{")
        .trim()
    } else {
      // Beautify C#
      const indentStr = options.indent === "tab" ? "\t" : " ".repeat(options.indent || 4)
      output = beautifyCSharp(output, indentStr, options)
    }

    const stats = {
      "Original Size": `${input.length} chars`,
      "Formatted Size": `${output.length} chars`,
      "Classes": `${(input.match(/class\s+\w+/g) || []).length}`,
      "Interfaces": `${(input.match(/interface\s+\w+/g) || []).length}`,
      "Methods": `${(input.match(/public|private|protected|internal\s+[\w<>\[\]]+\s+\w+\s*\(/g) || []).length}`,
      "Properties": `${(input.match(/\w+\s*{\s*get/g) || []).length}`,
      "Attributes": `${(input.match(/\[\w+/g) || []).length}`,
    }

    return { output, stats }
  } catch (error) {
    return {
      output: "",
      error: "C# formatting failed",
    }
  }
}

function formatCSharpUsings(code: string, options: any): string {
  const lines = code.split('\n')
  const usings: string[] = []
  const systemUsings: string[] = []
  const microsoftUsings: string[] = []
  const thirdPartyUsings: string[] = []
  const otherLines: string[] = []
  
  lines.forEach(line => {
    const trimmed = line.trim()
    
    if (trimmed.startsWith('using ') && !trimmed.includes('=')) {
      const usingPath = trimmed.replace('using ', '').replace(';', '')
      
      if (usingPath.startsWith('System')) {
        systemUsings.push(trimmed)
      } else if (usingPath.startsWith('Microsoft')) {
        microsoftUsings.push(trimmed)
      } else {
        thirdPartyUsings.push(trimmed)
      }
    } else {
      otherLines.push(line)
    }
  })
  
  if (options.sortUsings) {
    systemUsings.sort()
    microsoftUsings.sort()
    thirdPartyUsings.sort()
  }
  
  let result = ""
  
  // Add using statements with grouping
  if (options.groupUsings) {
    if (systemUsings.length > 0) {
      result += systemUsings.join('\n') + '\n\n'
    }
    if (microsoftUsings.length > 0) {
      result += microsoftUsings.join('\n') + '\n\n'
    }
    if (thirdPartyUsings.length > 0) {
      result += thirdPartyUsings.join('\n') + '\n\n'
    }
  } else {
    const allUsings = systemUsings.concat(microsoftUsings, thirdPartyUsings)
    if (allUsings.length > 0) {
      result += allUsings.join('\n') + '\n\n'
    }
  }
  
  // Add remaining code
  result += otherLines.join('\n')
  
  return result
}

function beautifyCSharp(code: string, indent: string, options: any): string {
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

function validateCSharp(input: string) {
  if (!input.trim()) {
    return { isValid: false, error: "Input cannot be empty" }
  }
  
  // Basic C# validation
  const openBraces = (input.match(/{/g) || []).length
  const closeBraces = (input.match(/}/g) || []).length
  
  if (openBraces !== closeBraces) {
    return { isValid: false, error: "Mismatched braces in C# code" }
  }
  
  return { isValid: true }
}

export default function CSharpFormatterPage() {
  return (
    <TextToolLayout
      title="C# Formatter"
      description="Format and beautify C# code following .NET conventions with using statement organization."
      icon={FileCode}
      placeholder="Paste your C# code here..."
      outputPlaceholder="Formatted C# will appear here..."
      processFunction={processCSharp}
      validateFunction={validateCSharp}
      options={csharpOptions}
      examples={csharpExamples}
      fileExtensions={[".cs"]}
      supportFileUpload={true}
      supportUrlInput={true}
    />
  )
}