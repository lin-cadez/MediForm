const fs = require('fs');
const path = require('path');

// Read the current JSON
const filePath = path.join(__dirname, 'zdravstvena-nega-for-upload.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

// 1. Kategorija 30: Aktivnosti ZN pri aplikaciji zdravila - spremeni nazaj v navadna polja
data.categories["30"] = {
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

// 2. Kategorija 31: Diagnostično terapevtske preiskave - spremeni nazaj v navadna polja
data.categories["31"] = {
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
					"option_type": "multiple",
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
					"option_type": "multiple",
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

// 3. Kategorija 36: Preprečevanje okužb - spremeni nazaj v navadna polja
data.categories["36"] = {
	"title": "Aktivnosti zdravstvene nege – Preprečevanje in obvladovanje okužb, povezanih z zdravstvom",
	"description": "Preprečevanje in obvladovanje okužb, povezanih z zdravstvom",
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
					"option_type": "multiple",
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
					"option_type": "multiple",
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
					"option_type": "multiple",
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

// Write back
fs.writeFileSync(filePath, JSON.stringify(data, null, '\t'), 'utf-8');

// Count tables
let tableCount = 0;
const checkTables = (obj, path = '') => {
	if (typeof obj !== 'object' || obj === null) return;
	if (obj.type === 'table') {
		tableCount++;
		console.log(`   📋 Tabela najdena v: ${path}`);
	}
	for (const key in obj) {
		checkTables(obj[key], path ? `${path}.${key}` : key);
	}
};
checkTables(data.categories);

console.log('');
console.log('✅ Uspešno posodobljeno:');
console.log('   📝 Kategorija 30: Aktivnosti ZN pri aplikaciji zdravila → navadna polja');
console.log('   📝 Kategorija 31: Diagnostično terapevtske preiskave → navadna polja');
console.log('   📝 Kategorija 36: Preprečevanje okužb → navadna polja');
console.log('');
console.log(`📊 Skupno število tabel v obrazcu: ${tableCount}`);
console.log('   Tabele so zdaj samo v kategorijah:');
console.log('   - 29: APLIKACIJA ZDRAVIL (tabela zdravil s 7 stolpci)');
console.log('   - 32: Aktivnosti ZN pri diagnostiki');
console.log('   - 33: Terapevtski program');
console.log('   - 35: Aktivnosti ZN pri oskrbi rane');
