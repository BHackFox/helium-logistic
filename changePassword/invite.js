const { MongoClient } = require('mongodb');

const uri = "mongodb://mongo:27017/userSchema";


async function run(query,query) {
  const client = await MongoClient.connect(uri, { useNewUrlParser: true ,useUnifiedTopology: true })
  .catch(err => { console.log(err); });
  try {
    const database = client.db('invitePasswordDB');
    const group = database.collection('invitePassword');
    var dataInvite = {
      changeID:Date.now(),
      userID:query.userID,
      time:Date.now(),
      timeAccept:false
    };
    console.log(dataInvite);
    //const result = await group.findOne({groupID:query});
    await group.insertOne(dataInvite);
  }
  catch{
    console.log("errore nel server");
  }
}

module.exports = run;
