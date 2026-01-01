const fs = require('fs');

// Read the JSON file
const jsonPath = './scripts/zdravstvena-nega-for-upload.json';
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const categories = data.categories;

console.log('=== Adding Multi-Select Options to Fields ===\n');

let addedCount = 0;

// Define options for specific fields that should be multi-select
const fieldOptions = {
    // Kategorija 6 - Prehranjevanje
    '6.1.4': {
        title: 'Opazovanje pacienta pri hranjenju in pitju',
        options: [
            'Pacient pojedel celoten obrok',
            'Pacient pojedel ¾ obroka',
            'Pacient pojedel ½ obroka',
            'Pacient pojedel ¼ obroka',
            'Pacient ni jedel',
            'Zdravila zaužita peroralno',
            'Tekočina zaužita v omejeni količini',
            'Tekočina zaužita v neomejeni količini',
            'Potrebna pomoč pri hranjenju',
            'Samostojno hranjenje'
        ],
        option_type: 'multiple'
    },
    '6.1.5': {
        title: 'Priprava pacienta in okolja na hranjenje in pitje',
        options: [
            'Pacient nameščen v sedeč položaj',
            'Pacient nameščen v polsedeč položaj',
            'Dvignjena vzglavje postelje',
            'Pripravljena posteljno mizico',
            'Roke umite pred hranjenjem',
            'Prostor prezračen',
            'Zagotovljen mir in tišina'
        ],
        option_type: 'multiple'
    },
    '6.1.6': {
        title: 'Razdeljevanje hrane/napitkov/prehranskih dodatkov',
        options: [
            'Hrana servirana na posteljno mizico',
            'Hrana servirana za mizo',
            'Hrana dosoljena po želji pacienta',
            'Hrana narezana na manjše kose',
            'Ponujena dodatna tekočina',
            'Ponujen čaj',
            'Ponujena voda',
            'Ponujeni prehranski dodatki'
        ],
        option_type: 'multiple'
    },
    '6.1.7': {
        title: 'Beleženje zaužite hrane in tekočine',
        options: [
            'Beleženo v list za bilanco tekočin',
            'Beleženo v temperaturni list',
            'Beleženo v poročilo ZN',
            'Beleženo po vsakem obroku',
            'Beleženje količine zaužite tekočine',
            'Beleženje količine izločene tekočine'
        ],
        option_type: 'multiple'
    },
    
    // Kategorija 8 - Izločanje
    '8.1.4': {
        title: 'Opazovanje pacienta pri izločanju',
        options: [
            'Opazovana barva urina',
            'Opazovana količina urina',
            'Opazovan vonj urina',
            'Opazovana barva blata',
            'Opazovana konsistenca blata',
            'Opazovan vonj blata',
            'Pacient poročal o težavah',
            'Brez posebnosti'
        ],
        option_type: 'multiple'
    },
    
    // Kategorija 10 - Gibanje
    '10.1.4': {
        title: 'Pomoč pacientu pri gibanju',
        options: [
            'Pomoč pri vstajanju iz postelje',
            'Pomoč pri hoji',
            'Pomoč pri sedenju',
            'Pomoč pri obračanju v postelji',
            'Uporaba hodulj',
            'Uporaba bergel',
            'Uporaba invalidskega vozička',
            'Pacient samostojen pri gibanju'
        ],
        option_type: 'multiple'
    },
    '10.1.5': {
        title: 'Spremljanje pacienta pri gibanju',
        options: [
            'Pacient spremljen do stranišča',
            'Pacient spremljen do kopalnice',
            'Pacient spremljen po hodniku',
            'Pacient spremljen do skupnih prostorov',
            'Zagotovljena varnost pri gibanju',
            'Opazovana stabilnost hoje'
        ],
        option_type: 'multiple'
    },
    
    // Kategorija 12 - Spanje
    '12.1.3': {
        title: 'Priprava pacienta in okolja na spanje',
        options: [
            'Prostor prezračen',
            'Temperatura prostora prilagojena',
            'Svetloba zatemnjena',
            'Zagotovljen mir in tišina',
            'Postelja urejena',
            'Pacient pripravljen na spanje',
            'Ponujen topel napitek'
        ],
        option_type: 'multiple'
    },
    
    // Kategorija 14 - Osebna higiena
    '14.1.4': {
        title: 'Pomoč pacientu pri izvajanju osebne higiene',
        options: [
            'Pomoč pri umivanju obraza',
            'Pomoč pri umivanju rok',
            'Pomoč pri umivanju telesa',
            'Pomoč pri tuširanju',
            'Pomoč pri kopanju',
            'Pomoč pri ustni higieni',
            'Pomoč pri česanju',
            'Pomoč pri britju',
            'Pacient samostojen pri osebni higieni'
        ],
        option_type: 'multiple'
    },
    '14.1.5': {
        title: 'Opazovanje kože med izvajanjem osebne higiene',
        options: [
            'Koža normalne barve',
            'Koža suha',
            'Koža vlažna',
            'Koža rdeča',
            'Prisotne razjede',
            'Prisotne rane',
            'Prisotne spremembe na koži',
            'Brez posebnosti'
        ],
        option_type: 'multiple'
    },
    
    // Kategorija 18 - Varnost
    '18.1.4': {
        title: 'Ukrepi za zagotavljanje varnosti pacienta',
        options: [
            'Nameščene posteljne ograjice',
            'Postelja v najnižjem položaju',
            'Klicna naprava na dosegu roke',
            'Osvetlitev prilagojena',
            'Odstranjene ovire na poti',
            'Primerna obutev pacienta',
            'Pacient seznanjen z nevarnostmi'
        ],
        option_type: 'multiple'
    },
    
    // Kategorija 20 - Komunikacija
    '20.1.4': {
        title: 'Način komunikacije s pacientom',
        options: [
            'Verbalna komunikacija',
            'Neverbalna komunikacija',
            'Uporaba gest',
            'Uporaba slik',
            'Uporaba pisanja',
            'Prilagojena glasnost govora',
            'Prilagojena hitrost govora',
            'Uporaba preprostega jezika'
        ],
        option_type: 'multiple'
    }
};

// Process all categories
for (const [catId, category] of Object.entries(categories)) {
    if (!category.subcategories) continue;
    
    for (const [subId, subcategory] of Object.entries(category.subcategories)) {
        if (!subcategory.elements) continue;
        
        for (const [elemId, element] of Object.entries(subcategory.elements)) {
            // Check if we have options for this field
            if (fieldOptions[elemId]) {
                const config = fieldOptions[elemId];
                
                // Only add options if field doesn't already have them
                if (!element.options || element.options.length === 0) {
                    element.options = config.options;
                    element.option_type = config.option_type;
                    console.log(`  ${elemId}: Added ${config.options.length} options (${config.option_type})`);
                    addedCount++;
                } else {
                    console.log(`  ${elemId}: Already has options, skipping`);
                }
            }
        }
    }
}

// Write the updated JSON
fs.writeFileSync(jsonPath, JSON.stringify(data, null, '\t'), 'utf8');

console.log('\n=== Summary ===');
console.log(`Added options to ${addedCount} fields`);
console.log('File saved successfully!');
