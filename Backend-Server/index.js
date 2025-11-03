const express = require('express');
const morgan = require('morgan');
const config = require('./config');
const projectRouter = require('./routes/project');

const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());
app.use(morgan('dev'));

// Project routes
app.use('/api/project', projectRouter);

app.get('/', (req, res) => {
  res.send('Backend Server is running');
});

// Generic error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const port = config.PORT || 3000;
app.listen(port, () => {
  console.log(`Server Running on http://localhost:${port}`);
});
