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

  // check if this doctor already has a non-cancelled appointment at this exact date+time
  db.query(
    `SELECT * FROM appointments 
     WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ? AND status != 'cancelled'`,
    [doctor_id, appointment_date, appointment_time],
    (err, existing) => {
      if (err) return res.status(500).json({ error: err.message });

      if (existing.length > 0) {
        return res.status(409).json({ error: 'This time slot is already booked. Please choose a different time.' });
      }

      db.query(
        'INSERT INTO appointments (user_id, doctor_id, appointment_date, appointment_time) VALUES (?, ?, ?, ?)',
        [req.userId, doctor_id, appointment_date, appointment_time],
        (err, result) => {
          if (err) return res.status(500).json({ error: err.message });
          res.status(201).json({ message: 'Appointment booked successfully', id: result.insertId });
        }
      );
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
// doctor-only auth middleware
function verifyDoctorToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    if (decoded.role !== 'doctor') return res.status(403).json({ error: 'Doctor access only' });
    req.doctorId = decoded.id;
    next();
  });
}

// GET doctor's appointments
router.get('/doctor', verifyDoctorToken, (req, res) => {
  const query = `
    SELECT appointments.*, users.name AS patient_name, users.email AS patient_email
    FROM appointments
    JOIN users ON appointments.user_id = users.id
    WHERE appointments.doctor_id = ?
    ORDER BY appointments.appointment_date, appointments.appointment_time
  `;
  db.query(query, [req.doctorId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// UPDATE appointment status (doctor marks completed/cancelled)
router.patch('/:id/status', verifyDoctorToken, (req, res) => {
  const { status } = req.body;
  const validStatuses = ['completed', 'cancelled', 'pending'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  db.query(
    'UPDATE appointments SET status = ? WHERE id = ? AND doctor_id = ?',
    [status, req.params.id, req.doctorId],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Appointment not found' });
      }
      res.json({ message: `Appointment marked as ${status}` });
    }
  );
});
// SIMULATE PAYMENT (mock — no real payment gateway)
router.patch('/:id/pay', verifyToken, (req, res) => {
  db.query(
    'SELECT * FROM appointments WHERE id = ? AND user_id = ?',
    [req.params.id, req.userId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0) return res.status(404).json({ error: 'Appointment not found' });

      db.query(
        "UPDATE appointments SET payment_status = 'paid' WHERE id = ? AND user_id = ?",
        [req.params.id, req.userId],
        (err) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ message: 'Payment successful (simulated)', payment_status: 'paid' });
        }
      );
    }
  );
});
module.exports = router;
