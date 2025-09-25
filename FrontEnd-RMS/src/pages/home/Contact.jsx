import React from 'react'
import Button from '../../components/ui/button'

const Contact = () => {
  return (
    <main className='abso min-h-[80vh] py-45'>
      <section className='container mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 px-6 md:px-16 lg:px-14'>
        <div className='relative font-poppins ml-20'>
          <div className='absolute w-150 h-150 left-45 bg-cover  bg-bottom' style={{backgroundImage: "url('../src/assets/svg/Group_90.svg')"}}/>
          <h1 className='relative text-5xl font-poppins font-semibold leading-snug'>
            Get in
            <br />
            touch with us
          </h1>
          <p className='relative mt-5 text-xl text-gray-700 max-w-md'>
            We’re here to help! Whether you have a question about our services, need assistance with your
            account, or want to provide feedback, our team is ready to assist you.
          </p>
          <div className='relative mt-7'>
            <h3 className='text-lg font-semibold'>Reception / Admin:</h3>
            <div className='mt-3 text-lg space-y-1'>
              <p>Info@hilcoe.net, www.hilcoe.net</p>
              <p>+251 111 564900, +251 111 564888</p>
              <p>Short Professional Course enquiry</p>
            </div>
            <div className='mt-5 text-lg space-y-1'>
              <p>cyberinfo@hilcoe.net / cyberinfohilcoe@gmail.com</p>
              <p>+251 987 03 03 03 / +251 986 04 04 04</p>
            </div>
          </div>
        </div>
        <form className='bg-white rounded-xl shadow-md border z-10 border-gray-100 p-6 h-115'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 font-poppins'>
            <input className='border  rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 outline-none' placeholder='First name' />
            <input className='border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 outline-none' placeholder='Last name' />
            <input className='md:col-span-2 border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 outline-none' placeholder='Email' />
            <textarea className='md:col-span-2 border rounded-md px-3 py-2 text-sm h-50 resize-none focus:ring-2 focus:ring-blue-200 outline-none' placeholder='Your message' />
          </div>
          <Button caption="Send Message" className='mt-4 ml-124  bg-blue-500 text-white rounded-md px-7 py-3 text-sm' />
        </form>
      </section>
    </main>
  )
}

export default Contact