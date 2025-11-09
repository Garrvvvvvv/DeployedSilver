// middleware/userAuth.js (ESM, safe for multipart)
import jwt from "jsonwebtoken";

export default function userAuth(req, res, next) {
  try {
    // If you’re using a cookie JWT, read from req.cookies.token
    const bearer = req.headers.authorization || "";
    const token = bearer.startsWith("Bearer ") ? bearer.slice(7) : null;

    let user = null;

    // 1) Try Bearer JWT (if you issue one)
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // normalize common fields
        user = {
          sub: decoded.sub || decoded.uid || decoded.id,
          email: decoded.email,
          name: decoded.name,
          picture: decoded.picture,
        };
      } catch {
        // ignore invalid token; fall back to headers
      }
    }

    // 2) Fall back to headers set by frontend if no JWT
    if (!user) {
      const headerUid = req.headers["x-oauth-uid"];
      const headerEmail = req.headers["x-oauth-email"];
      if (headerUid || headerEmail) {
        user = { sub: headerUid, email: headerEmail };
      }
    }

    // user may still be null; that’s OK — controller will check and 401
    req.user = user || null;
    next();
  } catch (e) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}
