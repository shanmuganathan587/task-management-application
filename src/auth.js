const jwt = require('jsonwebtoken');
module.exports = function requireAuth(req,res,next) {
 const h=req.headers.authorization||'', token=h.startsWith('Bearer ')?h.slice(7):null;
 if(!token) return res.status(401).json({message:'Please log in.'});
 try { req.user=jwt.verify(token,process.env.JWT_SECRET); next(); }
 catch { return res.status(401).json({message:'Session expired. Please log in again.'}); }
};
