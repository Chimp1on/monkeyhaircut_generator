document.addEventListener("DOMContentLoaded", function() {
    let canvas, uploadedImage, overlayImage;

    // Initialize the canvas
    canvas = new fabric.Canvas('meme-canvas', {
        backgroundColor: '#fff',
    });
    console.log('Canvas initialized.');

    // Function to resize the canvas based on the image aspect ratio
    function resizeCanvasToImage(img) {
        const windowWidth = window.innerWidth * 0.9;
        const windowHeight = window.innerHeight * 0.7;

        const imageAspectRatio = img.width / img.height;
        const windowAspectRatio = windowWidth / windowHeight;

        if (imageAspectRatio > windowAspectRatio) {
            canvas.setWidth(windowWidth);
            canvas.setHeight(windowWidth / imageAspectRatio);
        } else {
            canvas.setHeight(windowHeight);
            canvas.setWidth(windowHeight * imageAspectRatio);
        }

        canvas.renderAll();
        console.log('Canvas resized to match image aspect ratio:', canvas.width, canvas.height);
    }

    // Handle image upload
    document.getElementById('upload-image').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            console.log('Uploading image:', file);
            const reader = new FileReader();
            reader.onload = function(event) {
                fabric.Image.fromURL(event.target.result, function(img) {
                    uploadedImage = img.set({
                        selectable: false // Disable image dragging
                    });

                    // Resize canvas based on uploaded image aspect ratio
                    resizeCanvasToImage(img);

                    // Scale the uploaded image to fit within the resized canvas
                    const scaleFactor = Math.min(canvas.width / img.width, canvas.height / img.height);
                    img.scale(scaleFactor);

                    // Adjust the image position to center it
                    const left = (canvas.width - img.getScaledWidth()) / 2;
                    const top = (canvas.height - img.getScaledHeight()) / 2;
                    img.set({ left: left, top: top });

                    // Clear and add the new image to the canvas
                    canvas.clear();
                    canvas.add(uploadedImage);
                    canvas.renderAll();
                    console.log('Uploaded image added to canvas.');
                });
            };
            reader.readAsDataURL(file);
        }
    });

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
                    canvas.remove(overlayImage);
                }
                overlayImage = img.set({
                    left: 100,
                    top: 100,
                    selectable: true,
                    transparentCorners: false,
                    borderColor: 'red',
                    cornerColor: 'blue',
                    cornerSize: 12,
                    cornerStrokeColor: 'black'
                });

                overlayImage.setControlsVisibility({
                    tl: true,
                    tr: true,
                    bl: true,
                    br: true,
                    mt: true,
                    mb: true,
                    ml: true,
                    mr: true
                });

                // Scale the overlay to fit within the resized canvas
                const scaleFactor = Math.min(canvas.width / img.width, canvas.height / img.height);
                img.scale(scaleFactor);

                canvas.add(overlayImage);
                canvas.setActiveObject(overlayImage);
                canvas.renderAll();
                console.log('Overlay image added to canvas with custom control styling.');
            });
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
        if (uploadedImage) {
            resizeCanvasToImage(uploadedImage);

            const scaleFactor = Math.min(canvas.width / uploadedImage.width, canvas.height / uploadedImage.height);
            uploadedImage.scale(scaleFactor);

            const left = (canvas.width - uploadedImage.getScaledWidth()) / 2;
            const top = (canvas.height - uploadedImage.getScaledHeight()) / 2;
            uploadedImage.set({ left: left, top: top });
        }

        if (overlayImage) {
            const scaleFactor = Math.min(canvas.width / overlayImage.width, canvas.height / overlayImage.height);
            overlayImage.scale(scaleFactor);
        }

        canvas.renderAll();
        console.log('Canvas and images resized on window resize.');
    });
});
