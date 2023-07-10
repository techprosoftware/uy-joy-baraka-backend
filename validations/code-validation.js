const Joi = require('joi');

module.exports = Joi.object({
    phone: Joi.string()
        .pattern(new RegExp('^998[389][01345789][0-9]{7}$'))
        .error(Error('invalid phone')),
    code: Joi.string()
        .required()
        .pattern(new RegExp('^[0-9]{5}$'))
        .error(Error('invalid code'))
})