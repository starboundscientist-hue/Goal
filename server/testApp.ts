import express from 'express';
import cors from 'cors';
import progressRouter from './routes/progress.js';
import workRouter from './routes/work.js';
import gitRouter from './routes/git.js';
import llmRouter from './routes/llm.js';
import motivationRouter from './routes/motivation.js';
import sprintsRouter from './routes/sprints.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/progress', progressRouter);
app.use('/api/work', workRouter);
app.use('/api/git', gitRouter);
app.use('/api/llm', llmRouter);
app.use('/api/motivation', motivationRouter);
app.use('/api/sprints', sprintsRouter);

export default app;
