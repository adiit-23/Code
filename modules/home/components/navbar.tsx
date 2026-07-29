import React from 'react'
import { UserRole } from '@/lib/generated/prisma/enums'
import { Button } from "@/components/ui/button";

import { SignInButton, SignUpButton, UserButton ,Show} from "@clerk/nextjs";
import { currentUser,auth } from "@clerk/nextjs/server";
import {prisma} from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { ModeToggle } from '@/components/ui/mode-toggle';

async function Navbar() {
  const { userId } = await auth(); 

  let userRole = null;

  // 2. If they are logged in, fetch their role from your database
  if (userId) {
    const dbUser = await prisma.user.findUnique({
      where: {
        // Change this if you use a different field name for the Clerk ID (e.g., clerkId: userId)
        clerkId: userId, 
      },
      select: {
        role: true, // Only fetch the role to keep the query fast
      },
    });

    userRole = dbUser?.role;
  }

  return (
    <>
      <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-5xl px-4">
      
      <div className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-lg border border-slate-200/50 dark:border-slate-700/50 rounded-full shadow-lg shadow-indigo-900/5 transition-all duration-300">
        <div className="px-6 py-3 flex justify-between items-center">
          
          <Link href={"/"} className="flex items-center gap-2 group">
            <Image 
              src={"/logo.svg"} 
              alt="TreeBio" 
              width={40} 
              height={40} 
              className="group-hover:scale-105 transition-transform duration-200" 
            />
            {/* Shifted text color to Indigo */}
            <span className="font-bold text-2xl tracking-tight text-indigo-600 dark:text-indigo-400">
              Code
            </span>
          </Link>

          {/* Increased gap, changed text to slate, and added smooth transition colors */}
          <div className="hidden md:flex flex-row items-center justify-center gap-x-8">
            <Link
              href="/problems"
              className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Problems
            </Link>
            <Link
              href="/about"
              className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              About
            </Link>
            <Link
              href="/profile"
              className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Profile
            </Link>
          </div>
          <ModeToggle />
          {userId ? (
            <>
              {userRole === UserRole.ADMIN ? (
                <Button asChild variant="outline" size="default">
                  <Link href="/create-problem">Create Problems</Link>
                </Button>
              ) : null}
              <UserButton />
            </>
          ) : (
            <>
              <SignInButton />
              <SignUpButton>
                <button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
                  Sign Up
                </button>
              </SignUpButton>
            </>
          )}
        </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;


