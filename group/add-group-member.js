const { MongoClient } = require('mongodb');

const uri = "mongodb://mongo:27017/userSchema";

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run(groupID,memberData) {
  //console.log(query);
  var data = {
    memberName:memberData.memberName,
    memberID:memberData.memberID,
    memberRole:memberData.memberRole
  }
  try {
    await client.connect();
    const database = client.db('groupDB');
    const group = database.collection('groups');
    await group.update({groupID:groupID},{$push:{members:data}});
    //console.log(result);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

module.exports = run;
