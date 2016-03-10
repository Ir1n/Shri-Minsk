(function () {
    var video = document.querySelector('.camera__video'),
        canvas = document.querySelector('.camera__canvas');

    var getVideoStream = function (callback) {
        navigator.getUserMedia = navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia;

        if (navigator.getUserMedia) {
            navigator.getUserMedia({video: true},
                function (stream) {
                    video.src = window.URL.createObjectURL(stream);
                    video.onloadedmetadata = function (e) {
                        video.play();

                        callback();
                    };
                },
                function (err) {
                    console.log("The following error occured: " + err.name);
                }
            );
        } else {
            console.log("getUserMedia not supported");
        }
    };

    var applyFilterToPixel = function (imageData) {
        var filters = {
            invert: function (imageData) {
                var pixels = imageData.data;
                for (var i = 0; i < pixels.length; i += 4)
                pixels[i] = 255 - pixels[i];
                pixels[i + 1] = 255 - pixels[i + 1];
                pixels[i + 2] = 255 - pixels[i + 2];

                return imageData;
            },
            grayscale: function (imageData) {
                var pixels = imageData.data;
                for (var i = 0; i < pixels.length; i += 4) {
                    var r = pixels[i];
                    var g = pixels[i + 1];
                    var b = pixels[i + 2];
                    var v = 0.2126 * r + 0.7152 * g + 0.0722 * b;

                    pixels[i] = pixels[i + 1] = pixels[i + 2] = v;
                }
                return imageData;
            },
            threshold: function (imageData) {
                var pixels = imageData.data;
                for (var i = 0; i < pixels.length; i += 4) {
                    var r = pixels[i];
                    var g = pixels[i + 1];
                    var b = pixels[i + 2];
                    var v = (0.2126 * r + 0.7152 * g + 0.0722 * b >= 128) ? 255 : 0;
                    pixels[i] = pixels[i + 1] = pixels[i + 2] = v;
                }
                return imageData;
            },
            sepia: function (imageData) {
                var pixels = imageData.data;
                for (var i = 0; i < pixels.length; i += 4) {
                    var r = pixels[i];
                    var g = pixels[i + 1];
                    var b = pixels[i + 2];
                    pixels[i] = (r * 0.393)+(g * 0.769)+(b * 0.189);
                    pixels[i + 1] = (r * 0.349)+(g * 0.686)+(b * 0.168);
                    pixels[i + 2] = (r * 0.272)+(g * 0.534)+(b * 0.131);
                }
                return imageData;
            }
        };

        var filterName = document.querySelector('.controls__filter').value;
        return filters[filterName](imageData);
    };

    var applyFilter = function () {
        var imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
        imageData = applyFilterToPixel(imageData);
        canvas.getContext('2d').putImageData(imageData, 0, 0)
        };



    var captureFrame = function () {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        canvas.getContext('2d').drawImage(video, 0, 0);
        applyFilter();
    };

    getVideoStream(function () {
        captureFrame();

        setInterval(captureFrame, 16);
    });
})();
