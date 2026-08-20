const multer = require("multer");
const path = require("path");
const fs = require("fs");

const profileDir = path.join(
  __dirname,
  "../uploads/profiles"
);

const verificationDir = path.join(
  __dirname,
  "../uploads/verifications"
);

// Create folders only when needed
if (!fs.existsSync(profileDir)) {
  fs.mkdirSync(profileDir, { recursive: true });
}

if (!fs.existsSync(verificationDir)) {
  fs.mkdirSync(verificationDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "profile_picture") {
      cb(null, profileDir);
    } else {
      cb(null, verificationDir);
    }
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const imageTypes = [
    "image/jpeg",
    "image/png",
    "image/webp"
  ];

  if (file.fieldname === "profile_picture") {
    if (imageTypes.includes(file.mimetype)) {
      return cb(null, true);
    }

    return cb(
      new Error(
        "Profile picture must be JPG, PNG or WEBP"
      )
    );
  }

  const verificationTypes = [
    ...imageTypes,
    "application/pdf"
  ];

  if (verificationTypes.includes(file.mimetype)) {
    return cb(null, true);
  }

  cb(
    new Error(
      "Verification document must be JPG, PNG, WEBP or PDF"
    )
  );
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

module.exports = upload;