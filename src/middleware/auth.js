const { response } = require('express')
const jwt = require('jsonwebtoken')
const RegisterUser = require('../models/registerd')

const auth = async (req, resp, next) => {
    try {
        const token = req.cookies.jwt
        const verifyuser = await jwt.verify(token, 'kesariyateraishqhaipiyaishqhaipiyaishqhaipiya')

        const user = await RegisterUser.findOne({ _id: verifyuser._id })
        req.user = user
        req.token = token
        next()

    }
    catch (e) {
        resp.status(400).render('invalid')
    }
}

module.exports = auth