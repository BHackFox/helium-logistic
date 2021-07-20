const { MongoClient } = require('mongodb');

const uri = "mongodb://mongo:27017/userSchema";

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run(user,name) {
  console.log(query);
  var data = {
    groupName:name,
    groupID:Date.now().toString('hex'),
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
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

module.exports = run;
