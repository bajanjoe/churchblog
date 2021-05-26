const express = require('express'),
    app = express(),
    bodyParser = require("body-parser"),
    methodOveride = require("method-override"),
    LocalStrategy = require("passport-local"),
    passport = require("passport"),
    passportLocalMongoose = require("passport-local-mongoose"),
    //Seeding the app.js
    User = require("./models/user")

//Require routes section 39 lect 344
var commentRoutes = require("./routes/comments"),
    blogRoutes = require("./routes/blogs"),
    indexRoutes = require("./routes/index"),
    aboutRoutes = require("./routes/about")


const path = require('path')
const PORT = process.env.PORT || 5000

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')


//Removed personal database login.
mongoose.connect('mongodb+srv://yelpcamp.mongodb.net/yelpcamp?retryWrites=true&w=majority')

//App config
app.use(express.static(path.join(__dirname, 'public')))
app.use(methodOveride("_method"))
app.use(express.urlencoded({ extended: true }))
app.use(require("express-session")({
    secret: "Super user",
    resave: false,
    saveUninitialized: false
}));


app.use(passport.initialize())
app.use(passport.session())

passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

//Own middleware passing req.user or currentUser to every function
app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    next();
})

//Use routes
app.use("/blog/:id/comments", commentRoutes)
app.use("/blog", blogRoutes)
app.use(indexRoutes)
app.use(aboutRoutes)

app.listen(PORT, () => console.log(`Listening on ${PORT}`))



