document.addEventListener("DOMContentLoaded", function() {
    let canvas, uploadedImage, overlayImage;
    let undoStack = [];
    let redoStack = [];

    // Fixed canvas size
    const canvasWidth = window.innerWidth * 0.9; // 90% of the screen width
    const canvasHeight = window.innerHeight * 0.7; // 70% of the screen height

    // Initialize the canvas
    canvas = new fabric.Canvas('meme-canvas', {
        width: canvasWidth,
        height: canvasHeight,
        backgroundColor: '#fff',
    });
    console.log('Canvas initialized with fixed size: ', canvasWidth, canvasHeight);

    // Fetch overlay images from overlays.json
    fetch('starter_pack/overlays.json')
        .then(response => response.json())
        .then(images => {
            const overlaySelector = document.getElementById('overlay-selector');
            // Populate the dropdown with overlay images
            images.forEach(image => {
                const option = document.createElement('option');
                option.value = `starter_pack/${image}`;
                option.textContent = image;
                overlaySelector.appendChild(option);
            });
            console.log('Overlay images loaded:', images);
        })
        .catch(error => {
            console.error('Error loading overlays:', error);
        });

    // Function to save current state to the undo stack
    function saveState() {
        const state = JSON.stringify(canvas.toJSON()); // Save canvas state
        undoStack.push(state);
        document.getElementById('undo-button').disabled = false; // Enable Undo button
        redoStack = []; // Clear redo stack on new action
        document.getElementById('redo-button').disabled = true; // Disable Redo button
        console.log('State saved to undo stack');
    }

    // Add event listener for overlay selection
    document.getElementById('overlay-selector').addEventListener('change', function(e) {
        const overlayUrl = e.target.value;
        if (overlayUrl) {
            console.log('Selected overlay:', overlayUrl);
            fabric.Image.fromURL(overlayUrl, function(img) {
                if (overlayImage) {
                    canvas.remove(overlayImage); // Remove previous overlay if it exists
                }
                overlayImage = img.set({
                    left: 100,
                    top: 100,
                    selectable: true, // Make the overlay image selectable
                    transparentCorners: false // Ensure corners are not transparent
                });

                // Set control points visibility immediately
                overlayImage.setControlsVisibility({
                    tl: true, // Top-left
                    tr: true, // Top-right
                    bl: true, // Bottom-left
                    br: true, // Bottom-right
                    mt: true, // Middle-top
                    mb: true, // Middle-bottom
                    ml: true, // Middle-left
                    mr: true  // Middle-right
                });

                // Customize control points for better visibility
                overlayImage.set({
                    borderColor: 'red',           // Control points border color
                    cornerColor: 'blue',          // Control points color
                    cornerSize: 12,               // Size of control points
                    cornerStrokeColor: 'black',   // Border color of the control points
                    padding: 10                   // Padding to ensure control points are visible
                });

                // Scale the overlay to fit within the canvas
                const scaleFactor = Math.min(canvas.width / img.width, canvas.height / img.height);
                img.scale(scaleFactor);

                canvas.add(overlayImage);
                canvas.renderAll(); // Force canvas to re-render and show control points immediately
                console.log('Overlay image added to canvas.');
                saveState(); // Save state after overlay addition
            });
        }
    });

    // Handle image upload
    document.getElementById('upload-image').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            console.log('Uploading image:', file);
            const reader = new FileReader();
            reader.onload = function(event) {
                fabric.Image.fromURL(event.target.result, function(img) {
                    uploadedImage = img.set({
                        left: 0,
                        top: 0,
                        selectable: false // Disable image dragging
                    });

                    // Clear any previous content
                    canvas.clear();

                    // Scale the uploaded image to fit within the fixed canvas size
                    const scaleFactor = Math.min(canvas.width / img.width, canvas.height / img.height);
                    img.scale(scaleFactor);

                    // Adjust the image position to center it
                    const left = (canvas.width - img.getScaledWidth()) / 2;
                    const top = (canvas.height - img.getScaledHeight()) / 2;

                    img.set({ left: left, top: top });

                    canvas.add(uploadedImage);
                    canvas.renderAll(); // Re-render the canvas to show the uploaded image
                    console.log('Uploaded image added to canvas.');
                    saveState(); // Save state after image upload
                });
            };
            reader.readAsDataURL(file);
        }
    });

    // Flip functionality for overlay image
    document.getElementById('flip-horizontal').addEventListener('click', function() {
        if (overlayImage) {
            overlayImage.set('flipX', !overlayImage.flipX);
            canvas.renderAll();
            console.log('Overlay image flipped horizontally.');
            saveState(); // Save state after flipping
        }
    });

    document.getElementById('flip-vertical').addEventListener('click', function() {
        if (overlayImage) {
            overlayImage.set('flipY', !overlayImage.flipY);
            canvas.renderAll();
            console.log('Overlay image flipped vertically.');
            saveState(); // Save state after flipping
        }
    });

    // Undo functionality
    document.getElementById('undo-button').addEventListener('click', function() {
        if (undoStack.length > 0) {
            const lastState = undoStack.pop();
            redoStack.push(JSON.stringify(canvas.toJSON())); // Save the current state to redo stack
            canvas.loadFromJSON(lastState, function() {
                canvas.renderAll();
                document.getElementById('redo-button').disabled = false; // Enable Redo button
                if (undoStack.length === 0) {
                    document.getElementById('undo-button').disabled = true; // Disable Undo button if empty
                }
                console.log('Undo performed');
            });
        }
    });

    // Redo functionality
    document.getElementById('redo-button').addEventListener('click', function() {
        if (redoStack.length > 0) {
            const lastState = redoStack.pop();
            undoStack.push(JSON.stringify(canvas.toJSON())); // Save current state to undo stack
            canvas.loadFromJSON(lastState, function() {
                canvas.renderAll();
                document.getElementById('undo-button').disabled = false; // Enable Undo button
                if (redoStack.length === 0) {
                    document.getElementById('redo-button').disabled = true; // Disable Redo button if empty
                }
                console.log('Redo performed');
            });
        }
    });

    // Download meme image
    document.getElementById('download-button').addEventListener('click', function() {
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'meme.png';
        link.click();
        console.log('Meme downloaded.');
    });
});
