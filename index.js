const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware 
app.use(cors());
app.use(express.json());

app.get('/', async (req, res) => {
    res.send('hello Ariful!');
});




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5eg9x.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const JobCollection = client.db("JobBd").collection("jobs");
    const applidJobCollection = client.db("JobBd").collection("job_collection");

    app.get('/jobs', async (req, res) => {
      const jobs = await JobCollection.find().toArray();
      res.json(jobs);
    });


    // job-applicaint all data get mongodb server by apliclint email 
    app.get('/jobApplicaints', async (req, res) => {
      const email = req.query.email;
      const query = { appliclint_email: email };
      const result = await applidJobCollection.find(query).toArray();

      // jobs theke jobId er maddome data load korbo 
      for(const applicalintJob of result){
        const jobQuery = {_id: new ObjectId(applicalintJob.jobId)};
        const jobResult = await JobCollection.findOne(jobQuery);
        if(jobResult){
          applicalintJob.title = jobResult.title;
          applicalintJob.company = jobResult.company;
          applicalintJob.company_logo = jobResult.company_logo;
          applicalintJob.location = jobResult.location;
        }
      }
      res.send(result);
    })


app.get('/jobs/:id', async (req, res) => {
  const id = req.params.id;
  const query = {_id: new ObjectId(id)};
  const result = await JobCollection.findOne(query);
  res.send(result);
});


// create applyd data send mongo db 
app.post('/job-applications', async (req, res) => {
  const jobApplication = req.body;
  const result = await applidJobCollection.insertOne(jobApplication);
  res.send(result);
})

// add job post api 
app.post('/jobs', async (req, res) =>{
  const newJob = req.body;
  const result = await JobCollection.insertOne(newJob);
  res.send(result);
});






    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`);
})