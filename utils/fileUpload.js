const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const multer = require('multer');
const { BadRequestError } = require('./errors');

const unlinkAsync = promisify(fs.unlink);
const mkdirAsync = promisify(fs.mkdir);

class FileUploader {
  constructor(uploadDir, allowedMimeTypes, maxFileSize, maxFiles = 5) {
    this.uploadDir = uploadDir;
    this.allowedMimeTypes = allowedMimeTypes;
    this.maxFileSize = maxFileSize;
    this.maxFiles = maxFiles;
    this.ensureUploadDirExists();
  }

  ensureUploadDirExists() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  createMulterUpload(subfolder = '') {
    const uploadPath = path.join(this.uploadDir, subfolder);
    
    // Ensure subdirectory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname).toLowerCase();
        const filename = `file-${uniqueSuffix}${ext}`;
        cb(null, filename);
      }
    });

    const fileFilter = (req, file, cb) => {
      if (!this.allowedMimeTypes.includes(file.mimetype)) {
        return cb(new BadRequestError(
          `Invalid file type: ${file.mimetype}. Allowed types: ${this.allowedMimeTypes.join(', ')}`
        ), false);
      }
      cb(null, true);
    };

    return multer({
      storage,
      fileFilter,
      limits: {
        fileSize: this.maxFileSize,
        files: this.maxFiles
      }
    });
  }

  async saveFile(file, subfolder = '') {
    const folderPath = path.join(this.uploadDir, subfolder);
    
    if (!fs.existsSync(folderPath)) {
      await mkdirAsync(folderPath, { recursive: true });
    }

    const filename = this.generateUniqueFilename(file.originalname);
    const filePath = path.join(folderPath, filename);
    
    await promisify(file.mv)(filePath);
    
    return {
      filename,
      path: filePath,
      url: `/uploads/${subfolder ? subfolder + '/' : ''}${filename}`,
      size: file.size,
      mimetype: file.mimetype,
      originalname: file.originalname
    };
  }

  generateUniqueFilename(originalName) {
    const ext = path.extname(originalName).toLowerCase();
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 10);
    return `file-${timestamp}-${randomString}${ext}`;
  }

  async deleteFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        await unlinkAsync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error deleting file ${filePath}:`, error);
      return false;
    }
  }

  async cleanupFiles(files) {
    if (!Array.isArray(files)) files = [files];
    
    const results = await Promise.allSettled(
      files.map(file => this.deleteFile(file.path))
    );
    
    return results.every(result => result.status === 'fulfilled' && result.value);
  }
}

// Create a pre-configured instance for maintenance task uploads
const maintenanceUploader = new FileUploader(
  path.join(process.cwd(), 'uploads', 'maintenance'),
  [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv'
  ],
  10 * 1024 * 1024, // 10MB
  5 // max 5 files
);

module.exports = {
  FileUploader,
  maintenanceUploader
};
