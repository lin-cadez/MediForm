const fs = require('fs');

// Read the JSON file
const jsonPath = './scripts/zdravstvena-nega-for-upload.json';
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const categories = data.categories;

console.log('=== Converting to Gender-Neutral Text ===\n');

// Replacements: gendered text -> neutral (passive voice)
const replacements = [
    // Identifikacija
    ['Identifikacija pravega pacienta (vprašala sem po imenu, priimku, datumu rojstva, preverila sem zapestnico in dokumentacijo).', 'Pacient identificiran po imenu, priimku, datumu rojstva, zapestnici in dokumentaciji.'],
    ['Identifikacija pravega pacienta (vprašal sem po imenu, priimku, datumu rojstva, preveril sem zapestnico in dokumentacijo).', 'Pacient identificiran po imenu, priimku, datumu rojstva, zapestnici in dokumentaciji.'],
    
    // Razkuževanje
    ['Razkužila z razkužilnimi alkoholnimi robčki.', 'Razkuženo z razkužilnimi alkoholnimi robčki.'],
    ['Razkužil z razkužilnimi alkoholnimi robčki.', 'Razkuženo z razkužilnimi alkoholnimi robčki.'],
    ['Očistila in razkužila s primernimi sredstvi.', 'Očiščeno in razkuženo s primernimi sredstvi.'],
    ['Očistil in razkužil s primernimi sredstvi.', 'Očiščeno in razkuženo s primernimi sredstvi.'],
    ['Pripomočke za enkratno uporabo zavrgla v modro vrečko.', 'Pripomočki za enkratno uporabo zavrženi v modro vrečko.'],
    ['Pripomočke za enkratno uporabo zavrgel v modro vrečko.', 'Pripomočki za enkratno uporabo zavrženi v modro vrečko.'],
    
    // Dokumentiranje
    ['Podatke in posebnosti sem dokumentirala v poročilo ZN.', 'Podatki in posebnosti dokumentirani v poročilo ZN.'],
    ['Podatke in posebnosti sem dokumentiral v poročilo ZN.', 'Podatki in posebnosti dokumentirani v poročilo ZN.'],
    ['Dokumentirano v poročilo ZN in obvestila sobno medicinsko sestro.', 'Dokumentirano v poročilo ZN, sobna medicinska sestra obveščena.'],
    ['Dokumentirano v poročilo ZN in obvestil sobno medicinsko sestro.', 'Dokumentirano v poročilo ZN, sobna medicinska sestra obveščena.'],
    
    // Zamenjava posteljnine
    ['Zamenjala posteljno perilo, ko je bil pacient na stranišču.', 'Posteljno perilo zamenjano, ko je bil pacient na stranišču.'],
    ['Zamenjal posteljno perilo, ko je bil pacient na stranišču.', 'Posteljno perilo zamenjano, ko je bil pacient na stranišču.'],
    ['Zamenjala posteljno perilo in uredila posteljo.', 'Posteljno perilo zamenjano in postelja urejena.'],
    ['Zamenjal posteljno perilo in uredil posteljo.', 'Posteljno perilo zamenjano in postelja urejena.'],
    
    // Umivanje
    ['Umila sem zobno protezo s ščetko in vodo ter pravilno shranila.', 'Zobna proteza umita s ščetko in vodo ter pravilno shranjena.'],
    ['Umil sem zobno protezo s ščetko in vodo ter pravilno shranil.', 'Zobna proteza umita s ščetko in vodo ter pravilno shranjena.'],
    
    // Izbira oblačil
    ['Izbrala sem pravilno bolniško oblačilo in pravilno velikost.', 'Izbrano pravilno bolniško oblačilo in pravilna velikost.'],
    ['Izbral sem pravilno bolniško oblačilo in pravilno velikost.', 'Izbrano pravilno bolniško oblačilo in pravilna velikost.'],
    
    // Spodbujanje
    ['Spodbujala sem pacientko, da bi se čim več pogovarjala s sosedo v sobi in po telefonu s svojci.', 'Pacient spodbujen k pogovarjanju s sostanovalci in svojci.'],
    ['Spodbujal sem pacienta, da bi se čim več pogovarjal s sostanovalcem v sobi in po telefonu s svojci.', 'Pacient spodbujen k pogovarjanju s sostanovalci in svojci.'],
];

let totalReplacements = 0;

// Function to replace text in options array
function processOptions(options) {
    if (!Array.isArray(options)) return options;
    
    const newOptions = [];
    const seenOptions = new Set();
    
    for (let opt of options) {
        let newOpt = opt;
        
        // Apply replacements
        for (const [oldText, newText] of replacements) {
            if (opt === oldText) {
                newOpt = newText;
                totalReplacements++;
                break;
            }
        }
        
        // Only add unique options
        if (!seenOptions.has(newOpt)) {
            newOptions.push(newOpt);
            seenOptions.add(newOpt);
        }
    }
    
    return newOptions;
}

// Process all categories
for (const [catId, category] of Object.entries(categories)) {
    if (!category.subcategories) continue;
    
    for (const [subId, subcategory] of Object.entries(category.subcategories)) {
        if (!subcategory.elements) continue;
        
        for (const [elemId, element] of Object.entries(subcategory.elements)) {
            // Process str fields with options
            if (element.type === 'str' && element.options) {
                const oldLen = element.options.length;
                element.options = processOptions(element.options);
                const newLen = element.options.length;
                
                if (oldLen !== newLen) {
                    console.log(`  ${elemId}: Reduced from ${oldLen} to ${newLen} options`);
                }
            }
            
            // Also update hints to be gender-neutral
            if (element.hint) {
                for (const [oldText, newText] of replacements) {
                    if (element.hint.includes(oldText.slice(0, 20))) {
                        // Don't change hints - they're just examples
                    }
                }
            }
        }
    }
}

// Write the updated JSON
fs.writeFileSync(jsonPath, JSON.stringify(data, null, '\t'), 'utf8');

console.log('\n=== Summary ===');
console.log(`Total text replacements: ${totalReplacements}`);
console.log('File saved successfully!');
