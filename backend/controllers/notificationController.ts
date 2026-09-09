import { Response } from 'express';
import { db } from '../config/db.js';
import { AuthRequest } from '../middleware/auth.js';

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const notifs = db
      .getNotifications()
      .filter((n) => n.userId === req.user?._id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const unreadCount = notifs.filter((n) => !n.read).length;

    res.json({ notifications: notifs, unreadCount });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch notifications' });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const notif = db.getNotifications().find((n) => n._id === id && n.userId === req.user?._id);

    if (notif) {
      notif.read = true;
      db.commit();
    }

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update notification' });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    db.getNotifications()
      .filter((n) => n.userId === req.user?._id)
      .forEach((n) => {
        n.read = true;
      });

    db.commit();

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to mark all as read' });
  }
};
