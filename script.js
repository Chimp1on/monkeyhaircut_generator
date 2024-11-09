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

    // Save current state for undo/redo
    function saveState() {
        undoStack.push(canvas.toJSON());
        redoStack = []; // Clear redo stack whenever we make a new change
        console.log('State saved to undo stack.');
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
                    selectable: true,
                    transparentCorners: false,
                });

                // Styling control points for visibility
                overlayImage.setControlsVisibility({
                    tl: true, tr: true, bl: true, br: true, mt: true, mb: true, ml: true, mr: true
                });
                overlayImage.set({
                    borderColor: 'red',
                    cornerColor: 'blue',
                    cornerSize: 12,
                    cornerStrokeColor: 'black',
                    padding: 10
                });

                // Scale the overlay to fit within the canvas
                const scaleFactor = Math.min(canvas.width / img.width, canvas.height / img.height);
                img.scale(scaleFactor);

                // Add overlay to canvas and activate it to show control points
                canvas.add(overlayImage);
                canvas.setActiveObject(overlayImage);
                canvas.renderAll();
                console.log('Overlay image added and activated on canvas.');
                saveState();
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
                        selectable: false
                    });

                    // Clear previous content and scale uploaded image
                    canvas.clear();
                    const scaleFactor = Math.min(canvas.width / img.width, canvas.height / img.height);
                    img.scale(scaleFactor);

                    canvas.add(uploadedImage);
                    canvas.renderAll
