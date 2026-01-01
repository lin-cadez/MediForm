const fs = require('fs');
const path = require('path');

// Read the current JSON
const filePath = path.join(__dirname, 'zdravstvena-nega-for-upload.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

// Update category 9: GIBANJE IN USTREZNA LEGA - add missing fields from PDF
data.categories["9"] = {
	"title": "GIBANJE IN USTREZNA LEGA",
	"description": "Ocena stopnje samooskrbe pacienta",
	"url": "gibanje-lega",
	"color": "#E0E7FF",
	"subcategories": {
		"9.1": {
			"title": "Samostojnost pacienta pri gibanju in vzdrževanju primerne lege",
			"description": null,
			"elements": {
				"9.1.1": {
					"title": "Stopnja samostojnosti pri gibanju",
					"type": "str",
					"option_type": "one",
					"options": [
						"pacient je delno samostojen: potrebuje nadzor, usmerjanje oz. delno pomoč pri gibanju in vzdrževanju primerne lege",
						"pacient je popolnoma samostojen pri gibanju",
						"pacient je popolnoma odvisen od pomoči pri gibanju"
					],
					"hint": "pacient je delno samostojen: potrebuje nadzor, usmerjanje oz. delno pomoč pri gibanju in vzdrževanju primerne lege",
					"value": null,
					"unit": null
				}
			}
		},
		"9.2": {
			"title": "Ocena stanja pacienta pri gibanju in vzdrževanju primerne lege",
			"description": null,
			"elements": {
				"9.2.1": {
					"title": "Hoja",
					"type": "str",
					"option_type": "multiple",
					"options": [
						"hodi z delno pomočjo",
						"hodi v bolniški sobi",
						"hodi samostojno",
						"ne hodi",
						"hodi s pripomočkom"
					],
					"hint": "hodi z delno pomočjo, hodi v bolniški sobi",
					"value": null,
					"unit": null
				},
				"9.2.2": {
					"title": "Sedenje",
					"type": "str",
					"option_type": "one",
					"options": [
						"sedi samostojno",
						"sedi z oporo",
						"ne sedi"
					],
					"hint": "sedi samostojno",
					"value": null,
					"unit": null
				},
				"9.2.3": {
					"title": "Menjava položajev v postelji",
					"type": "str",
					"option_type": "multiple",
					"options": [
						"samostojno se obrne na L, D bok",
						"skrči kolena",
						"se samostojno posede v postelji",
						"se pomakne na rob postelje",
						"se opre na roke in pomakne po postelji",
						"doseže predmete ob postelji, na posteljni omarici"
					],
					"hint": "samostojno se obrne na L, D bok, skrči kolena, se samostojno posede v postelji, se pomakne na rob postelje, se opre na roke in pomakne po postelji, doseže predmete ob postelji, na posteljni omarici",
					"value": null,
					"unit": null
				},
				"9.2.4": {
					"title": "Premik na stol, invalidski voziček",
					"type": "str",
					"option_type": "one",
					"options": [
						"potrebuje delno pomoč pri presedanju",
						"samostojno se presede",
						"popolnoma odvisen"
					],
					"hint": "potrebuje delno pomoč pri presedanju",
					"value": null,
					"unit": null
				},
				"9.2.5": {
					"title": "Ravnotežje",
					"type": "str",
					"option_type": "multiple",
					"options": [
						"delno ohranja ravnotežje pri stoji",
						"delno ohranja ravnotežje med hojo",
						"ohranja ravnotežje pri sedenju",
						"ne ohranja ravnotežja"
					],
					"hint": "delno ohranja ravnotežje pri stoji, delno ohranja ravnotežje med hojo, ohranja ravnotežje pri sedenju",
					"value": null,
					"unit": null
				},
				"9.2.6": {
					"title": "Gibljivost telesa",
					"type": "str",
					"option_type": "multiple",
					"options": [
						"z rokami doseže vse dele telesa",
						"se prikloni in zaveže vezalke",
						"omejena gibljivost zgornjih okončin",
						"omejena gibljivost spodnjih okončin"
					],
					"hint": "z rokami doseže vse dele telesa, se prikloni in zaveže vezalke",
					"value": null,
					"unit": null
				},
				"9.2.7": {
					"title": "Koordinacija gibov",
					"type": "str",
					"option_type": "multiple",
					"options": [
						"usklajeni gibi rok",
						"usklajeni gibi nog",
						"pincetni prijem ohranjen",
						"neusklajeni gibi rok",
						"neusklajeni gibi nog"
					],
					"hint": "usklajeni gibi rok, usklajeni gibi nog, pincetni prijem ohranjen",
					"value": null,
					"unit": null
				},
				"9.2.8": {
					"title": "Drža telesa",
					"type": "str",
					"option_type": "one",
					"options": [
						"vzravnana",
						"sključena",
						"asimetrična"
					],
					"hint": "vzravnana",
					"value": null,
					"unit": null
				},
				"9.2.9": {
					"title": "Ohromelost",
					"type": "str",
					"hint": "/",
					"value": null,
					"unit": null
				},
				"9.2.10": {
					"title": "Medicinsko tehnični pripomočki, ki jih pacient uporablja pri gibanju",
					"type": "str",
					"option_type": "multiple",
					"options": [
						"brez pripomočkov",
						"trapez",
						"hodulja",
						"bergle",
						"invalidski voziček",
						"palica"
					],
					"hint": "trapez",
					"value": null,
					"unit": null
				},
				"9.2.11": {
					"title": "Medicinsko tehnični pripomočki, ki jih ima pacient pri sebi in jih ne uporablja",
					"type": "str",
					"hint": "/",
					"value": null,
					"unit": null
				}
			}
		},
		"9.3": {
			"title": "Ocenjevalne lestvice",
			"description": null,
			"elements": {
				"9.3.1": {
					"title": "Ocena ogroženosti za nastanek razjede zaradi pritiska (Waterlow lestvica)",
					"type": "num",
					"hint": "10",
					"value": null,
					"unit": "točk"
				},
				"9.3.2": {
					"title": "Stopnja tveganja za razjedo zaradi pritiska (Waterlow)",
					"type": "str",
					"option_type": "one",
					"options": [
						"ni ogrožen (do 9 točk)",
						"majhno tveganje (10-14 točk)",
						"srednje tveganje (15-19 točk)",
						"visoko tveganje (20+ točk)"
					],
					"hint": "majhno tveganje (10-14 točk)",
					"value": null,
					"unit": null
				},
				"9.3.3": {
					"title": "Ocena ogroženosti za padec (Morsejina lestvica padcev)",
					"type": "num",
					"hint": "45",
					"value": null,
					"unit": "točk"
				},
				"9.3.4": {
					"title": "Stopnja tveganja za padec (Morsejina lestvica)",
					"type": "str",
					"option_type": "one",
					"options": [
						"nizko tveganje (0-24 točk)",
						"srednje tveganje (25-50 točk)",
						"visoko tveganje (51+ točk)"
					],
					"hint": "srednje tveganje (25-50 točk)",
					"value": null,
					"unit": null
				}
			}
		},
		"9.4": {
			"title": "Vplivi na gibanje",
			"description": null,
			"elements": {
				"9.4.1": {
					"title": "Vplivi na gibanje pacienta",
					"type": "str",
					"option_type": "multiple",
					"options": [
						"na gibanje pacienta vpliva spremenjeno čustvovanje",
						"epileptični napad (po možganski krvavitvi)",
						"bolečina",
						"omotica",
						"utrujenost",
						"strah pred padcem"
					],
					"hint": "na gibanje pacienta vpliva spremenjeno čustvovanje",
					"value": null,
					"unit": null
				},
				"9.4.2": {
					"title": "Drugo (vpliv na gibanje)",
					"type": "str",
					"hint": "epileptični napad (po možganski krvavitvi)",
					"value": null,
					"unit": null
				}
			}
		},
		"9.5": {
			"title": "Zapleti zaradi dolgotrajne negibljivosti",
			"description": null,
			"elements": {
				"9.5.1": {
					"title": "Razjeda zaradi pritiska (mesto)",
					"type": "str",
					"hint": "/",
					"value": null,
					"unit": null
				},
				"9.5.2": {
					"title": "Kontrakture (mesto)",
					"type": "str",
					"hint": "/",
					"value": null,
					"unit": null
				}
			}
		}
	}
};

// Update category 10: Aktivnosti ZN pri gibanju - add more fields
data.categories["10"] = {
	"title": "Aktivnosti zdravstvene nege pri življenjski aktivnosti gibanje in ustrezna lega",
	"description": "Podatki o izvedeni aktivnosti zdravstvene nege",
	"url": "aktivnosti-gibanje",
	"color": "#E0E7FF",
	"subcategories": {
		"10.1": {
			"title": "Aktivnosti zdravstvene nege",
			"description": null,
			"elements": {
				"10.1.1": {
					"title": "Datum izvedbe",
					"type": "date",
					"defaultValue": "danes",
					"hint": "7.10.2025",
					"value": null,
					"unit": null
				},
				"10.1.2": {
					"title": "Identifikacija pacienta",
					"type": "str",
					"hint": "Identifikacija pravega pacienta (vprašala sem po imenu, priimku, datumu rojstva, preverila sem zapestnico in dokumentacijo).",
					"value": null,
					"unit": null
				},
				"10.1.3": {
					"title": "Ocena stopnje samooskrbe v zvezi z gibanjem in ustrezno lego",
					"type": "str",
					"hint": "Pridobila z opazovanjem, pogovorom s pacientko in sobno medicinsko sestro. Pacientka je večinoma samostojna pri gibanju.",
					"value": null,
					"unit": null
				},
				"10.1.4": {
					"title": "Ocena tveganja in preprečevanje razjede zaradi pritiska",
					"type": "str",
					"hint": "Z opazovanjem in obdelavo lestvice Waterlow (majhno tveganje za PZP).",
					"value": null,
					"unit": null
				},
				"10.1.5": {
					"title": "Pomoč pri vstajanju, posedanju, hoji",
					"type": "str",
					"hint": "Pacientki sem delno pomagala pri hoji oz. jo pospremljala do stranišča.",
					"value": null,
					"unit": null
				},
				"10.1.6": {
					"title": "Sporočanje in dokumentiranje aktivnosti v zvezi z gibanjem in ustrezno lego",
					"type": "str",
					"hint": "Podatke in posebnosti v zvezi z gibanjem in ustrezno lego sem dokumentirala v poročilo ZN.",
					"value": null,
					"unit": null
				}
			}
		}
	}
};

// Update category 11: SPANJE IN POČITEK - add missing fields
data.categories["11"] = {
	"title": "SPANJE IN POČITEK",
	"description": "Ocena stopnje samooskrbe pacienta",
	"url": "spanje-pocinek",
	"color": "#F3E8FF",
	"subcategories": {
		"11.1": {
			"title": "Samostojnost pacienta pri spanju in počitku",
			"description": null,
			"elements": {
				"11.1.1": {
					"title": "Stopnja samostojnosti pri spanju in počitku",
					"type": "str",
					"option_type": "one",
					"options": [
						"pacient samostojno poskrbi za primerno spanje in počitek",
						"pacient potrebuje pomoč pri zagotavljanju spanja in počitka",
						"pacient je popolnoma odvisen od pomoči"
					],
					"hint": "pacient samostojno poskrbi za primerno spanje in počitek",
					"value": null,
					"unit": null
				}
			}
		},
		"11.2": {
			"title": "Ocena stanja pacienta pri spanju in počitku",
			"description": null,
			"elements": {
				"11.2.1": {
					"title": "Vzorec spanja",
					"type": "str",
					"hint": "pacient je buden prek dneva",
					"value": null,
					"unit": null
				},
				"11.2.2": {
					"title": "Število ur spanja",
					"type": "num",
					"hint": "7-8",
					"value": null,
					"unit": "ur"
				},
				"11.2.3": {
					"title": "Ocena spočitosti (kvaliteta spanja)",
					"type": "str",
					"option_type": "one",
					"options": [
						"prisotni so rahli znaki zaspanosti",
						"pacient je spočit",
						"pacient je utrujen",
						"pacient je izčrpan"
					],
					"hint": "prisotni so rahli znaki zaspanosti",
					"value": null,
					"unit": null
				}
			}
		},
		"11.3": {
			"title": "Motnje spanja",
			"description": null,
			"elements": {
				"11.3.1": {
					"title": "Vrsta motenj spanja",
					"type": "str",
					"option_type": "multiple",
					"options": [
						"brez motenj",
						"nespečnost / smrčanje",
						"težko zaspi",
						"pogosto bujenje",
						"zgodnje bujenje",
						"nočne more"
					],
					"hint": "nespečnost / smrčanje",
					"value": null,
					"unit": null
				}
			}
		},
		"11.4": {
			"title": "Vzroki za motnje spanja",
			"description": null,
			"elements": {
				"11.4.1": {
					"title": "Vzroki za motnje spanja",
					"type": "str",
					"option_type": "multiple",
					"options": [
						"zaskrbljenost",
						"žalovanje",
						"bolečina",
						"neudobje",
						"hrup",
						"svetloba",
						"zdravila"
					],
					"hint": "zaskrbljenost, žalovanje",
					"value": null,
					"unit": null
				}
			}
		}
	}
};

// Update category 12: Aktivnosti ZN pri spanju - add missing fields
data.categories["12"] = {
	"title": "Aktivnosti zdravstvene nege pri življenjski aktivnosti spanje in počitek",
	"description": "Podatki o izvedeni aktivnosti zdravstvene nege",
	"url": "aktivnosti-spanje",
	"color": "#F3E8FF",
	"subcategories": {
		"12.1": {
			"title": "Aktivnosti zdravstvene nege",
			"description": null,
			"elements": {
				"12.1.1": {
					"title": "Datum izvedbe",
					"type": "date",
					"defaultValue": "danes",
					"hint": "7.10.2025",
					"value": null,
					"unit": null
				},
				"12.1.2": {
					"title": "Identifikacija pacienta",
					"type": "str",
					"hint": "Identifikacija pravega pacienta (vprašala sem po imenu, priimku, datumu rojstva, preverila sem zapestnico in dokumentacijo).",
					"value": null,
					"unit": null
				},
				"12.1.3": {
					"title": "Ocena stopnje samooskrbe v zvezi s spanjem in počitkom",
					"type": "str",
					"hint": "Z opazovanjem, pogovorom s pacientko in sobno medicinsko sestro. Prek opazovanja in pogovora s pacientko sem ugotovila, da se ne zbudi spočita zaradi zaskrbljenosti in prekomernemu razmišljanju.",
					"value": null,
					"unit": null
				},
				"12.1.4": {
					"title": "Higiensko vzdrževanje obposteljne mizice",
					"type": "str",
					"hint": "Pred jutranje nego in po končani jutranji negi sem razkužila z razkužilnimi alkoholnimi robčki.",
					"value": null,
					"unit": null
				},
				"12.1.5": {
					"title": "Higiensko vzdrževanje postelje",
					"type": "str",
					"hint": "Razkužila z razkužilnimi alkoholnimi robčki in potem postiljala.",
					"value": null,
					"unit": null
				},
				"12.1.6": {
					"title": "Nameščanje postelje na varno višino",
					"type": "str",
					"hint": "Po končanem postiljanju sem posteljo spustila dol na najnižjo višino.",
					"value": null,
					"unit": null
				},
				"12.1.7": {
					"title": "Postiljanje nezasedene postelje",
					"type": "str",
					"hint": "Zamenjala posteljno perilo medem, ko je bila pacientka na stanišču.",
					"value": null,
					"unit": null
				},
				"12.1.8": {
					"title": "Sporočanje in dokumentiranje aktivnosti v zvezi s spanjem in počitkom",
					"type": "str",
					"hint": "Podatke in posebnosti v zvezi s spanjem in počitkom sem dokumentirala v poročilo ZN.",
					"value": null,
					"unit": null
				}
			}
		}
	}
};

// Write back
fs.writeFileSync(filePath, JSON.stringify(data, null, '\t'), 'utf-8');

console.log('✅ Uspešno posodobljene kategorije:');
console.log('   📋 9: GIBANJE IN USTREZNA LEGA - dodana polja: Hoja, Sedenje, Menjava položajev, Ravnotežje, Koordinacija, Waterlow, Morsejina lestvica, Vplivi na gibanje, Kontrakture');
console.log('   📋 10: Aktivnosti ZN pri gibanju - dodana polja za oceno in pomoč');
console.log('   📋 11: SPANJE IN POČITEK - dodana polja: Vzorec spanja, Ocena spočitosti, Vzroki za motnje');
console.log('   📋 12: Aktivnosti ZN pri spanju - dodana polja: Higiensko vzdrževanje, Postiljanje');
console.log('');
console.log('📄 Datoteka posodobljena: zdravstvena-nega-for-upload.json');
