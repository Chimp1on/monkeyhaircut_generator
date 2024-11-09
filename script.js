document.addEventListener("DOMContentLoaded", function() {
    let canvas, uploadedImage, overlayImage;

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

    // Log canvas dimensions to check them
    console.log('Canvas Width:', canvas.width, 'Canvas Height:', canvas.height);

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
                    img.scale(scaleFactor);

                    // Log scaled image dimensions for debugging
                    console.log('Uploaded image scaled: ', img.width * scaleFactor, img.height * scaleFactor);

                    // Log the position of the image
                    console.log('Image Position - left:', img.left, 'top:', img.top);

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
});
