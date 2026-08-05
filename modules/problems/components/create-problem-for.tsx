"use client";

import { Editor } from "@monaco-editor/react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Trash2,
  Code2,
  FileText,
  Lightbulb,
  BookOpen,
  CheckCircle2,
  Download,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const problemSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  tags: z.array(z.string()).min(1, "At least one tag is required"),
  constraints: z.string().min(1, "Constraints are required"),
  hints: z.string().optional(),
  editorial: z.string().optional(),
  testCases: z
    .array(
      z.object({
        input: z.string().min(1, "Input is required"),
        output: z.string().min(1, "Output is required"),
      })
    )
    .min(1, "At least one test case is required"),
  examples: z.object({
    JAVASCRIPT: z.object({
      input: z.string().min(1, "Input is required"),
      output: z.string().min(1, "Output is required"),
      explanation: z.string().optional(),
    }),
    PYTHON: z.object({
      input: z.string().min(1, "Input is required"),
      output: z.string().min(1, "Output is required"),
      explanation: z.string().optional(),
    }),
    CPP: z.object({
      input: z.string().min(1, "Input is required"),
      output: z.string().min(1, "Output is required"),
      explanation: z.string().optional(),
    }),
  }),
  codeSnippets: z.object({
    JAVASCRIPT: z.string().min(1, "JavaScript code snippet is required"),
    PYTHON: z.string().min(1, "Python code snippet is required"),
    CPP: z.string().min(1, "CPP solution is required"),
  }),
  referenceSolutions: z.object({
    JAVASCRIPT: z.string().min(1, "JavaScript solution is required"),
    PYTHON: z.string().min(1, "Python solution is required"),
    CPP: z.string().min(1, "CPP solution is required"),
  }),
});

// Extract type from schema to strictly type the mock data
type ProblemFormValues = z.infer<typeof problemSchema>;

const sampleStringProblem: ProblemFormValues = {
  title: "Valid Palindrome",
  description:
    "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers. Given a string s, return true if it is a palindrome, or false otherwise.",
  difficulty: "EASY",
  tags: ["String", "Two Pointers"],
  constraints:
    "1 <= s.length <= 2 * 10^5\ns consists only of printable ASCII characters.",
  hints:
    "Consider using two pointers, one from the start and one from the end, moving towards the center.",
  editorial:
    "We can use two pointers approach to check if the string is a palindrome. One pointer starts from the beginning and the other from the end, moving towards each other.",
  testCases: [
    { input: "A man, a plan, a canal: Panama", output: "true" },
    { input: "race a car", output: "false" },
    { input: " ", output: "true" },
  ],
  examples: {
    JAVASCRIPT: {
      input: 's = "A man, a plan, a canal: Panama"',
      output: "true",
      explanation: '"amanaplanacanalpanama" is a palindrome.',
    },
    PYTHON: {
      input: 's = "A man, a plan, a canal: Panama"',
      output: "true",
      explanation: '"amanaplanacanalpanama" is a palindrome.',
    },
    CPP: {
      input: 's = "A man, a plan, a canal: Panama"',
      output: "true",
      explanation: '"amanaplanacanalpanama" is a palindrome.',
    },
  },
  codeSnippets: {
    JAVASCRIPT: `const fs = require('fs');

// 1. Your core algorithm logic
function isPalindrome(s) {
  
}

// 2. Driver code to handle Judge0 stdin/stdout
function main() {
  // Read all data from standard input (stdin)
  let input = fs.readFileSync(0, 'utf-8').trim();
  
  if (!input) {
    console.log("true");
    return;
  }

  if (input.startsWith('"') && input.endsWith('"')) {
    input = input.slice(1, -1);
  }

  const result = isPalindrome(input);
  console.log(result);
}

main();
 `,
    PYTHON: `class Solution:
    def isPalindrome(self, s: str) -> bool:
        # Write your code here
        pass

# --- PLATFORM INJECTED WRAPPER ---
if __name__ == "__main__":
    import sys
    
    # Read all input from stdin
    input_str = sys.stdin.read().strip()
    
    # Strip surrounding quotes if your backend passes it as '"Panama"'
    if len(input_str) >= 2 and input_str.startswith('"') and input_str.endswith('"'):
        input_str = input_str[1:-1]
        
    sol = Solution()
    result = sol.isPalindrome(input_str)
    
    # Convert Python's True/False to lowercase true/false to match test cases
    print("true" if result else "false")`,
    CPP: `#include <iostream>
#include <string>
#include <cctype>

using namespace std;

// --- USER SUBMITTED CODE STARTS ---
bool isPalindrome(string s) {
    // Write your code here
    
}
// --- USER SUBMITTED CODE ENDS ---

// --- PLATFORM INJECTED WRAPPER ---
int main() {
    string input, temp;
    
    // Read all of stdin securely
    while (getline(cin, temp)) {
        input += temp;
    }

    // Strip surrounding quotes if your backend passes it as '"Panama"'
    if (input.length() >= 2 && input.front() == '"' && input.back() == '"') {
        input = input.substr(1, input.length() - 2);
    }

    // Execute and print
    if (isPalindrome(input)) {
        cout << "true";
    } else {
        cout << "false";
    }

    return 0;
}`,
  },
  referenceSolutions: {
    JAVASCRIPT: `const fs = require('fs');

// 1. Your core algorithm logic
function isPalindrome(s) {
  s = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  let left = 0;
  let right = s.length - 1;
  while (left < right) {
    if (s[left] !== s[right]) return false;
    left++;
    right--;
  }
  return true;
}

// 2. Driver code to handle Judge0 stdin/stdout
function main() {
  // Read all data from standard input (stdin)
  let input = fs.readFileSync(0, 'utf-8').trim();
  
  if (!input) {
    console.log("true");
    return;
  }

  if (input.startsWith('"') && input.endsWith('"')) {
    input = input.slice(1, -1);
  }

  const result = isPalindrome(input);
  console.log(result);
}

main();`,
    PYTHON: `class Solution:
    def isPalindrome(self, s: str) -> bool:
        filtered_chars = [c.lower() for c in s if c.isalnum()]
        return filtered_chars == filtered_chars[::-1]

# --- PLATFORM INJECTED WRAPPER ---
if __name__ == "__main__":
    import sys
    
    # Read all input from stdin
    input_str = sys.stdin.read().strip()
    
    # Strip surrounding quotes if your backend passes it as '"Panama"'
    if len(input_str) >= 2 and input_str.startswith('"') and input_str.endswith('"'):
        input_str = input_str[1:-1]
        
    sol = Solution()
    result = sol.isPalindrome(input_str)
    
    print("true" if result else "false")`,
    CPP: `#include <iostream>
#include <string>
#include <cctype>

using namespace std;

// --- USER SUBMITTED CODE STARTS ---
bool isPalindrome(string s) {
    string filtered = "";
    for (char c : s) {
        if (isalnum(c)) {
            filtered += tolower(c);
        }
    }
    
    if (filtered.empty()) return true;
    
    int left = 0, right = filtered.length() - 1;
    while (left < right) {
        if (filtered[left] != filtered[right]) return false;
        left++;
        right--;
    }
    return true;
}
// --- USER SUBMITTED CODE ENDS ---

// --- PLATFORM INJECTED WRAPPER ---
int main() {
    string input, temp;
    
    // Read all of stdin securely
    while (getline(cin, temp)) {
        input += temp;
    }

    // Strip surrounding quotes if your backend passes it as '"Panama"'
    if (input.length() >= 2 && input.front() == '"' && input.back() == '"') {
        input = input.substr(1, input.length() - 2);
    }

    // Execute and print
    if (isPalindrome(input)) {
        cout << "true";
    } else {
        cout << "false";
    }

    return 0;
}`,
  },
};

// Sample problem data for another type of question
const sampledpData: ProblemFormValues = {
  title: "Climbing Stairs",
  description:
    "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
  difficulty: "EASY",
  tags: ["Dynamic Programming", "Math", "Memoization"],
  constraints: "1 <= n <= 45",
  hints:
    "To reach the nth step, you can either come from the (n-1)th step or the (n-2)th step.",
  editorial:
    "This is a classic dynamic programming problem. The number of ways to reach the nth step is the sum of the number of ways to reach the (n-1)th step and the (n-2)th step, forming a Fibonacci-like sequence.",
  testCases: [
    { input: "2", output: "2" },
    { input: "3", output: "3" },
    { input: "4", output: "5" },
  ],
  examples: {
    JAVASCRIPT: {
      input: "n = 2",
      output: "2",
      explanation:
        "There are two ways to climb to the top:\n1. 1 step + 1 step\n2. 2 steps",
    },
    PYTHON: {
      input: "n = 3",
      output: "3",
      explanation:
        "There are three ways to climb to the top:\n1. 1 step + 1 step + 1 step\n2. 1 step + 2 steps\n3. 2 steps + 1 step",
    },
    CPP: {
      input: "n = 4",
      output: "5",
      explanation:
        "There are five ways to climb to the top:\n1. 1 step + 1 step + 1 step + 1 step\n2. 1 step + 1 step + 2 steps\n3. 1 step + 2 steps + 1 step\n4. 2 steps + 1 step + 1 step\n5. 2 steps + 2 steps",
    },
  },
  codeSnippets: {
    JAVASCRIPT: `/**
 * @param {number} n
 * @return {number}
 */
function climbStairs(n) {
    // Write your code here
}

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

rl.on('line', (line) => {
    const n = parseInt(line.trim());
    const result = climbStairs(n);
    console.log(result);
    rl.close();
});`,
    PYTHON: `class Solution:
    def climbStairs(self, n: int) -> int:
        # Write your code here

if __name__ == "__main__":
    import sys
    n = int(sys.stdin.readline().strip())
    sol = Solution()
    result = sol.climbStairs(n)
    print(result)`,
    CPP: `#include <iostream>
#include <string>
#include <vector>

using namespace std;

// --- USER SUBMITTED CODE STARTS ---
int climbStairs(int n) {
    // Write your code here
    
}
// --- USER SUBMITTED CODE ENDS ---

// --- PLATFORM INJECTED WRAPPER ---
int main() {
    string input_raw;
    
    // Read the single token from stdin
    if (!(cin >> input_raw)) {
        return 0; // Exit silently if there is no input
    }

    // Strip surrounding quotes if your backend passes it as '"5"'
    if (input_raw.length() >= 2 && input_raw.front() == '"' && input_raw.back() == '"') {
        input_raw = input_raw.substr(1, input_raw.length() - 2);
    }

    // Convert string to integer
    int n;
    try {
        n = stoi(input_raw);
    } catch (...) {
        // If it fails to parse (e.g., empty string or invalid chars), exit
        return 1; 
    }

    // Execute and print the result
    cout << climbStairs(n);

    return 0;
}`,
  },
  referenceSolutions: {
    JAVASCRIPT: `/**
 * @param {number} n
 * @return {number}
 */
function climbStairs(n) {
    if (n <= 2) return n;
    
    let dp = new Array(n + 1);
    dp[1] = 1;
    dp[2] = 2;
    
    for (let i = 3; i <= n; i++) {
      dp[i] = dp[i - 1] + dp[i - 2];
    }
    
    return dp[n];
    }
  const readline = require('readline');
  const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', (line) => {
    const n = parseInt(line.trim());
    const result = climbStairs(n);
    console.log(result);
    rl.close();
});
`,
    PYTHON: `class Solution:
    def climbStairs(self, n: int) -> int:
        if n <= 2:
            return n
            
        dp = [0] * (n + 1)
        dp[1] = 1
        dp[2] = 2
        
        for i in range(3, n + 1):
            dp[i] = dp[i - 1] + dp[i - 2]
            
        return dp[n]

if __name__ == "__main__":
    import sys
    n = int(sys.stdin.readline().strip())
    sol = Solution()
    result = sol.climbStairs(n)
    print(result)`,
    CPP: `#include <iostream>
#include <string>
#include <vector>

using namespace std;

// --- USER SUBMITTED CODE STARTS ---
int climbStairs(int n) {
    // Base cases
    if (n <= 2) return n;
    
    // Create a DP array of size n + 1 to store the number of ways 
    // to reach each step (using 1-based indexing for simplicity)
    vector<int> dp(n + 1);
    dp[1] = 1;
    dp[2] = 2;
    
    // Build the solution from the bottom up
    for (int i = 3; i <= n; i++) {
        dp[i] = dp[i - 1] + dp[i - 2];
    }
    
    return dp[n];
}
// --- USER SUBMITTED CODE ENDS ---

// --- PLATFORM INJECTED WRAPPER ---
int main() {
    string input_raw;
    
    // Read the single token from stdin
    if (!(cin >> input_raw)) {
        return 0; // Exit silently if there is no input
    }

    // Strip surrounding quotes if your backend passes it as '"5"'
    if (input_raw.length() >= 2 && input_raw.front() == '"' && input_raw.back() == '"') {
        input_raw = input_raw.substr(1, input_raw.length() - 2);
    }

    // Convert string to integer
    int n;
    try {
        n = stoi(input_raw);
    } catch (...) {
        // If it fails to parse (e.g., empty string or invalid chars), exit
        return 1; 
    }

    // Execute and print the result
    cout << climbStairs(n);

    return 0;
}`,
  },
};
interface CodeEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  language?: "javascript" | "python" | "cpp";
}

const CodeEditor = ({
  value,
  onChange,
  language = "javascript",
}: CodeEditorProps) => {
  const languageMap = {
    javascript: "javascript",
    python: "python",
    cpp: "gcc",
  };

  return (
    <div className="border rounded-md bg-[#1e1e1e] overflow-hidden shadow-sm">
      <div className="px-4 py-2 bg-[#2d2d2d] border-b border-[#404040] text-slate-300 text-sm font-mono flex items-center justify-between">
        <span>{language}</span>
      </div>
      <div className="h-[300px] w-full">
        <Editor
          height="300px"
          defaultLanguage={languageMap[language]}
          theme="vs-dark"
          value={value}
          onChange={onChange}
          options={{
            minimap: { enabled: false },
            fontSize: 15,
            lineNumbers: "on",
            readOnly: false,
            wordWrap: "on",
            formatOnPaste: true,
            formatOnType: true,
            automaticLayout: true,
            padding: { top: 16 },
          }}
        />
      </div>
    </div>
  );
};

const CreateProblemForm = () => {
  const router = useRouter();
  const [sampleType, setSampleType] = useState("DP");
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProblemFormValues>({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      testCases: [{ input: "", output: "" }],
      tags: [""],
      examples: {
        JAVASCRIPT: { input: "", output: "", explanation: "" },
        PYTHON: { input: "", output: "", explanation: "" },
        CPP: { input: "", output: "", explanation: "" },
      },
      codeSnippets: {
        JAVASCRIPT: `function solution() {\n  // Write your code here\n}function main() {
  // Read all data from standard input (stdin)
  const input = fs.readFileSync(0, 'utf-8').trim();
  
  if (!input) return;

  // Split input by newlines if Piston passes multiple test cases
  const lines = input.split(/\r?\n/);

  for (let line of lines) {
    // Call your function and print to stdout
    const result = isPalindrome(line);
    console.log(result);
  }
}

main(); `,
        PYTHON: "def solution():\n    # Write your code here\n    pass",
        CPP: "public class Solution {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}",
      },
      referenceSolutions: {
        JAVASCRIPT: "// Add your reference solution here",
        PYTHON: "# Add your reference solution here",
        CPP: "// Add your reference solution here",
      },
    },
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = form;

  const {
    fields: testCaseFields,
    append: appendTestCase,
    remove: removeTestCase,
    replace: replaceTestCases,
  } = useFieldArray<ProblemFormValues, "testCases">({ control, name: "testCases" });

  const {
    fields: tagFields,
    append: appendTag,
    remove: removeTag,
    replace: replaceTags,//@ts-ignore
  } = useFieldArray<ProblemFormValues, "tags">({ control, name: "tags" });

  const onSubmit = async (values: ProblemFormValues) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/create-problem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      
      const data = await response.json();
      console.log(data);
      // Check if the server returned an error status (like 400 or 401)
      if (!response.ok) {
        throw new Error(data.error || "Failed to create problem");
      }

      toast.success(data.message || "Problem created successfully");
      router.push("/problem");
    } catch (error: any) {
      toast.error(error.message || "Failed to create problem");
    } finally {
      setIsLoading(false);
    }
  };

  const loadSampleData = () => {
    const sampleData = sampleType === "DP" ? sampledpData : sampleStringProblem;
    replaceTags(sampleData.tags);
    replaceTestCases(sampleData.testCases);
    reset(sampleData);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl bg-slate-50/50 min-h-screen">
      <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
        <CardHeader className="pb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle className="text-3xl flex items-center gap-3 text-slate-800">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <FileText className="w-7 h-7 text-indigo-600" />
              </div>
              Create Problem
            </CardTitle>

            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex border border-indigo-200 rounded-md overflow-hidden bg-white">
                <Button
                  type="button"
                  variant={sampleType === "DP" ? "default" : "ghost"}
                  size="sm"
                  className={`rounded-none ${
                    sampleType === "DP" ? "bg-indigo-500 hover:bg-indigo-600" : "text-indigo-600"
                  }`}
                  onClick={() => setSampleType("DP")}
                >
                  DP Problem
                </Button>
                <Button
                  type="button"
                  variant={sampleType === "string" ? "default" : "ghost"}
                  size="sm"
                  className={`rounded-none ${
                    sampleType === "string" ? "bg-indigo-500 hover:bg-indigo-600" : "text-indigo-600"
                  }`}
                  onClick={() => setSampleType("string")}
                >
                  String Problem
                </Button>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={loadSampleData}
                className="gap-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50 bg-white"
              >
                <Download className="w-4 h-4" />
                Load Sample
              </Button>
            </div>
          </div>
          <Separator className="bg-indigo-100 mt-6" />
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Label htmlFor="title" className="text-lg font-semibold text-slate-700">
                  Title
                </Label>
                <Input
                  id="title"
                  {...register("title")}
                  placeholder="Enter problem title"
                  className="mt-2 text-lg border-indigo-100 focus-visible:ring-indigo-400"
                />
                {errors.title && (
                  <p className="text-sm text-rose-500 mt-1">{errors.title.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description" className="text-lg font-semibold text-slate-700">
                  Description
                </Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Enter problem description"
                  className="mt-2 min-h-32 text-base resize-y border-indigo-100 focus-visible:ring-indigo-400"
                />
                {errors.description && (
                  <p className="text-sm text-rose-500 mt-1">{errors.description.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="difficulty" className="text-lg font-semibold text-slate-700">
                  Difficulty
                </Label>
                <Controller
                  name="difficulty"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="mt-2 border-indigo-100 focus:ring-indigo-400">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EASY">
                          <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200">
                            Easy
                          </Badge>
                        </SelectItem>
                        <SelectItem value="MEDIUM">
                          <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                            Medium
                          </Badge>
                        </SelectItem>
                        <SelectItem value="HARD">
                          <Badge variant="secondary" className="bg-rose-100 text-rose-800 hover:bg-rose-200">
                            Hard
                          </Badge>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.difficulty && (
                  <p className="text-sm text-rose-500 mt-1">{errors.difficulty.message}</p>
                )}
              </div>
            </div>

            {/* Tags */}
            <Card className="bg-rose-50/50 border-rose-100 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl flex items-center gap-2 text-rose-800">
                    <BookOpen className="w-5 h-5 text-rose-500" />
                    Tags
                  </CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendTag("")}
                    className="gap-2 border-rose-200 text-rose-700 hover:bg-rose-100 bg-white/50"
                  >
                    <Plus className="w-4 h-4" /> Add Tag
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tagFields.map((field, index) => (
                    <div key={field.id} className="flex gap-2 items-center">
                      <Input
                        {...register(`tags.${index}`)}
                        placeholder="Enter tag"
                        className="flex-1 border-rose-200 bg-white focus-visible:ring-rose-400"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTag(index)}
                        disabled={tagFields.length === 1}
                        className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                {errors.tags && (
                  <p className="text-sm text-rose-500 mt-2">{errors.tags.message}</p>
                )}
              </CardContent>
            </Card>

            {/* Test Cases */}
            <Card className="bg-emerald-50/50 border-emerald-100 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl flex items-center gap-2 text-emerald-800">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    Test Cases
                  </CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendTestCase({ input: "", output: "" })}
                    className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-100 bg-white/50"
                  >
                    <Plus className="w-4 h-4" /> Add Test Case
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {testCaseFields.map((field, index) => (
                  <Card key={field.id} className="bg-white/80 border-emerald-100 shadow-sm">
                    <CardHeader className="pb-2 pt-4 px-4">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-sm font-semibold text-emerald-700">
                          Test Case #{index + 1}
                        </CardTitle>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTestCase(index)}
                          disabled={testCaseFields.length === 1}
                          className="text-rose-400 hover:text-rose-600 hover:bg-rose-50 h-8 px-2 gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Remove
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="font-medium text-emerald-900 text-sm">Input</Label>
                          <Textarea
                            {...register(`testCases.${index}.input`)}
                            placeholder="Enter test case input"
                            className="mt-1 min-h-20 resize-y font-mono text-sm border-emerald-100 focus-visible:ring-emerald-400"
                          />
                          {errors.testCases?.[index]?.input && (
                            <p className="text-xs text-rose-500 mt-1">
                              {errors.testCases[index].input.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label className="font-medium text-emerald-900 text-sm">Expected Output</Label>
                          <Textarea
                            {...register(`testCases.${index}.output`)}
                            placeholder="Enter expected output"
                            className="mt-1 min-h-20 resize-y font-mono text-sm border-emerald-100 focus-visible:ring-emerald-400"
                          />
                          {errors.testCases?.[index]?.output && (
                            <p className="text-xs text-rose-500 mt-1">
                              {errors.testCases[index].output.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {errors.testCases && !Array.isArray(errors.testCases) && (
                  <p className="text-sm text-rose-500">{errors.testCases.message}</p>
                )}
              </CardContent>
            </Card>

            {/* Code Editor Sections */}
            {(["JAVASCRIPT", "PYTHON", "CPP"] as const).map((language) => (
              <Card key={language} className="bg-blue-50/40 border-blue-100 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl flex items-center gap-2 text-blue-800">
                    <Code2 className="w-5 h-5 text-blue-500" />
                    {language} Setup
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Starter Code */}
                  <div className="space-y-2">
                    <Label className="text-base font-semibold text-blue-900">Starter Code Template</Label>
                    <Controller
                      name={`codeSnippets.${language}`}
                      control={control}
                      render={({ field }) => (
                        <CodeEditor
                          value={field.value}
                          onChange={field.onChange}
                          language={language.toLowerCase() as "javascript" | "python" | "cpp"}
                        />
                      )}
                    />
                    {errors.codeSnippets?.[language] && (
                      <p className="text-sm text-rose-500">{errors.codeSnippets[language].message}</p>
                    )}
                  </div>

                  {/* Reference Solution */}
                  <div className="space-y-2">
                    <Label className="text-base font-semibold text-blue-900">Reference Solution</Label>
                    <Controller
                      name={`referenceSolutions.${language}`}
                      control={control}
                      render={({ field }) => (
                        <CodeEditor
                          value={field.value}
                          onChange={field.onChange}
                          language={language.toLowerCase() as "javascript" | "python" | "cpp"}
                        />
                      )}
                    />
                    {errors.referenceSolutions?.[language] && (
                      <p className="text-sm text-rose-500">{errors.referenceSolutions[language].message}</p>
                    )}
                  </div>

                  {/* Examples */}
                  <Card className="bg-white/60 border-blue-100 shadow-sm">
                    <CardHeader className="py-3 px-4 bg-blue-100/50">
                      <CardTitle className="text-sm font-semibold text-blue-800">Example for User Preview</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="font-medium text-sm text-blue-900">Input</Label>
                          <Textarea
                            {...register(`examples.${language}.input`)}
                            placeholder="Example input"
                            className="mt-1 min-h-16 resize-y font-mono text-sm border-blue-100 focus-visible:ring-blue-400"
                          />
                        </div>
                        <div>
                          <Label className="font-medium text-sm text-blue-900">Output</Label>
                          <Textarea
                            {...register(`examples.${language}.output`)}
                            placeholder="Example output"
                            className="mt-1 min-h-16 resize-y font-mono text-sm border-blue-100 focus-visible:ring-blue-400"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label className="font-medium text-sm text-blue-900">Explanation (Optional)</Label>
                          <Textarea
                            {...register(`examples.${language}.explanation`)}
                            placeholder="Explain the example"
                            className="mt-1 min-h-16 resize-y text-sm border-blue-100 focus-visible:ring-blue-400"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            ))}

            {/* Additional Information */}
            <Card className="bg-violet-50/50 border-violet-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2 text-violet-800">
                  <Lightbulb className="w-5 h-5 text-violet-500" />
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="font-medium text-violet-900">Constraints</Label>
                  <Textarea
                    {...register("constraints")}
                    placeholder="Enter problem constraints"
                    className="mt-2 min-h-24 resize-y font-mono border-violet-100 focus-visible:ring-violet-400"
                  />
                  {errors.constraints && (
                    <p className="text-sm text-rose-500 mt-1">{errors.constraints.message}</p>
                  )}
                </div>
                <div>
                  <Label className="font-medium text-violet-900">Hints (Optional)</Label>
                  <Textarea
                    {...register("hints")}
                    placeholder="Enter hints for solving the problem"
                    className="mt-2 min-h-24 resize-y border-violet-100 focus-visible:ring-violet-400"
                  />
                </div>
                <div>
                  <Label className="font-medium text-violet-900">Editorial (Optional)</Label>
                  <Textarea
                    {...register("editorial")}
                    placeholder="Enter problem editorial/solution explanation"
                    className="mt-2 min-h-32 resize-y border-violet-100 focus-visible:ring-violet-400"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end mt-6 pb-12">
              <Button
                type="submit"
                size="lg"
                disabled={isLoading}
                className="gap-2 bg-indigo-500 hover:bg-indigo-600 text-white shadow-md hover:shadow-lg transition-all"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Create Problem
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateProblemForm;