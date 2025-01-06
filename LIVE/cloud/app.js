// Global state
let currentPath = "/";
let fs = null;

// Initialize filesystem
async function initializeFS() {
  fs = new OPFSFileSystem("slopcloud");
  await fs.init();
  await refreshCurrentFolder();
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  initializeFS();
  setupEventListeners();
});

function setupEventListeners() {
  // Upload button
  document.getElementById("upload-btn").addEventListener("click", () => {
    document.getElementById("file-input").click();
  });

  // File input change
  document
    .getElementById("file-input")
    .addEventListener("change", async (e) => {
      const files = Array.from(e.target.files);
      for (const file of files) {
        await uploadFile(file);
      }
    });

  // New folder button
  document
    .getElementById("new-folder-btn")
    .addEventListener("click", async () => {
      const folderName = prompt("Enter folder name:");
      if (folderName) {
        await createFolder(folderName);
      }
    });

  // Drag and drop
  const dropZone = document.getElementById("drop-zone");
  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("is-primary");
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("is-primary");
  });

  dropZone.addEventListener("drop", async (e) => {
    e.preventDefault();
    dropZone.classList.remove("is-primary");
    const files = Array.from(e.dataTransfer.files);
    for (const file of files) {
      await uploadFile(file);
    }
  });
}

// File operations
async function uploadFile(file) {
  try {
    const path = `${currentPath}/${file.name}`.replace("//", "/");
    await fs.createFile(path, file);
    await refreshCurrentFolder();
    showNotification(`Uploaded ${file.name}`, "is-success");
  } catch (error) {
    showNotification(
      `Failed to upload ${file.name}: ${error.message}`,
      "is-danger",
    );
  }
}

async function deleteFile(name) {
  try {
    const path = `${currentPath}/${name}`.replace("//", "/");
    await fs.deleteFile(path);
    await refreshCurrentFolder();
    showNotification(`Deleted ${name}`, "is-success");
  } catch (error) {
    showNotification(`Failed to delete ${name}: ${error.message}`, "is-danger");
  }
}

async function downloadFile(name) {
  try {
    const path = `${currentPath}/${name}`.replace("//", "/");
    const file = await fs.getFile(path);
    await file.download();
  } catch (error) {
    showNotification(
      `Failed to download ${name}: ${error.message}`,
      "is-danger",
    );
  }
}

// Folder operations
async function createFolder(name) {
  try {
    const path = `${currentPath}/${name}`.replace("//", "/");
    await fs.createFolder(path);
    await refreshCurrentFolder();
    showNotification(`Created folder ${name}`, "is-success");
  } catch (error) {
    showNotification(`Failed to create folder: ${error.message}`, "is-danger");
  }
}

async function navigateToFolder(path) {
  currentPath = path;
  await refreshCurrentFolder();
  updateBreadcrumb(path);
}

// UI updates
async function refreshCurrentFolder() {
  const tbody = document.getElementById("file-list");
  tbody.innerHTML =
    '<tr><td colspan="5" class="has-text-centered">Loading...</td></tr>';

  try {
    const folder = await fs.getFolder(currentPath);
    await folder.indexFiles();

    tbody.innerHTML = "";

    // Add parent folder if not in root
    if (currentPath !== "/") {
      const parentRow = createTableRow("folder", "..", null, null, true);
      tbody.appendChild(parentRow);
    }

    // Add folders and files
    for (const [name, getFile] of Object.entries(folder.files)) {
      const file = await getFile();
      const row = createTableRow(
        file.metadata.type || "folder",
        name,
        file.metadata.size,
        file.metadata.lastModified,
        false,
      );
      tbody.appendChild(row);
    }
  } catch (error) {
    showNotification(`Failed to load folder: ${error.message}`, "is-danger");
  }
}

function createTableRow(type, name, size, modified, isParent) {
  const tr = document.createElement("tr");
  tr.innerHTML = `
        <td><i class="fas fa-${type === "folder" ? "folder" : "file"}"></i></td>
        <td>${name}</td>
        <td>${size ? formatSize(size) : "-"}</td>
        <td>${modified ? new Date(modified).toLocaleString() : "-"}</td>
        <td>
            ${
              isParent
                ? ""
                : `
                <button class="button is-small is-info" onclick="downloadFile('${name}')">
                    <span class="icon"><i class="fas fa-download"></i></span>
                </button>
                <button class="button is-small is-danger" onclick="deleteFile('${name}')">
                    <span class="icon"><i class="fas fa-trash"></i></span>
                </button>
            `
            }
        </td>
    `;

  if (type === "folder" && !isParent) {
    tr.querySelector("td:nth-child(2)").addEventListener("click", () => {
      navigateToFolder(`${currentPath}/${name}`.replace("//", "/"));
    });
  }

  return tr;
}

function updateBreadcrumb(path) {
  const parts = path.split("/").filter((p) => p);
  const ul = document.getElementById("path-breadcrumb");
  ul.innerHTML =
    '<li><a href="#" onclick="navigateToFolder(\'/\')">Root</a></li>';

  let currentPath = "";
  for (const part of parts) {
    currentPath += "/" + part;
    ul.innerHTML += `
            <li><a href="#" onclick="navigateToFolder('${currentPath}')">${part}</a></li>
        `;
  }
}

// Utility functions
function showNotification(message, type) {
  const area = document.getElementById("notification-area");
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.innerHTML = `
        <button class="delete"></button>
        ${message}
    `;

  notification.querySelector(".delete").addEventListener("click", () => {
    notification.remove();
  });

  area.appendChild(notification);
  setTimeout(() => notification.remove(), 5000);
}

function formatSize(bytes) {
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unit = 0;
  while (size > 1024 && unit < units.length - 1) {
    size /= 1024;
    unit++;
  }
  return `${Math.round(size * 10) / 10} ${units[unit]}`;
}
