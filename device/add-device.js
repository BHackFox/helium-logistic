const { MongoClient } = require('mongodb');

const uri = "mongodb://localhost:27017/userSchema";


async function run(query,device) {
  const client = await MongoClient.connect(uri, { useNewUrlParser: true ,useUnifiedTopology: true })
  .catch(err => { console.log(err); });
  try {
    const database = client.db('groupDB');
    const group = database.collection('groups');
    var dataGroup = {
      deviceName:device.deviceName,
      deviceID:device.deviceID,
      lastData:{},
      connections:[]
    };
    //const result = await group.findOne({groupID:query});
    await group.update({groupID:query},{$push:{Devices:dataGroup}});
    const database1 = client.db('deviceDB');
    const user = database1.collection('devices');
    var dataDevice = {
      deviceName:device.deviceName,
      deviceID:device.deviceID,
      groupID:query,
      beacons:{},
      data:[]
    };
    await user.insertOne(dataDevice);
    await client.close()
  }
  catch{
    console.log("error");
  }
}

module.exports = run;
