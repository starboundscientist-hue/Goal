import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import progressRouter from './routes/progress.js';
import workRouter from './routes/work.js';
import gitRouter from './routes/git.js';
import llmRouter from './routes/llm.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/progress', progressRouter);
app.use('/api/work', workRouter);
app.use('/api/git', gitRouter);
app.use('/api/llm', llmRouter);

app.listen(PORT, () => {
  console.log(`Goal OS server running on http://localhost:${PORT}`);
});
