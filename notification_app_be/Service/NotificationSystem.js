class NotificationSystem {
  constructor() {
    this.notifications = [];
    this.users = [];
  }

  async send(input) {
    let items = input;
    if (!Array.isArray(items)) {
      items = [items];
    }

    const inserted = [];

    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      const userId = item.userId;
      const type = item.type;
      const title = item.title;
      const message = item.message;
      const email = item.email;
      const name = item.name;

      if (!userId || !type || !title || !message) {
        throw new Error('userId, type, title and message are required');
      }

      let userExists = false;
      for (let j = 0; j < this.users.length; j += 1) {
        if (this.users[j].id === userId) {
          this.users[j].email = email || userId + '@example.com';
          this.users[j].name = name || userId;
          userExists = true;
          break;
        }
      }

      if (!userExists) {
        this.users.push({
          id: userId,
          email: email || userId + '@example.com',
          name: name || userId,
        });
      }

      const notification = {
        id: Date.now().toString() + '-' + Math.floor(Math.random() * 10000),
        userId: userId,
        type: type,
        title: title,
        message: message,
        isRead: false,
        createdAt: new Date().toISOString(),
      };

      this.notifications.push(notification);
      inserted.push(notification);
    }

    return inserted;
  }

  async getUnread(userId) {
    if (!userId) {
      throw new Error('userId required');
    }

    const out = [];
    for (let i = 0; i < this.notifications.length; i += 1) {
      const notification = this.notifications[i];
      if (notification.userId === userId && notification.isRead === false) {
        out.push(notification);
      }
    }

    out.sort((a, b) => {
      if (a.createdAt < b.createdAt) {
        return 1;
      }
      if (a.createdAt > b.createdAt) {
        return -1;
      }
      return 0;
    });

    return out;
  }

  async markRead(id) {
    for (let i = 0; i < this.notifications.length; i += 1) {
      if (this.notifications[i].id === id) {
        this.notifications[i].isRead = true;
        return this.notifications[i];
      }
    }

    throw new Error('notification not found');
  }

  async getRecent(limit = 20) {
    const all = [];
    for (let i = 0; i < this.notifications.length; i += 1) {
      all.push(this.notifications[i]);
    }

    all.sort((a, b) => {
      if (a.createdAt < b.createdAt) {
        return 1;
      }
      if (a.createdAt > b.createdAt) {
        return -1;
      }
      return 0;
    });

    let safeLimit = Number(limit);
    if (Number.isNaN(safeLimit) || safeLimit < 1) {
      safeLimit = 1;
    }
    if (safeLimit > 100) {
      safeLimit = 100;
    }

    return all.slice(0, safeLimit);
  }

  async getAnalytics(type) {
    const groups = [];

    for (let i = 0; i < this.notifications.length; i += 1) {
      const notification = this.notifications[i];

      if (type && notification.type !== type) {
        continue;
      }

      let group = null;
      for (let j = 0; j < groups.length; j += 1) {
        if (groups[j].type === notification.type) {
          group = groups[j];
          break;
        }
      }

      if (!group) {
        group = {
          type: notification.type,
          total: 0,
          unread: 0,
          latest: null,
        };
        groups.push(group);
      }

      group.total += 1;

      if (notification.isRead === false) {
        group.unread += 1;
      }

      if (!group.latest || group.latest < notification.createdAt) {
        group.latest = notification.createdAt;
      }
    }

    return groups;
  }
}

module.exports = new NotificationSystem();
