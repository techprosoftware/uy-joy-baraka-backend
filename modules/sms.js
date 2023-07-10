const axios = require("axios");
const FormData = require("form-data");
const config = require("../config");

const authService = async (email, password) => {
    try {
        const reqBody = new FormData();
        reqBody.append("email", email);
        reqBody.append("password", password);

        const response = await axios.post("https://notify.eskiz.uz/api/auth/login", reqBody, {
            headers: reqBody.getHeaders(),
        });

        const data = response.data;
        console.log(data);

        if (response.status >= 200 && response.status < 300) {
            data.success = true;
            return data;
        }

        data.success = false;
        return data;
    } catch (error) {
        console.log(error);
    }
};

const sendSms = async (phoneNumber, message) => {
    const authInfo = await authService(config.SMS_EMAIL, config.SMS_PASSWORD);
    if (!authInfo.success) {
        return authInfo;
    }

    const reqBody = new FormData();

    reqBody.append("mobile_phone", phoneNumber);
    reqBody.append("message", message);
    reqBody.append("from", 4546);

    const response = await axios.post(
        "https://notify.eskiz.uz/api/message/sms/send",
        reqBody,
        {
            headers: {
                Authorization: `Bearer ${authInfo.data.token}`,
                ...reqBody.getHeaders(),
            },
        }
    );

    const data = response.data;
    console.log(data);

    if (response.status >= 200 && response.status < 300) {
        data.success = true;
        return data;
    }

    data.success = false;
    return data;
};


// ;(async () => {
//   console.log(await sendSms("998905210501", "Salom Test"));
// })()

module.exports = sendSms;