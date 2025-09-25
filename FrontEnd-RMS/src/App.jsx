import Header from '../src/components/layout/Header.jsx'
import Footer from './components/layout/Footer.jsx'
import { Outlet, useLocation } from 'react-router-dom'  
import { AnimatePresence, motion } from 'framer-motion'


const App = () => {
  const location = useLocation()

  return (
    <div>
      <Header />
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

export default App