const { MongoClient } = require('mongodb');

const uri = "mongodb://localhost:27017/userSchema";


async function run(query,device) {
  const client = await MongoClient.connect(uri, { useNewUrlParser: true ,useUnifiedTopology: true })
  .catch(err => { console.log(err); });
  try {
    const database = client.db('userLogin');
    const user = database.collection('users');
    const result = await user.findOne({username:query});
    await user.update({username:query},{$push:{Devices:device}});
    // const database1 = client.db('deviceDB');
    // const device = database1.collection('devices');
    // await device.insertOne({username:query,Device:device});
    // var result = await device.findOne({username:query});
    // console.log("Result: ",result);
    await client.close()
    return result;
  }
  catch{
    console.log("error");
  }
}

module.exports = run;
