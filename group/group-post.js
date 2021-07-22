const { MongoClient } = require('mongodb');

const uri = "mongodb://localhost:27017/userSchema";

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run(user,name) {
  //console.log(query);
  var data = {
    groupName:name,
    groupID:Date.now(),
    groupCreator:{
      userName:user.username,
      userID:user.id,
      time:Date.now()
    },
    members:[
      {
        memberName:user.username,
        memberID:user.id,
        memberRole:'CREATOR'
      }
    ],
    Devices:[],
    beacons:{}
  }
  try {
    await client.connect();
    const database = client.db('groupDB');
    const group = database.collection('groups');
    const result = await group.insertOne(data);
    //console.log(result);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
    return data.groupID;
  }
}

module.exports = run;
