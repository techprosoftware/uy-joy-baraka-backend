const Joi = require('joi');

module.exports = Joi.object({
    full_name: Joi.string()
        .max(128)
        .min(3)
        .required()
        .error(Error("full_name is invalid")),
});