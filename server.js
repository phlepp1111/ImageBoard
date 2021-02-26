const express = require("express");
const app = express();
const db = require("./db");
app.use(express.static("public"));

app.get("/imageboard", (req, res) => {
    db.getAllImages().then(({ rows }) => {
        res.json(rows);
        console.log("hit the get route!");
    });
});

app.listen(8080, () => console.log("Imageboard server running on 8080"));
