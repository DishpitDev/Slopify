document.addEventListener("DOMContentLoaded", async function () {
  const main = document.querySelector("main"),
    canvas = document.getElementById("canvas"),
    ctx = canvas.getContext("2d", { willReadFrequently: true }),
    text = document.querySelector(".text"),
    ww = window.innerWidth,
    menu = document.querySelector(".menu"),
    ul = menu.querySelector("ul"),
    count = ul.childElementCount - 1;
  let idx = 0,
    frame,
    video = document.getElementById("video");

  // Set canvas size to 4:3 aspect ratio
  canvas.width = ww / 3;
  canvas.height = (canvas.width * 3) / 4;

  // Generate CRT noise
  function snow(ctx) {
    const w = ctx.canvas.width,
      h = ctx.canvas.height,
      d = ctx.getImageData(0, 0, w, h),
      b = new Uint32Array(d.data.buffer),
      len = b.length;

    for (let i = 0; i < len; i++) {
      const noise = ((255 * Math.random()) | 0) << 24;
      b[i] = (b[i] & 0x00ffffff) | noise;
    }

    ctx.putImageData(d, 0, 0);
  }

  function drawStatic() {
    snow(ctx);
    frame = requestAnimationFrame(drawStatic);
  }

  async function drawVideo() {
    if (video && video.readyState >= 2) {
      const bitmap = await createImageBitmap(video);
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      snow(ctx);
    }
    frame = requestAnimationFrame(drawVideo);
  }

  // Glitch
  for (let i = 0; i < 4; i++) {
    const span = text.firstElementChild.cloneNode(true);
    text.appendChild(span);
  }

  window.addEventListener("DOMContentLoaded", async function (e) {
    setTimeout(function () {
      main.classList.add("on");
      main.classList.remove("off");
      drawStatic();
    }, 1000);
  });

  // Debounce keydown event listener
  let debounceTimeout;
  window.addEventListener(
    "keydown",
    function (e) {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        const key = e.keyCode;
        const prev = idx;
        if (key == 38 || key == 40) {
          e.preventDefault();

          switch (key) {
            case 38:
              if (idx > 0) {
                idx--;
              }
              break;
            case 40:
              if (idx < count) {
                idx++;
              }
              break;
          }

          ul.children[prev].classList.remove("active");
          ul.children[idx].classList.add("active");
        }
      }, 100);
    },
    false,
  );

  // MutationObserver to detect new video elements
  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      mutation.addedNodes.forEach(function (node) {
        if (node.tagName === "VIDEO") {
          video = node;
          video.addEventListener("loadeddata", async function () {
            cancelAnimationFrame(frame); // Stop the static effect
            await drawVideo(); // Start drawing the video with static effect
          });
        }
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // IntersectionObserver to handle visibility changes
  const visibilityObserver = new IntersectionObserver(async (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        if (video && video.readyState >= 2) {
          await drawVideo();
        } else {
          drawStatic();
        }
      } else {
        cancelAnimationFrame(frame);
      }
    }
  });

  visibilityObserver.observe(canvas);
  if (video) {
    visibilityObserver.observe(video);
  }
});
