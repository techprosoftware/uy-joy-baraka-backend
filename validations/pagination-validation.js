const Joi = require('joi');

module.exports = Joi.object({
    p_page: Joi.number().integer().min(1).error(Error('Invalid p_page options')),
    c_page: Joi.number().integer().min(1).error(Error('Invalid c_page options')),
});