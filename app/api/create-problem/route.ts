import { UserRole } from "@prisma/client";
import { currentUserRole, getCurrentUserData } from "@/modules/auth/actions";
import { CurrencyBtcIcon } from "@phosphor-icons/react";
import { NextRequest, NextResponse } from "next/server";
import { getJudge0laguageId, submitBatch, pollBatchResults } from "@/lib/judge0"; 
import { Source_Code_Pro } from "next/font/google";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
    try {
        const userRole = await currentUserRole();
        const user = await getCurrentUserData();
        
        console.log("CURRENT USER OBJECT:", user);
        
        if (!user || !("id" in user)){
            return NextResponse.json({ error: "User not found" }, { status: 401 });
        }
        
        const userId = (user as { id: string }).id;
        
        if (userRole !== UserRole.ADMIN){
            return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
        }
        
        const {
            title, description, difficulty, tags, examples, constraints, testCases, codeSnippets, referenceSolutions
        } = await request.json();
        
        if (!title || !description || !difficulty || !testCases || !codeSnippets || !referenceSolutions){
             return NextResponse.json({ error: "Missing Required Fields" }, { status: 400 });
        }
        
        if (!Array.isArray(testCases) || testCases.length === 0){
             return NextResponse.json({ error: "At least one test case is required" }, { status: 400 });
        }

        for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
            // 1. getJudge0laguageId now returns a direct number (e.g., 93) instead of an object
            const languageId = getJudge0laguageId(language);
            
            if (!languageId) {
                return NextResponse.json({ error: `Unsupported language: ${language}` }, { status: 400 });
            }
            
            // 2. Format submissions for Judge0
            const submissions = testCases.map(({ input, output }) => ({
                source_code: solutionCode,
                language_id: languageId,
                stdin: input,
                expected_output: output 
            }));
            
            // 3. Submit to Judge0 to get the execution tokens
            const submitResponse = await submitBatch(submissions);
            const tokens = submitResponse.map((res:any) => res.token);
            
            // 4. THE POLLING LOOP: Wait for Judge0 workers to finish evaluating
            let results: any[] = [];
            let isFinished = false;
            let attempts = 0;
            const MAX_ATTEMPTS = 15; // 15 seconds maximum wait time
            
            while (!isFinished && attempts < MAX_ATTEMPTS) {
                // Wait 1 second between checks
                await new Promise(resolve => setTimeout(resolve, 1000)); 
                
                results = await pollBatchResults(tokens);
                
                // Check if ALL submissions have finished processing
                isFinished = results.every((r: any) => 
                    r.status.description !== "Processing" && r.status.description !== "In Queue"
                );
                attempts++;
            }

            if (!isFinished) {
                return NextResponse.json({ error: `Judge0 execution timed out for ${language}` }, { status: 504 });
            }

            // 5. Validate the completed results
            console.log(`Results for ${language}:`, results);
            
            for (let i = 0; i < results.length; i++) {
                const result = results[i];
                const expectedOutput = submissions[i].expected_output.trim();
                const actualOutput = (result.stdout || "").trim();

                // If Judge0 crashed/timed out, OR if our manual string validation fails
                if (result.status.description !== "Accepted" || actualOutput !== expectedOutput) {
                    return NextResponse.json({
                        error: `Validation for ${language} failed`,
                        testCase: {
                            input: submissions[i].stdin,
                            expectedOutput: expectedOutput,
                            actualOutput: actualOutput,
                            error: result.stderr || result.compile_output || "Wrong Answer",
                        },
                        details: result,
                    }, { status: 400 });
                }
            }
        }
        
        // 6. Save to DB if everything passes
        const newProblem = await prisma.problem.create({
            data: {
                title, description, difficulty, tags, examples, constraints, testCases, codeSnippets, referenceSolutions,
                userId: userId,
            }
        });
        
        return NextResponse.json({
            success: true,
            message: "Problem created successfully",
            data: newProblem
        }, { status: 201 });

    } catch (error) {
        console.log("Database Error ", error);
        return NextResponse.json({ error: "Failed to save problem to the database" }, { status: 500 });
    }
}