const Joi = require('joi');

module.exports = Joi.object({
    type: Joi.string().pattern(new RegExp(/^(rent|sale)$/)).error(Error('Invalid type sale or rent')),
    city: Joi.string().error(Error('Invalid city')),
    price_type: Joi.string().pattern(new RegExp(/^(sum|dollar)$/)).error(Error("Invalid price_type sum or dollar")),
    c_page: Joi.number().integer().min(1).error(Error('Invalid c_page options')),
});