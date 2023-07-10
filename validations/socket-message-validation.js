const Joi = require('joi');

module.exports = Joi.object({
    receiver_id: Joi.string().required().error(new Error('Invalid receiver_id')),
    chat_id: Joi.string().required().error(new Error('Invalid chat_id')),
    message: Joi.string().required().error(new Error('Invalid message')),
});
