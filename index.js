const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
    const ordersCollection = db.collection("orders");

    app.get("/listings", async (req, res) => {
      const listings = await listingsCollection.find().toArray();
      res.send(listings);
    });

    app.get("/listings/:id", async (req, res) => {
      const { id } = req.params;
      const listing = await listingsCollection.findOne({
        _id: new ObjectId(id),
      });
      res.send(listing);
    });

    app.post("/listings", async (req, res) => {
      const newListing = req.body;
      const result = await listingsCollection.insertOne(newListing);
      res.send(result);
    });
    app.get("/my-listings", async (req, res) => {
      const email = req.query.email;
      if (!email) {
        return res.status(400).send({ message: "Email is required" });
      }

      const listings = await listingsCollection.find({ email }).toArray();
      res.send(listings);
    });

    app.delete("/listings/:id", async (req, res) => {
      const { id } = req.params;
      const result = await listingsCollection.deleteOne({
        _id: new ObjectId(id),
      });

      res.status(200).json({ deletedCount: result.deletedCount });
    });

    // orders
    app.get("/orders", async (req, res) => {
      const email = req.query.email;
      if (!email) {
        return res.status(400).send({ message: "Email is required" });
      }
      const orders = await ordersCollection.find({ email }).toArray();
      res.send(orders);
    });
    app.post("/orders", async (req, res) => {
      const order = req.body;
      if (!order.email || !order.productId) {
        return res.status(400).send({ message: "Missing required fields" });
      }
      const result = await ordersCollection.insertOne(order);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);
