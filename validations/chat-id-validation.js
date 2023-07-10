const Joi = require('joi');

module.exports = Joi.object({
    chat_id: Joi.string().required().error(new Error('Invalid chat_id')),
});
