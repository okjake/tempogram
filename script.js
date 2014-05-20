Sc = {

  c : {
    canvas       : document.getElementById('display'),
    hiddenCanvas : document.getElementById('hiddenCanvas'),
    video        : document.querySelector('video'),
    snapshots    : document.getElementById('snapshots'),
    retrigger    : document.getElementById('retrigger'),
    ctx          : null,
    hiddenCtx    : null,
    width        : null,
    height       : null,
    iterator     : 0
  },

  settings : {
    refresh  : 1,
    vertical : true
  },

  error : {
    notSupported : function () {
      alert('getUserMedia not supported.');
    },
    fucknose : function () {
      alert('Couldn\'t access your camera.');
    }
  },

  setup : function(settings) {
    if (settings) {
      if (settings.frameRate) {
        Sc.settings.refresh = 100 / settings.frameRate;
      }
      if (settings.direction) {
        Sc.settings.vertical = settings.direction == 'horizontal' ? false : true;
      }
    }
    Sc.c.ctx = Sc.c.canvas.getContext('2d');
    Sc.c.hiddenCtx = Sc.c.hiddenCanvas.getContext('2d');
    Sc.setHandlers();
    Sc.startCapture();
  },

  setHandlers : function() {
    window.sendFrame = Sc.onFrame,
    document.getElementsByTagName('video')[0].addEventListener('loadedmetadata', this.onMetaData, false);
    Sc.c.retrigger.onclick = Sc.reTrigger;
  },

  onFrame : function() {
    Sc.c.hiddenCtx.drawImage(Sc.c.video, 0, 0);
    Sc.processFrame();
  },

  onMetaData : function(e) {
    Sc.c.width = Sc.c.canvas.width  = Sc.c.hiddenCanvas.width  = e.target.videoWidth;
    Sc.c.height = Sc.c.canvas.height = Sc.c.hiddenCanvas.height = e.target.videoHeight;
  },

  onDone : function() {
    var image = new Image();
    var li = document.createElement('li');
    var a = document.createElement('a');

    image.src = Sc.c.canvas.toDataURL("image/png");

    a.appendChild(image);
    a.href = image.src;
    a.setAttribute('download', '');

    li.appendChild(a);
    Sc.c.snapshots.appendChild(li);

    Sc.c.retrigger.style.display = 'block';
  },

  processFrame : function() {

    if (Sc.settings.vertical === true) {
      var imageData = Sc.c.hiddenCtx.getImageData(0, Sc.c.iterator, Sc.c.hiddenCanvas.width, 1);
      var endThresh = Sc.c.height;
      Sc.c.ctx.putImageData(imageData, 0, Sc.c.iterator);
    }

    else {
      var imageData = Sc.c.hiddenCtx.getImageData(Sc.c.iterator, 0, 1, Sc.c.hiddenCanvas.height);
      var endThresh = Sc.c.width;
      Sc.c.ctx.putImageData(imageData, Sc.c.iterator, 0);
    }

    if (Sc.c.iterator < endThresh) {
      Sc.c.iterator++;
      window.setTimeout(Sc.onFrame, Sc.settings.refresh);
    }

    else {
      if (Sc.c.height && Sc.c.width) {
        Sc.onDone();
      }
      else {
        window.setTimeout(Sc.onFrame, Sc.settings.refresh);
      }
    }
  },

  startCapture : function() {
    navigator.getUserMedia_ = (navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia);

    if (!navigator.getUserMedia_) {
      Sc.error.notSupported();
    }

    navigator.getUserMedia_({ video: true }, function(stream) {
      Sc.c.video.src = window.URL.createObjectURL(stream);
      Sc.onFrame();
    }, Sc.error.fucknose);

  },

  reTrigger : function (e) {
    if (e) {
      e.preventDefault();
    }
    Sc.c.iterator = 0;
    Sc.onFrame();
    Sc.c.retrigger.style.display = 'none';
  }
}

window.onload = Sc.setup();
