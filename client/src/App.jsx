import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Projects from './pages/Projects'
import Project from './pages/Project'
import Auth from './pages/Auth'
import Settings from './pages/Settings'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:projectId" element={<Project />} />
      </Routes>
    </Router>
  )
}

export default App
