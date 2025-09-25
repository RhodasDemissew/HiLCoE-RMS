import React from 'react'
import { assets } from '../../assets/assets'

const Featuer = () => {
    return (
        <div className="relative flex flex-col items-center justify-center h-370 max-w-full container p-10 md:px-20 lg:px-32  overflow-hidden" id='Feature'>
                <div className='absolute w-180 h-85 top-0  left-299 bg-cover bg-bottom' style={{backgroundImage: "url('../src/assets/svg/polygon_1.svg')"}}></div>
                <h1 className='absolute right-51 top-30 text-5xl font-poppins font-light'>Academic Research <span className='font-bold'>Assisted With </span></h1>
                <h1 className='absolute right-131 top-45 text-5xl font-poppins font-bold'>Artificial Intelligence</h1>
                <p className='absolute right-38 top-65 text-3xl font-poppins font-extralight' >Proposal Submission, Supervisor Feedback, AI Paper Checker,<br />Progress Tracking</p>
                <div className='absolute w-170 h-120 top-0 left-1 bg-cover bg-bottom' style={{backgroundImage: "url('../src/assets/svg/Ellipse_13.svg')"}}></div>
                <img  className='absolute w-120 h-120 left-50 top-10' src={assets.AI_robotBook} alt="" />

                <div className="absolute bg-blue-500 w-30 h-1.5 mt-20 left-200 top-150  rounded-sm"></div>
                <h3 className='absolute font-poppins font-semibold text-4xl mt-25 top-150' >Featuers</h3>
                <div className="absolute bg-blue-500 w-30 h-1.5 mt-20 left-245 top-168  rounded-sm"></div>

                <div className="container flex-col items-center mx-auto mt-170">
                        <ul className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <li className="flex flex-col items-center text-center gap-5">
                                <div className='absolute w-80 h-75 top-205 left-65 bg-cover bg bg-bottom ' style={{backgroundImage: "url('../src/assets/svg/Ellipse_11.svg')"}}></div>
                                <img src={assets.AI_3D} alt="AI/NLP" className="w-50 h-50 z-10" />
                                <div className='mt-5 ml-20'>
                                        <h4 className="font-poppins font-bold text-left w-90 text-3xl">Smart AI/NLP-driven analysis</h4>
                                        <p className="font-poppins font-light text-left w-60 text-2xl mt-5">Our system integrates AI and NLP for intelligent insights</p>
                                </div>
                                </li>
                                <li className="flex flex-col items-center text-center gap-4">
                                <div className='absolute w-80 h-75 top-205 left-195 bg-cover bg bg-bottom' style={{backgroundImage: "url('../src/assets/svg/Ellipse_14.svg')"}}></div>
                                <img src={assets.message} alt="Expert communication" className="w-55 h-50 z-10" />
                                <div className='mt-5 ml-20'>
                                        <h4 className="font-poppins font-bold text-left w-90 text-3xl">Instant expert communication</h4>
                                        <p className="font-poppins font-light text-left w-60 text-2xl mt-5">Real-time chat with advisors for expert guidance</p>
                                </div>
                                </li>
                                <li className="flex flex-col items-center text-center gap-4">
                                <div className='absolute w-80 h-75 top-205 left-325 bg-cover bg bg-bottom' style={{backgroundImage: "url('../src/assets/svg/Polygon_2.svg')"}}></div>
                                <img src={assets.AI_book} alt="Knowledge hub" className="w-50 h-50 z-10" />
                                <div className='mt-5 ml-20'>
                                        <h4 className="font-poppins font-bold text-left w-90 text-3xl">Organized, searchable knowledge hub</h4>
                                        <p className="font-poppins font-light text-left w-60 text-2xl mt-5">Smart research archive for easy discovery and retrieval</p>
                                </div>
                                </li>
                        </ul>
                </div>
        </div>
    )
}

export default Featuer