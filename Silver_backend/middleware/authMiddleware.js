// middleware/auth.js  (ESM)

import jwt from "jsonwebtoken";

export default function (req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const [type, token] = auth.split(" ");

    if (type !== "Bearer" || !token) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.admin = {
      id: decoded.id,
      role: decoded.role || "admin",
      username: decoded.username || null,
    };

    next();
  } catch (_err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
