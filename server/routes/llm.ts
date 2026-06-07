import { Router } from 'express';

const router = Router();

const PARSE_SYSTEM_PROMPT = `You are a silent background parser for Goal OS.
Parse the user's text into a JSON object. Output ONLY a raw JSON object, no markdown, no explanation.

Cluster IDs and their keywords:
- "alpha": CUDA, Triton, transformers, LLMs, GPT, attention, distributed training, FSDP, DeepSpeed, quantization, RL, PPO, SAC
- "beta": SLAM, Kalman filter, EKF, UKF, MPC, LQR, PID, MuJoCo, robotics, rigid-body, control, state estimation, trajectory
- "gamma": FreeRTOS, RTOS, STM32, embedded C, C++, edge inference, TFLite, TensorRT, FPGA, CAN bus, I2C, SPI
- "delta": plasma, PDEs, PINNs, finite difference, numerical methods, physics simulation, Hamiltonian, Lagrangian
- "epsilon": Docker, Kubernetes, k8s, CI/CD, MLOps, Ray, Kafka, Terraform, W&B, MLflow, DVC
- "foundations": linear algebra, SVD, statistics, Bayesian, DSA, algorithms, OS concepts, computer architecture, math
- "work": meetings, PR review, Jira, Slack, deployment, on-call, report, sprint, standup
- "unknown": anything else

JSON schema (output exactly this shape):
{
  "cluster_id": "alpha" | "beta" | "gamma" | "delta" | "epsilon" | "foundations" | "work" | "unknown",
  "topic_guess": "short descriptive string of the specific topic",
  "hours": float (estimate from context, default 1.0 if not mentioned),
  "is_completed": boolean (true if done/finished/working, false if stuck/debugging/in progress)
}`;

const COACH_SYSTEM_PROMPT = `You are the Goal OS Systems Coach. Analyze the user's study data and produce a dense, actionable weekly diagnosis.

Format your response EXACTLY as follows — use these exact section headers, no markdown bold, no bullet lists, plain text paragraphs:

MOMENTUM
[2-3 sentences on which clusters had strong activity and which are declining]

ARCHITECTURE RISK
[1-2 sentences identifying the most dangerous gap — a prerequisite not met before advanced work]
[One specific action item starting with →]

PHASE GAP
[Which clusters are at 0% or very low that will block the next phase]
[One specific action item starting with →]

PACE
[One line: This week: Xh | 4-week avg: Xh | Target: Xh/week → ON TRACK / BEHIND / AHEAD]

Keep the total response under 200 words. Be direct. No encouragement, no fluff.`;

function openRouterHeaders() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  };
}

async function openRouterFetch(path: string, options: RequestInit, timeout: number): Promise<Response | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;
  try {
    return await fetch(`https://openrouter.ai${path}`, {
      ...options,
      headers: { ...openRouterHeaders(), ...(options.headers as Record<string, string> | undefined) },
      signal: AbortSignal.timeout(timeout),
    });
  } catch (err) {
    console.warn(`[openRouter] ${path} failed:`, err instanceof Error ? err.message : err);
    return null;
  }
}

router.post('/parse', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'text required' });

  const response = await openRouterFetch('/api/v1/chat/completions', {
    method: 'POST',
    body: JSON.stringify({
      model: 'google/gemma-2-9b-it',
      messages: [
        { role: 'system', content: PARSE_SYSTEM_PROMPT },
        { role: 'user', content: text }
      ],
      temperature: 0.1,
      stream: false
    }),
  }, 8000);

  if (!response || !response.ok) {
    return res.json({ raw: '', offline: true });
  }

  try {
    const data = await response.json() as any;
    const raw = data.choices?.[0]?.message?.content || '';
    res.json({ raw });
  } catch {
    res.json({ raw: '', offline: true });
  }
});

router.post('/coach', async (req, res) => {
  const { logsText } = req.body;

  const response = await openRouterFetch('/api/v1/chat/completions', {
    method: 'POST',
    body: JSON.stringify({
      model: 'google/gemma-2-9b-it',
      messages: [
        { role: 'system', content: COACH_SYSTEM_PROMPT },
        { role: 'user', content: logsText }
      ],
      temperature: 0.3,
      max_tokens: 512,
      stream: false
    }),
  }, 15000);

  if (!response || !response.ok) {
    return res.json({ text: '', offline: true });
  }

  try {
    const data = await response.json() as any;
    const text = data.choices?.[0]?.message?.content || '';
    res.json({ text });
  } catch {
    res.json({ text: '', offline: true });
  }
});

router.get('/health', (_req, res) => {
  res.json({ online: !!process.env.OPENROUTER_API_KEY });
});

const SUBTASK_SUGGEST_PROMPT = `You are a planning assistant for Goal OS.
Given a task title (and optional context), break it down into 3-6 concrete, actionable subtasks.
Each subtask should be a single verb-led phrase, short (under 60 chars), specific, and executable.

Output ONLY a raw JSON object — no markdown, no explanation, no preamble.
Schema:
{
  "subtasks": ["Subtask 1", "Subtask 2", "Subtask 3"]
}`;

router.post('/suggest-subtasks', async (req, res) => {
  const { title, context } = req.body as { title?: string; context?: string };
  if (!title) return res.status(400).json({ error: 'title required' });

  const userText = context
    ? `Task: ${title}\nContext: ${context}`
    : `Task: ${title}`;

  const response = await openRouterFetch('/api/v1/chat/completions', {
    method: 'POST',
    body: JSON.stringify({
      model: 'google/gemma-2-9b-it',
      messages: [
        { role: 'system', content: SUBTASK_SUGGEST_PROMPT },
        { role: 'user', content: userText },
      ],
      temperature: 0.4,
      max_tokens: 400,
      stream: false,
    }),
  }, 10000);

  if (!response || !response.ok) {
    return res.json({ subtasks: [], offline: true });
  }

  try {
    const data = await response.json() as any;
    const raw: string = data.choices?.[0]?.message?.content || '';
    // Extract first JSON object from the raw text
    const first = raw.indexOf('{');
    const last = raw.lastIndexOf('}');
    if (first === -1 || last === -1) {
      return res.json({ subtasks: [], offline: true });
    }
    const parsed = JSON.parse(raw.slice(first, last + 1));
    const list: unknown = parsed.subtasks;
    if (!Array.isArray(list)) {
      return res.json({ subtasks: [], offline: true });
    }
    const clean = list
      .filter((s): s is string => typeof s === 'string')
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .slice(0, 8);
    res.json({ subtasks: clean });
  } catch {
    res.json({ subtasks: [], offline: true });
  }
});

export default router;
