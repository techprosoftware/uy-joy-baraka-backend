const Joi = require('joi');

module.exports = Joi.object({
    receiver_id: Joi.string().required().error(new Error('Invalid receiver_id')),
});
