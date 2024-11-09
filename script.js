document.addEventListener("DOMContentLoaded", function () {
    let canvas, uploadedImage, overlayImage, history = [];
    const canvasContainer = document.getElementById('canvas-wrapper');
    const canvasWidth = window.innerWidth * 0.9;
    const canvasHeight = window.innerHeight * 0.7;

    // Initialize Fabric.js Canvas
    canvas = new fabric.Canvas('meme-canvas', {
        width: canvasWidth,
        height: canvasHeight,
        backgroundColor: '#fff',
    });
    console.log('Canvas initialized:', canvasWidth, canvasHeight);

    // Load overlay images from JSON
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
        });

    // Handle image upload
    document.getElementById('upload-image').addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (event) {
                fabric.Image.fromURL(event.target.result, function (img) {
                    canvas.clear();
                    uploadedImage = img.set({
                        left: 0,
                        top: 0,
                        selectable: false,
                    });

                    // Scale and center image
                    const scaleFactor = Math.min(canvas.width / img.width, canvas.height / img.height);
                    img.scale(scaleFactor);
                    img.set({
                        left: (canvas.width - img.getScaledWidth()) / 2,
                        top: (canvas.height - img.getScaledHeight()) / 2,
                    });
                    canvas.add(uploadedImage);
                    canvas.renderAll();
                    console.log('Uploaded image added and centered.');
                    console.log('Image Dimensions:', img.getScaledWidth(), img.getScaledHeight());
                    console.log('Canvas Dimensions:', canvas.width, canvas.height);
                    saveState();
                });
            };
            reader.readAsDataURL(file);
        }
    });

    // Overlay selection and manipulation
    document.getElementById('overlay-selector').addEventListener('change', function (e) {
        const overlayUrl = e.target.value;
        if (overlayUrl) {
            fabric.Image.fromURL(overlayUrl, function (img) {
                if (overlayImage) {
                    canvas.remove(overlayImage);
                }
                overlayImage = img.set({
                    left: 100,
                    top: 100,
                    selectable: true,
                });

                // Scale overlay and add to canvas
                const overlayScale = Math.min(canvas.width / img.width, canvas.height / img.height);
                img.scale(overlayScale);
                canvas.add(overlayImage);
                canvas.setActiveObject(overlayImage);
                canvas.renderAll();
                console.log('Overlay added and scaled.');
                console.log('Overlay Dimensions:', overlayImage.getScaledWidth(), overlayImage.getScaledHeight());
                saveState();
            });
        }
    });

    // Undo and Redo functionality
    function saveState() {
        const state = JSON.stringify(canvas.toJSON());
        history.push(state);
        console.log('State saved.');
    }

    document.getElementById('undo').addEventListener('click', function () {
        if (history.length > 1) {
            history.pop(); // Remove current state
            const prevState = history[history.length - 1];
            canvas.loadFromJSON(prevState, canvas.renderAll.bind(canvas));
            console.log('Undo performed.');
        }
    });

    document.getElementById('download-button').addEventListener('click', function () {
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'meme.png';
        link.click();
    });
});
