const spicedPg = require("spiced-pg");

const db = spicedPg("postgres:postgres:postgres@localhost:5432/imageboard");

module.exports.getFirstImages = () => {
    const q = `
        SELECT * FROM images
        ORDER BY id DESC
        LIMIT 10;
    `;
    return db.query(q);
};
module.exports.getMoreImages = (id) => {
    const q = `
    SELECT id, url, title, (
        SELECT id FROM images
        ORDER BY id ASC
        LIMIT 1
    ) AS "lowestImgId" FROM images
    WHERE id <$1
    ORDER BY id DESC
    LIMIT 5
    `;
    const params = [id];
    return db.query(q, params);
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

module.exports.getComments = (imageId) => {
    const q = `SELECT * FROM comments WHERE img_id = $1 ORDER BY id DESC`;
    const params = [imageId];
    return db.query(q, params);
};

module.exports.addComment = (img_id, comment, username) => {
    const q = `
    INSERT INTO comments (img_id, comment, username)
    VALUES ($1, $2, $3)
    RETURNING *
    `;
    const params = [img_id, comment, username];
    return db.query(q, params);
};
