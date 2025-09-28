import React from 'react'
import Button from '../../components/ui/button'
import { assets } from '../../assets/assets'
import { Link } from 'react-router-dom';

const LogIn = () => {
  return (
    <div >
      {/* Background decorative element - purely visual */}
      <div aria-hidden="true" className='absolute w-350 h-250 left-35 bg-cover bg-center z-[-10] pointer-events-none' style={{backgroundImage: "url('../src/assets/svg/Group_92.svg')"}} />
      
      {/* Page heading */}
      <h2 className='absolute top-10 font-poppins text-2xl ml-193'>Welcome, To  <span className='text-blue-500 font-semibold'>HiLCoE RMS Login</span></h2>
      <h2 className='absolute top-20 font-poppins font-light text-xl ml-190 text-center w-100'>Simplifying Academic Research Management System</h2>
      
      {/* Login Form - BACKEND DEVELOPER: This form needs to connect to your authentication endpoint */}
      <form action="" className='absolute bg-white items-center justify-center ml-170 mt-40 rounded-xl shadow-md border z-0 border-gray-100 pl-8 pr-14 pt-8 h-150'>
        
        {/* Email Input Field */}
        <h3 className='pl-5 pt-4 font-poppins font-medium text-sm text-gray-700'>Email </h3>
        {/* BACKEND: This field should be validated as email format on both frontend and backend */}
        <input
          type="email"
          placeholder="example@gmail.com"
          className="border-1 rounded-md focus:ring-1 focus:ring-blue-200 p-2 ml-5 mt-3 w-110"
        />

        {/* Password Input Field */}
        <h3 className="pl-5 pt-4 font-poppins font-medium text-sm text-gray-700">Password</h3>
        {/* BACKEND: This should be sent securely (HTTPS) and validated for strength requirements */}
        <input
          type="password"
          placeholder="Enter Password"
          className="border-1 rounded-md focus:ring-1 focus:ring-blue-200 p-2 ml-5 mt-3 w-110"
        />

        <div className="flex items-center justify-between ml-5 mt-3 w-110">
          <label className="flex items-center gap-2 text-sm font-poppins">
            <input type="checkbox" className="accent-blue-500" />
            Remember me
          </label>
          <Link to="" className="text-blue-500 text-sm font-poppins font-bold hover:underline">
            Forgot password?
          </Link>
        </div>
        {/* BACKEND: This button should trigger a POST request to /api/auth/login */}
        {/* Expected payload: { email: string, password: string } */}
        {/* Expected response: { success: boolean, token: string, user: object } or error message */}
        <Button caption="Login" className='mt-10 ml-5 w-110  bg-blue-500 text-white rounded-md px-7 py-3 text-xl' />
        
        {/* Visual separators */}
        <hr className='absolute w-30 ml-5 mt-10'/>
        <hr className='absolute w-30 ml-85 mt-10'/>
        <h5 className='ml-5 mt-7 text-center text-gray-500'>Or continue with</h5>
        
        {/* Social Login Options */}
        <div className='flex gap-4 mt-10 ml-5'>
          {/* Google OAuth Login */}
          {/* BACKEND: This should redirect to Google OAuth endpoint */}
          {/* Expected flow: Frontend redirects to backend OAuth URL → Google auth → Callback to backend → Redirect with token */}
          <Button className='w-53 bg-gray-100 border border-gray-400 text-black rounded-md px-7 py-3 text-md flex items-center gap-3 justify-center'>
            <img src={assets.google} alt="Google" className='w-5 h-5' />
            <span className='font-poppins font-medium text-sm'>Google</span>
          </Button>
          
          {/* GitHub OAuth Login */}
          {/* BACKEND: Similar flow to Google OAuth but with GitHub endpoints */}
          <Button className='w-53 bg-gray-100 border border-gray-400 text-black rounded-md px-7 py-3 text-md flex items-center gap-3 justify-center'>
            <img src={assets.github} alt="GitHub" className='w-5 h-5' />
            <span className='font-poppins font-medium text-sm'>GitHub</span>
          </Button>
        </div>
        
        {/* Navigation links */}
        <h5 className='font-medium ml-10 mt-8 text-center'>Don't have an account? <Link to='/signup' className='text-blue-500 font-bold'>Sign up </Link></h5>
        <h5 className='font-medium ml-10 mt-1 text-center'>Or Check Verification <Link to='/verify' className='text-blue-500 font-bold'>Verify </Link></h5>
      </form>
    </div>
  )
}

export default LogIn