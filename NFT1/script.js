document.addEventListener('DOMContentLoaded', () => {
    const layers = document.querySelectorAll('.collage-layer');
    const legendInfos = document.querySelectorAll('.legend-info');
    const hoverLegend = document.getElementById('hover-legend');
    const hoverInfos = document.querySelectorAll('.hover-info');
    const layerData = [];

    // Pre-render image pixel data
    layers.forEach((layer, index) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = layer.width;
        canvas.height = layer.height;
        ctx.drawImage(layer, 0, 0, layer.width, layer.height);
        layerData[index] = ctx.getImageData(0, 0, layer.width, layer.height);

        layer.addEventListener('mousemove', throttle(handleMouseMove, 50));
        layer.addEventListener('mouseout', handleMouseOut);
    });

    function handleMouseMove(event) {
        let foundNonTransparentPixel = false;

        for (let i = layers.length - 1; i >= 0; i--) {
            const img = layers[i];
            const rect = img.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            if (x >= 0 && y >= 0 && x < rect.width && y < rect.height) {
                const pixel = getPixelData(layerData[i], x, y);

                if (pixel[3] !== 0) { // Check if pixel is not transparent
                    const infoId = img.getAttribute('data-info');
                    const hoverInfoId = img.getAttribute('data-info-hover');

                    legendInfos.forEach(info => {
                        if (info.id === infoId) {
                            info.classList.add('active');
                        } else {
                            info.classList.remove('active');
                        }
                    });

                    hoverInfos.forEach(info => {
                        if (info.id === hoverInfoId) {
                            info.classList.add('active');
                        } else {
                            info.classList.remove('active');
                        }
                    });

                    hoverLegend.style.left = `${event.pageX + 10}px`;
                    hoverLegend.style.top = `${event.pageY + 10}px`;
                    hoverLegend.style.display = 'block';

                    layers.forEach((layer, index) => {
                        if (index !== i) {
                            layer.classList.add('grayed-out');
                        } else {
                            layer.classList.remove('grayed-out');
                        }
                    });

                    foundNonTransparentPixel = true;
                    break; // Stop checking once we find the topmost non-transparent pixel
                }
            }
        }

        if (!foundNonTransparentPixel) {
            handleMouseOut();
        }
    }

    function handleMouseOut() {
        legendInfos.forEach(info => {
            info.classList.remove('active');
        });
        hoverInfos.forEach(info => {
            info.classList.remove('active');
        });
        layers.forEach(layer => {
            layer.classList.remove('grayed-out');
        });
        hoverLegend.style.display = 'none';
    }

    function getPixelData(imageData, x, y) {
        const index = (y * imageData.width + x) * 4;
        return imageData.data.slice(index, index + 4);
    }

    function throttle(fn, wait) {
        let time = Date.now();
        return function (...args) {
            if ((time + wait - Date.now()) < 0) {
                fn.apply(this, args);
                time = Date.now();
            }
        };
    }
});

