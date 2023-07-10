const Jwt = require("jsonwebtoken");
const {SECRET_WORD} = require("../config");

const generateToken = (data) => Jwt.sign(data, SECRET_WORD);
const verifyToken = (data) => {
    try {
        return Jwt.verify(data, SECRET_WORD, {expiresIn: "7d"});
    } catch (e) {
        return false;
    }
}

module.exports = { generateToken, verifyToken };