const express = require('express')
const app = express()
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const initializePassport = require('./user/passport-config')
const methodOverride = require('method-override')
const mongo = require('./mongo/connect-mongo')
const addUser = require('./user/new-user')
const infoLogin = require('./user/login-info')
const accountInfo = require('./user/get-account-info')
const mail = require('./mail/server')
const addDevice = require('./user/add-device')
const updateDevice = require('./user/update-device')
const updateAccount = require('./user/update-account')
const addDeviceConnection = require('./user/add-device-connection')
const postUplink = require('./device/post-uplink')
const getDevices = require('./device/get-device')
// initializePassport(passport,
//   username => users.find(user => user.username == username),
//   id => users.find(user => user.id == id)
// )
initializePassport(passport,
  async username => await infoLogin({username:username}),
  async id => await infoLogin({id:id})
)

var beacons = []


const users = []
var auth = {Auth:{
              username: false,
              password: false,
              email: false
            },
            Settings:{
              blackTheme: false
            },
            Devices:[]
          }

app.set('view engine','ejs')
app.use(flash())
app.use(express.urlencoded({
  extended: false
}))


app.use(session({
	secret: 'secret',
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))


app.get('/',(req,res)=>{

  var user_name = false;
  if(req.user){
    console.log(req.user.username);
    user_name = req.user.username;
  }
  if(req.device){
    res.render('home',{username:user_name,device:req.device})
  }
  else{
    res.render('home',{username:user_name,device:{}})
  }
})

app.get('/login',checkNotAuthenticated,async(req,res)=>{
  res.render('login')
})
app.post('/login',passport.authenticate('local',{
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

app.get('/register',checkNotAuthenticated,(req,res)=>{
  res.render('register');
})

app.post('/register', async(req,res)=>{
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    var newUser = {
      id:Date.now(),
      username:req.body.username,
      password:hashedPassword,
      email: false,
      Settings:{
        blackTheme: false
      },
      Devices:[]
    };
    users.push(newUser);
    await addUser(newUser);
    res.redirect('/login');
  } catch (e) {
    res.redirect('/register')
  }
})

app.get('/account/',checkAuthenticated,async(req,res)=>{
  var account = await accountInfo({username:req.user.username})
  res.render('account',account);
})

app.post('/account/',checkAuthenticated,async(req,res)=>{
  var data = {
    email:false,
    blackTheme:false
  }
  if(req.body.email){
    data.email = req.body.email;
  }
  if(req.body.white){
    data.blackTheme = "white";
  }
  else if (req.body.black) {
    data.blackTheme = "black";
  }
  await updateAccount(req.user.username,data)
  res.redirect('account');
})

app.get('/mail',(req,res)=>{
  mail();
  res.render('home',auth)
})

app.get('/console/',checkAuthenticated,async(req,res)=>{
  var ret = await accountInfo({username:req.user.username});
  if(req.query.device){
    var device = ret.Devices.find(item => item.name == req.query.device)
    console.log({ret,device});
    res.render('device',{ret,device})
  }
  else{
    console.log(ret);
    res.render('console',ret)
  }
})

app.post('/console/',checkAuthenticated,async(req,res)=>{
  var ret = await accountInfo({username:req.user.username});
  if(req.body.device){
    var device = {
      name : req.body.device,
      location : '',
      status : 'inactive',
      connections : [],
      beacons : {}
    }
    if (!ret.Devices.find(device => device.name == req.body.device)){
      await addDevice(req.user.username,device);
    }
    else{
      console.log("Dispositivo gia esistente");
    }
    //req.user.Devices.push(device);
  }
  var redir = "";
  if(req.query.device){
    var data = {
        location: false,
        status: false
      }
      redir = "?device="+req.query.device;
    //var device = ret.Devices.find(item => item.name == req.query.device)
    //var i = ret.Devices.indexOf(device)
    if(req.body.location){
      data.location = req.body.location;
      await updateDevice(ret.username,req.query.device,data);
    }
    if(req.body.status){
      data.status = req.body.status;
      await updateDevice(ret.username,req.query.device,data);
    }
    if(req.body.connection){
      data = {
        beacon: req.body.connection,
        time: Date.now(),
      }
      await addDeviceConnection(ret.username,req.query.device,data);
    }

  }
  res.redirect('/console/'+redir)
})


app.get('/devices/uplink',(req,res)=>{
  res.render('uplink',{result:""})
})
app.get('/devices/uplink/get',async (req,res)=>{
  var dev = await getDevices();
  console.log(dev);
  res.render('uplink',{result:dev})
})

app.post('/devices/uplink',async (req,res)=>{
  req.device = req.body;
  await postUplink(req.body.name,req.body.hotspots);
  console.log(req.body);
  res.redirect('/devices/uplink')
})

function checkNotAuthenticated(req,res,next){
  if(req.isAuthenticated()){
    return res.redirect('/')
  }
  next()
}
function checkAuthenticated(req,res,next){
  if(req.isAuthenticated()){
    return next()
  }
  res.redirect('/login')
}


app.listen(process.env.PORT || 3000)
