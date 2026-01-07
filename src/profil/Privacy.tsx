"use client";

import { NavLink } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicy() {
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
                            Politika zasebnosti
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-slate max-w-none">
                        <h2 className="text-lg font-semibold mt-4">1. Upravljavec podatkov</h2>
                        <p>
                            Upravljavec osebnih podatkov je MediForm. Za vprašanja glede obdelave 
                            osebnih podatkov nas kontaktirajte na:{" "}
                            <a href="mailto:podpora@mediform.cadez.eu" className="text-ocean-teal hover:underline">
                                podpora@mediform.cadez.eu
                            </a>
                        </p>

                        <h2 className="text-lg font-semibold mt-4">2. Katere podatke zbiramo</h2>
                        <p>Glede na način prijave zbiramo naslednje podatke:</p>
                        
                        <h3 className="text-md font-semibold mt-3">Gostovski dostop (brez prijave):</h3>
                        <ul className="list-disc pl-6 mt-2">
                            <li>Ime in priimek</li>
                            <li>Razred</li>
                            <li>Šola</li>
                            <li>Področje</li>
                            <li>Izpolnjeni obrazci</li>
                        </ul>
                        <p className="text-sm text-gray-600 mt-2">
                            <strong>Pomembno:</strong> Pri gostovskem dostopu se vsi podatki hranijo 
                            izključno lokalno v vašem brskalniku (localStorage). Ti podatki se ne 
                            prenašajo na naše strežnike.
                        </p>

                        <h3 className="text-md font-semibold mt-3">Email prijava:</h3>
                        <ul className="list-disc pl-6 mt-2">
                            <li>Email naslov</li>
                            <li>Ime in priimek</li>
                            <li>Razred</li>
                            <li>Šola</li>
                            <li>Področje</li>
                            <li>Izpolnjeni obrazci</li>
                        </ul>

                        <h2 className="text-lg font-semibold mt-4">3. Namen obdelave</h2>
                        <p>Osebne podatke obdelujemo za naslednje namene:</p>
                        <ul className="list-disc pl-6 mt-2">
                            <li>Omogočanje dostopa do aplikacije</li>
                            <li>Shranjevanje in sinhronizacija izpolnjenih obrazcev</li>
                            <li>Generiranje PDF dokumentov z vašimi podatki</li>
                        </ul>

                        <h2 className="text-lg font-semibold mt-4">4. Pravna podlaga</h2>
                        <p>
                            Osebne podatke obdelujemo na podlagi vaše privolitve (člen 6(1)(a) GDPR), 
                            ki jo podate ob prijavi v aplikacijo.
                        </p>

                        <h2 className="text-lg font-semibold mt-4">5. Hramba podatkov</h2>
                        <ul className="list-disc pl-6 mt-2">
                            <li>
                                <strong>Gostovski dostop:</strong> Podatki se hranijo dokler jih ne 
                                izbrišete iz brskalnika ali izvozite.
                            </li>
                            <li>
                                <strong>Email prijava:</strong> Podatki se hranijo dokler ne zahtevate 
                                izbrisa računa.
                            </li>
                        </ul>

                        <h2 className="text-lg font-semibold mt-4">6. Vaše pravice</h2>
                        <p>V skladu z GDPR imate naslednje pravice:</p>
                        <ul className="list-disc pl-6 mt-2">
                            <li><strong>Pravica dostopa:</strong> Zahtevate lahko kopijo svojih podatkov</li>
                            <li><strong>Pravica do popravka:</strong> Zahtevate lahko popravek netočnih podatkov</li>
                            <li><strong>Pravica do izbrisa:</strong> Zahtevate lahko izbris svojih podatkov</li>
                            <li><strong>Pravica do prenosljivosti:</strong> Izvozite lahko svoje podatke v JSON formatu</li>
                            <li><strong>Pravica do preklica privolitve:</strong> Privolitev lahko kadarkoli prekličete</li>
                        </ul>

                        <h2 className="text-lg font-semibold mt-4">7. Izvoz in izbris podatkov</h2>
                        <p>
                            V aplikaciji lahko kadarkoli izvozite svoje podatke v JSON formatu ali 
                            zahtevate izbris vseh svojih podatkov. Pri gostovskem dostopu to storite 
                            z brisanjem podatkov brskalnika.
                        </p>

                        <h2 className="text-lg font-semibold mt-4">8. Varnost podatkov</h2>
                        <p>
                            Za zaščito vaših podatkov uporabljamo ustrezne tehnične in organizacijske 
                            ukrepe, vključno s šifriranjem prenosa podatkov (HTTPS).
                        </p>

                        <h2 className="text-lg font-semibold mt-4">9. Kontakt</h2>
                        <p>
                            Za uveljavljanje svojih pravic ali vprašanja glede obdelave osebnih 
                            podatkov nas kontaktirajte na:{" "}
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
