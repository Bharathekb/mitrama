const crypto = require("crypto");

const ITERATIONS = 120000;
const KEY_LENGTH = 64;
const DIGEST = "sha512";

const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST)
    .toString("hex");

  return `pbkdf2$${ITERATIONS}$${salt}$${hash}`;
};

const verifyPassword = (password, storedPassword) => {
  if (!storedPassword) return false;

  const parts = storedPassword.split("$");
  if (parts[0] !== "pbkdf2" || parts.length !== 4) {
    return password === storedPassword;
  }

  const [, iterations, salt, storedHash] = parts;
  const hash = crypto
    .pbkdf2Sync(password, salt, Number(iterations), KEY_LENGTH, DIGEST)
    .toString("hex");

  return crypto.timingSafeEqual(
    Buffer.from(hash, "hex"),
    Buffer.from(storedHash, "hex")
  );
};

const isHashedPassword = (storedPassword) => {
  return storedPassword?.startsWith("pbkdf2$");
};

module.exports = {
  hashPassword,
  verifyPassword,
  isHashedPassword,
};
