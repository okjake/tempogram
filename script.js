Sc = {
  c : {
    canvas       : document.getElementById('display'),
    hiddenCanvas : document.getElementById('hiddenCanvas'),
    snapShots    : document.getElementById('snapShots'),
    reTrigger    : document.getElementById('reTrigger'),
    rtPlaceholder: document.getElementById('noReTrigger'),
    frameRateIn  : document.getElementById('frameRate'),
    dirToggle    : document.getElementById('dirToggle'),
    notSupported : document.getElementById('notSupported'),
    noCamera     : document.getElementById('noCamera'),
    controls     : document.getElementById('controls'),
    capture      : document.getElementById('capture'),
    results      : document.getElementById('results'),
    video        : document.querySelector('video'),
    ctx          : null,
    hiddenCtx    : null,
    width        : null,
    height       : null,
    iterator     : 0
  },

  settings : {
    refresh  : 25,
    vertical : true
  },

  error : {
    notSupported : function () {
      Sc.c.notSupported.style.display = "block";
      document.getElementById('intro').style.display = "none";
    },
    fucknose : function () {
      Sc.c.noCamera.style.display = "block";
      document.getElementById('intro').style.display = "none";
    }
  },

  setup : function(settings) {
    document.getElementById('noJs').style.display = "none";
    document.getElementById('intro').style.display = "block";
    document.getElementById('container').style.display = "block";
    document.getElementById('trigger').style.display = "block";

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
  },

  setHandlers : function() {
    document.getElementById('trigger').onclick = Sc.startCapture;
    window.sendFrame = Sc.onFrame,
    document.getElementsByTagName('video')[0].addEventListener('loadedmetadata', this.onMetaData, false);
    Sc.c.reTrigger.onclick = Sc.reTrigger;
    Sc.c.frameRateIn.onchange = Sc.onChangeFrameRate;
    Sc.c.dirToggle.onclick = Sc.onToggleDirection;
  },

  onFrame : function() {
    Sc.c.hiddenCtx.drawImage(Sc.c.video, 0, 0);
    Sc.processFrame();
  },

  onMetaData : function(e) {
    document.getElementById('intro').style.display = "none";
    Sc.c.width = Sc.c.canvas.width  = Sc.c.hiddenCanvas.width = e.target.videoWidth;
    Sc.c.height = Sc.c.canvas.height = Sc.c.hiddenCanvas.height = e.target.videoHeight;
    Sc.c.capture.style.width = e.target.videoWidth + 'px';
    Sc.c.results.style.width = e.target.videoWidth + 5 +  'px';
  },

  onDone : function() {
    var image = new Image(),
        li = document.createElement('li'),
        a = document.createElement('a');

    image.src = Sc.c.canvas.toDataURL("image/png");

    a.appendChild(image);
    a.href = image.src;
    a.setAttribute('download', '');

    li.appendChild(a);
    Sc.c.snapShots.appendChild(li);

    Sc.c.reTrigger.style.display = 'inline';
    Sc.c.rtPlaceholder.style.display = 'none';

  },

  onChangeFrameRate : function(e) {
    Sc.settings.refresh = 100 / e.target.value;
  },

  onToggleDirection : function(e) {
    if (e) {
      e.preventDefault();
    }
    if (Sc.settings.vertical) {
      Sc.settings.vertical = false;
      Sc.c.dirToggle.innerHTML = 'horizontally';
    }
    else {
      Sc.settings.vertical = true;
      Sc.c.dirToggle.innerHTML = 'vertically';
    }
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
      Sc.c.controls.style.display = 'block';
      Sc.c.video.src = window.URL.createObjectURL(stream);
      Sc.onFrame();
    }, Sc.error.fucknose);

  },

  reTrigger : function (e) {
    if (e) {
      e.preventDefault();
    }
    Sc.c.ctx.clearRect(0, 0, Sc.c.width, Sc.c.height);
    Sc.c.iterator = 0;
    Sc.onFrame();
    Sc.c.rtPlaceholder.style.display = 'inline';
    Sc.c.reTrigger.style.display = 'none';
  }
}

window.onload = Sc.setup();
