document.addEventListener("DOMContentLoaded", function() {
    let canvas, uploadedImage;

    // Initialize the canvas
    canvas = new fabric.Canvas('meme-canvas', {
        backgroundColor: '#fff',
    });
    console.log('Canvas initialized.');

    // Resize the canvas based on the image aspect ratio
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
    }

    // Handle image upload
    document.getElementById('upload-image').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                fabric.Image.fromURL(event.target.result, function(img) {
                    uploadedImage = img.set({
                        selectable: false
                    });

                    resizeCanvasToImage(img);
                    const scaleFactor = Math.min(canvas.width / img.width, canvas.height / img.height);
                    img.scale(scaleFactor);

                    const left = (canvas.width - img.getScaledWidth()) / 2;
                    const top = (canvas.height - img.getScaledHeight()) / 2;
                    img.set({ left: left, top: top });

                    canvas.clear();
                    canvas.add(uploadedImage);
                    canvas.renderAll();
                });
            };
            reader.readAsDataURL(file);
        }
    });

    // Fetch overlay images
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
        })
        .catch(error => console.error('Error loading overlays:', error));

    // Create delete control
    function addDeleteControl(img) {
        img.controls = fabric.Object.prototype.controls;
        img.controls.deleteControl = new fabric.Control({
            x: 0.6,   // Position further out horizontally
            y: -0.6,  // Position further out vertically
            offsetX: 20,
            offsetY: -20,
            cursorStyle: 'pointer',
            mouseUpHandler: () => {
                canvas.remove(img);
                canvas.requestRenderAll();
            },
            render: function(ctx, left, top, styleOverride, fabricObject) {
                const size = 24;
                ctx.save();
                ctx.translate(left, top);
                ctx.beginPath();
                ctx.strokeStyle = 'red';
                ctx.lineWidth = 2;
                ctx.moveTo(-size / 2, -size / 2);
                ctx.lineTo(size / 2, size / 2);
                ctx.moveTo(-size / 2, size / 2);
                ctx.lineTo(size / 2, -size / 2);
                ctx.stroke();
                ctx.restore();
            }
        });
    }

    // Handle overlay selection
    document.getElementById('overlay-selector').addEventListener('change', function(e) {
        const overlayUrl = e.target.value;
        if (overlayUrl) {
            fabric.Image.fromURL(overlayUrl, function(img) {
                img.set({
                    left: 100,
                    top: 100,
                    selectable: true,
                    transparentCorners: false,
                    borderColor: 'red',
                    cornerColor: 'blue',
                    cornerSize: 12,
                    cornerStrokeColor: 'black'
                });

                img.setControlsVisibility({
                    tl: true,
                    tr: true,
                    bl: true,
                    br: true,
                    mt: true,
                    mb: true,
                    ml: true,
                    mr: true,
                    mtr: true // Restore the rotation control
                });

                addDeleteControl(img); // Add custom delete control

                const scaleFactor = Math.min(canvas.width / img.width, canvas.height / img.height);
                img.scale(scaleFactor);

                canvas.add(img);
                canvas.setActiveObject(img);
                canvas.renderAll();
            });
        }
    });

    // Flip controls
    document.getElementById('flip-horizontal').addEventListener('click', function() {
        const activeObject = canvas.getActiveObject();
        if (activeObject && activeObject.type === 'image') {
            activeObject.set('flipX', !activeObject.flipX);
            canvas.renderAll();
        }
    });

    document.getElementById('flip-vertical').addEventListener('click', function() {
        const activeObject = canvas.getActiveObject();
        if (activeObject && activeObject.type === 'image') {
            activeObject.set('flipY', !activeObject.flipY);
            canvas.renderAll();
        }
    });

    // Download meme
    document.getElementById('download-button').addEventListener('click', function() {
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'meme.png';
        link.click();
    });

    // Resize canvas on window resize
    window.addEventListener('resize', function() {
        if (uploadedImage) {
            resizeCanvasToImage(uploadedImage);

            const scaleFactor = Math.min(canvas.width / uploadedImage.width, canvas.height / uploadedImage.height);
            uploadedImage.scale(scaleFactor);

            const left = (canvas.width - uploadedImage.getScaledWidth()) / 2;
            const top = (canvas.height - uploadedImage.getScaledHeight()) / 2;
            uploadedImage.set({ left: left, top: top });
        }

        canvas.renderAll();
    });
});
