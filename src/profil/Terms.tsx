"use client";

import { NavLink } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsOfUse() {
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
                            Pogoji uporabe
                        </CardTitle>
                        <p className="text-sm text-gray-500">
                            Zadnja posodobitev: {new Date().toLocaleDateString("sl-SI")}
                        </p>
                    </CardHeader>
                    <CardContent className="prose prose-slate max-w-none space-y-6">
                        
                        <section>
                            <h2 className="text-lg font-semibold mt-4">1. Splošne določbe</h2>
                            <p className="text-slate-600">
                                Ti pogoji uporabe urejajo uporabo spletne aplikacije MediForm (v nadaljevanju: "aplikacija"). 
                                Z dostopom do aplikacije ali njeno uporabo potrjujete, da ste prebrali, razumeli in se 
                                strinjate z vsemi pogoji, navedenimi v tem dokumentu.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold mt-4">2. Način delovanja aplikacije</h2>
                            <p className="text-slate-600">
                                Aplikacija deluje na principu <strong>lokalnega shranjevanja</strong>:
                            </p>
                            <ul className="list-disc pl-6 text-slate-600 mt-2">
                                <li>Vsi podatki o obrazcih se hranijo <strong>izključno v vašem brskalniku</strong> (localStorage).</li>
                                <li>Ob vnosu emaila se ta shrani v piškotke za prepoznavanje uporabnika.</li>
                                <li>Obrazci se ne shranjujejo na strežnik med izpolnjevanjem.</li>
                                <li>Podatki se pošljejo na strežnik <strong>samo ob izvozu</strong> (PDF ali JSON) za namen arhiviranja.</li>
                            </ul>
                            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-blue-700 text-sm">
                                    <strong>Pomembno:</strong> Če izbrišete podatke brskalnika, piškotke ali zamenjate napravo, 
                                    boste izgubili vse shranjene podatke. Priporočamo reden izvoz pomembnih dokumentov.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold mt-4">3. Shranjevanje podatkov</h2>
                            <p className="text-slate-600">
                                Vaši podatki se shranjujejo na naslednje načine:
                            </p>
                            <ul className="list-disc pl-6 text-slate-600 mt-2">
                                <li><strong>Email naslov:</strong> Shranjen v piškotkih in localStorage za prepoznavanje.</li>
                                <li><strong>Osebni podatki (ime, priimek, razred, šola):</strong> Shranjeni lokalno v brskalniku.</li>
                                <li><strong>Izpolnjeni obrazci:</strong> Shranjeni lokalno v brskalniku.</li>
                                <li><strong>Izvoženi dokumenti:</strong> Ob izvozu se kopija JSON podatkov lahko pošlje na strežnik za arhiviranje.</li>
                            </ul>
                            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-green-700 text-sm">
                                    <strong>Brez internetne povezave:</strong> Aplikacija deluje tudi brez interneta. 
                                    Izvoz PDF in JSON je mogoč tudi offline - podatki se preprosto ne arhivirajo na strežnik.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold mt-4">4. Namen aplikacije</h2>
                            <p className="text-slate-600">
                                MediForm je izobraževalno orodje, namenjeno izključno za uporabo pri praktičnem 
                                usposabljanju dijakov in študentov zdravstvenih šol. Aplikacija omogoča izpolnjevanje 
                                obrazcev zdravstvene nege v digitalni obliki.
                            </p>
                            <p className="text-slate-600 mt-2">
                                <strong>Aplikacija NI namenjena:</strong>
                            </p>
                            <ul className="list-disc pl-6 text-slate-600">
                                <li>Za dejansko klinično uporabo</li>
                                <li>Za nadomestilo uradne medicinske dokumentacije</li>
                                <li>Za sprejemanje medicinskih odločitev</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold mt-4">5. Omejitev odgovornosti</h2>
                            <p className="text-slate-600">
                                <strong>POMEMBNO:</strong> Upravljavec aplikacije ne prevzema nobene odgovornosti za:
                            </p>
                            <ul className="list-disc pl-6 text-slate-600">
                                <li>Vsebino podatkov, ki jih uporabniki vnašajo v aplikacijo</li>
                                <li>Točnost, popolnost ali zanesljivost vnesenih podatkov</li>
                                <li>Kakršnokoli škodo, ki bi lahko nastala zaradi uporabe aplikacije ali podatkov iz nje</li>
                                <li>Izgubo podatkov zaradi brisanja brskalnika, piškotkov ali zamenjave naprave</li>
                                <li>Nepooblaščen dostop do podatkov v vašem brskalniku</li>
                                <li>Kakršnokoli posredno ali neposredno škodo, vključno z izgubljenim dobičkom</li>
                            </ul>
                            <p className="text-slate-600 mt-2">
                                Aplikacija se zagotavlja "takšna kot je" (as is) brez kakršnihkoli jamstev, 
                                izrecnih ali implicitnih.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold mt-4">6. Uporabnikove obveznosti</h2>
                            <p className="text-slate-600">
                                Z uporabo aplikacije se zavezujete, da:
                            </p>
                            <ul className="list-disc pl-6 text-slate-600">
                                <li>Ne boste vnašali resničnih osebnih podatkov pacientov</li>
                                <li>Boste aplikacijo uporabljali izključno za izobraževalne namene</li>
                                <li>Ne boste poskušali nepooblaščeno dostopati do podatkov drugih uporabnikov</li>
                                <li>Ne boste ovirali ali onesposabljali delovanja aplikacije</li>
                                <li>Sami odgovarjate za varovanje podatkov v vašem brskalniku</li>
                                <li>Redno izvažate pomembne dokumente za varnostno kopiranje</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold mt-4">7. Piškotki in localStorage</h2>
                            <p className="text-slate-600">
                                Aplikacija uporablja:
                            </p>
                            <ul className="list-disc pl-6 text-slate-600">
                                <li><strong>Piškotke:</strong> Za shranjevanje vašega email naslova</li>
                                <li><strong>localStorage:</strong> Za shranjevanje obrazcev in osebnih podatkov</li>
                            </ul>
                            <p className="text-slate-600 mt-2">
                                Ti podatki so nujni za delovanje aplikacije in se ne uporabljajo za sledenje ali oglaševanje.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold mt-4">8. Intelektualna lastnina</h2>
                            <p className="text-slate-600">
                                Vsa vsebina aplikacije, vključno z dizajnom, logotipi, besedili in programsko kodo, 
                                je last upravljavca ali njegovih licencodajalcev in je zaščitena z avtorskimi pravicami.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold mt-4">9. Prenehanje uporabe</h2>
                            <p className="text-slate-600">
                                Pridržujemo si pravico, da kadarkoli in brez predhodnega obvestila:
                            </p>
                            <ul className="list-disc pl-6 text-slate-600">
                                <li>Prekinemo ali omejimo dostop do aplikacije</li>
                                <li>Spremenimo funkcionalnosti aplikacije</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold mt-4">10. Spremembe pogojev</h2>
                            <p className="text-slate-600">
                                Pridržujemo si pravico do spremembe teh pogojev uporabe kadarkoli. Spremembe 
                                začnejo veljati takoj po objavi. Nadaljnja uporaba aplikacije po objavi sprememb 
                                pomeni vaše soglasje z novimi pogoji.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold mt-4">11. Veljavno pravo</h2>
                            <p className="text-slate-600">
                                Za te pogoje uporabe velja pravo Republike Slovenije. Za reševanje morebitnih 
                                sporov je pristojno sodišče v Ljubljani.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold mt-4">12. Kontakt</h2>
                            <p className="text-slate-600">
                                Za vprašanja glede pogojev uporabe nas kontaktirajte na:{" "}
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
