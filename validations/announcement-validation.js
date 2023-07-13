const Joi = require("joi");

module.exports = Joi.object({
  city: Joi.string().required().error(Error("Invalid city")),
  district: Joi.string().required().error(Error("Invalid district")),
  address: Joi.string().required().error(Error("Invalid address")),
  type: Joi.string()
    .required()
    .pattern(new RegExp(/^(rent|sale)$/))
    .error(Error("Invalid type sale or rent")),
  title: Joi.string().required().error(Error("Invalid title")),
  description: Joi.string().required().error(Error("Invalid description")),
  price: Joi.number().required().error(Error("Invalid price")),
  price_type: Joi.string()
    .required()
    .pattern(new RegExp(/^(sum|dollar)$/))
    .error(Error("Invalid price_type sum or dollar")),
  phone: Joi.string()
      .required()
      .pattern(new RegExp("^998[389][01345789][0-9]{7}$"))
      .error(Error("invalid phone")),
});
