import React from 'react'
import  Navbar  from "@/modules/home/components/navbar"
import { currentUser } from '@clerk/nextjs/server'
import { currentUserRole } from '@/modules/auth/actions'


const rootLayout = async ({children}:{children:React.ReactNode}) => {
    const userRole=await currentUserRole();
  return (
    <main className='flex flex-col min-h-screen'>

        <Navbar userRole={userRole}></Navbar>
        <div className="absolute inset-0 -z-10 h-full w-full bg-slate-50 dark:bg-slate-950 bg-[radial-gradient(#c7d2fe_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] bg-[size:20px_20px]">
  <div className="absolute inset-0 bg-gradient-to-br from-rose-100/20 via-transparent to-indigo-100/20 dark:from-slate-900/50 dark:to-slate-950/50 pointer-events-none" />

     {children} </div>
    </main>
  )
}

export default rootLayout
