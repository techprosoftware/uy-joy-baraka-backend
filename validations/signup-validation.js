const Joi = require("joi");

module.exports = Joi.object({
    name: Joi.string()
        .required()
        .min(3)
        .max(32)
        .pattern(new RegExp("^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$"))
        .error(Error("Invalid name")),
    phone: Joi.string()
        .pattern(new RegExp("^998[389][01345789][0-9]{7}$"))
        .error(Error("Invalid phone")),
    password: Joi.string()
        .required()
        .min(1)
        .max(32)
        .error(Error("Invalid password")),
});