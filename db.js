const spicedPg = require("spiced-pg");

const db = spicedPg("postgres:postgres:postgres@localhost:5432/imageboard");

module.exports.getAllImages = () => {
    const q = `
        SELECT * FROM images;
    `;
    return db.query(q);
};
