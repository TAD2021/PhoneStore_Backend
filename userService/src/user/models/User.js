const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        require: true,
        unique: true
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    password: {
        type: String,
        require: true,
        minlength: 6,
        unique: true
    },
    name: {
        type: String,
    },
    address: {
        type: String,
    },
    specificAddress: {
        type: String,
    },
    phone: {
        type: String
    },
    admin: {
        type: Boolean,
        default: false,
    },

}, { timestamps: true }
);


module.exports = mongoose.model("User", userSchema);
