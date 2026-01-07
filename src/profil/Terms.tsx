"use client";

import { NavLink } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsOfUse() {
    return (
        <div className="min-h-screen bg-sky-50 p-4">
            <div className="max-w-4xl mx-auto">
                <NavLink
                    to="/login"
                    className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors mb-4"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Nazaj na prijavo
                </NavLink>
                
                <Card className="border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-slate-900">
                            Pogoji uporabe
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-slate max-w-none">
                        <h2 className="text-lg font-semibold mt-4">1. Splošne določbe</h2>
                        <p>
                            Ti pogoji uporabe urejajo uporabo spletne aplikacije MediForm. Z uporabo 
                            aplikacije se strinjate s temi pogoji.
                        </p>

                        <h2 className="text-lg font-semibold mt-4">2. Namen aplikacije</h2>
                        <p>
                            MediForm je namenjen izključno izobraževalnim namenom za dijake srednjih 
                            zdravstvenih šol. Aplikacija omogoča izpolnjevanje obrazcev zdravstvene nege.
                        </p>

                        <h2 className="text-lg font-semibold mt-4">3. Uporabniški račun</h2>
                        <p>
                            Aplikacijo lahko uporabljate kot gost (brez prijave) ali z email prijavo:
                        </p>
                        <ul className="list-disc pl-6 mt-2">
                            <li>
                                <strong>Gostovski dostop:</strong> Vaši podatki se shranjujejo samo 
                                lokalno v vašem brskalniku. Pri brisanju podatkov brskalnika se 
                                izgubijo tudi vsi vaši obrazci.
                            </li>
                            <li>
                                <strong>Email prijava:</strong> Vaši podatki se shranjujejo na 
                                strežniku in so dostopni z različnih naprav.
                            </li>
                        </ul>

                        <h2 className="text-lg font-semibold mt-4">4. Varstvo podatkov</h2>
                        <p>
                            Obdelava osebnih podatkov je opisana v naši{" "}
                            <NavLink to="/Zasebnost" className="text-ocean-teal hover:underline">
                                Politiki zasebnosti
                            </NavLink>.
                        </p>

                        <h2 className="text-lg font-semibold mt-4">5. Omejitev odgovornosti</h2>
                        <p>
                            Aplikacija je namenjena izključno izobraževalnim namenom. Ne prevzemamo 
                            odgovornosti za morebitno napačno uporabo obrazcev v kliničnem okolju.
                        </p>

                        <h2 className="text-lg font-semibold mt-4">6. Spremembe pogojev</h2>
                        <p>
                            Pridržujemo si pravico do spremembe teh pogojev. O bistvenih spremembah 
                            bomo uporabnike obvestili preko aplikacije.
                        </p>

                        <h2 className="text-lg font-semibold mt-4">7. Kontakt</h2>
                        <p>
                            Za vprašanja glede pogojev uporabe nas kontaktirajte na:{" "}
                            <a href="mailto:podpora@mediform.cadez.eu" className="text-ocean-teal hover:underline">
                                podpora@mediform.cadez.eu
                            </a>
                        </p>

                        <p className="text-sm text-gray-500 mt-6">
                            Zadnja posodobitev: {new Date().toLocaleDateString("sl-SI")}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
