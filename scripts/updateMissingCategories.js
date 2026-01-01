// Script to add missing sections: Aplikacija zdravil, Diagnostika, Terapevtski program, Rane, Preprečevanje okužb

import fs from 'fs';

// Load the current data
const formData = JSON.parse(
    fs.readFileSync('c:/Users/linca/MediForm/scripts/zdravstvena-nega-for-upload.json', 'utf8')
);

// Renumber categories - we need to add new categories and update existing 29
// Current: 1-28 (life activities), 29 (okužbe basic)
// New structure:
// 29: Aplikacija zdravil
// 30: Aktivnosti ZN pri aplikaciji zdravil
// 31: Diagnostično terapevtske preiskave
// 32: Aktivnosti ZN pri diagnostiki
// 33: Terapevtski program
// 34: Rane
// 35: Aktivnosti ZN pri oskrbi rane
// 36: Preprečevanje in obvladovanje okužb (expanded)

// Save old category 29 data
const oldCategory29 = formData.categories['29'];

// Category 29 - APLIKACIJA ZDRAVIL (new)
formData.categories['29'] = {
    "title": "APLIKACIJA ZDRAVIL",
    "description": "Podatki o aplikaciji zdravil",
    "url": "aplikacija-zdravil",
    "color": "#FED7AA",
    "subcategories": {
        "29.1": {
            "title": "Podatki o aplikaciji zdravil",
            "description": null,
            "elements": {
                "29.1.1": {
                    "title": "Način aplikacije zdravil",
                    "type": "str",
                    "option_type": "many",
                    "options": [
                        "per os (peroralno)",
                        "subkutano (s.c.)",
                        "intramuskularno (i.m.)",
                        "intravenozno (i.v.)",
                        "sublingualno",
                        "rektalno",
                        "transdermalno (na kožo)",
                        "inhalacijsko",
                        "na sluznico",
                        "v oko",
                        "v uho"
                    ],
                    "hint": "per os (peroralno)",
                    "value": null,
                    "unit": null
                },
                "29.1.2": {
                    "title": "Posebnosti pri aplikaciji zdravil",
                    "type": "str",
                    "hint": "ni posebnosti",
                    "value": null,
                    "unit": null
                }
            }
        }
    }
};

// Category 30 - Aktivnosti zdravstvene nege pri aplikaciji zdravila
formData.categories['30'] = {
    "title": "Aktivnosti zdravstvene nege pri aplikaciji zdravila",
    "description": "Podatki o izvedeni aktivnosti zdravstvene nege",
    "url": "aktivnosti-zdravila",
    "color": "#FED7AA",
    "subcategories": {
        "30.1": {
            "title": "Aktivnosti zdravstvene nege",
            "description": null,
            "elements": {
                "30.1.1": {
                    "title": "Datum izvedbe",
                    "type": "date",
                    "defaultValue": "danes",
                    "hint": "7.10.2025",
                    "value": null,
                    "unit": null
                },
                "30.1.2": {
                    "title": "Identifikacija pacienta",
                    "type": "str",
                    "hint": "Identifikacija pravega pacienta (vprašala sem po imenu, priimku, datumu rojstva, preverila sem zapestnico in dokumentacijo).",
                    "value": null,
                    "unit": null
                },
                "30.1.3": {
                    "title": "Dajanje zdravil per os, na kožo, sluznico ter na druge neinvazivne načine",
                    "type": "str",
                    "hint": "Upoštevala sem pravilo 11 P-jev. Pri zajtrku sem pacientki dala zdravila, ki jih je zaužila peroralno in sem preverila in se prepričala, da jih je zares zaužila.",
                    "value": null,
                    "unit": null
                },
                "30.1.4": {
                    "title": "Opazovanje pacienta med in po dajanju zdravil, učinkovin in krvnih pripravkov",
                    "type": "str",
                    "hint": "Opazovala sem pacientko med in po dajanju zdravil per os, če so bile kakšne reakcije ali posebnosti, neželeni učinki, če je vse zdravila zaužila...",
                    "value": null,
                    "unit": null
                },
                "30.1.5": {
                    "title": "Sporočanje in dokumentiranje aktivnosti v zvezi z aktivnosti priprave in dajanja zdravil",
                    "type": "str",
                    "hint": "Podatke in posebnosti v zvezi z zdravili in aplikacijo zdravil sem dokumentirala v poročilo ZN in obvestila sobno medicinsko sestro.",
                    "value": null,
                    "unit": null
                }
            }
        }
    }
};

// Category 31 - Diagnostično terapevtske preiskave
formData.categories['31'] = {
    "title": "Diagnostično terapevtske preiskave",
    "description": "Podatki o diagnostično terapevtskih preiskavah",
    "url": "diagnostika",
    "color": "#C4B5FD",
    "subcategories": {
        "31.1": {
            "title": "Diagnostično terapevtska preiskava",
            "description": null,
            "elements": {
                "31.1.1": {
                    "title": "Vrsta diagnostično terapevtske preiskave",
                    "type": "str",
                    "option_type": "many",
                    "options": [
                        "/",
                        "RTG",
                        "CT",
                        "MRI",
                        "UZ",
                        "EKG",
                        "EEG",
                        "endoskopija",
                        "biopsija",
                        "laboratorijske preiskave",
                        "druge preiskave"
                    ],
                    "hint": "/",
                    "value": null,
                    "unit": null
                },
                "31.1.2": {
                    "title": "Datum in ura preiskave",
                    "type": "str",
                    "hint": "/",
                    "value": null,
                    "unit": null
                },
                "31.1.3": {
                    "title": "Priprava pacienta na diagnostično terapevtsko preiskavo",
                    "type": "str",
                    "hint": "/",
                    "value": null,
                    "unit": null
                },
                "31.1.4": {
                    "title": "Odvzem vzorca za preiskavo (vrsta vzorca)",
                    "type": "str",
                    "option_type": "many",
                    "options": [
                        "/",
                        "kri",
                        "urin",
                        "blato",
                        "sputum",
                        "bris",
                        "likvor",
                        "tkivo"
                    ],
                    "hint": "/",
                    "value": null,
                    "unit": null
                }
            }
        }
    }
};

// Category 32 - Aktivnosti zdravstvene nege pri izvajanju diagnostično-terapevtskega programa
formData.categories['32'] = {
    "title": "Aktivnosti zdravstvene nege pri izvajanju diagnostično-terapevtskega programa",
    "description": "Podatki o izvedeni aktivnosti zdravstvene nege",
    "url": "aktivnosti-diagnostika",
    "color": "#C4B5FD",
    "subcategories": {
        "32.1": {
            "title": "Aktivnosti zdravstvene nege",
            "description": null,
            "elements": {
                "32.1.1": {
                    "title": "Datum izvedbe",
                    "type": "date",
                    "defaultValue": "danes",
                    "hint": "7.10.2025",
                    "value": null,
                    "unit": null
                },
                "32.1.2": {
                    "title": "Identifikacija pacienta",
                    "type": "str",
                    "hint": "Identifikacija pravega pacienta (vprašala sem po imenu, priimku, datumu rojstva, preverila sem zapestnico in dokumentacijo).",
                    "value": null,
                    "unit": null
                },
                "32.1.3": {
                    "title": "Priprava pacienta na diagnostično-terapevtsko preiskavo",
                    "type": "str",
                    "hint": "Pacientki sem pojasnila potek preiskave, zagotovila udobje in jo spremljala med pripravo.",
                    "value": null,
                    "unit": null
                },
                "32.1.4": {
                    "title": "Odvzem vzorcev za preiskave",
                    "type": "str",
                    "hint": "Odvzela sem vzorec krvi/urina/... po naročilu zdravnika.",
                    "value": null,
                    "unit": null
                },
                "32.1.5": {
                    "title": "Opazovanje pacienta med in po preiskavi",
                    "type": "str",
                    "hint": "Opazovala sem pacientko med in po preiskavi za morebitne zaplete.",
                    "value": null,
                    "unit": null
                },
                "32.1.6": {
                    "title": "Sporočanje in dokumentiranje aktivnosti v zvezi z diagnostično-terapevtskim programom",
                    "type": "str",
                    "hint": "Podatke in posebnosti v zvezi z diagnostično-terapevtskim programom sem dokumentirala v poročilo ZN.",
                    "value": null,
                    "unit": null
                }
            }
        }
    }
};

// Category 33 - Terapevtski program
formData.categories['33'] = {
    "title": "Terapevtski program",
    "description": "Podatki o terapevtskem programu",
    "url": "terapevtski-program",
    "color": "#99F6E4",
    "subcategories": {
        "33.1": {
            "title": "Terapevtski program",
            "description": null,
            "elements": {
                "33.1.1": {
                    "title": "Fizioterapija",
                    "type": "str",
                    "option_type": "one",
                    "options": [
                        "/",
                        "1×/dan",
                        "2×/dan",
                        "3×/dan",
                        "po potrebi"
                    ],
                    "hint": "1×/dan",
                    "value": null,
                    "unit": null
                },
                "33.1.2": {
                    "title": "Posebnosti fizioterapije",
                    "type": "str",
                    "hint": "/",
                    "value": null,
                    "unit": null
                },
                "33.1.3": {
                    "title": "Delovna terapija",
                    "type": "str",
                    "option_type": "one",
                    "options": [
                        "/",
                        "1×/dan",
                        "2×/dan",
                        "po potrebi"
                    ],
                    "hint": "/",
                    "value": null,
                    "unit": null
                },
                "33.1.4": {
                    "title": "Posebnosti delovne terapije",
                    "type": "str",
                    "hint": "/",
                    "value": null,
                    "unit": null
                },
                "33.1.5": {
                    "title": "Logopedija",
                    "type": "str",
                    "option_type": "one",
                    "options": [
                        "/",
                        "1×/dan",
                        "2×/dan",
                        "po potrebi"
                    ],
                    "hint": "/",
                    "value": null,
                    "unit": null
                },
                "33.1.6": {
                    "title": "Druge terapije",
                    "type": "str",
                    "hint": "/",
                    "value": null,
                    "unit": null
                }
            }
        }
    }
};

// Category 34 - Rane
formData.categories['34'] = {
    "title": "Rane",
    "description": "Ocena in oskrba ran",
    "url": "rane",
    "color": "#FECACA",
    "subcategories": {
        "34.1": {
            "title": "Akutna rana",
            "description": null,
            "elements": {
                "34.1.1": {
                    "title": "Vrsta akutne rane",
                    "type": "str",
                    "option_type": "many",
                    "options": [
                        "/",
                        "kirurška rana",
                        "travmatska rana",
                        "odrgnina",
                        "vreznina",
                        "zbodna rana",
                        "opeklina",
                        "ozebline"
                    ],
                    "hint": "/",
                    "value": null,
                    "unit": null
                },
                "34.1.2": {
                    "title": "Izgled in ocena akutne rane",
                    "type": "str",
                    "hint": "/",
                    "value": null,
                    "unit": null
                },
                "34.1.3": {
                    "title": "Preveza akutne rane",
                    "type": "str",
                    "hint": "/",
                    "value": null,
                    "unit": null
                }
            }
        },
        "34.2": {
            "title": "Kronična rana",
            "description": null,
            "elements": {
                "34.2.1": {
                    "title": "Vrsta kronične rane",
                    "type": "str",
                    "option_type": "many",
                    "options": [
                        "/",
                        "razjeda zaradi pritiska (dekubitus)",
                        "golenja razjeda (ulcus cruris)",
                        "diabetična razjeda",
                        "druge kronične rane"
                    ],
                    "hint": "/",
                    "value": null,
                    "unit": null
                },
                "34.2.2": {
                    "title": "Izgled in ocena kronične rane",
                    "type": "str",
                    "hint": "/",
                    "value": null,
                    "unit": null
                },
                "34.2.3": {
                    "title": "Preveza kronične rane",
                    "type": "str",
                    "hint": "/",
                    "value": null,
                    "unit": null
                }
            }
        }
    }
};

// Category 35 - Aktivnosti zdravstvene nege pri oskrbi rane
formData.categories['35'] = {
    "title": "Aktivnosti zdravstvene nege pri oskrbi rane",
    "description": "Podatki o izvedeni aktivnosti zdravstvene nege",
    "url": "aktivnosti-rane",
    "color": "#FECACA",
    "subcategories": {
        "35.1": {
            "title": "Aktivnosti zdravstvene nege",
            "description": null,
            "elements": {
                "35.1.1": {
                    "title": "Datum izvedbe",
                    "type": "date",
                    "defaultValue": "danes",
                    "hint": "7.10.2025",
                    "value": null,
                    "unit": null
                },
                "35.1.2": {
                    "title": "Identifikacija pacienta",
                    "type": "str",
                    "hint": "Identifikacija pravega pacienta (vprašala sem po imenu, priimku, datumu rojstva, preverila sem zapestnico in dokumentacijo).",
                    "value": null,
                    "unit": null
                },
                "35.1.3": {
                    "title": "Ocena rane",
                    "type": "str",
                    "hint": "Ocenila sem izgled, velikost, globino rane, prisotnost izločka...",
                    "value": null,
                    "unit": null
                },
                "35.1.4": {
                    "title": "Preveza rane",
                    "type": "str",
                    "hint": "Prevezala sem rano z aseptično tehniko, uporabila ustrezne obloge...",
                    "value": null,
                    "unit": null
                },
                "35.1.5": {
                    "title": "Opazovanje pacienta",
                    "type": "str",
                    "hint": "Opazovala sem znake okužbe, bolečino, celjenje rane...",
                    "value": null,
                    "unit": null
                },
                "35.1.6": {
                    "title": "Sporočanje in dokumentiranje aktivnosti v zvezi z oskrbo rane",
                    "type": "str",
                    "hint": "Podatke in posebnosti v zvezi z rano sem dokumentirala v poročilo ZN.",
                    "value": null,
                    "unit": null
                }
            }
        }
    }
};

// Category 36 - Preprečevanje in obvladovanje okužb (expanded from old 29)
formData.categories['36'] = {
    "title": "Aktivnosti zdravstvene nege – Preprečevanje in obvladovanje okužb, povezanih z zdravstvom",
    "description": "Podatki o izvedeni aktivnosti zdravstvene nege",
    "url": "aktivnosti-okuzbe",
    "color": "#EF4444",
    "subcategories": {
        "36.1": {
            "title": "Aktivnosti zdravstvene nege",
            "description": null,
            "elements": {
                "36.1.1": {
                    "title": "Datum izvedbe",
                    "type": "date",
                    "defaultValue": "danes",
                    "hint": "7.10.2025",
                    "value": null,
                    "unit": null
                },
                "36.1.2": {
                    "title": "Izvajanje ukrepov za preprečevanje in obvladovanja okužb povezanih z zdravstvom",
                    "type": "str",
                    "hint": "Pravilno umivanje in razkuževanje rok, menjava rokavic, pravilna uporaba OVO, razkuževanje okolice, pravilo 11P, previdno ravnanje s pacientovimi tekočinami in izločki, pravilno ločevanje odpadkov...",
                    "value": null,
                    "unit": null
                },
                "36.1.3": {
                    "title": "Higiensko vzdrževanje neposredne pacientove okolice",
                    "type": "str",
                    "hint": "Redno in večkratno razkuževanje pacientove okolice in posteljne blazine z razkužilnimi alkoholnimi robčki.",
                    "value": null,
                    "unit": null
                },
                "36.1.4": {
                    "title": "Ukrepi za preprečevanje križanja čistih in nečistih poti, predmetov materialov in ljudi in zagotavljanje pogojev za transport",
                    "type": "str",
                    "hint": "Vidno umazano perilo sem prijela z rokavicami in predpasnikom, čisto perilo pa brez rokavic in predpasnika, v spodnji polici negovalnega vozička so umazane stvari, v zgornji dve polici pa čiste stvari.",
                    "value": null,
                    "unit": null
                },
                "36.1.5": {
                    "title": "Ravnanje z odpadki v skladu s predpisi in zakonodajo",
                    "type": "str",
                    "hint": "Pravilno ravnanje in ločevanje odpadkov (perilo, odpadki iz zdravstva, ostri predmeti...). Pripomočke za enkratno uporabo sem vrgla v moder koš, perilo pa v koš za perilo.",
                    "value": null,
                    "unit": null
                },
                "36.1.6": {
                    "title": "Izbira in uporaba osebne varovalne opreme",
                    "type": "str",
                    "hint": "Pravilna uporaba osebne varovalne opreme (OVO), uporabila sem predpasnik, zaščitno masko in rokavice.",
                    "value": null,
                    "unit": null
                },
                "36.1.7": {
                    "title": "Sporočanje in dokumentiranje aktivnosti v zvezi z preprečevanjem in obvladovanjem okužb povezanih z zdravstvom",
                    "type": "str",
                    "hint": "Podatke in posebnosti v zvezi s preprečevanje in obvladovanjem okužb povezanih z zdravstvom sem dokumentirala v poročilo ZN.",
                    "value": null,
                    "unit": null
                }
            }
        },
        "36.2": {
            "title": "Higiena rok",
            "description": null,
            "elements": {
                "36.2.1": {
                    "title": "Izvajanje higiene rok",
                    "type": "str",
                    "option_type": "many",
                    "options": [
                        "pred stikom s pacientom",
                        "pred aseptičnim postopkom",
                        "po izpostavitvi telesnim tekočinam",
                        "po stiku s pacientom",
                        "po stiku s pacientovo okolico"
                    ],
                    "hint": "pred in po vsakem stiku",
                    "value": null,
                    "unit": null
                }
            }
        },
        "36.3": {
            "title": "Izolacija",
            "description": null,
            "elements": {
                "36.3.1": {
                    "title": "Potreba po izolaciji",
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
                "36.3.2": {
                    "title": "Vrsta izolacije",
                    "type": "str",
                    "option_type": "one",
                    "options": [
                        "/",
                        "kontaktna",
                        "kapljična",
                        "aerogena",
                        "zaščitna (reverzna)"
                    ],
                    "hint": "/",
                    "value": null,
                    "unit": null
                },
                "36.3.3": {
                    "title": "Uporaba osebne varovalne opreme",
                    "type": "str",
                    "option_type": "many",
                    "options": [
                        "rokavice",
                        "predpasnik/halja",
                        "maska",
                        "zaščitna očala",
                        "pokrivalo za lase"
                    ],
                    "hint": "rokavice",
                    "value": null,
                    "unit": null
                }
            }
        },
        "36.4": {
            "title": "Aseptični postopki",
            "description": null,
            "elements": {
                "36.4.1": {
                    "title": "Izvedeni aseptični postopki",
                    "type": "str",
                    "option_type": "many",
                    "options": [
                        "/",
                        "preveza rane",
                        "kateterizacija",
                        "aspiracija",
                        "venepunkcija",
                        "nameščanje i.v. kanile"
                    ],
                    "hint": "/",
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

console.log('✅ Added/Updated categories 29-36');
console.log('Category 29 (Aplikacija zdravil)');
console.log('Category 30 (Aktivnosti aplikacija zdravil)');
console.log('Category 31 (Diagnostično terapevtske preiskave)');
console.log('Category 32 (Aktivnosti diagnostika)');
console.log('Category 33 (Terapevtski program)');
console.log('Category 34 (Rane)');
console.log('Category 35 (Aktivnosti rane)');
console.log('Category 36 (Preprečevanje okužb - razširjeno)');
console.log('\nTotal categories:', Object.keys(formData.categories).length);
