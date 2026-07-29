import axios from "axios";

export function getJudge0laguageId(language: string) {
    const languageMap = {
        "PYTHON": { language: "python", version: "3.10.0" },
        "JAVASCRIPT": { language: "javascript", version: "18.15.0" },
        "C": { language: "c++", version: "10.2.0" }
    };
    return languageMap[language.toUpperCase() as keyof typeof languageMap];
}

export async function submitBatch(submissions: any[]) {
    // Piston executes synchronously, so we run all submissions in parallel using Promise.all
    const executionPromises = submissions.map(async (sub) => {
        const options = {
    method: 'POST',
    url: 'http://localhost:2000/api/v2/execute',
    headers: {
        'Content-Type': 'application/json'
    },
    data: {
        language: sub.language,
        version: sub.version,
        files: [
            {
                // Ensure Java gets a capitalized Main.java if that's what the class is named
                name: sub.language === "java" ? "Main.java" : (sub.name || "main"),
                content: sub.source_code
            }
        ],
        // FORCE a newline so Java's Scanner.nextLine() doesn't hang waiting for an EOF
        stdin: (sub.stdin || "") + "\n", 
        
    }
};console.log("FINAL JAVA PAYLOAD:\n", sub.source_code);

       try {
    const { data } = await axios.request(options);

    // 1. Check for Compilation Errors first
    if (data.compile && data.compile.code !== 0) {
        return {
            stdout: "",
            stderr: data.compile.stderr, // This will show Java syntax errors
            exit_code: data.compile.code,
            status: { id: 6, description: "Compilation Error" } // Standard Judge0 ID
        };
    }

    // 2. Check for actual Timeouts (Piston sends SIGKILL when killed by timeout)
    if (data.run.signal === "SIGKILL") {
        return {
            stdout: data.run.stdout,
            stderr: data.run.stderr || "Process killed (Timeout)",
            exit_code: null,
            status: { id: 5, description: "Time Limit Exceeded" } // Standard Judge0 ID
        };
    }

    // 3. Check for Runtime Errors (Exceptions, crashes, etc.)
    if (data.run.code !== 0) {
        return {
            stdout: data.run.stdout,
            stderr: data.run.stderr, // This will show Java Stack Traces (e.g., ArrayIndexOutOfBounds)
            exit_code: data.run.code,
            status: { id: 11, description: "Runtime Error" } // Standard Judge0 ID
        };
    }

    // 4. Success
    return {
        stdout: data.run.stdout,
        stderr: data.run.stderr,
        exit_code: 0,
        status: { id: 3, description: "Accepted" } // Standard Judge0 ID
    };

} catch (error: any) {
    const actualError = error.response?.data 
        ? JSON.stringify(error.response.data) 
        : error.message;

    console.error(`Piston API Error for ${sub.language}:`, actualError);

    return {
        stdout: "",
        stderr: actualError,
        exit_code: 1,
        status: { id: 13, description: "Internal Error" }
    };
}

    
});const results = await Promise.all(executionPromises);
    return results;}

// Since Piston is synchronous and returns results instantly, 
// pollBatchResults is no longer needed, but kept as a passthrough wrapper if your frontend expects it.
//export async function pollBatchResults(tokens: string[]) {
    // Piston doesn't use tokens; submitBatch already returns completed results.
    //return tokens;
//}
//@
//export const sleep = (ms: any) => new Promise((resolve) => setTimeout(resolve, ms))
