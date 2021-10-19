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
const acceptInvite = require('./invite/accept-invite')
const postChangePassowrd = require('./changePassword/invite')
const getInvitePassword = require('./changePassword/getInvitePassword')
const tracking = require('./routes/tracking')
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
// app.use((req,res,next)=>{
//   req.redirect = req.redirect;
//   console.log(req.redirect);
//   next();
// })


app.get('/',(req,res)=>{

  var user_name = false;
  req.session.redirect = "/"
  console.log(req.user);
  if(req.user){
    var nid = req.user.id+req.user.Group.groupID;
    console.log(nid);
    console.log(nid.toString(16));
    res.render('home',{username:req.user.username,Group:req.user.Group,id:req.user.id})
  }
  else {
    res.render('home',{username:false,Group:false})
  }
})

app.get('/login',checkNotAuthenticated,async(req,res)=>{
  if(!req.session.redirect){
    req.session.redirect = "/";
  }
  if(req.query.password == "lost" && !req.query.id){
    res.render('lostpassword',{msg:"",redirect:req.redirect});
  }
  else if (req.query.password == "lost" && req.query.id) {
    req.session.redirect = "/login/?password=lost"
    var id = await getInvitePassword({changeID:parseInt(req.query.id)});
    console.log(req.query.id);
    console.log(id);
    var account = await accountInfo({id:id.userID});
    if (id){
      console.log("sisisissi");
      res.render('newpassword',{id,account});
    }
    else{
      console.log("nope");
      res.redirect(req.session.redirect)
    }
  }
  else{
    res.render('login',{redirect:req.redirect});
  }
})
app.post('/login',passport.authenticate('local',{
  failureRedirect: '/login',
  failureFlash: true
}),(req,res)=>{
  res.redirect(req.session.redirect)
})

app.get('/register',checkNotAuthenticated,(req,res)=>{
  res.render('register',{error:false});
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
      res.render('register',{error:true})
    }
  } catch (e) {
    res.redirect('/register')
  }
})

app.post('/recreate',checkNotAuthenticated,async(req,res)=>{
  if(!req.session.redirect){
    req.session.redirect = "/";
  }
  if(req.body.password){
    console.log("Set password",req.body.username);
    await updateAccount(req.body.username,{password:await bcrypt.hash(req.body.password, 10)})
    res.redirect("/login");
  }
  else{
    var user = await accountInfo({username:req.body.username});
    console.log("user:",user);
    if (user){
      await postChangePassowrd(user.id);
      res.render('lostpassword',{msg:"Check your email!",redirect:req.session.redirect});
    }
    else{
      res.redirect("/login/?password=lost")
    }
  }
})

app.get('/account/',checkAuthenticated,async(req,res)=>{
  req.session.redirect = "/"
  var account = await accountInfo({username:req.user.username})
  res.render('account',account);
})

app.post('/account/',checkAuthenticated,async(req,res)=>{
  var data = {
    email:false,
    blackTheme:false,
    passport:false
  }
  console.log();
  if(req.body.email){
    data.email = req.body.email;
  }
  if(req.body.white){
    data.blackTheme = "white";
  }
  else if (req.body.black) {
    data.blackTheme = "black";
  }
  else if (req.body.password) {
    data.password = req.body.password;
  }
  await updateAccount(req.user.username,data)
  res.redirect('account');
})

app.get('/mail',(req,res)=>{
  mail();
  res.render('home',auth)
})

app.get('/console/',checkAuthenticated,async(req,res)=>{
  req.session.redirect = "/"
  var account = await accountInfo({username:req.user.username});
  if(account.Group.groupID){
    var group = await groupGet({groupID:account.Group.groupID});
    //console.log({ret,device});
    console.log(group);
    if (req.query.device){
      var devices = await getDevices({groupID:account.Group.groupID});
      var device = devices.find(id => id.deviceID == req.query.device);
      if(device){
        res.render('device',{account,device,group:false,deviceFound:false})
      }
      else{
        res.redirect('/console/')
      }
    }
    else if(req.query.search){
      var devices = await getDevices({groupID:account.Group.groupID});
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
    res.redirect('/group')
  }
})

app.post('/console/',checkAuthenticated,async(req,res)=>{
  req.session.redirect = "/"
  var account = await accountInfo({username:req.user.username});
  if(req.body.device && (account.Group.groupRole == "CREATOR" || account.Group.groupRole == "ADMIN")){
    var device = {
      deviceName : req.body.device,
      deviceID : Date.now()
    }

    await addDevice(account.Group.groupID,device);

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
  req.session.redirect = "/"
  var account = await accountInfo({username:req.user.username})
  var group = await groupGet({groupID:account.Group.groupID})
  console.log(group);
  res.render('group',{data:account,data1:group})
})

app.post('/group',checkAuthenticated,async(req,res)=>{
  req.session.redirect = "/"
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


app.post('/group/invite',checkAuthenticated,async (req,res)=>{
  req.session.redirect = "/"
  var account = await accountInfo({username:req.user.username});
  //Bisogna cambiare il database per i member non ancora registrati
  var member = await accountInfo({username:req.body.memberName});
  var group = await groupGet({groupID:account.Group.groupID});
  var invite = await getInvite({userInvited:req.body.memberName})
  console.log(invite);
  if(!invite){
    await postInvite(group.groupID,account.id,req.body.memberName,req.body.memberRole);
  }
  console.log("non entra");
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
 console.log(b);
 if (b.decoded.payload.state == "TEST"){
   console.log("TEST\n"+b.decoded.payload);
   console.log(b.decoded.payload.lat,b.decoded.payload.lon);
   res.status(200);
   res.send("Risposta test positiva");
 }
 else if (b.decoded.payload.state == "POSITIVE") {
   var device = await getDevices({deviceID:b.decoded.payload.deviceID});
   if(device[0] && device[0].groupID){
     var data = {
       deviceID:b.decoded.payload.deviceID,
       groupID:device[0].groupID,
       status:"UP",
       lat:b.hotspots[0].lat,
       lon:b.hotspots[0].long,
       stat:b.decoded.payload.stat,
       hotspot:b.hotspots[0].id
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
     }
     else {
       res.status(300);
       res.send("Error Wrong Device or Group ID");
     }
 }
 else if (b.decoded.payload.state == "NEGATIVE") {
   res.status(300);
   res.send("Risposta negativa");
 }
 else{
   res.status(300);
   res.send("Errore nella lettura dello state del dispositivo");
 }
})

app.get('/invite/',async(req,res)=>{
  if (req.query.invite){
    var data = await getInvite({inviteLink:req.query.invite});
    if(data && !data.timeAccept){
      console.log(data);
      var group = await groupGet({groupID:data.groupID})
      data.groupName = group.groupName;
      req.session.redirect = "/invite/?invite="+data.inviteLink;
      res.render('invite',{data,user:req.user})
    }
    else{
      res.redirect("/")
    }
  }
})

app.post('/invite/',checkAuthenticated,async(req,res)=>{
  var data1 = await getInvite({inviteLink:req.body.inviteLink});
  if(!data1){
    res.redirect('/');
  }
  var group = await groupGet({groupID:data1.groupID})
  var data = {info:true,groupID:data1.groupID,groupName:group.groupName,groupRole:data1.userRole}
  if(!req.user){
    res.redirect('/login')
  }
  else if(data1.timeAccept){
    res.redirect("/")
  }
  else if(req.user.username != data1.userInvited){
    res.redirect("/")
  }
  else{
    await updateAccount(req.user.username,data);
    await acceptInvite(req.body.inviteLink);
    var data = {
      memberName:req.user.username,
      memberID:req.user.id,
      memberRole:data1.userRole
    }
    await addGroupMember(group.groupID,data);
    res.redirect('/group')
  }
})

app.use('/tracking',tracking)

var data123 = "Real-Time Update 1";
var number123 = 1;

app.get('/server-sent-events', function(req, res) {

    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });

    var interval = setInterval(function(){
        data123 = "Real-Time Update "+number123;
        console.log(req.user);
        res.write("data: " + data123 + "\n\n")
        number123++;
    }, 1000);

    // close
    res.on('close', () => {
        clearInterval(interval);
        res.end();
    });
})

function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


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
