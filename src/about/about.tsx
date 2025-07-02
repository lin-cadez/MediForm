"use client"

import { NavLink } from "react-router-dom"
import { ArrowLeft, FileText, Heart, ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export default function About() {
  const authors = [
    {
      name: "Lin Čadež",
      github: "https://github.com/lin-cadez",
    },
    {
      name: "Jaka Černetič",
      github: "https://github.com/jakecernet",
    },
    {
      name: "Jon Pečar",
      github: "https://github.com/jonontop",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-violet-50 to-indigo-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-violet-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 max-w-4xl mx-auto">
          <NavLink
            to="/"
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-100 transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </NavLink>
          <div className="flex-1 text-center px-4">
            <h1 className="text-lg font-semibold text-slate-900">O aplikaciji</h1>
          </div>
          <div className="w-10 h-10" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FileText className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent mb-6">
            O aplikaciji
          </h1>

          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm border border-blue-100 mb-8">
            <CardContent className="p-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-lg text-slate-700">Narejeno z</span>
                <Heart className="h-5 w-5 text-red-500 fill-current" />
                <span className="text-lg text-slate-700">na Vegovi</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Authors Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm border border-blue-100">
            <CardHeader>
              <CardTitle className="text-center text-slate-900 text-xl">Avtorji</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {authors.map((author, index) => (
                  <motion.div
                    key={author.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                  >
                    <a
                      href={author.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-blue-50/50 to-violet-50/50 hover:from-blue-100/50 hover:to-violet-100/50 transition-all duration-200 group"
                    >
                      <span className="font-medium text-slate-900 group-hover:text-violet-700 transition-colors">
                        {author.name}
                      </span>
                      <ExternalLink className="h-4 w-4 text-slate-500 group-hover:text-violet-600 transition-colors" />
                    </a>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center mt-12"
        >
          <NavLink to="/">
            <Button className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white px-8 py-3 text-lg">
              Nazaj na domov
            </Button>
          </NavLink>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-violet-200 bg-white/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center">
          <p className="text-sm text-slate-500">Vegova Ljubljana © 2024</p>
        </div>
      </footer>
    </div>
  )
}
