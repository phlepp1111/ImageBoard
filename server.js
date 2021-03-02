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

app.get("/imageboard", (req, res) => {
    db.getAllImages()
        .then(({ rows }) => {
            console.log("Rows: ", rows);
            res.json(rows);
            console.log("hit the get route!");
        })
        .catch((error) => {
            console.log("error in query: ", error);
        });
});

app.get("/imageboard/:id", (req, res) => {
    console.log("req.params", req.params);
    let id = req.params.id;
    db.getSingleImage(id)
        .then(({ rows }) => {
            // console.log("rows", rows);
            res.json({
                image: rows[0],
            });
        })
        .catch((error) => {
            console.log("error in dynamic route, getImage", error);
        });
});

app.post("/upload", uploader.single("file"), s3.upload, (req, res) => {
    const { title, description, username } = req.body;
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
            });
        });
    } else {
        res.json({
            success: false,
        });
    }
});

app.listen(8080, () => console.log("Imageboard server running on 8080"));
