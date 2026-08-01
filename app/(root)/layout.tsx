import React from 'react'
import  Navbar  from "@/modules/home/components/navbar"
import { currentUser } from '@clerk/nextjs/server'
import { currentUserRole } from '@/modules/auth/actions'


const rootLayout = async ({children}:{children:React.ReactNode}) => {
    const userRole=await currentUserRole();
  return (
    <main className='flex flex-col min-h-screen'>

        <Navbar></Navbar>
        
     {children} 
    </main>
  )
}

export default rootLayout
