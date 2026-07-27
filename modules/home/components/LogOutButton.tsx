"use client";

import { useClerk } from "@clerk/nextjs";

export default function LogOutButton() {
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    // 1. Destroy the Clerk session completely
    await signOut();
    
    // 2. Force a hard browser redirect to the sign-in page. 
    // This bypasses the Next.js router freeze completely.
    window.location.href = "/sign-in";
  };

  return (
    <button onClick={handleSignOut} className="px-4 py-2 bg-red-500 text-white rounded-md">
      Sign Out
    </button>
  );
}