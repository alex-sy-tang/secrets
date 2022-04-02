//jshint esversion:6
require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const encrypt = require('mongoose-encryption')
const md5 = require('md5')
const bcrypt = require('bcrypt')


const app = express()
// console.log(process.env)


app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine','ejs')
app.use(express.static("public"))

main().catch(err=>console.log(err));

async function main(){

  await mongoose.connect('mongodb://localhost:27017/userDB');
  const userSchema = new mongoose.Schema({
    usrName:{
      type:String,
      required:true,
    },
    password:{
      type:String,
      required:true
    }
  })
  let secret = process.env.SECRET_KEY
  // userSchema.plugin(encrypt,{secret:secret,encryptedFields:['password']});
  const User = mongoose.model('User',userSchema);

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
    res.render('secrets')
  })

app.post('/register',(req,res)=>{
  const password = md5(req.body.password)
  const username = req.body.username
  const newUser = new User({
    usrName:username,
    password:password
  })
  newUser.save(err=>{
    if(err){
      console.log(err)
    }else{
      res.render('secrets')
    }
  })
})


app.post('/login',(req,res)=>{
  const username = req.body.username
  const password = md5(req.body.password)
  User.findOne({usrName:username},(err,userFound)=>{
    if(err){
      console.log(err)
    }else{
      if(!userFound){
        console.log("This account hasn't been created ")
        res.redirect('/login')
      }else{
          if(userFound.password === password){
            res.redirect('/secrets');
          }

      }
    }
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
