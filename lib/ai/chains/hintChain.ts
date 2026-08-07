// lib/ai/chains/hint-chain.ts
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { HintOutputParser } from "@/lib/ai/parsers/hint-parser";
import { AuditLogger } from "@/lib/ai/telemetry/audit-logger";

const HINT_SYSTEM_PROMPT = `
You are an expert algorithm and programming mentor. Your task is to give a helpful, progressive conceptual hint to guide the user toward solving their problem.

STRICT POLICY RULES:
1. NEVER output direct code solutions, runnable functions, or complete blocks.
2. Focus on identifying the logical flaw, edge case, or suggesting an appropriate data structure/algorithm strategy.
3. Keep hints concise (maximum 3 sentences).
4. Do not answer questions unrelated to coding or computer science.
`;

export async function generateHint({
  userId,
  problemId,
  problemDescription,
  userCode,
  hintLevel = 1,
}: {
  userId: string;
  problemId?: string;
  problemDescription: string;
  userCode: string;
  hintLevel?: number;
}) {
  const startTime = Date.now();

  // Initialize Google Gemini 3.5 Flash Lite model
  const model = new ChatGoogleGenerativeAI({
  model: "gemini-3.5-flash-lite",
  apiKey: process.env.GEMINI_API_KEY,
  temperature: 0.2,
  maxOutputTokens: 150,
});

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", HINT_SYSTEM_PROMPT],
    [
      "user",
      `Problem Details:
{problem}

User Current Code:
{code}

Hint Level Requested: {level} (1 = subtle nudge, 2 = algorithmic strategy, 3 = edge case / bug pointer)

Provide a Level {level} hint:`,
    ],
  ]);

  // Chain Gemini model with custom OutputParser to strip accidental code snippets
  const chain = prompt.pipe(model).pipe(new HintOutputParser());

  const hint = await chain.invoke({
    problem: problemDescription,
    code: userCode,
    level: hintLevel,
  });

  const latencyMs = Date.now() - startTime;

  // Log telemetry for monitoring
  AuditLogger.logHintRequest({
    userId,
    problemId,
    hintLevel,
    inputLength: userCode.length,
    outputLength: hint.length,
    latencyMs,
  });

  return hint;
}