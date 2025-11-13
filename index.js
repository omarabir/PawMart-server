const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to PawMart server");
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
    // await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("pawmartDB");
    const listingsCollection = db.collection("listings");
    const ordersCollection = db.collection("orders");

    app.get("/listings", async (req, res) => {
      try {
        const { category, limit } = req.query;

        let query = {};
        if (category) query.category = category;

        let cursor = listingsCollection.find(query).sort({ _id: -1 });

        if (limit) {
          cursor = cursor.limit(parseInt(limit));
        }

        const listings = await cursor.toArray();
        res.send(listings);
      } catch (error) {
        console.error("Failed to fetch listings:", error);
        res.status(500).send({ message: "Server error" });
      }
    });

    app.get("/listings/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const listing = await listingsCollection.findOne({
          _id: new ObjectId(id),
        });
        if (!listing)
          return res.status(404).send({ message: "Listing not found" });
        res.send(listing);
      } catch (error) {
        console.error("Failed to fetch listing:", error);
        res.status(500).send({ message: "Server error" });
      }
    });

    app.post("/listings", async (req, res) => {
      try {
        const newListing = req.body;
        const result = await listingsCollection.insertOne(newListing);
        res.send(result);
      } catch (error) {
        console.error("Failed to create listing:", error);
        res.status(500).send({ message: "Server error" });
      }
    });

    app.get("/my-listings", async (req, res) => {
      try {
        const email = req.query.email;
        if (!email)
          return res.status(400).send({ message: "Email is required" });

        const listings = await listingsCollection.find({ email }).toArray();
        res.send(listings);
      } catch (error) {
        console.error("Failed to fetch user listings:", error);
        res.status(500).send({ message: "Server error" });
      }
    });

    app.delete("/listings/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const result = await listingsCollection.deleteOne({
          _id: new ObjectId(id),
        });
        res.status(200).json({ deletedCount: result.deletedCount });
      } catch (error) {
        console.error("Failed to delete listing:", error);
        res.status(500).send({ message: "Server error" });
      }
    });

    app.put("/listings/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const updatedData = { ...req.body };
        delete updatedData._id;

        const result = await listingsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedData }
        );

        if (result.modifiedCount === 0)
          return res
            .status(404)
            .send({ message: "Listing not found or no changes made" });

        res.status(200).send({ success: true });
      } catch (error) {
        console.error("Update error:", error);
        res.status(500).send({ message: "Failed to update listing" });
      }
    });

    app.get("/categories", async (req, res) => {
      try {
        const categories = await listingsCollection
          .aggregate([
            { $group: { _id: "$category" } },
            { $project: { _id: 0, category: "$_id" } },
          ])
          .toArray();

        const categoryList = categories.map((c) => c.category);

        res.send(categoryList);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        res.status(500).send({ message: "Server error" });
      }
    });

    app.get("/orders", async (req, res) => {
      try {
        const email = req.query.email;
        if (!email)
          return res.status(400).send({ message: "Email is required" });

        const orders = await ordersCollection.find({ email }).toArray();
        res.send(orders);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        res.status(500).send({ message: "Server error" });
      }
    });

    app.post("/orders", async (req, res) => {
      try {
        const order = req.body;
        if (!order.email || !order.productId)
          return res.status(400).send({ message: "Missing required fields" });

        const result = await ordersCollection.insertOne(order);
        res.send(result);
      } catch (error) {
        console.error("Failed to create order:", error);
        res.status(500).send({ message: "Server error" });
      }
    });

    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged MongoDB. Server ready!");
  } finally {
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
