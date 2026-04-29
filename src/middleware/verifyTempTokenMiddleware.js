const jwt = require('jsonwebtoken');
const { secret } = require('../config/config');

module.exports = function (req, res, next) {
  if (req.method === 'OPTIONS') {
    next();
  }

  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: 'No authorization header' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Invalid token format' });
    }

    const decodedData = jwt.verify(token, process.env.JWT_ACCESS_SECRET_2FA);

    if (decodedData.type !== '2fa') {
      return res.status(401).json({ message: 'Invalid temp token' });
    }

    req.tempUser = decodedData;
    next();
  } catch (e) {
    console.log(e);
    return res.status(401).json({ message: 'Пользователь не авторизован' });
  }
};