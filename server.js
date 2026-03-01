require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const formRoutes = require('./routes/formRoutes');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use('/api', formRoutes);

app.get('/', (req, res) => {
  res.json({ status: 'AJewelBot v2 API is running' });
});

app.listen(PORT, () => {
  console.log(`AJewelBot v2 running on port ${PORT}`);
});
