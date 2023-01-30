// url to server with flask running
var SERVER_URL = 'https://ai.reeceharris.net/';

// set max side length for an uploaded image
var MAX_SIDE_LEN = 1280;

upload = document.querySelector('#file-input');
preview = document.querySelector('#preview');
rld = document.querySelector('.reload');
canvas = document.createElement('canvas');
context = canvas.getContext('2d');
img = new Image();
resized_img = new Image();
var orientation;

$('#random-image').click(function() {

    $(this).addClass('hidden')

    const urls = [
        "/static/sandbox/park.jpg",
        "/static/sandbox/road.png",
        "/static/sandbox/restaurant.jpg",
        "/static/sandbox/farm.jpg",
        "/static/sandbox/safari.jpg"
    ];

    img.onload = onload_func;
    img.src = urls[Math.floor(Math.random() * urls.length)];;
})


function onload_func() {
  // extracting the orientation info from EXIF which will be sent to the server
  EXIF.getData(img, function () {
    orientation = EXIF.getTag(this, 'Orientation');
    // resize the sides of the canvas and draw the resized image
    [canvas.width, canvas.height] = reduceSize(img.width, img.height, MAX_SIDE_LEN);
    context.drawImage(img, 0, 0, canvas.width, canvas.height);
    // adds the image that the canvas holds to the source
    resized_img.src = canvas.toDataURL('image/jpeg');
    resized_img.classList.add('rounded-md')
    // clean the result before doing anything
    preview.innerHTML = '';
    // append new image
    preview.appendChild(resized_img);
    // send the user image on server and wait for response, and, then, shows the result
    send_detect_show();
  });
}

upload.addEventListener('change', function() {
  event.preventDefault();
  // clean the previous result
  preview.innerHTML = '';

  // start file reader
  var reader = new FileReader();

  reader.onload = function(event) {
    if(event.target.result) {
      // resize the image, send to the server, and show to a user
      img.onload = onload_func;
      // evokes the function above ('onload to src attr')
      img.src = event.target.result;
    };
  };
  reader.readAsDataURL(event.target.files[0]);
});

function send_detect_show() {
    var element = document.getElementById('upload');
    var reset = document.getElementById('processing');
    element.parentNode.removeChild(element);
    reset.classList.remove('hidden')
    var blob = dataURItoBlob(preview.firstElementChild.src);
    var form_data = new FormData();
    form_data.append('file', blob);
    form_data.append('orientation', orientation);
    grecaptcha.ready(function() {
        grecaptcha.execute('6LckWSkkAAAAAPXSePkWq0nb7sWXwRSpZmCWuNsL', {action: 'submit'}).then(function(token) {
            form_data.append('token', token)
            var xhr = new XMLHttpRequest();
            xhr.open('POST', SERVER_URL, true);
            xhr.timeout = 1000 * 25;
            xhr.onload = function (e) {
                if (this.status === 200) {
                    var data = JSON.parse(xhr.responseText);
                    preview.firstElementChild.src = data['image'];
                    document.getElementById('processing').classList.add('hidden')
                    document.getElementById('reset-sandbox').classList.remove('hidden')
                    rld.classList.remove('hide');
                } else {
                    alert("We apologize for the inconvenience, it appears there was a server issue while processing your image. It may not have fully loaded. Please try again in a few minutes. If the problem persists, please contact reeceharris@email.com as soon as possible so we can resolve the issue");
                    document.getElementById('processing').classList.add('hidden')
                    document.getElementById('reset-sandbox').classList.remove('hidden')
                    rld.classList.remove('hide');
                }
            };
            xhr.ontimeout = function () {
                alert("We apologize for the inconvenience, it appears there was a server issue while processing your image. It may not have fully loaded. Please try again in a few minutes. If the problem persists, please contact reeceharris@email.com as soon as possible so we can resolve the issue");
                document.getElementById('processing').classList.add('hidden')
                document.getElementById('reset-sandbox').classList.remove('hidden')
                rld.classList.remove('hide');
            }
            xhr.send(form_data);
        });
    });
}

function reload() {location.reload();}

function dataURItoBlob(dataURI) {
    var byteString = atob(dataURI.split(',')[1]);
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    var ia = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ia], {type: mimeString});
}

function reduceSize(width, height, max_side_len) {
    if (Math.max(width, height) <= max_side_len) {
      return [width, height];
    }
    var ratio = width/height;
    if(width > height) {width = max_side_len;height = width / ratio;
    } else {
      height = max_side_len;
      width = height * ratio;
    }
    return [width, height];
  }