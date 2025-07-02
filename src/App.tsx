"use client"

import "./App.css"
import { useState, useEffect } from "react"
import Checklist from "./checklist/checklist"
import Selector from "./selector/selector"
import About from "./about/about"
import UserInfoForm from "./components/UserInfoForm"
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"

interface UserInfo {
  ime: string
  priimek: string
  razred: string
}

function App() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user info exists in localStorage
    const savedUserInfo = localStorage.getItem("userInfo")
    if (savedUserInfo) {
      setUserInfo(JSON.parse(savedUserInfo))
    }
    setIsLoading(false)
  }, [])

  const handleUserInfoSubmit = (info: UserInfo) => {
    setUserInfo(info)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-violet-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  // Show user info form if no user info exists
  if (!userInfo) {
    return <UserInfoForm onSubmit={handleUserInfoSubmit} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-violet-50 to-indigo-100">
      <Router>
        <Routes>
          <Route path="/checklist/*" element={<Checklist userInfo={userInfo} />} />
          <Route path="/about" element={<About />} />
          <Route path="/" element={<Selector />} />
          <Route path="*" element={<Selector />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App
