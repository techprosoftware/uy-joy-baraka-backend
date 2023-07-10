const Joi = require('joi');

module.exports = Joi.object({
    message: Joi.string().required().error(new Error('Invalid message')),
    announcement_id: Joi.string().required().error(new Error('Invalid announcement_id')),
});
