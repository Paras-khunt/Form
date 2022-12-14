const express = require('express');
const app = express();
const path = require('path')
const hbs = require('hbs')
require('./db/connection')
const RegisterUser = require('./models/registerd');
const mailer = require('./mails/sendmails')
const OTP = require('./models/otpdata');
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

app.get('/registration', (req, resp) => {
    resp.render("registration")
})

app.get('/login', (req, resp) => {
    resp.render("login")
})

app.get('/forgot', (req, resp) => {
    resp.render("forgot")
})

app.get('/changePassword', (req, resp) => {
    resp.render("changePassword")
})

app.get('/secret', auth, (req, resp) => {
    resp.render('secret')
    //resp.render("secret")
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
    // const items = req.user.Tokens

    // 

    // const filteredItems = items.filter(item => item.token !== req.token);

    // if (filteredItems.length === items.length) {
    //     throw new Error(`Id not found: ${removeId} `);
    // }

    /
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
        try {


            const token = await RegisterUsers.generateAuthToken()
            await RegisterUsers.save();
            resp.status(201).render('login')
        }
        catch (error) {
            resp.status(400).send(error)
        }

    })


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
            resp.send('User not Found')
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
            resp.status(400).send("OTP Is Expired")
        }
        else {
            const user = await RegisterUser.findOne({ EmailId: req.body.email })
            user.Password = req.body.password
            user.save()
            resp.status(200).render('login')
        }
    } else {
        resp.status(400).send("Invalid OTP")
    }

})


//***************************************************************************************************** */

app.listen(port, () => {
    console.log(`server is running on ${port}`)
})