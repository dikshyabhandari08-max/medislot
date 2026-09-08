const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router();

// simple auth middleware
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.userId = decoded.id;
    next();
  });
}

// BOOK an appointment
router.post('/', verifyToken, (req, res) => {
  const { doctor_id, appointment_date, appointment_time } = req.body;

  db.query(
    'INSERT INTO appointments (user_id, doctor_id, appointment_date, appointment_time) VALUES (?, ?, ?, ?)',
    [req.userId, doctor_id, appointment_date, appointment_time],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Appointment booked successfully', id: result.insertId });
    }
  );
});

// GET my appointments
router.get('/my', verifyToken, (req, res) => {
  const query = `
    SELECT appointments.*, doctors.name AS doctor_name, doctors.speciality, doctors.image
    FROM appointments
    JOIN doctors ON appointments.doctor_id = doctors.id
    WHERE appointments.user_id = ?
  `;
  db.query(query, [req.userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// CANCEL an appointment
router.delete('/:id', verifyToken, (req, res) => {
  db.query(
    'DELETE FROM appointments WHERE id = ? AND user_id = ?',
    [req.params.id, req.userId],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Appointment cancelled' });
    }
  );
});

module.exports = router;