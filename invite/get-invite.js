const { MongoClient } = require('mongodb');

const uri = "mongodb://localhost:27017/userSchema";


async function run(query) {
  const client = await MongoClient.connect(uri, { useNewUrlParser: true ,useUnifiedTopology: true })
  .catch(err => { console.log(err); });
  try {
    const database = client.db('inviteDB');
    const user = database.collection('invites');
    const result = await user.findOne(query);
    await client.close();
    return result;
  }
  catch{
    console.log("error");
  }
}

module.exports = run;
