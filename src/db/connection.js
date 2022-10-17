const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost:27017/registrationForm', {
    useNewUrlparser: true,
    useUnifiedTopology: true,

}).then(() => {
    console.log("connection successfull")
}).catch((e) => {
    console.log("connection error")
})
