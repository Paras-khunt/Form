const mongoose = require('mongoose')
const { response } = require('express')

const verifyotpSchema = new mongoose.Schema({
    email: 'String',
    code: 'String',
    expireIn: Number,
    Tokens: [{
        Token: {
            type: String,
            require: true
        }
    }]
},
    {
        timestamps: true
    }
)
const RegisterOTP = mongoose.model("RegisterOTP", verifyotpSchema);

module.exports = RegisterOTP