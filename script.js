/* The contributors are loaded from a file instead of being fetched from the GitHub API.
 * This is done to avoid rate limiting, since the GitHub API has a limit of 60 requests per hour.
 * The contributors.json file is generated from the fetch-contributors.py script.
 */
const setup_contributors = () => {
  const contributors = document.getElementById("contributors");

  fetch("contributors.json")
    .then((response) => response.json())
    .then((data) => {
      data.forEach((contributor) => {
        const img = document.createElement("img");
        img.src = contributor.avatar_url;
        img.width = 64;
        img.height = 64;

        const a = document.createElement("a");
        a.href = contributor.html_url;
        a.appendChild(img);

        const div = document.createElement("div");
        div.appendChild(a);

        contributors.appendChild(div);
      });
    })
    .catch((error) => {
      contributors.innerHTML = "Failed to load contributors";
      contributors.className = "error";
      console.error(error);
    });
};

document.addEventListener("DOMContentLoaded", setup_contributors);
