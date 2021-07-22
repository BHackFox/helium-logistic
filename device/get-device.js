const { MongoClient } = require('mongodb');

const uri = "mongodb://localhost:27017/userSchema";


async function run(groupID) {
  const client = await MongoClient.connect(uri, { useNewUrlParser: true ,useUnifiedTopology: true })
  .catch(err => { console.log(err); });
  try {
    const database = client.db('deviceDB');
    const user = database.collection('devices');
    const result = await user.find({groupID:groupID}).toArray();
    await client.close();
    return result;
  }
  catch{
    console.log("error");
  }
}

module.exports = run;
