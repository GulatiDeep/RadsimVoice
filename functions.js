
//********functions.js script file starts here**********/

//File containing all the functions



//for providing focus to clicked aircraft control box
function focusControlBoxInput(callsign) {
    const input = document.getElementById(`commandInput_${callsign}`);
    if (input) {
        input.focus();
    }
}


// Function to update aircraft blips' positions every 4 seconds
function moveAircraftBlips() {
    if (!isPaused) {
        aircraftBlips.forEach(blip => blip.move(false));  // Update both heading and position

        setTimeout(moveAircraftBlips, updateInterval);  // Schedule next movement update
    }
}

//Formation Handling
// Function to toggle the control boxes for formation aircraft based on checkbox status
function toggleFormationControlBoxes(enable, formationSize, firstAircraftCallsign) {
    // Extract the number from the first aircraft's callsign
    const leaderNumberMatch = firstAircraftCallsign.match(/-(\d+)$/);
    let startFrom = 1; // Default to 1 if there is no numeric suffix

    if (leaderNumberMatch) {
        startFrom = parseInt(leaderNumberMatch[1], 10) + 1;  // Get the number and increment by 1
    }

    // Loop through the formation starting from the next number
    for (let i = startFrom; i <= 4; i++) {
        const currentCallsign = `${getBaseCallsign(firstAircraftCallsign)}-${i}`;  // Construct the callsign for the rest of the formation
        if (enable) {
            enableControlBox(currentCallsign);
        } else {
            disableControlBox(currentCallsign);
        }
    }
}

// Function to update the heading and control box every 1 second
function updateHeadingPeriodically() {
    aircraftBlips.forEach(blip => {
        blip.move(true);  // Only update the heading, not the position on the radar
    });

    setTimeout(updateHeadingPeriodically, headingUpdateInterval);  // Schedule next update
}


// Function to delete a single aircraft
function deleteAircraft(blip) {
    const baseCallsign = getBaseCallsign(blip.callsign);

    // Check if the aircraft being deleted is the leader
    if (blip.role === "Leader") {
        const nextInLine = findNextAircraftInFormation(blip);

        if (nextInLine) {
            // Promote the next aircraft to leader with reduced formation size
            promoteToLeader(nextInLine, blip.formationSize);
        }
    }

    // Check if the formation is still active
    if (blip.role === "Member" || blip.role === "Leader") {
        if (!isFormationActive(baseCallsign)) {
            // If no members are left, remove the base callsign from the list
            removeBaseCallsignFromSet(baseCallsign);
        }
    }

    // Decrement the total aircraft count (once per aircraft)
    totalAircraftCount--;

    // Remove the callsign from the allAircraftCallsigns array
    allAircraftCallsigns = allAircraftCallsigns.filter(callsign => callsign !== blip.callsign);

    // Remove the blip from the aircraftBlips array
    aircraftBlips = aircraftBlips.filter(b => b !== blip);

    // Remove the elements from the DOM
    removeAircraftElements(blip);

    // Display the updated counts
    displayAircraftCounts();

    updateStatusBar(`Aircraft ${blip.callsign} deleted.`);
}


// Helper function to check if a formation still has any members
function isFormationActive(baseCallsign) {
    // Find all aircraft whose callsign starts with the base callsign
    const formationMembers = aircraftBlips.filter(b => getBaseCallsign(b.callsign) === baseCallsign);
    
    // If there are no formation members left, the formation is no longer active
    return formationMembers.length > 0;
}

// Helper function to remove the base callsign from the set of active callsigns
function removeBaseCallsignFromSet(baseCallsign) {
    const index = allAircraftCallsigns.findIndex(callsign => getBaseCallsign(callsign) === baseCallsign);
    if (index !== -1) {
        allAircraftCallsigns.splice(index, 1); // Remove the base callsign
    }
}

// Helper function to find the next aircraft in the formation (after the leader)
function findNextAircraftInFormation(leaderBlip) {
    const baseCallsign = getBaseCallsign(leaderBlip.callsign);

    // Extract the number from the leader's callsign
    const leaderNumberMatch = leaderBlip.callsign.match(/-(\d+)$/);
    let startFrom = 1; // Default to 1 if there is no numeric suffix

    if (leaderNumberMatch) {
        startFrom = parseInt(leaderNumberMatch[1], 10) + 1;  // Get the number and increment by 1
    }

    // Find the next aircraft in sequence based on the leader's numeric suffix
    for (let i = startFrom; i <= leaderBlip.formationSize; i++) {
        const nextCallsign = `${baseCallsign}-${i}`;
        const nextBlip = aircraftBlips.find(blip => blip.callsign === nextCallsign);
        //console.log(`Next Callsign in sequence is: ${nextCallsign}`);
        if (nextBlip) return nextBlip;  // Return the next aircraft found
    }

    return null;  // No aircraft found in the sequence
}

// Helper function to promote the next aircraft to leader
function promoteToLeader(newLeaderBlip, newFormationSize) {
    newLeaderBlip.role = "Leader";  // Assign leader role
    newLeaderBlip.formationSize = newFormationSize - 1;  // Update formation size

    // Update the control box: Add the checkbox to the new leader (unchecked by default)
    const controlBox = document.getElementById(`controlBox_${newLeaderBlip.callsign}`);
    if (controlBox) {
        controlBox.querySelector('.command-input-container').innerHTML += `
            <input type="checkbox" id="formationCheckbox_${newLeaderBlip.callsign}">
        `;


        // Add event listener for the checkbox in the first aircraft's control box
        if (newFormationSize >= 1) {
            const checkbox = document.getElementById(`formationCheckbox_${newLeaderBlip.callsign}`);
            checkbox.addEventListener('change', function () {
                toggleFormationControlBoxes(!checkbox.checked, newFormationSize, newLeaderBlip.callsign); // Reversed logic
            });
        }
        console.log(`${newLeaderBlip.callsign} is now new Formation leader. Remaining Formation size is ${newLeaderBlip.formationSize}.`)

    }

}

// Helper function to remove aircraft elements from the DOM
function removeAircraftElements(blip) {
    const elementsToRemove = [
        blip.element, blip.label, blip.line, ...blip.historyDots
    ];

    elementsToRemove.forEach(element => {
        if (element && element.parentNode) element.parentNode.removeChild(element);
    });

    const controlBox = document.getElementById(`controlBox_${blip.callsign}`);
    if (controlBox) controlBox.parentNode.removeChild(controlBox);
}

//***********Functions related to Control Boxes
// Function to Create control box for aircraft
function createControlBox(blip, formationSize, aircraftIndex) {
    const controlPanel = document.getElementById('controlPanel');
    const controlBox = document.createElement('div');
    controlBox.className = 'control-box';
    controlBox.id = `controlBox_${blip.callsign}`;  // Unique ID based on callsign

    // Format heading to always be 3 digits
    const formattedHeading = String(blip.heading).padStart(3, '0');

    // Calculate bearing and distance at the time of creation
    const { bearing, distanceNM } = blip.getBearingAndDistanceFromRadarCenter();

    // Create the HTML for the control box
    controlBox.innerHTML = `
        <div>
            <span class="info-box callsign-box">${blip.callsign}</span>
            <span class="info-box ssr-box">3-${blip.ssrCode}</span>
            <span class="info-box heading-box"><span id="heading_${blip.callsign}">${formattedHeading}°</span></span>
            <span class="info-box altitude-box">A<span id="altitude_${blip.callsign}">${Math.round(blip.altitude / 100)}</span></span>
            <span class="info-box speed-box">N<span id="speed_${blip.callsign}">${blip.speed}</span></span>
            <span class="info-box bearing-distance-box"><span id="bearing_${blip.callsign}">${bearing}</span>° / <span id="distance_${blip.callsign}">${distanceNM}</span> NM</span>
        </div>
        <div class="command-input-container">
            <input type="text" id="commandInput_${blip.callsign}">
            <span id="lastCommand_${blip.callsign}" class="last-command"></span>
            ${formationSize > 1 && aircraftIndex === 1 ?
            `<input type="checkbox" id="formationCheckbox_${blip.callsign}" checked> ` : ''}
        </div>
    `;

    controlPanel.appendChild(controlBox);

    // Disable the control box if it's not the first aircraft in the formation
    if (formationSize > 1 && aircraftIndex > 1) {
        disableControlBox(blip.callsign);
    }

    // Add event listener for the checkbox in the first aircraft's control box
    if (formationSize > 1 && aircraftIndex === 1) {
        const checkbox = document.getElementById(`formationCheckbox_${blip.callsign}`);
        checkbox.addEventListener('change', function () {
            toggleFormationControlBoxes(!checkbox.checked, formationSize, blip.callsign); // Reversed logic
        });
    }

    // Event listener for Enter key to handle commands for each aircraft
    controlBox.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            processCommand(this.formationSize, blip);
        }
    });
}

// Function to update the speed and heading in the control box
function updateControlBox(blip) {
    const headingElement = document.getElementById(`heading_${blip.callsign}`);
    const speedElement = document.getElementById(`speed_${blip.callsign}`);
    const altitudeElement = document.getElementById(`altitude_${blip.callsign}`);
    const callsignElement = document.querySelector(`#controlBox_${blip.callsign} .callsign-box`);
    const ssrElement = document.querySelector(`#controlBox_${blip.callsign} .ssr-box`);
    const bearingElement = document.getElementById(`bearing_${blip.callsign}`);
    const distanceElement = document.getElementById(`distance_${blip.callsign}`);

    // Format heading to always be 3 digits (no decimals)
    const formattedHeading = String(Math.round(blip.heading) % 360).padStart(3, '0');

    // Update heading, speed, and altitude
    if (headingElement) headingElement.innerHTML = `${formattedHeading}°`;
    if (speedElement) speedElement.innerHTML = `${blip.speed}`;
    if (altitudeElement) altitudeElement.innerHTML = `${Math.round(blip.altitude / 100)}`;

    // Update callsign and SSR code
    if (callsignElement) callsignElement.innerHTML = blip.callsign;
    if (ssrElement) ssrElement.innerHTML = `3-${blip.ssrCode}`;

    // Update bearing and distance
    const { bearing, distanceNM } = blip.getBearingAndDistanceFromRadarCenter();
    if (bearingElement) bearingElement.innerHTML = bearing;
    if (distanceElement) distanceElement.innerHTML = distanceNM;
}

// Helper functions to enable or disable control boxes
function enableControlBox(callsign) {
    const commandInput = document.getElementById(`commandInput_${callsign}`);
    if (commandInput) commandInput.disabled = false;
}

// Function to disable the control box
function disableControlBox(callsign) {
    const commandInput = document.getElementById(`commandInput_${callsign}`);
    if (commandInput) commandInput.disabled = true;
}

//*******Function to enable dragging of labels
function dragElement(elmnt, blip) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    elmnt.onmousedown = (e) => {
        e.stopPropagation();  // Prevent panning on label click
        isLabelDragging = true;  // Set the flag to indicate label dragging
        dragMouseDown(e);
    };

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
        isLabelDragging = false;  // Reset the flag when dragging ends

        // Update the label offset relative to the blip
        const blipRect = blip.element.getBoundingClientRect();
        const labelRect = elmnt.getBoundingClientRect();
        blip.labelOffset = {
            x: labelRect.left - blipRect.left,
            y: labelRect.top - blipRect.top
        };

        // Update the line to reflect the new label position
        blip.updateLinePosition();
    }
}




//********functions.js script file ends here**********/