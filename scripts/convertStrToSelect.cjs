const fs = require('fs');
const path = require('path');

// Read the current JSON
const filePath = path.join(__dirname, 'zdravstvena-nega-for-upload.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

let changedCount = 0;

// Helper function to add options to a field
const addOptionsToField = (element, options, optionType = "one") => {
	if (element.type === "str" && !element.options) {
		element.options = options;
		element.option_type = optionType;
		changedCount++;
		return true;
	}
	return false;
};

// Process all categories
const processElements = (elements) => {
	for (const key in elements) {
		const el = elements[key];
		const title = el.title?.toLowerCase() || '';
		const hint = el.hint?.toLowerCase() || '';

		// Skip if already has options or is not str type
		if (el.options || el.type !== "str") continue;

		// === IDENTIFIKACIJA PACIENTA ===
		if (title.includes('identifikacija pacienta')) {
			addOptionsToField(el, [
				"Identifikacija pravega pacienta (vprašala sem po imenu, priimku, datumu rojstva, preverila sem zapestnico in dokumentacijo).",
				"Identifikacija pravega pacienta (vprašal sem po imenu, priimku, datumu rojstva, preveril sem zapestnico in dokumentacijo).",
				"Pacient identificiran po imenu, priimku in datumu rojstva.",
				"Pacient identificiran s pomočjo zapestnice in dokumentacije."
			], "one");
			continue;
		}

		// === OCENA STOPNJE SAMOOSKRBE ===
		if (title.includes('ocena stopnje samooskrbe')) {
			addOptionsToField(el, [
				"Z opazovanjem, pogovorom s pacientom in sobno medicinsko sestro.",
				"Z opazovanjem in pogovorom s pacientom.",
				"Z opazovanjem pacienta.",
				"S pregledom dokumentacije in pogovorom s pacientom."
			], "one");
			continue;
		}

		// === SPOROČANJE IN DOKUMENTIRANJE ===
		if (title.includes('sporočanje in dokumentiranje') || title.includes('dokumentiranje aktivnosti')) {
			addOptionsToField(el, [
				"Podatke in posebnosti sem dokumentirala v poročilo ZN.",
				"Podatke in posebnosti sem dokumentiral v poročilo ZN.",
				"Dokumentirano v poročilo ZN in obvestila sobno medicinsko sestro.",
				"Dokumentirano v poročilo ZN."
			], "one");
			continue;
		}

		// === VZOREC SPANJA ===
		if (title.includes('vzorec spanja')) {
			addOptionsToField(el, [
				"pacient je buden prek dneva",
				"pacient občasno drema prek dneva",
				"pacient veliko spi prek dneva",
				"pacient ima obrnjeni ritem spanja"
			], "one");
			continue;
		}

		// === HIGIENSKO VZDRŽEVANJE ===
		if (title.includes('higiensko vzdrževanje')) {
			addOptionsToField(el, [
				"Razkužila z razkužilnimi alkoholnimi robčki.",
				"Razkužil z razkužilnimi alkoholnimi robčki.",
				"Očistila in razkužila s primernimi sredstvi.",
				"Pripomočke za enkratno uporabo zavrgla v modro vrečko."
			], "multiple");
			continue;
		}

		// === NAMEŠČANJE POSTELJE NA VARNO VIŠINO ===
		if (title.includes('nameščanje postelje na varno višino')) {
			addOptionsToField(el, [
				"Po končani negi sem posteljo spustila na najnižjo višino.",
				"Po končani negi sem posteljo spustil na najnižjo višino.",
				"Postelja spuščena na najnižjo višino.",
				"Postelja na varni višini."
			], "one");
			continue;
		}

		// === POSTILJANJE ===
		if (title.includes('postiljanje')) {
			addOptionsToField(el, [
				"Zamenjala posteljno perilo, ko je bil pacient na stranišču.",
				"Zamenjal posteljno perilo, ko je bil pacient na stranišču.",
				"Zamenjala posteljno perilo in uredila posteljo.",
				"Postiljanje izvedeno med odsotnostjo pacienta.",
				"/"
			], "one");
			continue;
		}

		// === NAMEŠČANJE POSTELJNE OGRAJE ===
		if (title.includes('nameščanje posteljne ograje')) {
			addOptionsToField(el, [
				"Posteljne ograjice so vedno nameščene gor, kadar pacient leži.",
				"Posteljne ograjice nameščene na obeh straneh.",
				"Posteljne ograjice spuščene po dogovoru s pacientom.",
				"/"
			], "one");
			continue;
		}

		// === NAMEŠČANJE TRAPEZA ===
		if (title.includes('nameščanje trapeza')) {
			addOptionsToField(el, [
				"Trapez vedno v dosegu rok pacienta.",
				"Trapez nameščen in dostopen.",
				"Pacient ne potrebuje trapeza.",
				"/"
			], "one");
			continue;
		}

		// === NAMEŠČANJE KLICNIH NAPRAV ===
		if (title.includes('nameščanje klicnih naprav')) {
			addOptionsToField(el, [
				"Klicna naprava vedno v dosegu rok pacienta, identifikacijska zapestnica nameščena.",
				"Klicna naprava v dosegu rok pacienta.",
				"Identifikacijska zapestnica pravilno nameščena.",
				"Klicna naprava in zapestnica preverjeni."
			], "multiple");
			continue;
		}

		// === OCENJEVANJE TVEGANJA ZA PADEC ===
		if (title.includes('ocenjevanje tveganja za padec')) {
			addOptionsToField(el, [
				"Z opazovanjem, pogovorom in obdelavo Morsejine lestvice (nizko tveganje za padec).",
				"Z opazovanjem, pogovorom in obdelavo Morsejine lestvice (srednje tveganje za padec).",
				"Z opazovanjem, pogovorom in obdelavo Morsejine lestvice (visoko tveganje za padec)."
			], "one");
			continue;
		}

		// === ZAGOTAVLJANJE VARNEGA OKOLJA ===
		if (title.includes('zagotavljanje varnega okolja')) {
			addOptionsToField(el, [
				"Tla niso mokra, nedrseča, postelja na nizki višini, ograjice na obeh straneh, trapez in klicna naprava v dosegu rok.",
				"Okolje varno, brez ovir za gibanje.",
				"Izvedeni vsi ukrepi za zagotavljanje varnosti.",
				"Posebna pozornost pri zagotavljanju varnosti."
			], "multiple");
			continue;
		}

		// === IZVAJANJE UKREPOV ZA PREPREČEVANJE OKUŽB ===
		if (title.includes('izvajanje ukrepov za preprečevanje okužb')) {
			addOptionsToField(el, [
				"Pravilna uporaba OVO, večkratno dnevno razkuževanje pacientove okolice, tehnika nedotikanja.",
				"Pravilna higiena rok in uporaba zaščitne opreme.",
				"Upoštevanje vseh ukrepov za preprečevanje okužb.",
				"Aseptična tehnika pri vseh postopkih."
			], "multiple");
			continue;
		}

		// === IZVAJANJE AKTIVNOSTI ZA PREPREČEVANJE PADCA ===
		if (title.includes('izvajanje aktivnosti za preprečevanje padca')) {
			addOptionsToField(el, [
				"Postelja spuščena na najnižjo višino, posteljne ograjice gor, spremstvo ob hoji.",
				"Spremstvo pacienta pri hoji in vstajanju.",
				"Pacient pouč o nevarnosti padcev.",
				"Izvedeni vsi ukrepi za preprečevanje padcev."
			], "multiple");
			continue;
		}

		// === OCENA STANJA KOŽE ===
		if (title.includes('ocena stanja kože')) {
			addOptionsToField(el, [
				"Z opazovanjem med prhanjem. Brez posebnosti.",
				"Z opazovanjem. Koža suha, potrebuje mazanje.",
				"Z opazovanjem. Koža normalna, brez poškodb.",
				"Z opazovanjem. Opažene spremembe na koži."
			], "one");
			continue;
		}

		// === ANOGENITALNA NEGA ===
		if (title.includes('anogenitalna nega')) {
			addOptionsToField(el, [
				"Med prhanjem izvedena anogenitalna nega. Nameščen vložek po prhanju.",
				"Med prhanjem izvedena anogenitalna nega.",
				"Anogenitalna nega izvedena, brez posebnosti.",
				"Anogenitalno področje čisto in suho.",
				"/"
			], "one");
			continue;
		}

		// === HIGIENA USTNE VOTLINE ===
		if (title.includes('higiena ustne votline') && !title.includes('pacientove navade')) {
			addOptionsToField(el, [
				"Izvedena ustna higiena z zobno ščetko na začetku jutranje nege.",
				"Pacient samostojno izvedel ustno higieno.",
				"Pomoč pri izvajanju ustne higiene.",
				"Ustna votlina čista, vlažna.",
				"/"
			], "one");
			continue;
		}

		// === NEGA KOŽE ===
		if (title === 'nega kože') {
			addOptionsToField(el, [
				"Po prhanju in osušitvi kože z brisačo sem namazala kožo z losjonom.",
				"Po prhanju in osušitvi kože z brisačo sem namazal kožo z losjonom.",
				"Koža namazana z losjonom zaradi suhosti.",
				"Koža normalno hidratizirana, brez mazanja.",
				"/"
			], "one");
			continue;
		}

		// === PRHANJE ===
		if (title.includes('prhanje stoje, sede, leže')) {
			addOptionsToField(el, [
				"Delna pomoč pri prhanju pacienta sede v kopalnici.",
				"Pacient se je samostojno prhala stoje.",
				"Pacient se je samostojno prhal stoje.",
				"Popolna pomoč pri prhanju pacienta leže.",
				"Prhanje ni bilo izvedeno.",
				"/"
			], "one");
			continue;
		}

		// === UMIVANJE LAS ===
		if (title.includes('umivanje las')) {
			addOptionsToField(el, [
				"Umivanje las z milom in vodo v kopalnici.",
				"Pacient si je samostojno umil lase.",
				"Umivanje las ni bilo potrebno.",
				"/"
			], "one");
			continue;
		}

		// === ČESANJE ===
		if (title === 'česanje') {
			addOptionsToField(el, [
				"Po končanem prhanju sem pacientu dala glavnik in si je sam česal lase.",
				"Po končanem prhanju sem pacientki dala glavnik in si je sama česala lase.",
				"Pacient se je samostojno počesal.",
				"Pomoč pri česanju.",
				"/"
			], "one");
			continue;
		}

		// === VLAŽENJE USTNE VOTLINE ===
		if (title.includes('vlaženje ustne votline')) {
			addOptionsToField(el, [
				"Navlažena ustna votlina z vodo in čajem.",
				"Ustna votlina primerno vlažna.",
				"Pacient redno pije tekočine.",
				"/"
			], "one");
			continue;
		}

		// === UMIVANJE ZOBNE PROTEZE ===
		if (title.includes('umivanje zobne proteze')) {
			addOptionsToField(el, [
				"Umila sem zobno protezo s ščetko in vodo ter pravilno shranila.",
				"Umil sem zobno protezo s ščetko in vodo ter pravilno shranil.",
				"Pacient samostojno skrbi za zobno protezo.",
				"Pacient nima zobne proteze.",
				"/"
			], "one");
			continue;
		}

		// === SPODBUJANJE, USMERJANJE ===
		if (title.includes('spodbujanje, usmerjanje')) {
			addOptionsToField(el, [
				"Pacienta sem spodbujala k čim večji samostojnosti.",
				"Pacienta sem spodbujal k čim večji samostojnosti.",
				"Pacient motiviran in aktiven.",
				"Pacient potrebuje dodatno spodbudo.",
				"/"
			], "one");
			continue;
		}

		// === IZBIRA USTREZNIH OBLAČIL ===
		if (title.includes('izbira ustreznih oblačil')) {
			addOptionsToField(el, [
				"Izbrala sem pravilno bolniško oblačilo in pravilno velikost.",
				"Izbral sem pravilno bolniško oblačilo in pravilno velikost.",
				"Pacient sam izbral oblačila.",
				"Pacient oblečen v lastna oblačila."
			], "one");
			continue;
		}

		// === POMOČ PRI VSTAJANJU, POSEDANJU, HOJI ===
		if (title.includes('pomoč pri vstajanju') || title.includes('pomoč pri hoji')) {
			addOptionsToField(el, [
				"Delna pomoč pri hoji oz. spremstvo do stranišča.",
				"Pacient hodi samostojno, brez pomoči.",
				"Popolna pomoč pri vstajanju in posedanju.",
				"Pacient potrebuje spremstvo pri hoji.",
				"/"
			], "one");
			continue;
		}

		// === OCENA TVEGANJA ZA RAZJEDO ZARADI PRITISKA ===
		if (title.includes('ocena tveganja') && title.includes('razjed')) {
			addOptionsToField(el, [
				"Z opazovanjem in obdelavo lestvice Waterlow (ni ogrožen).",
				"Z opazovanjem in obdelavo lestvice Waterlow (majhno tveganje).",
				"Z opazovanjem in obdelavo lestvice Waterlow (srednje tveganje).",
				"Z opazovanjem in obdelavo lestvice Waterlow (visoko tveganje)."
			], "one");
			continue;
		}

		// === KOMUNIKACIJA S SLEPIM/SLABOVIDNIM ===
		if (title.includes('komunikacija s slepim')) {
			addOptionsToField(el, [
				"Pri pogovoru s pacientom sem se postavila tako, da me je videl v obraz.",
				"Pri pogovoru s pacientom sem se postavil tako, da me je videl v obraz.",
				"Pacient nima težav z vidom.",
				"Prilagojena komunikacija zaradi slabovidnosti.",
				"/"
			], "one");
			continue;
		}

		// === POGOVOR S PACIENTOM ===
		if (title === 'pogovor s pacientom') {
			addOptionsToField(el, [
				"Čim več sem se pogovarjala z njim/njo za vzpostavitev zaupanja.",
				"Čim več sem se pogovarjal z njim/njo za vzpostavitev zaupanja.",
				"Redni pogovori s pacientom.",
				"Pacient rad komunicira.",
				"Pacient ne želi komunicirati."
			], "one");
			continue;
		}

		// === POSLUŠANJE PACIENTA ===
		if (title === 'poslušanje pacienta') {
			addOptionsToField(el, [
				"Kadar pacient govori, ga pozorno poslušam.",
				"Aktivno poslušanje pacienta.",
				"Pacient rad pripoveduje o sebi.",
				"Pacient malo govori."
			], "one");
			continue;
		}

		// === POSREDOVANJE IN SPREJEMANJE INFORMACIJ ===
		if (title.includes('posredovanje in sprejemanje informacij')) {
			addOptionsToField(el, [
				"Pri vsakem koraku ZN sem pacientu razložila kaj bom naredila.",
				"Pri vsakem koraku ZN sem pacientu razložil kaj bom naredil.",
				"Pacient informiran o vseh postopkih.",
				"Pacient razume navodila."
			], "one");
			continue;
		}

		// === RAZUMEVANJE PACIENTOVEGA DOŽIVLJANJA ===
		if (title.includes('razumevanje pacientovega doživljanja')) {
			addOptionsToField(el, [
				"Prek pogovora in dokumentacije sem ugotovila pacientovo doživljanje. Pacient je zaskrbljen.",
				"Prek pogovora in dokumentacije sem ugotovil pacientovo doživljanje.",
				"Pacient verbalno in neverbalno izraža svoja čustva.",
				"Pacient ne izraža svojih čustev."
			], "one");
			continue;
		}

		// === POKLIC/DELO ===
		if (title.includes('poklic') && hint.includes('upokojen')) {
			addOptionsToField(el, [
				"upokojen/a",
				"zaposlen/a",
				"študent/ka",
				"brezposeln/a",
				"drugo"
			], "one");
			continue;
		}

		// === RAZVEDRILNE DEJAVNOSTI ===
		if (title.includes('razvedrilne dejavnosti pacienta')) {
			addOptionsToField(el, [
				"gledanje televizije",
				"branje",
				"druženje in pogovor s svojci",
				"sprehodi",
				"ročna dela",
				"kuhanje in peka",
				"delo na vrtu",
				"poslušanje glasbe",
				"igranje iger",
				"/"
			], "multiple");
			continue;
		}

		// === PRIPOMOČKI ZA RAZVEDRILO ===
		if (title.includes('pripomočk') && title.includes('razvedril')) {
			addOptionsToField(el, [
				"telefon",
				"televizija",
				"radio",
				"knjige/revije",
				"svojci",
				"pripomočki za ročna dela",
				"/"
			], "multiple");
			continue;
		}

		// === OPIS BOLEČINE ===
		if (title === 'opis bolečine') {
			addOptionsToField(el, [
				"brez bolečine",
				"glavobol",
				"bolečina v prsih",
				"bolečina v trebuhu",
				"bolečina v hrbtu",
				"bolečina v sklepih",
				"bolečina v okončinah",
				"konstantna bolečina",
				"občasna bolečina",
				"/"
			], "multiple");
			continue;
		}

		// === PACIENTOVE ŽELJE - DUHOVNE POTREBE ===
		if (title.includes('pacientove želje') && title.includes('duhov')) {
			addOptionsToField(el, [
				"molitev vsak dan",
				"odhod v cerkev",
				"obisk duhovnika",
				"branje verskih besedil",
				"meditacija",
				"pogovor o duhovnih temah",
				"pacient ne izraža duhovnih potreb",
				"/"
			], "multiple");
			continue;
		}

		// === VPLIV NA GIBANJE - DRUGO ===
		if (title.includes('drugo') && (title.includes('vpliv') || hint.includes('epileptičn'))) {
			addOptionsToField(el, [
				"epileptični napad",
				"možganska krvavitev",
				"možganska kap",
				"poškodba",
				"operacija",
				"kronična bolezen",
				"/"
			], "multiple");
			continue;
		}

		// === RAZJEDA ZARADI PRITISKA (MESTO) ===
		if (title.includes('razjeda zaradi pritiska') && title.includes('mesto')) {
			addOptionsToField(el, [
				"/",
				"sakralno področje",
				"pete",
				"gležnji",
				"kolena",
				"boki",
				"komolci",
				"lopatice",
				"tilnik"
			], "multiple");
			continue;
		}

		// === KONTRAKTURE (MESTO) ===
		if (title.includes('kontrakture') && title.includes('mesto')) {
			addOptionsToField(el, [
				"/",
				"koleno",
				"kolk",
				"gleženj",
				"komolec",
				"rama",
				"zapestje",
				"prsti"
			], "multiple");
			continue;
		}

		// === POŠKODBE KOŽE - OPIS IN MESTO ===
		if (title.includes('poškodbe kože') && title.includes('opis')) {
			addOptionsToField(el, [
				"/",
				"prsti na roki",
				"prsti na nogi",
				"podlaket",
				"nadlaket",
				"noga",
				"hrbet",
				"trebuh",
				"obraz"
			], "multiple");
			continue;
		}

		// === VRSTA OBUTVE ===
		if (title.includes('vrsta obutve')) {
			addOptionsToField(el, [
				"copati",
				"čevlji",
				"natikači",
				"bolnišnični copati",
				"brez obutve"
			], "one");
			continue;
		}

		// === NAKIT ===
		if (title.includes('nakit') && title.includes('uporablja')) {
			addOptionsToField(el, [
				"ročna ura",
				"prstan",
				"ogrlica",
				"verižica",
				"uhani",
				"zapestnica",
				"brez nakita"
			], "multiple");
			continue;
		}

		// === VKLJUČITEV V REHABILITACIJO ===
		if (title.includes('vključitev') && title.includes('rehabilitacij')) {
			addOptionsToField(el, [
				"fizioterapija",
				"delovna terapija",
				"logopedska terapija",
				"psihološka obravnava",
				"ni vključen v rehabilitacijo",
				"/"
			], "multiple");
			continue;
		}

		// === PRILAGODITEV OKOLJA ===
		if (title.includes('prilagoditev okolja')) {
			addOptionsToField(el, [
				"klicna naprava v dosegu rok",
				"ležišče spuščeno na najnižjo višino",
				"posteljne ograjice na obeh straneh",
				"trapez v dosegu rok",
				"varna aplikacija terapije",
				"odstranitev nevarnih predmetov",
				"nedrseča tla"
			], "multiple");
			continue;
		}
	}
};

// Process all categories
for (const catKey in data.categories) {
	const cat = data.categories[catKey];
	if (cat.subcategories) {
		for (const subKey in cat.subcategories) {
			const sub = cat.subcategories[subKey];
			if (sub.elements) {
				processElements(sub.elements);
			}
		}
	}
}

// Write back
fs.writeFileSync(filePath, JSON.stringify(data, null, '\t'), 'utf-8');

console.log(`✅ Posodobljeno ${changedCount} polj iz "str" v izbiro (select)`);
console.log('');
console.log('Spremenjena polja vključujejo:');
console.log('   - Identifikacija pacienta');
console.log('   - Ocena stopnje samooskrbe');
console.log('   - Sporočanje in dokumentiranje');
console.log('   - Vzorec spanja');
console.log('   - Higiensko vzdrževanje');
console.log('   - Nameščanje postelje/ograje/trapeza');
console.log('   - Ocenjevanje tveganja za padec');
console.log('   - Izvajanje ukrepov za preprečevanje okužb/padcev');
console.log('   - Anogenitalna nega, higiena ustne votline');
console.log('   - Nega kože, prhanje, umivanje las, česanje');
console.log('   - Komunikacija, pogovor, poslušanje');
console.log('   - Razvedrilne dejavnosti');
console.log('   - Opis bolečine');
console.log('   - In še mnogo drugih...');
