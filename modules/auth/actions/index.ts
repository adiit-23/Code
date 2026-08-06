"use server";
import { prisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";


export const onboardUser= async()=>{
    try{
        const user=await currentUser();
        if (!user){
            return { success:false, error:"No Authenticated User Found"}
        }
        const {id , firstName, lastName, imageUrl, emailAddresses}=user;
        const newUser= await prisma.user.upsert({
            where:{
                clerkId:id,

            },update:{
                firstName:firstName||null,
                lastName:lastName||null,
                imageUrl:imageUrl||null,
                email:emailAddresses[0].emailAddress|| "",

            },create:{
                clerkId:id,
                firstName:firstName||null,
                lastName:lastName||null,
                imageUrl:imageUrl||null,
                email:emailAddresses[0].emailAddress|| "",
            }
        });
    }
    catch(e){
        console.log(e)
    }
}
export const currentUserRole= async()=>{
    try{
        const user=await currentUser();
        if (!user){
            return{ success:false, error:"No Authenticated User Found"}
        }
        const {id }=user;
        const userRole= await prisma.user.findUnique({
            where:{
                clerkId:id
            },
            select:{
                    role:true,
            }
        }) 
        return userRole?.role;
    }
    catch(e){
        console.log('====================================');
        console.log(e);
        console.log('====================================');
    }
}
export const getCurrentUserData= async()=>{
  try{
        const user=await currentUser();
        if (!user){
            return { success:false, error:"No Authenticated User Found"}
        }
        const data = await prisma.user.findUnique({
  where: {
    clerkId: user?.id,
  },
  include: {
    submissions: {
      include: {
        problem: {
          select: {
            title: true, // Joins Problem table to grab the title
          },
        },
      },
      orderBy: {
        createdAt: "desc", // Automatically orders newest submissions first
      },
    },
    solvedProblems: true,
    playlists: true,
  },
}); 
        console.log(data);
        return data;
    }
    catch(e){
        console.log('====================================');
        console.log(e);
        console.log('====================================');
    } 
//}
//**/
}
