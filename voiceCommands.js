
/*******Voice Commands handling */

// Function to handle voice command

// Function to handle voice command
function handleVoiceCommand(command) {
    if (!speechActivated) {
        console.log('Speech synthesis not activated');
        return;
    }

    // Normalize command and trim spaces
    const normalizedCommand = normalizeCommand(command.toLowerCase().trim());
    console.log('Normalized Voice command:', normalizedCommand);

    // Regex to extract the base callsign, number (if present), and command
    const match = normalizedCommand.match(/^(\w+)(?:\s+(\d+))?\s+(.*)$/);

    if (match) {
        let callsign = match[1];
        const number = match[2]; // Extract number if present (e.g., '1' in 'Cola 1')
        const userCommand = match[3]; // Remaining part of the command

        // Normalize the callsign for consistency (e.g., mapping 'kola' to 'cola' if needed)
        callsign = normalizeCallsign(callsign);
        console.log(`Identified base callsign: ${callsign}`);

        // Check if a number is specified (e.g., 'Cola 1')
        if (number) {
            // Handle individual member of the formation
            const memberCallsign = `${callsign}-${number}`;
            console.log(`Identified specific formation member: ${memberCallsign}`);
            // Here, proceed with issuing the command to the specific formation member
        } else {
            // Handle the base callsign (e.g., 'Cola') for the whole formation
            console.log(`Identified base callsign for formation: ${callsign}`);
            // Here, you can handle command propagation to all formation members
        }

    } else {
        console.warn('Failed to match voice command structure:', command);
    }
}


// Normalize to handle common mispronunciations
function normalizeCommand(command) {
    // Replace common misrecognitions
    const replacements = {
        'handing': 'heading',
        'into': 'heading', // Replacing into  as heading
        'in': 'heading' // replacing in as heading
    };
    for (let [incorrect, correct] of Object.entries(replacements)) {
        command = command.replace(new RegExp(`\\b${incorrect}\\b`, 'g'), correct);
    }
    return command.trim();
}


function normalizeCallsign(callsign) {
    // Map for known airline prefixes
    const airlineMap = {
        'air india': 'AI',
        'indigo': 'IGO',
        'spicejet': 'SJ',
        // Add more airlines as needed
    };

    // Map for phonetic alphabet to single-letter conversions
    const phoneticMap = {
        'alpha': 'A', 'bravo': 'B', 'charlie': 'C', 'delta': 'D', 'echo': 'E',
        'foxtrot': 'F', 'golf': 'G', 'hotel': 'H', 'india': 'I', 'juliett': 'J',
        'kilo': 'K', 'lima': 'L', 'mike': 'M', 'november': 'N', 'oscar': 'O',
        'papa': 'P', 'quebec': 'Q', 'romeo': 'R', 'sierra': 'S', 'tango': 'T',
        'uniform': 'U', 'victor': 'V', 'whiskey': 'W', 'x-ray': 'X', 'yankee': 'Y', 'zulu': 'Z'
    };

    // Normalize input callsign to lowercase and trim whitespace
    let normalized = callsign.toLowerCase().trim();

    // Handle formation callsigns (e.g., "Cola 1" -> "Cola-1")
    const formationMatch = normalized.match(/^(\w+)\s*(\d)$/);
    if (formationMatch) {
        const baseCallsign = formationMatch[1];
        const number = formationMatch[2];
        if (number >= '1' && number <= '4') {
            return `${baseCallsign.toUpperCase()}-${number}`;
        }
    }

    // Handle airline callsigns with numeric identifier (e.g., "Air India 320" -> "AI320")
    for (const [airlineName, airlineCode] of Object.entries(airlineMap)) {
        if (normalized.startsWith(airlineName)) {
            const numberMatch = normalized.match(/\d+$/); // Capture trailing number, if present
            return airlineCode + (numberMatch ? numberMatch[0] : '');
        }
    }

    // Handle phonetic-based callsigns (e.g., "Victory Charlie Golf" -> "VCG")
    const words = normalized.split(/\s+/);
    let result = '';
    let allPhonetic = true;

    for (const word of words) {
        if (phoneticMap[word]) {
            result += phoneticMap[word];
        } else {
            allPhonetic = false;
            result += word; // If it's not in the phonetic map, keep as-is
        }
    }

    // If all words are phonetic letters, return the compressed result
    if (allPhonetic) {
        return result.toUpperCase();
    }

    return callsign.toUpperCase(); // Default to returning the original callsign in uppercase if no match
}

