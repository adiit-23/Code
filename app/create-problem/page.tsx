import { UserRole } from '@/lib/generated/prisma/enums';
import { getCurrentUserData } from '@/modules/auth/actions';
import { Button } from '@/components/ui/button';
import { currentUser } from '@clerk/nextjs/server'
import { ArrowLeftCircleIcon } from 'lucide-react';
import { redirect } from 'next/navigation';
import React from 'react';
import  Link  from 'next/link';
import { ModeToggle } from '@/components/ui/mode-toggle';
import CreateProblemForm from '@/modules/problems/components/create-problem-for';

const CreateProblemPage = async () => {
    const user=await getCurrentUserData();
    // @ts-ignore
    if(user?.role!==UserRole.ADMIN){
        redirect("/");
    }
    return (
    <section className='flex flex-col items-center justify-center mx-4 my-4'>
      <div className='flex flex-row justify-between w-full'>
        <Link href={'/'}>
        <Button variant={'outline'} size={"icon"}>
            <ArrowLeftCircleIcon className='size-4'/>
        </Button>
        </Link>
        <h1 className='text 10xl font-bold text-violet-400'>Welcome ADMIN!</h1>
      <ModeToggle/>
      </div>
        <CreateProblemForm/>
    </section>
  )
}

export default CreateProblemPage
