const { MongoClient } = require('mongodb');

const uri = "mongodb://localhost:27017/userSchema";


async function run(name,data) {
  const client = await MongoClient.connect(uri, { useNewUrlParser: true ,useUnifiedTopology: true })
  .catch(err => { console.log(err,"Errore qui"); });
  try {
    await console.log(name,data);
    const database = client.db('deviceDB');
    const device = database.collection('devices');
    await device.insertOne({deviceName:name,Data:data,Time:Date.now()});
    await client.close();
  }
  catch(e){
    console.log("errore stupido",e);
  }
}

module.exports = run;
