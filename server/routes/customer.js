const express = require('express');
const router = express.Router();
const Customer = require('../models/customer.js');

// CREATE CUSTOMER
router.post('/', async (req, res) => {
    try {
        const customer = await Customer.create(req.body);
        res.status(201).json(customer);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET ALL CUSTOMERS
router.get('/', async (req, res) => {
    try {
        const customers = await Customer.find();
        res.json(customers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET SINGLE CUSTOMER
router.get('/:id', async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) return res.status(404).json({ error: "Customer not found" });
        res.json(customer);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// UPDATE CUSTOMER
router.put('/:id', async (req, res) => {
    try {
        const customer = await Customer.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!customer) return res.status(404).json({ error: "Customer not found" });
        res.json(customer);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE CUSTOMER
router.delete('/:id', async (req, res) => {
    try {
        const customer = await Customer.findByIdAndDelete(req.params.id);
        if (!customer) return res.status(404).json({ error: "Customer not found" });
        res.json({ message: "Customer deleted successfully" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
