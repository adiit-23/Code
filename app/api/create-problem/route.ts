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

        // Helper to strip all whitespace for foolproof fallback comparison
        const normalize = (str: string) => (str || "").replace(/\s+/g, "").trim();

        for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
            const languageId = getJudge0laguageId(language);
            
            if (!languageId) {
                return NextResponse.json({ error: `Unsupported language: ${language}` }, { status: 400 });
            }
            
            // 1. Format submissions
            const submissions = testCases.map(({ input, output }) => ({
                source_code: solutionCode as string,
                language_id: languageId,
                stdin: input,
                expected_output: output 
            }));
            
            // 2. Submit batch to Judge0
            const submitResponse = await submitBatch(submissions);
            const tokens = submitResponse.map((res: any) => res.token);
            
            // 3. Poll results (pollBatchResults handles waiting internally)
            const results = await pollBatchResults(tokens);

            if (!results || results.length === 0) {
                return NextResponse.json({ error: `Judge0 execution failed for ${language}` }, { status: 500 });
            }

            console.log(`Results for ${language}:`, results);
            
            // 4. Validate results
            for (let i = 0; i < results.length; i++) {
                const result = results[i];
                const expectedOutput = String(submissions[i].expected_output || "").trim();
                const actualOutput = String(result.stdout || "").trim();

                const isAcceptedByJudge0 = result.status?.id === 3 || result.status?.description === "Accepted";
                const isNormalizedMatch = normalize(actualOutput) === normalize(expectedOutput);

                // Pass if Judge0 accepted it OR normalized outputs match
                if (!isAcceptedByJudge0 && !isNormalizedMatch) {
                    return NextResponse.json({
                        error: `Validation for ${language} failed`,
                        testCase: {
                            input: submissions[i].stdin,
                            expectedOutput: expectedOutput,
                            actualOutput: actualOutput,
                            error: result.stderr || result.compile_output || result.status?.description || "Wrong Answer",
                        },
                        details: result,
                    }, { status: 400 });
                }
            }
        }
        
        // 5. Save verified problem to Database
        const newProblem = await prisma.problem.create({
            data: {
                title, 
                description, 
                difficulty, 
                tags, 
                examples, 
                constraints, 
                testCases, 
                codeSnippets, 
                referenceSolutions,
                userId: userId,
            }
        });
        
        return NextResponse.json({
            success: true,
            message: "Problem created successfully",
            data: newProblem
        }, { status: 201 });

    } catch (error) {
        console.log("Database Error:", error);
        return NextResponse.json({ error: "Failed to save problem to the database" }, { status: 500 });
    }
}