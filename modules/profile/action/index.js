"use server";

import { prisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { includes } from "zod";


export const getCurrentUser = async () => {
    try {
        const user = await currentUser();
        const data = await prisma.user.findUnique({
            where: {
                clerkId: user.id
            },
            include:{
                submissions: true,
                solvedProblems: true,
                playlists: true
            }
          
        })
        return data;
    } catch (error) {
        console.error("❌ Error fetching user:", error);
        return { success: false, error: "Failed to fetch user" };
    }
};