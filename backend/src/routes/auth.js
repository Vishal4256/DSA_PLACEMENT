const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { getDbState } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'dsa_mastery_secret_key_123';
const dbFilePath = path.join(__dirname, '..', 'database.json');

// --- JSON FILE DATABASE HELPERS FOR ZERO-SETUP FALLBACK ---
const getJsonUsers = () => {
  if (!fs.existsSync(dbFilePath)) {
    fs.writeFileSync(dbFilePath, JSON.stringify([]));
  }
  try {
    return JSON.parse(fs.readFileSync(dbFilePath, 'utf8'));
  } catch (err) {
    return [];
  }
};

const saveJsonUsers = (users) => {
  fs.writeFileSync(dbFilePath, JSON.stringify(users, null, 2));
};
// ----------------------------------------------------------

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const useMongo = getDbState();

    if (useMongo) {
      // --- MongoDB Flow ---
      let user = await User.findOne({ email: email.toLowerCase() });
      if (user) return res.status(400).json({ msg: 'Email is already registered' });

      user = await User.findOne({ username });
      if (user) return res.status(400).json({ msg: 'Username is already taken' });

      user = new User({ username, email, password });
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();

      const payload = { user: { id: user.id } };
      jwt.sign(payload, JWT_SECRET, { expiresIn: 360000 }, (err, token) => {
        if (err) throw err;
        res.json({ token, user: { id: user.id, username: user.username, email: user.email, completedProblems: {} } });
      });
    } else {
      // --- JSON File Fallback Flow ---
      const users = getJsonUsers();
      const emailLower = email.toLowerCase();

      if (users.find(u => u.email === emailLower)) {
        return res.status(400).json({ msg: 'Email is already registered' });
      }
      if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
        return res.status(400).json({ msg: 'Username is already taken' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const userId = Date.now().toString();
      const newUser = {
        id: userId,
        _id: userId,
        username,
        email: emailLower,
        password: hashedPassword,
        completedProblems: {}
      };

      users.push(newUser);
      saveJsonUsers(users);

      const payload = { user: { id: userId } };
      jwt.sign(payload, JWT_SECRET, { expiresIn: 360000 }, (err, token) => {
        if (err) throw err;
        res.json({ token, user: { id: userId, username, email: emailLower, completedProblems: {} } });
      });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const useMongo = getDbState();
    const emailLower = email.toLowerCase();

    if (useMongo) {
      let user = await User.findOne({ email: emailLower });
      if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

      const payload = { user: { id: user.id } };
      jwt.sign(payload, JWT_SECRET, { expiresIn: 360000 }, (err, token) => {
        if (err) throw err;
        res.json({ token, user: { id: user.id, username: user.username, email: user.email, completedProblems: user.completedProblems } });
      });
    } else {
      const users = getJsonUsers();
      const user = users.find(u => u.email === emailLower);
      if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

      const payload = { user: { id: user.id } };
      jwt.sign(payload, JWT_SECRET, { expiresIn: 360000 }, (err, token) => {
        if (err) throw err;
        res.json({ token, user: { id: user.id, username: user.username, email: user.email, completedProblems: user.completedProblems } });
      });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/auth/me
// @desc    Get current user details
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const useMongo = getDbState();

    if (useMongo) {
      const user = await User.findById(req.user.id).select('-password');
      res.json(user);
    } else {
      const users = getJsonUsers();
      const user = users.find(u => u.id === req.user.id);
      if (!user) return res.status(404).json({ msg: 'User not found' });
      
      const { password, ...safeUser } = user;
      res.json(safeUser);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/forgot-password
// @desc    Request password recovery token
// @access  Public
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const useMongo = getDbState();
    const emailLower = email.toLowerCase();
    const token = crypto.randomBytes(20).toString('hex');
    const resetUrl = `http://localhost:5175/reset-password/${token}`;

    if (useMongo) {
      const user = await User.findOne({ email: emailLower });
      if (!user) return res.status(400).json({ msg: 'No user registered with this email address' });

      user.resetPasswordToken = token;
      user.resetPasswordExpires = Date.now() + 3600000;
      await user.save();
    } else {
      const users = getJsonUsers();
      const userIndex = users.findIndex(u => u.email === emailLower);
      if (userIndex === -1) return res.status(400).json({ msg: 'No user registered with this email address' });

      users[userIndex].resetPasswordToken = token;
      users[userIndex].resetPasswordExpires = Date.now() + 3600000;
      saveJsonUsers(users);
    }

    console.log('\n======================================');
    console.log(`PASSWORD RESET SIMULATION FOR: ${emailLower}`);
    console.log(`RESET URL: ${resetUrl}`);
    console.log('======================================\n');

    res.json({
      msg: 'Recovery email simulated successfully.',
      token,
      resetUrl
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/reset-password
// @desc    Reset password using token
// @access  Public
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;

  try {
    const useMongo = getDbState();

    if (useMongo) {
      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
      });
      if (!user) return res.status(400).json({ msg: 'Password reset token is invalid or has expired' });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
    } else {
      const users = getJsonUsers();
      const userIndex = users.findIndex(u => u.resetPasswordToken === token && u.resetPasswordExpires > Date.now());
      if (userIndex === -1) return res.status(400).json({ msg: 'Password reset token is invalid or has expired' });

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      users[userIndex].password = hashedPassword;
      users[userIndex].resetPasswordToken = undefined;
      users[userIndex].resetPasswordExpires = undefined;
      saveJsonUsers(users);
    }

    res.json({ msg: 'Password reset successful. You can now log in.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/auth/progress
// @desc    Get user problem solving progress map
// @access  Private
router.get('/progress', auth, async (req, res) => {
  try {
    const useMongo = getDbState();

    if (useMongo) {
      const user = await User.findById(req.user.id);
      res.json(user.completedProblems || {});
    } else {
      const users = getJsonUsers();
      const user = users.find(u => u.id === req.user.id);
      if (!user) return res.status(404).json({ msg: 'User not found' });
      res.json(user.completedProblems || {});
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/progress
// @desc    Update/sync entire completed problems map
// @access  Private
router.post('/progress', auth, async (req, res) => {
  const { completedProblems } = req.body;

  try {
    const useMongo = getDbState();

    if (useMongo) {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ msg: 'User not found' });

      user.completedProblems = completedProblems || {};
      await user.save();
      res.json(user.completedProblems);
    } else {
      const users = getJsonUsers();
      const userIndex = users.findIndex(u => u.id === req.user.id);
      if (userIndex === -1) return res.status(404).json({ msg: 'User not found' });

      users[userIndex].completedProblems = completedProblems || {};
      saveJsonUsers(users);
      res.json(users[userIndex].completedProblems);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
