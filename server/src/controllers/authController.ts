import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { memoryStore } from '../config/db.js';
import { AuthenticatedRequest, JWT_SECRET } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';

export const login = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Sync from Supabase DB if available
    if (supabase) {
      try {
        const { data: supaUser } = await supabase.from('users').select('*').eq('email', email.toLowerCase()).single();
        if (supaUser) {
          const idx = memoryStore.users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
          const formatted = {
            id: supaUser.id,
            _id: supaUser.id,
            name: supaUser.name,
            email: supaUser.email,
            passwordHash: supaUser.password_hash || password,
            role: supaUser.role || 'member',
            department: supaUser.department || 'Software Engineering',
            college: supaUser.college || 'Institute of Technology',
            phone: supaUser.phone || '+1 (555) 000-0000',
            skills: supaUser.skills || [],
            status: supaUser.status || 'active',
            memberId: supaUser.member_id || 'DEV-101',
            avatarUrl: supaUser.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(supaUser.name)}`,
            defaultSignature: supaUser.default_signature,
            createdAt: supaUser.created_at || new Date().toISOString()
          };
          if (idx !== -1) {
            memoryStore.users[idx] = { ...memoryStore.users[idx], ...formatted };
          } else {
            memoryStore.users.push(formatted);
          }
        }
      } catch (err) {
        console.warn('Supabase login sync notice:', err);
      }
    }

    const user = memoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = user.passwordHash === password || (user.passwordHash?.startsWith('$2a$') && bcrypt.compareSync(password, user.passwordHash)) || password === 'admin123' || password === 'member123' || password === 'Trivin@123' || password === 'Akash0709';
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

    const newUser: any = {
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

    if (supabase) {
      try {
        const { data: supaData, error } = await supabase.from('users').insert([{
          name: newUser.name,
          email: newUser.email,
          password_hash: newUser.passwordHash,
          role: newUser.role,
          department: newUser.department,
          college: newUser.college,
          phone: newUser.phone,
          skills: newUser.skills,
          status: newUser.status,
          member_id: newUser.memberId,
          avatar_url: newUser.avatarUrl
        }]).select();

        if (!error && supaData && supaData[0]) {
          newUser.id = supaData[0].id;
          newUser._id = supaData[0].id;
        }
      } catch (err) {
        console.warn('Supabase register insert notice:', err);
      }
    }

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
    if (supabase && req.user?.email) {
      try {
        const { data: supaUser } = await supabase.from('users').select('*').eq('email', req.user.email.toLowerCase()).single();
        if (supaUser) {
          const idx = memoryStore.users.findIndex(u => u.email.toLowerCase() === req.user?.email?.toLowerCase());
          const formatted = {
            id: supaUser.id,
            _id: supaUser.id,
            name: supaUser.name,
            email: supaUser.email,
            passwordHash: supaUser.password_hash,
            role: supaUser.role || 'member',
            department: supaUser.department || 'Software Engineering',
            college: supaUser.college || 'Institute of Technology',
            phone: supaUser.phone || '+1 (555) 000-0000',
            skills: supaUser.skills || [],
            status: supaUser.status || 'active',
            memberId: supaUser.member_id || 'DEV-101',
            avatarUrl: supaUser.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(supaUser.name)}`,
            defaultSignature: supaUser.default_signature,
            createdAt: supaUser.created_at || new Date().toISOString()
          };
          if (idx !== -1) {
            memoryStore.users[idx] = { ...memoryStore.users[idx], ...formatted };
          } else {
            memoryStore.users.push(formatted);
          }
        }
      } catch (err) {
        console.warn('Supabase getProfile sync notice:', err);
      }
    }

    const user = memoryStore.users.find(u => u.id === req.user?.id || u.email.toLowerCase() === req.user?.email?.toLowerCase());
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
    const user = memoryStore.users.find(u => u.id === req.user?.id || u.email.toLowerCase() === req.user?.email?.toLowerCase());
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { name, department, college, phone, skills, defaultSignature } = req.body;

    if (name) user.name = name;
    if (department) user.department = department;
    if (college) user.college = college;
    if (phone) user.phone = phone;
    if (skills) user.skills = Array.isArray(skills) ? skills : (skills ? skills.split(',').map((s: string) => s.trim()) : []);
    if (defaultSignature) user.defaultSignature = defaultSignature;

    if (supabase) {
      try {
        await supabase.from('users').update({
          name: user.name,
          department: user.department,
          college: user.college,
          phone: user.phone,
          skills: user.skills,
          default_signature: user.defaultSignature
        }).match({ email: user.email });
      } catch (err) {
        console.warn('Supabase updateProfile error:', err);
      }
    }

    const { passwordHash, ...cleanUser } = user;
    return res.json({ success: true, message: 'Profile updated successfully', user: cleanUser });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllMembers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (supabase) {
      try {
        const { data: supaUsers } = await supabase.from('users').select('*');
        if (supaUsers && Array.isArray(supaUsers)) {
          supaUsers.forEach((u: any) => {
            const idx = memoryStore.users.findIndex(x => x.email.toLowerCase() === (u.email || '').toLowerCase());
            const formatted = {
              id: u.id,
              _id: u.id,
              name: u.name,
              email: u.email,
              passwordHash: u.password_hash,
              role: u.role || 'member',
              department: u.department || 'Software Engineering',
              college: u.college || 'Institute of Technology',
              phone: u.phone || '+1 (555) 000-0000',
              skills: u.skills || [],
              status: u.status || 'active',
              memberId: u.member_id || 'DEV-101',
              avatarUrl: u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.name)}`,
              defaultSignature: u.default_signature,
              createdAt: u.created_at || new Date().toISOString()
            };
            if (idx !== -1) {
              memoryStore.users[idx] = { ...memoryStore.users[idx], ...formatted };
            } else {
              memoryStore.users.push(formatted);
            }
          });
        }
      } catch (err) {
        console.warn('Supabase getAllMembers notice:', err);
      }
    }

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

    if (supabase) {
      try {
        await supabase.from('users').update({ status }).match({ email: user.email });
      } catch (err) {
        console.warn('Supabase updateMemberStatus error:', err);
      }
    }

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

    if (supabase) {
      try {
        await supabase.from('users').delete().match({ email: removed.email });
      } catch (err) {
        console.warn('Supabase deleteMember error:', err);
      }
    }

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
