import React from 'react'
import Button from '../../components/ui/button'
import { assets } from '../../assets/assets'
import { Link } from 'react-router-dom';

const SignUp = () => {
  return (
    <div>
      {/* Background decorative element - purely visual */}
      <div aria-hidden="true" className='absolute w-488 h-287  left-0 top-0 bg-cover bg-bottom z-[-10] pointer-events-none' style={{backgroundImage: "url('../src/assets/svg/Group_93.svg')"}} />
      
      {/* Page heading */}
      <h2 className='absolute top-10 font-poppins text-2xl text-center ml-180'>Welcome, To  <span className='text-blue-500 font-semibold'>HiLCoE RMS Account Creation</span></h2>
      <h2 className='absolute top-20 font-poppins font-light text-xl ml-195 text-center w-100'>Simplifying Academic Research Management System</h2>
      
      {/* Registration Form - BACKEND DEVELOPER: This form needs to connect to your user registration endpoint */}
      <form action="" className='bg-white items-center justify-center ml-130 mr-120 mt-40 pr-20 rounded-xl shadow-md border z-10 border-gray-100 p-6 h-158'>
        
        {/* Name Fields Section */}
        <div className='flex gap-4'>
          <div className='flex-1'>
            <h3 className='pl-5 pt-4 font-poppins font-medium text-sm text-gray-700'>First Name</h3>
            {/* BACKEND: Required field, validate for alphabetic characters only */}
            <input type="text" placeholder='Enter First Name' className='border-1 rounded-md focus:ring-1 focus:ring-blue-200 p-2 ml-5 mt-3 w-full' />
          </div>
          <div className='flex-1'>
            <h3 className='pl-5 pt-4 font-poppins font-medium text-sm text-gray-700'>Middle Name</h3>
            {/* BACKEND: Optional field, can be empty */}
            <input type="text" placeholder='Enter Middle Name' className='border-1 rounded-md focus:ring-1 focus:ring-blue-200 p-2 ml-5 mt-3 w-full' />
          </div>
          <div className='flex-1'>
            <h3 className='pl-5 pt-4 font-poppins font-medium text-sm text-gray-700'>Last Name</h3>
            {/* BACKEND: Required field, validate for alphabetic characters only */}
            <input type="text" placeholder='Enter last Name' className='border-1 rounded-md focus:ring-1 focus:ring-blue-200 p-2 ml-5 mt-3 w-full' />
          </div>
        </div>
        
        {/* Contact Information Section */}
        <div className='flex gap-1'>
          <div className='flex-1'>
            <h3 className='pl-5 pt-4 font-poppins font-medium text-sm text-gray-700'>Email</h3>
            {/* BACKEND: Required field, validate email format and check for uniqueness in database */}
            <input type="email" placeholder='example@gmail.com' className='border-1 rounded-md focus:ring-1 focus:ring-blue-200 p-2 ml-5 mt-3 w-99' />
          </div>
          <div className='flex-2'>
            <h3 className='pl-5 pt-4 font-poppins font-medium text-sm text-gray-700'>Phone Number</h3>
            {/* BACKEND: Validate phone number format (Ethiopian format: +251 XXX XXX XXX) */}
            <input type="text" placeholder='(+251) xxx-xxx-xxx' className='border-1 rounded-md focus:ring-1 focus:ring-blue-200 p-2 ml-5 mt-3 w-99' />
          </div>
        </div>
        
        {/* Password Section */}
        <div className='flex gap-1'>
          <div className='flex-1'>
            <h3 className='pl-5 pt-4 font-poppins font-medium text-sm text-gray-700'>Password</h3>
            {/* BACKEND: Enforce password strength requirements (min 8 chars, special characters, etc.) */}
            <input type="password" placeholder='Enter Password' className='border-1 rounded-md focus:ring-1 focus:ring-blue-200 p-2 ml-5 mt-3 w-99' />
          </div>
          <div className='flex-2'>
            <h3 className='pl-5 pt-4 font-poppins font-medium text-sm text-gray-700'>Confirm</h3>
            {/* BACKEND: Verify that password and confirm password match on both frontend and backend */}
            <input type="password" placeholder='Re-Enter Password' className='border-1 rounded-md focus:ring-1 focus:ring-blue-200 p-2 ml-5 mt-3 w-99' />
          </div>
        </div>
        
        {/* Main Sign Up Button */}
        {/* BACKEND: This button should trigger a POST request to /api/auth/register */}
        {/* Expected payload: { firstName, middleName, lastName, email, phone, password, confirmPassword } */}
        {/* Expected response: { success: boolean, message: string, userId: string } */}
        <Button caption="Sign Up" className='mt-10 ml-50 w-120  bg-blue-500 text-white rounded-md px-7 py-3 text-xl' />
        
        {/* Visual separators */}
        <hr className='absolute w-40 ml-51 mt-10'/>
        <hr className='absolute w-40 ml-129 mt-10'/>
        <h5 className='ml-20 mt-7 text-center text-gray-500'>Or continue with</h5>
        
        {/* Social Sign Up Options */}
        <div className='flex gap-4 mt-5 ml-50'>
          {/* Google OAuth Registration */}
          {/* BACKEND: Similar to login but should handle new user registration flow */}
          <Button className='w-58 bg-gray-100 border border-gray-400 text-black rounded-md px-7 py-3 text-md flex items-center gap-3 justify-center'>
            <img src={assets.google} alt="Google" className='w-6 h-6' />
            <span className='font-poppins font-medium text-sm'>Sign up with Google</span>
          </Button>
          
          {/* GitHub OAuth Registration */}
          {/* BACKEND: Handle GitHub OAuth registration flow */}
          <Button className='w-58 bg-gray-100 border border-gray-400 text-black rounded-md px-7 py-3 text-md flex items-center gap-3 justify-center'>
            <img src={assets.github} alt="GitHub" className='w-6 h-6' />
            <span className='font-poppins font-medium text-sm'>Sign up with GitHub</span>
          </Button>
        </div>
        
        {/* Navigation links */}
        <h5 className='font-medium ml-20 mt-8 text-center'>Already have an account? <Link to='/login' className='text-blue-500 font-bold'>Login </Link></h5>
        <h5 className='font-medium ml-20 mt-1 text-center'>Or Check Verification <Link to='/verify' className='text-blue-500 font-bold'>Verify </Link></h5>
      </form>
    </div>
  )
}

export default SignUp