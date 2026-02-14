import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import CreateProject from './pages/CreateProject'
import Dashboard from './pages/Dashboard'
import ProjectDetail from './pages/ProjectDetail'
import ProjectSettings from './pages/ProjectSettings'
import Profile from './pages/Profile'
import About from './pages/About'
import NotFound from './pages/NotFound'
import BackgroundPattern from './components/BackgroundPattern'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

function AppContent() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-blue-50 flex flex-col">
      <BackgroundPattern />
      {!isAuthPage && <Navbar />}
      <div className="flex-1 flex items-center justify-center px-4 py-2 relative">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/about" element={<About />} />
          <Route path="/create-project" element={<CreateProject />} />
          <Route path="/project/:projectId" element={<ProjectDetail />} />
          <Route path="/project/:projectId/settings" element={<ProjectSettings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      {!isAuthPage && <Footer />}
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
