// Script to update delo, razvedrilo and učenje sections

import fs from 'fs';

// Load the current data
const formData = JSON.parse(
    fs.readFileSync('c:/Users/linca/MediForm/scripts/zdravstvena-nega-for-upload.json', 'utf8')
);

// Update Category 23 - DELO IN USTVARJALNA ZAPOSLITEV
formData.categories['23'] = {
    "title": "DELO IN USTVARJALNA ZAPOSLITEV - ocena stopnje samooskrbe pacienta",
    "description": "ocena stopnje samooskrbe pacienta",
    "url": "delo-zaposlitev",
    "color": "#CCFBF1",
    "subcategories": {
        "23.1": {
            "title": "Samostojnost pacienta pri življenjski aktivnosti delo in ustvarjalna zaposlitev",
            "description": null,
            "elements": {
                "23.1.1": {
                    "title": "Stopnja samostojnosti pri delu in ustvarjalni zaposlitvi",
                    "type": "str",
                    "option_type": "one",
                    "options": [
                        "pacient je zmožen in ima željo opravljati delo ter ustvarjalno zaposlitev",
                        "pacient je delno zmožen opravljati delo in ustvarjalno zaposlitev: potrebuje pomoč",
                        "pacient ni zmožen opravljati dela in ustvarjalne zaposlitve",
                        "pacient nima želje opravljati delo in ustvarjalno zaposlitev"
                    ],
                    "hint": "pacient je zmožen in ima željo opravljati delo ter ustvarjalno zaposlitev",
                    "value": null,
                    "unit": null
                }
            }
        },
        "23.2": {
            "title": "Ocena stanja pacienta pri življenjski aktivnosti delo in ustvarjalna zaposlitev",
            "description": null,
            "elements": {
                "23.2.1": {
                    "title": "Poklic / delo, ki ga pacient opravlja",
                    "type": "str",
                    "hint": "upokojena (priučena šivilja)",
                    "value": null,
                    "unit": null
                },
                "23.2.2": {
                    "title": "Vpliv bolezni na pacientovo delo",
                    "type": "str",
                    "hint": "/",
                    "value": null,
                    "unit": null
                },
                "23.2.3": {
                    "title": "Vključitev pacienta v program rehabilitacije",
                    "type": "str",
                    "option_type": "many",
                    "options": [
                        "ni vključen",
                        "fizioterapija",
                        "delovna terapija",
                        "logopedija",
                        "psihološka rehabilitacija",
                        "socialna rehabilitacija"
                    ],
                    "hint": "fizioterapija",
                    "value": null,
                    "unit": null
                },
                "23.2.4": {
                    "title": "Prilagoditev dela in ustvarjalne zaposlitve glede na pacientovo zdravstveno stanje",
                    "type": "str",
                    "hint": "/",
                    "value": null,
                    "unit": null
                }
            }
        }
    }
};

// Update Category 24 - Aktivnosti zdravstvene nege - delo in ustvarjalna zaposlitev
formData.categories['24'] = {
    "title": "Aktivnosti zdravstvene nege pri življenjski aktivnosti delo in ustvarjalna zaposlitev",
    "description": "Podatki o izvedeni aktivnosti zdravstvene nege",
    "url": "aktivnosti-delo",
    "color": "#CCFBF1",
    "subcategories": {
        "24.1": {
            "title": "Aktivnosti zdravstvene nege",
            "description": null,
            "elements": {
                "24.1.1": {
                    "title": "Datum izvedbe",
                    "type": "date",
                    "defaultValue": "danes",
                    "hint": "7.10.2025",
                    "value": null,
                    "unit": null
                },
                "24.1.2": {
                    "title": "Identifikacija pacienta",
                    "type": "str",
                    "hint": "Identifikacija pravega pacienta (vprašala sem po imenu, priimku, datumu rojstva, preverila sem zapestnico in dokumentacijo).",
                    "value": null,
                    "unit": null
                },
                "24.1.3": {
                    "title": "Ocena stopnje samooskrbe v zvezi z koristnim delom in ustvarjalno zaposlitvijo",
                    "type": "str",
                    "hint": "Z opazovanjem in pogovorom s pacientko.",
                    "value": null,
                    "unit": null
                },
                "24.1.4": {
                    "title": "Sporočanje in dokumentiranje aktivnosti v zvezi z koristnim delom in ustvarjalno zaposlitvijo",
                    "type": "str",
                    "hint": "Podatke in posebnosti v zvezi z delom in ustvarjalno zaposlitvijo sem dokumentirala v poročilo ZN.",
                    "value": null,
                    "unit": null
                }
            }
        }
    }
};

// Update Category 25 - RAZVEDRILO IN REKREACIJA
formData.categories['25'] = {
    "title": "RAZVEDRILO IN REKREACIJA - ocena stopnje samooskrbe pacienta",
    "description": "ocena stopnje samooskrbe pacienta",
    "url": "razvedrilo-rekreacija",
    "color": "#A7F3D0",
    "subcategories": {
        "25.1": {
            "title": "Samostojnost pacienta pri življenjski aktivnosti razvedrilo in rekreacija",
            "description": null,
            "elements": {
                "25.1.1": {
                    "title": "Stopnja samostojnosti pri razvedrilu in rekreaciji",
                    "type": "str",
                    "option_type": "one",
                    "options": [
                        "pacient zmore in si želi izvajati razvedrilne dejavnosti in rekreacijo",
                        "pacient je delno zmožen izvajati razvedrilne dejavnosti in rekreacijo: potrebuje pomoč",
                        "pacient ni zmožen izvajati razvedrilnih dejavnosti in rekreacije",
                        "pacient si ne želi izvajati razvedrilnih dejavnosti in rekreacije"
                    ],
                    "hint": "pacient zmore in si želi izvajati razvedrilne dejavnosti in rekreacijo",
                    "value": null,
                    "unit": null
                }
            }
        },
        "25.2": {
            "title": "Ocena stanja pacienta pri življenjski aktivnosti razvedrilo in rekreacija",
            "description": null,
            "elements": {
                "25.2.1": {
                    "title": "Katere razvedrilne dejavnosti pacienta veselijo",
                    "type": "str",
                    "hint": "gledanje televizije, delo s čebelami in v njivih, kuhanje in peka, druženje in pogovor s svojci...",
                    "value": null,
                    "unit": null
                },
                "25.2.2": {
                    "title": "V katere razvedrilne dejavnosti je pacient vključen",
                    "type": "str",
                    "hint": "/",
                    "value": null,
                    "unit": null
                },
                "25.2.3": {
                    "title": "Katere pripomočke potrebuje pacient za izvajanje razvedrilnih dejavnosti in rekreacije",
                    "type": "str",
                    "hint": "telefon, svojci, pripomočki za kuhanje...",
                    "value": null,
                    "unit": null
                }
            }
        }
    }
};

// Update Category 26 - Aktivnosti zdravstvene nege - razvedrilo in rekreacija
formData.categories['26'] = {
    "title": "Aktivnosti zdravstvene nege pri življenjski aktivnosti razvedrilo in rekreacija",
    "description": "Podatki o izvedeni aktivnosti zdravstvene nege",
    "url": "aktivnosti-razvedrilo",
    "color": "#A7F3D0",
    "subcategories": {
        "26.1": {
            "title": "Aktivnosti zdravstvene nege",
            "description": null,
            "elements": {
                "26.1.1": {
                    "title": "Datum izvedbe",
                    "type": "date",
                    "defaultValue": "danes",
                    "hint": "7.10.2025",
                    "value": null,
                    "unit": null
                },
                "26.1.2": {
                    "title": "Identifikacija pacienta",
                    "type": "str",
                    "hint": "Identifikacija pravega pacienta (vprašala sem po imenu, priimku, datumu rojstva, preverila sem zapestnico in dokumentacijo).",
                    "value": null,
                    "unit": null
                },
                "26.1.3": {
                    "title": "Ocena stopnje samooskrbe v zvezi z razvedrilom in rekreacijo",
                    "type": "str",
                    "hint": "Z opazovanjem pacientove okolice, opazovanjem na splošno in pogovorom s pacientko sem ugotovila, da želi izvajati razvedrilne dejavnosti, kot so druženje in pogovor s svojci, kuhanje, gledanje televizije...",
                    "value": null,
                    "unit": null
                },
                "26.1.4": {
                    "title": "Spodbujanje, usmerjanje in izvajanje zdravstvene nege pri aktivnosti v zvezi z razvedrilom in rekreacijo",
                    "type": "str",
                    "hint": "Spodbujala sem pacientko, da bi se čim več pogovarjala s sosedo v sobi in po telefonu s svojci.",
                    "value": null,
                    "unit": null
                },
                "26.1.5": {
                    "title": "Sporočanje in dokumentiranje aktivnosti v zvezi z razvedrilom in rekreacijo",
                    "type": "str",
                    "hint": "Podatke in posebnosti v zvezi z razvedrilom in rekreacijo sem dokumentirala v poročilo ZN.",
                    "value": null,
                    "unit": null
                }
            }
        }
    }
};

// Update Category 27 - UČENJE IN SKRB ZA LASTNO ZDRAVJE
formData.categories['27'] = {
    "title": "UČENJE IN SKRB ZA LASTNO ZDRAVJE - ocena stopnje samooskrbe pacienta",
    "description": "ocena stopnje samooskrbe pacienta",
    "url": "ucenje-zdravje",
    "color": "#BBF7D0",
    "subcategories": {
        "27.1": {
            "title": "Samostojnost pacienta pri življenjski aktivnosti učenje in skrb za lastno zdravje",
            "description": null,
            "elements": {
                "27.1.1": {
                    "title": "Stopnja samostojnosti pri učenju in skrbi za lastno zdravje",
                    "type": "str",
                    "option_type": "one",
                    "options": [
                        "pacient se zmore učiti in skrbeti za lastno zdravje",
                        "pacient se delno zmore učiti in skrbeti za lastno zdravje: potrebuje pomoč",
                        "pacient se ne zmore učiti in skrbeti za lastno zdravje: potrebuje popolno pomoč"
                    ],
                    "hint": "pacient se zmore učiti in skrbeti za lastno zdravje",
                    "value": null,
                    "unit": null
                }
            }
        },
        "27.2": {
            "title": "Ocena stanja pacienta pri življenjski aktivnosti učenje in skrb za lastno zdravje",
            "description": null,
            "elements": {
                "27.2.1": {
                    "title": "Pacient ima primerno znanje o svoji bolezni (vzroki, simptomi, zdravljenje, preventiva, prehrana)",
                    "type": "str",
                    "option_type": "one",
                    "options": [
                        "DA",
                        "NE",
                        "delno"
                    ],
                    "hint": "DA",
                    "value": null,
                    "unit": null
                },
                "27.2.2": {
                    "title": "Pacient upošteva informacije in nasvete v zvezi z izvajanjem življenjskih aktivnosti (osebna higiena, izločanje, odvajanje, oblačenje, preprečevanje okužb…)",
                    "type": "str",
                    "option_type": "one",
                    "options": [
                        "DA",
                        "NE",
                        "delno"
                    ],
                    "hint": "DA",
                    "value": null,
                    "unit": null
                },
                "27.2.3": {
                    "title": "Pacient upošteva informacije in nasvete v zvezi z zdravim načinom življenja in skrbi za lastno zdravje (primerna prehrana, telesna aktivnost, obvladovanje stresnih dejavnikov, opustitev razvad…)",
                    "type": "str",
                    "option_type": "one",
                    "options": [
                        "DA",
                        "NE",
                        "delno"
                    ],
                    "hint": "DA",
                    "value": null,
                    "unit": null
                },
                "27.2.4": {
                    "title": "Pacient je vključen v društvo, ki se navezuje na njegovo bolezensko stanje",
                    "type": "str",
                    "option_type": "one",
                    "options": [
                        "DA",
                        "NE"
                    ],
                    "hint": "NE",
                    "value": null,
                    "unit": null
                },
                "27.2.5": {
                    "title": "Pacient se udeležuje rednih zdravstvenih, zobozdravstvenih pregledov",
                    "type": "str",
                    "option_type": "one",
                    "options": [
                        "DA",
                        "NE"
                    ],
                    "hint": "DA",
                    "value": null,
                    "unit": null
                },
                "27.2.6": {
                    "title": "Pacient upošteva predpisanega režima jemanja zdravil",
                    "type": "str",
                    "option_type": "one",
                    "options": [
                        "DA",
                        "NE",
                        "delno"
                    ],
                    "hint": "DA",
                    "value": null,
                    "unit": null
                },
                "27.2.7": {
                    "title": "Pacient zmore samostojno izvesti nekatere postopke v zvezi z zdravljenjem (na primer aplikacija inzulina, samokontrola krvnega sladkorja)",
                    "type": "str",
                    "option_type": "one",
                    "options": [
                        "DA",
                        "NE",
                        "ni potrebno"
                    ],
                    "hint": "DA",
                    "value": null,
                    "unit": null
                }
            }
        }
    }
};

// Update Category 28 - Aktivnosti zdravstvene nege - učenje in skrb za lastno zdravje
formData.categories['28'] = {
    "title": "Aktivnosti zdravstvene nege pri življenjski aktivnosti učenje in skrb za lastno zdravje",
    "description": "Podatki o izvedeni aktivnosti zdravstvene nege",
    "url": "aktivnosti-ucenje",
    "color": "#BBF7D0",
    "subcategories": {
        "28.1": {
            "title": "Aktivnosti zdravstvene nege",
            "description": null,
            "elements": {
                "28.1.1": {
                    "title": "Datum izvedbe",
                    "type": "date",
                    "defaultValue": "danes",
                    "hint": "7.10.2025",
                    "value": null,
                    "unit": null
                },
                "28.1.2": {
                    "title": "Identifikacija pacienta",
                    "type": "str",
                    "hint": "Identifikacija pravega pacienta (vprašala sem po imenu, priimku, datumu rojstva, preverila sem zapestnico in dokumentacijo).",
                    "value": null,
                    "unit": null
                },
                "28.1.3": {
                    "title": "Ocena stopnje samooskrbe v zvezi z učenjem in skrbjo za lastno zdravje",
                    "type": "str",
                    "hint": "Z opazovanjem, pogovorom s pacientko in sobno medicinsko sestro.",
                    "value": null,
                    "unit": null
                },
                "28.1.4": {
                    "title": "Sporočanje in dokumentiranje aktivnosti v zvezi z učenjem in skrbjo za lastno zdravje",
                    "type": "str",
                    "hint": "Podatke in posebnosti v zvezi z učenjem in skrbjo za lastno zdravje sem dokumentirala v poročilo ZN.",
                    "value": null,
                    "unit": null
                }
            }
        }
    }
};

// Save the updated file
fs.writeFileSync(
    'c:/Users/linca/MediForm/scripts/zdravstvena-nega-for-upload.json',
    JSON.stringify(formData, null, '\t'),
    'utf8'
);

console.log('✅ Updated categories 23, 24, 25, 26, 27, and 28');
console.log('Category 23 (Delo) subcategories:', Object.keys(formData.categories['23'].subcategories));
console.log('Category 24 (Aktivnosti delo) elements:', Object.keys(formData.categories['24'].subcategories['24.1'].elements).length);
console.log('Category 25 (Razvedrilo) subcategories:', Object.keys(formData.categories['25'].subcategories));
console.log('Category 26 (Aktivnosti razvedrilo) elements:', Object.keys(formData.categories['26'].subcategories['26.1'].elements).length);
console.log('Category 27 (Učenje) subcategories:', Object.keys(formData.categories['27'].subcategories));
console.log('Category 28 (Aktivnosti učenje) elements:', Object.keys(formData.categories['28'].subcategories['28.1'].elements).length);
