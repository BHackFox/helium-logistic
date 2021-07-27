const { MongoClient } = require('mongodb');

const uri = "mongodb://mongo:27017/userSchema";


async function run(query,data) {
  const client = await MongoClient.connect(uri, { useNewUrlParser: true ,useUnifiedTopology: true })
  .catch(err => { console.log(err); });
  try {
    console.log(data);
    const database = client.db('userLogin');
    const user = database.collection('users');
    //const result = await user.findOne({username:query});
    if(data.email){
      await user.update({username:query},{$set:{email:data.email}});
    }
    if(data.blackTheme){
      await user.updateOne({username:query},{$set:{"Settings.blackTheme":data.blackTheme}});
    }
    if(data.info){
      await user.updateOne({username:query},{$set:{"Group.groupName":data.groupName,"Group.groupID":data.groupID,"Group.groupRole":data.groupRole}})
    }
    await client.close();
  }
  catch{
    console.log("error");
  }
}

module.exports = run;
