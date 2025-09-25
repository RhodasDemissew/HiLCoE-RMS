import React, { useEffect } from 'react'
import About from './About'
import Featuer from './Featuer'
import Roadmap from './Roadmap'
import { useLocation } from 'react-router-dom'

const Home = () => {
  const location = useLocation()

  useEffect(() => {
    const target = location.state?.scrollTo
    if (target) {
      const el = document.getElementById(target)
      if (el) {
        // small timeout to allow layout to render
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
      }
    }
  }, [location.state])

  return (
    <div>
        <Featuer />
        <About />
        <Roadmap />
    </div>
  )
}

export default Home