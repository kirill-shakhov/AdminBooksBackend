const { REFRESH_TOKEN_COOKIE_OPTIONS } = require('../constants/cookie.constants');

function setRefreshTokenCookie(res, refreshToken) {
    res.cookie('refreshToken', refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);
}

module.exports = {
    setRefreshTokenCookie
};