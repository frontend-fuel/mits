const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Metric = require('../models/Metric');

// Middleware to verify JWT
const auth = (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Please authenticate' });
    }
};

// Get latest metrics
router.get('/latest', auth, async (req, res) => {
    try {
        const metric = await Metric.findOne({ userId: req.userId })
            .sort({ timestamp: -1 });
        
        if (!metric) {
            return res.status(404).json({ message: 'No metrics found' });
        }

        res.json(metric);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Record new metrics
router.post('/', auth, async (req, res) => {
    try {
        const { temperature, humidity, airQuality } = req.body;
        
        const metric = new Metric({
            userId: req.userId,
            temperature,
            humidity,
            airQuality
        });

        await metric.save();
        res.status(201).json(metric);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get metrics history
router.get('/history', auth, async (req, res) => {
    try {
        const metrics = await Metric.find({ userId: req.userId })
            .sort({ timestamp: -1 })
            .limit(10);
        
        res.json(metrics);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
