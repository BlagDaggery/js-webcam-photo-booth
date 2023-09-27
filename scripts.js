const photoBtn = document.querySelector('#photoBtn');
const rgbControls = document.querySelector('.rgb');
const video = document.querySelector('.player');
const canvas = document.querySelector('.photo');
const ctx = canvas.getContext('2d');
const strip = document.querySelector('.strip');
const snap = document.querySelector('.snap');

function getVideo() {
    navigator.mediaDevices.getUserMedia({video: true, audio: false })
        .then(localMediaStream => {
            video.srcObject = localMediaStream;
            video.play();
        })
        .catch(console.error);
}

function paintToCanvas() {
    const width = video.videoWidth;
    const height = video.videoHeight;
    
    canvas.width = width;
    canvas.height = height;

    setInterval(() => {
        ctx.drawImage(video, 0, 0, width, height);

        let pixels = ctx.getImageData(0, 0, width, height);
        let filterValue = document.querySelector('#filter').value;        
        
        pixels = setFilter(filterValue, pixels);       
        
        ctx.putImageData(pixels, 0, 0);
    }, 16);
}

function takePhoto() {
    snap.currentTime = 0;
    snap.play();

    const data = canvas.toDataURL('image/jpeg');
    const link = document.createElement('a');

    link.href = data;
    link.setAttribute('download', 'photo-booth');
    link.innerHTML = `<img src="${data}" alt="It's a picture of you!" />`;
    
    strip.insertBefore(link, strip.firstChild);
}

function redEffect(pixels) {
    for (let i = 0; i < pixels.data.length; i += 4) {
        pixels.data[i + 0] = pixels.data[i + 0] + 200; // RED
        pixels.data[i + 1] = pixels.data[i + 1] - 50; // GREEN
        pixels.data[i + 2] = pixels.data[i + 2] * 0.5; // Blue
    }

    return pixels;
}

function rgbSplit(pixels) {
    for (let i = 0; i < pixels.data.length; i += 4) {
        pixels.data[i - 150] = pixels.data[i + 0]; // RED
        pixels.data[i + 500] = pixels.data[i + 1]; // GREEN
        pixels.data[i - 550] = pixels.data[i + 2]; // Blue
    }
    return pixels;
}

function greenScreen(pixels) {
    const levels = {};

    document.querySelectorAll('.rgb input').forEach((input) => {
        levels[input.name] = input.value;
    });

    for (let i = 0; i < pixels.data.length; i += 4) {
        let red = pixels.data[i + 0];
        let green = pixels.data[i + 1];
        let blue = pixels.data[i + 2];
        let alpha = pixels.data[i + 3];

        if (red >= levels.rmin
            && green >= levels.gmin
            && blue >= levels.bmin
            && red <= levels.rmax
            && green <= levels.gmax
            && blue <= levels.bmax
        ) {
            pixels.data[i + 3] = 0;
        }
    }

    return pixels;
}

function setFilter(filterValue, pixels) {
    switch (filterValue) {
        case 'none':
            pixels = pixels;
            rgbControls.classList.add('hidden');
            break;
        case 'red':
            pixels = redEffect(pixels);
            rgbControls.classList.add('hidden');
            break;
        case 'rgb-split':
            pixels = rgbSplit(pixels);
            rgbControls.classList.add('hidden');
            break;
        case 'green-screen':
            pixels = greenScreen(pixels);
            rgbControls.classList.remove('hidden');
            break;
        default:
            pixels = pixels;
            rgbControls.classList.add('hidden');
    }

    return pixels;
}

getVideo();

video.addEventListener('canplay', paintToCanvas);
photoBtn.addEventListener('click', takePhoto);
