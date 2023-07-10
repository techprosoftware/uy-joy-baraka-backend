const Joi = require('joi');

module.exports = Joi.object({
    firstName: Joi.string()
        .max(64)
        .min(3)
        .required()
        .error(Error("First name is invalid")),
    lastName: Joi.string()
        .max(64)
        .min(3)
        .required()
        .error(Error("Last name is invalid"))
})