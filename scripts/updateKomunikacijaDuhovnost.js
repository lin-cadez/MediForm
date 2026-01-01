// Script to update komunikacija and duhovne potrebe sections

import fs from 'fs';

// Load the current data
const formData = JSON.parse(
    fs.readFileSync('c:/Users/linca/MediForm/scripts/zdravstvena-nega-for-upload.json', 'utf8')
);

// Update Category 19 - KOMUNIKACIJA - IZRAŽANJE POTREB IN ČUSTEV
formData.categories['19'] = {
    "title": "KOMUNIKACIJA - IZRAŽANJE POTREB IN ČUSTEV - ocena stopnje samooskrbe pacienta",
    "description": "ocena stopnje samooskrbe pacienta",
    "url": "komunikacija",
    "color": "#E0E7FF",
    "subcategories": {
        "19.1": {
            "title": "Samostojnost pri življenjski aktivnosti komunikacija, odnosi z ljudmi in izražanje čustev, občutkov ter potreb",
            "description": null,
            "elements": {
                "19.1.1": {
                    "title": "Stopnja samostojnosti pri komunikaciji",
                    "type": "str",
                    "option_type": "one",
                    "options": [
                        "pacient ustrezno komunicira ter izraža čustva, občutke in potrebe, ima primerne odnose z ljudmi",
                        "pacient ima težave pri komunikaciji, izražanju čustev in odnosih z ljudmi: potrebuje pomoč",
                        "pacient ni sposoben komunicirati, izražati čustev in vzpostavljati odnosov: potrebuje popolno pomoč"
                    ],
                    "hint": "pacient ustrezno komunicira ter izraža čustva, občutke in potrebe, ima primerne odnose z ljudmi",
                    "value": null,
                    "unit": null
                }
            }
        },
        "19.2": {
            "title": "Zavest",
            "description": null,
            "elements": {
                "19.2.1": {
                    "title": "Ocena kvalitativne zavesti",
                    "type": "str",
                    "option_type": "many",
                    "options": [
                        "pacient je orientiran osebnostno",
                        "pacient je orientiran časovno",
                        "pacient je orientiran krajevno",
                        "pacient je dezorientiran osebnostno",
                        "pacient je dezorientiran časovno",
                        "pacient je dezorientiran krajevno",
                        "zmeden",
                        "delirij",
                        "demenca"
                    ],
                    "hint": "pacient je orientiran osebnostno, časovno, krajevno",
                    "value": null,
                    "unit": null
                },
                "19.2.2": {
                    "title": "Ocena kvantitativne zavesti",
                    "type": "str",
                    "option_type": "one",
                    "options": [
                        "buden",
                        "somnolenten",
                        "sopor",
                        "koma"
                    ],
                    "hint": "buden",
                    "value": null,
                    "unit": null
                }
            }
        },
        "19.3": {
            "title": "Bolečina",
            "description": null,
            "elements": {
                "19.3.1": {
                    "title": "Prisotnost bolečine",
                    "type": "str",
                    "option_type": "one",
                    "options": [
                        "brez bolečine",
                        "blaga bolečina",
                        "zmerna bolečina",
                        "huda bolečina",
                        "neznosna bolečina"
                    ],
                    "hint": "/",
                    "value": null,
                    "unit": null
                },
                "19.3.2": {
                    "title": "Opis bolečine",
                    "type": "str",
                    "hint": "lokacija, vrsta, trajanje...",
                    "value": null,
                    "unit": null
                }
            }
        },
        "19.4": {
            "title": "Ocena stanja pacienta pri komunikaciji, odnosih z ljudmi in izražanju čustev, občutkov ter potreb",
            "description": null,
            "elements": {
                "19.4.1": {
                    "title": "Motnje vida",
                    "type": "str",
                    "option_type": "many",
                    "options": [
                        "brez motenj",
                        "slabovidnost",
                        "slepota",
                        "daljnovidnost",
                        "kratkovidnost"
                    ],
                    "hint": "slabovidnost",
                    "value": null,
                    "unit": null
                },
                "19.4.2": {
                    "title": "Motnje sluha",
                    "type": "str",
                    "option_type": "many",
                    "options": [
                        "brez motenj",
                        "naglušnost",
                        "gluhota"
                    ],
                    "hint": "brez motenj",
                    "value": null,
                    "unit": null
                },
                "19.4.3": {
                    "title": "Motnje govora",
                    "type": "str",
                    "option_type": "many",
                    "options": [
                        "brez motenj",
                        "afazija",
                        "dizartrija",
                        "jecljanje",
                        "mutizem"
                    ],
                    "hint": "brez motenj",
                    "value": null,
                    "unit": null
                },
                "19.4.4": {
                    "title": "Medicinsko tehnični pripomočki",
                    "type": "str",
                    "option_type": "many",
                    "options": [
                        "brez pripomočkov",
                        "očala",
                        "kontaktne leče",
                        "slušni aparat",
                        "govorna proteza"
                    ],
                    "hint": "očala",
                    "value": null,
                    "unit": null
                },
                "19.4.5": {
                    "title": "Vpliv čustvenega stanja na komunikacijo, odnose z ljudmi, izražanje čustev, občutkov ter potreb",
                    "type": "str",
                    "option_type": "many",
                    "options": [
                        "brez vpliva",
                        "spremenljivo razpoloženje",
                        "žalost",
                        "anksioznost",
                        "depresija",
                        "agresivnost",
                        "apatija",
                        "evforija",
                        "strah"
                    ],
                    "hint": "spremenljivo razpoloženje",
                    "value": null,
                    "unit": null
                }
            }
        }
    }
};

// Update Category 20 - Aktivnosti zdravstvene nege - komunikacija
formData.categories['20'] = {
    "title": "Aktivnosti zdravstvene nege pri življenjski aktivnosti komunikacija, odnosi z ljudmi in izražanju čustev, občutkov ter potreb",
    "description": "Podatki o izvedeni aktivnosti zdravstvene nege",
    "url": "aktivnosti-komunikacija",
    "color": "#E0E7FF",
    "subcategories": {
        "20.1": {
            "title": "Aktivnosti zdravstvene nege",
            "description": null,
            "elements": {
                "20.1.1": {
                    "title": "Datum izvedbe",
                    "type": "date",
                    "defaultValue": "danes",
                    "hint": "7.10.2025",
                    "value": null,
                    "unit": null
                },
                "20.1.2": {
                    "title": "Identifikacija pacienta",
                    "type": "str",
                    "hint": "Identifikacija pravega pacienta (vprašala sem po imenu, priimku, datumu rojstva, preverila sem zapestnico in dokumentacijo).",
                    "value": null,
                    "unit": null
                },
                "20.1.3": {
                    "title": "Ocena stopnje samooskrbe v zvezi z komunikacijo",
                    "type": "str",
                    "hint": "Z opazovanjem, pogovorom s pacientko in sobno medicinsko sestro. Pacientka ustrezno komunicira in izraža svoja čustva. Opazovala sem tudi mimiko obraza in telesno govorico.",
                    "value": null,
                    "unit": null
                },
                "20.1.4": {
                    "title": "Komunikacija s slepim, slabovidnim pacientom",
                    "type": "str",
                    "hint": "Pri pogovoru s pacientko sem jo pogledala v obraz in sem se postavila tako, da me je tudi ona videla v obraz.",
                    "value": null,
                    "unit": null
                },
                "20.1.5": {
                    "title": "Pogovor s pacientom",
                    "type": "str",
                    "hint": "Čim več sem se pogovarjala z njo, da bi ustvarila stik in zaupanje med nama.",
                    "value": null,
                    "unit": null
                },
                "20.1.6": {
                    "title": "Poslušanje pacienta",
                    "type": "str",
                    "hint": "Kadar pacientka govori, jo pozorno poslušam, da bi se ona bolj prijetno počutila.",
                    "value": null,
                    "unit": null
                },
                "20.1.7": {
                    "title": "Posredovanje in sprejemanje informacij v zvezi z zdravstveno nego",
                    "type": "str",
                    "hint": "Pri vsakem koraku zdravstvene nege sem pacientki naglas in razločno povedala kaj bom naredila in kaj more ona narediti.",
                    "value": null,
                    "unit": null
                },
                "20.1.8": {
                    "title": "Razumevanje pacientovega doživljanja (besedna in nebesedna komunikacija)",
                    "type": "str",
                    "hint": "Prek pogovora s pacientko in pregledovanja dokumentacije sem ugotovila kaj je pacientka doživela, kako ni prepoznala svojce, da je bila hospitalizirana na Nevrološki kliniki...in sem čim bolj poskušala razumeti njeno doživljanje. Pacientka mi je verbalno in neverbalno povedala, da je zaskrbljena.",
                    "value": null,
                    "unit": null
                },
                "20.1.9": {
                    "title": "Sporočanje in dokumentiranje aktivnosti v zvezi z komunikacijo",
                    "type": "str",
                    "hint": "Podatke in posebnosti v zvezi s komunikacijo in izražanju čustev sem dokumentirala v poročilo ZN.",
                    "value": null,
                    "unit": null
                }
            }
        }
    }
};

// Update Category 21 - IZRAŽANJE DUHOVNIH POTREB - ocena stopnje samooskrbe pacienta
formData.categories['21'] = {
    "title": "IZRAŽANJE DUHOVNIH POTREB - ocena stopnje samooskrbe pacienta",
    "description": "ocena stopnje samooskrbe pacienta",
    "url": "duhovne-potrebe",
    "color": "#DDD6FE",
    "subcategories": {
        "21.1": {
            "title": "Samostojnost pacienta pri življenjski aktivnosti izražanje duhovnih potreb",
            "description": null,
            "elements": {
                "21.1.1": {
                    "title": "Stopnja samostojnosti pri izražanju duhovnih potreb",
                    "type": "str",
                    "option_type": "one",
                    "options": [
                        "pacient samostojno izraža duhovne potrebe",
                        "pacient želi podporo pri izražanju duhovnih potreb",
                        "pacient potrebuje pomoč pri izražanju duhovnih potreb",
                        "pacient ne izraža duhovnih potreb"
                    ],
                    "hint": "pacient želi podporo pri izražanju duhovnih potreb",
                    "value": null,
                    "unit": null
                }
            }
        },
        "21.2": {
            "title": "Ocena stanja pacienta pri izražanju duhovnih potreb",
            "description": null,
            "elements": {
                "21.2.1": {
                    "title": "Pacientovo versko prepričanje",
                    "type": "str",
                    "option_type": "one",
                    "options": [
                        "katoliško",
                        "pravoslavno",
                        "protestantsko",
                        "islamsko",
                        "judovsko",
                        "budistično",
                        "ateist",
                        "agnostik",
                        "drugo"
                    ],
                    "hint": "katoliško",
                    "value": null,
                    "unit": null
                },
                "21.2.2": {
                    "title": "Pacientove želje v zvezi z zadovoljevanjem duhovnih potreb",
                    "type": "str",
                    "hint": "potreba po ljubezni, odpuščanju, pomenu in smislu življenja: molitev vsak dan, odhod v cerkev",
                    "value": null,
                    "unit": null
                }
            }
        }
    }
};

// Update Category 22 - Aktivnosti zdravstvene nege - izražanje duhovnih potreb
formData.categories['22'] = {
    "title": "Aktivnosti zdravstvene nege pri življenjski aktivnosti izražanje duhovnih potreb",
    "description": "Podatki o izvedeni aktivnosti zdravstvene nege",
    "url": "aktivnosti-duhovnost",
    "color": "#DDD6FE",
    "subcategories": {
        "22.1": {
            "title": "Aktivnosti zdravstvene nege",
            "description": null,
            "elements": {
                "22.1.1": {
                    "title": "Datum izvedbe",
                    "type": "date",
                    "defaultValue": "danes",
                    "hint": "7.10.2025",
                    "value": null,
                    "unit": null
                },
                "22.1.2": {
                    "title": "Identifikacija pacienta",
                    "type": "str",
                    "hint": "Identifikacija pravega pacienta (vprašala sem po imenu, priimku, datumu rojstva, preverila sem zapestnico in dokumentacijo).",
                    "value": null,
                    "unit": null
                },
                "22.1.3": {
                    "title": "Ocena stopnje samooskrbe v zvezi z izražanjem duhovnih potreb",
                    "type": "str",
                    "hint": "Z opazovanjem pacientove okolice, opazovanjem na splošno in pogovorom s pacientko sem ugotovila, da je pacientka katoliške vere.",
                    "value": null,
                    "unit": null
                },
                "22.1.4": {
                    "title": "Sporočanje in dokumentiranje aktivnosti v zvezi z izražanjem duhovnih potreb",
                    "type": "str",
                    "hint": "Podatke in posebnosti v zvezi z izražanjem duhovnih potreb sem dokumentirala v poročilo ZN.",
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

console.log('✅ Updated categories 19, 20, 21, and 22');
console.log('Category 19 (Komunikacija) subcategories:', Object.keys(formData.categories['19'].subcategories));
console.log('Category 20 (Aktivnosti komunikacija) elements:', Object.keys(formData.categories['20'].subcategories['20.1'].elements).length);
console.log('Category 21 (Duhovne potrebe) subcategories:', Object.keys(formData.categories['21'].subcategories));
console.log('Category 22 (Aktivnosti duhovnost) elements:', Object.keys(formData.categories['22'].subcategories['22.1'].elements).length);
