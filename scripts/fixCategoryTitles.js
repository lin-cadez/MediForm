// Script to fix category titles and descriptions

import fs from 'fs';

// Load the current data
const formData = JSON.parse(
    fs.readFileSync('c:/Users/linca/MediForm/scripts/zdravstvena-nega-for-upload.json', 'utf8')
);

// Function to convert to sentence case (first letter uppercase, rest lowercase)
function toSentenceCase(str) {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Process each category
Object.keys(formData.categories).forEach(key => {
    const cat = formData.categories[key];
    const title = cat.title;
    
    // Check if title contains " - " 
    if (title.includes(' - ')) {
        const parts = title.split(' - ');
        const mainTitle = parts[0].trim();
        const afterDash = parts.slice(1).join(' - ').trim(); // In case there are multiple dashes
        
        // Set new title (just the part before -)
        cat.title = mainTitle;
        
        // Set description to the part after - (in sentence case)
        cat.description = toSentenceCase(afterDash);
        
        console.log(`✅ Category ${key}:`);
        console.log(`   Title: "${mainTitle}"`);
        console.log(`   Desc:  "${cat.description}"`);
    } else if (title.includes(' – ')) {
        // Handle em-dash as well
        const parts = title.split(' – ');
        const mainTitle = parts[0].trim();
        const afterDash = parts.slice(1).join(' – ').trim();
        
        cat.title = mainTitle;
        cat.description = toSentenceCase(afterDash);
        
        console.log(`✅ Category ${key}:`);
        console.log(`   Title: "${mainTitle}"`);
        console.log(`   Desc:  "${cat.description}"`);
    } else {
        console.log(`⏭️  Category ${key}: No dash found, keeping as is`);
        console.log(`   Title: "${title}"`);
        console.log(`   Desc:  "${cat.description}"`);
    }
    console.log('');
});

// Save the updated file
fs.writeFileSync(
    'c:/Users/linca/MediForm/scripts/zdravstvena-nega-for-upload.json',
    JSON.stringify(formData, null, '\t'),
    'utf8'
);

console.log('\n✅ All category titles and descriptions updated!');
