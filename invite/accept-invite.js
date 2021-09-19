const { MongoClient } = require('mongodb');

const uri = "mongodb://mongo:27017/userSchema";


async function run(inviteLink) {
  const client = await MongoClient.connect(uri, { useNewUrlParser: true ,useUnifiedTopology: true })
  .catch(err => { console.log(err); });
  try {
    console.log(inviteLink);
    const database = client.db('inviteDB');
    const invite = database.collection('invites');
    await invite.updateOne({inviteLink:inviteLink},{$set:{timeAccept:Date.now()}})
    await client.close();
  }
  catch{
    console.log("error");
  }
}

module.exports = run;
