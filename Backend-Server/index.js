const express = require('express');
const morgan = require('morgan');
const config = require('./config');
const projectRouter = require('./routes/project');

const app = express();
app.use(express.json());
app.use(morgan('dev'));

// Project routes
app.use('/project', projectRouter);

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
