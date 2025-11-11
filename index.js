const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to pawmart server");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

const uri =
  "mongodb+srv://pawmart:RUyrZxRdKWmUniYR@cluster0.ojsqemw.mongodb.net/?appName=Cluster0";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    await client.connect();

    const db = client.db("pawmartDB");
    const listingsCollection = db.collection("listings");

    app.get("/listings", async (req, res) => {
      const listings = await listingsCollection.find().toArray();
      res.send(listings);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);
