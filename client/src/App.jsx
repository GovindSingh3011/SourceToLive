import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import CreateProject from './pages/CreateProject'
import BackgroundPattern from './components/BackgroundPattern'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

function AppContent() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-blue-50 flex flex-col">
      <BackgroundPattern />
      {!isAuthPage && <Navbar />}
      <div className="flex-1 flex items-center justify-center px-4 py-2 relative">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/create-project" element={<CreateProject />} />
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
