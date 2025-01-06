document.addEventListener("DOMContentLoaded", function () {
  fetch("https://api.ipify.org?format=json")
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("yourIP").textContent = data.ip;
    })
    .catch((error) => {
      console.error("Error fetching IP:", error);
    });
  document.getElementById("ipModal").style.display = "block";
  let closeBtn = document.getElementById("ipModalClose");
  closeBtn.addEventListener("click", function () {
    document.getElementById("ipModal").style.display = "none";
  });
});
