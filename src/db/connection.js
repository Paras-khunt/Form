const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost:27017/registrationForm', {
    useNewUrlparser: true,
    useUnifiedTopology: true,

}).then(() => {
    console.log("connection successfull")
}).catch((e) => {
    console.log("connection error")
})

//**************************************************************************** */

// const DB = "mongodb+srv://cluster0.tkcuprw.mongodb.net/registrationForm"
// mongoose.connect(DB).then(() => {
//     console.log("connection successfull")
// }).catch((err) => {
//     console.log("connection error")
// })
