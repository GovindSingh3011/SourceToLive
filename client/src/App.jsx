import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import BackgroundPattern from './components/BackgroundPattern'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

function App() {
  const pathname = window.location.pathname;
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  return (
    <Router>
      <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-blue-50 flex flex-col">
        <BackgroundPattern />
        {!isAuthPage && <Navbar />}
        <div className="flex-1 flex items-center justify-center px-4 py-2 relative">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </div>
        {!isAuthPage && <Footer />}
      </div>
    </Router>
  )
}

export default App
