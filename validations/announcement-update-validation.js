const Joi = require("joi");

module.exports = Joi.object({
    announcement_id: Joi.string()
        .required()
        .error(Error("Invalid announcement_id")),
    city: Joi.string()
        .error(Error("Invalid city")),
    district: Joi.string()
        .error(Error("Invalid district")),
    address: Joi.string()
        .error(Error("Invalid address")),
    type: Joi.string()
        .pattern(new RegExp(/^(rent|sale)$/))
        .error(Error('Invalid type sale or rent')),
    title: Joi.string()
        .error(Error("Invalid title")),
    description: Joi.string()
        .error(Error("Invalid description")),
    price: Joi.number()
        .error(Error("Invalid price")),
    price_type: Joi.string()
        .pattern(new RegExp(/^(sum|dollar)$/))
        .error(Error("Invalid price_type sum or dollar")),
});