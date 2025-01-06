folderRegistry = new Set();

class OPFSFileSystem {
  constructor(name) {
    this.name = name;
  }

  async init() {
    try {
      this.rootHandle = await navigator.storage.getDirectory();
      this.rootHandle = await this.rootHandle.getDirectoryHandle(this.name, {
        create: true,
      });
    } catch (e) {
      throw new Error(`Unable to initialize filesystem: ${e.message}`);
    }
  }

  async getFile(path) {
    let splitPath = path.split("/");
    let currentHandle = this.rootHandle;
    for (let i = 0; i < splitPath.length - 1; i++) {
      try {
        currentHandle = await currentHandle.getDirectoryHandle(splitPath[i], {
          create: false,
        });
      } catch (e) {
        throw new Error(
          `Unable to find file ${path}, directory ${splitPath[i]} does not exist.`,
        );
      }
    }

    try {
      currentHandle = await currentHandle.getFileHandle(
        splitPath[splitPath.length - 1],
        { create: false },
      );
    } catch (e) {
      throw new Error(
        `Unable to find file ${path}, file ${splitPath[splitPath.length - 1]} does not exist.`,
      );
    }

    return new OPFSFile(currentHandle);
  }

  async createFile(path, blob) {
    let splitPath = path.split("/");
    let currentHandle = this.rootHandle;
    for (let i = 0; i < splitPath.length - 1; i++) {
      try {
        currentHandle = await currentHandle.getDirectoryHandle(splitPath[i], {
          create: true,
        });
      } catch (e) {
        throw new Error(
          `Unable to create file ${path}, directory ${splitPath[i]} could not be created.`,
        );
      }
    }

    try {
      currentHandle = await currentHandle.getFileHandle(
        splitPath[splitPath.length - 1],
        { create: true },
      );
    } catch (e) {
      throw new Error(
        `Unable to create file ${path}, file ${splitPath[splitPath.length - 1]} could not be created.`,
      );
    }

    try {
      let writeableFile = await currentHandle.createWritable();
      await writeableFile.write(blob);
      await writeableFile.close();
    } catch (e) {
      throw new Error(`Unable to write to file ${path}: ${e.message}`);
    }

    const pathParts = path.split("/");
    const affectedPath = pathParts.slice(0, -1).join("/");

    for (const folder of folderRegistry) {
      if (folder.folderHandle.name === affectedPath) {
        await folder.indexFiles();
      }
    }

    return new OPFSFile(currentHandle);
  }

  async deleteFile(path) {
    let splitPath = path.split("/");
    let currentHandle = this.rootHandle;
    for (let i = 0; i < splitPath.length - 1; i++) {
      try {
        currentHandle = await currentHandle.getDirectoryHandle(splitPath[i], {
          create: false,
        });
      } catch (e) {
        throw new Error(
          `Unable to delete file ${path}, directory ${splitPath[i]} does not exist.`,
        );
      }
    }

    try {
      currentHandle = await currentHandle.getFileHandle(
        splitPath[splitPath.length - 1],
        { create: false },
      );
    } catch (e) {
      throw new Error(
        `Unable to delete file ${path}, file ${splitPath[splitPath.length - 1]} does not exist.`,
      );
    }

    try {
      await currentHandle.remove();
    } catch (e) {
      throw new Error(`Unable to delete file ${path}: ${e.message}`);
    }
  }

  async getFolder(path) {
    let splitPath = path.split("/");
    let currentHandle = this.rootHandle;
    for (let i = 0; i < splitPath.length; i++) {
      try {
        currentHandle = await currentHandle.getDirectoryHandle(splitPath[i], {
          create: false,
        });
      } catch (e) {
        throw new Error(
          `Unable to find folder ${path}, directory ${splitPath[i]} does not exist.`,
        );
      }
    }
    return new OPFSFolder(currentHandle);
  }

  async createFolder(path) {
    let splitPath = path.split("/");
    let currentHandle = this.rootHandle;
    for (let i = 0; i < splitPath.length; i++) {
      try {
        currentHandle = await currentHandle.getDirectoryHandle(splitPath[i], {
          create: true,
        });
      } catch (e) {
        throw new Error(
          `Unable to create folder ${path}, directory ${splitPath[i]} could not be created.`,
        );
      }
    }
    return new OPFSFolder(currentHandle);
  }

  async deleteFolder(path) {
    let splitPath = path.split("/");
    let currentHandle = this.rootHandle;
    for (let i = 0; i < splitPath.length; i++) {
      try {
        currentHandle = await currentHandle.getDirectoryHandle(splitPath[i], {
          create: false,
        });
      } catch (e) {
        throw new Error(
          `Unable to delete folder ${path}, directory ${splitPath[i]} does not exist.`,
        );
      }
    }

    try {
      await currentHandle.remove();
    } catch (e) {
      throw new Error(`Unable to delete folder ${path}: ${e.message}`);
    }
  }
}

class OPFSFile {
  constructor(fileHandle) {
    this.fileHandle = fileHandle;
    this.metadata = {};
    this.#indexMetadata();
  }

  async getBlob() {
    try {
      return await this.fileHandle.getFile();
    } catch (e) {
      throw new Error(`Unable to get blob: ${e.message}`);
    }
  }

  async getURL() {
    try {
      return URL.createObjectURL(await this.getBlob());
    } catch (e) {
      throw new Error(`Unable to get URL: ${e.message}`);
    }
  }

  async write(blob) {
    try {
      let writeableFile = await this.fileHandle.createWritable();
      await writeableFile.write(blob);
      await writeableFile.close();
      this.#indexMetadata();
    } catch (e) {
      throw new Error(`Unable to write to file: ${e.message}`);
    }
  }

  async download() {
    try {
      let url = await this.getURL();
      let a = document.createElement("a");
      a.href = url;
      a.download = this.fileHandle.name;
      a.click();
      URL.revokeObjectURL(url);
      a.remove();
    } catch (e) {
      throw new Error(`Unable to download file: ${e.message}`);
    }
  }

  async delete() {
    try {
      await this.fileHandle.remove();
    } catch (e) {
      throw new Error(`Unable to delete file: ${e.message}`);
    }
  }

  async move(newPath) {
    let splitPath = newPath.split("/");
    let currentHandle = this.fileHandle;
    for (let i = 0; i < splitPath.length - 1; i++) {
      try {
        currentHandle = await currentHandle
          .getParent()
          .getDirectoryHandle(splitPath[i], { create: true });
      } catch (e) {
        throw new Error(
          `Unable to move file to ${newPath}, directory ${splitPath[i]} could not be created.`,
        );
      }
    }

    try {
      currentHandle = await currentHandle.getFileHandle(
        splitPath[splitPath.length - 1],
        { create: true },
      );
    } catch (e) {
      throw new Error(
        `Unable to move file to ${newPath}, file ${splitPath[splitPath.length - 1]} could not be created.`,
      );
    }

    try {
      await this.fileHandle.move(currentHandle);
      this.fileHandle = currentHandle;
      this.#indexMetadata();
    } catch (e) {
      throw new Error(`Unable to move file: ${e.message}`);
    }
  }

  #indexMetadata() {
    this.metadata = {};
    this.fileHandle
      .getFile()
      .then(async (blob) => {
        this.metadata.lastModified = blob.lastModifiedDate;
        this.metadata.size = blob.size;
        this.metadata.type = blob.type;
      })
      .catch((e) => {
        throw new Error(`Unable to index metadata: ${e.message}`);
      });
  }
}

class OPFSFolder {
  constructor(folderHandle) {
    this.folderHandle = folderHandle;
    this.files = {};
    folderRegistry.add(this);
    this.indexFiles();
  }

  async indexFiles() {
    try {
      let files = await this.folderHandle.values();
      this.files = {};
      for await (let file of files) {
        this.files[file.name] = async () =>
          new OPFSFile(await this.folderHandle.getFileHandle(file.name));
      }
    } catch (e) {
      throw new Error(`Unable to index files: ${e.message}`);
    }
  }

  async getFile(name) {
    await this.indexFiles();
    return this.files[name] ? this.files[name]() : null;
  }

  async createFile(name, blob) {
    try {
      let fileHandle = await this.folderHandle.getFileHandle(name, {
        create: true,
      });
      let writeableFile = await fileHandle.createWritable();
      await writeableFile.write(blob);
      await writeableFile.close();
      await this.indexFiles();
      return new OPFSFile(fileHandle);
    } catch (e) {
      throw new Error(`Unable to create file ${name}: ${e.message}`);
    }
  }

  async deleteFile(name) {
    try {
      await this.folderHandle.getFileHandle(name).remove();
      await this.indexFiles();
    } catch (e) {
      throw new Error(`Unable to delete file ${name}: ${e.message}`);
    }
  }

  hasFile(name) {
    return !!this.files[name];
  }

  async delete() {
    try {
      await this.folderHandle.remove();
      folderRegistry.delete(this);
    } catch (e) {
      throw new Error(`Unable to delete folder: ${e.message}`);
    }
  }

  async downloadAll() {
    try {
      let files = await this.folderHandle.values();
      for await (let file of files) {
        let url = URL.createObjectURL(
          await this.folderHandle.getFileHandle(file.name).getFile(),
        );
        let a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
        a.remove();
      }
    } catch (e) {
      throw new Error(`Unable to download all files: ${e.message}`);
    }
  }

  async downloadZip() {
    try {
      // Initialize zip writer
      const zipWriter = new zip.ZipWriter(
        new zip.BlobWriter("application/zip"),
        {
          bufferedWrite: true,
        },
      );

      // Get all files
      let files = await this.folderHandle.values();

      // Add each file to zip
      for await (let file of files) {
        let fileHandle = await this.folderHandle.getFileHandle(file.name);
        let blob = await fileHandle.getFile();
        await zipWriter.add(file.name, new zip.BlobReader(blob));
      }

      // Generate final zip blob and create download
      const zipBlob = await zipWriter.close();
      const blobUrl = URL.createObjectURL(zipBlob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = this.folderHandle.name + ".zip";
      a.click();

      // Cleanup
      URL.revokeObjectURL(blobUrl);
      a.remove();
    } catch (e) {
      throw new Error(`Unable to download zip: ${e.message}`);
    }
  }
}
