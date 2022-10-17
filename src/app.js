const express = require('express');
const app = express();
const path = require('path')
const hbs = require('hbs')
require('./db/connection')
const RegisterUser = require('./models/registerd');
const cookieParser = require('cookie-parser')
const auth = require('./middleware/auth')


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

app.get('/secret', auth, (req, resp) => {
    resp.render('secret')
    //resp.render("secret")
})

app.get('/logout', auth, async (req, resp) => {
    try {
        const items = req.user.Tokens



        const filteredItems = items.filter(item => item.Token !== req.token);
        console.log(filteredItems)
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

// const jwt = require('jsonwebtoken')

// const createToken = async () => {

//     const token = await jwt.sign({ _id: "63479ec89c7cb56675f58706" }, 'kesariyateraishqhaipiyaishqhaipiyaishqhaipiya')
//     console.log(token)
//     const userverify = await jwt.verify(token, "kesariyateraishqhaipiyaishqhaipiyaishqhaipiya")
//     console.log(userverify)
// }
// createToken()
//***************************************************************************************************** */

app.listen(port, () => {
    console.log(`server is running on ${port}`)
})