module.exports = {
  welcome: {
    title: '👋 Welcome to SecureFileShare Bot!',
    description: '🔒 Secure file sharing with E2E encryption\n✨ Anonymous • No Registration • Open Source',
    instruction: '\n📤 Send a file or use buttons below'
  },

  help: {
    title: '📖 Help',
    content: `<b>How to use the bot:</b>

1️⃣ Send a file or text
2️⃣ Configure settings (optional)
3️⃣ Get download link

<b>Features:</b>
• Maximum file size: 1 GB
• Maximum text size: 2 MB
• Auto-delete by time or downloads
• Password protection
• Links work in both bot and website`
  },

  buttons: {
    uploadFile: '📁 Upload file',
    uploadText: '📝 Upload text',
    download: '⬇️ Download file',
    settings: '⚙️ Settings',
    help: '❓ Help',
    language: '🌐 Language',
    back: '« Back',
    mainMenu: '🏠 Main menu',
    cancel: '✖️ Cancel',
    confirm: '✓ Confirm',
    yes: 'Yes',
    no: 'No',
    skip: 'Skip',
    copyLink: '📋 Copy link',
    info: 'ℹ️ Info',
    generatePassword: '🔐 Generate password'
  },

  uploadSettings: {
    configure: '⚙️ <b>Upload Settings</b>\n\nConfigure parameters for your file:',
    configureText: '⚙️ <b>Upload Settings</b>\n\nConfigure parameters for your text:',
    expiry: '📅 Expiration',
    password: '🔒 Password',
    deleteAfter: '🗑 Auto-delete',
    days: ['1 day', '3 days', '7 days', '14 days', '30 days'],
    daysValues: [1, 3, 7, 14, 30],
    downloads: ['Never', '1', '3', '5', '10', '25', '50', '100'],
    downloadsValues: [0, 1, 3, 5, 10, 25, 50, 100],
    currentSettings: `<b>Current settings:</b>
📅 Expiry: {expiry}
🔒 Password: {password}
🗑 Delete after: {deleteAfter}`
  },

  upload: {
    sendFile: '📁 Send a file to upload\n\nMaximum size: 1 GB',
    askTitle: '📝 Send a title for the text\n\nOr press "Skip" if no title needed',
    sendText: '📝 Send text as a message\n\nMaximum size: 2 MB',
    processing: '⏳ Processing file...',
    uploading: '⬆️ Uploading to server...',
    setPassword: '🔒 Set password to protect the file?',
    enterPassword: '🔒 Enter password to protect the file:\n\n💡 Send any message or generate a random password',
    passwordSet: '✅ Password set',
    passwordGenerated: 'Password generated!',
    noPassword: 'No password',
    success: '✅ <b>File uploaded successfully!</b>',
    successText: '✅ <b>Text uploaded successfully!</b>',
    successInfo: `
📄 <b>File:</b> {filename}
📦 <b>Size:</b> {size}
📅 <b>Expires:</b> {expiry}
🔒 <b>Password:</b> {password}
🗑 <b>Delete after:</b> {deleteAfter}

🔗 <b>Your link:</b>
{link}

💡 Link works in both bot and website!`,
    successInfoText: `
📅 <b>Expires:</b> {expiry}
🔒 <b>Password:</b> {password}
🗑 <b>Delete after:</b> {deleteAfter}

🔗 <b>Your link:</b>
{link}

💡 Link works in both bot and website!`,
    failed: '❌ Failed to upload file\n\nPlease try again or contact support.',
    failedText: '❌ Failed to upload text\n\nPlease try again or contact support.',
    cancelled: '✖️ Upload cancelled',
    copied: '✅ Link copied to clipboard!'
  },

  download: {
    enterLink: '🔗 Send link or file ID to download\n\n💡 Examples:\n• https://securesfileshare.su/abc123\n• abc123',
    processing: '⏳ Getting file information...',
    fileInfo: `📄 <b>File Information</b>

📁 <b>Name:</b> {filename}
📦 <b>Size:</b> {size}
⏰ <b>Expires in:</b> {timeRemaining}
⬇️ <b>Downloads left:</b> {remainingDownloads}`,
    textInfo: `📄 <b>Text Information</b>

⏰ <b>Expires in:</b> {timeRemaining}
⬇️ <b>Downloads left:</b> {remainingDownloads}`,
    requiresPassword: '🔒 <b>File is password protected</b>\n\nEnter password to download:',
    downloading: '⬇️ Downloading file...',
    success: '✅ File ready!',
    expiresIn: 'Expires in',
    downloadsLeft: 'Downloads left',
    remainingDownloads: 'Remaining downloads',
    notFound: '❌ File not found\n\nLink may be invalid or file was deleted.',
    expired: '⏰ File has expired\n\nFile was automatically deleted.',
    incorrectPassword: '🔒 Wrong password\n\nPlease try again.',
    invalidLink: '❌ Invalid link or ID\n\nPlease check your input.',
    cancelled: '✖️ Download cancelled'
  },

  settings: {
    title: '⚙️ <b>Settings</b>',
    language: '🌐 Interface language',
    currentLanguage: 'Current language: English 🇬🇧',
    languageChanged: '✅ Language changed to English',
    defaults: '📋 Default parameters',
    defaultsInfo: `<b>Default upload parameters:</b>

📅 Expiry: {expiry}
🔒 Password: {password}
🗑 Delete after: {deleteAfter}

These parameters will be used for new uploads.`
  },
  
  errors: {
    fileTooLarge: '❌ File too large\n\nMaximum size: 1 GB',
    textTooLarge: '❌ Text too large\n\nMaximum size: 2 MB',
    invalidFormat: '❌ Invalid data format',
    networkError: '❌ Network error\n\nCheck your connection and try again later.',
    serverError: '❌ Server error\n\nPlease try later or contact support.',
    rateLimited: '⏱ Too many requests\n\nWait a moment and try again.',
    sessionExpired: '⏰ Session expired\n\nStart over with /start',
    unknown: '❌ Unknown error occurred\n\nPlease try again.',
    fileTypeBlocked: '🚫 This file type is blocked for security reasons.'
  },

  common: {
    loading: '⏳ Loading...',
    pleaseWait: '⏳ Please wait...',
    done: '✅ Done',
    cancelled: '✖️ Cancelled',
    yes: 'Yes',
    no: 'No',
    protected: 'Protected',
    notProtected: 'No',
    never: 'Never',
    downloads: 'downloads',
    tapToCopy: 'Tap the password to copy it',
    link: 'Your link',
    expiryDate: 'Expires',
    filename: 'File',
    size: 'Size',
    password: 'Password',
    deleteAfter: 'Delete after',
    linkWorksEverywhere: '💡 Link works in both bot and website!'
  },

  p2p: {
    title: '⚡ Direct Transfer',
    description: 'Send files directly without server storage.\n\n🌐 Use web interface:\n',
    webLink: 'Open P2P Transfer',
    howTo: '\n\n📝 How to use:\n1. Open link above\n2. Choose Send or Receive\n3. Share code with recipient\n4. Transfer starts automatically\n\n✨ Features:\n• No server storage\n• End-to-end encryption\n• Real-time progress\n• Fast direct transfer'
  }
};