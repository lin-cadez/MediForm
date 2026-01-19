"use client";

import { NavLink } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-sky-50 p-4">
            <div className="max-w-4xl mx-auto">
                <NavLink
                    to="/"
                    className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors mb-4"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Nazaj
                </NavLink>
                
                <Card className="border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-slate-900">
                            Politika zasebnosti
                        </CardTitle>
                        <p className="text-sm text-gray-500">
                            Zadnja posodobitev: {new Date().toLocaleDateString("sl-SI")}
                        </p>
                    </CardHeader>
                    <CardContent className="prose prose-slate max-w-none space-y-6">
                        
                        <section>
                            <h2 className="text-lg font-semibold mt-4">1. Uvod</h2>
                            <p className="text-slate-600">
                                Ta politika zasebnosti opisuje, kako aplikacija MediForm (v nadaljevanju: "aplikacija") 
                                zbira, uporablja in varuje vaše osebne podatke v skladu s Splošno uredbo o varstvu 
                                podatkov (GDPR) in veljavno slovensko zakonodajo.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold mt-4">2. Upravljavec podatkov</h2>
                            <p className="text-slate-600">
                                Upravljavec osebnih podatkov je MediForm.<br />
                                Kontakt: <a href="mailto:podpora@mediform.cadez.eu" className="text-ocean-teal hover:underline">
                                    podpora@mediform.cadez.eu
                                </a>
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold mt-4">3. Katere podatke zbiramo</h2>
                            <p className="text-slate-600">Zbiramo naslednje osebne podatke:</p>
                            <ul className="list-disc pl-6 text-slate-600">
                                <li><strong>Identifikacijski podatki:</strong> Ime, priimek, email naslov</li>
                                <li><strong>Izobraževalni podatki:</strong> Razred, šola, področje usposabljanja</li>
                                <li><strong>Uporabniški podatki:</strong> Izpolnjeni obrazci in njihova vsebina</li>
                                <li><strong>Tehnični podatki:</strong> Podatki o seji, piškotki za delovanje aplikacije</li>
                            </ul>
                            
                            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <h3 className="text-md font-semibold text-green-800 mb-2">🔒 Anonimni način uporabe</h3>
                                <p className="text-green-700 text-sm">
                                    Če uporabljate aplikacijo v <strong>anonimnem načinu</strong>, se vaši podatki 
                                    <strong> NE pošiljajo na naše strežnike</strong>. Vsi podatki (ime, priimek, 
                                    razred, šola, izpolnjeni obrazci) se hranijo <strong>izključno lokalno</strong> v 
                                    vašem brskalniku (localStorage). Pri anonimnem načinu:
                                </p>
                                <ul className="list-disc pl-6 text-green-700 text-sm mt-2">
                                    <li>Ne zbiramo nobenih osebnih podatkov</li>
                                    <li>Ne uporabljamo piškotkov za sledenje</li>
                                    <li>Edina komunikacija s strežnikom je nalaganje obrazcev (statična vsebina)</li>
                                    <li>Ob brisanju podatkov brskalnika se vsi vaši podatki trajno izbrišejo</li>
                                </ul>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold mt-4">4. Namen obdelave</h2>
                            <p className="text-slate-600">Vaše osebne podatke obdelujemo za naslednje namene:</p>
                            <ul className="list-disc pl-6 text-slate-600">
                                <li>Omogočanje prijave in dostopa do aplikacije</li>
                                <li>Shranjevanje in prikaz izpolnjenih obrazcev</li>
                                <li>Generiranje PDF dokumentov</li>
                                <li>Zagotavljanje tehničnega delovanja aplikacije</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold mt-4">5. Pravna podlaga za obdelavo</h2>
                            <p className="text-slate-600">
                                Osebne podatke obdelujemo na podlagi:
                            </p>
                            <ul className="list-disc pl-6 text-slate-600">
                                <li><strong>Privolitve (člen 6(1)(a) GDPR):</strong> S sprejetjem pogojev uporabe 
                                    podajate privolitev za obdelavo vaših podatkov.</li>
                                <li><strong>Zakonitih interesov (člen 6(1)(f) GDPR):</strong> Za zagotavljanje 
                                    varnosti in tehničnega delovanja aplikacije.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold mt-4">6. Omejitev odgovornosti za podatke</h2>
                            <p className="text-slate-600">
                                <strong>POMEMBNO:</strong> Upravljavec ne prevzema nobene odgovornosti za:
                            </p>
                            <ul className="list-disc pl-6 text-slate-600">
                                <li>Vsebino in točnost podatkov, ki jih uporabniki sami vnašajo</li>
                                <li>Izgubo podatkov zaradi tehničnih napak ali višje sile</li>
                                <li>Nepooblaščen dostop do podatkov kljub sprejetim varnostnim ukrepom</li>
                                <li>Kakršnokoli škodo, ki bi nastala zaradi uporabe ali nezmožnosti uporabe podatkov</li>
                                <li>Podatke po izbrisu uporabniškega računa</li>
                            </ul>
                            <p className="text-slate-600 mt-2">
                                Uporabniki so sami odgovorni za pravilnost in zakonitost podatkov, ki jih vnašajo 
                                v aplikacijo. <strong>V aplikacijo ne smete vnašati resničnih osebnih podatkov 
                                pacientov.</strong>
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold mt-4">7. Hramba podatkov</h2>
                            <p className="text-slate-600">
                                Vaše podatke hranimo, dokler:
                            </p>
                            <ul className="list-disc pl-6 text-slate-600">
                                <li>Imate aktiven uporabniški račun</li>
                                <li>Ne zahtevate izbrisa</li>
                                <li>Ne prekličete privolitve</li>
                            </ul>
                            <p className="text-slate-600 mt-2">
                                Podatki, shranjeni lokalno v brskalniku (localStorage), se hranijo dokler 
                                jih sami ne izbrišete.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold mt-4">8. Vaše pravice</h2>
                            <p className="text-slate-600">
                                V skladu z GDPR imate naslednje pravice:
                            </p>
                            <ul className="list-disc pl-6 text-slate-600">
                                <li><strong>Pravica dostopa (člen 15):</strong> Zahtevate lahko informacije o tem, 
                                    katere vaše podatke obdelujemo.</li>
                                <li><strong>Pravica do popravka (člen 16):</strong> Zahtevate lahko popravek 
                                    netočnih podatkov.</li>
                                <li><strong>Pravica do izbrisa (člen 17):</strong> Zahtevate lahko izbris 
                                    vaših podatkov ("pravica do pozabe").</li>
                                <li><strong>Pravica do omejitve obdelave (člen 18):</strong> V določenih primerih 
                                    lahko zahtevate omejitev obdelave.</li>
                                <li><strong>Pravica do prenosljivosti (člen 20):</strong> Zahtevate lahko prenos 
                                    vaših podatkov v strukturirani obliki.</li>
                                <li><strong>Pravica do preklica privolitve:</strong> Privolitev lahko kadarkoli 
                                    prekličete brez posledic za zakonitost obdelave pred preklicem.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold mt-4">9. Uveljavljanje pravic</h2>
                            <p className="text-slate-600">
                                Za uveljavljanje svojih pravic nas kontaktirajte na:{" "}
                                <a href="mailto:podpora@mediform.cadez.eu" className="text-ocean-teal hover:underline">
                                    podpora@mediform.cadez.eu
                                </a>
                            </p>
                            <p className="text-slate-600 mt-2">
                                Na vašo zahtevo bomo odgovorili v roku enega meseca. V primeru zapletenih 
                                zahtev se ta rok lahko podaljša za dva meseca.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold mt-4">10. Piškotki</h2>
                            <p className="text-slate-600">
                                Aplikacija uporablja nujne piškotke za:
                            </p>
                            <ul className="list-disc pl-6 text-slate-600">
                                <li>Vzdrževanje uporabniške seje</li>
                                <li>Shranjevanje nastavitev soglasja</li>
                                <li>Osnovno delovanje aplikacije</li>
                            </ul>
                            <p className="text-slate-600 mt-2">
                                Ne uporabljamo piškotkov za sledenje ali oglaševanje.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold mt-4">11. Varnost podatkov</h2>
                            <p className="text-slate-600">
                                Za zaščito vaših podatkov uporabljamo:
                            </p>
                            <ul className="list-disc pl-6 text-slate-600">
                                <li>Šifriranje prenosa podatkov (HTTPS/TLS)</li>
                                <li>Varne metode avtentikacije</li>
                                <li>Redne varnostne preglede</li>
                            </ul>
                            <p className="text-slate-600 mt-2">
                                Kljub sprejetim ukrepom ne moremo zagotavljati popolne varnosti podatkov, 
                                kar uporabniki sprejemajo z uporabo aplikacije.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold mt-4">12. Pritožba</h2>
                            <p className="text-slate-600">
                                Če menite, da obdelava vaših podatkov krši GDPR, imate pravico vložiti 
                                pritožbo pri Informacijskem pooblaščencu Republike Slovenije:{" "}
                                <a href="https://www.ip-rs.si" target="_blank" rel="noopener noreferrer" 
                                   className="text-ocean-teal hover:underline">
                                    www.ip-rs.si
                                </a>
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold mt-4">13. Spremembe politike</h2>
                            <p className="text-slate-600">
                                Pridržujemo si pravico do spremembe te politike zasebnosti. O bistvenih 
                                spremembah bomo uporabnike obvestili preko aplikacije. Datum zadnje 
                                posodobitve je naveden na vrhu tega dokumenta.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold mt-4">14. Kontakt</h2>
                            <p className="text-slate-600">
                                Za vprašanja glede te politike zasebnosti nas kontaktirajte na:{" "}
                                <a href="mailto:podpora@mediform.cadez.eu" className="text-ocean-teal hover:underline">
                                    podpora@mediform.cadez.eu
                                </a>
                            </p>
                        </section>

                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
