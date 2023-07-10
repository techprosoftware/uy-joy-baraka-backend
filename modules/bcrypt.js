const bcrypt = require("bcrypt");

const generateHash = async (data) => await bcrypt.hash(data, await bcrypt.genSalt(10)),
     compareHash = async (data, hash) => await bcrypt.compare(data, hash);

module.exports = { generateHash, compareHash }