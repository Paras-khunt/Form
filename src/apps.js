const express = require('express');
const mongoose = require('mongoose')
const app = express();
const path = require('path')
const hbs = require('hbs')
require('./db/connection')
const RegisterUser = require('./models/registerd');
const mailer = require('./mails/sendmails')
const OTP = require('./models/otpdata');
const RegisterOTP = require('./models/registerOTP');
const cookieParser = require('cookie-parser')
const auth = require('./middleware/auth');
const { response } = require('express');


//*********************************************************************************************************** */
const port = process.env.PORT || 8000

//********************************************************************************************************** */
const joindirectory = path.join(__dirname, '../public')
app.set('views', path.join(__dirname, '../templates/views'));

app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: false }))



app.use(express.static(joindirectory))
app.set("view engine", 'hbs')

hbs.registerPartials(path.join(__dirname, '../templates/partials'))

//********************************************************************************************************* */

app.get('/', (req, resp) => {
    resp.render("index")
})

app.get('/index', (req, resp) => {
    resp.render("index")
})

app.get('/invalid', (req, resp) => {
    resp.render("invalid")
})

app.get('/registration', (req, resp) => {
    resp.render("registration")
})

app.get('/login', (req, resp) => {
    resp.render("login")
})

app.get('/email-verification', (req, resp) => {
    resp.render("email-verification")
})
app.get('/email-verification2', (req, resp) => {
    resp.render("email-verification2")
})

app.get('/forgot', (req, resp) => {
    resp.render("forgot")
})

app.get('/changePassword', (req, resp) => {
    resp.render("changePassword")
})

app.get('/secret', auth, (req, resp) => {
    resp.render('secret')
})

app.get('/update', auth, (req, resp) => {
    resp.render('update')
})

app.get('/logout', auth, async (req, resp) => {
    try {
        const items = req.user.Tokens



        const filteredItems = items.filter((item) => {
            item.Token !== req.token
            return item
        });

        resp.clearCookie('jwt')
        await req.user.save()
        resp.render('index')



    }


    catch (e) {
        resp.status(400).send('logout failed')
    }
})

app.get('/delete', auth, (req, resp) => {
    resp.render('delete')
})

app.post('/delete', auth, async (req, resp) => {



    const User = req.user.EmailId
    currentuser = req.body.email
    if (User === currentuser) {

        const deleteuser = await RegisterUser.findOneAndDelete(req.user)
        resp.clearCookie('jwt')
        resp.render('index')

    }
    else {
        resp.status(400).send("This account is not Yours")
    }

})

//************************************************************************************************************* */

app.post('/registration', async (req, resp) => {

    const RegisterUsers = new RegisterUser({
        Firstname: req.body.firstName,
        Secondname: req.body.secondName,
        EmailId: req.body.email,
        Gender: req.body.Gender,
        MobileNumber: req.body.phoneNo,
        Password: req.body.password
    })













    //************************************************************************************* */




    const otpCode = Math.floor((Math.random() * 10000) + 1)
    let otpData = new RegisterOTP({
        email: req.body.email,
        code: otpCode,
        expireIn: new Date().getTime() + 200000
    })

    otpResponse = await otpData.save()
    //****************************************************************************************************** */

    var nodemailer = require('nodemailer');

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'paraskhunt2@gmail.com',
            pass: 'ywmlpfxdfifqyuzc'
        }
    });

    var mailOptions = {
        from: 'paraskhunt2@gmail.com',
        to: req.body.email,
        subject: 'Sending Email for OTP',
        html: "<h3>OTP for account verification is </h3>" + "<h1 style='font-weight:bold;'>" + otpCode + "</h1>"
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

    //**************************************************************************************************** */
    resp.status(200).render('email-verification')






    app.post('/email-verification', async (req, resp) => {
        const data = await RegisterOTP.findOne({ code: req.body.code })

        if (data) {
            const currentTime = new Date().getTime()
            const diff = data.expireIn - currentTime
            if (diff < 0) {
                resp.status(400).render('email-verification')
            }
            else {
                const token = await RegisterUsers.generateAuthToken()
                await RegisterUsers.save();
                resp.status(200).render('login')
            }
        } else {
            resp.status(400).send("email-verification")
        }

    })
})

//***************************************************************************************************** */     

















/*********************************************************************************************** */
app.post("/login", async (req, resp) => {
    try {
        const email = req.body.email;
        const password = req.body.password
        const user = await RegisterUser.findOne({ EmailId: email });
        const match = user.Password === password
        const token = await user.generateAuthToken()

        if (match) {

            resp.status(201).render('index')


            resp.cookie("jwt", token)
        }
        else {
            resp.status(400).render('invalid')
        }
    }
    catch (error) {
        resp.status(400).send("Invalid Login Credentials")
    }
})

/*******************************************************************************************/
app.post("/forgot", async (req, resp) => {
    let data = await RegisterUser.findOne({ EmailId: req.body.email })
    if (data) {
        const otpCode = Math.floor((Math.random() * 10000) + 1)
        let otpData = new OTP({
            email: req.body.email,
            code: otpCode,
            expireIn: new Date().getTime() + 200000
        })

        otpResponse = await otpData.save()
        //****************************************************************************************************** */

        var nodemailer = require('nodemailer');

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'paraskhunt2@gmail.com',
                pass: 'ywmlpfxdfifqyuzc'
            }
        });

        var mailOptions = {
            from: 'paraskhunt2@gmail.com',
            to: req.body.email,
            subject: 'Sending Email for OTP',
            html: "<h3>OTP for account verification is </h3>" + "<h1 style='font-weight:bold;'>" + otpCode + "</h1>"
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        //**************************************************************************************************** */
        resp.status(200).render('changePassword')

    }
    else {
        resp.status(400).send('Plz enter valid Email')
    }

})

app.post('/changePassword', async (req, resp) => {
    const data = await OTP.findOne({ code: req.body.code })

    if (data) {
        const currentTime = new Date().getTime()
        const diff = data.expireIn - currentTime
        if (diff < 0) {
            resp.status(400).render('email-verification')
        }
        else {
            const user = await RegisterUser.findOne({ EmailId: req.body.email })
            user.Password = req.body.password
            user.save()
            resp.status(200).render('login')
        }
    } else {
        resp.status(400).render("email-verification")
    }

})
//************************************************************************************************************* */
app.post('/update', auth, async (req, resp) => {

    const User = req.user


    User.Firstname = req.body.firstName,
        User.Secondname = req.body.secondName,
        User.EmailId = req.body.email,
        User.Gender = req.body.Gender,
        User.MobileNumber = req.body.phoneNo,
        User.Password = req.body.password

    const otpCode = Math.floor((Math.random() * 10000) + 1)
    let otpData = new RegisterOTP({
        email: req.body.email,
        code: otpCode,
        expireIn: new Date().getTime() + 200000
    })

    otpResponse = await otpData.save()
    //****************************************************************************************************** */

    var nodemailer = require('nodemailer');

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'paraskhunt2@gmail.com',
            pass: 'ywmlpfxdfifqyuzc'
        }
    });

    var mailOptions = {
        from: 'paraskhunt2@gmail.com',
        to: req.body.email,
        subject: 'Sending Email for OTP',
        html: "<h3>OTP for account verification is </h3>" + "<h1 style='font-weight:bold;'>" + otpCode + "</h1>"
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

    //**************************************************************************************************** */
    resp.status(200).render('email-verification2')






    app.post('/email-verification2', async (req, resp) => {
        const data = await RegisterOTP.findOne({ code: req.body.code })

        if (data) {
            const currentTime = new Date().getTime()
            const diff = data.expireIn - currentTime
            if (diff < 0) {
                resp.status(400).send("OTP Is Expired")
            }
            else {
                await User.save();
                resp.status(200).render('login')
            }
        } else {
            resp.status(400).render('email-verification2')
        }

    })
})





//***************************************************************************************************** */

//********************************************************************************************************* */
app.listen(port, () => {
    console.log(`server is running on ${port}`)
})