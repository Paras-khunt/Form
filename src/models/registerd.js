const { response } = require('express')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')

const employeeSchema = new mongoose.Schema({
    Firstname: {
        type: String,
        require: true
    },

    Secondname: {
        type: String,
        require: true
    },


    isblock: {
        type: Boolean,
        require: true
    },

    EmailId: {
        type: String,
        require: true,
        unique: true,

        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },

    Password: {
        type: String,
        require: true,
        trim: true,
        minlength: 7,

        validate(value) {
            if (value.includes("Password")) {
                throw new Error("Password doesn't contain Password")

            }

        }
    },

    MobileNumber: {
        type: Number,
        require: true,
        unique: true
    },
    Gender: {
        type: String,
        require: true
    },
    Tokens: [{
        Token: {
            type: String,
            require: true
        }
    }]

})
employeeSchema.methods.generateAuthToken = async function () {
    try {
        const token = await jwt.sign({ _id: this._id.toString() }, "kesariyateraishqhaipiyaishqhaipiyaishqhaipiya")
        this.Tokens = this.Tokens.concat({ Token: token })

        await this.save()
        return token
    }
    catch (e) {
        response.status(400).send('Something Went Wrong')
    }

}

employeeSchema.pre('save', async function (next) {
    if (this.isModified('Password')) {

        this.Password = await bcrypt.hash(this.Password, 12)

    }
    next()
}
)


const RegisterUser = mongoose.model("RegisterUser", employeeSchema)

module.exports = RegisterUser;