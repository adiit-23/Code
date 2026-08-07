import axios from "axios";

// Helper functions for safe Base64 encoding/decoding in Node.js
const encodeBase64 = (str) => Buffer.from(str || "").toString("base64");
const decodeBase64 = (str) => (str ? Buffer.from(str, "base64").toString("utf-8") : null);

// Sanitize code or stdin strings: remove BOM, non-breaking spaces, and common invisible characters
export function sanitizeCode(codeString) {
  if (typeof codeString !== "string") return codeString || "";
  return codeString
    .replace(/^\uFEFF/, "") // Remove UTF-8 BOM
    .replace(/\u00A0/g, " ") // Replace non-breaking spaces with normal spaces
    .replace(/[\u200B-\u200D\u2060\uFEFF]/g, ""); // Remove zero-width / invisible chars
}

// Safe utility to get the numeric Judge0 ID
export function getJudge0laguageId(language) {
  if (!language) return 63;

  let val = language;
  if (typeof val === "object" && val !== null) {
    val = val.name || val.language || val.value || val.id;
  }

  const stringVal = String(val).trim();
  if (stringVal === "71" || Number(stringVal) === 71) return 71;
  if (stringVal === "63" || Number(stringVal) === 63) return 63;
  if (stringVal === "62" || Number(stringVal) === 62) return 62;
  if (stringVal === "54" || Number(stringVal) === 54) return 54;
  if (stringVal === "50" || Number(stringVal) === 50) return 50;
  if (stringVal === "60" || Number(stringVal) === 60) return 60;

  const langKey = stringVal.split(" ")[0].toUpperCase();

  const languageMap = {
    PYTHON: 71,
    PYTHON3: 71,
    JAVASCRIPT: 63,
    JS: 63,
    NODE: 63,
    JAVA: 62,
    CPP: 54,
    "C++": 54,
    C: 50,
    GO: 60,
  };

  return languageMap[langKey] || 63;
}

export function getLanguageName(language) {
  if (!language) return "JavaScript";

  let rawLang = language;
  if (typeof rawLang === "object" && rawLang !== null) {
    rawLang = rawLang.name || rawLang.language || rawLang.value || rawLang.id;
  }

  const stringVal = String(rawLang).trim();
  if (stringVal === "71" || Number(stringVal) === 71) return "Python";
  if (stringVal === "63" || Number(stringVal) === 63) return "JavaScript";
  if (stringVal === "62" || Number(stringVal) === 62) return "Java";
  if (stringVal === "54" || Number(stringVal) === 54) return "C++";
  if (stringVal === "50" || Number(stringVal) === 50) return "C";
  if (stringVal === "60" || Number(stringVal) === 60) return "Go";

  const langKey = stringVal.toUpperCase();

  const languageNameMap = {
    PYTHON: "Python",
    PYTHON3: "Python",
    JAVASCRIPT: "JavaScript",
    JS: "JavaScript",
    NODE: "JavaScript",
    JAVA: "Java",
    CPP: "C++",
    "C++": "C++",
    C: "C",
    GO: "Go",
  };

  if (languageNameMap[langKey]) {
    return languageNameMap[langKey];
  }

  const firstWord = langKey.split(" ")[0];
  return firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
}

export async function submitBatch(submissions) {
  if (!submissions || submissions.length === 0) return [];

  const batchPayload = submissions.map((sub) => {
    let rawLang =
      sub.language_id || sub.language || (sub.languageMap ? sub.languageMap.language : undefined);

    if (typeof rawLang === "object" && rawLang !== null) {
      rawLang = rawLang.name || rawLang.language || rawLang.value || rawLang.id;
    }

    if (sub.base64_encoded) {
      return {
        language_id: getJudge0laguageId(rawLang),
        source_code: sub.source_code,
        stdin: sub.stdin,
        expected_output: sub.expected_output || undefined,
        base64_encoded: true,
      };
    }

    // 1. Sanitize input strings
    const cleanSource = sanitizeCode(sub.source_code || "");
    const cleanStdin = sanitizeCode(sub.stdin || "").trim();
    
    // 2. Normalize expected output: strip inner whitespace if comparing JSON/arrays, or normalize spaces
    let cleanExpectedOutput = sanitizeCode(sub.expected_output || "").trim();
    if (cleanExpectedOutput) {
      // Strips extra spaces inside arrays e.g., "[0, 1]" -> "[0,1]"
      cleanExpectedOutput = cleanExpectedOutput.replace(/\s+/g, "");
    }

    return {
      language_id: getJudge0laguageId(rawLang),
      source_code: encodeBase64(cleanSource),
      stdin: encodeBase64(cleanStdin ? `${cleanStdin}\n` : ""),
      // Only attach expected_output if it exists, ensuring normalized trailing newline
      expected_output: cleanExpectedOutput ? encodeBase64(`${cleanExpectedOutput}\n`) : undefined,
      base64_encoded: true,
    };
  });

  try {
    const { data } = await axios.post(
      `${process.env.JUDGE0_API_URL}/submissions/batch?base64_encoded=true`,
      { submissions: batchPayload },
      { headers: { "Content-Type": "application/json" } }
    );

    return data; // Returns [{ token: "..." }, ...]
  } catch (error) {
    console.error("Judge0 Batch Error:", error.response?.data || error.message);
    throw new Error("Failed to submit batch to Judge0");
  }
}

export async function pollBatchResults(tokens, maxAttempts = 20, delayMs = 500) {
  if (!tokens || tokens.length === 0) return [];

  const tokenList = tokens.map((t) => (typeof t === "object" ? t.token : t));
  const tokenString = tokenList.join(",");

  const fields = "stdout,stderr,compile_output,status,time,memory,token";
  const url = `${process.env.JUDGE0_API_URL}/submissions/batch?tokens=${tokenString}&base64_encoded=true&fields=${fields}`;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const { data } = await axios.get(url);
      const submissions = data.submissions || [];

      // Ensure all tokens exist in response AND all are processed (status.id > 2)
      const isAllFinished =
        submissions.length === tokenList.length &&
        submissions.every((sub) => sub.status && sub.status.id > 2);

      if (isAllFinished) {
        const resultMap = new Map(
          submissions.map((sub) => [
            sub.token,
            {
              stdout: decodeBase64(sub.stdout) ?? "",
              stderr: decodeBase64(sub.stderr),
              compile_output: decodeBase64(sub.compile_output),
              status: {
                id: sub.status?.id,
                description: sub.status?.description || "Completed",
              },
              time: sub.time,
              memory: sub.memory,
            },
          ])
        );

        // Preserve input array order strictly
        return tokenList.map((token) => resultMap.get(token));
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    } catch (error) {
      const actualError = error.response?.data
        ? JSON.stringify(error.response.data)
        : error.message;
      console.error(`Judge0 Polling Error (Attempt ${attempt + 1}):`, actualError);
    }
  }

  return tokenList.map(() => ({
    stdout: null,
    stderr: "Execution timed out while polling Judge0",
    compile_output: null,
    status: { id: 13, description: "Time Limit Exceeded (Polling)" },
    time: null,
    memory: null,
  }));
}