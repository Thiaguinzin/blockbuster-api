const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function (req, res, next) {
    const authHeader = req.header('Authorization');

    // Verificar se o header Authorization está presente
    if (!authHeader) {
        return res.status(401).send('Access denied. No token provided.');
    }

    // Verificar o esquema Bearer
    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
        return res.status(400).send('Invalid Authorization header format.');
    }

    try {
        const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).send('Invalid token.');
    }
};
