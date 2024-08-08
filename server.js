const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

console.log('MONGODB_URI:', process.env.MONGODB_URI); // Log the URI for debugging

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Atlas connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// Define the schema to match the fields in your form
const entrySchema = new mongoose.Schema({
  driverName: String,
  vehicleNumber: String,
  date: String,
  present: Boolean,
  advance: Number,
  cngCost: Number,
  driverSalary: Number,
  shiftTo: String,
  billTo: String,
  partyRate: Number,
  gstPercent: Number,
  vehicleRate: Number,
  remark: String
});

const Entry = mongoose.model('Entry', entrySchema);

// Route to fetch all entries, sorted by date
app.get('/entries', async (req, res) => {
  console.log('GET /entries request received'); // Log the request for debugging
  try {
    const entries = await Entry.find().sort({ date: -1 }); // Sort by date in descending order
    res.json(entries);
  } catch (error) {
    console.error('Error fetching entries:', error); // Log the error
    res.status(500).send('Error fetching entries');
  }
});

// Route to add a new entry
app.post('/add-entry', async (req, res) => {
  console.log('POST /add-entry request received with data:', req.body); // Log the request data for debugging

  // Convert numeric fields to numbers
  const { advance, cngCost, driverSalary, partyRate, gstPercent, vehicleRate, present } = req.body;

  try {
    const newEntry = new Entry({
      ...req.body,
      advance: Number(advance),
      cngCost: Number(cngCost),
      driverSalary: Number(driverSalary),
      partyRate: Number(partyRate),
      gstPercent: Number(gstPercent),
      vehicleRate: Number(vehicleRate),
      present: present.toLowerCase() === 'present' // Convert "present" to true and anything else to false
    });

    await newEntry.save();
    res.json(newEntry);
  } catch (error) {
    console.error('Error adding entry:', error); // Log the error
    res.status(500).send('Error adding entry');
  }
});


// Route to update an existing entry
app.put('/edit-entry/:id', async (req, res) => {
  console.log('PUT /edit-entry request received with data:', req.body); // Log the request data for debugging
  try {
    const updatedEntry = await Entry.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedEntry) {
      return res.status(404).send('Entry not found');
    }
    res.json(updatedEntry);
  } catch (error) {
    console.error('Error updating entry:', error); // Log the error
    res.status(500).send('Error updating entry');
  }
});

// Route to delete an entry
app.delete('/delete-entry/:id', async (req, res) => {
  console.log('DELETE /delete-entry request received for ID:', req.params.id); // Log the request ID for debugging
  try {
    const deletedEntry = await Entry.findByIdAndDelete(req.params.id);
    if (!deletedEntry) return res.status(404).send('Entry not found');
    res.json(deletedEntry);
  } catch (error) {
    console.error('Error deleting entry:', error); // Log the error
    res.status(500).send('Error deleting entry');
  }
});

// Route to delete multiple entries
app.post('/delete-entries', async (req, res) => {
  const { ids } = req.body;
  console.log('POST /delete-entries request received with ids:', ids); // Log the request IDs for debugging
  try {
    const result = await Entry.deleteMany({ _id: { $in: ids } });
    res.json(result);
  } catch (error) {
    console.error('Error deleting multiple entries:', error); // Log the error
    res.status(500).send('Error deleting multiple entries');
  }
});

// Handle favicon.ico requests
app.get('/favicon.ico', (req, res) => res.status(204));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
