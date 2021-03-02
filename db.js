const spicedPg = require("spiced-pg");

const db = spicedPg("postgres:postgres:postgres@localhost:5432/imageboard");

module.exports.getAllImages = () => {
    const q = `
        SELECT * FROM images
        ORDER BY id DESC
        LIMIT 10;
    `;
    return db.query(q);
};
module.exports.addImage = (url, username, title, description) => {
    const q = `
        INSERT INTO images (url, username, title, description) 
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `;
    const params = [url, username, title, description];
    return db.query(q, params);
};

module.exports.getSingleImage = (id) => {
    const q = `SELECT * FROM images WHERE id = $1`;
    const params = [id];
    return db.query(q, params);
};
