const { MongoClient } = require('mongodb');


async function connectMongoDB(){

  const uri = "mongodb+srv://fede:fede@cluster1.vzqut.mongodb.net/userSchema?retryWrites=true&w=majority";

  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  client.connect(err => {
    const collection = client.db("test").collection("devices");
    // perform actions on the collection object
    client.close();
  });
  console.log("Connesso");
  return client;
}

module.exports = connectMongoDB;
