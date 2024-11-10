document.addEventListener("DOMContentLoaded", function() {
    let canvas, uploadedImage, overlayImage;
    let scaleFactor = 1; // Current scale factor for the canvas
    let lastDistance = 0; // Distance between two touch points during pinch gesture

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
                    selectable: true,  // Make the overlay image selectable
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
                });

                // Scale the overlay to fit within the canvas
                const scaleFactor = Math.min(canvas.width / img.width, canvas.height / img.height);
                img.scale(scaleFactor);

                // Ensure the overlay image is selectable and focused
                canvas.add(overlayImage);
                canvas.setActiveObject(overlayImage); // Set the overlay image as active
                canvas.renderAll(); // Force canvas to re-render and show control points immediately
                console.log('Overlay image added to canvas.');
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
        }
    });

    document.getElementById('flip-vertical').addEventListener('click', function() {
        if (overlayImage) {
            overlayImage.set('flipY', !overlayImage.flipY);
            canvas.renderAll();
            console.log('Overlay image flipped vertically.');
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

    // Resize the canvas when window is resized and rescale the images
    window.addEventListener('resize', function() {
        const newCanvasWidth = window.innerWidth * 0.9;
        const newCanvasHeight = window.innerHeight * 0.7;

        canvas.setWidth(newCanvasWidth);
        canvas.setHeight(newCanvasHeight);

        console.log('Canvas resized:', newCanvasWidth, newCanvasHeight);

        // Re-scale images to fit the new canvas size while maintaining their aspect ratio
        if (uploadedImage) {
            const scaleFactor = Math.min(newCanvasWidth / uploadedImage.width, newCanvasHeight / uploadedImage.height);
            uploadedImage.scale(scaleFactor);

            // Adjust the position of the image to keep it centered
            const left = (newCanvasWidth - uploadedImage.getScaledWidth()) / 2;
            const top = (newCanvasHeight - uploadedImage.getScaledHeight()) / 2;

            uploadedImage.set({ left: left, top: top });
        }

        if (overlayImage) {
            const scaleFactor = Math.min(newCanvasWidth / overlayImage.width, newCanvasHeight / overlayImage.height);
            overlayImage.scale(scaleFactor);
        }

        canvas.renderAll(); // Re-render the canvas
    });

    // Pinch-to-Zoom Gesture
    let lastDistance = 0; // Distance between the two touch points

    // Listen for touchstart
    canvas.wrapperEl.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            lastDistance = getDistance(e.touches[0], e.touches[1]);
        }
    });

    // Listen for touchmove
    canvas.wrapperEl.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2) {
            const newDistance = getDistance(e.touches[0], e.touches[1]);

            // If there's a difference in distance, zoom the canvas accordingly
            if (newDistance !== lastDistance) {
                const scaleChange = newDistance / lastDistance;
                scaleFactor *= scaleChange;
                canvas.setZoom(scaleFactor); // Zoom canvas
                canvas.renderAll();
            }

            lastDistance = newDistance; // Update last distance
        }
    });

    // Helper function to calculate distance between two touch points
    function getDistance(touch1, touch2) {
        return Math.sqrt(
            Math.pow(touch2.pageX - touch1.pageX, 2) +
            Math.pow(touch2.pageY - touch1.pageY, 2)
        );
    }
});
