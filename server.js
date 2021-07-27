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
const addDevice = require('./device/add-device')
const updateDevice = require('./user/update-device')
const updateAccount = require('./user/update-account')
const addDeviceConnection = require('./user/add-device-connection')
const postUplink = require('./device/post-uplink')
const getDevices = require('./device/get-device')
const bodyParser = require('body-parser')
const groupPost = require('./group/group-post')
const groupGet = require('./group/group-get')
const addGroupMember = require('./group/add-group-member')
const getInvite = require('./invite/get-invite')
const postInvite = require('./invite/post-invite')
// initializePassport(passport,
//   username => users.find(user => user.username == username),
//   id => users.find(user => user.id == id)
// )
initializePassport(passport,
  async username => await infoLogin({username:username}),
  async id => await infoLogin({id:id})
)

app.use(express.static('public'))

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

app.get('/logout',checkAuthenticated,(req,res)=>{
  req.logout();
  res.redirect('/');
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
    var userExist = await infoLogin({username:req.body.username});
    if(!userExist){
      users.push(newUser);
      await addUser(newUser);
      res.redirect('/login');
    }
    else{
      res.redirect('/register')
    }
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
    var group = await groupGet({groupID:account.Group.groupID});
    //console.log({ret,device});
    console.log(group);
    if (req.query.device){
      var devices = await getDevices(account.Group.groupID);
      var device = devices.find(id => id.deviceID == req.query.device);
      if(device){
        res.render('device',{account,device,group:false,deviceFound:false})
      }
      else{
        res.redirect('/console/')
      }
    }
    else if(req.query.search){
      var devices = await getDevices(account.Group.groupID);
      var deviceFound = [];
      for (var i = 0; i < group.Devices.length; i++) {
        if(group.Devices[i].deviceName.match(req.query.search) || group.Devices[i].deviceID.toString().match(req.query.search)){
          deviceFound.push(group.Devices[i]);
        }
      }
      res.render('console',{account,deviceFound,group:false})
    }
    else{

      res.render('console',{account,group,deviceFound:false})
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

app.get('/devices/uplink/get',checkAuthenticated,async (req,res)=>{
  var account = await accountInfo({username:req.user.username})
  var dev = await getDevices(account.Group.groupID);
  console.log(dev);
  res.render('uplink',{result:dev})
})

app.post('/group/invite',checkAuthenticated,async (req,res)=>{
  var account = await accountInfo({username:req.user.username});
  var member = await accountInfo({id:parseInt(req.body.memberID)});
  var group = await groupGet({groupID:account.Group.groupID});
  await postInvite(group.groupID,account.id,member.id,req.body.memberRole);
  // var data = {
  //   memberName:member.username,
  //   memberID:member.id,
  //   memberRole:req.body.memberRole
  // }
  // await addGroupMember(group.groupID,data);
  res.redirect('/group');

})

//app.use(bodyParser.urlencoded());
app.post('/devices/uplink',async (req,res)=>{
 // req.device = req.body;
 var b = req.body;
 var data = {
   deviceID:b.decoded.payload.deviceID,
   groupID:b.decoded.payload.groupID,
   status:"UP",
   lat:b.hotspots[0].lat,
   lon:b.hotspots[0].long,
   stat:b.decoded.payload.stat
   // beacon:{
   //
   // }
 }
  await postUplink(data);
  //console.log(req);
  console.log(Date.now());
  //console.log(res);
  res.status(200);
  res.send("Dati trasmessi");
})

app.get('/invite/',async(req,res)=>{
  if (req.query.invite){
    var data = await getInvite({inviteLink:req.query.invite});
    var group = await groupGet({groupID:data.groupID})
    data.groupName = group.groupName;
    res.render('invite',{data,username:false})
  }
})

app.use(function(req, res, next) {
  res.status(404);
  res.sendFile(path.join(__dirname,'public/404.html'))
});

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
