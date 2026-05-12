import jwt from 'jsonwebtoken';
const threeDayInMillis = 1 * 24 * 60 * 60 * 1000; // 3 days in milliseconds

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: threeDayInMillis,
  });

export default generateToken;