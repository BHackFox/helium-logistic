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
var bodyParser = require('body-parser')
const groupPost = require('./group/group-post')
const groupGet = require('./group/group-get')
// initializePassport(passport,
//   username => users.find(user => user.username == username),
//   id => users.find(user => user.id == id)
// )
initializePassport(passport,
  async username => await infoLogin({username:username}),
  async id => await infoLogin({id:id})
)

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

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
    res.render('home',{username:req.user.username,Group:req.user.Group})
  }
  else {
    res.render('home',{username:false,Group:false})
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
      Group:{}
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
  var account = await accountInfo({username:req.user.username});
  if(account.Group.groupID){
    var devices = await getDevices(account.Group.groupID);
    //console.log({ret,device});
    if (req.query.device){
      var device = devices.find(id => id.deviceID == req.query.device);
      if(device){
        res.render('device',{account,device})
      }
      else{
        res.redirect('/console/')
      }
    }

    else{

      res.render('console',{account,devices})
    }
  }
  else{
    console.log(ret);
    res.redirect('/group')
  }
})

app.post('/console/',checkAuthenticated,async(req,res)=>{
  var account = await accountInfo({username:req.user.username});
  if(req.body.device){
    var device = {
      deviceName : req.body.device,
      deviceID : Date.now()
    }
    // if (!ret.Devices.find(device => device.name == req.body.device)){
    await addDevice(account.Group.groupID,device);
    // }
    // else{
    //   console.log("Dispositivo gia esistente");
    // }
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


app.get('/group',checkAuthenticated,async(req,res)=>{
  var account = await accountInfo({username:req.user.username})
  var group = await groupGet({groupID:account.Group.groupID})
  console.log(group);
  res.render('group',{data:account,data1:group})
})

app.post('/group',checkAuthenticated,async(req,res)=>{
  var account = await accountInfo({username:req.user.username})
  if(!account.Group.groupID){
    var groupID = await groupPost(req.user,req.body.name);
    var data = {info:true,groupID:groupID,groupName:req.body.name,groupRole:'CREATOR'}
    await updateAccount(req.user.username,data)
    //console.log(req.user);
    res.redirect('/group');
  }
  else{
    res.redirect('/group')
  }
})

app.get('/devices/uplink',(req,res)=>{
  res.render('uplink',{result:""})
})

app.get('/devices/uplink/get',async (req,res)=>{
  var dev = await getDevices();
  console.log(dev);
  res.render('uplink',{result:dev})
})
//app.use(bodyParser.urlencoded());
app.post('/devices/uplink',async (req,res)=>{
 // req.device = req.body;
  await postUplink(req.body.name,req.body.decoded.payload);
  //console.log(req);
  console.log(Date.now());
  //console.log(res);
  res.status(200);
  res.send("Dati trasmessi");
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
