const sessions = new Map();
const SESSION_TIMEOUT = 1800000; // 30 minutes

exports.createSession = (userId, data) => {
  const session = {
    userId: userId,
    data: data,
    createdAt: Date.now(),
    lastActivity: Date.now()
  };
  sessions.set(userId, session);
  return session;
};

exports.getSession = (userId) => {
  const session = sessions.get(userId);
  if (!session) return null;
  
  if (Date.now() - session.lastActivity > SESSION_TIMEOUT) {
    sessions.delete(userId);
    return null;
  }
  
  session.lastActivity = Date.now();
  return session;
};

exports.updateSession = (userId, data) => {
  const session = sessions.get(userId);
  if (session) {
    session.data = { ...session.data, ...data };
    session.lastActivity = Date.now();
  }
  return session;
};

exports.deleteSession = (userId) => {
  sessions.delete(userId);
};
