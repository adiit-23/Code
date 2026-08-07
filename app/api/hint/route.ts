import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { validateHintInput } from "@/lib/ai/policy/input-gaurd";
import { checkAndDeductTokenBudget } from "@/lib/ai/policy/token-budget";
import { generateHint } from "@/lib/ai/chains/hintChain";
import { AuditLogger } from "@/lib/ai/telemetry/audit-logger";

export async function POST(req: Request) {
  try {
    // 1. Auth Guard
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { problemId, userCode, hintLevel } = body;

    if (!problemId) {
      return NextResponse.json(
        { error: "Problem ID is required." },
        { status: 400 }
      );
    }

    // 2. Fetch Problem details from Prisma using your Problem schema
    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      select: {
        title: true,
        description: true,
        constraints: true,
        hints: true,
      },
    });

    if (!problem) {
      return NextResponse.json(
        { error: "Problem not found." },
        { status: 404 }
      );
    }

    // Combine title, description, and constraints into a complete context for the AI
    const fullProblemDescription = `
Title: ${problem.title}
Description: ${problem.description}
Constraints: ${problem.constraints}
${problem.hints ? `Existing Hints Context: ${problem.hints}` : ""}
    `.trim();

    // 3. Policy Guard: Input Validation
    const inputCheck = validateHintInput(userCode || "", fullProblemDescription);
    if (!inputCheck.valid) {
      AuditLogger.logPolicyViolation(userId, inputCheck.error || "Input validation failed", {
        problemId,
      });
      return NextResponse.json({ error: inputCheck.error }, { status: 400 });
    }

    // 4. Policy Guard: Token Budget Check
    const budgetCheck = await checkAndDeductTokenBudget(userId);
    if (!budgetCheck.allowed) {
      AuditLogger.logPolicyViolation(userId, "Token budget limit exceeded", {
        problemId,
      });
      return NextResponse.json({ error: budgetCheck.error }, { status: 429 });
    }

    // 5. Execute LangChain Agent with single object parameter matching signature
    const hint = await generateHint({
      userId,
      problemId,
      problemDescription: fullProblemDescription,
      userCode: userCode || "// No user code provided yet",
      hintLevel: Number(hintLevel) || 1,
    });

    return NextResponse.json({
      hint,
      remainingTokens: budgetCheck.remaining,
    });
  } catch (error) {
    console.error("Error generating AI hint:", error);
    return NextResponse.json(
      { error: "Failed to generate hint. Please try again later." },
      { status: 500 }
    );
  }
}