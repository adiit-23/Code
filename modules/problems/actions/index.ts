"use server";
import {prisma} from '@/lib/db';
import { UserRole } from '@/lib/generated/prisma/enums';
import { getCurrentUserData } from '@/modules/auth/actions';
import { currentUser } from '@clerk/nextjs/server';
import { success } from 'zod';
import { revalidatePath } from "next/cache";

export const getAllProblems= async()=>{
    try {
        const user= await getCurrentUserData();
        const data=await prisma.problem.findMany({
            orderBy:{
                createdAt:"desc",
            }
        });
        return {success:true,data:data}
    } catch (error) {
        console.log("error is ",error);
        return {success:false,error:"failed to fetch problems"};
    }
}
export const addProblemToPlaylist = async () => {
    
}
export const createPlaylist = async () => {
    
}
export const deleteProblem = async () => {
    
}
export const getProblemById = async(id:string) => {
    try {
        const problem = await prisma.problem.findUnique({
            where: {
                id: id,
            },
        });
        return { success: true, data: problem };
    } catch (error) {
        console.error("❌ Error fetching problem:", error);
        return { success: false, error: "Failed to fetch problem" };
    }
}