import { UserRole } from "@/lib/generated/prisma/enums";
import { currentUserRole, getCurrentUserData } from "@/modules/auth/actions";
import { CurrencyBtcIcon } from "@phosphor-icons/react";
import { NextRequest, NextResponse } from "next/server";
import { getJudge0laguageId, pollBatchResults, submitBatch } from "@/lib/judge0";
import { Source_Code_Pro } from "next/font/google";
import {prisma} from "@/lib/db";

export async function POST(request:NextRequest) {
    try {
        const userRole= await currentUserRole();
        const user= await getCurrentUserData();
        if (!user){
            return NextResponse.json({error:"User not found"})
        }
        if (userRole!=UserRole.ADMIN){
            return NextResponse.json({error:"Unauthorised"},{status:401})
        }
        const {
            title,description,difficulty,tags,examples,constraints,testCases,codeSnippets,referenceSolutions
        }=await request.json()
        if (!title||!description||!difficulty||!testCases||!codeSnippets||!referenceSolutions){
             return NextResponse.json({error:"Missiong Required Fields"},{status:400})
        }
        if (!Array.isArray(testCases)||testCases.length===0){
             return NextResponse.json({error:"At least one test case is required"},{status:400})
        }
        for (const [language,solutionCode] of Object.entries(referenceSolutions))
        {
            const languageId=getJudge0laguageId(language);
            const submissions=testCases.map(({input,output})=>({
                source_code:solutionCode,
                language_id:languageId,
                stdin:input,
                expected_output:output
            }))
            const submissionsResults=await submitBatch(submissions);
            const tokens=submissionsResults.map((res:any)=>res.token);
            const results=await pollBatchResults(tokens)
            for (let i=0;i<results.length;i++){
                const result=results[i];
                if (result.status.id!=3){
                    return NextResponse.json(
                        {error:`Validation for ${language} failed`,
                        testCase:{
                            input:submissions[i].stdin,
                            expectedOutput:submissions[i].expected_output,
                            actualOutput:result.stdout,
                            error:result.stderr||result.compile_output,
                        },
                        details:result,

                        },
                        {status:400})
                }
            }
        }
        const newProblem=await prisma.problem.create({
            data:{
                title,description,difficulty,tags,examples,constraints,testCases,codeSnippets,referenceSolutions,
                //@ts-ignore
                userId:user.id
            }
        })
        return NextResponse.json({
            success:true,
            message:"Problem created successfully",
            data:newProblem
        },{status:201})

    } catch (error) {
        console.log("Database Error ",error);
        return NextResponse.json({error:"Failed to save problem to the database"},{status:500})
    }
}