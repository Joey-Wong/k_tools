const crypto = require("crypto");

// 将任意字符串转换为 32 字节（256 位）的密钥
function getKeyFromString(keyString) {
  const hash = crypto.createHash("sha256");
  hash.update(keyString);
  return hash.digest();
}

// 加密函数
function encrypt(plaintext, key) {
  // 生成一个 16 字节的随机初始化向量（IV），AES - CBC 要求 IV 长度为 16 字节
  const iv = crypto.randomBytes(16);
  // 创建一个 AES - 256 - CBC 加密器
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  // 更新加密器，将明文以 UTF - 8 编码输入，输出为十六进制字符串
  let encrypted = cipher.update(plaintext, "utf8", "hex");
  // 完成加密操作并追加到结果中
  encrypted += cipher.final("hex");
  // 返回 IV 和加密结果，用冒号分隔
  return iv.toString("hex") + ":" + encrypted;
}

// 解密函数
function decrypt(ciphertext, key) {
  // 从密文中分割出 IV 和加密数据
  const parts = ciphertext.split(":");
  const iv = Buffer.from(parts.shift(), "hex");
  const encryptedText = Buffer.from(parts.join(":"), "hex");
  // 创建一个 AES - 256 - CBC 解密器
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  // 更新解密器，将加密数据以十六进制输入，输出为 UTF - 8 字符串
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  // 完成解密操作并追加到结果中
  decrypted += decipher.final("utf8");
  return decrypted;
}

export { decrypt, getKeyFromString, encrypt };
