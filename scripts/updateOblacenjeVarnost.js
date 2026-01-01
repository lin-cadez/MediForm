// Script to update oblačenje/slačenje and varno okolje sections

import fs from 'fs';

// Load the current data
const formData = JSON.parse(
    fs.readFileSync('c:/Users/linca/MediForm/scripts/zdravstvena-nega-for-upload.json', 'utf8')
);

// Update Category 15 - OBLAČENJE IN SLAČENJE - ocena stopnje samooskrbe pacienta
formData.categories['15'] = {
    "title": "OBLAČENJE IN SLAČENJE - ocena stopnje samooskrbe pacienta",
    "description": "ocena stopnje samooskrbe pacienta",
    "url": "oblacenje-slacenje",
    "color": "#FEE2E2",
    "subcategories": {
        "15.1": {
            "title": "Samostojnost pacienta pri oblačenju in slačenju",
            "description": null,
            "elements": {
                "15.1.1": {
                    "title": "Stopnja samostojnosti pri oblačenju in slačenju",
                    "type": "str",
                    "option_type": "one",
                    "options": [
                        "pacient se samostojno obleče in sleče",
                        "pacient je delno samostojen: potrebuje nadzor, usmerjanje oz. delno pomoč",
                        "pacient je popolnoma odvisen od pomoči pri oblačenju in slačenju"
                    ],
                    "hint": "pacient se samostojno obleče in sleče",
                    "value": null,
                    "unit": null
                }
            }
        },
        "15.2": {
            "title": "Ocena stanja pacienta pri oblačenju in slačenju",
            "description": null,
            "elements": {
                "15.2.1": {
                    "title": "Obleka - pacient je oblečen v",
                    "type": "str",
                    "option_type": "one",
                    "options": [
                        "lastna oblačila",
                        "bolnišnična oblačila"
                    ],
                    "hint": "bolnišnična oblačila",
                    "value": null,
                    "unit": null
                },
                "15.2.2": {
                    "title": "Vrsta bolnišničnih oblačil",
                    "type": "str",
                    "option_type": "many",
                    "options": [
                        "zgornji del pižame",
                        "spodnji del pižame",
                        "bolniška srajca",
                        "bolniške hlače"
                    ],
                    "hint": "zgornji in spodnji del pižame",
                    "value": null,
                    "unit": null
                },
                "15.2.3": {
                    "title": "Samostojnost pri oblačenju zgornjih delov oblačil",
                    "type": "str",
                    "option_type": "one",
                    "options": [
                        "samostojno obleče in sleče zgornje dele oblačil",
                        "potrebuje pomoč pri oblačenju zgornjih delov",
                        "popolnoma odvisen"
                    ],
                    "hint": "samostojno obleče in sleče zgornje dele oblačil",
                    "value": null,
                    "unit": null
                },
                "15.2.4": {
                    "title": "Samostojnost pri oblačenju hlač, krila",
                    "type": "str",
                    "option_type": "one",
                    "options": [
                        "samostojno obleče in sleče hlače, krilo",
                        "potrebuje pomoč pri oblačenju hlač, krila",
                        "popolnoma odvisen"
                    ],
                    "hint": "samostojno obleče in sleče hlače, krilo",
                    "value": null,
                    "unit": null
                },
                "15.2.5": {
                    "title": "Zapenjanje gumbov",
                    "type": "str",
                    "option_type": "one",
                    "options": [
                        "samostojno zapenja in odpenja gumbe",
                        "potrebuje pomoč pri zapenjanju gumbov",
                        "ne more zapenjati gumbov"
                    ],
                    "hint": "samostojno zapenja in odpenja gumbe",
                    "value": null,
                    "unit": null
                },
                "15.2.6": {
                    "title": "Obutev - pacient je obut v",
                    "type": "str",
                    "option_type": "one",
                    "options": [
                        "lastno obutev",
                        "bolnišnično obutev",
                        "brez obutve"
                    ],
                    "hint": "lastno obutev",
                    "value": null,
                    "unit": null
                },
                "15.2.7": {
                    "title": "Vrsta obutve",
                    "type": "str",
                    "hint": "copati",
                    "value": null,
                    "unit": null
                },
                "15.2.8": {
                    "title": "Samostojnost pri obuvanju",
                    "type": "str",
                    "option_type": "many",
                    "options": [
                        "samostojno obuje, sezuje copate, čevlje",
                        "samostojno obuje, sezuje nogavice",
                        "samostojno zaveže, odveže vezalke",
                        "potrebuje pomoč pri obuvanju",
                        "potrebuje pomoč pri sezuvanju"
                    ],
                    "hint": "samostojno obuje, sezuje copate, čevlje, samostojno obuje, sezuje nogavice, samostojno zaveže, odveže vezalke",
                    "value": null,
                    "unit": null
                },
                "15.2.9": {
                    "title": "Izbira oblačil, obutve",
                    "type": "str",
                    "option_type": "one",
                    "options": [
                        "pacient samostojno izbere ustrezno oblačilo glede na temperaturo okolja, dejavnosti",
                        "pacient potrebuje pomoč pri izbiri oblačil",
                        "pacient ne more izbirati oblačil"
                    ],
                    "hint": "pacient samostojno izbere ustrezno oblačilo glede na temperaturo okolja, dejavnosti",
                    "value": null,
                    "unit": null
                },
                "15.2.10": {
                    "title": "Nakit - pacient uporablja nakit",
                    "type": "str",
                    "hint": "ročna ura",
                    "value": null,
                    "unit": null
                },
                "15.2.11": {
                    "title": "Samostojnost pri namestitvi nakita",
                    "type": "str",
                    "option_type": "one",
                    "options": [
                        "je samostojen pri namestitvi, odstranitvi nakita",
                        "potrebuje pomoč pri namestitvi nakita",
                        "ne uporablja nakita"
                    ],
                    "hint": "je samostojen pri namestitvi, odstranitvi nakita",
                    "value": null,
                    "unit": null
                },
                "15.2.12": {
                    "title": "Ovire pri oblačenju, slačenju, obuvanju",
                    "type": "str",
                    "option_type": "many",
                    "options": [
                        "brez ovir",
                        "bolečina",
                        "okorelost",
                        "pareza/plegija",
                        "omejena gibljivost",
                        "tremor"
                    ],
                    "hint": "/",
                    "value": null,
                    "unit": null
                }
            }
        }
    }
};

// Update Category 16 - Aktivnosti zdravstvene nege - oblačenje in slačenje
formData.categories['16'] = {
    "title": "Aktivnosti zdravstvene nege pri življenjski aktivnosti oblačenje in slačenje",
    "description": "Podatki o izvedeni aktivnosti zdravstvene nege",
    "url": "aktivnosti-oblacenje",
    "color": "#FEE2E2",
    "subcategories": {
        "16.1": {
            "title": "Aktivnosti zdravstvene nege",
            "description": null,
            "elements": {
                "16.1.1": {
                    "title": "Datum izvedbe",
                    "type": "date",
                    "defaultValue": "danes",
                    "hint": "7.10.2025",
                    "value": null,
                    "unit": null
                },
                "16.1.2": {
                    "title": "Identifikacija pacienta",
                    "type": "str",
                    "hint": "Identifikacija pravega pacienta (vprašala sem po imenu, priimku, datumu rojstva, preverila sem zapestnico in dokumentacijo).",
                    "value": null,
                    "unit": null
                },
                "16.1.3": {
                    "title": "Ocena stopnje samooskrbe v zvezi z oblačenjem in slačenjem",
                    "type": "str",
                    "hint": "Z opazovanjem, pogovorom s pacientko in sobno medicinsko sestro.",
                    "value": null,
                    "unit": null
                },
                "16.1.4": {
                    "title": "Izbira ustreznih oblačil in obutve",
                    "type": "str",
                    "hint": "Izbrala sem pravilno bolniško oblačilo in pravilno velikost (L).",
                    "value": null,
                    "unit": null
                },
                "16.1.5": {
                    "title": "Sporočanje in dokumentiranje aktivnosti v zvezi z oblačenjem in slačenjem",
                    "type": "str",
                    "hint": "Podatke in posebnosti v zvezi z oblačenjem in slačenjem sem dokumentirala v poročilo ZN.",
                    "value": null,
                    "unit": null
                }
            }
        }
    }
};

// Update Category 17 - ZAGOTAVLJANJE VARNEGA OKOLJA - ocena stopnje samooskrbe pacienta
formData.categories['17'] = {
    "title": "ZAGOTAVLJANJE VARNEGA OKOLJA - ocena stopnje samooskrbe pacienta",
    "description": "ocena stopnje samooskrbe pacienta",
    "url": "varno-okolje",
    "color": "#FECACA",
    "subcategories": {
        "17.1": {
            "title": "Samostojnost pri življenjski aktivnosti izogibanje nevarnostim v okolju",
            "description": null,
            "elements": {
                "17.1.1": {
                    "title": "Stopnja samostojnosti pri izogibanju nevarnostim",
                    "type": "str",
                    "option_type": "one",
                    "options": [
                        "pacient je sposoben zaznati, prepoznati in odpraviti nevarnosti v svojem okolju",
                        "pacient je delno sposoben zaznati, prepoznati in odpraviti nevarnosti v svojem okolju: potrebuje nadzor, usmerjanje oz. delno pomoč",
                        "pacient ni sposoben zaznati, prepoznati in odpraviti nevarnosti v svojem okolju: potrebuje popolno pomoč"
                    ],
                    "hint": "pacient je delno sposoben zaznati, prepoznati in odpraviti nevarnosti v svojem okolju: potrebuje nadzor, usmerjanje oz. delno pomoč",
                    "value": null,
                    "unit": null
                }
            }
        },
        "17.2": {
            "title": "Vplivi na sposobnost izogibanja nevarnostim v okolju",
            "description": null,
            "elements": {
                "17.2.1": {
                    "title": "Vplivi na sposobnost izogibanja nevarnostim",
                    "type": "str",
                    "option_type": "many",
                    "options": [
                        "brez vplivov",
                        "rahle motnje ravnotežja, gibanja",
                        "hude motnje ravnotežja, gibanja",
                        "slabovidnost",
                        "slepota",
                        "naglušnost",
                        "gluhota",
                        "motnje spomina",
                        "dezorientiranost",
                        "zmedenost",
                        "demenca",
                        "psihiatrična bolezen",
                        "epilepsija",
                        "vpliv zdravil"
                    ],
                    "hint": "rahle motnje ravnotežja, gibanja, slabovidnost",
                    "value": null,
                    "unit": null
                },
                "17.2.2": {
                    "title": "Drugo - vplivi na sposobnost izogibanja nevarnostim",
                    "type": "str",
                    "hint": "pacientka je na začetku hospitalizacije imela motnje spomina in je bila na splošno dezorientirana zaradi epileptičnega napada po možganski krvavitvi",
                    "value": null,
                    "unit": null
                }
            }
        },
        "17.3": {
            "title": "Ukrepi za zagotavljanje varnosti",
            "description": null,
            "elements": {
                "17.3.1": {
                    "title": "Ukrepi za zagotavljanje varnosti",
                    "type": "str",
                    "option_type": "many",
                    "options": [
                        "izvajanje standardnih ukrepov za preprečevanje bolnišničnih okužb",
                        "prilagoditev okolja za zagotavljanje varnosti",
                        "klicna naprava v dosegu rok",
                        "ležišče spuščeno na najnižjo višino",
                        "posteljne ograjice na obeh straneh",
                        "trapez v dosegu rok",
                        "varna aplikacija terapije",
                        "spremstvo ob hoji",
                        "identifikacijska zapestnica",
                        "odstranitev nevarnih predmetov",
                        "nedrseča tla"
                    ],
                    "hint": "izvajanje standardnih ukrepov za preprečevanje bolnišničnih okužb, prilagoditev okolja za zagotavljanje varnosti",
                    "value": null,
                    "unit": null
                },
                "17.3.2": {
                    "title": "Prilagoditev okolja za zagotavljanje varnosti - opis",
                    "type": "str",
                    "hint": "klicna naprava v dosegu rok, ležišče spustimo na najnižjo višino, izvajamo ukrepe za preprečevanje bolnišničnih okužb, posteljne ograjice na obeh straneh, varna aplikacija terapije...",
                    "value": null,
                    "unit": null
                }
            }
        }
    }
};

// Update Category 18 - Aktivnosti zdravstvene nege - zagotavljanje varnega okolja
formData.categories['18'] = {
    "title": "Aktivnosti zdravstvene nege pri življenjski aktivnosti izogibanje nevarnostim v okolju",
    "description": "Podatki o izvedeni aktivnosti zdravstvene nege",
    "url": "aktivnosti-varnost",
    "color": "#FECACA",
    "subcategories": {
        "18.1": {
            "title": "Aktivnosti zdravstvene nege",
            "description": null,
            "elements": {
                "18.1.1": {
                    "title": "Datum izvedbe",
                    "type": "date",
                    "defaultValue": "danes",
                    "hint": "7.10.2025",
                    "value": null,
                    "unit": null
                },
                "18.1.2": {
                    "title": "Identifikacija pacienta",
                    "type": "str",
                    "hint": "Identifikacija pravega pacienta (vprašala sem po imenu, priimku, datumu rojstva, preverila sem zapestnico in dokumentacijo).",
                    "value": null,
                    "unit": null
                },
                "18.1.3": {
                    "title": "Ocena stopnje samooskrbe v zvezi z aktivnostjo zagotavljanja varnega okolja",
                    "type": "str",
                    "hint": "Z opazovanjem, pogovorom s pacientko in sobno medicinsko sestro.",
                    "value": null,
                    "unit": null
                },
                "18.1.4": {
                    "title": "Izvajanje ukrepov za preprečevanje okužb povezanih z zdravstvom",
                    "type": "str",
                    "hint": "Pravilna uporaba osebne varovalne opreme (OVO), večkratno dnevno razkuževanje pacientove okolice, tehnika nedotikanja...",
                    "value": null,
                    "unit": null
                },
                "18.1.5": {
                    "title": "Izvajanje aktivnosti za preprečevanje padca",
                    "type": "str",
                    "hint": "Postelja spuščena na najnižji višini dol, posteljne ograjice gor, spremstvo ob hoji...",
                    "value": null,
                    "unit": null
                },
                "18.1.6": {
                    "title": "Nameščanje klicnih naprav, identifikacijske zapestnice",
                    "type": "str",
                    "hint": "Klicna naprava vedno v dosegu rok pacientke, identifikacijska zapestnica vedno nameščena gor v roki.",
                    "value": null,
                    "unit": null
                },
                "18.1.7": {
                    "title": "Nameščanje postelje na varno višino",
                    "type": "str",
                    "hint": "Po opravljeni jutranji negi in vedno kadar je pacientka sama, je postelja spuščena dol v najnižjo višino.",
                    "value": null,
                    "unit": null
                },
                "18.1.8": {
                    "title": "Nameščanje posteljne ograje",
                    "type": "str",
                    "hint": "Posteljne ograjice so vedno nameščene gor, kadar pacientka leži.",
                    "value": null,
                    "unit": null
                },
                "18.1.9": {
                    "title": "Nameščanje trapeza",
                    "type": "str",
                    "hint": "Trapez vedno v dosegu rok pacientke.",
                    "value": null,
                    "unit": null
                },
                "18.1.10": {
                    "title": "Ocenjevanje tveganja za padec",
                    "type": "str",
                    "hint": "Pridobila z opazovanjem, pogovorom s pacientko in obdelavo Morsejine lestvice (srednje tveganje za padec).",
                    "value": null,
                    "unit": null
                },
                "18.1.11": {
                    "title": "Zagotavljanje varnega okolja",
                    "type": "str",
                    "hint": "Tla niso mokra, nedrseča, posteljna na nizki višini, ograjice na obeh straneh, trapez in klicna naprava v dosegu rok...",
                    "value": null,
                    "unit": null
                },
                "18.1.12": {
                    "title": "Sporočanje in dokumentiranje aktivnosti v zvezi z zagotavljanjem varnega okolja",
                    "type": "str",
                    "hint": "Podatke in posebnosti v zvezi z izogibanjem nevarnostim v okolju sem dokumentirala v poročilo ZN.",
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

console.log('✅ Updated categories 15, 16, 17, and 18');
console.log('Category 15 (Oblačenje) subcategories:', Object.keys(formData.categories['15'].subcategories));
console.log('Category 16 (Aktivnosti oblačenje) elements:', Object.keys(formData.categories['16'].subcategories['16.1'].elements).length);
console.log('Category 17 (Varno okolje) subcategories:', Object.keys(formData.categories['17'].subcategories));
console.log('Category 18 (Aktivnosti varno okolje) elements:', Object.keys(formData.categories['18'].subcategories['18.1'].elements).length);
