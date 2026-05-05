const config = require("../config/config");
const { ACTIVATION_CONFIRMATION_PATH } = require("../constants/url.constants");

const generateActivationLink = (token) => {
    const baseUrl = config.clientUrl.endsWith("/")
        ? config.clientUrl.slice(0, -1)
        : config.clientUrl;

    return `${baseUrl}${ACTIVATION_CONFIRMATION_PATH}?token=${token}`;
};

module.exports = generateActivationLink;