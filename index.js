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
    const myCourse = client.db("JobBd").collection("Course_collection");
    const registerCollection = client.db("JobBd").collection("Register_collection");
    const rivewsCollection = client.db("JobBd").collection("Rivews_collection");

    app.get('/jobs', async (req, res) => {
      const email = req.query.email;
      let query = {};
      if(email){
        query = {hrEmail : email}
      } 

      const jobs = await JobCollection.find(query).toArray();
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
  const id = jobApplication.jobId;
  const query = {_id: new ObjectId(id)};
  const job = await JobCollection.findOne(query);
  let newCount = 0;
  if(job.applicationCount){
    newCount = job.applicationCount + 1;
  }
  else{
    newCount = 1;
  }
  const filter = {_id: new ObjectId(id)}
  const updateDoc = {
    $set: {
      applicationCount: newCount
    }
  }
  const updateResult = await JobCollection.updateOne(filter, updateDoc);
  res.send(result);
})

// add job post api 
app.post('/jobs', async (req, res) =>{
  const newJob = req.body;
  const result = await JobCollection.insertOne(newJob);
  res.send(result);
});

// my post job view api 
app.get('/job-applications/jobs/:jobId', async (req, res) => {
  const job_id = req.params.jobId;
  const query = {jobId: job_id};
  const result = await applidJobCollection.find(query).toArray();
  res.send(result);
})

// update job Appliclint api

app.patch('/job-applications/:id', async (req, res) => {
  const id = req.params.id;
  const updatedJob = req.body;
  const filter = {_id: new ObjectId(id)};
  const updateDoc = {
    $set: {
      status: updatedJob.status
    }
  }
  const result = await applidJobCollection.updateOne(filter, updateDoc);
  res.send(result);
})

// My course api
app.post('/myCourses', async (req, res) => {
  const course = req.body;
  const result = await myCourse.insertOne(course);
  res.send(result);
})


// my course get 
app.get('/myCourses', async (req, res) => {
  const email = req.query.email;
  let query = {};
  if(email){
    query = {hrEmail : email}
  } 

  const result = await myCourse.find(query).toArray();
  res.send(result);
});

// detlails course 
app.get('/myCourses/:id', async (req, res) => {
  const id = req.params.id;
  const query = {_id: new ObjectId(id)};
  const result = await myCourse.findOne(query);
  res.send(result);
})


// 🔹 নতুন ইউজার রেজিস্টার (POST)
app.post('/register', async (req, res) => {
  const newUser = req.body;
  const result = await registerCollection.insertOne(newUser);
  res.send(result);
});

// 🔹 সব ইউজার রিটার্ন (GET)
app.get('/register', async (req, res) => {
  const result = await registerCollection.find().toArray();
  res.send(result);
});

// 🔹 নির্দিষ্ট email দিয়ে ইউজার খোঁজা (GET)
app.get('/register/email', async (req, res) => {
  const email = req.query.email;
  if (!email) {
      return res.status(400).send({ message: "Email is required" });
  }

  const user = await registerCollection.findOne({ email: email });
  if (!user) {
      return res.status(404).send({ message: "User not found" });
  }

  res.send(user);
});

// reviws data load 
app.post('/reviews', async (req, res) => {
  const review = req.body;
  const result = await rivewsCollection.insertOne(review);
  res.send(result);
})

// reviws data load  all
app.get('/reviews', async (req, res) => {
  const result = await rivewsCollection.find().toArray();
  res.send(result);
})



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