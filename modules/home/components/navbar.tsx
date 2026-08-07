import React from 'react'
import { UserRole } from '@prisma/client'
import { Button } from "@/components/ui/button";
import { Flame } from "lucide-react";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { ModeToggle } from '@/components/ui/mode-toggle';
import { getCurrentStreak } from "@/lib/streak";
async function Navbar() {
  const { userId } = await auth(); 
  
  let userRole = null;
  let streakCount = 0;

  if (userId) {
    const dbUser = await prisma.user.findUnique({
      where: {
        clerkId: userId, 
      },
      select: {
        role: true,
        streak: true,
        lastSubmissionDate: true,
      },
    });

    if (dbUser) {
    userRole = dbUser.role;
    streakCount = getCurrentStreak(dbUser); // Returns 0 if streak expired, or dbUser.streak if active
  }
  }

  // Redirect target for protected routes when signed out
  const problemHref = userId ? "/problem" : "/sign-in";
  const profileHref = userId ? "/profile" : "/sign-in";

  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-5xl px-4">
      <div className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-lg border border-slate-200/50 dark:border-slate-700/50 rounded-full shadow-lg shadow-indigo-900/5 transition-all duration-300">
        <div className="px-6 py-3 flex justify-between items-center">
          
          <Link href={"/"} className="flex items-center gap-2 group">
            <Image 
              src={"/logo.svg"} 
              alt="Code Logo" 
              width={40} 
              height={40} 
              className="group-hover:scale-105 transition-transform duration-200" 
            />
            <span className="font-bold text-2xl tracking-tight text-indigo-600 dark:text-indigo-400">
              Code
            </span>
          </Link>

          <div className="hidden md:flex flex-row items-center justify-center gap-x-8">
            <Link
              href={problemHref}
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
              href={profileHref}
              className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Profile
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <ModeToggle />
            
            {userId ? (
              <div className="flex items-center gap-6">
                {/* Streak Counter */}
                <div className="flex items-center gap-1.5 font-bold text-orange-500" title={`${streakCount} day streak!`}>
                  <Flame className="h-5 w-5 fill-current" />
                  <span>{streakCount}</span>
                </div>
                
                {userRole === UserRole.ADMIN && (
                  <Button asChild variant="outline" size="default" className="rounded-full">
                    <Link href="/create-problem">Create Problems</Link>
                  </Button>
                )}
                <UserButton />
              </div>
            ) : (
              <div className="flex gap-2 items-center">
                <SignInButton mode="modal">
                  <Button variant="ghost" className="rounded-full font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600">
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors text-white rounded-full font-medium text-sm h-10 px-5 cursor-pointer shadow-sm">
                    Sign Up
                  </button>
                </SignUpButton>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}

export default Navbar;