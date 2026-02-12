const { app, initDirs } = require('./src/app');
const { PORT } = require('./src/config');
const { startCleanupScheduler } = require('./src/services');
const websocketService = require('./src/services/websocketService');

initDirs().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`✅ SecureFileShare Server started on port ${PORT}`);
    console.log('');

    websocketService.initialize(server);

    startCleanupScheduler();
  });
}).catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});