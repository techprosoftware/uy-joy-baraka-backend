const dotenv = require("dotenv");
dotenv.config();

const { env } = process;

module.exports = {
  PORT: env.PORT,
  NODE_ENV: env.NODE_ENV,
  DB_URL: env.DB_URL,
  DEV_DB_URL: env.DEV_DB_URL,
  SECRET_WORD: env.SECRET_WORD,
  URL: env.URL,
  SMS_EMAIL: env.SMS_EMAIL,
  SMS_PASSWORD: env.SMS_PASSWORD,
};
