const crypto = require("crypto");

const ENCRYPTION_PREFIX = "enc:v1";

const getMessageSecret = () => {
  return process.env.MESSAGE_SECRET || process.env.JWT_SECRET || "mitrama-dev-secret";
};

const getEncryptionKey = () => {
  return crypto.createHash("sha256").update(getMessageSecret()).digest();
};

const encryptField = (value) => {
  if (!value || typeof value !== "string") return value;
  if (value.startsWith(`${ENCRYPTION_PREFIX}:`)) return value;

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return [
    ENCRYPTION_PREFIX,
    iv.toString("base64"),
    authTag.toString("base64"),
    encrypted.toString("base64"),
  ].join(":");
};

const decryptField = (value) => {
  if (!value || typeof value !== "string") return value;
  if (!value.startsWith(`${ENCRYPTION_PREFIX}:`)) return value;

  try {
    const [, , ivText, authTagText, encryptedText] = value.split(":");
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      getEncryptionKey(),
      Buffer.from(ivText, "base64")
    );

    decipher.setAuthTag(Buffer.from(authTagText, "base64"));

    return Buffer.concat([
      decipher.update(Buffer.from(encryptedText, "base64")),
      decipher.final(),
    ]).toString("utf8");
  } catch (err) {
    console.log("Message decrypt error:", err.message);
    return "";
  }
};

const encryptMessagePayload = (payload) => ({
  ...payload,
  text: encryptField(payload.text),
  audioData: encryptField(payload.audioData),
  mediaData: encryptField(payload.mediaData),
  mediaName: encryptField(payload.mediaName),
});

const decryptMessagePayload = (message) => {
  const messageObject =
    typeof message.toObject === "function" ? message.toObject() : { ...message };

  return {
    ...messageObject,
    text: decryptField(messageObject.text),
    audioData: decryptField(messageObject.audioData),
    mediaData: decryptField(messageObject.mediaData),
    mediaName: decryptField(messageObject.mediaName),
  };
};

module.exports = {
  encryptMessagePayload,
  decryptMessagePayload,
};
