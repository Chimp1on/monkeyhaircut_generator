let canvas, uploadedImage, overlayImage;

// Initialize the canvas
window.onload = function() {
    canvas = new fabric.Canvas('meme-canvas', {
        width: window.innerWidth * 0.8,
        height: window.innerHeight * 0.6,
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
    document.getElementById('overlay-selector').addEventListener('change', function(e) {
        const overlayUrl = e.target.value;
        if (overlayUrl) {
            fabric.Image.fromURL(overlayUrl, function(img) {
                if (overlayImage) {
                    canvas.remove(overlayImage); // Remove previous overlay if it exists
                }
                overlayImage = img.set({
                    left: 100,
                    top: 100,
                    selectable: true
                });
                canvas.add(overlayImage);
            });
        }
    });

    // Handle image upload
    document.getElementById('upload-image').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                fabric.Image.fromURL(event.target.result, function(img) {
                    uploadedImage = img.set({
                        left: 0,
                        top: 0,
                        selectable: false // Disable image dragging
                    });
                    canvas.clear(); // Clear any previous content
                    canvas.add(uploadedImage);
                });
            };
            reader.readAsDataURL(file);
        }
    });

    // Rotate and flip functionality for overlay image
    document.getElementById('rotate-left').addEventListener('click', function() {
        if (overlayImage) {
            overlayImage.rotate(overlayImage.angle - 90);
            canvas.renderAll();
        }
    });

    document.getElementById('rotate-right').addEventListener('click', function() {
        if (overlayImage) {
            overlayImage.rotate(overlayImage.angle + 90);
            canvas.renderAll();
        }
    });

    document.getElementById('flip-horizontal').addEventListener('click', function() {
        if (overlayImage) {
            overlayImage.set('flipX', !overlayImage.flipX);
            canvas.renderAll();
        }
    });

    document.getElementById('flip-vertical').addEventListener('click', function() {
        if (overlayImage) {
            overlayImage.set('flipY', !overlayImage.flipY);
            canvas.renderAll();
        }
    });

    // Download meme image
    document.getElementById('download-button').addEventListener('click', function() {
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'meme.png';
        link.click();
    });
};
