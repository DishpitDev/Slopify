document.addEventListener("DOMContentLoaded", function () {
  // Create the popup element
  const popup = document.createElement("div");
  popup.className = "modal is-active";
  popup.innerHTML = `
        <div class="modal-background" style="background-color: rgba(10, 10, 10, 0.86);"></div>
        <div class="modal-content" onclick="popupFunction()" style="position: relative; margin: auto; max-width: 640px; width: 100%;">
            <div class="card" style="border: 1px solid #dbdbdb; border-radius: 6px; box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1);">
                <header class="card-header" style="background-color: #f5f5f5; border-bottom: 1px solid #dbdbdb; padding: 0.75rem 1rem;">
                    <p class="card-header-title" style="font-size: 1.25rem; font-weight: 700; color: #000;">CLICK HERE TO SEE ANIME GIRL LIVE STREAM</p>
                </header>
                <div class="card-image" style="position: relative; padding-top: 75%;">
                    <figure class="image is-4by3" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden;">
                        <img src="assets/img/anime_girl.jpeg" alt="Anime Girl" style="display: block; width: 100%; height: auto;">
                    </figure>
                </div>
                <div class="card-content" style="padding: 1rem;">
                    <div class="content">
                        <button class="button is-primary" id="popup-button" style="background-color: #00d1b2; border: none; color: white; padding: 0.5rem 1rem; font-size: 1rem; border-radius: 4px;">Click Here</button>
                    </div>
                </div>
            </div>
        </div>
        <button class="modal-close is-large" aria-label="close" style="position: fixed; top: 1.5rem; right: 1.5rem; background: none; border: none; font-size: 2rem; color: #000;">&times;</button>
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
      "https://stream.skynewsarabia.com/hls/sna.m3u8",
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
