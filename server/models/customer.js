const mongooose = require('mongoose');

// CUSTOMER SCHEMA 
const customerSchema = new mongooose.Schema({
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true, unique: true },
        address: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true },
}, { timestamps: true });



module.exports = mongooose.model('Customer', customerSchema);