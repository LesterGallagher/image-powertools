var form = document.getElementById('form');
var input = document.getElementById('input');

HTMLElement.prototype.on = function (events, func) {
    events = events.split(' ');
    for (var i = 0; i < events.length; i++) {
        this.addEventListener(events[i], func);
    }
    return this;
}

var files = [];

form.on('drag dragstart dragend dragover dragenter dragleave drop', function (e) {
    e.preventDefault();
    e.stopPropagation();
}).on('dragover dragenter', function () {
    form.classList.add('is-dragover');
}).on('dragleave dragend drop', function () {
    form.classList.remove('is-dragover');
}).on('drop', function (e) {
    files.push.apply(files, e.dataTransfer.files);
    input.onchange();
});

var previewNode = document.getElementsByClassName('preview')[0];
var inputImageNode = document.querySelector('.input-image');
var inputImages = document.getElementById('input-images');
var previewsWrapper = document.getElementById('previews-wrapper');
var filters = document.getElementById('filters');
document.getElementById('run').onclick = runPreview;
document.getElementById('download-all').onclick = function () {
    previewsWrapper.querySelectorAll('.download').forEach(function (elem) { elem.click(); });
}

input.onchange = function () {
    while (inputImages.firstChild) inputImages.removeChild(inputImages.firstChild);
    for (var i = 0; i < files.length; i++) {
        (function (file) {
            var fr = new FileReader();
            fr.onload = function () {
                var image = inputImageNode.cloneNode(true);
                image.querySelector('.image').src = this.result;
                image.querySelector('.remove').onclick = function () {
                    files.splice(files.indexOf(image), 1);
                    input.onchange();
                }
                inputImages.appendChild(image);
            }
            fr.readAsDataURL(file);
        })(files[i]);
    }
    if (files.length === 0) input.files = null;
};

function runPreview() {
    while (previewsWrapper.firstChild) previewsWrapper.removeChild(previewsWrapper.firstChild);
    var js = filters.value.trim().split('\n').map(function (x) { return [x.trim(), 'img = img.' + x.trim()] });
    for (var i = 0; i < files.length; i++) {
        var fr = new FileReader();
        fr.onload = function () {
            // open a file called "lenna.png"
            Jimp.read(this.result, function (err, img) {
                try {
                    if (err) throw err;
                    for (var i = 0; i < js.length; i++) {
                        try {
                            eval(js[i][1]);
                        } catch (err) {
                            throw 'I don\'t understand this: "' + js[i][0] + '".\n' + err;
                        }
                    }
                    img.getBase64(Jimp.MIME_JPEG, function (err, src) {
                        var preview = previewNode.cloneNode(true);
                        preview.querySelector('.preview-img').src = src;
                        preview.querySelector('.download').href = src;
                        previewsWrapper.appendChild(preview);
                    });
                } catch (err) {
                    alert('Error!\n' + err);
                    throw err;
                }
            });
        }
        fr.readAsArrayBuffer(files[i]);
    }
}





