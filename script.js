document.addEventListener("DOMContentLoaded", function() {
    let canvas, uploadedImage, overlayImage;

    // Initial fixed canvas size
    let canvasWidth = window.innerWidth * 0.9; // 90% of the screen width
    let canvasHeight = window.innerHeight * 0.7; // 70% of the screen height

    // Initialize the canvas
    canvas = new fabric.Canvas('meme-canvas', {
        width: canvasWidth,
        height: canvasHeight,
        backgroundColor: '#fff',
    });
    console.log('Canvas initialized with fixed size: ', canvasWidth, canvasHeight);

    // Function to update canvas size and rescale images
    function updateCanvasSize() {
        const newCanvasWidth = window.innerWidth * 0.9;
        const newCanvasHeight = window.innerHeight * 0.7;

        // Only update if the size changes
        if (newCanvasWidth !== canvasWidth || newCanvasHeight !== canvasHeight) {
            canvas.setWidth(newCanvasWidth);
            canvas.setHeight(newCanvasHeight);
            console.log('Canvas resized: ', newCanvasWidth, newCanvasHeight);

            // Rescale the images if they exist
            if (uploadedImage) {
                const scaleFactor = Math.min(newCanvasWidth / uploadedImage.width, newCanvasHeight / uploadedImage.height);
                uploadedImage.scale(scaleFactor);
                uploadedImage.set({
                    left: (newCanvasWidth - uploadedImage.width * scaleFactor) / 2, // Center the image
                    top: (newCanvasHeight - uploadedImage.height * scaleFactor) / 2 // Center the image
                });
            }

            if (overlayImage) {
                const scaleFactor = Math.min(newCanvasWidth / overlayImage.width, newCanvasHeight / overlayImage.height);
                overlayImage.scale(scaleFactor);
                overlayImage.set({
                    left: (newCanvasWidth - overlayImage.width * scaleFactor) / 2, // Center the overlay
                    top: (newCanvasHeight - overlayImage.height * scaleFactor) / 2 // Center the overlay
                });
            }

            canvas.renderAll(); // Re-render canvas to reflect changes
        }
    }

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
                    selectable: true
                });

                // Scale the overlay to fit within the canvas
                const scaleFactor = Math.min(canvas.width / img.width, canvas.height / img.height);
                img.scale(scaleFactor);

                canvas.add(overlayImage);
                canvas.renderAll(); // Re-render canvas to show the overlay
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
                    console.log('Scale Factor:', scaleFactor); // Log scale factor
                    img.scale(scaleFactor);

                    // Log scaled image dimensions
                    console.log('Scaled Image Width:', img.width * scaleFactor, 'Scaled Image Height:', img.height * scaleFactor);

                    // Log the position of the image
                    console.log('Image Position - left:', img.left, 'top:', img.top);

                    // Add the image to the canvas
                    canvas.add(uploadedImage);
                    canvas.renderAll(); // Re-render the canvas to show the uploaded image

                    // Bring the image to front to make sure it isn't hidden
                    canvas.bringToFront(uploadedImage);
                    console.log('Uploaded image added to canvas.');

                    // Log canvas state after adding image
                    console.log('Canvas width:', canvas.width, 'Canvas height:', canvas.height);
                    canvas.forEachObject(function(obj) {
                        console.log('Object on canvas:', obj);
                    });
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

    // Listen for window resize and update canvas size
    window.addEventListener('resize', function() {
        updateCanvasSize();
    });
});
