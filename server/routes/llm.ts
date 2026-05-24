import { Router } from 'express';

const router = Router();
const OLLAMA_URL = 'http://localhost:11434/v1/chat/completions';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

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

router.post('/parse', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'text required' });

  try {
    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen2.5:7b-instruct',
        messages: [
          { role: 'system', content: PARSE_SYSTEM_PROMPT },
          { role: 'user', content: text }
        ],
        temperature: 0.1,
        stream: false
      }),
      signal: AbortSignal.timeout(4000)
    });

    const data = await response.json() as any;
    const raw = data.choices?.[0]?.message?.content || '';
    res.json({ raw });
  } catch {
    res.json({ raw: '', offline: true });
  }
});

router.post('/coach', async (req, res) => {
  const { logsText } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(400).json({ error: 'GEMINI_API_KEY not set in .env' });
  }

  try {
    const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: COACH_SYSTEM_PROMPT + '\n\n' + logsText }] }
        ],
        generationConfig: { temperature: 0.3, maxOutputTokens: 512 }
      }),
      signal: AbortSignal.timeout(15000)
    });

    const data = await response.json() as any;
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from coach.';
    res.json({ text });
  } catch (e) {
    res.status(500).json({ error: 'Gemini call failed', detail: String(e) });
  }
});

router.get('/health', async (_req, res) => {
  try {
    const r = await fetch('http://localhost:11434/api/tags', { signal: AbortSignal.timeout(1500) });
    res.json({ online: r.ok });
  } catch {
    res.json({ online: false });
  }
});

export default router;
