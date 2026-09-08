const express = require('express');
const db = require('../db');
const router = express.Router();

// GET all doctors
router.get('/', (req, res) => {
  db.query('SELECT * FROM doctors', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// GET single doctor by id
router.get('/:id', (req, res) => {
  db.query('SELECT * FROM doctors WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Doctor not found' });
    res.json(results[0]);
  });
});

module.exports = router;