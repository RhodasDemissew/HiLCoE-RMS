import React from 'react'

const About = () => {
  return (
    <div className=' flex flex-col h-240 max-w-full container p-10 md:px-20 lg:px-32  overflow-hidden' id='About'>
        <div className="relative bg-blue-500 w-30 h-1.5  left-36 top-22  rounded-sm"></div>
        <h3 className='font-poppins font-semibold text-4xl mt-25 ml-50 top-150'>About Us</h3>
        <div className="relative bg-blue-500 w-30 h-1.5  left-75 top-3  rounded-sm"></div>

        <div className='relative w-145 h-145 top-20 left-30 bg-cover bg-center' style={{backgroundImage: "url('../src/assets/svg/Group_87.svg')"}}></div>

        <p className='absolute w-180 left-230 font-poppins font-normal text-2xl mt-20'>At <span className='font-bold'>Hilcoe School Research Management</span>, we empower researchers, academics, and professionals with an intelligent research management system designed to streamline knowledge discovery, collaboration, and analysis.
            <p className='mt-5'></p>Our platform combines AI and NLP-driven insights to help you uncover patterns and trends effortlessly. With real-time chat support from expert advisors, you get instant guidance when you need it most. Plus, our smart research archive ensures all your work is organized, searchable, and easily accessible—saving you time and boosting productivity.
            <p className='mt-5'>Whether you're an individual scholar, a research team, or an institution, we’re here to simplify your workflow and accelerate innovation.</p>
        </p>
    </div>
  )
}

export default About