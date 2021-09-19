const { MongoClient } = require('mongodb');

const uri = "mongodb://mongo:27017/userSchema";


async function run(groupID,userID,userInvited,userRole) {
  const client = await MongoClient.connect(uri, { useNewUrlParser: true ,useUnifiedTopology: true })
  .catch(err => { console.log(err); });
  try {
    const database = client.db('inviteDB');
    const invite = database.collection('invites');
    var data = {
      inviteLink:Date.now().toString(),
      groupID:groupID,
      userID:userID,
      userInvited:userInvited,
      userRole:userRole,
      time:Date.now(),
      timeAccept:false
    }
    console.log(data);
    await invite.insertOne(data);
    await client.close();
  }
  catch{
    console.log("error 1");
  }
}

module.exports = run;
