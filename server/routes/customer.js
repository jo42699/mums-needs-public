const express = require('express');
const Customer = require('../models/customer.js');
const router = express.Router();


// Get ALL CUSTOMERS
router.get('/', async (req, res) => {
 try{
    const getCustomers = await Customer.find();
    res.status(200).json(getCustomers);

    if(!getCustomers){
            return res.status(404).json({ message: "No customers found in the request" });
        }
    }catch(error){
        res.status(500).json({ error: error.message });
    }
});























// DELETE CUSTOMER BY ID
router.delete('/', async (req, res) => {
    try{
        const { customerId } = req.body;
        const deletedCustomer = await Customer.findByIdAndDelete(customerId);
        res.status(200).json(deletedCustomer);

        if(!deletedCustomer){
            return res.status(404).json({ message: "Customer not found" });
        }


    }catch(error){
        res.status(500).json({ error: error.message });
    }
});





module.exports = router;