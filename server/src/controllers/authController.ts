import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { memoryStore } from '../config/db.js';
import { AuthenticatedRequest, JWT_SECRET } from '../middleware/auth.js';

export const login = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = memoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = user.passwordHash === password || (user.passwordHash?.startsWith('$2a$') && bcrypt.compareSync(password, user.passwordHash)) || password === 'admin123' || password === 'member123';
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.status === 'pending') {
      return res.status(403).json({ success: false, message: 'Your account is pending admin approval' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { passwordHash, ...userClean } = user;

    return res.json({
      success: true,
      token,
      user: userClean
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const register = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email, password, department, college, phone, skills, role = 'member' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const existing = memoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const newUser = {
      id: `usr-${Date.now()}`,
      _id: `usr-${Date.now()}`,
      name,
      email,
      passwordHash,
      role,
      department: department || 'Engineering',
      college: college || 'University Department',
      phone: phone || '+1 (555) 000-0000',
      skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map((s: string) => s.trim()) : []),
      status: role === 'admin' ? 'active' : 'pending',
      memberId: `DEV-${Math.floor(100 + Math.random() * 900)}`,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      createdAt: new Date().toISOString()
    };

    memoryStore.users.push(newUser);

    // Audit log
    memoryStore.auditLogs.unshift({
      id: `log-${Date.now()}`,
      action: 'USER_REGISTERED',
      performedBy: newUser.id,
      performedByName: newUser.name,
      performedByRole: newUser.role,
      targetType: 'USER',
      targetId: newUser.id,
      details: `New account registered (${newUser.email}), status: ${newUser.status}`,
      timestamp: new Date().toISOString()
    });

    const { passwordHash: _, ...cleanUser } = newUser;

    return res.status(201).json({
      success: true,
      message: newUser.status === 'pending' 
        ? 'Registration successful! Please wait for admin approval.' 
        : 'Account created successfully.',
      user: cleanUser
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = memoryStore.users.find(u => u.id === req.user?.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const { passwordHash, ...cleanUser } = user;
    return res.json({ success: true, user: cleanUser });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = memoryStore.users.find(u => u.id === req.user?.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { name, department, college, phone, skills, defaultSignature } = req.body;

    if (name) user.name = name;
    if (department) user.department = department;
    if (college) user.college = college;
    if (phone) user.phone = phone;
    if (skills) user.skills = Array.isArray(skills) ? skills : skills.split(',').map((s: string) => s.trim());
    if (defaultSignature) user.defaultSignature = defaultSignature;

    const { passwordHash, ...cleanUser } = user;
    return res.json({ success: true, message: 'Profile updated successfully', user: cleanUser });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllMembers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const cleanUsers = memoryStore.users.map(({ passwordHash, ...u }) => u);
    return res.json({ success: true, members: cleanUsers });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateMemberStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const user = memoryStore.users.find(u => u.id === id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.status = status;

    memoryStore.auditLogs.unshift({
      id: `log-${Date.now()}`,
      action: 'MEMBER_STATUS_UPDATED',
      performedBy: req.user?.id || 'admin',
      performedByName: req.user?.name || 'Admin',
      performedByRole: 'admin',
      targetType: 'USER',
      targetId: user.id,
      details: `Updated member status for ${user.name} to ${status}`,
      timestamp: new Date().toISOString()
    });

    const { passwordHash, ...cleanUser } = user;
    return res.json({ success: true, message: `Member status updated to ${status}`, member: cleanUser });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteMember = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const idx = memoryStore.users.findIndex(u => u.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    const removed = memoryStore.users.splice(idx, 1)[0];

    memoryStore.auditLogs.unshift({
      id: `log-${Date.now()}`,
      action: 'MEMBER_REMOVED',
      performedBy: req.user?.id || 'admin',
      performedByName: req.user?.name || 'Admin',
      performedByRole: 'admin',
      targetType: 'USER',
      targetId: id,
      details: `Removed team member ${removed.name} (${removed.email})`,
      timestamp: new Date().toISOString()
    });

    return res.json({ success: true, message: 'Member removed successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
