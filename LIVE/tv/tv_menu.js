async function startChannel(url) {
  // Remove all existing video elements
  var video = document.getElementById("video");
  if (video) video.parentNode.removeChild(video);
  // Use hls.js to play the video
  // Make sure the video has crt effect and is affected by css
  if (Hls.isSupported()) {
    var video = document.createElement("video");
    video.autoplay = true;
    video.controls = true;
    video.id = "video";
    video.classList.add("picture");
    document.getElementById("screen").appendChild(video);

    var hls = new Hls();
    hls.loadSource(url);
    hls.attachMedia(video);

    await video.play();

    // Apply bad audio quality effect
    var audioContext = new (window.AudioContext || window.webkitAudioContext)();
    var source = audioContext.createMediaElementSource(video);
    var biquadFilter = audioContext.createBiquadFilter();
    var distortion = audioContext.createWaveShaper();
    var gainNode = audioContext.createGain();
    var noiseGainNode = audioContext.createGain();

    // Set biquad filter to a low-pass filter to reduce audio quality
    biquadFilter.type = "lowpass";
    biquadFilter.frequency.value = 1000; // Adjust frequency to make it sound worse

    // Add distortion
    distortion.curve = new Float32Array([-1, 1]);
    distortion.oversample = "4x";

    // Create white noise
    var bufferSize = 2 * audioContext.sampleRate;
    var noiseBuffer = audioContext.createBuffer(
      1,
      bufferSize,
      audioContext.sampleRate,
    );
    var output = noiseBuffer.getChannelData(0);
    for (var i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    var whiteNoise = audioContext.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Set gain for noise
    noiseGainNode.gain.value = 0.01; // Adjust volume of static noise

    // Connect nodes
    source.connect(biquadFilter);
    biquadFilter.connect(gainNode);
    gainNode.connect(distortion);
    distortion.connect(audioContext.destination);

    whiteNoise.connect(noiseGainNode);
    noiseGainNode.connect(audioContext.destination);
    whiteNoise.start(0);

    // Add CRT whine audio
    let crtWhine = new Audio(
      "tv_audio/546047__grcekh__analog-crt-tv-electronic-static-noise.m4a",
    );
    crtWhine.loop = true;
    crtWhine.play();
  }
}

function toggleMenu() {
  var menu = document.getElementById("menu");
  menu.style.display = menu.style.display === "block" ? "none" : "block";
}

document.addEventListener("keydown", function (e) {
  (async () => {
    if (e.ctrlKey || e.key == "Escape") {
      // hide video
      var video = document.getElementById("video");

      if (video) video.style.display = "none";

      toggleMenu();

      if (video) video.style.display = "block";
    }

    if (e.key === "Enter") {
      var url = document.querySelector(".active a").href;
      await startChannel(url);
    }

    if (e.key === " ") {
      let video = document.getElementById("video");
      let cornerText = document.getElementById("corner-text");
      if (video) video.paused ? video.play() : video.pause();
      video.paused
        ? (cornerText.textContent = "PAUSED")
        : (cornerText.textContent = "SLOPTV");
    }
  })();
});
