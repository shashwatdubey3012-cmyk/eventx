import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../config/db.js';
import { IUser } from '../models/index.js';
import { AuthRequest, generateToken } from '../middleware/auth.js';

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone, role = 'user', city } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required' });
      return;
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const existing = db.getUsers().find((u) => u.email.toLowerCase() === cleanEmail);

    if (existing) {
      res.status(409).json({ error: 'An account with this email address already exists' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long' });
      return;
    }

    const validRole = role === 'organizer' ? 'organizer' : 'user';
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const newUser: IUser = {
      _id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
      phone: phone ? phone.trim() : '',
      role: validRole,
      city: city ? city.trim() : 'San Francisco, CA',
      status: 'active',
      profileImage: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80`,
      createdAt: new Date().toISOString(),
    };

    db.getUsers().push(newUser);

    // Welcome notification
    db.getNotifications().push({
      _id: `notif_${Date.now()}`,
      userId: newUser._id,
      title: 'Welcome to EventX!',
      message: `Welcome ${newUser.name}! Discover upcoming events, book passes, and experience vibrant community gatherings.`,
      read: false,
      createdAt: new Date().toISOString(),
    });

    db.commit();

    const token = generateToken(newUser);
    const { passwordHash: _, ...safeUser } = newUser;

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: safeUser,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Registration failed' });
  }
};

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const user = db.getUsers().find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    if (user.status === 'suspended') {
      res.status(403).json({ error: 'This account is suspended. Please contact administrator support.' });
      return;
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = generateToken(user);
    const { passwordHash: _, ...safeUser } = user;

    res.json({
      message: 'Login successful',
      token,
      user: safeUser,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Login failed' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const { passwordHash: _, ...safeUser } = req.user;
  res.json({ user: safeUser });
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { name, phone, city, profileImage } = req.body;
  const user = db.getUsers().find((u) => u._id === req.user?._id);

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  if (name) user.name = name.trim();
  if (phone !== undefined) user.phone = phone.trim();
  if (city !== undefined) user.city = city.trim();
  if (profileImage) user.profileImage = profileImage;

  db.commit();

  const { passwordHash: _, ...safeUser } = user;
  res.json({
    message: 'Profile updated successfully',
    user: safeUser,
  });
};
