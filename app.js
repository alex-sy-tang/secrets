//jshint esversion:6
require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const encrypt = require('mongoose-encryption')
const md5 = require('md5')
const bcrypt = require('bcrypt')
const session = require('express-session')
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose')


const app = express();
const saltRounds = 10;
// console.log(process.env)


app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine','ejs')
app.use(express.static("public"))
app.use(session({
  secret:"ThisIsOurLittleSecret",
  resave:false,
  saveUninitialized:false,
}))
app.use(passport.initialize());
app.use(passport.session());

main().catch(err=>console.log(err));

async function main(){

  await mongoose.connect('mongodb://localhost:27017/userDB');
  const userSchema = new mongoose.Schema({
    username:{
      type:String,
      required:true,
    },
    password:String,

  })

  userSchema.plugin(passportLocalMongoose);


  const User = new mongoose.model('User',userSchema);

  // const User = require('./models/user');

  passport.use(User.createStrategy());

  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());

  app.listen('3000',()=>{
    console.log('Starting on port 3000')
  })

  app.get('/',(req,res)=>{
    res.render('home')
  })

  app.get('/login',(req,res)=>{
    res.render('login')
  })

  app.get('/register',(req,res)=>{
    res.render('register')
  })

  app.get('/secrets',(req,res)=>{
    if(req.isAuthenticated()){
      res.render('secrets')
    }else{
      res.redirect('/login')
    }
  })

  app.get('/logout',(req,res)=>{
    req.logout();
    res.redirect('/');
  })

app.post('/register',(req,res)=>{
  const username = req.body.username
  const password = req.body.password
  console.log(username,password);

  User.register({username:username,active:true},password,(err,user)=>{
    if(err){
      console.log(err)
      res.redirect('/register')
    }else{
      const authenticate = passport.authenticate("local");

      //I didn't quite understand the part about authentication.
      authenticate(req,res,()=>{
        res.redirect('/secrets');
      })
    }
  })

  })


app.post('/login',(req,res)=>{
  const user = new User({
    username:req.body.username,
    password:req.body.password,
  })

  req.login(user,(err)=>{
    if(err){
      console.log(err);
      res.redirect('/login')
    }

    passport.authenticate('local')(req,res,()=>{
      res.redirect('/secrets');
    })

  })
})

}

//   app.get('/secrets',(req,res)=>{
//     res.render('secrets')
//   })
//
// app.post('/register',(req,res)=>{
//   const password = req.body.password
//   const username = req.body.username
//   const newUser = new User({
//     usrName:username,
//     password:password
//   })
//   newUser.save(err=>{
//     if(err){
//       console.log(err)
//     }else{
//       res.render('secrets')
//     }
//   })
// })
//
//
// app.post('login',(req,res)=>{
//   const username = req.body.username
//   const password = req.body.password
//   User.findOne({usrName:username},(err,userFound)=>{
//     if(err){
//       console.log(err)
//     }else{
//       if(!userFound){
//         console.log("This account hasn't been created ")
//         res.redirect('/login')
//       }else{
//         if(userFound.usrName === username){
//           if(userFound.password === password){
//             res.redirect('/secrets');
//           }
//         }
//       }
//     }
//   })
// })

// app.listen('3000',()=>{
//   console.log('Starting on port 3000')
// })
//
// app.get('/',(req,res)=>{
//   res.render('home')
// })
//
// app.get('/login',(req,res)=>{
//   res.render('login')
// })
//
// app.get('/register',(req,res)=>{
//   res.render('register')
// })
