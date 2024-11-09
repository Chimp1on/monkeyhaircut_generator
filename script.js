let canvas, uploadedImage, overlayImage, isCroppingEnabled = false, croppingRect;

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

    // Enable cropping mode
    document.getElementById('enable-crop').addEventListener('click', function() {
        if (isCroppingEnabled) {
            // Apply cropping logic if rectangle is drawn
            if (croppingRect) {
                const cropped = new fabric.Image(uploadedImage.getElement(), {
                    left: uploadedImage.left + croppingRect.left,
                    top: uploadedImage.top + croppingRect.top,
                    width: croppingRect.width,
                    height: croppingRect.height
                });
                canvas.remove(uploadedImage);
                uploadedImage = cropped;
                canvas.add(uploadedImage);
                croppingRect = null; // Clear the crop rectangle
            }
        } else {
            // Enable cropping mode: Draw a rectangle
            canvas.isDrawingMode = true;
            canvas.selection = false; // Disable selection mode
        }
        isCroppingEnabled = !isCroppingEnabled;
    });

    // Drawing a rectangle on canvas to define cropping area
    canvas.on('mouse:down', function(event) {
        if (canvas.isDrawingMode) {
            const pointer = canvas.getPointer(event.e);
            croppingRect = new fabric.Rect({
                left: pointer.x,
                top: pointer.y,
                fill: 'rgba(255, 0, 0, 0.3)', // Semi-transparent red fill for the crop area
                width: 0,
                height: 0,
                selectable: false,
                evented: false,
                hasBorders: false,
                hasControls: false
            });
            canvas.add(croppingRect);
        }
    });

    // Update rectangle size as the user drags the mouse
    canvas.on('mouse:move', function(event) {
        if (croppingRect) {
            const pointer = canvas.getPointer(event.e);
            croppingRect.set({
                width: pointer.x - croppingRect.left,
                height: pointer.y - croppingRect.top
            });
            canvas.renderAll();
        }
    });

    // Finalize rectangle size when the user releases the mouse
    canvas.on('mouse:up', function() {
        canvas.isDrawingMode = false;
    });

    // Rotate and flip functionality
    document.getElementById('rotate-left').addEventListener('click', function() {
        if (uploadedImage) {
            uploadedImage.rotate(uploadedImage.angle - 90);
            canvas.renderAll();
        }
    });

    document.getElementById('rotate-right').addEventListener('click', function() {
        if (uploadedImage) {
            uploadedImage.rotate(uploadedImage.angle + 90);
            canvas.renderAll();
        }
    });

    document.getElementById('flip-horizontal').addEventListener('click', function() {
        if (uploadedImage) {
            uploadedImage.set('flipX', !uploadedImage.flipX);
            canvas.renderAll();
        }
    });

    document.getElementById('flip-vertical').addEventListener('click', function() {
        if (uploadedImage) {
            uploadedImage.set('flipY', !uploadedImage.flipY);
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
