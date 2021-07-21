const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const multer = require("multer");

app.use(cors());

app.use("/images", express.static("images"));

app.use(express.json());

const db = require("./models");

const imageStorage = multer.diskStorage({
  // Destination to store image
  destination: "images",
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
    // file.fieldname is name of the field (image)
    // path.extname get the uploaded file extension
  },
});

const imageUpload = multer({
  storage: imageStorage,
  limits: {
    fileSize: 10000000, // 1000000 Bytes = 1 MB
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
      // upload only png and jpg format
      return cb(new Error("Please upload a Image"));
    }
    cb(undefined, true);
  },
});

app.post(
  "/uploadImage",
  imageUpload.single("file"),
  (req, res) => {
    res.send(req.file);
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

// ROUTER
const postRouter = require("./routes/Posts");
app.use("/posts", postRouter);
const usersRouter = require("./routes/Users");
app.use("/auth", usersRouter);

db.sequelize.sync().then(() => {
  app.listen(3001);
});
