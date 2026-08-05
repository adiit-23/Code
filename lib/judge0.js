import axios from "axios";

// Helper functions for safe Base64 encoding/decoding in Node.js
const encodeBase64 = (str) => Buffer.from(str || "").toString("base64");
const decodeBase64 = (str) => str ? Buffer.from(str, "base64").toString("utf-8") : null;

// 1. Updated for REAL Judge0 Language IDs
// Safe utility to get the numeric Judge0 ID
export function getJudge0laguageId(language) {
  if (!language) return 63;
  
  let val = language;
  if (typeof val === "object" && val !== null) {
    val = val.name || val.language || val.value || val.id;
  }

  // If it's already a numeric ID or a string of numbers (e.g. 71 or "71"), check it directly
  const stringVal = String(val).trim();
  if (stringVal === "71" || Number(stringVal) === 71) return 71;
  if (stringVal === "63" || Number(stringVal) === 63) return 63;
  if (stringVal === "62" || Number(stringVal) === 62) return 62;
  if (stringVal === "54" || Number(stringVal) === 54) return 54;
  if (stringVal === "50" || Number(stringVal) === 50) return 50;
  if (stringVal === "60" || Number(stringVal) === 60) return 60;

  const langKey = stringVal.split(" ")[0].toUpperCase();
  
  const languageMap = {
    "PYTHON": 71,
    "PYTHON3": 71,
    "JAVASCRIPT": 63,
    "JS": 63,
    "NODE": 63,
    "JAVA": 62,
    "CPP": 54,
    "C++": 54,
    "C": 50,
    "GO": 60,
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
        "PYTHON": "Python",
        "PYTHON3": "Python",
        "JAVASCRIPT": "JavaScript",
        "JS": "JavaScript",
        "NODE": "JavaScript",
        "JAVA": "Java",
        "CPP": "C++",
        "C++": "C++",
        "C": "C",
        "GO": "Go",
    };

    if (languageNameMap[langKey]) {
        return languageNameMap[langKey];
    }

    const firstWord = langKey.split(" ")[0];
    return firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
}

export async function submitBatch(submissions) {
  if (!submissions || submissions.length === 0) return [];

  // Send raw plain strings directly
  const batchPayload = submissions.map((sub) => {
    let rawLang = sub.language_id || sub.language || (sub.languageMap ? sub.languageMap.language : undefined);

    if (typeof rawLang === "object" && rawLang !== null) {
      rawLang = rawLang.name || rawLang.language || rawLang.value || rawLang.id;
    }

    return {
      language_id: getJudge0laguageId(rawLang),
      source_code: sub.source_code, // Plain string
      stdin: (sub.stdin || "") + "\n", // Plain string
    };
  });

  try {
    const { data } = await axios.post(
      `${process.env.JUDGE0_API_URL}/submissions/batch`,
      { submissions: batchPayload },
      { headers: { "Content-Type": "application/json" } }
    );

    return data; // Returns [{ token: "..." }, ...]
  } catch (error) {
    console.error("Judge0 Batch Error:", error.response?.data || error.message);
    throw new Error("Failed to submit batch to Judge0");
  }
}

// Now actually polls Judge0 instead of reading a mock cache
export async function pollBatchResults(tokens, maxAttempts = 20, delayMs = 500) {
  if (!tokens || tokens.length === 0) return [];

  const tokenString = tokens.join(",");
  const url = `${process.env.JUDGE0_API_URL}/submissions/batch?tokens=${tokenString}&base64_encoded=true`;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const { data } = await axios.get(url);
      const submissions = data.submissions || [];

      // Judge0 Status IDs <= 2 mean "In Queue" (1) or "Processing" (2)
      const isAllFinished = submissions.every(
        (sub) => sub.status && sub.status.id > 2
      );

      if (isAllFinished) {
        return submissions.map((sub) => ({
          stdout: decodeBase64(sub.stdout),
          stderr: decodeBase64(sub.stderr),
          compile_output: decodeBase64(sub.compile_output),
          status: { 
            id: sub.status?.id,
            description: sub.status?.description || "Completed" 
          },
          time: sub.time,
          memory: sub.memory,
        }));
      }

      // Wait before next polling attempt
      await new Promise((resolve) => setTimeout(resolve, delayMs));

    } catch (error) {
      const actualError = error.response?.data
        ? JSON.stringify(error.response.data)
        : error.message;
      console.error(`Judge0 Polling Error (Attempt ${attempt + 1}):`, actualError);
    }
  }

  // Fallback if maxAttempts reached before finishing
  return tokens.map(() => ({
    stdout: null,
    stderr: "Execution timed out while polling Judge0",
    compile_output: null,
    status: { id: 13, description: "Time Limit Exceeded (Polling)" },
    time: null,
    memory: null,
  }));
}