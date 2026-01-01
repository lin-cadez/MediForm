const fs = require('fs');
const path = require('path');

// Read the current JSON
const filePath = path.join(__dirname, 'zdravstvena-nega-for-upload.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

// 1. Update category 29: APLIKACIJA ZDRAVIL - add a table for medications
// Based on PDF: Ime zdravila | Farmacevtska oblika | ATC klasifikacija | Odmerek in časovni režim | Način in mesto aplikacije | Posebnosti pri aplikaciji | Neželeni učinki

data.categories["29"] = {
	"title": "APLIKACIJA ZDRAVIL",
	"description": "Podatki o aplikaciji zdravil – datum in ura",
	"url": "aplikacija-zdravil",
	"color": "#FED7AA",
	"subcategories": {
		"29.1": {
			"title": "Seznam zdravil",
			"description": null,
			"elements": {
				"29.1.1": {
					"title": "Zdravila pacienta",
					"type": "table",
					"columns": [
						{ "key": "ime_zdravila", "title": "Ime zdravila", "hint": "npr. Nolpaza" },
						{ "key": "oblika", "title": "Farmacevtska oblika zdravila", "hint": "Tbl., kaps., amp." },
						{ "key": "atc", "title": "Anatomsko terapevtska klasifikacija (ATC) zdravila", "hint": "npr. Antiepileptiki" },
						{ "key": "odmerek", "title": "Odmerek in časovni režim", "hint": "npr. 40 mg zj." },
						{ "key": "nacin", "title": "Način in mesto aplikacije zdravila", "hint": "Per os" },
						{ "key": "posebnosti", "title": "Posebnosti pri aplikaciji zdravila", "hint": "/" },
						{ "key": "nezeleni_ucinki", "title": "Neželeni učinki zdravila", "hint": "/" }
					],
					"rows": []
				}
			}
		},
		"29.2": {
			"title": "Ocena stopnje samooskrbe",
			"description": null,
			"elements": {
				"29.2.1": {
					"title": "Ocena stopnje samooskrbe v zvezi z učenjem in skrbjo za lastno zdravje",
					"type": "str",
					"option_type": "one",
					"options": [
						"Z opazovanjem, pogovorom s pacientko in sobno medicinsko sestro."
					],
					"hint": "Z opazovanjem, pogovorom s pacientko in sobno medicinsko sestro.",
					"value": null,
					"unit": null
				},
				"29.2.2": {
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

// 2. Update category 30: Aktivnosti zdravstvene nege pri aplikaciji zdravila - make it a table
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
					"title": "Aktivnosti zdravstvene nege pri aplikaciji zdravila",
					"type": "table",
					"columns": [
						{ "key": "aktivnost", "title": "Aktivnosti zdravstvene nege", "hint": "" },
						{ "key": "podatki", "title": "Podatki o izvedeni aktivnosti zdravstvene nege", "hint": "" }
					],
					"rows": [
						{
							"aktivnost": "Identifikacija pacienta",
							"podatki": "Identifikacija pravega pacienta (vprašala sem po imenu, priimku, datumu rojstva, preverila sem zapestnico in dokumentacijo)."
						},
						{
							"aktivnost": "Dajanje zdravil per os, na kožo, sluznico ter na druge neinvazivne načine",
							"podatki": "Upoštevala sem pravilo 11 P-jev. Pri zajtrku sem pacientki dala zdravila, ki jih je zaužila peroralno in sem preverila in se prepričala, da jih je zares zaužila."
						},
						{
							"aktivnost": "Opazovanje pacienta med in po dajanju zdravil, učinkovin in krvnih pripravkov",
							"podatki": "Opazovala sem pacientko med in po dajanju zdravil per os, če so bile kakšne reakcije ali posebnosti, neželeni učinki, če je vse zdravila zaužila..."
						},
						{
							"aktivnost": "Sporočanje in dokumentiranje aktivnosti v zvezi z aktivnosti priprave in dajanja zdravil",
							"podatki": "Podatke in posebnosti v zvezi z zdravili in aplikacijo zdravil sem dokumentirala v poročilo ZN in obvestila sobno medicinsko sestro."
						}
					]
				}
			}
		}
	}
};

// 3. Update category 31: Diagnostično terapevtske preiskave - make it a table
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
					"title": "Diagnostično terapevtske preiskave",
					"type": "table",
					"columns": [
						{ "key": "preiskava", "title": "Diagnostično terapevtska preiskava", "hint": "" },
						{ "key": "datum_ura", "title": "Datum, ura", "hint": "/" },
						{ "key": "priprava", "title": "Priprava pacienta na diagnostično terapevtsko preiskavo", "hint": "/" },
						{ "key": "vzorec", "title": "Odvzem vzorca za preiskavo (vrsta vzorca)", "hint": "/" }
					],
					"rows": []
				}
			}
		}
	}
};

// 4. Update category 32: Aktivnosti ZN pri izvajanju diagnostično-terapevtskega programa
data.categories["32"] = {
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
					"title": "Aktivnosti zdravstvene nege",
					"type": "table",
					"columns": [
						{ "key": "aktivnost", "title": "Aktivnosti zdravstvene nege", "hint": "" },
						{ "key": "podatki", "title": "Podatki o izvedeni aktivnosti zdravstvene nege", "hint": "" }
					],
					"rows": []
				}
			}
		}
	}
};

// 5. Update category 33: Terapevtski program - with 3 columns and sample rows
data.categories["33"] = {
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
					"title": "Terapevtski program",
					"type": "table",
					"columns": [
						{ "key": "terapija", "title": "Terapija", "hint": "" },
						{ "key": "datum_ura", "title": "Datum, ura", "hint": "/" },
						{ "key": "posebnosti", "title": "Posebnosti", "hint": "/" }
					],
					"rows": [
						{ "terapija": "Fizioterapija", "datum_ura": "1×/dan", "posebnosti": "/" },
						{ "terapija": "Delovna terapija", "datum_ura": "/", "posebnosti": "/" }
					]
				}
			}
		}
	}
};

// 6. Update category 35: Aktivnosti zdravstvene nege pri oskrbi rane - with 3 columns
data.categories["35"] = {
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
					"title": "Aktivnosti zdravstvene nege pri oskrbi rane",
					"type": "table",
					"columns": [
						{ "key": "aktivnost", "title": "Aktivnosti zdravstvene nege", "hint": "" },
						{ "key": "podatki", "title": "Podatki o izvedeni aktivnosti zdravstvene nege", "hint": "" },
						{ "key": "datum", "title": "Datum izvedbe:", "hint": "" }
					],
					"rows": []
				}
			}
		}
	}
};

// 7. Update category 36: Add table structure for Aktivnosti - Preprečevanje in obvladovanje okužb
// Keep existing elements but add the table at beginning
const existingCat36 = data.categories["36"];
existingCat36.title = "Aktivnosti zdravstvene nege – Preprečevanje in obvladovanje okužb, povezanih z zdravstvom";
existingCat36.description = "Preprečevanje in obvladovanje okužb, povezanih z zdravstvom";

// Convert 36.1 elements to table format
existingCat36.subcategories["36.1"] = {
	"title": "Aktivnosti zdravstvene nege",
	"description": null,
	"elements": {
		"36.1.1": {
			"title": "Aktivnosti zdravstvene nege – Preprečevanje in obvladovanje okužb",
			"type": "table",
			"columns": [
				{ "key": "aktivnost", "title": "Aktivnosti zdravstvene nege", "hint": "" },
				{ "key": "podatki", "title": "Podatki o izvedeni aktivnosti zdravstvene nege", "hint": "" },
				{ "key": "datum", "title": "Datum izvedbe", "hint": "" }
			],
			"rows": [
				{
					"aktivnost": "Izvajanje ukrepov za preprečevanje in obvladovanja okužb povezanih z zdravstvom",
					"podatki": "Pravilno umivanje in razkuževanje rok, menjava rokavic, pravilna uporaba OVO, razkuževanje okolice, pravilo 11P, previdno ravnanje s pacientovimi tekočinami in izločki, pravilno ločevanje odpadkov...",
					"datum": ""
				},
				{
					"aktivnost": "Higiensko vzdrževanje neposredne pacientove okolice",
					"podatki": "Redno in večkratno razkuževanje pacientove okolice in posteljne blazine z razkužilnimi alkoholnimi robčki.",
					"datum": ""
				},
				{
					"aktivnost": "Ukrepi za preprečevanje križanja čistih in nečistih poti, predmetov materialov in ljudi in zagotavljanje pogojev za transport",
					"podatki": "Vidno umazano perilo sem prijela z rokavicami in predpasnikom, čisto perilo pa brez rokavic in predpasnika, v spodnji polici negovalnega vozička so umazane stvari, v zgornji dve polici pa čiste stvari.",
					"datum": ""
				},
				{
					"aktivnost": "Ravnanje z odpadki v skladu s predpisi in zakonodajo",
					"podatki": "Pravilno ravnanje in ločevanje odpadkov (perilo, odpadki iz zdravstva, ostri predmeti...). Pripomočke za enkratno uporabo sem vrgla v moder koš, perilo pa v koš za perilo.",
					"datum": ""
				},
				{
					"aktivnost": "Izbira in uporaba osebne varovalne opreme",
					"podatki": "Pravilna uporaba osebne varovalne opreme (OVO), uporabila sem predpasnik, zaščitno masko in rokavice.",
					"datum": ""
				}
			]
		}
	}
};

// Add new subcategory for documentation
existingCat36.subcategories["36.5"] = {
	"title": "Dokumentiranje",
	"description": null,
	"elements": {
		"36.5.1": {
			"title": "Sporočanje in dokumentiranje aktivnosti v zvezi z preprečevanjem in obvladovanjem okužb povezanih z zdravstvom",
			"type": "str",
			"hint": "Podatke in posebnosti v zvezi s preprečevanje in obvladovanjem okužb povezanih z zdravstvom sem dokumentirala v poročilo ZN.",
			"value": null,
			"unit": null
		}
	}
};

// Write back
fs.writeFileSync(filePath, JSON.stringify(data, null, '\t'), 'utf-8');

console.log('✅ Uspešno posodobljene kategorije:');
console.log('   📋 29: APLIKACIJA ZDRAVIL - tabela s 7 stolpci za zdravila');
console.log('   📋 30: Aktivnosti ZN pri aplikaciji zdravila - tabela z vrstami');
console.log('   📋 31: Diagnostično terapevtske preiskave - tabela s 4 stolpci');
console.log('   📋 32: Aktivnosti ZN pri diagnostiki - tabela');
console.log('   📋 33: Terapevtski program - tabela s 3 stolpci in vzorčnimi vrsticami');
console.log('   📋 35: Aktivnosti ZN pri oskrbi rane - tabela s 3 stolpci');
console.log('   📋 36: Aktivnosti ZN - Preprečevanje okužb - tabela z vrstami');
console.log('');
console.log('📄 Datoteka posodobljena: zdravstvena-nega-for-upload.json');
