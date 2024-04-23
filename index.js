const express = require('express');
const passport = require('passport');
const session = require('express-session');
const path = require('path');

const bodyParser = require('body-parser')
const ejs = require('ejs')
const collection = require('./config')
const { Collection } = require('mongoose')

const app = express()
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static('/public'))
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client')));
require('./auth');


function isLoggedIn(req, res, next) {
  req.user ? next() : res.sendStatus(401);
}

app.get('/', (req, res) => {
  res.render('login');
});


// **************************

app.post('/login', async (req, res) => {

  const data = {
    name: req.body.username,
    password: req.body.password
  }
  // console.log(data) 

  const validUser = await collection.findOne({ name: data.name })
  const validPass = await validUser.password

  if (validUser && data.password === validPass) {
    res.render('home', {
      users: await collection.find()
    })
  }
  else {
    res.send('Invalid username or password')
  }
})

app.get('/home', async (req, res) => {
  res.render('home', {
    users: await collection.find()
  })
  // const x= await collection.find()
  // console.log(x)
})

app.get('/signup', (req, res) => {
  res.render('signup')
})

app.post('/signup', async (req, res) => {

  const data = {
    name: req.body.username,
    password: req.body.password
  }

  //Finding existing user
  const existingUser = await collection.findOne({ name: data.name })

  if (existingUser) {
    res.send('User with this username already exists, choose some other username ')
  }
  else {
    // await collection.insertMany(data)
    const userdata = await collection.insertMany(data)
    res.render('home', {
      users: await collection.find()
    })
    // console.log(userdata)
  }
})



// **************************


app.use(
  session({
    secret: 'mysecret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.get(
  '/auth/google',
  passport.authenticate('google', {
    scope: ['email', 'profile'],
  })
);

app.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: '/auth/protected',
    failureRedirect: '/auth/google/failure',
  })
);

app.get('/auth/google/failure', (req, res) => {
  res.send('Something went wrong!');
});

app.get('/auth/protected', isLoggedIn, (req, res) => {
  let name = req.user.displayName;
  res.send(`Hello ${name}`);
});

app.use('/auth/logout', (req, res) => {
  req.session.destroy();
  res.send('See you again!');
});

app.listen(5000, () => {
  console.log('Listening on port 5000');
});