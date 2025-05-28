const jwt = require('jsonwebtoken');
require('dotenv').config();

// Verify the token
const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check if no authorization header
  if (!authHeader) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }
  
  try {
    // EHandle both "Bearer token" format and raw token
    let token;
    if (authHeader.startsWith('Bearer ')) {
      // Remove Bearer from string
      token = authHeader.substring(7, authHeader.length);
    } else {
      token = authHeader;
    }
    const decoded = jwt.verify(token, process.env.SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};

module.exports = auth;