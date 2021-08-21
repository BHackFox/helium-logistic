const { MongoClient } = require('mongodb');

const uri = "mongodb://localhost:27017/userSchema";

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run(query) {
  console.log(query);
  try {
    await client.connect();
    const database = client.db('userLogin');
    const user = database.collection('users');
    const result = await user.insertOne(query);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

module.exports = run;
