document.addEventListener("DOMContentLoaded", function () {
    let canvas, uploadedImage, overlayImage;
    let historyStack = [];
    let currentState = -1;

    // Fixed canvas size
    const canvasWidth = window.innerWidth * 0.9; // 90% of the screen width
    const canvasHeight = window.innerHeight * 0.7; // 70% of the screen height

    // Initialize the canvas
    canvas = new fabric.Canvas('meme-canvas', {
        width: canvasWidth,
        height: canvasHeight,
        backgroundColor: '#fff',
    });

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
        })
        .catch(error => {
            console.error('Error loading overlays:', error);
        });

    // Add event listener for overlay selection
    document.getElementById('overlay-selector').addEventListener('change', function (e) {
        const overlayUrl = e.target.value;
        if (overlayUrl) {
            fabric.Image.fromURL(overlayUrl, function (img) {
                if (overlayImage) {
                    canvas.remove(overlayImage); // Remove previous overlay if it exists
                }
                overlayImage = img.set({
                    left: (canvas.width - img.width) / 2,
                    top: (canvas.height - img.height) / 2,
                    selectable: true,
                    hasBorders: true,
                    hasControls: true
                });

                // Scale the overlay to fit within the canvas
                const scaleFactor = Math.min(canvas.width / img.width, canvas.height / img.height);
                img.scale(scaleFactor);

                canvas.add(overlayImage);
                canvas.renderAll(); // Re-render canvas to show the overlay
                saveState();
            });
        }
    });

    // Handle image upload
    document.getElementById('upload-image').addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (event) {
                fabric.Image.fromURL(event.target.result, function (img) {
                    uploadedImage = img.set({
                        left: (canvas.width - img.width) / 2,
                        top: (canvas.height - img.height) / 2,
                        selectable: false // Disable image dragging
                    });

                    // Clear any previous content
                    canvas.clear();

                    // Scale the uploaded image to fit within the fixed canvas size
                    const scaleFactor = Math.min(canvas.width / img.width, canvas.height / img.height);
                    img.scale(scaleFactor);

                    canvas.add(uploadedImage);
                    canvas.renderAll(); // Re-render the canvas to show the uploaded image
                    saveState();
                });
            };
            reader.readAsDataURL(file);
        }
    });

    // Flip functionality for overlay image
    document.getElementById('flip-horizontal').addEventListener('click', function () {
        if (overlayImage) {
            overlayImage.set('flipX', !overlayImage.flipX);
            canvas.renderAll();
            saveState();
        }
    });

    document.getElementById('flip-vertical').addEventListener('click', function () {
        if (overlayImage) {
            overlayImage.set('flipY', !overlayImage.flipY);
            canvas.renderAll();
            saveState();
        }
    });

    // Download meme image
    document.getElementById('download-button').addEventListener('click', function () {
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'meme.png';
        link.click();
    });

    // Undo functionality
    document.getElementById('undo-button').addEventListener('click', function () {
        if (currentState > 0) {
            currentState--;
            const state = historyStack[currentState];
            loadState(state);
        }
    });

    // Redo functionality
    document.getElementById('redo-button').addEventListener('click', function () {
        if (currentState < historyStack.length - 1) {
            currentState++;
            const state = historyStack[currentState];
            loadState(state);
        }
    });

    // Save canvas state
    function saveState() {
        const state = canvas.toJSON();
        if (currentState < historyStack.length - 1) {
            historyStack = historyStack.slice(0, currentState + 1); // Remove redo states
        }
        historyStack.push(state);
        currentState++;
    }

    // Load canvas state
    function loadState(state) {
        canvas.loadFromJSON(state, function () {
            canvas.renderAll();
        });
    }
});
