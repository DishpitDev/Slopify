document.addEventListener("DOMContentLoaded", function () {
  // Create the popup element
  const popup = document.createElement("div");
  popup.className = "modal is-active";
  popup.innerHTML = `
        <div class="modal-background"></div>
        <div class="modal-content" onclick="popupFunction()">
            <div class="card">
                <header class="card-header">
                    <p class="card-header-title">CLICK HERE TO SEE ANIME GIRL LIVE STREAM</p>
                </header>
                <div class="card-image">
                    <figure class="image is-4by3">
                        <img src="assets/img/anime_girl.jpeg" alt="Anime Girl">
                    </figure>
                </div>
                <div class="card-content">
                    <div class="content">
                        <button class="button is-primary" id="popup-button">Click Here</button>
                    </div>
                </div>
            </div>
        </div>
        <button class="modal-close is-large" aria-label="close"></button>
    `;

  // Append the popup to the body
  document.body.appendChild(popup);

  // Add event listener to the button
  document
    .getElementById("popup-button")
    .addEventListener("click", function () {
      popupFunction();
      popup.classList.remove("is-active");
    });

  // Add event listener to the close button
  document.querySelector(".modal-close").addEventListener("click", function () {
    popup.classList.remove("is-active");
    speak("Welcome to the land of slop.");
    speak(
      "Go to SlopTV to see wonderful content such as Chinese Propaganda and Rick And Morty.",
    );
    speak(
      "Also, don't forget to upload all your sensitive information to SlopCloud",
    );
  });
});

function popupFunction() {
  // Create a video element that replaces the user's cursor
  const video = document.createElement("video");
  if (Hls.isSupported()) {
    video.autoplay = true;
    video.controls = true;
    video.classList.add("picture");
    video.style.position = "fixed"; // Change to fixed to follow the cursor even when scrolling
    video.style.width = "200px"; // Medium size
    video.style.height = "150px"; // Medium size
    video.style.pointerEvents = "none"; // Make sure the video doesn't interfere with clicking
    document.body.appendChild(video);

    const hls = new Hls();
    hls.loadSource(
      "https://247preview.foxnews.com/hls/live/2020027/fncv3preview/primary.m3u8",
    );
    hls.attachMedia(video);
    video.play();

    // Update video position to follow the cursor
    document.addEventListener("mousemove", function (event) {
      video.style.left = `${event.clientX - video.offsetWidth / 2}px`;
      video.style.top = `${event.clientY - video.offsetHeight / 2}px`;
    });
  }
}
