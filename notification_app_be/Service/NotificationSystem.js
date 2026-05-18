class NotificationSystem {
  constructor() {
    this.notifications = new Map();
    this.users = new Map();
  }
  async send(input) {
    const items = Array.isArray(input) ? input : [input];
    const inserted = [];

    for (const it of items) {
      const { userId, type, title, message, email, name } = it;
      if (!userId || !type || !title || !message) {
        throw new Error('userId, type, title and message are required');
      }
      this.users.set(userId, { id: userId, email: email || `${userId}@example.com`, name: name || userId });

      const id = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      const row = {
        id,
        userId,
        type,
        title,
        message,
        isRead: false,
        createdAt: new Date().toISOString(),
      };

      this.notifications.set(id, row);
      inserted.push(row);
    }

    return inserted;
  }

  async getUnread(userId) {
    if (!userId) throw new Error('userId required');
    const out = [];
    for (const n of this.notifications.values()) {
      if (n.userId === userId && n.isRead === false) out.push(n);
    }
    out.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    return out;
  }

  async markRead(id) {
    const n = this.notifications.get(id);
    if (!n) throw new Error('notification not found');
    n.isRead = true;
    this.notifications.set(id, n);
    return n;
  }

  async getRecent(limit = 20) {
    const all = Array.from(this.notifications.values());
    all.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    return all.slice(0, Math.max(1, Math.min(limit, 100)));
  }

  async getAnalytics(type) {
    const groups = {};
    for (const n of this.notifications.values()) {
      if (type && n.type !== type) continue;
      groups[n.type] = groups[n.type] || { type: n.type, total: 0, unread: 0, latest: null };
      groups[n.type].total += 1;
      if (!n.isRead) groups[n.type].unread += 1;
      if (!groups[n.type].latest || groups[n.type].latest < n.createdAt) groups[n.type].latest = n.createdAt;
    }
    return Object.values(groups);
  }
}

module.exports = new NotificationSystem();
