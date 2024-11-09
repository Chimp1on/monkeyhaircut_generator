document.addEventListener("DOMContentLoaded", function() {
    let canvas, uploadedImage, overlayImage;
    let stateStack = [], redoStack = [];

    // Canvas setup
    canvas = new fabric.Canvas('meme-canvas', {
        width: 1804.5,
        height: 913.5,
        backgroundColor: '#fff',
    });
    console.log('Canvas initialized:', canvas.width, canvas.height);

    // Load overlay images from overlays.json
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

    // Image upload handling
    document.getElementById('upload-image').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                fabric.Image.fromURL(event.target.result, function(img) {
                    uploadedImage = img;
                    uploadedImage.set({
                        left: canvas.width / 2 - img.width / 2,
                        top: canvas.height / 2 - img.height / 2,
                        selectable: false
                    });

                    // Clear canvas and add uploaded image
                    canvas.clear();
                    canvas.add(uploadedImage);
                    saveState();
                    console.log('Uploaded image added and centered.');
                    console.log('Image Dimensions:', img.width, img.height);
                    console.log('Canvas Dimensions:', canvas.width, canvas.height);
                });
            };
            reader.readAsDataURL(file);
        }
    });

    // Overlay selection and positioning
    document.getElementById('overlay-selector').addEventListener('change', function(e) {
        const overlayUrl = e.target.value;
        if (overlayUrl) {
            fabric.Image.fromURL(overlayUrl, function(img) {
                if (overlayImage) canvas.remove(overlayImage);
                overlayImage = img.set({
                    left: canvas.width / 2 - img.width / 2,
                    top: canvas.height / 2 - img.height / 2,
                    selectable: true,
                    hasControls: true,
                    opacity: 0.8 // semi-transparent for visibility
                });
                
                canvas.add(overlayImage);
                overlayImage.bringToFront();
                overlayImage.setCoords();
                canvas.renderAll();
                saveState();
                console.log('Overlay added and scaled.');
            });
        }
    });

    // Undo and Redo functions
    function saveState() {
        stateStack.push(JSON.stringify(canvas));
        redoStack = []; // clear redo stack
        console.log('State saved.');
    }

    document.getElementById('undo').addEventListener('click', function() {
        if (stateStack.length > 1) {
            redoStack.push(stateStack.pop());
            canvas.clear();
            canvas.loadFromJSON(stateStack[stateStack.length - 1]);
            console.log('Undo performed.');
        }
    });

    document.getElementById('redo').addEventListener('click', function() {
        if (redoStack.length > 0) {
            stateStack.push(redoStack.pop());
            canvas.clear();
            canvas.loadFromJSON(stateStack[stateStack.length - 1]);
            console.log('Redo performed.');
        }
    });

    // Additional event handlers: Flip, Download
    document.getElementById('flip-horizontal').addEventListener('click', function() {
        if (overlayImage) {
            overlayImage.toggle('flipX');
            canvas.renderAll();
            saveState();
        }
    });

    document.getElementById('flip-vertical').addEventListener('click', function() {
        if (overlayImage) {
            overlayImage.toggle('flipY');
            canvas.renderAll();
            saveState();
        }
    });

    document.getElementById('download-button').addEventListener('click', function() {
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'meme.png';
        link.click();
    });
});
