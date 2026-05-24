import dotenv from 'dotenv';
dotenv.config();

import app from './testApp.js';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Goal OS server running on http://localhost:${PORT}`);
});
