const { MongoClient } = require('mongodb');

const uri = "mongodb://localhost:27017/userSchema";


async function run(query,device,data) {
  const client = await MongoClient.connect(uri, { useNewUrlParser: true ,useUnifiedTopology: true })
  .catch(err => { console.log(err); });
  try {
    const database = client.db('userLogin');
    const user = database.collection('users');
    //const result = await user.findOne({username:query});
    if(data){
      await user.update({username:query,"Devices.name":device},{$push:{"Devices.$.connections":data}});
    }
    //if(!user.findOne({username:query}))
    await client.close();
  }
  catch{
    console.log("error");
  }
}

module.exports = run;
