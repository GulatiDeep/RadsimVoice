//************Functions related to aircraft blip, leading line and associated labels ***********/

// Open create aircraft dialog box
function openAircraftDialog() {
    const dialog = document.getElementById('aircraftDialog');
    dialog.style.display = 'block';
    dialog.style.top = `50%`;  // Center the dialog
    dialog.style.left = `50%`;
    dialog.style.transform = `translate(-50%, -50%)`;
    
}

// Close create aircraft dialog box
function closeAircraftDialog() {
    const dialog = document.getElementById('aircraftDialog');
    dialog.style.display = 'none';
    resetDialogFields();
}

// Reset form fields to their default values
function resetDialogFields() {
    const individualFighterInput = document.getElementById('individualFighterInput');
    const individualTransportInput = document.getElementById('individualTransportInput');
    const fighterFormation2acInput = document.getElementById('fighterFormation2acInput');
    const fighterFormation3acInput = document.getElementById('fighterFormation3acInput');
    const fighterFormation4acInput = document.getElementById('fighterFormation4acInput');
    

    individualFighterInput.value = '0';
    individualFighterInput.style.backgroundColor = '';

    individualTransportInput.value = '0';
    individualTransportInput.style.backgroundColor = '';

    fighterFormation2acInput.value = '0';
    fighterFormation2acInput.style.backgroundColor = '';

    fighterFormation3acInput.value = '0';
    fighterFormation3acInput.style.backgroundColor = '';

    fighterFormation4acInput.value = '0';
    fighterFormation4acInput.style.backgroundColor = '';

}


// Function to remove trailing numbers from a callsign to get formation callsign
function getFormationCallsign(callsign) {
    const parts = callsign.split('-');
    return parts[0]; // Return the base part of the callsign (e.g., Cola from Cola-1, Cola-2)
}


//*******Function related to aircraft blip */


// Function to create the display element if it doesn't exist
function createAircraftCountDisplay() {
    if (!aircraftCountDisplay) {
        aircraftCountDisplay = document.createElement('div');
        aircraftCountDisplay.style.position = 'fixed'; // Fixed position to stay at the top left corner
        aircraftCountDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        aircraftCountDisplay.style.color = 'white';
        aircraftCountDisplay.style.padding = '5px';
        aircraftCountDisplay.style.borderRadius = '3px';
        aircraftCountDisplay.style.fontSize = '12px';
        aircraftCountDisplay.style.zIndex = '1000'; // Ensure it's above other elements
        aircraftCountDisplay.style.left = '10px'; // Position at top left corner
        aircraftCountDisplay.style.top = '30px';
        document.body.appendChild(aircraftCountDisplay);
    }
}

// Function to update aircraft counts in the display element
function displayAircraftCounts() {
    createAircraftCountDisplay();

    aircraftCountDisplay.innerHTML = `
         <strong>Total Aircraft:</strong> ${totalAircraftCount}<br> 
         ${allAircraftCallsigns.join('<br>')}
    `;
}


// Function to Create Aircraft blip(s) after validating inputs from Dialog Box

// Function to create aircraft blip
function createAircraftBlip() {
    // Get selected values from the dropdowns in the dialog
    const numIndividualFighters = parseInt(document.getElementById('individualFighterInput').value, 10);
    const numTransportAc = parseInt(document.getElementById('individualTransportInput').value, 10);
    const num2AcFormation = parseInt(document.getElementById('fighterFormation2acInput').value, 10);
    const num3AcFormation = parseInt(document.getElementById('fighterFormation3acInput').value, 10);
    const num4AcFormation = parseInt(document.getElementById('fighterFormation4acInput').value, 10);

    if (validateInputs()) {
        // Ensure we create the appropriate number of each aircraft type
        const success = createIndividualAircraft(numIndividualFighters) &&
                       createTransportAircraft(numTransportAc) &&
                       createFormationAircraft(num2AcFormation, 2) &&
                       createFormationAircraft(num3AcFormation, 3) &&
                       createFormationAircraft(num4AcFormation, 4);

        if (success) {
            closeAircraftDialog();  // Close the dialog box after creating aircraft
        } else {
            // If any creation failed (due to duplicate callsign), don't proceed
            console.error("Error: Could not create aircraft due to duplicate callsign.");
        }
        return success;
    } else {
        return false;
    }
}


function validateInputs() {
    // Get the values of all input fields
    let individualFighter = document.getElementById('individualFighterInput').value;
    let individualTransport = document.getElementById('individualTransportInput').value;
    let fighterFormation2ac = document.getElementById('fighterFormation2acInput').value;
    let fighterFormation3ac = document.getElementById('fighterFormation3acInput').value;
    let fighterFormation4ac = document.getElementById('fighterFormation4acInput').value;

    // Convert the values to numbers
    individualFighter = parseInt(individualFighter);
    individualTransport = parseInt(individualTransport);
    fighterFormation2ac = parseInt(fighterFormation2ac);
    fighterFormation3ac = parseInt(fighterFormation3ac);
    fighterFormation4ac = parseInt(fighterFormation4ac);

    // Calculate the total number of unique base callsigns in the existing array
    const existingFormationCallsigns = new Set();
    for (const callsign of allAircraftCallsigns) {
        const formationCallsign = getFormationCallsign(callsign);  // Extract the base callsign (e.g., "Cola" from "Cola-1")
        existingFormationCallsigns.add(formationCallsign);
    }

    const totalFormationCallsigns = existingFormationCallsigns.size;

    // Check if the number of formations can be created based on available base callsigns
    const requestedFormations = fighterFormation2ac + fighterFormation3ac + fighterFormation4ac;
    const availableFormations = 11 - totalFormationCallsigns;

    if (totalFormationCallsigns >= 11) {
        alert("Cannot create more formations. Maximum number of formations (11) reached.");
        return false; // Invalid input due to too many existing formations
    }

    if (requestedFormations > availableFormations) {
        alert(`You can create only ${availableFormations} more formations. Please adjust your inputs.`);
        return false; // Too many requested formations
    }

    // Validate each input
    if (individualFighter < 0 || individualFighter > 10 || isNaN(individualFighter)) {
        alert("Individual Fighter AC must be between 0 and 10.");
        return false; // Invalid input
    }
    if (individualTransport < 0 || individualTransport > 10 || isNaN(individualTransport)) {
        alert("Individual Transport AC must be between 0 and 10.");
        return false; // Invalid input
    }
    if (fighterFormation2ac < 0 || fighterFormation2ac > 5 || isNaN(fighterFormation2ac)) {
        alert("Fighter Formation (2AC) must be between 0 and 5.");
        return false; // Invalid input
    }
    if (fighterFormation3ac < 0 || fighterFormation3ac > 5 || isNaN(fighterFormation3ac)) {
        alert("Fighter Formation (3AC) must be between 0 and 5.");
        return false; // Invalid input
    }
    if (fighterFormation4ac < 0 || fighterFormation4ac > 5 || isNaN(fighterFormation4ac)) {
        alert("Fighter Formation (4AC) must be between 0 and 5.");
        return false; // Invalid input
    }

    // If all inputs are valid, return true
    return true;
}

// Helper function to get base callsign from formation callsign (e.g., "Cola-1" -> "Cola")
function getFormationCallsign(callsign) {
    const parts = callsign.split('-');
    return parts[0]; // Return the base part before the dash
}



// Function to create a unique individual aircraft callsign
function getRandomIndividualCallsign() {
    const hundreds = [100, 200, 300, 400, 500, 600, 700];
    let callsign;
    let attempts = 0;
    const maxAttempts = 100;  // Limit to avoid infinite loop

    do {
        const base = hundreds[Math.floor(Math.random() * hundreds.length)];
        callsign = (base + Math.floor(Math.random() * 100)).toString();
        attempts++;
        if (attempts >= maxAttempts) {
            showError("No unique individual callsign could be generated.");
            return null; // If too many attempts, return null to indicate failure
        }
    } while (allAircraftCallsigns.includes(callsign)); // Ensure it's unique

    allAircraftCallsigns.push(callsign); // Store the full generated callsign
    return callsign;
}

// Function to create a unique transport aircraft callsign
function getRandomTransportCallsign() {
    const prefixes = ["VC", "VE", "VG", "VH", "VK", "VU", "VV"];
    const maxAttempts = 50; // Limit to avoid infinite loop
    let callsign;
    let attempts = 0;

    do {
        // Pick a random prefix
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        // Generate a random third letter
        const thirdLetter = String.fromCharCode(Math.floor(Math.random() * 26) + 65);
        // Combine to form the callsign
        callsign = prefix + thirdLetter;
        attempts++;

        if (attempts >= maxAttempts) {
            showError("No unique transport callsign could be generated.");
            return null; // If too many attempts, return null to indicate failure
        }
    } while (allAircraftCallsigns.includes(callsign)); // Ensure it's unique

    allAircraftCallsigns.push(callsign); // Store the generated callsign
    return callsign;
}


// Function to create a unique formation callsign
function getRandomFormationCallsign() {
    
    let formationCallsign;
    let attempts = 0;
    const maxAttempts = 100;  // Limit to avoid infinite loop

    do {
        const randomIndex = Math.floor(Math.random() * formationCallsigns.length);
        formationCallsign = formationCallsigns[randomIndex];
        attempts++;
        if (attempts >= maxAttempts) {
            showError("No unique formation callsign could be generated.");
            return null; // If too many attempts, return null to indicate failure
        }
    } while (allAircraftCallsigns.some(callsign => callsign.startsWith(formationCallsign))); // Ensure base callsign is unique

    return formationCallsign;
}

// Function to display error message
function showError(message) {
    alert(message);  // You can replace this with any other error display method like a custom modal
}

// Function to create aircraft blip for individual aircraft
function createIndividualAircraft(num) {
    for (let i = 0; i < num; i++) {
        const callsign = getRandomIndividualCallsign();
        if (!callsign) return false;  // Stop creation if any error occurs

        const position = getRandomPosition();
        const speed = 300;
        const altitude = getRandomAltitude(6000, 10000);

        const blip = new AircraftBlip(callsign, position.firstHeading, speed, altitude, position.x, position.y, '0000');
        blip.role = 'Individual';
        aircraftBlips.push(blip);

        totalAircraftCount++;

        //console.log(`C/S ${callsign} created as individual aircraft.`);
        createControlBox(blip, 1, 1);
    }
    displayAircraftCounts();
    return true;
}

// Function to create aircraft blip for transport aircraft
function createTransportAircraft(num) {
    for (let i = 0; i < num; i++) {
        const callsign = getRandomTransportCallsign();
        if (!callsign) return false;  // Stop creation if any error occurs

        const position = getRandomPosition();
        const ssrCode = getRandomSSRCode();
        const speed = 250;
        const altitude = getRandomAltitude(6000, 10000);

        const blip = new AircraftBlip(callsign, position.firstHeading, speed, altitude, position.x, position.y, ssrCode);
        blip.role = 'Individual';
        aircraftBlips.push(blip);

        totalAircraftCount++;

        //console.log(`C/S ${callsign} created as transport aircraft.`);
        createControlBox(blip, 1, 1);
    }
    displayAircraftCounts();
    return true;
}

// Function to create aircraft blip for formation aircraft
function createFormationAircraft(num, formationSize) {
    for (let i = 0; i < num; i++) {
        const formationCallsign = getRandomFormationCallsign();  // Get unique base callsign
        if (!formationCallsign) return false;  // Stop creation if any error occurs
        
        const position = getRandomPosition();
        const speed = 300;
        const altitude = getRandomAltitude(6000, 10000);

        // Create all members of the formation
        for (let j = formationSize; j >= 1; j--) {
            const callsign = `${formationCallsign}-${j}`;
            const blip = new AircraftBlip(callsign, position.firstHeading, speed, altitude, position.x, position.y, '0000');
            blip.role = (j === 1) ? 'Leader' : 'Member';

            // Store the formation size in the blip
            blip.formationSize = formationSize;
            
            aircraftBlips.push(blip);
            totalAircraftCount++;

            allAircraftCallsigns.push(callsign); // Push the full callsign for each member
            //console.log(`C/S ${callsign} created as formation ${blip.role}.`);
        }

        // Create control box for each aircraft in formation
        for (let j = 1; j <= formationSize; j++) {
            const callsign = `${formationCallsign}-${j}`;
            const blip = aircraftBlips.find(b => b.callsign === callsign);
            createControlBox(blip, formationSize, j);
        }
    }
    displayAircraftCounts();
    return true;
}




// A list to store previously generated positions
let previousPositions = [];

function getRandomPosition() {
    let distance, heading, x, y, bearing, firstHeading;
    let isValidPosition = false;

    // Repeat the process until a valid position (at least 10-20 nautical miles apart) is found
    while (!isValidPosition) {
        // Random distance between 20 and 60 nautical miles
        distance = Math.random() * (60 - 30) + 30;

        // Random heading between 0 and 360 degrees
        heading = Math.random() * 360;

        // Convert polar coordinates (distance, heading) to Cartesian coordinates (x, y)
        x = distance * Math.cos(heading * Math.PI / 180); // x is the distance projected along the x-axis
        y = distance * Math.sin(heading * Math.PI / 180); // y is the distance projected along the y-axis

        // Calculate the bearing from the radar center
        bearing = Math.atan2(x, y) * (180 / Math.PI);
        bearing = (bearing + 360) % 360; // Normalize to 0-360 degrees

        // Calculate the opposite heading (180 degrees from the bearing)
        firstHeading = (bearing + 180) % 360;
        // Format heading to always be 3 digits (no decimals)
        firstHeading = String(Math.round(firstHeading) % 360).padStart(3, '0');
        
        // Check if the new position is at least 10-20 nautical miles away from any previous position
        isValidPosition = true;
        for (let pos of previousPositions) {
            let dx = x - pos.x;
            let dy = y - pos.y;
            let distanceBetween = Math.sqrt(dx * dx + dy * dy); // Calculate the distance between two points

            // If the new position is too close to any previous position, mark it as invalid
            if (distanceBetween < 10) {
                isValidPosition = false;
                break; // Exit the loop and try generating a new position
            }
        }
    }

    // Store the new position
    previousPositions.push({ x, y });

    // Return the valid position along with the calculated heading
    return { x, y, firstHeading };
}

function getRandomPosition1() {
    let distance, heading, x, y;
    let isValidPosition = false;

    // Repeat the process until a valid position (at least 10-20 nautical miles apart) is found
    while (!isValidPosition) {
        // Random distance between 20 and 60 nautical miles
        distance = Math.random() * (60 - 20) + 20;

        // Random heading between 0 and 360 degrees
        heading = Math.random() * 360;

        // Convert polar coordinates (distance, heading) to cartesian coordinates (x, y)
        x = distance * Math.cos(heading * Math.PI / 180); // x is the distance projected along the x-axis
        y = distance * Math.sin(heading * Math.PI / 180); // y is the distance projected along the y-axis

        // Check if the new position is at least 10-20 nautical miles away from any previous position
        isValidPosition = true;
        for (let pos of previousPositions) {
            let dx = x - pos.x;
            let dy = y - pos.y;
            let distanceBetween = Math.sqrt(dx * dx + dy * dy); // Calculate the distance between two points

            // If the new position is too close to any previous position, mark it as invalid
            if (distanceBetween < 10) {
                isValidPosition = false;
                break; // Exit the loop and try generating a new position
            }
        }
    }

    // Store the new position
    previousPositions.push({ x, y });

    // Return the valid position
    return { x, y };
}

function getRandomHeading() {
    return Math.floor(Math.random() * 36) * 10;  // Generates multiples of 10 from 0 to 350
}

function getRandomAltitude(min, max) {
    // Generate a random altitude between min and max, and round it to the nearest multiple of 100
    return Math.floor(Math.random() * ((max - min) / 1000)) * 1000 + min;
}

function getRandomSSRCode() {
    // Define a list of valid 4-digit octal codes (in string format)
    const validSSRCodes = [];

    // Loop through all 4-digit octal numbers (from 0000 to 7777)
    for (let i = 0; i < 4096; i++) {
        // Convert the number to a 4-digit octal string (pad with leading zeros if needed)
        let octalCode = i.toString(8).padStart(4, '0');
        
        // Exclude codes where the last two digits are '00'
        if (octalCode.slice(2) !== '00') {
            validSSRCodes.push(octalCode);
        }
    }

    // Randomly select a SSR code from the valid list
    const randomIndex = Math.floor(Math.random() * validSSRCodes.length);
    return validSSRCodes[randomIndex];
}
