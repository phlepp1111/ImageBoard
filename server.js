const express = require("express");
const app = express();
const db = require("./db");
const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");
const s3 = require("./s3");

const diskStorage = multer.diskStorage({
     destination: function (req, file, callback) {
          callback(null, __dirname + "/uploads");
     },
     filename: function (req, file, callback) {
          uidSafe(24).then(function (uid) {
               callback(null, uid + path.extname(file.originalname));
          });
     },
});
const uploader = multer({
     storage: diskStorage,
     limits: {
          fileSize: 2097152,
     },
});

app.use(express.static("public"));
app.use(express.json());

app.get("/imageboard", (req, res) => {
     db.getFirstImages()
          .then(({ rows }) => {
               res.json(rows);
               console.log("hit the get route!");
          })
          .catch((error) => {
               console.log("error in query: ", error);
          });
});

app.get("/more/:lowestImgId", (req, res) => {
     const lowestImgId = req.params.lowestImgId;
     console.log("Lowest id received: ", lowestImgId);
     db.getMoreImages(lowestImgId)
          .then(({ rows }) => {
               console.log("return from db: ", rows);
               res.json(rows);
          })
          .catch((error) => {
               console.log("Error getting more images in server:", error);
          });
});

app.get("/imageboard/:id", (req, res) => {
     let id = req.params.id;
     db.getSingleImage(id)
          .then(({ rows }) => {
               res.json({
                    image: rows[0],
               });
          })
          .catch((error) => {
               console.log("error in dynamic route, images", error);
          });
});

app.get("/comments/:id", (req, res) => {
     let id = req.params.id;
     db.getComments(id)
          .then(({ rows }) => {
               res.json(rows);
          })
          .catch((error) => {
               console.log("error in dynamic route, comments", error);
          });
});

app.post("/addcomment", (req, res) => {
     let { comment, username, img_id } = req.body;
     db.addComment(img_id, comment, username)
          .then(({ rows }) => {
               res.json({ addComment: rows[0] });
          })
          .catch((err) => {
               console.log("error in comment submission", err);
          });
});

app.post("/upload", uploader.single("file"), s3.upload, (req, res) => {
     let { title, description, username } = req.body;
     const { filename } = req.file;
     if (req.file) {
          db.addImage(
               "https://s3.amazonaws.com/image-board-bucket/" + filename,
               username,
               title,
               description
          ).then(({ rows }) => {
               console.log("rows: ", rows);
               res.json({
                    success: true,
                    image: rows[0],
               });
          });
     } else {
          res.json({
               success: false,
          });
     }
});

app.listen(8080, () => console.log("Imageboard server running on 8080"));
