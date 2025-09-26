import {  useEffect, useRef, useState } from 'react';
import { assets } from '../../assets/assets.js';
import Button from '../ui/button.jsx';
import { motion } from 'framer-motion';     
import { Link, useLocation, useNavigate } from 'react-router-dom';

const NavBar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [position, setPosition] = useState({
        left : 0,
        width : 0,
        opacity : 0,
        hover: false,
    });
    const [showBar, setShowBar] = useState(true);
    const lastScrollRef = useRef(window.scrollY || 0);

    useEffect(() => {
        const handleScroll = () => {
            const current = window.scrollY || 0;
            const delta = current - lastScrollRef.current;
            const isScrollingDown = delta > 6;
            const isScrollingUp = delta < -6;

            if (current < 10) {
                setShowBar(true);
            } else if (isScrollingDown) {
                setShowBar(false);
            } else if (isScrollingUp) {
                setShowBar(true);
            }

            lastScrollRef.current = current;
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (sectionId) => {
        const doScroll = () => {
            const el = document.getElementById(sectionId);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        };

        if (location.pathname !== '/') {
            navigate('/', { state: { scrollTo: sectionId } });
        } else {
            doScroll();
        }
    };

    return ( 
        <motion.div
            className='fixed top-0 left-0 p-3 w-full z-20 bg-white shadow-sm'
            initial={false}
            animate={showBar ? { y: 0 } : { y: -80 }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        >
            <div className='container flex justify-between items-center mx-auto'>
                 
                    <img  className='w-12 h-12 t-0' src={assets.HiLCoE_Logo} alt="" />
                    <h2 className=' absolute top-3.5 left-90 right-0 text-blue-500 font-black font-caprasimo text-2xl'>HiLCoE</h2>
                    <h4 className=' absolute mt-7 left-70 right-0 text-blue-500  font-poppins font-medium'>Research Management System</h4>
                
                <ul className='relative z-20 justify-between  items-center w-1/2 h-14 ml-40 flex font-semibold font-poppins text-md px-20 '>
                    <Tab setPosition={setPosition}><button onClick={() => scrollToSection('Header')} className='cursor-pointer text-blue-950 hover:text-blue-700'>Home</button></Tab>
                    <Tab setPosition={setPosition}><button onClick={() => scrollToSection('Feature')} className='cursor-pointer text-blue-950 hover:text-blue-700'>Features</button></Tab>
                    <Tab setPosition={setPosition}><button onClick={() => scrollToSection('About')} className='cursor-pointer text-blue-950 hover:text-blue-700'>About</button></Tab>
                    <Tab setPosition={setPosition}><button onClick={() => scrollToSection('Roadmap')} className='cursor-pointer text-blue-950 hover:text-blue-700'>Road Map</button></Tab>
                    <Tab setPosition={setPosition}><Link to='/faqs' className='cursor-pointer text-blue-950 hover:text-blue-700' >FAQs</Link></Tab>
                    <Tab setPosition={setPosition}><Link to='/contact' className='cursor-pointer text-blue-950 hover:text-blue-700' >Contact</Link></Tab>
                    

                    <Cursor position={position}/>
                </ul>
                <div className='right-0 z-20 flex gap-4 font-poppins  text-md'>
                    <Link to='/login'><Button caption="Login" className="hidden md:block bg-white text-blue-500 font-semibold px-8 py-2 cursor-pointer" /></Link>
                    <Link to='/verify'><Button caption="Sign up" className=" md:block bg-blue-500 text-white font-semibold rounded-xl px-6 py-3 cursor-pointer" /></Link>
                </div>
                
            </div>
        </motion.div>
    )
}

const Tab = ({children,setPosition}) => {
    const ref = useRef(null);
    return (
        <li 
            ref={ref}
            onClick={() => {
                if (!ref.current) return;
                const {width} = ref.current.getBoundingClientRect();

                setPosition({
                    width,
                    opacity: 1,
                    hover: true,
                    left: ref.current.offsetLeft,
                })
             }}
            className='relative z-10 block cursor-pointer px-3 py-2 hover:text-blue-900'>
            {children}
        </li>
    )
}

const Cursor = ({position}) => {
    return (
        <motion.li 
            initial={false}
            animate={{ left: position.left, width: position.width, opacity: position.opacity }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            style={{ left: position.left, width: position.width, opacity: position.opacity }}
            className='absolute bottom-0 z-0 h-1 bg-blue-950 rounded pointer-events-none'
        />
    )
}

export default NavBar;