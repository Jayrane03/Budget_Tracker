import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'key123');
    req.user = decoded.user;

    if (!req.user || !req.user.id) {
        return res.status(401).json({ msg: 'Token is valid but user ID is missing from payload.' });
    }

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ msg: 'Token expired' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ msg: 'Token is not valid or malformed' });
    }
    console.error('JWT verification failed:', err.message);
    return res.status(500).json({ msg: 'Server Error during token verification' });
  }
};
export default authMiddleware;