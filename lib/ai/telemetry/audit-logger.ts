export interface HintAuditPayload {
  userId: string;
  problemId?: string;
  hintLevel: number;
  tokensUsed?: number;
  inputLength: number;
  outputLength: number;
  flaggedByGuardrail?: boolean;
  latencyMs: number;
}

export class AuditLogger {
  /**
   * Log LLM agent interaction details for policy enforcement and monitoring
   */
  static logHintRequest(payload: HintAuditPayload): void {
    const timestamp = new Date().toISOString();

    const auditEntry = {
      event: "AI_HINT_GENERATED",
      timestamp,
      userId: payload.userId,
      problemId: payload.problemId || "N/A",
      hintLevel: payload.hintLevel,
      tokensUsed: payload.tokensUsed || 0,
      inputLength: payload.inputLength,
      outputLength: payload.outputLength,
      flaggedByGuardrail: payload.flaggedByGuardrail || false,
      latencyMs: payload.latencyMs,
    };

    // Structured JSON log for log aggregators (e.g., Datadog, Axiom, Vercel Logs)
    console.log(JSON.stringify(auditEntry));

    // Optional: Write security/policy alerts if output was flagged
    if (payload.flaggedByGuardrail) {
      console.warn(
        `[POLICY ALERT] User ${payload.userId} attempted code generation or prompt bypass on problem ${payload.problemId}`
      );
    }
  }

  /**
   * Log blocked or rate-limited requests
   */
  static logPolicyViolation(userId: string, reason: string, details?: Record<string, unknown>): void {
    console.warn(
      JSON.stringify({
        event: "AI_POLICY_VIOLATION",
        timestamp: new Date().toISOString(),
        userId,
        reason,
        details: details || {},
      })
    );
  }
}