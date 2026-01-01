// Script to add missing sections to zdravstvena-nega.json based on Word document

import fs from 'fs';

// Load the current data
const formData = JSON.parse(
    fs.readFileSync('c:/Users/linca/MediForm/scripts/zdravstvena-nega-for-upload.json', 'utf8')
);

// Update Category 13 - OSEBNA HIGIENA IN UREJENOST
formData.categories['13'] = {
    "title": "OSEBNA HIGIENA IN UREJENOST - ocena stopnje samooskrbe pacienta",
    "description": "ocena stopnje samooskrbe pacienta",
    "url": "osebna-higiena",
    "color": "#FCE7F3",
    "subcategories": {
        "13.1": {
            "title": "Samostojnost pacienta pri vzdrževanju osebne higiene in urejenosti",
            "description": null,
            "elements": {
                "13.1.1": {
                    "title": "Stopnja samostojnosti pri osebni higieni",
                    "type": "str",
                    "option_type": "one",
                    "options": [
                        "popolnoma samostojen pri izvajanju osebne higiene",
                        "delno samostojen: potrebuje nadzor, usmerjanje oz. delno pomoč",
                        "popolnoma odvisen od pomoči pri izvajanju osebne higiene"
                    ],
                    "hint": "delno samostojen: potrebuje nadzor, usmerjanje oz. delno pomoč",
                    "value": null,
                    "unit": null
                }
            }
        },
        "13.2": {
            "title": "Način in navade izvajanja osebne higiene pacienta",
            "description": null,
            "elements": {
                "13.2.1": {
                    "title": "Jutranja osebna higiena pacienta",
                    "type": "str",
                    "option_type": "many",
                    "options": [
                        "ustna higiena",
                        "umivanje obraza",
                        "umivanje rok",
                        "prhanje stoje",
                        "prhanje sede",
                        "kopanje",
                        "umivanje las",
                        "britje",
                        "namazana koža z losjonom"
                    ],
                    "hint": "ustna higiena, prhanje sede, namazana koža z losjonom",
                    "value": null,
                    "unit": null
                },
                "13.2.2": {
                    "title": "Osebna higiena pacienta preko dneva",
                    "type": "str",
                    "hint": "/",
                    "value": null,
                    "unit": null
                },
                "13.2.3": {
                    "title": "Večerna osebna higiena pacienta",
                    "type": "str",
                    "hint": "/",
                    "value": null,
                    "unit": null
                },
                "13.2.4": {
                    "title": "Pacient se prha",
                    "type": "str",
                    "option_type": "one",
                    "options": [
                        "stoje",
                        "sede",
                        "leže",
                        "se ne prha"
                    ],
                    "hint": "sede",
                    "value": null,
                    "unit": null
                },
                "13.2.5": {
                    "title": "Pomoč pacientu pri izvajanju osebne higiene in urejenosti",
                    "type": "str",
                    "option_type": "many",
                    "options": [
                        "pomoč pri vzdrževanju primerne mikroklime",
                        "potrebna nastavitev temperature in pretoka vode",
                        "pomoč pri umivanju las, lasišča",
                        "pomoč pri umivanju obraza",
                        "pomoč pri umivanju rok",
                        "pomoč pri umivanju hrbta",
                        "pomoč pri umivanju anogenitalnega predela",
                        "pomoč pri umivanju nog",
                        "pomoč pri oblačenju",
                        "ni potrebna pomoč"
                    ],
                    "hint": "pomoč pri vzdrževanju primerne mikroklime, potrebna nastavitev temperature in pretoka vode, pomoč pri umivanju las, lasišča",
                    "value": null,
                    "unit": null
                },
                "13.2.6": {
                    "title": "Pomoč pri umivanju posameznega dela telesa (katerega)",
                    "type": "str",
                    "hint": "hrbet, anogenitalni predel",
                    "value": null,
                    "unit": null
                }
            }
        },
        "13.3": {
            "title": "Ocena stanja ustne votline",
            "description": null,
            "elements": {
                "13.3.1": {
                    "title": "Ocena stanja ustne sluznice in zob",
                    "type": "str",
                    "option_type": "many",
                    "options": [
                        "zobje so primerno vzdrževani, čisti",
                        "zobje so v slabem stanju",
                        "pacient nima zob",
                        "pacient ima zobno protezo",
                        "vnetje dlesni",
                        "krvavitev dlesni",
                        "suha ustna sluznica",
                        "vlažna ustna sluznica"
                    ],
                    "hint": "zobje so primerno vzdrževani, čisti",
                    "value": null,
                    "unit": null
                },
                "13.3.2": {
                    "title": "Zobna proteza",
                    "type": "str",
                    "option_type": "one",
                    "options": [
                        "zgornja zobna proteza",
                        "spodnja zobna proteza",
                        "obe zobni protezi",
                        "nima zobne proteze"
                    ],
                    "hint": "nima zobne proteze",
                    "value": null,
                    "unit": null
                },
                "13.3.3": {
                    "title": "Spremembe v ustni votlini in ustnicah",
                    "type": "str",
                    "option_type": "many",
                    "options": [
                        "brez sprememb",
                        "razpokane ustnice",
                        "afti",
                        "obloge na jeziku",
                        "vnetje ustne sluznice",
                        "suha usta"
                    ],
                    "hint": "/",
                    "value": null,
                    "unit": null
                },
                "13.3.4": {
                    "title": "Pacientove navade v zvezi z izvajanjem higiene ustne votline",
                    "type": "str",
                    "option_type": "many",
                    "options": [
                        "higieno ustne votline izvaja večkrat dnevno",
                        "higieno ustne votline izvaja 2x/dan",
                        "higieno ustne votline izvaja 1x/dan",
                        "higieno ustne votline ne izvaja redno",
                        "redno obiskuje zobozdravnika",
                        "ne obiskuje zobozdravnika redno"
                    ],
                    "hint": "higieno ustne votline izvaja 1x/dan, redno obiskuje zobozdravnika",
                    "value": null,
                    "unit": null
                },
                "13.3.5": {
                    "title": "Samostojnost pacienta pri izvajanju higiene ustne votline",
                    "type": "str",
                    "option_type": "many",
                    "options": [
                        "samostojno izvaja higieno ustne votline",
                        "potrebuje pomoč pri pripravi pripomočkov za izvajanje higiene ustne votline",
                        "potrebuje pomoč pri izvajanju higiene ustne votline",
                        "popolnoma odvisen od pomoči"
                    ],
                    "hint": "samostojno izvaja higieno ustne votline, potrebuje pomoč pri pripravi pripomočkov za izvajanje higiene ustne votline",
                    "value": null,
                    "unit": null
                }
            }
        },
        "13.4": {
            "title": "Ocena stanja kože, vidnih sluznic, las in lasišča",
            "description": null,
            "elements": {
                "13.4.1": {
                    "title": "Barva kože",
                    "type": "str",
                    "option_type": "many",
                    "options": [
                        "normalna barva kože",
                        "bleda",
                        "pordela",
                        "cianotična",
                        "ikterična",
                        "siva"
                    ],
                    "hint": "normalna barva kože",
                    "value": null,
                    "unit": null
                },
                "13.4.2": {
                    "title": "Struktura kože",
                    "type": "str",
                    "option_type": "many",
                    "options": [
                        "normalna",
                        "suha",
                        "hrapava",
                        "mastna",
                        "luščeča"
                    ],
                    "hint": "suha, hrapava",
                    "value": null,
                    "unit": null
                },
                "13.4.3": {
                    "title": "Napetost, elastičnost kože (turgor)",
                    "type": "str",
                    "option_type": "one",
                    "options": [
                        "normalna napetost kože",
                        "zmanjšana napetost (turgor) kože",
                        "povečana napetost kože"
                    ],
                    "hint": "zmanjšana napetost (turgor) kože",
                    "value": null,
                    "unit": null
                },
                "13.4.4": {
                    "title": "Poškodbe kože",
                    "type": "str",
                    "option_type": "many",
                    "options": [
                        "brez poškodb",
                        "brazgotina",
                        "odrgnina",
                        "rana",
                        "opeklina",
                        "razjeda"
                    ],
                    "hint": "brazgotina",
                    "value": null,
                    "unit": null
                },
                "13.4.5": {
                    "title": "Poškodbe kože - opis in mesto",
                    "type": "str",
                    "hint": "prsti na roki",
                    "value": null,
                    "unit": null
                },
                "13.4.6": {
                    "title": "Druge spremembe in občutja kože",
                    "type": "str",
                    "hint": "/",
                    "value": null,
                    "unit": null
                },
                "13.4.7": {
                    "title": "Oči",
                    "type": "str",
                    "option_type": "many",
                    "options": [
                        "normalen izgled oči",
                        "pordele oči",
                        "solzenje",
                        "suhe oči",
                        "gnojni izcedek",
                        "otečene veke"
                    ],
                    "hint": "normalen izgled oči",
                    "value": null,
                    "unit": null
                },
                "13.4.8": {
                    "title": "Zunanje spolovilo",
                    "type": "str",
                    "option_type": "many",
                    "options": [
                        "normalen izgled",
                        "rdečina",
                        "oteklina",
                        "izcedek",
                        "spremembe"
                    ],
                    "hint": "normalen izgled",
                    "value": null,
                    "unit": null
                }
            }
        },
        "13.5": {
            "title": "Ocena stanja las in lasišča",
            "description": null,
            "elements": {
                "13.5.1": {
                    "title": "Stanje las in lasišča",
                    "type": "str",
                    "option_type": "many",
                    "options": [
                        "čisti lasje",
                        "mastni lasje",
                        "suhi lasje",
                        "lomljivi lasje",
                        "izpadanje las",
                        "prhljaj",
                        "uši",
                        "čisto lasišče"
                    ],
                    "hint": "mastni lasje",
                    "value": null,
                    "unit": null
                }
            }
        },
        "13.6": {
            "title": "Ocena stanja nohtov na rokah",
            "description": null,
            "elements": {
                "13.6.1": {
                    "title": "Stanje nohtov na rokah",
                    "type": "str",
                    "option_type": "many",
                    "options": [
                        "primeren izgled, oblika nohtov",
                        "dolgi nohti",
                        "kratki nohti",
                        "umazani nohti",
                        "lomljivi nohti",
                        "tanki nohti",
                        "zadebeljeni nohti",
                        "glivična okužba",
                        "vrasli nohti"
                    ],
                    "hint": "primeren izgled, oblika nohtov, tanki nohti",
                    "value": null,
                    "unit": null
                }
            }
        },
        "13.7": {
            "title": "Ocena stanja nohtov na nogah",
            "description": null,
            "elements": {
                "13.7.1": {
                    "title": "Stanje nohtov na nogah",
                    "type": "str",
                    "option_type": "many",
                    "options": [
                        "primeren izgled, oblika nohtov",
                        "dolgi nohti",
                        "kratki nohti",
                        "umazani nohti",
                        "lomljivi nohti",
                        "tanki nohti",
                        "zadebeljeni nohti",
                        "glivična okužba",
                        "vrasli nohti"
                    ],
                    "hint": "primeren izgled, oblika nohtov",
                    "value": null,
                    "unit": null
                }
            }
        }
    }
};

// Update Category 14 - Aktivnosti zdravstvene nege - osebna higiena in urejenost
formData.categories['14'] = {
    "title": "Aktivnosti zdravstvene nege pri življenjski aktivnosti osebna higiena in urejenost",
    "description": "Podatki o izvedeni aktivnosti zdravstvene nege",
    "url": "aktivnosti-higiena",
    "color": "#FCE7F3",
    "subcategories": {
        "14.1": {
            "title": "Aktivnosti zdravstvene nege",
            "description": null,
            "elements": {
                "14.1.1": {
                    "title": "Datum izvedbe",
                    "type": "date",
                    "defaultValue": "danes",
                    "hint": "7.10.2025",
                    "value": null,
                    "unit": null
                },
                "14.1.2": {
                    "title": "Identifikacija pacienta",
                    "type": "str",
                    "hint": "Identifikacija pravega pacienta (vprašala sem po imenu, priimku, datumu rojstva, preverila sem zapestnico in dokumentacijo).",
                    "value": null,
                    "unit": null
                },
                "14.1.3": {
                    "title": "Ocena stopnje samooskrbe v zvezi z osebno higieno in urejenostjo",
                    "type": "str",
                    "hint": "Z opazovanjem, s pogovorom s pacientko in sobno medicinsko sestro.",
                    "value": null,
                    "unit": null
                },
                "14.1.4": {
                    "title": "Ocena stanja kože in vidnih sluznic",
                    "type": "str",
                    "hint": "Z opazovanjem med prhanjem. Brez posebnosti.",
                    "value": null,
                    "unit": null
                },
                "14.1.5": {
                    "title": "Anogenitalna nega",
                    "type": "str",
                    "hint": "Med prhanjem izvedena anogenitalna nega. Nameščen vložek po prhanju.",
                    "value": null,
                    "unit": null
                },
                "14.1.6": {
                    "title": "Higiena ustne votline",
                    "type": "str",
                    "hint": "Izvedena ustna higiena z zobno ščetko na začetku jutranje nege.",
                    "value": null,
                    "unit": null
                },
                "14.1.7": {
                    "title": "Higiensko vzdrževanje pripomočkov za osebno higieno in urejenostjo",
                    "type": "str",
                    "hint": "Milo, razkužilo in losjon sem razkužila in pospravila na pravem mestu. Pripomočke za enkratno uporabo sem vrgla v modro vrečko.",
                    "value": null,
                    "unit": null
                },
                "14.1.8": {
                    "title": "Nega kože",
                    "type": "str",
                    "hint": "Po prhanju in osušivi kože z brisačo sem namazala kožo z losjonom, saj je suha.",
                    "value": null,
                    "unit": null
                },
                "14.1.9": {
                    "title": "Prhanje stoje, sede, leže",
                    "type": "str",
                    "hint": "Delna pomoč pri prhanju pacientke sede v kopalnici.",
                    "value": null,
                    "unit": null
                },
                "14.1.10": {
                    "title": "Umivanje las in lasišča",
                    "type": "str",
                    "hint": "Umivanje las z milom in vodo v kopalnici.",
                    "value": null,
                    "unit": null
                },
                "14.1.11": {
                    "title": "Česanje",
                    "type": "str",
                    "hint": "Po končanem prhanju, oblačenju in sušenju las s sušilnikom sem pacientki dala glavnik in si je sama česala lase.",
                    "value": null,
                    "unit": null
                },
                "14.1.12": {
                    "title": "Vlaženje ustne votline",
                    "type": "str",
                    "hint": "Navlažena ustna votlina z vodo in čajem.",
                    "value": null,
                    "unit": null
                },
                "14.1.13": {
                    "title": "Umivanje zobne proteze",
                    "type": "str",
                    "hint": "Umila sem zgornjo zobno protezo s ščetko in vodo ter pravilno shranila v prav lonček za protezo.",
                    "value": null,
                    "unit": null
                },
                "14.1.14": {
                    "title": "Spodbujanje, usmerjanje in izvajanje zdravstvene nege pri aktivnosti osebna higiena in urejenost v vseh življenjskih obdobjih in bolezenskih stanjih",
                    "type": "str",
                    "hint": "Pacientko sem spodbudila, da bi se prhala čim bolj samostojno.",
                    "value": null,
                    "unit": null
                },
                "14.1.15": {
                    "title": "Sporočanje in dokumentiranje aktivnosti v zvezi z osebno higieno in urejenostjo",
                    "type": "str",
                    "hint": "Podatke in posebnosti v zvezi z osebno higieno in urejenostjo sem dokumentirala v poročilo ZN.",
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

console.log('✅ Updated categories 13 and 14 with complete structure');
console.log('Category 13 subcategories:', Object.keys(formData.categories['13'].subcategories));
console.log('Category 14 elements:', Object.keys(formData.categories['14'].subcategories['14.1'].elements));
