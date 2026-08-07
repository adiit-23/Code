import { BaseOutputParser } from "@langchain/core/output_parsers";

export class HintOutputParser extends BaseOutputParser<string> {
  lc_namespace = ["langchain", "schema", "output_parser"];

  async parse(text: string): Promise<string> {
    if (!text) return "No hint available.";

    let sanitized = text;

    // 1. Remove standard markdown code blocks (```lang ... ```)
    sanitized = sanitized.replace(/```[\s\S]*?```/g, "[Code block removed for hint]");

    // 2. Remove inline code snippets (`code`) if they contain functional statements
    sanitized = sanitized.replace(/`([^`]{10,})`/g, "$1");

    // 3. Redact obvious direct code assignments or keywords (e.g. "const x = ", "def solve():")
    sanitized = sanitized.replace(
      /(const|let|var|function|def|class|return|import|export)\s+[\w\d_]+\s*(=|\(|\:)?/gi,
      "[concept]"
    );

    // 4. Ensure hint isn't empty after sanitization
    if (sanitized.trim().length === 0) {
      return "Focus on step-by-step logic and check your conditional conditions or data structures.";
    }

    return sanitized.trim();
  }

  getFormatInstructions(): string {
    return "Output must be plain conversational prose explaining logic. Do NOT include markdown code blocks or executable code.";
  }
}