const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  console.log('Path:', req.path);
  console.log('Headers:', req.headers);
  
  // Skip auth for registration and login routes
  if (req.path === '/api/v1/auth/register' || req.path === '/api/v1/auth/login') {
    return next();
  }

  let token = req.headers.authorization;

  if (token && token.startsWith('Bearer ')) {
    token = token.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (error) {
      console.error('Token verification failed:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  console.log('No token provided for protected route');
  return res.status(401).json({ message: 'Not authorized, no token' });
};

const authorizeRoles = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !req.user.role) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Insufficient role' });
  }

  return next();
};

module.exports = { protect, authorizeRoles };
