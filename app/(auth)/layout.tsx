import React from 'react'

const AuthLayout = ({children}:{children:React.ReactNode}) => {
  return (
    <div className='flex felx-col items-center justify-center h-screen'>
      {children}
    </div>
  )
}

export default AuthLayout
