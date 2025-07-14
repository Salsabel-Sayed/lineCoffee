import multer from "multer";
import path from "path";
import fs from "fs";

// مجلد الأب الرئيسي
const baseUploadDir = "uploads";

// تأكد من وجود المجلد الأساسي
if (!fs.existsSync(baseUploadDir)) {
  fs.mkdirSync(baseUploadDir);
}

const storage = multer.diskStorage({
  destination: function (_req, file, cb) {
    let folder = `${baseUploadDir}/others`;

    // توزيع الصور حسب الفيلد نيم
    if (file.fieldname.includes("category")) {
      folder = `${baseUploadDir}/categories`;
    } else if (file.fieldname.includes("product")) {
      folder = `${baseUploadDir}/products`;
    } else if (file.fieldname.includes("user")) {
      folder = `${baseUploadDir}/users`;
    }

    // أنشئ الفولدر لو مش موجود
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    cb(null, folder);
  },

  filename: function (_req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({ storage });

export default upload;
