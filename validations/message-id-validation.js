const Joi = require("joi");

module.exports = Joi.object({
  message_id: Joi.string().required().error(new Error("Invalid message_id")),
});
