import React from 'react'
import { ThemeProvider } from "@/providers/theme-provider"

export const dynamic = "force-dynamic";

const AuthLayout = ({children}:{children:React.ReactNode}) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      {children}
    </div>
  )
}

export default AuthLayout
