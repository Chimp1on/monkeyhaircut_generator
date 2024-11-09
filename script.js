document.addEventListener("DOMContentLoaded", function() {
    let canvas, uploadedImage, overlayImage;
    let undoStack = [];
    let redoStack = [];

    // Initialize the canvas with set dimensions
    canvas = new fabric.Canvas('meme-canvas', {
        width: window.innerWidth * 0.9,
        height: window.innerHeight * 0.7,
        backgroundColor: '#e0e0e0',
    });
    console.log('Canvas initialized:', canvas.width, canvas.height);

    // Fetch overlay images from overlays.json
    fetch('starter_pack/overlays.json')
        .then(response => response.json())
        .then(images => {
            const overlaySelector = document.getElementById('overlay-selector');
            images.forEach(image => {
                const option = document.createElement('option');
                option.value = `starter_pack/${image}`;
                option.textContent = image;
                overlaySelector.appendChild(option);
            });
            console.log('Overlay images loaded:', images);
        })
        .catch(error => console.error('Error loading overlays:', error));

    // Save canvas state
    function saveState() {
        undoStack.push(canvas.toJSON());
        redoStack = [];
        console.log('State saved.');
    }

    // Handle image upload and rendering
    document.getElementById('upload-image').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                fabric.Image.fromURL(event.target.result, function(img) {
                    uploadedImage = img.set({
                        left: 0,
                        top: 0,
                        selectable: false,
                        opacity: 1,  // Ensure image opacity is fully visible
                    });

                    // Clear canvas before adding a new image
                    canvas.clear();
                    canvas.add(uploadedImage);
                    canvas.centerObject(uploadedImage);
                    uploadedImage.scaleToWidth(canvas.width); // Scale to canvas width
                    uploadedImage.sendToBack(); // Ensure background image
                    canvas.renderAll(); // Explicitly render the canvas
                    console.log('Uploaded image added and centered.');

                    // Log final dimensions to confirm visibility
                    console.log('Image Dimensions:', uploadedImage.width, uploadedImage.height);
                    console.log('Canvas Dimensions:', canvas.width, canvas.height);
                    saveState();
                });
            };
            reader.readAsDataURL(file);
        }
    });

    // Overlay selection and placement
    document.getElementById('overlay-selector').addEventListener('change', function(e) {
        const overlayUrl = e.target.value;
        if (overlayUrl) {
            fabric.Image.fromURL(overlayUrl, function(img) {
                if (overlayImage) canvas.remove(overlayImage); // Remove any previous overlay
                overlayImage = img.set({
                    left: 100,
                    top: 100,
                    selectable: true,
                    transparentCorners: false,
                    borderColor: 'red',
                    cornerColor: 'blue',
                    cornerSize: 12,
                    padding: 10,
                    opacity: 1,
                });

                const scaleFactor = Math.min(canvas.width / img.width, canvas.height / img.height);
                img.scale(scaleFactor);
                canvas.add(overlayImage); // Add overlay image
                canvas.setActiveObject(overlayImage); // Set active to show controls
                canvas.renderAll(); // Explicitly render the canvas
                console.log('Overlay added and scaled.');

                // Log overlay dimensions
                console.log('Overlay Dimensions:', overlayImage.width, overlayImage.height);
                saveState();
            });
        }
    });

    // Flip functionality for overlay image
    document.getElementById('flip-horizontal').addEventListener('click', function() {
        if (overlayImage) {
            overlayImage.set('flipX', !overlayImage.flipX);
            canvas.renderAll();
            saveState();
            console.log('Overlay flipped horizontally.');
        }
    });

    document.getElementById('flip-vertical').addEventListener('click', function() {
        if (overlayImage) {
            overlayImage.set('flipY', !overlayImage.flipY);
            canvas.renderAll();
            saveState();
            console.log('Overlay flipped vertically.');
        }
    });

    // Undo and Redo functionality
    document.getElementById('undo-button').addEventListener('click', function() {
        if (undoStack.length > 0) {
            redoStack.push(canvas.toJSON());
            const lastState = undoStack.pop();
            canvas.loadFromJSON(lastState, () => canvas.renderAll());
            console.log('Undo performed.');
        }
    });

    document.getElementById('redo-button').addEventListener('click', function() {
        if (redoStack.length > 0) {
            undoStack.push(canvas.toJSON());
            const nextState = redoStack.pop();
            canvas.loadFromJSON(nextState, () => canvas.renderAll());
            console.log('Redo performed.');
        }
    });

    // Download functionality
    document.getElementById('download-button').addEventListener('click', function() {
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'meme.png';
        link.click();
        console.log('Meme downloaded.');
    });

    // Handle window resizing
    window.addEventListener('resize', () => {
        const newWidth = window.innerWidth * 0.9;
        const newHeight = window.innerHeight * 0.7;
        canvas.setWidth(newWidth);
        canvas.setHeight(newHeight);
        if (uploadedImage) uploadedImage.scaleToWidth(newWidth);
        if (overlayImage) overlayImage.scaleToWidth(newWidth * 0.5);
        canvas.centerObject(uploadedImage); // Center the image on resize
        canvas.renderAll();
        console.log('Canvas resized.');
    });
});
