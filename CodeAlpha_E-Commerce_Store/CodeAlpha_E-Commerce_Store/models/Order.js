const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({

    userId: String,

    customerName: String,

    phone: String,

    address: String,

    paymentMethod: String,

    products: Array,

    total: Number,

    status: {
        type: String,
        default: 'Processing'
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model('Order', orderSchema);