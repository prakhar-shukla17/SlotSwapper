import jwt from 'jsonwebtoken';

const { JWT_SECRET, NODE_ENV } = process.env;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not configured in environment variables');
}


export const generateToken = (user, res) => {
  try {
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.cookie('jwt', token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      httpOnly: true, // Prevent XSS attacks
      sameSite: 'none', // CSRF protection
      secure: NODE_ENV === 'production', // HTTPS only in production
    });

    return token;
  } catch (error) {
    console.error('Error generating token:', error);
    throw new Error('Failed to generate authentication token');
  }
};


export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('Token verification failed:', error.message);
    throw new Error('Invalid or expired token');
  }
};


export const clearToken = (res) => {
  res.clearCookie('jwt', {
    httpOnly: true,
    sameSite: 'none',
    secure: NODE_ENV === 'production',
  });
};
