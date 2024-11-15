
//********eventListeners.js script file starts here**********/

    //All event listeners placed here

    document.addEventListener('DOMContentLoaded', () => {
        // Automatically open the aircraft creation dialog when the page loads
        openAircraftDialog();
    });


    // Context menu for creating aircraft

    // Attach event listener to the pause button
    document.getElementById('pauseButton').addEventListener('click', togglePause);

    // Event listener to Show the custom context menu on right-click
    radarScope.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        clickedPosition = calculatePosition(event.clientX, event.clientY);
        radarContextMenu.style.top = `${event.clientY}px`;
        radarContextMenu.style.left = `${event.clientX}px`;
        radarContextMenu.style.display = 'block';
    });

    // Hide context menu when clicking elsewhere
    document.addEventListener('click', () => {
        radarContextMenu.style.display = 'none';
    });

    // Handle "Create Aircraft" from context menu
    document.getElementById('createAircraftContextMenu').addEventListener('click', () => {
        selectedPosition = { ...clickedPosition };
        openAircraftDialog();
        radarContextMenu.style.display = 'none';
    });

    // Event listener for creating aircraft from enter key on dialog box
    document.getElementById('aircraftDialog').addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            if (createAircraftBlip()) {
                closeAircraftDialog();
            }
        }
    });

    // Event listener for creating aircraft from click on Create Button
    document.getElementById('createAircraftButton').addEventListener('click', () => {
        if (createAircraftBlip()) {  // Attempt to create aircraft blip
            closeAircraftDialog();   // Close dialog if creation was successful
        }
    });

    // Event listener for Cancel button for closing aircraft dialog box without making any changes
    document.getElementById('cancelAircraftButton').addEventListener('click', closeAircraftDialog);

    // Event listener for closing aircraft dialog through escape key without making any changes
    document.getElementById('aircraftDialog').addEventListener('keypress', (event) => {
        if (event.key === 'Escape') {
            closeAircraftDialog(); // Close the dialog when "Esc" is pressed
        }
    });

    

    //Event listener to Toggle the visibility of labels and update the button's appearance
    document.getElementById('label').addEventListener('click', () => {
        labelsVisible = !labelsVisible;

        // Get the label button element
        const labelButton = document.getElementById('label');

        // Update the button's appearance based on the current state
        if (labelsVisible) {
            labelButton.classList.add('active');
            labelButton.classList.remove('inactive');
            updateStatusBar('Labels Visible');
        } else {
            labelButton.classList.add('inactive');
            labelButton.classList.remove('active');
            updateStatusBar('Labels Hidden');
        }

        // Update visibility for all aircraft labels and lines
        aircraftBlips.forEach(blip => {
            if (blip.label) {
                blip.label.style.display = labelsVisible ? 'block' : 'none';
            }
            if (blip.line) {
                blip.line.style.display = labelsVisible ? 'block' : 'none';
            }
        });
    });

    //Event listener to Toggle the visibility of history dots and update the button's appearance
    document.getElementById('historyDots').addEventListener('click', () => {
        // Toggle the visibility state
        historyDotsVisible = !historyDotsVisible;

        // Get the history button element
        const historyButton = document.getElementById('historyDots');

        // Update the button's appearance based on the current state
        if (historyDotsVisible) {
            historyButton.classList.add('active');
            historyButton.classList.remove('inactive');
            updateStatusBar('History Dots Visible');
        } else {
            historyButton.classList.add('inactive');
            historyButton.classList.remove('active');
            updateStatusBar('History Dots Hidden');
        }

        // Immediately apply the visibility change by updating all blips
        aircraftBlips.forEach(blip => blip.updateHistoryDots());
    });


    // Attach event listeners to track window resizing or zooming
    window.addEventListener('resize', () => {
        updateRadarCenter();
        createRangeRings();  // Reposition range rings correctly
        aircraftBlips.forEach(blip => blip.updateBlipPosition());
    });





    //********eventListeners.js script file ends here**********/
