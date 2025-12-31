import { NavLink } from "react-router-dom";
import { ArrowLeft, FileText, Heart, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import "./about.css";

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
    ];

    return (
        <div className="page-container">
            <header className="header">
                <div className="header-content">
                    <NavLink to="/">
                        <ArrowLeft className="h-5 w-5 text-slate-600" />
                    </NavLink>
                    <div className="flex-1 text-center px-4">
                        <h1 className="text-lg font-semibold text-slate-900">
                            O aplikaciji
                        </h1>
                    </div>
                </div>
            </header>
            <main className="main-content">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="intro-section"
                >
                    <div className="w-20 h-20 bg-gradient-to-r from-ocean-deep to-ocean-teal rounded-lg flex items-center justify-center mx-auto mb-6">
                        <FileText className="h-10 w-10 text-white" />
                    </div>
                    <h1 className="title">O aplikaciji</h1>
                    <Card className="intro-card">
                        <CardContent className="flex items-center justify-center p-4">
                            <div className="flex items-center justify-center gap-2">
                                <span>Narejeno z</span>
                                <Heart className="h-5 w-5 text-red-500 fill-current" />
                                <span className="text-lg text-slate-700">
                                    na Vegovi
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Card className="authors-card">
                        <CardHeader>
                            <CardTitle className="text-center text-slate-900 text-xl">
                                Avtorji
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {authors.map((author, index) => (
                                    <motion.div
                                        key={author.name}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{
                                            duration: 0.3,
                                            delay: 0.3 + index * 0.1,
                                        }}
                                    >
                                        <a
                                            href={author.github}
                                            target="_blank"
                                            className="link"
                                        >
                                            <span className="font-medium text-slate-900 group-hover:text-ocean-teal transition-colors">
                                                {author.name}
                                            </span>
                                            <ExternalLink className="h-4 w-4 text-slate-500 group-hover:text-ocean-teal transition-colors" />
                                        </a>
                                    </motion.div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </main>
            <footer className="footer">
                <p className="text-sm text-slate-500">
                    Vegova Ljubljana © 2025
                </p>
            </footer>
        </div>
    );
}
