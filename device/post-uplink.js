const { MongoClient } = require('mongodb');

const uri = "mongodb://mongo:27017/userSchema";


async function run(deviceData) {
  const client = await MongoClient.connect(uri, { useNewUrlParser: true ,useUnifiedTopology: true })
  .catch(err => { console.log(err,"Errore qui"); });
  try {
    //await console.log(name,data);
    var data = {
      dataID:Date.now(),
      time:Date.now(),
      status:deviceData.status,
      lat:deviceData.lat,
      lon:deviceData.lon,
      stat:deviceData.stat
    }
    const database = client.db('deviceDB');
    const device = database.collection('devices');
    await device.update({deviceID:deviceData.deviceID},{$push:{data:data}});

    const database1 = client.db('groupDB');
    const group = database1.collection('groups');
    await group.update({groupID:deviceData.groupID,"Devices.deviceID":deviceData.deviceID},{$set:{"Devices.$.lastData":data}})
    await client.close();
  }
  catch(e){
    console.log("errore stupido",e);
  }
}

module.exports = run;
