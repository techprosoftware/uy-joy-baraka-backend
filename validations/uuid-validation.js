const Joi = require('joi');

module.exports = Joi.object({
    announcement_id: Joi.string().required().error(new Error('Invalid announcement_id')),
});
