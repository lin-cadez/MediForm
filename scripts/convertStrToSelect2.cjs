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

// Process all categories - second pass for remaining fields
const processElements = (elements) => {
	for (const key in elements) {
		const el = elements[key];
		const title = el.title?.toLowerCase() || '';
		const hint = el.hint || '';

		// Skip if already has options or is not str type
		if (el.options || el.type !== "str") continue;

		// === SPUTUM ===
		if (title === 'sputum') {
			addOptionsToField(el, [
				"/",
				"brez sputuma",
				"prozoren sputum",
				"bel sputum",
				"rumen sputum",
				"zelen sputum",
				"krvav sputum",
				"gost sputum",
				"redek sputum"
			], "multiple");
			continue;
		}

		// === MOTNJE DIHANJA ===
		if (title === 'motnje dihanja') {
			addOptionsToField(el, [
				"/",
				"brez motenj",
				"dispneja",
				"ortopneja",
				"kašelj",
				"hripanje",
				"piskanje",
				"kratka sapa"
			], "multiple");
			continue;
		}

		// === POLNJENOST PULZA ===
		if (title.includes('polnjenost') && title.includes('pulz')) {
			addOptionsToField(el, [
				"dobro polnjen/dobro tipljiv",
				"slabo polnjen/slabo tipljiv",
				"nitast",
				"netipljiv"
			], "one");
			continue;
		}

		// === OBČUTEK SITOSTI ===
		if (title.includes('občutek sitosti') || (title.includes('občutek') && hint.includes('sit'))) {
			addOptionsToField(el, [
				"sit",
				"delno sit",
				"lačen",
				"brez apetita",
				"slabost"
			], "one");
			continue;
		}

		// === OHROMELOST ===
		if (title === 'ohromelost') {
			addOptionsToField(el, [
				"/",
				"brez ohromelosti",
				"pareza desne strani",
				"pareza leve strani",
				"plegija desne strani",
				"plegija leve strani",
				"paraplegija",
				"tetraplegija"
			], "one");
			continue;
		}

		// === MED.TEH. PRIPOMOČKI - NE UPORABLJA ===
		if (title.includes('pripomočki') && title.includes('ne uporablja')) {
			addOptionsToField(el, [
				"/",
				"brez pripomočkov",
				"hodulja",
				"bergle",
				"invalidski voziček",
				"palica"
			], "multiple");
			continue;
		}

		// === DRUGO - VPLIVI ===
		if (title.includes('drugo') && (title.includes('vpliv') || title.includes('vzrok'))) {
			addOptionsToField(el, [
				"/",
				"epileptični napad",
				"možganska krvavitev",
				"možganska kap",
				"poškodba",
				"operacija",
				"kronična bolezen"
			], "multiple");
			continue;
		}

		// === OSEBNA HIGIENA PREKO DNEVA / VEČERNA ===
		if (title.includes('osebna higiena pacienta preko dneva') || title.includes('večerna osebna higiena')) {
			addOptionsToField(el, [
				"/",
				"ustna higiena",
				"umivanje rok",
				"umivanje obraza",
				"menjava oblačil",
				"anogenitalna nega"
			], "multiple");
			continue;
		}

		// === POMOČ PRI UMIVANJU DELA TELESA ===
		if (title.includes('pomoč pri umivanju') && title.includes('dela telesa')) {
			addOptionsToField(el, [
				"hrbet",
				"anogenitalni predel",
				"noge",
				"roke",
				"obraz",
				"lasje",
				"/"
			], "multiple");
			continue;
		}

		// === DRUGE SPREMEMBE KOŽE ===
		if (title.includes('druge spremembe') && title.includes('kož')) {
			addOptionsToField(el, [
				"/",
				"brez sprememb",
				"srbenje",
				"pekoče",
				"mravljinčenje",
				"oteklina",
				"rdečina"
			], "multiple");
			continue;
		}

		// === VPLIV BOLEZNI NA DELO ===
		if (title.includes('vpliv bolezni na') && title.includes('delo')) {
			addOptionsToField(el, [
				"/",
				"brez vpliva",
				"zmanjšana zmožnost dela",
				"nezmožnost opravljanja dela",
				"prilagojeno delo"
			], "one");
			continue;
		}

		// === VKLJUČEN V RAZVEDRILNE DEJAVNOSTI ===
		if (title.includes('vključen') && title.includes('razvedriln')) {
			addOptionsToField(el, [
				"/",
				"gledanje televizije",
				"branje",
				"druženje",
				"sprehodi",
				"ročna dela"
			], "multiple");
			continue;
		}

		// === PRILAGODITEV DELA ===
		if (title.includes('prilagoditev dela')) {
			addOptionsToField(el, [
				"/",
				"brez prilagoditev",
				"skrajšan delovni čas",
				"lažja dela",
				"delo od doma",
				"bolniški stalež"
			], "one");
			continue;
		}

		// === VRSTA PREISKAVE - DATUM/URA ===
		if (title.includes('datum') && title.includes('preiskav')) {
			addOptionsToField(el, [
				"/",
				"danes zjutraj",
				"danes popoldne",
				"včeraj",
				"pretekli teden"
			], "one");
			continue;
		}

		// === PRIPRAVA PACIENTA NA PREISKAVO ===
		if (title.includes('priprava pacienta') && title.includes('preiskav')) {
			addOptionsToField(el, [
				"/",
				"tešč",
				"odvzem krvi",
				"odvzem urina",
				"premedikacija",
				"črevesna priprava",
				"psihična priprava"
			], "multiple");
			continue;
		}

		// === VRSTA AKUTNE/KRONIČNE RANE - IZGLED ===
		if ((title.includes('izgled') || title.includes('ocena')) && title.includes('rane')) {
			addOptionsToField(el, [
				"/",
				"čista rana",
				"rana se celi",
				"pordela okolica",
				"otekla okolica",
				"prisoten izcedek",
				"znaki vnetja"
			], "multiple");
			continue;
		}

		// === PREVEZA RANE ===
		if (title.includes('preveza') && title.includes('rane')) {
			addOptionsToField(el, [
				"/",
				"suha preveza",
				"preveza z antiseptikom",
				"preveza z oblogo",
				"ni potrebna preveza"
			], "one");
			continue;
		}

		// === Fields with hint "/"  that should be optional text ===
		// Keep these as str for free text entry since they are edge cases

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

console.log(`✅ Dodatno posodobljeno ${changedCount} polj iz "str" v izbiro (select)`);
console.log('');
console.log('Dodatno spremenjena polja vključujejo:');
console.log('   - Sputum');
console.log('   - Motnje dihanja');
console.log('   - Polnjenost pulza');
console.log('   - Občutek sitosti');
console.log('   - Ohromelost');
console.log('   - Osebna higiena preko dneva/večerna');
console.log('   - Pomoč pri umivanju dela telesa');
console.log('   - Druge spremembe kože');
console.log('   - Vpliv bolezni na delo');
console.log('   - Priprava pacienta na preiskavo');
console.log('   - Izgled rane, preveza rane');
