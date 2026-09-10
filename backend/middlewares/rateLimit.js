const visits = new Map();

// Dependency-free, process-local protection for auth and sensitive endpoints.
export const rateLimit = ({ windowMs = 15 * 60 * 1000, max = 100 } = {}) => (req, res, next) => {
    const key = `${req.ip}:${req.baseUrl}${req.path}`;
    const now = Date.now();
    const entry = visits.get(key) || { count: 0, resetAt: now + windowMs };
    if (now > entry.resetAt) Object.assign(entry, { count: 0, resetAt: now + windowMs });
    entry.count += 1;
    visits.set(key, entry);
    res.set("X-RateLimit-Remaining", Math.max(0, max - entry.count));
    if (entry.count > max) return res.status(429).json({ success: false, message: "Too many requests. Please try again later." });
    next();
};
