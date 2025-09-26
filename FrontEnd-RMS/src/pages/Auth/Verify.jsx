import React from 'react'
import Button from '../../components/ui/button'
import { LogIn } from 'lucide-react'
import { Link } from 'react-router-dom';

const Verify = () => {
  return (
    <div className='font-poppins'>
        {/* Background decorative element - purely visual */}
        <div aria-hidden="true" className='absolute w-350 h-250 left-35 bg-cover bg-center z-[-10] pointer-events-none' style={{backgroundImage: "url('../src/assets/svg/Group_92.svg')"}} />
        
        {/* Page heading */}
        <h2 className='absolute top-10 font-poppins text-2xl ml-180'>Welcome, To  <span className='text-blue-500 font-semibold'>HiLCoE RMS Verification</span></h2>
        <h2 className='absolute top-20 font-poppins font-light text-xl ml-190 text-center w-100'>Simplifying Academic Research Management System</h2>
        
        {/* Verification Form - BACKEND DEVELOPER: This appears to be for student identity verification */}
        <form action="" className='absolute bg-white items-center justify-center ml-170 mr-170 mt-40 rounded-xl shadow-md border z-0 border-gray-100 p-6 h-165'>
            
            {/* Student Identity Verification Fields */}
            <h3 className='pl-5 pt-4 font-poppins font-medium text-sm text-gray-700'>First Name</h3>
            {/* BACKEND: Validate against student records database */}
            <input type="text" placeholder='Enter First Name' className='border-1  rounded-md focus:ring-1 focus:ring-blue-200 p-2 ml-5 mt-3 w-110' />
            
            <h3 className='pl-5 pt-4 font-poppins font-medium text-sm text-gray-700'>Middle Name</h3>
            {/* BACKEND: Optional field, match against student records if provided */}
            <input type="text" placeholder='Enter Middle Name' className='border-1 rounded-md focus:ring-1 focus:ring-blue-200 p-2 ml-5 mt-3 w-110' />
            
            <h3 className='pl-5 pt-4 font-poppins font-medium text-sm text-gray-700'>Last Name</h3>
            {/* BACKEND: Validate against student records database */}
            <input type="text" placeholder='Enter last Name' className='border-1 rounded-md focus:ring-1 focus:ring-blue-200 p-2 ml-5 mt-3 w-110' />
            
            <h3 className='pl-5 pt-4 font-poppins font-medium text-sm text-gray-700'>Student ID</h3>
            {/* BACKEND: Primary identifier - validate format and existence in student database */}
            <input type="text" placeholder='Student ID' className='border-1 rounded-md focus:ring-1 focus:ring-blue-200 p-2 ml-5 mt-3 w-110' />
            
            {/* Verification Button */}
            {/* BACKEND: This should trigger a POST request to /api/verification/student */}
            {/* Expected payload: { firstName, middleName, lastName, studentId } */}
            {/* Expected response: Verification status and possibly user account linkage */}
            <Button caption="Verify" className='mt-25 ml-5 w-115  bg-blue-500 text-white rounded-md px-7 py-3 text-xl' />
            
            {/* Navigation link */}
            <h5 className='font-medium ml-5 mt-8 text-center'>Already have an account? <Link to='/login' className='text-blue-500 font-bold'>Login</Link></h5>
        </form>
    </div>
  )
}

export default Verify