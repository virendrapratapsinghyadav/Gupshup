import React from 'react'
import { LoaderIcon } from "react-hot-toast";


const PageLoader = () => {
  return (
    <div className='flex items-center justify-center h-screen'>
      <LoaderIcon className='size-10 animate-spin' />
    </div>
  )
}

export default PageLoader
