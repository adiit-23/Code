import Image from "next/image";
import {Button} from "@/components/ui/button";
import { redirect } from 'next/navigation'
import { UserButton } from "@clerk/nextjs";
import { auth } from '@clerk/nextjs/server'

export default async function Home() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Welcome to the App!</h1>
      <p>You are successfully logged in.</p>
      <UserButton />
    </main>
  )
}
