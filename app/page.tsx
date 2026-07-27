import Image from "next/image";
import {Button} from "@/components/ui/button";
import { redirect } from 'next/navigation'
import { UserButton } from "@clerk/nextjs";
import { auth } from '@clerk/nextjs/server';
import { ClerkProvider } from '@clerk/nextjs';
import { onboardUser } from "@/modules/auth/actions";

export default async function Home() {
  const { userId } = await auth()
  if (!userId) {
    redirect('/sign-in')
  }
  

  return (
    <ClerkProvider>
    <main style={{ padding: '2rem' }}>
      <h1>Welcome to the App!</h1>
      <p>You are successfully logged in.</p>
      <UserButton />
    </main>
    </ClerkProvider>
  )
}
