const sessions = new Map();

function getSession(userId) {
  if (!sessions.has(userId)) {
    sessions.set(userId, {
      state: 'idle',
      uploadSettings: {
        expiry: 7,
        password: null,
        deleteAfter: 0
      },
      tempFile: null,
      tempText: null,
      tempTitle: null,
      tempPassword: null
    });
  }
  return sessions.get(userId);
}

function clearSession(userId) {
  const session = getSession(userId);
  session.state = 'idle';
  session.tempFile = null;
  session.tempText = null;
  session.tempTitle = null;
  session.tempPassword = null;
  session.uploadSettings = {
    expiry: 7,
    password: null,
    deleteAfter: 0
  };
}

function setState(userId, state) {
  const session = getSession(userId);
  session.state = state;
}

function getState(userId) {
  const session = getSession(userId);
  return session.state;
}

module.exports = {
  getSession,
  clearSession,
  setState,
  getState
};