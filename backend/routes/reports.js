const express = require('express');
const db = require('../db');
const router = express.Router();

// GET /api/reports/status-summary
// Returns: [{ status: 'pending', count: 5 }, { status: 'completed', count: 2 }, ...]
router.get('/status-summary', (req, res) => {
  db.query(
    `SELECT status, COUNT(*) AS count FROM appointments GROUP BY status`,
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

// GET /api/reports/doctor-summary
// Returns: [{ doctor_name: 'Dr. Sarah Sharma', count: 3 }, ...]
router.get('/doctor-summary', (req, res) => {
  db.query(
    `SELECT d.name AS doctor_name, COUNT(a.id) AS count
     FROM doctors d
     LEFT JOIN appointments a ON a.doctor_id = d.id
     GROUP BY d.id, d.name`,
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});
// GET /api/reports/monthly
// Returns: [{ month: '2026-08', count: 4 }, { month: '2026-09', count: 7 }, ...]
router.get('/monthly', (req, res) => {
  db.query(
    `SELECT DATE_FORMAT(appointment_date, '%Y-%m') AS month, COUNT(*) AS count
     FROM appointments
     GROUP BY month
     ORDER BY month`,
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});
module.exports = router;