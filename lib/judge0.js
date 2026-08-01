import axios from "axios";

// Helper functions for safe Base64 encoding/decoding in Node.js
const encodeBase64 = (str) => Buffer.from(str || "").toString("base64");
const decodeBase64 = (str) => str ? Buffer.from(str, "base64").toString("utf-8") : null;

// 1. Updated for REAL Judge0 Language IDs
export function getJudge0laguageId(language) {
  const langKey = String(language).trim().toUpperCase();
  
  const languageMap = {
    "PYTHON": 71,
    "JAVASCRIPT": 63, // Fixed to 63 for standard CE!
    "NODE": 63,
    "JAVA": 62,
    "CPP": 54,
    "C++": 54,
    "C": 50,
    "GO": 60,
  };
  
  // Default to JavaScript (63) if not found
  return languageMap[langKey] || 63; 
}

export function getLanguageName(language) {
    let rawLang = language;
    if (typeof rawLang === "object" && rawLang !== null) {
        rawLang = rawLang.name || rawLang.language || rawLang.value || rawLang.id;
    }

    const langKey = String(rawLang).trim().toUpperCase();

    const languageNameMap = {
        "PYTHON": 71,
        "JAVASCRIPT": 63,
        "JAVA": 62,
        "CPP": 54,
        "GO": 60,
    };

    if (languageNameMap[langKey]) {
        return languageNameMap[langKey];
    }

    const firstWord = langKey.split(" ")[0];
    return firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
}

// NOTE: resultsCache and crypto have been completely removed!
// Judge0 handles queuing and tokens natively.

export async function submitBatch(submissions) {
  const executionPromises = submissions.map(async (sub) => {
    
    let rawLang = sub.language_id || sub.language || (sub.languageMap ? sub.languageMap.language : undefined);

    if (typeof rawLang === "object" && rawLang !== null) {
      rawLang = rawLang.language || rawLang.name || rawLang.value || rawLang.id;
    }

    if (!rawLang) {
      console.error("CRITICAL: No language property found in submission payload!", sub);
      rawLang = "JAVASCRIPT"; 
    }

    const langKey = String(rawLang).split(" ")[0].toUpperCase();
    const languageId = getJudge0laguageId(langKey);

    const options = {
      method: "POST",
      url: "http://localhost:2358/submissions?base64_encoded=true",
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        language_id: languageId,
        source_code: encodeBase64(sub.source_code),
        stdin: encodeBase64((sub.stdin || "") + "\n"), // Safely encoded!
        // optional: expected_output: encodeBase64(sub.expected_output)
      },
      cpu_time_limit: 10.0,   // Gives Node.js plenty of time to execute
    wall_time_limit: 20.0
    };

    try {
      const { data } = await axios.request(options);
      
      // Judge0 responds immediately with a real execution token: { token: "uuid" }
      return { token: data.token }; 
      
    } catch (error) {
      const actualError = error.response?.data ? JSON.stringify(error.response.data) : error.message;
      console.error(`Judge0 API Submission Error for ${langKey}:`, actualError);
      throw new Error("Failed to submit to Judge0");
    }
  });

  return await Promise.all(executionPromises);
}


// Now actually polls Judge0 instead of reading a mock cache
export async function pollBatchResults(tokens) {
  if (!tokens || tokens.length === 0) return [];

  try {
    // Judge0's Batch GET endpoint takes a comma-separated list of tokens
    const url = `http://localhost:2358/submissions/batch?tokens=${tokens.join(",")}&base64_encoded=true`;
    
    const { data } = await axios.get(url);

    // Map the Judge0 response to match the shape your frontend expects
    const results = data.submissions.map((sub) => ({
      stdout: decodeBase64(sub.stdout),
      stderr: decodeBase64(sub.stderr),
      compile_output: decodeBase64(sub.compile_output),
      status: { description: sub.status?.description || "Processing" },
      time: sub.time,
      memory: sub.memory // Judge0 tracks memory natively!
    }));

    return results;

  } catch (error) {
    const actualError = error.response?.data ? JSON.stringify(error.response.data) : error.message;
    console.error("Judge0 Polling Error:", actualError);
    
    // Return a safe fallback so the frontend doesn't crash
    return tokens.map(() => ({
      stdout: null,
      stderr: "Failed to communicate with Judge0",
      compile_output: null,
      status: { description: "Internal Error" },
      time: null,
      memory: null
    }));
  }
}