"use client";

export default function Footer() {
    return (
        <footer className="w-full py-4 bg-white/80 backdrop-blur-sm border-t border-slate-200 mt-auto">
            <div className="max-w-7xl mx-auto px-4 text-center text-sm text-slate-500">
                <p>
                    MediForm © {new Date().getFullYear()} | Pomoč:{" "}
                    <a 
                        href="mailto:podpora@mediform.cadez.eu" 
                        className="text-ocean-teal hover:text-ocean-deep transition-colors"
                    >
                        podpora@mediform.cadez.eu
                    </a>
                    {" | "}
                    <a 
                        href="/pogoji-uporabe" 
                        className="text-ocean-teal hover:text-ocean-deep transition-colors"
                    >
                        Pogoji uporabe
                    </a>
                    {" | "}
                    <a 
                        href="/zasebnost" 
                        className="text-ocean-teal hover:text-ocean-deep transition-colors"
                    >
                        Zasebnost
                    </a>
                </p>
                <p className="mt-1">
                    Izdelava:{" "}
                    <a 
                        href="https://cadez.eu/" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-ocean-teal hover:text-ocean-deep transition-colors"
                    >
                        Lin Čadež
                    </a>
                    , Vegova Ljubljana
                </p>
            </div>
        </footer>
    );
}
