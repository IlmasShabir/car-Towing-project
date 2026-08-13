const jwt = require('jsonwebtoken');

// Unlike the old User-based `protect` middleware, this doesn't look anyone
// up in the database for the OWNER account - the owner isn't a DB record
// at all. It just checks the JWT was signed by us with { role: 'admin' },
// which only happens after a successful login (owner via .env credentials,
// or an approved AdminUser via username/password).
const protectAdmin = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized as admin' });
      }

      req.admin = decoded; // { role, isSuperAdmin?, id?, iat, exp }
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  return res.status(401).json({ message: 'Not authorized, no token' });
};

module.exports = { protectAdmin };
