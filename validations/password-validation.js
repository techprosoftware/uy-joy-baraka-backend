const Joi = require("joi");

module.exports = Joi.object({
    password: Joi.string().required().min(1).error(Error("Invalid password")),
});
