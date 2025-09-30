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
import LogIn from './pages/Auth/logIn.jsx'
import Verify from './pages/Auth/verify.jsx'
import SignUp from './pages/Auth/signUp.jsx'
import S_Dashboard from './pages/coordinator/S_Dashboard.jsx'
import Users from './pages/coordinator/Users.jsx';
import ResearchStats from './pages/coordinator/ResearchStat.jsx';
import ActivityLog from './pages/coordinator/ActivityLog.jsx';
import Messages from './pages/coordinator/Message.jsx';
import Settings from './pages/coordinator/Settings.jsx';
import Dashboard from './pages/coordinator/Dasboard.jsx'


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
  // standalone page routes 
  { path: '/login', element: <LogIn /> },
  { path: '/verify', element: <Verify /> },
  { path: '/signup', element: <SignUp /> },

  // Student dashboard routes with sidebar
  {
    path: '/coordinator',
    element: <S_Dashboard />,
    children: [
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'users', element: <Users /> },
      { path: 'research-stats', element: <ResearchStats /> },
      { path: 'activity-log', element: <ActivityLog /> },
      { path: 'messages', element: <Messages /> },
      { path: 'settings', element: <Settings /> },
    ],
  },

  {
    element: <SimpleLayout />,
    children: [
      { path: 'faqs', element: <FAQs /> },
      { path: 'contact', element: <Contact /> },
    ]
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
