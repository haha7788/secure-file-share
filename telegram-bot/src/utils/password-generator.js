const crypto = require('crypto');

function generatePassword(length = 16, options = {}) {
  const {
    includeUppercase = true,
    includeLowercase = true,
    includeNumbers = true,
    includeSymbols = true
  } = options;

  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*-_=+';

  let charset = '';
  let password = '';

  if (includeLowercase) charset += lowercase;
  if (includeUppercase) charset += uppercase;
  if (includeNumbers) charset += numbers;
  if (includeSymbols) charset += symbols;

  if (charset.length === 0) {
    charset = lowercase + uppercase + numbers;
  }

  const categories = [];
  if (includeLowercase) categories.push(lowercase);
  if (includeUppercase) categories.push(uppercase);
  if (includeNumbers) categories.push(numbers);
  if (includeSymbols) categories.push(symbols);

  for (const category of categories) {
    const randomIndex = crypto.randomBytes(1)[0] % category.length;
    password += category[randomIndex];
  }

  const remainingLength = length - password.length;
  const bytes = crypto.randomBytes(remainingLength);
  
  for (let i = 0; i < remainingLength; i++) {
    password += charset[bytes[i] % charset.length];
  }

  password = password.split('').sort(() => crypto.randomBytes(1)[0] - 128).join('');

  return password;
}

module.exports = { generatePassword };