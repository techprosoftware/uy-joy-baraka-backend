const Joi = require("joi");

module.exports = Joi.object({
    phone: Joi.string()
        .pattern(new RegExp("^998[389][01345789][0-9]{7}$"))
        .error(Error("invalid phone")),
    password: Joi.string()
        .required()
        .min(3)
        .max(32)
        .error(Error("Invalid password")),
});