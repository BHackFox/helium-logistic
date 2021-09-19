const { MongoClient } = require('mongodb');

const uri = "mongodb://mongo:27017/userSchema";


async function run(query,device,data) {
  const client = await MongoClient.connect(uri, { useNewUrlParser: true ,useUnifiedTopology: true })
  .catch(err => { console.log(err); });
  try {
    const database = client.db('userLogin');
    const user = database.collection('users');
    //const result = await user.findOne({username:query});
    if(data.location){
      await user.update({username:query,"Devices.name":device},{$set:{"Devices.$.location":data.location}});
    }
    if(data.status){
      await user.update({username:query,"Devices.name":device},{$set:{"Devices.$.status":data.status}});
    }
    await client.close();
    return result;
  }
  catch{
    console.log("error");
  }
}

module.exports = run;
