const Joi = require('joi');

module.exports = Joi.object({
    slug: Joi.string().required().error(Error('Invalid slug')),
});
