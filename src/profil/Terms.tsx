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
                                <li>Podatki o izpolnjenih obrazcih se <strong>nikoli ne pošiljajo na strežnik</strong>.</li>
                                <li>Profil dijaka (ime, priimek, razred, šola in področje) se pošlje prek obstoječega API endpointa <code>/exports</code>, namenjeno izključno evidentiranju prijavitelja.</li>
                                <li>Tudi izvoz (PDF ali JSON) poteka izključno lokalno v vašem brskalniku in se nikamor ne arhivira.</li>
                                <li>Vsak dokument ima <strong>rok veljavnosti dveh mesecev (60 dni)</strong>. Po poteku se samodejno izbriše.</li>
                                <li>Ob odjavi iz aplikacije se <strong>izbrišejo vsi lokalno shranjeni podatki</strong>, vključno z dokumenti in podatki o seji.</li>
                            </ul>
                            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-blue-700 text-sm">
                                    <strong>Pomembno:</strong> Če izbrišete podatke brskalnika, se odjavite, preteče rok 60 dni ali zamenjate napravo, 
                                    boste izgubili vse shranjene podatke. Priporočamo sproten izvoz pomembnih dokumentov.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold mt-4">3. Shranjevanje podatkov</h2>
                            <p className="text-slate-600">
                                Vaši podatki se shranjujejo na naslednje načine:
                            </p>
                            <ul className="list-disc pl-6 text-slate-600 mt-2">
                                <li><strong>Podatki dijaka (ime, priimek, razred, šola, področje):</strong> Shranjeni lokalno v brskalniku in poslani prek API endpointa <code>/exports</code> za evidenco prijavitelja.</li>
                                <li><strong>Izpolnjeni obrazci:</strong> Shranjeni lokalno v brskalniku z rokom veljavnosti 60 dni. Po izteku se samodejno izbrišejo.</li>
                                <li><strong>Izvoz:</strong> PDF ali JSON se ustvari samo v brskalniku dijaka. Aplikacija izvoza ne pošlje na Firebase, backend ali drug zunanji strežnik in ga nikjer ne arhivira.</li>
                                <li><strong>Odjava:</strong> Odjava iz aplikacije trajno izbriše piškotke seje in vse lokalno shranjene podatke iz brskalnika.</li>
                            </ul>
                            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-green-700 text-sm">
                                    <strong>Brez internetne povezave:</strong> Aplikacija je zasnovana kot »Frontend-only« – vsebuje zgolj 
                                    uporabniški vmesnik. Ko se vsebina naloži, za izpolnjevanje in izvoz ne potrebujete interneta.
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
                                <li><strong>Piškotke:</strong> Samo za shranjevanje soglasja s pogoji uporabe in politiko zasebnosti. Email prijava ni več del aplikacije.</li>
                                <li><strong>localStorage:</strong> Za samodejno shranjevanje vašega vnosnega dela (obrazcev). Vsi izpolnjeni podatki imajo <strong>rok veljavnosti 60 dni</strong> in se po tem roku brez vrnitve odstranijo.</li>
                            </ul>
                            <p className="text-slate-600 mt-2">
                                Izpolnjeni obrazci in izvozi se ne pošiljajo na Firebase, backend ali razvijalcu sistema. Prek API endpointa se pošlje samo profil prijavitelja oziroma dijaka.
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
