const jwt = require('jsonwebtoken');

// @desc    Admin login - checked ONLY against ADMIN_USERNAME/ADMIN_PASSWORD
//          in .env. Nothing is stored in the database, so the credentials
//          are never visible in any dashboard, API response, or DB browser.
// @route   POST /api/admin/login
const adminLogin = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  if (
    username !== process.env.ADMIN_USERNAME ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

  res.json({ token });
};

module.exports = { adminLogin };

