var express = require('express')
var route = express.Router()

//route.set('view engine','ejs')

route.use(function timelog (req,res,next){
  console.log('Time: ', Date.now());
  next();
})

route.get('/',(req,res)=>{
  res.render("tracking");
})

route.get('/lol',(req,res)=>{
  res.send("Prova riuscita 2");
})


module.exports = route
