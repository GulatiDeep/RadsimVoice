
//********commands.js script file starts here**********/

// Aircraft Commands
function processCommand(formationSize, blip) {
    const input = document.getElementById(`commandInput_${blip.callsign}`);
    const command = input.value.trim().toUpperCase();

    // Check if the aircraft is a leader and whether the checkbox is checked
    if (blip.role === "Leader") {
        const checkbox = document.getElementById(`formationCheckbox_${blip.callsign}`);

        if (checkbox && checkbox.checked) {  // Propagate if checked
            console.log(`Command received by C/S ${blip.callsign} for formation. Propagating "${command}" to formation members.`);
            propagateCommandToFormation(blip, command);
        } else {
            processCommandForBlip(blip, command);  // Execute only for the leader
        }
    }
    else {
        // Execute the command for the current aircraft (individual, leader, or member)
        //console.log(`Command "${command}" received by C/S ${blip.callsign}.`);
        processCommandForBlip(blip, command);
    }

    input.value = ''; // Clear input after processing
}

// Function to propagate commands to formation members in reverse order (last to first)
function propagateCommandToFormation(leaderBlip, command) {
    const baseCallsign = getBaseCallsign(leaderBlip.callsign);
    const formationSize = leaderBlip.formationSize;  // Get the formation size from the leader

    console.log(`Base Callsign: ${baseCallsign}, Formation Size: ${formationSize}`);

    // Loop backwards from the last aircraft in the formation to the first (including the leader)
    for (let i = 1; i <= 4; i++) {
        const currentCallsign = `${baseCallsign}-${i}`;
        const currentBlip = aircraftBlips.find(blip => blip.callsign === currentCallsign);

        if (currentBlip) {
            processCommandForBlip(currentBlip, command); // Execute the command for each aircraft
        }
    }
}

// Function to process a specific command for an individual aircraft or formation member
function processCommandForBlip(blip, command) {
    const headingMatch = command.match(/^([LR])(\d{3})$/);
    const speedMatch = command.match(/^S(\d+)$/);
    const altitudeMatch = command.match(/^H(\d{1,2})$/);
    const verticalRateMatch = command.match(/^V(\d+)$/);
    const ssrMatch = command.match(/^SSR([0-7]{4})$/);

    let isValidCommand = false; // Track whether the command is valid

    console.log(`Command "${command}" received by C/S ${blip.callsign}.`);

    // Handle heading command
    if (headingMatch) {
        const direction = headingMatch[1];
        const targetHeading = parseInt(headingMatch[2], 10);

        blip.orbitLeft = false;
        blip.orbitRight = false;

        blip.turnRight = direction === 'R'; // Set turning direction
        blip.setTargetHeading(targetHeading);

        const turnDirection = direction === 'L' ? 'Left' : 'Right';
        updateStatusBar(`Aircraft ${blip.callsign} turning ${turnDirection} heading ${blip.targetHeading}°`);
        isValidCommand = true;
        const voiceHeading = pronounceHeading(blip.targetHeading);
        const voiceCallsign = pronounceCallsign(blip.callsign);
        speak(`${voiceCallsign} Turning ${turnDirection} Heading ${voiceHeading}`);
    }

    // Handle speed command
    else if (speedMatch) {
        const speed = parseInt(speedMatch[1], 10);
        blip.setTargetSpeed(speed);
        updateStatusBar(`Aircraft ${blip.callsign} speed set to ${speed} knots.`);
        isValidCommand = true;
        const voiceCallsign = pronounceCallsign(blip.callsign);
        speak(` Setting speed to ${speed} knots ${voiceCallsign}`);
    }

    // Handle altitude command
    else if (altitudeMatch) {
        const altitude = parseInt(altitudeMatch[1], 10) * 100;
        blip.targetAltitude = altitude;
        updateStatusBar(`Aircraft ${blip.callsign} target altitude set to ${altitude} feet.`);
        isValidCommand = true;
        const voiceCallsign = pronounceCallsign(blip.callsign);
        speak(` Setting altitude to ${altitude} feet ${voiceCallsign}`);
    }

    // Handle vertical rate command
    else if (verticalRateMatch) {
        const rate = parseInt(verticalRateMatch[1], 10);
        blip.verticalClimbDescendRate = rate;
        updateStatusBar(`Aircraft ${blip.callsign} vertical rate set to ${rate} feet per minute.`);
        isValidCommand = true;
        const voiceCallsign = pronounceCallsign(blip.callsign);
        speak(` Changing Vertical Rate of Climb to ${rate} feet per minute ${voiceCallsign}`);
    }

    // Handle SSR code command
    else if (ssrMatch) {
        const newSSRCode = ssrMatch[1];

        if (!['7500', '7600', '7700'].includes(newSSRCode)) {
            const existingSSR = aircraftBlips.find(b => b.ssrCode === newSSRCode);
            if (existingSSR && newSSRCode !== '0000') {
                updateStatusBar(`Duplicate SSR code. Aircraft ${existingSSR.callsign} already squawking ${existingSSR.ssrCode}`);
                //const voiceCallsign = pronounceCallsign(existingSSR.callsign);
                //const voiceSSR = pronounce(existingSSR.ssrCode);
                //speak(`Duplicate SSR code. ${voiceCallsign} already squawking ${voiceSSR}`);
                return;
            }
        }

        blip.setSSRCode(newSSRCode);
        updateStatusBar(`Aircraft ${blip.callsign} SSR code set to 3-${newSSRCode}`);
        //const voiceCallsign = pronounceCallsign(blip.callsign);
        //const voiceSSR = pronounce(newSSRCode);
        //speak(`Squawking ${voiceSSR},${voiceCallsign}` );
        isValidCommand = true;
    }

    // Handle report heading command
    else if (command === "RH") {
        const formattedHeading = String(Math.round(blip.heading) % 360).padStart(3, '0');
        updateStatusBar(`Aircraft ${blip.callsign} heading: ${formattedHeading}°`);
        isValidCommand = true;
        const voiceHeading = pronounceHeading(formattedHeading);
        const voiceCallsign = pronounceCallsign(blip.callsign);
        speak(`${voiceCallsign}  Heading ${voiceHeading}`);
    }

    // Handle delete command
    else if (command === "DEL") {
        deleteAircraft(blip);
        updateStatusBar(`Aircraft ${blip.callsign} deleted.`);
        isValidCommand = true;

    }

    // Handle orbit left command
    else if (command === "OL") {
        blip.startOrbitLeft();
        updateStatusBar(`Aircraft ${blip.callsign} orbiting left.`);
        isValidCommand = true;
        const voiceCallsign = pronounceCallsign(blip.callsign);
        speak(` Orbiting Left ${voiceCallsign}`);
    }

    // Handle orbit right command
    else if (command === "OR") {
        blip.startOrbitRight();
        updateStatusBar(`Aircraft ${blip.callsign} orbiting right.`);
        isValidCommand = true;
        const voiceCallsign = pronounceCallsign(blip.callsign);
        speak(` Orbiting Right ${voiceCallsign}`);
    }

    // Handle stop turn command
    else if (command === "ST") {
        blip.stopTurn();
        const formattedHeading = String(Math.round(blip.heading) % 360).padStart(3, '0');
        updateStatusBar(`Aircraft ${blip.callsign} stopping turn heading: ${formattedHeading}°.`);
        isValidCommand = true;
        const voiceHeading = pronounceHeading(formattedHeading);
        const voiceCallsign = pronounceCallsign(blip.callsign);
        speak(`${voiceCallsign} Stopping Turn Heading ${voiceHeading}`);
    }

    // Handle invalid command
    else {
        updateStatusBar(`Invalid command: ${command}.`);
    }

    // Update the last command display
    const lastCommandDisplay = document.getElementById(`lastCommand_${blip.callsign}`);
    if (lastCommandDisplay) {
        lastCommandDisplay.textContent = `${command}`;
        lastCommandDisplay.style.backgroundColor = isValidCommand ? 'lightgreen' : 'lightcoral'; // Green for valid, red for invalid
    }

}

/****Speaking Commands *******/
/****Functions to pronounce callsign and heading for acknowledgement of commands */
function pronounceCallsign(callsign) {
    const phoneticAlphabet = {
        'A': 'Alpha', 'B': 'Bravo', 'C': 'Charlie', 'D': 'Delta', 'E': 'Echo', 'F': 'Foxtrot', 'G': 'Golf',
        'H': 'Hotel', 'I': 'India', 'J': 'Juliett', 'K': 'Kilo', 'L': 'Lima', 'M': 'Mike', 'N': 'November',
        'O': 'Oscar', 'P': 'Papa', 'Q': 'Quebec', 'R': 'Romeo', 'S': 'Sierra', 'T': 'Tango', 'U': 'Uniform',
        'V': 'Victor', 'W': 'Whiskey', 'X': 'X-ray', 'Y': 'Yankee', 'Z': 'Zulu',
        '0': 'Zero', '1': 'One', '2': 'Two', '3': 'Three', '4': 'Four', '5': 'Five', '6': 'Six', '7': 'Seven',
        '8': 'Eight', '9': 'Nine'
    };

    // Define a mapping for airline abbreviations
    const airlineNames = {
        'AI': 'Air India',
        'IGO': 'Indigo',
        'EK': 'Emirates',
        'BA': 'British Airways',
        'AA': 'American Airlines',
        'DL': 'Delta Airlines'
        // Add more as needed
    };

    // Define a mapping for formation callsigns (names like "Cola", "Limca", "Thunder")
    const formationNames = ['Cola', 'Limca', 'Thunder']; // Add more formation names here if needed

    // Check if the callsign starts with a known airline abbreviation
    const callsignUpper = callsign.toUpperCase();
    let airlinePrefix = '';
    let remainingCallsign = callsign;

    // Check if the first two or three characters match an airline abbreviation
    if (airlineNames[callsignUpper.slice(0, 3)]) {
        airlinePrefix = airlineNames[callsignUpper.slice(0, 3)];
        remainingCallsign = callsign.slice(3);
    } else if (airlineNames[callsignUpper.slice(0, 2)]) {
        airlinePrefix = airlineNames[callsignUpper.slice(0, 2)];
        remainingCallsign = callsign.slice(2);
    }

    // If an airline prefix is found, handle it
    if (airlinePrefix) {
        return airlinePrefix + ' ' + remainingCallsign
            .split('')
            .map(char => phoneticAlphabet[char.toUpperCase()] || phoneticAlphabet[char] || char) // Convert remaining letters and digits
            .join(' ');
    }

    // Check if the callsign is a formation name (like "Cola", "Limca", "Thunder")
    if (formationNames.includes(callsignUpper)) {
        return callsign + ' ' + remainingCallsign
            .split('-')[1] // Get the number part after the '-'
            .split('')
            .map(char => phoneticAlphabet[char] || char) // Convert digits to phonetic alphabet
            .join(' ');
    }

    // If no airline name or formation name is found, proceed with phonetic conversion for the entire callsign
    return callsign
        .split('')
        .map(char => phoneticAlphabet[char.toUpperCase()] || phoneticAlphabet[char] || char) // Convert letters and digits
        .join(' ');
}


function pronounceHeading(heading) {
    const formattedHeading = formatHeading(heading);
    return formattedHeading
        .split('')
        .map(digit => ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'][parseInt(digit)])
        .join(' ');
}

function pronounce(number) {
    return number
        .split('')
        .map(digit => ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'][parseInt(digit)])
        .join(' ');
}

function formatHeading(heading) {
    // Ensures the heading is a 3-digit string (e.g., "005" instead of "5")
    return String(heading).padStart(3, '0');
}
//********commands.js script file ends here**********/

