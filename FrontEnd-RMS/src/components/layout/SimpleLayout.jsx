import React from 'react'
import NavBar from './NavBar.jsx'
import Footer from './Footer.jsx'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

const SimpleLayout = () => {
    const location = useLocation()
    return (
        <div>
            <NavBar />
            <AnimatePresence mode="wait">
                <motion.div
                    key={location.pathname}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                    <Outlet />
                </motion.div>
            </AnimatePresence>
            <Footer />
        </div>
    )
}

export default SimpleLayout


