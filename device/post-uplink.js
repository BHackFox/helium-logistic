const { MongoClient } = require('mongodb');

const uri = "mongodb://localhost:27017/userSchema";


async function run(device,data) {
  const client = await MongoClient.connect(uri, { useNewUrlParser: true ,useUnifiedTopology: true })
  .catch(err => { console.log(err); });
  try {
    const database = client.db('deviceDB');
    const device = database.collection('devices');
    await device.insertOne({deviceName:device.name,Data:data,Time:Date.now()});
    await client.close();
  }
  catch{
    console.log("error");
  }
}

module.exports = run;
