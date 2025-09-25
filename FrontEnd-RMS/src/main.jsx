import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import SimpleLayout from './components/layout/SimpleLayout.jsx'
import Home from './pages/home/Home.jsx'
import About from './pages/home/About.jsx'
import Featuer from './pages/home/Featuer.jsx'
import Roadmap from './pages/home/Roadmap.jsx'
import Contact from './pages/home/Contact.jsx'
import FAQs from './pages/home/FAQs.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'features', element: <Featuer /> },
      { path: 'about', element: <About /> },
      { path: 'roadmap', element: <Roadmap /> },
    ],
  },
  {
    element: <SimpleLayout />,
    children: [
      { path: 'faqs', element: <FAQs /> },
      { path: 'contact', element: <Contact /> },
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
