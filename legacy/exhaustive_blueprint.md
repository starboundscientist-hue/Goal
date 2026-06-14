# The Embodied Autonomy AI Engineer — Complete Exhaustive Blueprint

## The Dream
Build the capacity to create the intelligent core of machines that move, fly, and explore. Operate at the frontier of AI (research engineer/scientist) AND apply that capability to embodied systems: spacecraft, rockets, robots, autonomous vehicles, and planetary habitats. Release work into the open-source commons to bend the future toward Scenario C/D — post-scarcity abundance, not techno-feudalism.

## Target Roles
1. **Frontier AI Research Scientist** — LLM/VLM architecture, scaling laws, novel training paradigms, multimodal foundation models
2. **Frontier AI Research Engineer** — Large-scale distributed training, CUDA/C++ optimization, inference acceleration, model deployment infrastructure
3. **Embodied Autonomy — Space & Rockets** — Orbital GNC, flight software, satellite autonomy, onboard AI, propulsion, ISRU, planetary surface operations
4. **Embodied Autonomy — Robotics** — Manipulation, locomotion, drones, sim-to-real
5. **Embodied Autonomy — Autonomous Vehicles** — Perception, planning, prediction, embedded deployment
6. **Space Science / Physics** — ML for astrophysics, space weather, plasma simulation (escape hatch)
7. **Infrastructure & Platform Engineering** — Deep systems: ML infra, HPC, edge deployment, GPU/CPU architecture

---

## Language Strategy (C++ / Python / TypeScript+React)

This plan deliberately limits to three languages that cover ~90% of the serious systems in robotics, AV, space, and frontier AI:

| Language | Domain |
|---|---|
| **Modern C++** (no separate C track) | On-device autonomy, control, flight software, performance-critical servers, CUDA kernels |
| **Python** | ML research, data pipelines, orchestration, ROS2 glue, simulation scripting |
| **TypeScript + React** | Mission control UIs, dashboards, labeling tools, developer tooling, internal platforms |

Key decisions:
- **C++ is primary.** Learn modern C++ properly (STL, RAII, concurrency, Eigen, ROS2) and C comes naturally as a subset. No dedicated C curriculum.
- **No Java, Go, Zig, or Rust** in this plan. They'd add marginal return for the time cost; C++ + Python covers the same surface.
- **C++ for DSA** (LeetCode), then **translate to Python** for coding rounds — builds C++ depth while still passing FAANG interviews.
- **Frontend at SDE-2 dashboard level** — just-in-time, learned through building (Goal OS, mission control UIs), not as a separate discipline.
- **Python for everything else** — research, data, tooling, simulation glue, quick infrastructure.

This maps cleanly to the three Career Tracks: C++/Python in ζ (SDE Engineering), Python-heavy in η (ML Engineering), TypeScript+React in θ (Fullstack/Product).

---

## Knowledge Clusters (α–ε + Foundational Substrate + Career Tracks)

### Cluster α — Frontier AI/ML: The Model Engine
Serves: Research Scientist, Research Engineer. Underpins all AI-for-physical-systems work.

**Topics:**

#### α.1 Transformer architectures, SSMs, MoE, multimodal models

**Subtopics:**
- Attention: scaled dot-product, multi-head, cross-attention, causal masking, flash attention
- Positional encodings: sinusoidal, learned, RoPE, ALiBi, relative position bias
- Transformer variants: encoder-only (BERT), decoder-only (GPT), encoder-decoder (T5), prefix LM
- State-space models: S4 (structured state space), Mamba (selective SSM), Mamba-2
- Mixture-of-Experts: sparse MoE layers, top-k routing, load balancing loss, expert parallelism
- Multimodal: vision encoders (ViT, SigLIP), cross-attention fusion, VLA models (RT-2, Octo, PaLM-E)
- Multi-Query Attention (MQA): single KV head shared across all Q heads; reduces KV cache memory linearly with head count
- Grouped Query Attention (GQA): K shared KV head groups interpolating between MHA and MQA; used in LLaMA 2/3, Mistral, Gemma 2
- Multi-head Latent Attention (MLA, DeepSeek-V2/V3): low-rank KV projection + decoupled RoPE; further reduces KV cache without quality loss
- FlashAttention 1/2/3: IO-aware tiling in SRAM, online softmax normalization, Flash-Decoding for long sequences and parallel decode phase

**Study:**
- Vaswani et al. "Attention Is All You Need" — read the original
- Harvard NLP "The Annotated Transformer" — code walkthrough
- RoPE (Su et al.), ALiBi (Press et al.) — one afternoon each
- Gu & Dao "Mamba: Linear-Time Sequence Modeling"
- Shazeer et al. "Outrageously Large Neural Networks" — MoE origins
- RT-2, PaLM-E, CLIP, LLaVA papers for multimodal fusion
- "GQA: Training Generalized Multi-Query Transformer Models from Multi-Head Checkpoints" (Ainslie et al., 2023)
- FlashAttention-3 paper (Shah et al., 2024) — asynchronous pipelining, low-precision support on Hopper H100
- DeepSeek-V2 technical report (2024) — MLA architecture, KV cache compression design

**Close:** Implement a minimal GPT-2 decoder block (attn + FFN + RoPE) in PyTorch; train a tiny language model on Shakespeare to verify loss decreases.

---

#### α.2 Scaling laws, training dynamics, data curation, evaluation

**Subtopics:**
- Scaling laws: loss vs param count, Chinchilla optimal compute, data scaling, compute-optimal training
- Training dynamics: warmup (linear/cosine), LR schedules, batch size scaling, gradient noise scale
- Data curation: deduplication (MinHash, Bloom filters), quality filtering, perplexity filtering, decontamination
- Evaluation: perplexity, downstream tasks, MMLU, HumanEval, HELM, LLM-as-judge, calibration
- Emergent abilities, grokking, double descent

**Study:**
- Kaplan et al. "Scaling Laws for Neural Language Models"
- Hoffmann et al. "Training Compute-Optimal Large Language Models" (Chinchilla)
- "Scaling Data-Constrained Language Models" (Muennighoff et al.)
- "Deduplicating Training Data Makes Language Models Better" (Lee et al.)
- MMLU, HumanEval, HELM evaluation frameworks — understand the benchmarks you're targeting

**Close:** Train 3 small transformers (70M, 150M, 300M params) on a fixed dataset, plot loss vs compute, verify Chinchilla scaling prediction.

---

#### α.3 Distributed training (FSDP, DeepSpeed, Megatron)

**Subtopics:**
- Data parallelism (DDP): all-reduce gradients, gradient accumulation, communication overhead
- Fully Sharded Data Parallel (FSDP): sharding params/grads/optimizer states, hybrid sharding
- DeepSpeed ZeRO stages (1/2/3): optimizer state partitioning, gradient partitioning, parameter partitioning
- Tensor parallelism: column/row linear splits, Megatron-LM strategy, communication patterns
- Pipeline parallelism: GPipe, 1F1B schedule, interleaved scheduling, bubble size
- Mixed precision training (fp16/bf16), gradient scaling, loss scaling

**Study:**
- PyTorch FSDP official tutorial + walkthrough
- DeepSpeed documentation + ZeRO papers (Rajbhandari et al.)
- "Efficient Large-Scale Language Model Training on GPU Clusters Using Megatron-LM" — tensor/pipeline implementation
- "Reducing Activation Recomputation in Large Transformer Models" — activation checkpointing
- NVIDIA NCCL documentation — understand all-reduce, all-gather, reduce-scatter primitives

**Close:** Train a 1B param model on 2+ GPUs using FSDP; log throughput (tokens/sec), GPU utilization, memory; compare DDP vs FSDP vs ZeRO-3.

---

#### α.4 Low-level GPU programming (CUDA, Triton, CUTLASS)

**Subtopics:**
- CUDA memory hierarchy: global, shared, registers, local memory; coalesced vs strided access
- Thread hierarchy: grid → block → warp → thread; occupancy, warp divergence, bank conflicts
- CUDA kernels: vector addition, matrix multiplication (naive → tiled → with shared memory)
- Triton: block-level programming, pointer arithmetic, automatic tile scheduling
- CUTLASS: template-based GEMM, epilogue fusion, hierarchical tiling
- Kernel fusion: fusing elementwise ops, flash attention as a case study
- Profiling: Nsight Compute (kernel analysis), Nsight Systems (timeline), occupancy API

**Study:**
- NVIDIA CUDA Programming Guide (docs.nvidia.com) — chapters 1-5 mandatory
- "Programming Massively Parallel Processors" (Kirk & Hwu) — best textbook
- "CUDA Mode" YouTube lectures (Mark Saroufim) — practical walkthroughs
- Triton official tutorials (triton-lang.org) — first 4 tutorials
- CUTLASS documentation + examples — study the GEMM template
- Flash Attention 1/2 papers — read the kernel fusion strategy

**Close:** Write a fused attention kernel in CUDA and Triton; benchmark against PyTorch's `scaled_dot_product_attention` across various sequence lengths and head dims.

---

#### α.5 Numerical stability (mixed precision, gradient accumulation)

**Subtopics:**
- fp16 vs bf16 vs fp32: dynamic range, precision, overflow/underflow
- Loss scaling: static vs dynamic, gradient histogram monitoring
- Gradient accumulation: effective batch size, BN statistics, loss scaling interaction
- Stochastic rounding, weight decay with mixed precision, master weights
- Numerical debugging: loss spikes, NaN detection, gradient clipping, log softmax stability

**Study:**
- "Mixed Precision Training" (Micikevicius et al., 2017) — the original paper
- NVIDIA AMP (Automatic Mixed Precision) documentation
- "Training Deep Networks with Loss Scaling" — practical considerations

**Close:** Train the same model in fp32 and bf16; log gradient histograms every 100 steps; identify and fix any numerical divergence.

---

#### α.6 Inference optimization (quantization, distillation, pruning, serving)

**Subtopics:**
- Post-training quantization (PTQ): INT8, INT4, NF4; symmetric vs asymmetric; per-tensor vs per-channel
- Quantization-aware training (QAT): fake quantization, straight-through estimator
- GPTQ: approximate Hessian-based weight quantization, group size
- AWQ: activation-aware weight quantization, per-group scaling
- Distillation: logit-based, feature-based, on-policy vs off-policy
- Pruning: unstructured (magnitude, SparseGPT), structured (attention head, layer)
- Continuous batching, PagedAttention (vLLM), KV cache management
- TensorRT-LLM: graph optimization, plugin kernels, in-flight batching
- ONNX Runtime: model export, graph optimization, execution providers
- Speculative decoding: small draft model generates K tokens, large verifier accepts/rejects in one forward pass; tree speculation variants (Medusa, EAGLE)
- RAG (Retrieval-Augmented Generation): dense retrieval (DPR, FAISS), chunking + embedding strategies, hybrid BM25+dense, cross-encoder re-ranking, ColBERT late interaction
- Long context extension: RoPE NTK-aware scaling, YaRN, LongRoPE; ring attention (sequence-parallel across devices); Flash-Decoding (split KV across blocks for decode phase)
- KV cache optimizations: prefix caching (RadixAttention in SGLang), FP8 KV quantization, cross-request KV sharing, chunked prefill vs continuous batching

**Study:**
- "GPTQ: Accurate Post-Training Quantization for Generative Pre-trained Transformers"
- "AWQ: Activation-aware Weight Quantization for LLM Compression and Acceleration"
- "SparseGPT: Massive Language Models Can Be Accurately Pruned in One-Shot"
- vLLM paper "Efficient Memory Management for Large Language Model Serving with PagedAttention"
- TensorRT-LLM documentation + release notes
- ONNX Runtime quantization tools documentation
- "Fast Inference from Transformers via Speculative Decoding" (Leviathan et al., 2022)
- "YaRN: Efficient Context Window Extension of Large Language Models" (Peng et al., 2023)
- "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks" (Lewis et al., 2020)
- FAISS documentation (github.com/facebookresearch/faiss) — GPU-accelerated similarity search, IVF + PQ indices
- SGLang documentation (sglang.readthedocs.io) — RadixAttention, structured generation, constrained decoding

**Close:** Quantize a LLaMA-7B (or equivalent) to INT4 with GPTQ; deploy with vLLM; benchmark throughput and latency at batch sizes [1, 4, 16, 32].

---

#### α.7 Reinforcement learning (PPO, SAC, RLHF/DPO, sim-to-real, multi-agent RL)

**Subtopics:**
- Classic RL: MDPs, policy gradient theorem, REINFORCE, advantage estimation (GAE)
- PPO: clipped surrogate objective, adaptive KL penalty, trust region
- SAC: maximum entropy RL, twin Q-networks, automatic temperature tuning
- RLHF: reward modeling, PPO in language space, KL penalty against reference model
- DPO: direct preference optimization, closed-form policy update, no reward model needed
- Sim-to-real: domain randomization, system identification, disturbance injection
- Multi-agent RL: centralized training decentralized execution (CTDE), MADDPG, QMIX
- Baselines libraries: Stable-Baselines3 (continuous control), TRL (language), RLLib (multi-agent)
- GRPO (Group Relative Policy Optimization): sample N completions per prompt, compute relative advantage within group, KL to reference — no separate critic model; DeepSeek-R1 core training algorithm
- RLAIF (RL from AI Feedback): AI-generated preference labels via a constitutional judge model; reduces dependence on human annotation at scale
- Rejection sampling fine-tuning (RFT): generate multiple rollouts, keep those with verified correct outcomes, retrain; simple and effective for math and code domains
- ORPO (Odds Ratio Preference Optimization) and SimPO: reference-model-free DPO variants; reduce memory and training complexity while matching DPO quality

**Study:**
- "Proximal Policy Optimization Algorithms" (Schulman et al., 2017)
- "Soft Actor-Critic: Off-Policy Maximum Entropy Deep RL" (Haarnoja et al.)
- "Training Language Models to Follow Instructions with Human Feedback" (Ouyang et al., InstructGPT)
- "Direct Preference Optimization" (Rafailov et al.) — key alternative to RLHF
- "Domain Randomization for Transferring Deep Neural Networks from Simulation to the Real World" (Tobin et al.)
- Spinning Up in Deep RL (OpenAI) — PPO, SAC implementations
- TRL library (Transformer Reinforcement Learning) — hands-on RLHF
- DeepSeek-R1 technical report (2025) — GRPO algorithm, multi-phase training pipeline, cold-start data for reasoning
- "Constitutional AI: Harmlessness from AI Feedback" (Bai et al., Anthropic, 2022) — RLAIF methodology
- "ORPO: Monolithic Preference Optimization without Reference Model" (Hong et al., 2024)

**Close:** Train a PPO agent in MuJoCo (HalfCheetah), record reward curve; then fine-tune a small LLM with DPO on a preference dataset; compare the RL alignment vs DPO approach.

---

#### α.8 Data pipelines (tokenization, streaming, filtering, curation)

**Subtopics:**
- Tokenization: BPE, WordPiece, Unigram, SentencePiece, tiktoken (for OpenAI tokenizer)
- Streaming datasets: webdataset, Mosaic StreamingDataset, datatrove, multi-GPU data loading
- Data filtering: quality heuristics (perplexity, LMs core), PII removal, toxicity filtering
- Deduplication: MinHash LSH, exact dedup, Bloom filters, particle dedup
- Synthetic data: self-instruct, Evol-Instruct, rejection sampling, model-generated data
- Data versioning: DVC, Hugging Face Datasets, Parquet/Arrow for efficient storage

**Study:**
- "Tokenization Matters" (Mielke et al.) — or "Neural Machine Translation of Rare Words with Subword Units" (BPE origin)
- webdataset GitHub + documentation — streaming for large-scale training
- "Deduplicating Training Data Makes Language Models Better" (Lee et al.)
- "Self-Instruct: Aligning Language Models with Self-Generated Instructions"
- Hugging Face Datasets library — practical data loading
- PyArrow documentation — columnar format for ML data

**Close:** Build an end-to-end data pipeline: download CommonCrawl sample → filter by quality heuristics → deduplicate → tokenize → stream to training loop; log throughput and loss curves.

---

#### α.9 Test-time compute scaling (chain-of-thought, PRMs, reasoning models)

**Subtopics:**
- Chain-of-thought (CoT): zero-shot CoT, few-shot exemplars, self-consistency (majority vote over K sampled completions)
- Process Reward Models (PRMs): step-level supervision vs outcome-only ORM; Monte Carlo estimation of process reward; MATH-Shepherd
- Best-of-N and search: temperature sampling + verifier re-ranking; beam search at inference; MCTS for reasoning (rStar-Math, AlphaCode 2)
- GRPO for reasoning: group sampling (N completions per prompt), relative advantage, KL to reference — no critic; see α.7 for algorithm; this topic covers applying it specifically to reasoning domains
- Test-time compute scaling laws: when more inference compute beats a bigger model; frontier models (o1/o3/R1) exploit this heavily
- Verification-based training: unit tests / math checkers as ground-truth verifiers; "reward is available" assumption; code and math as ideal domains for this
- Multi-step tool use: code interpreter, calculator, web search as inference-time tools; ReAct pattern; Toolformer; function calling
- Self-correction and iterative refinement: STaR (self-taught reasoner), CRITIC, iterative DPO; when self-correction helps vs hurts

**Study:**
- "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models" (Wei et al., 2022)
- "Self-Consistency Improves Chain of Thought Reasoning in Language Models" (Wang et al., 2022)
- "Let's Verify Step by Step" (Lightman et al., OpenAI, 2023) — PRM construction methodology
- DeepSeek-R1 technical report (2025) — GRPO, multi-phase training, cold-start data for reasoning
- "Scaling LLM Test-Time Compute Optimally Improves Language Model Ability" (Snell et al., 2024)
- "rStar-Math: Small LLMs Can Master Math Reasoning with Self-Evolved Deep Thinking" (Zhang et al., 2025)
- "STaR: Self-Taught Reasoner: Bootstrapping Reasoning with Reasoning" (Zelikman et al., 2022)

**Close:** Train a 1–3B LLM with GRPO on GSM8K or MATH; implement a PRM verifier using Monte Carlo rollout estimation; compare accuracy under (a) greedy decode, (b) best-of-N sampling, (c) best-of-N + PRM re-ranking; plot a compute-vs-accuracy curve.

### Cluster β — Embodied AI: Making Models Move
Serves: Space GNC, Robotics, AV. The physics of intelligent motion.

**Topics:**

#### β.1 Classical and modern control (PID, LQR, LQG, MPC, robust control)

**Subtopics:**
- PID: proportional/integral/derivative terms, tuning (Ziegler-Nichols, Cohen-Coon), integral windup, anti-windup
- State-space representation: continuous vs discrete, controllability, observability, canonical forms
- LQR: cost function design, solving the algebraic Riccati equation, gain scheduling
- LQG / Kalman + LQR: separation principle, loop transfer recovery
- MPC: receding horizon, quadratic programming, constraint handling (input/state), real-time iteration
- Robust control: H∞, gain margin, phase margin, uncertainty modeling, mu-synthesis (concept level)
- Implementation: discrete-time controllers, fixed-point arithmetic, sample rate selection, anti-aliasing filters

**Study:**
- **Spine:** Coursera "Modern Robotics: Mechanics, Planning, and Control" (Lynch) — course 3 covers control
- CMU 16-299 "Introduction to Feedback Control Systems" — designed for CS majors, hands-on
- *Modern Control Engineering* (Ogata) — chapters on PID, state-space, LQR
- "Model Predictive Control: Theory and Design" (Rawlings, Mayne) — MPC bible
- Understanding PID control: MATLAB Tech Talks (YouTube) — intuition

**Close:** Implement PID, LQR, and MPC for a simulated inverted pendulum in Python; compare rise time, overshoot, settling time, and disturbance rejection under each.

---

#### β.2 State estimation (KF, EKF, UKF, particle filters, factor graphs)

**Subtopics:**
- Bayes filter derivation: prediction + update, Markov assumption, Gaussian vs non-Gaussian
- Kalman Filter: process model, measurement model, covariance propagation, innovation, Kalman gain
- Extended KF: Jacobian linearization, first-order Taylor expansion, EKF for non-linear dynamics
- Unscented KF: sigma points, unscented transform, no Jacobian needed, UT for non-linearities
- Particle filter: importance sampling, resampling (multinomial, systematic, stratified), SIR filter
- Factor graphs and smoothing: GTSAM, iSAM2, nonlinear least squares optimization
- Multi-sensor fusion: loosely coupled vs tightly coupled, asynchronous sensor handling

**Study:**
- Cyrill Stachniss SLAM Course (YouTube, U Bonn) — lectures 1-6 on estimation
- *Probabilistic Robotics* (Thrun, Burgard, Fox) — KF, EKF, particle filter chapters
- "The Extended Kalman Filter: An Interactive Tutorial" (Google) — visual intuition
- GTSAM documentation + examples — factor graph approach
- "Lessons Learned from Building the DARPA Urban Challenge" — practical sensor fusion

**Close:** Implement 2D EKF from scratch for a robot with IMU + GPS + wheel odometry; plot covariance ellipses vs ground truth trajectory.

---

#### β.3 SLAM (visual SLAM, LiDAR SLAM, visual-inertial, multi-agent)

**Subtopics:**
- Front-end: feature extraction (ORB, SIFT, SuperPoint), feature matching, RANSAC, ICP for LiDAR
- Back-end: pose graph optimization, iSAM2, g2o, GTSAM; loop closure detection (BoW, NetVLAD)
- Visual SLAM: monocular (ORB-SLAM3), stereo, RGB-D; scale ambiguity, initialization
- Visual-inertial: VINS-Mono, OKVIS, MSCKF — IMU preintegration, visual+IMU fusion
- LiDAR SLAM: LOAM, A-LOAM, Cartographer; scan matching (ICP, NDT), submap-based
- Multi-agent SLAM: shared maps, relative pose estimation, communication constraints
- Evaluation: evo toolkit (absolute trajectory error, relative pose error), KITTI, TUM RGB-D datasets

**Study:**
- ORB-SLAM3 paper + GitHub — study the full pipeline architecture
- "LOAM: Lidar Odometry and Mapping in Real-time" (Zhang & Singh)
- Cartographer documentation + Google research paper — ROS integration
- "Visual-Inertial Monocular SLAM with Map Reuse" (ORB-SLAM3)
- Cyrill Stachniss SLAM lectures (YouTube) — lectures 7-12 on full SLAM systems
- "A Tutorial on Graph-Based SLAM" (Grisetti et al.)

**Close:** Run ORB-SLAM3 (monocular or stereo) on a KITTI sequence; plot the trajectory against ground truth with evo; investigate and explain a failure case.

---

#### β.4 Sensor modeling (IMU, GPS, cameras, LiDAR, radar, star trackers)

**Subtopics:**
- IMU: MEMS vs tactical grade, accelerometer/gyro noise (Allan variance), bias instability, scale factor, misalignment
- GPS/GNSS: pseudorange, carrier phase, RTK, DGPS, multipath, urban canyon effects
- Cameras: pinhole model, intrinsic/extrinsic/distortion, rolling shutter, global shutter
- LiDAR: time-of-flight, beam divergence, multi-echo return, 2D vs 3D (Velodyne, Ouster, Hesai)
- Radar: Doppler velocity, FMCW, point cloud vs detection list, weather robustness
- Star trackers: centroiding, star catalog matching (lost-in-space), attitude quaternion output
- Sensor calibration: intrinsic (camera calibration with checkerboard), extrinsic (LiDAR-camera, IMU-camera), temporal synchronization

**Study:**
- "The Inertial Navigation System" (Woodman) — excellent IMU tutorial from Cambridge
- "Multiple View Geometry in Computer Vision" (Hartley & Zisserman) — camera model chapters
- "Aircraft Control and Simulation" (Stevens, Lewis, Johnson) — sensor models
- Kalibr (ETH) — multi-sensor calibration library documentation
- Star tracker: "Starlight" or "SmartStar" tutorials (open source star tracking)
- Allan variance: "IEEE Standard Specification Format Guide and Test Procedure for Single-Axis Interferometric Fiber Optic Gyros"

**Close:** Simulate IMU + GPS + camera sensors in Python with realistic noise models (Allan variance for IMU); run an EKF fusing all three; analyze error growth during GPS outage.

---

#### β.5 Rigid-body dynamics (kinematics, Newton-Euler, Lagrangian, quaternions)

**Subtopics:**
- 2D/3D transformations: rotation matrices, homogeneous transforms, SE(3), twist coordinates
- Quaternions: multiplication, rotation, interpolation (SLERP), angular velocity conversion, derivative
- Forward kinematics: DH parameters, Denavit-Hartenberg convention, product of exponentials
- Inverse kinematics: analytical (for simple arms), numerical (Jacobian pseudoinverse, damped least squares)
- Velocity kinematics: Jacobians, mapping joint velocities to end-effector twist
- Dynamics: Newton-Euler recursive algorithm, Lagrangian formulation, mass matrix, Coriolis/centrifugal terms
- Contact and friction: Coulomb, viscous, Stribeck; contact forces, soft vs hard contact

**Study:**
- "Modern Robotics" (Lynch & Park) — Chapters 2-4 (kinematics), 8 (dynamics) — free online
- "A Mathematical Introduction to Robotic Manipulation" (Murray, Li, Sastry) — quaternions, twists, product of exponentials
- Quaternion intuition: "Visualizing Quaternions" (YouTube, 3Blue1Brown) or (Hanson, 2005)
- Drake documentation — rigid-body dynamics engine

**Close:** Implement forward/inverse kinematics for a 6-DOF arm in Python using PyBullet or MuJoCo; make the arm reach a target position in 3D space.

---

#### β.6 Trajectory optimization and planning (direct collocation, RRT*, behavior trees)

**Subtopics:**
- Sampling-based planning: RRT, RRT*, PRM, informed RRT*, bias towards goal
- Optimization-based planning: direct collocation, direct transcription, indirect methods
- Smoothing and interpolation: minimum-jerk, minimum-snap, cubic/quadratic splines, Dubins curves
- Behavior trees: control flow (sequence, fallback, parallel), decorators, blackboard communication
- State machines: hierarchical state machines, states vs behaviors, transitions
- Motion primitives: loading, parametrized splines, LQR trees (LQR-T)
- Collision checking: GJK, SAT, bounding volume hierarchies (BVH), signed distance fields
- Differential Dynamic Programming (DDP): backward pass via quadratic value function approximation, positive-definite regularization, forward rollout; handles box constraints
- iLQR (iterative Linear Quadratic Regulator): Gauss-Newton Hessian, affine dynamics linearization, fast convergence on smooth dynamics; computationally cheaper than full DDP
- MPPI (Model Predictive Path Integral): importance-weighted sample average on GPU, handles non-smooth costs and hard constraints; used in off-road robotics (Jackal, F1Tenth, agile flight)

**Study:**
- "Rapidly-Exploring Random Trees: A New Tool for Path Planning" (LaValle, 1998)
- *Planning Algorithms* (LaValle, 2006) — sampling-based planning, motion planning theory
- "Direct Trajectory Optimization and Costate Estimation" (Hargraves & Paris) — direct collocation
- "Behavior Trees in Robotics and AI" (Colledanchise & Ögren)
- OMPL documentation (The Open Motion Planning Library) — practical implementations
- "Minimum Snap Trajectory Generation and Control for Quadrotors" (Mellinger & Kumar)
- "Control-Limited Differential Dynamic Programming" (Tassa, Mansard, Todorov — ICRA 2014)
- "Information Theoretic MPC for Model-Based Reinforcement Learning" (Williams et al., 2016) — MPPI original
- Drake DDP/iLQR tutorial (drake.mit.edu) — practical implementation and benchmark

**Close:** Implement RRT* in Python for a 2D environment with obstacles; then plan a smooth minimum-snap trajectory for a quadrotor through waypoints; simulate the flight in PyBullet.

---

#### β.7 Physics simulation (MuJoCo, Isaac Sim, Gazebo, sim-to-real)

**Subtopics:**
- MuJoCo: model structure, actuators, sensors, contacts, XML-like MJCF format; >= 10 kHz physics
- Gazebo: SDF/URDF models, plugins, sensor simulation (GPU LiDAR, depth camera), ROS 2 integration
- Isaac Sim: NVIDIA Omniverse, PhysX 5, RTX rendering, domain randomization, synthetic data generation
- Sim-to-real: domain randomization (visual, dynamics, mass/inertia), system identification, disturbance injection
- Simulation fidelity: contact models, friction cone, compliance, joint limits vs real hardware
- Validation: sim-to-real gap measurement, trajectory replay on real hardware, regression metrics

**Study:**
- MuJoCo documentation (mujoco.readthedocs.io) — getting started, modeling guide
- MuJoCo Python bindings (dm_control) — examples
- Gazebo + ROS 2 tutorials (gazebosim.org)
- NVIDIA Isaac Sim documentation + sample projects
- "Domain Randomization for Transferring Deep Neural Networks from Simulation to the Real World" (Tobin et al.)
- "Sim-to-Real Transfer of Robotic Control with Dynamics Randomization" (Peng et al.)

**Close:** Model a quadcopter in MuJoCo (mass, inertia, propellers); implement a PID stabilizing controller; transfer to Gazebo with sensory noise; quantify the sim-to-real gap.

### Cluster γ — Real-Time & Embedded Systems: Deploying to the Edge
Serves: Research Engineer (deployment), Space Flight Software, Robotics, AV.

**Topics:**

#### γ.1 Real-time C/C++ (deterministic memory, MISRA, interrupts, watchdogs)

**Subtopics:**
- Deterministic memory: no dynamic allocation after init, stack-only designs, memory pools, ring buffers
- MISRA C++ guidelines: rule categories (required, advisory), auto, templates, exceptions, RTTI restrictions
- Interrupt handling: ISR design (short, reentrant, no blocking), nested interrupts, interrupt priorities, latency
- Watchdog timers: IWDG (independent) vs WWDG (windowed), petting patterns, deadlock detection
- Real-time scheduling: fixed priority preemptive, rate monotonic, earliest deadline first, priority inversion
- Timing analysis: WCET (worst-case execution time), jitter, response time analysis
- Lock-free programming: atomic operations, memory ordering (acquire/release), lock-free queues
- Static analysis: SonarQube, PVS-Studio, Clang Static Analyzer, coverity for MISRA

**Study:**
- "Real-Time C++: Efficient Object-Oriented and Template Microcontroller Programming" (Kormanyos)
- MISRA C++:2023 guidelines (reference with AI, not cover-to-cover)
- "Embedded C" (Pont) — practical ISR patterns
- FreeRTOS documentation: "Implementing a Watchdog Timer" section
- "A Practitioner's Approach to Real-Time Computing" (Buttazzo) — scheduling theory
- Clang Static Analyzer documentation — run on your own C++ projects

**Close:** Write a FreeRTOS task in C++ that reads IMU via I2C, runs an EKF, and logs to SD — with watchdog, no dynamic allocation, verified with static analysis.

---

#### γ.2 RTOS (FreeRTOS, Zephyr, QNX, VxWorks, RTEMS)

**Subtopics:**
- FreeRTOS: tasks, queues, semaphores, mutexes, timers, event groups, task notifications, config files
- Zephyr: device tree, devicetree bindings, kernel objects, build system (west), networking stack
- QNX: message passing, resource managers, adaptive partitioning, safety certification (IEC 61508, DO-178C)
- VxWorks: tasks, semaphores, watchdog, priority inheritance, POSIX compliance, memory protection
- RTEMS (NASA missions): classic API vs POSIX API, multiprocessing, ED&D support
- RTOS design patterns: publisher-subscriber, producer-consumer, commander-executor, watchdog-supervisor
- Hard vs soft real-time: deadline miss consequences, scheduling analysis, worst-case scenarios

**Study:**
- **Spine:** FreeRTOS official tutorials + reference manual — start here
- "Mastering FreeRTOS using STM32" (Udemy) — hands-on with hardware
- Zephyer documentation — build the example applications
- QNX Neutrino RTOS System Architecture — message passing design
- *Hands-On RTOS with Microcontrollers* (Amos, 2nd ed) — cross-RTOS patterns
- RTEMS Classic API Guide (NASA) — for space domain awareness

**Close:** Port the IMU+EKF+SD logger (from γ.1) to Zephyr; compare API differences between FreeRTOS and Zephyr.

---

#### γ.3 Embedded Linux (Yocto, Buildroot, device trees, kernel modules)

**Subtopics:**
- Buildroot: minimal embedded Linux from source, menuconfig, rootfs overlay, cross-compilation
- Yocto: layers (meta-*), bitbake recipes, poky reference distribution, SDK generation
- Device trees: .dts/.dtsi syntax, nodes, properties, binding documentation, overlays
- Linux kernel modules: hello world module, init/exit, character device drivers, IOCTL
- Kernel configuration: menuconfig, kernel config fragments, building for target (ARM64, RISC-V)
- Boot process: U-Boot, SPL (secondary program loader), FIT images, fastboot, TFTP boot
- NVIDIA Jetson platform: JetPack SDK, L4T kernel, CUDA cape, tensor RT deployment, power management

**Study:**
- Buildroot documentation + examples — start with a Raspberry Pi or QEMU target
- Yocto Project Development Manual — chapters 1-5
- "Mastering Embedded Linux Programming" (Simmonds, 3rd ed)
- NVIDIA Jetson Developer Guide — building custom kernel, flashing
- Device Tree Reference (elixir.bootlin.com) — lookup syntax and bindings
- Linux Kernel Module Programming Guide (online, free)

**Close:** Build a custom embedded Linux image with Buildroot for Raspberry Pi; write a kernel module that reads GPIO button presses and exposes them via /dev.

---

#### γ.4 Microcontrollers (ARM Cortex-M, RISC-V)

**Subtopics:**
- ARM Cortex-M: NVIC, SysTick, MPU, bit-banding, sleep modes, CMSIS-Core abstraction
- RISC-V: (if pursuing) CLIC, PLIC, CLINT, S-mode vs M-mode, vector extensions
- Memory-mapped I/O: registers base addresses, bit manipulation, volatile qualifier
- Peripherals: GPIO, UART, I2C, SPI, CAN, DMA, ADC, PWM, timer/counter (input capture, output compare)
- Low-power design: sleep/wake cycles, clock gating, power domains, battery life estimation
- Debugging: SWD/JTAG, semihosting, ITM trace, Segger RTT, logic analyzer
- HAL vs bare-metal: STM32 HAL/LL, Zephyr drivers, or register-level for understanding

**Study:**
- STM32 Nucleo + CubeIDE tutorials — practical start
- "The Definitive Guide to ARM Cortex-M3 and Cortex-M4" (Yiu) — architecture reference
- ARM Cortex-M0+ / Cortex-M4 Technical Reference Manual — register map
- STM32 reference manual (specific to your MCU) — closest you'll get to "how it really works"
- RISC-V: "The RISC-V Reader" (Patterson & Waterman) — concise architecture intro
- Segger J-Link + RTT documentation — debugging technique

**Close:** Blink an LED, then read IMU via I2C using only register-level access (no HAL); implement a software I2C bit-bang to verify understanding of the protocol.

---

#### γ.5 FPGAs and hardware acceleration (basic HDL, high-level synthesis)

**Subtopics:**
- Digital logic: gates, flip-flops, registers, counters, FSMs, clock domains, metastability
- Verilog/SystemVerilog (or VHDL): modules, always blocks, blocking vs non-blocking assignments, testbenches
- FPGA architecture: LUTs (look-up tables), flip-flops, BRAM, DSP48 slices, PLLs, I/O blocks
- High-level synthesis (HLS): Vivado HLS, Vitis HLS — C/C++ → RTL, pipelining, unrolling, array partitioning
- Integration: communicating with on-chip CPU (AXI4-Lite, AXI4-Stream), DMA transfers
- Use cases: sensor pre-processing, image filters, real-time motor control, custom communication protocols
- Tool flow: simulation (ModelSim/Questa), synthesis, implementation, timing analysis, bitstream generation

**Study:**
- "FPGA Programming for Beginners" (Packt) — Verilog + Vivado hands-on
- "Digital Design and Computer Architecture" (Harris & Harris) — chapters 1-4 (digital logic, Verilog)
- Vivado Design Suite User Guide — synthesis, implementation, timing
- Vitis HLS documentation + tutorials — C++ → RTL examples
- ZipCPU blog (zipcpu.com) — excellent practical FPGA/CPU debugging writeups

**Close:** Implement a hardware FIR filter in Verilog; simulate with testbench; synthesize for a dev board; confirm filter output matches Python reference.

---

#### γ.6 Hardware-in-the-loop (HITL) testing

**Subtopics:**
- HITL architecture: simulation environment + hardware device + real-time bridge
- Sim → hardware communication: serial (RS-232), CAN, EtherCAT, UDP, shared memory
- Software-in-the-loop (SIL): running flight/controller software against a model simulation
- Processor-in-the-loop (PIL): compiled binary runs on target CPU within simulation context
- Real-time synchronization: hardware clock, simulation time, stepping, time scaling factor
- Failure injection: sensor dropout, communication latency, actuator saturation, bit flips
- Test automation: Jenkins/GitLab CI for HITL, regression test suites, pass/fail criteria

**Study:**
- NASA cFS HITL examples — open source, space-hardened patterns
- "Hardware-in-the-Loop Testing" (Defense Technical Information Center) — survey paper
- dSPACE documentation — commercial HIL leader, learn the concepts
- EtherCAT HIL: Beckhoff TwinCAT or open-source SOEM
- Pixhawk HITL setup — PX4 SITL/HITL documentation

**Close:** Set up SITL → compile for Raspberry Pi → connect via UDP to Gazebo simulation; inject a GPS dropout and observe estimator drift; log and verify failover behavior.

---

#### γ.7 Communication buses (CAN, SPI, I2C, UART, SpaceWire, EtherCAT, MIL-STD-1553)

**Subtopics:**
- UART: async serial, start/stop bits, baud rate, parity, RS-232(< 15m) vs RS-422/485 (< 1200m)
- I2C: multi-master, open-drain, clock stretching, 7-bit vs 10-bit addressing, bus capacitance
- SPI: full-duplex, master/slave, chip select, clock polarity/phase (CPOL/CPHA), daisy-chaining
- CAN: 2.0A (11-bit ID) vs 2.0B (29-bit ID), arbitration, bit stuffing, ACK slot, error handling, CAN-FD
- EtherCAT: master/slave, datagram processing "on-the-wire", distributed clocks, ECO mode
- SpaceWire: LVDS, wormhole routing, packet switching, time-codes, data-strobe encoding
- MIL-STD-1553: command/response, bus controller + remote terminals, 1 MHz, transformer-coupled

**Study:**
- **Spine:** Understanding each bus — start with Wikipedia overview + logic analyzer captures
- CAN: "CAN Specification 2.0" (Bosch) — chapters on arbitration and error handling
- SPI / I2C: "Logic Analyzer in Action" tutorials (Saleae blog)
- EtherCAT: "EtherCAT: The Complete Guide" (Beckhoff) — free
- SpaceWire: ECSS-E-ST-50-12C standard (ESA)
- MIL-STD-1553: "Tutorial on MIL-STD-1553" (Data Device Corp)

**Close:** Connect an IMU to STM32 via I2C and SPI (separate sensors); read and log both; use a logic analyzer to decode the bus traffic and verify the protocol.

---

#### γ.8 Edge inference (TensorRT, ONNX Runtime, TFLite Micro, TVM)

**Subtopics:**
- TensorRT: network definition (ONNX → TensorRT), layer fusion, FP16/INT8 calibration, dynamic shapes, DLA
- ONNX Runtime: ONNX model format, execution providers (CPU, CUDA, TensorRT, OpenVINO), model optimization
- TFLite Micro: interpreter runtime, operator resolver, arena-based memory, delegate support for accelerators
- TVM: relay IR, auto-tuning (AutoTVM, Ansor), code generation, target-specific schedules
- Custom operator deployment: writing TensorRT plugins (CUDA C++), ONNX Runtime custom ops
- Memory constraints: model size vs hardware RAM, quantization + memory mapping, off-chip memory
- Benchmarking: latency (preprocessing → inference → postprocessing), throughput, power consumption, thermal throttling
- ExecuTorch (PyTorch): portable on-device inference runtime, XNNPACK / Vulkan / CoreML delegates, targets iOS/Android/embedded MCU; PyTorch-native alternative to TFLite Micro

**Study:**
- TensorRT Developer Guide — ONNX import, INT8 calibration, dynamic shapes
- ONNX Runtime tutorials — Python + C++ inference examples
- TFLite Micro documentation — porting to a new MCU, operator support
- TVM documentation + microTVM (tvm.apache.org)
- "Efficient Processing of Deep Neural Networks" (Sze et al.) — book on DNN accelerator design
- ExecuTorch documentation (pytorch.org/executorch) — model export, runtime, delegates, MCU targets

**Close:** Export a vision model (ResNet-18) to ONNX; deploy with TensorRT on Jetson with INT8; deploy the same model on an MCU with TFLite Micro; compare latency and accuracy.

### Cluster δ — Computational Physics & Domain Science
Serves: Space Physics, advanced Space GNC, Mars habitat simulation.

**Topics:**

#### δ.1 Classical mechanics (Lagrangian, Hamiltonian, perturbation theory)

**Subtopics:**
- Lagrangian mechanics: generalized coordinates, Euler-Lagrange equations, conservation laws, Noether's theorem
- Hamiltonian mechanics: Legendre transform, Hamilton's equations, phase space, Poisson brackets
- Rigid-body dynamics: Euler angles, angular momentum, inertia tensor, Euler's equations, tops and gyroscopes
- Orbital perturbation theory: J2 (oblateness), drag, SRP, third-body perturbations, Lagrange planetary equations
- Analytical vs numerical methods: separatrix crossing, resonance overlap, chaos indicators (Lyapunov exponents)
- Celestial mechanics: Kepler problem, elliptical orbits, mean/true/eccentric anomaly, Lambert's problem

**Study:**
- *Classical Mechanics* (Goldstein) — chapters 1-3 (Lagrangian), 8-9 (Hamiltonian) — use AI tutor
- *Orbital Mechanics for Engineering Students* (Curtis) — chapters on two-body problem
- "Methods of Celestial Mechanics" (Brouwer & Clemence) — perturbation theory reference
- Lagrange planetary equations derivation (YouTube / AI-generated derivations)

**Close:** Simulate a satellite orbit with J2 perturbation in Python; plot the precession of the ascending node over 100 orbits.

---

#### δ.2 Electromagnetism (Maxwell's equations, radiation, antenna theory)

**Subtopics:**
- Maxwell's equations: differential and integral forms, divergence and curl, charge conservation
- EM waves: wave equation in vacuum/matter, polarization, Poynting vector, impedance
- Radiation: dipole radiation, antenna gain, directivity, effective area, Friis transmission equation
- Propagation: free-space path loss, atmospheric attenuation, multipath, ground effects
- Antenna types: dipole, patch, helical, phased array, parabolic dish — basic characteristics
- Spacecraft EM: plasma interactions, spacecraft charging, EMI/EMC, Faraday cage, grounding

**Study:**
- *Introduction to Electrodynamics* (Griffiths) — chapters 7-9 (Maxwell's equations, EM waves)
- *Antenna Theory and Design* (Balanis) — chapters 1-4 (fundamentals, dipoles, arrays)
- "Spacecraft Charging" (Garrett & Whittlesey) — AIAA progress series
- Friis transmission equation — one-page derivation

**Close:** Build a Python link budget calculator for a CubeSat communication downlink (frequency, distance, antenna gains, modulation scheme).

---

#### δ.3 Plasma physics (MHD, particle-in-cell methods)

**Subtopics:**
- Plasma fundamentals: Debye length, plasma frequency, gyroradius, collisions, quasi-neutrality
- MHD equations: continuity, momentum, energy, induction equation, frozen-in flux
- MHD waves: Alfvén waves, magnetosonic waves, slow/fast modes
- Particle-in-cell (PIC): particle pushing (Boris algorithm), field solve (Yee grid), current deposition
- Space plasmas: solar wind, magnetosphere, ionosphere, reconnection, shocks
- Sheaths and double layers: Debye sheaths, Bohm criterion, presheath

**Study:**
- *Introduction to Plasma Physics* (Chen) — chapters 1-5 (fundamentals, waves)
- *Plasma Physics for Astrophysics* (Priest) — space applications
- "PIC Methods in Plasma Physics" (Birdsall & Langdon) — computational approach
- Boris algorithm — derivations and implementations (many blog posts)
- Python PIC code: "osiris" or "PIConGPU" documentation (concept level)

**Close:** Implement a 1D electrostatic PIC code in Python: initialize a two-stream instability, observe the growth of the unstable mode.

---

#### δ.4 Numerical methods for PDEs (FDM, FVM, spectral methods)

**Subtopics:**
- Finite difference: explicit vs implicit, CFL condition, von Neumann stability analysis, FTCS, Crank-Nicolson
- Finite volume: conservation laws, flux reconstruction, Riemann solvers (Godunov, HLLC), limiters
- Spectral methods: Fourier series, Chebyshev polynomials, dealiasing (3/2 rule), Galerkin vs collocation
- Mesh generation: structured vs unstructured, adaptive mesh refinement (AMR), octrees
- Time integration: RK4, symplectic integrators, predictor-corrector, IMEX schemes
- Boundary conditions: Dirichlet, Neumann, Robin, periodic, absorbing (PML)

**Study:**
- *Numerical Recipes* (Press et al.) — chapters on PDEs, ODEs, FFT
- *Computational Fluid Dynamics* (Ferziger & Perić) — FVM approach
- "Finite Difference Methods for Ordinary and Partial Differential Equations" (LeVeque)
- Spectral methods: *Spectral Methods in Fluid Dynamics* (Canuto et al.) — chapters 1-3
- OpenFOAM documentation — FVM reference implementation

**Close:** Solve the 2D heat equation using finite difference (explicit and implicit); compare stability and runtime; implement adaptive time stepping.

---

#### δ.5 Physics-informed neural networks (PINNs, DeepONet, FNO)

**Subtopics:**
- PINNs: loss function (PDE residual + BC + data), collocation points, automatic differentiation
- Training strategies: learning rate schedules, gradient balancing (NTK, adaptive weights), curriculum learning
- DeepONet: branch net (input function) + trunk net (query coordinates), operator learning
- Fourier Neural Operator (FNO): spectral convolution in Fourier space, resolution invariance
- Applications: inverse problems, surrogate modeling for PDE-constrained optimization
- Limitations: spectral bias (Fourier feature encoding), failure on stiff PDEs, high-frequency modes

**Study:**
- Original PINNs paper (Raissi et al., 2019) — "Physics-informed neural networks"
- DeepONet: "Learning nonlinear operators via DeepONet" (Lu et al.)
- FNO: "Fourier Neural Operator for Parametric Partial Differential Equations" (Li et al.)
- *Scientific Machine Learning* online course (SciML, 2023) — lecture series

**Close:** Solve Burgers' equation with a PINN in PyTorch; compare accuracy against a finite-difference reference; try Fourier feature encoding to improve high-frequency resolution.

---

#### δ.6 Scientific computing (HPC patterns, parallel I/O, GPU PDE solvers)

**Subtopics:**
- HPC patterns: domain decomposition, MPI (message passing), OpenMP (shared memory), hybrid (MPI+OpenMP)
- GPU acceleration: CUDA for PDE solvers, grid/block decomposition, shared memory tiling, halo exchange
- Parallel I/O: HDF5 (hierarchical), NetCDF, ADIOS2; collective I/O, data compression
- Stencil computation: Jacobi, Gauss-Seidel, multigrid; memory bandwidth bound, Roofline model
- Performance profiling: MPI profiling (PAPI, Score-P), GPU profiling (Nsight), scaling (Amdahl, Gustafson)
- Containerization for HPC: Docker, Singularity/Apptainer, Charliecloud

**Study:**
- *Introduction to High Performance Computing for Scientists and Engineers* (Hager & Wellein)
- MPI tutorial (mpitutorial.com) — collective operations, point-to-point, Cartesian topology
- CUDA C++ Best Practices Guide — grid/block heuristics, memory optimization
- HDF5 documentation — data model, Python and C APIs
- Roofline model: "Roofline: An Insightful Visual Performance Model for Floating-Point Programs" (Williams et al.)

**Close:** Write an MPI-parallel 2D heat equation solver in C++; run on 1, 2, 4, 8 processes; plot strong scaling and weak scaling efficiency.

---

#### δ.7 Astrophysics data analysis (time-series, image reconstruction, Bayesian inference)

**Subtopics:**
- Time-series: periodograms (Lomb-Scargle, Box-fitting Least Squares), wavelets, autoregressive models
- Image reconstruction: deconvolution (Richardson-Lucy), aperture synthesis, CLEAN algorithm, PSF modeling
- Bayesian inference: MCMC (emcee, PyMC3), nested sampling (MultiNest, dynesty), Gaussian processes
- Spatial statistics: point process models, kriging, dust map inference, clustering (DBSCAN, HDBSCAN)
- Multi-messenger astronomy: gravitational wave + EM counterpart, time-domain alerts (VOEvent)
- Tools: AstroPy, SunPy, NumPy/SciPy, AstroML, TOPCAT, CASA for radio data

**Study:**
- *Statistics, Data Mining, and Machine Learning in Astronomy* (Ivezić et al.) — comprehensive
- "Lomb-Scargle Periodograms" (VanderPlas, 2018) — AJ article, free online
- *Bayesian Data Analysis* (Gelman et al.) — chapters for MCMC, model comparison
- AstroML documentation (astroml.github.io) — examples and datasets
- SunPy documentation (sunpy.org) — solar physics data analysis

**Close:** Download solar wind data from NASA CDAWeb; compute Lomb-Scargle periodogram; build a Gaussian process model to predict solar wind speed with uncertainty intervals.

### Cluster ε — Software Infrastructure & MLOps: The Supporting Layer
Serves: All roles. Necessary fluency, not a deep moat.

**Topics:**

#### ε.1 Cloud (AWS: EC2, S3, Lambda, VPC, IAM)

**Subtopics:**
- EC2: instance types (GPU: p4d, p5; CPU: c6i, m6i), AMIs, security groups, elastic IPs, spot instances
- S3: buckets, objects, storage classes, lifecycle policies, presigned URLs, S3a/ExpressOne
- VPC: subnets, route tables, NAT gateway, security groups vs NACLs, VPC peering, endpoints
- IAM: users, groups, roles, policies, trust relationships, least privilege, instance profiles
- Lambda: serverless functions, triggers (S3, SQS, API Gateway), cold starts, reserved concurrency
- GPU-specific: EFA (Elastic Fabric Adapter, NVIDIA GPUDirect), placement groups, FSx for Lustre

**Study:**
- AWS Well-Architected Framework — pillars (operational excellence, security, reliability, performance efficiency, cost optimization)
- AWS documentation: EC2 GPU instances, EFA setup for multi-node training
- "AWS in Action" (Wittig & Wittig) — practical hands-on
- IAM policy simulator — test policies before deploying

**Close:** Set up a multi-node GPU training environment on AWS (EC2 p4d, EFA, FSx for Lustre); launch a distributed PyTorch job; tear down with infrastructure-as-code.

---

#### ε.2 Infrastructure-as-code (Terraform, Kubernetes, Docker)

**Subtopics:**
- Docker: Dockerfile best practices (multi-stage builds, layer caching, .dockerignore), compose, networking
- Kubernetes: pods, deployments, services, configmaps, secrets, volumes, ingress, Helm charts
- K8s for ML: GPU scheduling (NVIDIA device plugin), Volcano (batch scheduling), Kubeflow (ML workflows)
- Terraform: HCL syntax, modules, state management (remote backends), providers, resource lifecycle
- GitOps: ArgoCD or Flux for declarative Kubernetes, continuous sync
- Cluster management: Kops (AWS), kubeadm, K3s (edge), EKS/AKS/GKE (managed)
- Container security: image scanning (Trivy), runtime security (Falco), pod security policies

**Study:**
- Docker documentation — getting started, Dockerfile best practices
- *Kubernetes in Action* (Luksa, 2nd ed) — chapters 1-10
- Terraform: learn.hashicorp.com tutorials — AWS provider, modules
- Kubeflow documentation — end-to-end ML on K8s
- NVIDIA GPU Operator documentation — deploying GPU nodes

**Close:** Write Terraform to provision an EKS cluster with GPU node group; deploy a training job via Kubeflow; automate teardown to avoid runaway costs.

---

#### ε.3 CI/CD (GitHub Actions, GitLab CI, pytest, GTest)

**Subtopics:**
- GitHub Actions: workflow syntax, matrix builds, self-hosted runners, caching, artifacts
- GitLab CI: .gitlab-ci.yml, stages, jobs, runners (shared, specific), DAG scheduling
- Python testing: pytest (fixtures, parametrize, conftest), coverage, tox for multi-version
- C++ testing: GTest/GoogleTest (test fixtures, assertions, death tests), CMake integration, CTest
- CI for ML: data validation, model evaluation gate, W&B comparison between baseline and PR
- Docker-in-CI: building images, pushing to registry, integration tests in containers
- Secrets management: GitHub secrets, GitLab CI variables, HashiCorp Vault, Doppler

**Study:**
- GitHub Actions documentation + starter workflows
- pytest documentation — fixtures, marks, plugins (pytest-cov, pytest-xdist)
- GTest primer (google.github.io/googletest) — getting started
- *Continuous Delivery for Machine Learning* (CD4ML) — thoughtworks pattern

**Close:** Set up GitHub Actions for a Python + C++ monorepo: matrix build (py 3.10-3.12, C++ CI), run pytest + GTest, cache dependencies, package as Docker image, push to registry.

---

#### ε.4 Build systems (CMake, Bazel, PlatformIO)

**Subtopics:**
- CMake: targets, properties, find_package, FetchContent, toolchain files, install rules
- CMake + modern C++: INTERFACE/SHARED/STATIC targets, alias targets, generator expressions
- Bazel: BUILD files, rules (cc_binary, cc_library, py_binary), dependencies, remote caching
- PlatformIO: embedded build system, board definitions, library management, unit testing on MCU
- Cross-compilation: toolchain files (CMake), --config (Bazel), PlatformIO board profiles
- Package managers: Conan (C++), vcpkg (C++), pip/conda (Python), Node (npm/yarn)

**Study:**
- "Modern CMake for C++" (Scott) — excellent practical guide, or "Professional CMake" (Craig Scott)
- CMake documentation — cmake.org, especially the tutorial
- Bazel C++ tutorial (bazel.build) — hello world, dependencies, test integration
- PlatformIO documentation — MCU projects, CI integration
- Conan documentation — C++ packages

**Close:** Set up a CMake-based C++ project with GoogleTest, fmt, and Eigen; cross-compile for ARM (Raspberry Pi) with a custom toolchain; integrate with Conan for dependencies.

---

#### ε.5 Data pipelines (Kafka, Ray, distributed data loading)

**Subtopics:**
- Kafka: topics, partitions, producers, consumers, consumer groups, offsets, replication, schemas (Avro/Protobuf)
- Kafka streams: KStream/KTable, stateful processing, exactly-once semantics
- Ray: Ray Core (tasks, actors, object store), Ray Data (distributed dataset, map/batch/inference)
- Ray Serve: model composition, autoscaling, batching, canary deployments
- Distributed data loading: webdataset (tar-based shards), Mosaic StreamingDataset, NVIDIA DALI
- Performance: data access bottlenecks, prefetching, shared memory, NUMA-aware loading, HDD vs SSD vs NVMe

**Study:**
- *Kafka: The Definitive Guide* (Confluent / Narkhede et al.) — chapters 1-5
- Ray documentation — Ray Core walkthrough, Ray Data tutorial
- Webdataset documentation (github.com/webdataset/webdataset)
- NVIDIA DALI documentation — GPU-accelerated data loading

**Close:** Build a pipeline that reads streaming sensor data from Kafka → preprocesses with Ray Data → writes to Parquet; benchmark throughput at different batch sizes.

---

#### ε.6 Open-source collaboration (Git, PR etiquette, licenses, documentation)

**Subtopics:**
- Git deep: rebase vs merge, interactive rebase, bisect, blame, reflog, submodules
- PR etiquette: atomic commits, descriptive titles, linking issues, changelogs, responding to review
- Open-source licenses: MIT, Apache 2.0, GPLv3, LGPL, AGPL, BSD; compatibility and restrictions
- Documentation: README (structure and intent), API docs (Sphinx, Doxygen), developer guide, contribution guide
- Release management: semantic versioning, release notes, tags, CI/CD for releases, changelogs (Keep a Changelog)
- Community: code of conduct, issue triage, labeling, reviewing others' PRs, becoming a maintainer

**Study:**
- Pro Git (Chacon & Straub) — chapters on rebasing, distributed workflows
- "Semantic Versioning 2.0.0" (semver.org)
- Choose a License (choosealicense.com)
- Google's "Release in 15 Minutes" — practical release engineering
- Sphinx documentation (for Python) or Doxygen (for C++) — documentation generation

**Close:** Contribute a meaningful PR to an open-source robotics or ML library (ROS2, ORB-SLAM3, PyTorch, HuggingFace, etc.) that passes review and merges.

---

#### ε.7 Experiment tracking (Weights & Biases, MLflow)

**Subtopics:**
- W&B: runs, config, metrics, artifacts, sweeps (hyperparameter optimization), reports
- MLflow: tracking server, model registry, MLflow Projects, MLflow Recipes
- Comparison: W&B vs MLflow vs Comet vs DVC vs TensorBoard — when each fits
- Reproducibility: full environment capture (pip freeze, conda env, Docker), seed management
- Metrics: loss/accuracy curves, gradient histograms, parameter distribution, GPU utilization, throughput
- Visualization: parallel coordinates, contour plots, learning rate finder, confusion matrix, ROC curves

**Study:**
- W&B Quickstart (wandb.ai) — 10 minute intro
- MLflow documentation — tracking, model registry, deployment
- "Experiment Tracking with Weights and Biases" (YouTube, W&B playlist)
- TensorBoard tutorial — basic usage for comparison

**Close:** Train 10 variants of a model with different hyperparameters via W&B Sweeps; automatically log config, metrics, GPU utilization; create a report comparing the best 3 runs.

### Foundational Substrate — Underpins All Clusters

**Topics:**

#### FS.1 Mathematics (linear algebra, probability, optimization, numerical methods)

**Subtopics:**
- Linear algebra: matrix calculus, SVD, Eigendecomposition, QR, Cholesky; matrix norms, low-rank approximations, condition number
- Probability & statistics: Bayesian inference (conjugate priors, MCMC), Monte Carlo methods, information theory (entropy, KL-divergence, mutual information), hypothesis testing
- Optimization: convex optimization (gradient descent, Newton, BFGS, L-BFGS), constrained optimization (KKT, Lagrange multipliers), stochastic methods (SGD, Adam, AdamW)
- Numerical methods: floating-point arithmetic, numerical integration (quadrature, Monte Carlo), root-finding (Newton, secant), ODE solvers (RK4, adaptive, symplectic)

**Study:**
- **Spine:** *Mathematics for Machine Learning* (Deisenroth, Faisal, Ong) — free at mml-book.github.io
- *Linear Algebra Done Right* (Axler) — conceptual depth, proof-based
- *Probability and Statistics for Computer Science* (Forsyth) — practical, code-heavy
- *Convex Optimization* (Boyd & Vandenberghe) — free online, chapters 1-5, 9
- *Numerical Recipes* (Press et al.) — reference for numerical methods
- 3Blue1Brown "Essence of Linear Algebra" (YouTube) — intuition

**Close:** Implement SVD from scratch in NumPy, use it to compress an image, blog the derivation; implement Adam optimizer from scratch.

---

#### FS.2 Computer systems (OS, architecture, GPU architecture)

**Subtopics:**
- OS concepts: processes (PCB, context switch), threads (kernel vs user), virtual memory (page tables, TLB, swapping), file systems (inodes, ext4, FUSE)
- Computer architecture: CPU pipelines, branch prediction, out-of-order execution, cache hierarchy (L1/L2/L3), cache coherence (MESI), NUMA, RISC-V vs x86 basics
- GPU architecture: SM / warp occupancy, register pressure, shared memory, tensor cores, memory coalescing, streaming multiprocessor scheduling
- Memory: virtual to physical translation, page faults, memory-mapped files, huge pages, OOM killer
- Scheduling: CFS (completely fair scheduler), real-time scheduling classes (SCHED_FIFO, SCHED_RR, SCHED_DEADLINE), cgroups, nice values

**Study:**
- *Operating Systems: Three Easy Pieces* (Remzi & Andrea Arpaci-Dusseau) — free online
- *Computer Architecture: A Quantitative Approach* (Hennessy & Patterson) — chapters 1-3, 5
- *Programming Massively Parallel Processors* (Kirk & Hwu) — GPU architecture chapters
- "What Every Programmer Should Know About Memory" (Drepper) — Linux memory deep dive
- NVIDIA CUDA Programming Guide — occupancy calculator, shared memory bank conflicts

**Close:** Write a C++ program that deliberately causes TLB misses and cache misses; use `perf stat` to measure them; explain the results.

---

#### FS.3 Networking (TCP/IP, sockets, high-speed interconnects)

**Subtopics:**
- TCP/IP stack: Ethernet, IP, TCP (flow control, congestion control, Nagle, slow start, fast retransmit), UDP, DNS, DHCP
- Sockets: BSD socket API (socket, bind, listen, accept, connect, send, recv), blocking vs non-blocking, select/poll/epoll, SO_REUSEPORT
- High-performance: io_uring (Linux async IO), zero-copy (sendfile, splice), kernel bypass (DPDK, XDP)
- High-speed interconnects: InfiniBand (RDMA, RC/UC/UD), RoCE v2, iWARP; RDMA operations (send/recv, read/write, atomic)
- NCCL: all-reduce, all-gather, reduce-scatter, ring algorithm, tree algorithm, NVLink topology

**Study:**
- *TCP/IP Illustrated* (Stevens) — chapters 1-3, 12-13 (TCP), 17-18 (sockets)
- "Beej's Guide to Network Programming" (Beej) — practical sockets in C
- io_uring: "Lord of the io_uring" (YouTube, ScyllaDB) — architecture and API
- InfiniBand: "Introduction to InfiniBand" (Mellanox/NVIDIA) — architecture overview
- NCCL documentation (NVIDIA) — collective operations, topology-aware communication

**Close:** Write a TCP echo server and client in C++ with epoll; benchmark latency and throughput; extend with io_uring; compare results.

---

#### FS.4 Compilers (LLVM, MLIR, XLA, TVM, code generation)

**Subtopics:**
- Compiler pipeline: lexer → parser → AST → semantic analysis → IR → optimization → codegen
- LLVM: IR (SSA form, basic blocks, phi nodes), optimization passes (mem2reg, GVN, inlining, loop unrolling), target description, MC layer, JIT (ORC JIT)
- MLIR: dialects (linalg, affine, scf, func), operation semantics, pass pipeline, dialect conversion, lowering
- XLA: HLO → optimization → LLVM IR, fused ops, layout assignment, Sharding for TPU/GPU
- TVM: Relay IR (computational graph), auto-tuning (AutoTVM, Ansor), schedule templates, code generation for CPU/GPU/MCU
- Domain-specific compilers: Triton (block-level language to efficient CUDA), TACO (sparse tensor algebra)

**Study:**
- *Engineering a Compiler* (Cooper & Torczon) — chapters 1-5, 8, 10
- LLVM Kaleidoscope tutorial (llvm.org) — build a toy compiler front-to-back
- MLIR tutorial (mlir.llvm.org) — defining a dialect, conversion patterns
- XLA: "XLA: Optimizing Compiler for Machine Learning" (Google Research)
- TVM documentation (tvm.apache.org) — getting started, auto-tuning

**Close:** Write a minimal expression evaluator in LLVM IR (compile + JIT); then write a Triton kernel for elementwise addition; compare against handwritten CUDA.

---

### Career Track ζ — SDE Engineering
Serves: Interview readiness (FAANG), system design fluency, distributed systems fundamentals for all engineering roles.

**Phase:** 3 (parallel track — does not delay Phase 1/2 progression)

**Topics:**

#### ζ.1 DSA interview patterns (blind-75 / neetcode-150 in C++, then Python)

**Subtopics:**
- Arrays & hashing: two-sum, sliding window, prefix sums, monotonic stack, interval merging
- Two pointers: sorted array two-sum, container with most water, trapping rain water
- Strings: palindromes, anagrams, string matching (KMP, Rabin-Karp), pattern parsing
- Trees: BST traversal (in/pre/post/level-order), LCA, serialization, tree DP, tries, segment trees
- Graphs: BFS/DFS, topological sort, Dijkstra, Bellman-Ford, Floyd-Warshall, union-find, bipartite check
- Dynamic programming: 0/1 knap, LCS, LIS, edit distance, matrix chain, DP on trees, DP on intervals
- Greedy: interval scheduling, Huffman coding, activity selection, gas station
- Advanced: bit manipulation, design (LRU cache, LFU), randomized (reservoir sampling, shuffle)

**Study:**
- **Spine:** Neetcode.io (150 curated problems) — C++ first, then revisit top 50 in Python
- *Cracking the Coding Interview* (McDowell) — patterns and strategies
- LeetCode discussion solutions — understand trade-offs of each approach
- MIT 6.006 (YouTube) — DSA theory refresh

**Close:** Complete all 150 Neetcode problems in C++ with clean code; solve 50 randomly selected problems in 45 minutes each under timed conditions.

---

#### ζ.2 Low-level design / OOD

**Subtopics:**
- OOP principles: encapsulation, inheritance, polymorphism, composition over inheritance, SOLID
- Design patterns: strategy, observer, decorator, factory, singleton, adapter, command, state
- LLD cases: parking lot (multi-floor, pricing), vending machine (inventory, payment), elevator (scheduling, doors), hotel reservation (rooms, booking), stack overflow (Q&A + votes + tags), chess game (board, pieces, moves)
- Concurrency in LLD: thread-safe singletons, producer-consumer, readers-writers, dining philosophers
- UML: class diagrams, sequence diagrams, state diagrams

**Study:**
- *Head First Design Patterns* (Freeman & Robson) — best practical introduction
- *Clean Code* (Martin) — chapters 2-7 (naming, functions, classes, comments)
- Grokking the Low-Level Design Interview (educative.io)
- YouTube: "Low Level Design Interview" series (Concepts & Coding)

**Close:** Design and implement a parking lot system in C++ with OOD; cover edge cases (EV charging spots, handicapped, payment); write unit tests.

---

#### ζ.3 High-level system design (12 canonical cases)

**Subtopics:**
- Each case: requirements (functional/non-functional), estimation (QPS, storage, bandwidth), data model, API design, high-level design, deep dive, trade-offs
- Cases: (1) URL shortener, (2) chat system (WhatsApp), (3) Twitter timeline / newsfeed, (4) YouTube / video streaming, (5) Google Drive / file storage, (6) rate limiter, (7) proximity service (Uber), (8) payment system, (9) web crawler, (10) notification system, (11) key-value store (Cassandra/Dynamo), (12) CDN / content delivery
- ML system design cases: (13) video recommendation system (two-tower retrieval + GBDT/DNN ranking, feature store, real-time events), (14) fraud detection at scale (real-time feature serving, class imbalance, model refresh cycle), (15) search ranking (query understanding, dense retrieval, learning-to-rank, A/B testing pipeline)
- Cross-cutting: consistent hashing, leader election (Raft/Paxos), quorum, gossip protocol, bloom filters, CAP trade-offs, CQRS, event sourcing

**Study:**
- **Spine:** *Designing Data-Intensive Applications* (Kleppmann) — read cover to cover over 3 months
- Alex Xu "System Design Interview" Vol 1 & 2 — cases as reference
- Grokking the System Design Interview (educative.io)
- System Design Newsletter / ByteByteGo (Alex Xu) — weekly deep dives
- MIT 6.824 (distributed systems lectures, YouTube)
- "Machine Learning System Design Interview" (Alex Xu & Sahn Lam, 2023) — ML-specific system design cases
- *Designing Machine Learning Systems* (Chip Huyen) — chapters 7-10 for serving, monitoring, continual learning (also η spine)

**Close:** Deep-dive document 5 cases with diagrams, trade-off analysis, and alternative approaches; publish as a blog series.

---

#### ζ.4 Databases deep (indexing, query planning, replication, sharding)

**Subtopics:**
- Storage engines: B-trees (InnoDB, PostgreSQL), LSM-trees (LevelDB, RocksDB, Cassandra), buffer pool management
- Indexing: primary vs secondary, composite, covering index, partial, bitmap (analytics), GiST (geo), inverted index (search)
- Query planning: query parsing, optimization (join ordering, predicate pushdown, index selection), execution (scan, join algorithms: nested loop, hash join, sort-merge join)
- ACID: atomicity (WAL, shadow paging), isolation levels (read uncommitted → serializable), anomalies (dirty read, non-repeatable read, phantom), MVCC
- Replication: leader-based (synchronous/asynchronous/semi-sync), multi-leader, leaderless (Dynamo-style), read-after-write consistency
- Sharding: hash-based, range-based, consistent hashing, rebalancing, cross-shard queries (scatter-gather)
- CAP theorem: availability vs consistency partitions, PACELC, real-world (CP: HBase, AP: Cassandra, CA: single-node)

**Study:**
- *Designing Data-Intensive Applications* (Kleppmann) — chapters 1-9
- *Database Internals* (Petrov) — B-trees, LSM, replication, transactions
- PostgreSQL documentation — query planning, EXPLAIN ANALYZE
- MySQL/InnoDB internals — blogging engine comparison of InnoDB B-tree and MyISAM

**Close:** Implement a minimal SQLite clone (B-tree index + insert/lookup + simple query planner) in C++; benchmark against real SQLite.

---

#### ζ.5 Networking for SDE (HTTP, gRPC, load balancers, CDN)

**Subtopics:**
- HTTP/1.1: keep-alive, pipelining, chunked transfer, caching headers (ETag, Cache-Control, Expires)
- HTTP/2: multiplexing, server push, HPACK (header compression), stream prioritization
- HTTP/3: QUIC, 0-RTT, connection migration, built-on UDP, loss recovery differences
- WebSockets: handshake (upgrade), frames, masking, bidirectional streaming
- gRPC: protobuf (schema, serialization), HTTP/2 transport, streaming (unary, server/client/bidirectional), interceptors
- Load balancers: layer 4 (TCP) vs layer 7 (HTTP), algorithms (round-robin, least connections, IP hash), health checks, session persistence
- CDN: edge caching, origin pull vs push, cache invalidation, purge, geo-routing, DDoS protection

**Study:**
- "High Performance Browser Networking" (Grigorik) — free online, covers HTTP, WebSocket, HTTP/2
- gRPC documentation — quickstart (C++), streaming examples
- "Load Balancing 101" (HAProxy documentation / blog)
- Cloudflare CDN documentation — caching concepts

**Close:** Build a gRPC service (C++ server + Python client) with bidirectional streaming; then benchmark HTTP/1.1 vs HTTP/2 vs gRPC for the same request/response pattern.

---

#### ζ.6 AWS for SDE (core services)

**Subtopics:**
- Compute: EC2 (instances, AMIs, security groups, spot), Lambda (cold starts, layers, VPC), ECS/EKS (Fargate, service discovery)
- Storage: S3 (buckets, lifecycle, presigned URLs, multipart upload), EBS (volumes, snapshots), RDS (PostgreSQL, replicas, Multi-AZ, backups)
- Networking: VPC (subnets, route tables, NAT, VPC peering, transit gateway), CloudFront (distribution, origins, behaviors), Route53 (DNS, routing policies)
- Messaging: SQS (queues, DLQ, visibility timeout), SNS (topics, subscriptions), EventBridge (rules, targets)
- Database: DynamoDB (tables, GSIs, RCU/WCU, DAX, auto-scaling), ElastiCache (Redis, memcached, cluster mode)
- Security: IAM (policies, roles, instance profiles, trust), KMS (encryption keys), WAF, Shield, Secrets Manager

**Study:**
- AWS Well-Architected Framework documentation
- AWS documentation for each service — read the FAQ (goldmine for interview Qs)
- AWS Workshops (workshops.aws) — hands-on labs
- "AWS in Action" (Wittig & Wittig)

**Close:** Design and deploy a serverless API (API Gateway + Lambda + DynamoDB + S3) with IAM least-privilege; include monitoring with CloudWatch.

---

#### ζ.7 API design (REST, OpenAPI, versioning, pagination, rate limiting)

**Subtopics:**
- REST conventions: resource nouns, HTTP methods (GET/POST/PUT/PATCH/DELETE), status codes (2xx, 3xx, 4xx, 5xx), HATEOAS
- OpenAPI / Swagger: spec structure (paths, schemas, parameters, responses), code generation (openapi-generator)
- API versioning: URI path (`/v1/`), header (`Accept: version=2`), query param, content negotiation
- Pagination: cursor-based (relay-style), offset-limit, keyset pagination, page tokens
- Rate limiting: token bucket, leaky bucket, sliding window, distributed rate limiting (Redis + Lua), headers (X-RateLimit-*)
- Error handling: consistent error schema, error codes, idempotency keys, retry semantics
- Security: API keys, JWT (access + refresh tokens), OAuth2 flows (authorization code, client credentials, PKCE), CORS, CSRF

**Study:**
- Google API Design Guide — canonical reference
- OpenAPI Specification (swagger.io) — learn the spec
- "RESTful Web APIs" (Richardson & Amundsen)
- OAuth2: "OAuth 2.0 Simplified" (Leifker) — concise guide

**Close:** Design an API for a file-sharing service; write the OpenAPI spec; implement a client SDK in Python; test with a mock server.

---

### Career Track η — ML Engineering
Serves: ML platform/infra skills, experimentation, MLOps for moving beyond notebook‑scale ML.

**Phase:** 3 (parallel track)

**Topics:**

#### η.1 ML system design (feature stores, model registries, A/B testing, serving infrastructure)

**Subtopics:**
- ML system architecture: data ingestion → feature engineering → training → evaluation → deployment → monitoring → retraining cycle
- Feature stores: Feast (offline/online serving, feature views, point-in-time joins), Tecton concepts, feature serving latency
- Model registries: MLflow (model versions, stage transitions, lineage), model signatures, input validation at serving
- A/B testing: traffic splitting (random, cookie-based, geolocation), statistical significance, minimum sample size, MDE, sequential testing
- Serving infrastructure: batch vs online, CPU vs GPU inference, horizontal vs vertical scaling, request batching, autoscaling
- Versioning: data versioning (DVC, lakeFS, Pachyderm), model versioning, environment versioning (containers), reproducibility

**Study:**
- **Spine:** *Designing Machine Learning Systems* (Chip Huyen) — canonical ML engineering text
- Feast documentation — feature store concepts, deployment patterns
- MLflow documentation — tracking, model registry, projects
- "A/B Testing: A Practical Guide" (Kohavi et al.) — chapters on metrics, sample size
- *Machine Learning Engineering in Action* (Wilson) — case studies

**Close:** Build an end-to-end ML pipeline: Feast (feature serving) → training pipeline (Kubeflow) → MLflow (model registry) → Triton (serving) → Prometheus/Grafana (monitoring); full CI/CD with GitHub Actions.

---

#### η.2 Experimentation platform (statistics, multi-armed bandits, CUPED)

**Subtopics:**
- Statistical fundamentals: hypothesis testing (null/alternative, type I/II error, p-value, power analysis), confidence intervals, multiple testing correction (Bonferroni, Benjamini-Hochberg)
- Sample size: minimum detectable effect, variance estimation, power curves, sequential testing
- Multi-armed bandits: epsilon-greedy, Thompson sampling, UCB, Bayesian bandits, regret analysis
- CUPED: controlled-experiment using pre-experiment data, variance reduction, covariate adjustment
- Guardrail metrics: metrics that cannot degrade (latency, error rate), monitoring for regressions
- Experiment design: randomization unit (user, session, event), network effects, carryover effects, novelty effect, interleaved experiments

**Study:**
- "Trustworthy Online Controlled Experiments" (Kohavi, Tang, Xu) — A/B testing bible
- "Bandit Algorithms" (Lattimore & Szepesvári) — chapters 1-5 (basics)
- "CUPED: Improving the Sensitivity of A/B Tests" (Deng et al., 2013)
- *Statistical Methods for Online Experimentation* (Larsen) — practical reference

**Close:** Implement a CUPED variance reduction calculator in Python; simulate 10,000 A/B tests and show the reduction in required sample size.

---

#### η.3 ML CI/CD (model validation, data drift detection, automated retraining)

**Subtopics:**
- ML pipeline automation: Kubeflow Pipelines, TFX, Airflow, ZenML — DAG definition, component reuse, artifact passing
- Model validation: training-test skew detection, data schema validation (Great Expectations, TensorFlow Data Validation), model performance gates
- Data drift: univariate (Kolmogorov-Smirnov, chi-squared, PSI), multivariate (MMD, PCA-based), production monitoring
- Concept drift: model performance degradation over time, retraining triggers (time-based, drift-based, error-based), online learning
- Retraining strategies: full vs incremental, scheduled vs triggered, shadow deployment
- CI/CD for data: dbt (data transformation), data quality tests, dbt docs, SLAs

**Study:**
- Kubeflow documentation — pipeline SDK, component authoring
- Great Expectations documentation — expectations, data docs, checkpoint
- "Hidden Technical Debt in Machine Learning Systems" (Sculley et al., 2015)
- "ML in Production: Why You Need a Feature Store and Data Engineering" (essays)
- dbt documentation — models, tests, documentation, CI

**Close:** Build a Kubeflow pipeline with data validation (Great Expectations) → model training → evaluation gate → conditional deployment to staging; add data drift detection that triggers a Slack alert.

---

#### η.4 Kubernetes for ML (Kubeflow, Ray, Volcano, GPU operators)

**Subtopics:**
- K8s fundamentals for ML: pods, deployments, jobs, CronJobs, services (ClusterIP, NodePort, LoadBalancer), persistent volumes, namespaces, resource quotas, limit ranges
- GPU scheduling: NVIDIA device plugin, MIG (Multi-Instance GPU), time-slicing, GPU operator, node labels/tolerations
- Kubeflow: central dashboard, notebooks, pipelines, Katib (HP tuning), KFServing (model serving), multi-user profiles
- Ray on K8s: RayCluster CRD, RayJob, RayService, autoscaler, Kubernetes scheduler interface
- Volcano: batch scheduling (queue, podgroup), fair-share, preemption, GPU topology-aware scheduling
- Resource management: requests/limits, node affinity, taints/tolerations, pod priority, node pools, cluster autoscaler

**Study:**
- NVIDIA GPU Operator documentation — deployment guide, MIG configuration
- Kubeflow documentation — installation, pipelines, Katib
- Ray documentation — K8s integration, auto-scaler configuration
- Volcano documentation — scheduling features, comparison with default scheduler
- *Kubernetes in Action* (Luksa, 2nd ed) — chapters on scheduling, resource management

**Close:** Deploy Kubeflow on an EKS cluster with GPU node group; schedule a distributed PyTorch training job (multi-GPU) via Kubeflow pipelines; compare with Volcano batch scheduling.

---

#### η.5 Data engineering (Spark, dbt, Airflow, Great Expectations)

**Subtopics:**
- Spark: RDDs, DataFrames, Spark SQL, joins, shuffles, BroadcastHashJoin vs SortMergeJoin, Catalyst optimizer, Tungsten execution
- Spark streaming: structured streaming, micro-batch vs continuous, watermarks, state management, exactly-once
- dbt: models (staging, intermediate, mart), sources, tests (singular, generic), documentation, snapshots, exposures
- Airflow: DAGs, operators (Python, Bash, Docker, Kubernetes), sensors, task groups, XCom, pools, SLAs, retries
- Great Expectations: expectations, suites, data docs, checkpoint, batch requests (Spark, SQLAlchemy, Pandas)
- Data lakehouse: Delta Lake, Iceberg, Hudi — ACID on data lakes, time travel, schema evolution, compaction

**Study:**
- *Learning Spark* (Databricks, 2nd ed) — chapters 1-7 (DataFrames, SQL, tuning)
- *Data Pipelines with Apache Airflow* (Bas et al.) — DAG design, production patterns
- dbt documentation — fundamentals, Jinja, tests, packages
- Great Expectations documentation — connecting to data, creating expectations, suites
- *The Data Warehouse Toolkit* (Kimball) — dimensional modeling (star schemas)

**Close:** Build a dbt project from raw CSV → staging views → marts (KPIs); orchestrate with Airflow; add Great Expectations tests for data quality; send Slack on failure.

---

#### η.6 Model serving (Triton, TorchServe, Seldon Core, BentoML)

**Subtopics:**
- Triton Inference Server: model repository (TensorRT, ONNX, PyTorch, Python), concurrent model execution, dynamic batching, ensemble models, BLS (business logic scripting)
- TorchServe: model archive (MAR), inference API, management API, metrics, batch inference, custom handlers (pre-processing/post-processing)
- Seldon Core: inference graphs (pipeline of models), canary deployments(progressive traffic shifting), outlier detection (ALIBI explainer), metrics integration
- BentoML: bento packaging, runners (adaptive batching, GPU/CPU), Yatai deployment, observability
- Model optimization for serving: INT8/FP16 quantization, layer fusion, TensorRT optimization, PagedAttention for LLMs
- Canary deployments: traffic splitting (weighted, header-based), A/B testing at serving level, gradual rollout, auto-rollback

**Study:**
- Triton Inference Server documentation — model configuration, dynamic batching, metrics
- TorchServe documentation — model archive, custom handler, inference API
- Seldon Core documentation — inference graphs, canary, outlier detection
- BentoML documentation — bento building, optimization, deployment
- PagedAttention / vLLM — serving LLMs efficiently

**Close:** Package a PyTorch model as a Triton model repository; serve with dynamic batching; load test with locust; then set up a canary deployment with Seldon Core with 10% → 50% → 100% traffic shift.

---

#### η.7 Feature store (Feast, Tecton concepts)

**Subtopics:**
- Offline vs online feature stores: batch computation vs low-latency serving, materialization
- Feast: feature repository, feature views, data sources, feature services, offline/online stores (Redis, Firestore, DynamoDB), point-in-time joins
- Feature engineering at scale: Spark or Beam transformations, scheduled materialization jobs
- Feature serving: SDK (Python, Java, Go), gRPC endpoints, batch inference via offline store
- Feature validation: distribution tracking, null rate, staleness monitoring, drift detection
- Tecton (concepts): feature views, aggregations, stream feature views, on-demand feature views, feature monitoring
- Feature registry: versioning, metadata, discovery, lineage, governance

**Study:**
- Feast documentation — concepts, quickstart, deployment guide
- Tecton documentation — feature engineering concepts (their blog is excellent)
- "Feature Stores for ML" (Google PAIR) — architectural considerations
- "A Feature Store is Not a Silver Bullet" (blog essays on when/why to use one)

**Close:** Set up Feast with a local Redis online store; define 5 feature views from raw event data; materialize and serve features for both offline training and online inference.

---

#### η.8 Monitoring (Prometheus, Grafana, custom metrics, alerting)

**Subtopics:**
- Prometheus: data model (metrics, labels), PromQL (selectors, aggregation, rate, histogram), exporters (node, GPU), service discovery, recording rules, alerting rules
- Grafana: data sources, dashboards, panels (graph, stat, gauge, table), variables, annotations, alerting, Loki, Tempo
- ML-specific metrics: prediction drift (PSI, KL-divergence), feature drift, model latency (p50/p99), throughput, error rate, data staleness
- Custom metrics: exposing via Prometheus client libraries (Python, C++, Go), histograms for latency, gauges for drift, counters for errors
- Alerting: Alertmanager (silences, inhibition, grouping, routing), PagerDuty/Slack/OpsGenie integration, on-call rotation
- Observability pillars: metrics (Prometheus), logging (Loki/ELK), tracing (Jaeger/Tempo), service graph

**Study:**
- Prometheus documentation — getting started, PromQL, recording rules
- Grafana documentation — dashboard design, alerting, Loki
- "Site Reliability Engineering" (Beyer et al., Google) — monitoring patterns (USE method, RED method)
- "Practical Monitoring" (Gulko) — choosing what to measure

**Close:** Deploy Prometheus + Grafana on K8s; create dashboards for model latency (histogram), throughput, error rate, and prediction drift; set up Alertmanager rules that page on p99 latency > 500ms.

---

### Career Track θ — Fullstack / Product
Serves: Building complete products (Goal OS dashboard included), data visualisation, frontend testing, deployment.

**Phase:** 3 (parallel track)

**Topics:**

#### θ.1 React deep (rendering model, hooks, concurrent mode, Suspense, error boundaries, code splitting)

**Subtopics:**
- Rendering model: virtual DOM, reconciliation (fibers, diffing algorithm), keys, batching, flushSync
- Hooks: useState (closure trap, functional updates, lazy init), useEffect (lifecycle, cleanup, dependency array pitfalls), useRef (mutable refs, forwardRef), useMemo/useCallback (memoization, when to use), useReducer (complex state, dispatch), useContext, custom hooks (composability)
- Concurrent mode (React 18): useTransition, useDeferredValue, automatic batching, startTransition vs useState
- Suspense: data fetching (Suspense-enabled libraries), fallback, transitions, streaming server rendering
- Error boundaries: componentDidCatch (legacy), error boundaries with hooks patterns, recoverable errors
- Code splitting: React.lazy, Suspense boundaries, webpack/rollup chunking, preload/prefetch
- Portals and refs: createPortal, flushSync for imperative handling, callback refs for dynamic children

**Study:**
- **Spine:** React documentation (react.dev) — the new docs are excellent
- "The React Internals" blog (by Andrew Clark, Sebastian Markbåge)
- "A Complete Guide to useEffect" (Dan Abramov, overreacted.io)
- EpicReact (Kent C. Dodds) — hooks workshop, advanced patterns
- React 18 Working Group (github.com/reactwg/react-18) — concurrent features discussion

**Close:** Build a data dashboard in React with Suspense for data loading, error boundaries for each widget, code-split widgets loaded via React.lazy; measure Lighthouse performance before/after.

---

#### θ.2 TypeScript (advanced types, generics, type guards, branded types)

**Subtopics:**
- Mapped types: Partial, Required, Readonly, Pick, Omit, Record; custom mapped types with key remapping
- Conditional types: extends, infer, distributive conditional types, recursive conditional types
- Template literal types: `${T}-${K}`, string manipulation with Uppercase/Lowercase/Capitalize/Uncapitalize
- Generics: generic constraints, generic defaults, variadic tuple types, generic classes with arrow functions
- Type guards: typeof, instanceof, in, user-defined type guards, assertion functions (asserts)
- Branded types: nominal typing with intersection (`type UserId = string & { __brand: 'UserId' }`)
- satisfies operator (TS 4.9): type narrowing without widening
- Module resolution: Node16, bundler, ESM, path aliases, ambient declarations (.d.ts)

**Study:**
- TypeScript Handbook (typescriptlang.org) — read the advanced types section
- *Refactoring TypeScript* (Larsen) — refactoring patterns with types
- "Type Challenges" (github.com/type-challenges/type-challenges) — exercises for every TS feature
- "Effective TypeScript" (Vanderkam) — 83 specific items, each with before/after

**Close:** Implement a type-safe event emitter with generic event map (discriminated unions for payloads, branded types for event IDs); write 10 type challenges from the advanced set.

---

#### θ.3 CSS (layout, custom properties, container queries, animations)

**Subtopics:**
- Layout: flexbox (flex, grow/shrink/basis, alignment axis), grid (grid-template, auto-fit/minmax, grid areas), subgrid, multi-column, intrinsic sizing (min-content, max-content, fit-content)
- Custom properties: scoping, fallbacks, inheritance, animation with custom properties, registered custom properties (@property)
- Container queries: container-type, container-name, container queries vs media queries, container units (cqw, cqh)
- Animations: CSS transitions (timing functions, cubic-bezier), CSS @keyframes (animation-direction, fill-mode, iteration count), will-change, transforms (translate, rotate, scale, skew), perspective
- framer-motion: motion components, layout animations (layout prop), AnimatePresence (exit animations), gesture (drag, hover, tap), variants
- Pseudo-elements: ::before/::after for decorative elements, content property, counters

**Study:**
- *CSS for JavaScript Developers* (Josh Comeau) — mental model approach
- MDN CSS docs — grid, container queries, custom properties
- "CSS Tricks Complete Guide to Grid" (css-tricks.com)
- Framer Motion documentation — components, animation, gestures, layout animations
- "What the Flexbox?" (Flexbox Froggy, or Wes Bos Flexbox course)

**Close:** Implement a responsive dashboard layout: sidebar (collapsible) + header + main content area with grid; dark mode toggle via custom properties; add framer-motion exit animations when widgets are removed.

---

#### θ.4 State management (Zustand, Jotai, TanStack Query, URL state)

**Subtopics:**
- Zustand: store creation, selectors (equality, shallow), persist middleware, subscribeWithSelector, devtools, immer integration, slices pattern
- Jotai: atoms, derived atoms (read only, read/write), atom families (atomFamily), loadable (async), URL hash atom
- TanStack Query (React Query): queries (staleTime, cacheTime, refetchInterval, placeholder data, select), mutations (optimistic updates, rollback), infinite queries, query invalidation, prefetching
- URL state: useSearchParams, nuqs (React state synced with URL), shallow routing
- Server state vs client state: TanStack Query for server cache, Zustand/Jotai for client-only state
- When to use each: Zustand for global client stores (auth, UI), Jotai for atomic local state, TanStack Query for server cache, URL state for sharable/deep-linkable state

**Study:**
- Zustand documentation (docs.pmnd.rs) — guides, API reference
- Jotai documentation — basics, atoms, atoms-in-atoms
- TanStack Query docs (tanstack.com/query) — overview, guides, examples
- "The State of State Management" (blog comparison posts)

**Close:** Refactor Goal OS store from a single Zustand store → split into Zustand (UI/preferences), TanStack Query (server/progress data), URL state (active cluster, page filters); measure render count reduction.

---

#### θ.5 Data visualization (Recharts, D3 basics, Canvas 2D)

**Subtopics:**
- Recharts: LineChart, BarChart, PieChart, AreaChart, ScatterChart; responsive container, tooltip, legend, custom shapes, brush, reference line
- D3 basics: selections (d3.select, enter-update-exit cycle), scales (linear, ordinal, time), axes, SVG generators (line, area, arc), transitions (ease)
- Canvas 2D API: canvas element, 2D context, path drawing, gradients, transformations (translate, rotate, scale), pixel manipulation (imageData)
- Performance: rendering 100k+ points (Canvas vs SVG), throttled resize observer, memoized chart render, Web Workers for data processing
- Chart types: time-series, histograms, scatter plots with color encoding, heatmaps, Sankey diagrams (D3)
- Accessibility: aria roles, color blindness (colorBrewer palettes), keyboard navigation for charts

**Study:**
- Recharts official documentation and examples
- "Data Visualization with D3.js" (Observable tutorials) — free
- MDN Canvas tutorial — shapes, compositing, pixel manipulation
- *Designing Data Visualizations* (Illinsky & Steele) — narrative and chart selection
- *The Grammar of Graphics* (Wilkinson) — theoretical foundation for D3/ggplot2

**Close:** Build a time-series dashboard in Goal OS that plots daily progress across 9 clusters; use Recharts for standard charts, Canvas for a 10k+ data point heatmap; add color-blind safe palette.

---

#### θ.6 Real-time data (WebSockets, SSE, streaming JSON)

**Subtopics:**
- WebSockets: handshake (HTTP upgrade), frames, close codes, ping/pong keepalive, reconnection logic (backoff, jitter)
- Server-Sent Events (SSE): EventSource API, event stream format (id, event, data, retry), auto-reconnection, named events
- Streaming JSON: newline-delimited JSON (NDJSON), JSON streaming with fetch + ReadableStream, chunked transfer encoding
- Client: implementing reconnection with exponential backoff (with full jitter), buffering, message ordering, deduplication
- Server: implementing WebSocket server (ws in Node.js, C++ WebSocket++ or uWebSockets), SSE endpoint, heartbeat
- Protocols: WebSocket vs SSE vs polling vs gRPC streaming — comparison for different use cases
- Scaling real-time: Redis pub/sub for multi-server broadcast, backpressure handling, rate limiting

**Study:**
- MDN WebSocket API documentation — client-side guide
- "High Performance Browser Networking" (Grigorik) — WebSocket, SSE chapters
- RFC 6455 (WebSocket protocol) — read the frame format and close codes
- *Designing Data-Intensive Applications* (Kleppmann) — chapter on message brokers

**Close:** Build a real-time progress dashboard: Node.js server pushes updates via SSE, React client displays live cluster progress bars; add WebSocket fallback for bidirectional communication (editing, saving).

---

#### θ.7 Frontend testing (Vitest, Testing Library, Playwright)

**Subtopics:**
- Vitest: test runner configuration (jsdom, globals, setup files), mocking (vi.mock, vi.spyOn, vi.fn), coverage, watch mode
- Testing Library: render, screen queries (getBy, findBy, queryBy, within), userEvent, waitFor, act, custom queries, testing accessibility (jest-dom), testing async logic
- Component patterns: testing rendering, user interactions, async data, error states, edge cases (empty data, loading, error)
- Playwright: browser tests (Chromium, Firefox, WebKit), locators, assertions, fixtures, page object model, visual regression (screenshot comparison)
- Playwright CI: GitHub Actions integration, sharding, retries, trace viewer for failures
- Test philosophy: testing behavior not implementation, mocking server responses (MSW), testing at the right level (unit vs integration vs e2e)

**Study:**
- Vitest documentation (vitest.dev) — configuration, mocking, coverage
- Testing Library documentation — queries, userEvent, async patterns
- "Testing Library: Guiding Principles" (Kent C. Dodds)
- Playwright documentation — locators, assertions, fixtures, CI
- *Testing JavaScript Applications* (da Costa) — full-stack testing

**Close:** Achieve 80%+ test coverage on Goal OS dashboard: unit tests with Vitest, integration tests with Testing Library, 5 Playwright e2e tests covering critical user flows; set up CI to fail on coverage drop.

---

#### θ.8 Deployment (Vercel, Docker, nginx, CDN)

**Subtopics:**
- Docker multi-stage builds: builder pattern, distroless images, layer optimization (apt-get cleanup, .dockerignore, COPY order), security scanning
- nginx: reverse proxy (proxy_pass), load balancing (upstream, round-robin), caching (proxy_cache), rate limiting (limit_req), SSL termination (certbot/Let's Encrypt), gzip/brotli compression
- CDN: Cloudflare (cache rules, page rules, WAF, DDoS), AWS CloudFront (distribution, origins, behaviors, Lambda@Edge), Fastly (VCL, instant purge), edge caching best practices
- Vercel: serverless deployment, automatic SSL, preview deployments, environment variables, web analytics, cron jobs
- Container orchestration: Docker Compose (local dev), Kubernetes (production: rolling updates, readiness probes, resource limits, HPA)
- CI/CD for deployment: GitHub Actions deploy to staging (on PR) / production (on main), blue-green deployment, database migrations in CI

**Study:**
- Docker documentation — multi-stage builds, best practices
- nginx documentation — beginner's guide, HTTP load balancing
- Cloudflare CDN documentation — caching, WAF, DDoS protection
- *The Docker Handbook* (Ferdinando Santacroce) — production patterns
- *Continuous Delivery* (Humble & Farley) — deployment patterns

**Close:** Deploy Goal OS with Docker multi-stage build → nginx reverse proxy → Cloudflare CDN; set up GitHub Actions to auto-deploy staging on PR (Vercel preview) and production on merge; add SSL termination, brotli compression, rate limiting.

---

#### θ.9 Shipping a product (MVP scoping, feature flags, error tracking, analytics)

**Subtopics:**
- MVP scoping: user story mapping, critical path, "what can I ship in 2 weeks?", prioritized backlog, anti-patterns (gold-plating, second-system effect)
- Feature flags: LaunchDarkly, Flagsmith, or custom (flags as code + config), gradual rollout, kill switch, A/B testing with flags, cleanup after rollout
- Error tracking: Sentry (errors, performance, releases), source maps, grouping, alerts for new errors, breadcrumbs, user context
- Analytics: PostHog (self-hosted, events, funnels, trends, retention), Google Analytics, product analytics vs marketing analytics
- User feedback: in-app feedback widgets (PostHog surveys, Hotjar), NPS surveys, qualitative feedback cycles, "The Mom Test" questions
- Monitoring: health check endpoints, uptime monitoring (Better Uptime, Pingdom), status page, PagerDuty integration

**Study:**
- *The Mom Test* (Fitzpatrick) — customer conversations for product validation
- *Shape Up* (Basecamp) — product scoping methodology
- *Lean Startup* (Ries) — MVP philosophy, build-measure-learn
- *Escaping the Build Trap* (Perri) — product strategy and prioritization
- Sentry documentation — error grouping, releases, performance

**Close:** Ship a real feature on Goal OS from idea → MVP → analytics → user feedback → iteration; implement the full cycle: feature flag → canary → full rollout → clean flag; add Sentry for error tracking and PostHog for product analytics.

---

#### θ.10 Node / Bun backend basics (file I/O, REST API, local-first server)

**Subtopics:**
- Bun runtime: built-in HTTP server (Bun.serve), file system (Bun.file, Bun.write), TypeScript-native with no tsconfig required, hot reload (--hot), ~3× faster startup than Node
- Hono: ultralight type-safe router (0 runtime dependencies), works on Bun/Node/Cloudflare Workers, zod-based input validation middleware, RPC mode for type-safe client generation
- REST API patterns: resource naming, HTTP method semantics, status codes (201/204/400/404/409), JSON body parsing, middleware pipeline, centralized error handler
- File-based persistence: atomic writes (write to temp path → rename to avoid partial reads under concurrent access), file watching for live reload, progress.json schema validation with zod
- Local security: CORS permissive for localhost origins, optional Authorization header for LAN access, rate limiting via Hono middleware
- Packaging: Bun single-binary compile (`bun build --compile`), Docker with oven/bun base image, PM2 for Node process supervision

**Study:**
- Bun documentation (bun.sh) — HTTP server, file API, bundler, test runner
- Hono documentation (hono.dev) — routing, middleware, validation, client RPC mode
- "Local-First Software" (Kleppmann et al., 2019) — philosophy for offline-first and local-first apps

**Close:** Build the Goal OS backend: Bun + Hono REST API (GET /clusters, PATCH /topics/:id/progress, POST /logs, GET /stats/weekly), atomic reads/writes to progress.json with zod validation, serves compiled React SPA from /dist; compile to a single self-contained binary; document with an OpenAPI spec.

---

## COMMON CORE — The Universal Backbone

> All topics below are now **covered in detail** under their respective clusters with full subtopic breakdowns, study materials, and closing exercises. See:
> - **Math/Algorithms** → Foundational Substrate (FS.1)
> - **AI/ML Engineering** → Cluster α (α.1–α.8)
> - **Control, Estimation, SLAM, Robotics** → Cluster β (β.1–β.7) + Branch C
> - **Embedded/Real-Time** → Cluster γ (γ.1–γ.8)
> - **Software Engineering/Infrastructure** → Cluster ε (ε.1–ε.7) + Career Track ζ
> - **Physics/Modeling** → Cluster δ (δ.1–δ.7)

### 1. Mathematical & Algorithmic Maturity

**Topics:**
- Linear algebra (SVD, eigen, matrix calculus, pseudoinverse)
- Probability & statistics (Bayesian inference, Monte Carlo, information theory)
- Numerical methods (ODE/PDE solvers, integration, root-finding)
- Optimization (convex, gradient descent, Lagrangian duality)

> Note: DSA is no longer part of Common Core. It has moved to the **Career Track ζ — SDE Engineering** cluster (Phase 3), where it's treated as interview preparation with a systematic Neetcode‑150 workflow.

**Study Resources:**
- **Spine:** *Mathematics for Machine Learning* (Deisenroth, Faisal, Ong) — free at mml-book.github.io
- *Modern Statistics: Intuition, Math, Python, R* (Mike X Cohen) — code-first; GitHub exercises at `github.com/mikexcohen/Statistics_book`
- MIT 6.006 Introduction to Algorithms (YouTube) — conceptual refresh (optional, for theory)

**Projects to Close:**
- Implement SVD from scratch in NumPy, use it to compress an image, blog the derivation

---

### 2. AI/ML Engineering Core (Frontier-Leaning)

See **Cluster α** for full expanded curriculum (α.1–α.8).

---

### 3. Control, Estimation & Physics for Autonomy

See **Cluster β** + **Branch C** for full expanded curriculum (β.1–β.7).

---

### 4. Embedded & Real-Time Systems

See **Cluster γ** for full expanded curriculum (γ.1–γ.8).

---

### 5. Software Engineering & Infrastructure (Supporting Fluency)

See **Cluster ε** + **Career Track ζ** for full expanded curriculum.

---

### 6. Physics & Modeling Fundamentals

See **Cluster δ** for full expanded curriculum (δ.1–δ.7).

---

### 5. Software Engineering & Infrastructure (Supporting Fluency)

**Topics:**
- Git, CI/CD (GitHub Actions), testing (pytest, GTest)
- Build systems: CMake, Bazel, PlatformIO
- Containerization: Docker, basic Kubernetes for ML training
- Cloud: AWS basics (EC2, S3, Lambda)
- Experiment tracking: Weights & Biases, MLflow
- Data version control: DVC

**Study Resources:**
- GitHub Actions documentation
- CMake official tutorial
- Docker documentation
- W&B quickstart, MLflow docs
- DVC official tutorial

**Projects to Close:**
- Containerize a PyTorch training script with Docker, run on cloud GPU, log metrics to W&B, version dataset with DVC

---

### 6. Physics & Modeling Fundamentals

**Topics:**
- Classical mechanics (Lagrangian/Hamiltonian)
- Electromagnetism basics (sensors, radiation effects)
- Numerical simulation of physical systems
- Physics-informed neural networks (PINNs) — concept level

**Study Resources:**
- *Classical Mechanics* (Goldstein) — use AI tutor, not cover to cover
- *Introduction to Electrodynamics* (Griffiths) — first few chapters
- Original PINNs paper (Raissi et al.)
- DeepONet and Fourier Neural Operator papers (concept)

**Projects to Close:**
- Implement a 1D heat equation PINN solver in PyTorch
- Simulate a double pendulum using Lagrangian mechanics and compare to numerical integration

---

## SPECIALIZED BRANCHES (Additive on Core)

### Branch A: Frontier AI Research Engineer/Scientist

> Prerequisite: Cluster α (α.1–α.8). This branch adds depth for research-lab roles.

**Subtopics:**

**A.1 Distributed training internals (Megatron, ZeRO stage analysis)**
- Tensor parallelism: column/row linear splits, Megatron ffn/attention strategies, communication volume analysis
- Pipeline parallelism: GPipe vs 1F1B vs interleaved, bubble percentage formula, optimal micro-batch sizing
- ZeRO stages deep: ZeRO-R (residual memory), ZeRO-Offload, ZeRO-Infinity, memory breakdown per stage
- Overlapping comm/compute: async all-reduce, double buffering, pipeline flush overhead
- Network topology: NVLink ring, InfiniBand rail-optimized, token-based routing
- Checkpointing: async distributed checkpoint, fragmentation, resharding

**Study:**
- Megatron-LM paper (Shoeybi et al.) — tensor + pipeline parallelism
- ZeRO papers (Rajbhandari et al., 2019, 2020, 2021)
- "Reducing Activation Recomputation in Large Transformer Models" (Korthikanti et al.)
- "Efficient Large-Scale Language Model Training on GPU Clusters" (Narayanan et al.)
- NCCL documentation — all-reduce implementation details

**Close:** Profile memory vs throughput for a 1B param model across DDP / FSDP / ZeRO‑3 / Megatron-TP; plot the trade-off space.

---

**A.2 MoE expert parallelism and load balancing**
- Routing: top-2 vs top-k, expert choice routing, hash-based routing
- Load balancing: auxiliary loss (importance + load), differentiable gating, z-loss, capacity factor
- Expert parallelism: all-to-all communication, expert placement (random, hash-based, locality)
- Memory: expert parameter memory, activation memory for K=2 vs K=1, dynamic expert scaling
- Training vs inference: dense vs sparse compute ratio, batch size scaling for MoE

**Study:**
- ST-MoE paper (Fedus et al., 2022) — load balancing, performance
- "Switch Transformers" (Fedus et al., 2021) — MoE in transformers
- MegaBlocks (Gale et al., 2023) — block-sparse moe without capacity factor
- DeepSpeed-MoE documentation

**Close:** Implement an MoE feedforward layer with top-2 routing + auxiliary load balancing loss; train a small MoE transformer and compare to dense; report per-step throughput.

---

**A.3 LLM evaluation, red-teaming, alignment**
- Evaluation: MMLU, HumanEval, GSM8K, MATH, BigBench, HELM, Chatbot Arena; calibration, ECE
- Red-teaming: adversarial attacks (jailbreaking, prompt injection), automated red teaming, constitutional AI
- RLHF deep: reward model training, PPO in language (KL penalty, reward normalization, advantage whitening), KTO (Kahneman-Tversky optimization)
- DPO: direct preference optimization, iterative DPO, online/offline DPO, why it works without a reward model
- Alignment tax: accuracy-deference trade-off, over-optimization (reward hacking), Goodhart's law
- Safety: harmlessness, truthfulness, robustness, privacy

**Study:**
- "Training a Helpful and Harmless Assistant from Human Feedback" (Anthropic, 2022)
- "Constitutional AI: Harmlessness from AI Feedback" (Anthropic)
- "Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena" (Zheng et al.)
- TRL library (Transformer Reinforcement Learning)
- "Secrets of RLHF" (Zheng et al., 2023) — practical insights

**Close:** Fine-tune a small LLM (1B) with DPO; evaluate on MMLU and a toxicity benchmark; run a red-teaming session with 20 adversarial prompts; document failure modes.

---

**A.4 Data engineering at scale (CommonCrawl curation, deduplication)**
- CommonCrawl WARC/WET/WAT format — parsing, streaming, filtering
- Quality filtering: fastText quality classifier, CCNet pipeline (perplexity filtering based on a reference LM)
- Deduplication at scale: MinHash LSH (document-level), Bloom filters (URL), exact deduplication (hash-based), fuzzy dedup (Edit distance, SimHash)
- Data mixing: data proportions for pretraining vs domain-specific, curriculum learning
- Synthetic data generation: self-instruct, evol-instruct, rejection sampling, dedup of synthetic outputs
- Data governance: privacy (PII removal), license tracking, contamination detection

**Study:**
- CCNet (Wenzek et al., 2020) — CommonCrawl filtering pipeline
- "Deduplicating Training Data Makes Language Models Better" (Lee et al., 2022)
- "Pile: An 800GB Dataset of Diverse Text for Language Modeling" (Gao et al., 2020)
- "DataComp-LM" (2024) — controlled data experiments for LLMs
- bigscience-watch (OpenScience) — data preparation for BLOOM

**Close:** Download 100GB CommonCrawl data; build a filtering pipeline (fastText quality + perplexity filter + MinHash dedup); train a small model on the filtered vs unfiltered data; compare loss curves.

---

**A.5 Novel architecture design (scientist track)**
- Attention alternatives: linear attention (Performer, Linformer), multi-query/grouped-query attention, sliding window attention, dilated attention
- Position encoding innovations: RoPE variants, ALiBi, no position encoding (NoPE), NTK-aware scaling
- Hybrid architectures: transformer + SSM (Jamba, Mamba-2 hybrid), transformer + retrieval (RETRO), multi-modal fusion
- Scaling theory: compute-optimal scaling with data constraints, scaling across modalities
- Designing and running ablations: controlled experiments, statistical significance, variance reduction
- Publication: writing papers, rebuttals, open-sourcing code/models, presenting at workshops/conferences

**Study:**
- "Transformer Quality in Linear Time" (Mamba-2, Gu & Dao, 2024)
- "Jamba: A Hybrid Transformer-Mamba Language Model" (AI21, 2024)
- "Scaling Data-Constrained Language Models" (Muennighoff et al., 2023)
- "How to Read a Paper" (Keshav)
- Current top venues: NeurIPS, ICML, ICLR, ACL/EMNLP for NLP

**Close:** Design a novel attention variant (or SSM hybrid), implement in PyTorch, benchmark against baseline on a standard eval suite; write up findings as a blog post or paper draft.

---

### Branch B: Space & Rockets (Including Mars/Habitat)

#### B.1 Orbital & Attitude GNC

**Subtopics:**
- Two-body problem: orbital elements, Kepler's equation (eccentric/mean/true anomaly), orbit determination (Gibbs, Lambert), ground track
- Perturbations: J2 (nodal precession, perigee rotation), atmospheric drag (exponential/Barometric models), solar radiation pressure, third-body (lunisolar)
- Interplanetary: patched conics, Lambert's problem, porkchop plots, gravity assists, deep space maneuvers
- Lagrange points and station-keeping: halo/Lissajous orbits, CR3BP, manifolds, delta-V budget
- Attitude representation: quaternions (multiplication, rotation, error), Euler angles (gimbal lock, singularities), DCM, MRPs
- Attitude determination: TRIAD, QUEST, REQUEST, star tracker centroiding + catalog matching (lost-in-space)
- Attitude control: PD/PID, quaternion feedback, reaction wheel desaturation (magnetic torquers, thrusters), momentum management
- Low-thrust: electric propulsion (Hall/Ion), continuous thrust trajectory optimization (indirect/direct methods), gravity-assist + low-thrust hybrid

**Study:**
- **Spine:** *Orbital Mechanics for Engineering Students* (Curtis) + CU Boulder "Advanced Spacecraft Dynamics" (Coursera)
- *Spacecraft Attitude Determination and Control* (Wertz) — comprehensive reference
- *Fundamentals of Spacecraft Attitude Determination and Control* (Markley & Crassidis) — modern quaternion approach
- Orekit (orekit.org) — production astrodynamics library in Java (read the concepts)
- Poliastro (Python) — educational orbit propagation and plotting
- GMAT (NASA) — mission validation
- SPICE (NAIF) — ephemerides, planetary frames, instrument pointing
- *Spacecraft Trajectory Optimization* (Conway) — low-thrust methods

**Close:** Implement orbit propagator with J2+drag+SRP in Python/C++; validate against GMAT (TLE propagation, ground track visualization); design PD attitude controller for detumbling using magnetic torquers; simulate Mars transfer porkchop plot with Lambert solver.

---

#### B.2 Propulsion

**Subtopics:**
- Rocket equation: delta-V, Tsiolkovsky, staging, mass ratio, Isp, thrust-to-weight
- Chemical: liquid (pressure-fed vs pump-fed, regenerative cooling, nozzle design, throttling), solid (grain geometry, burn rate), hybrid (nitrous oxide / HTPB)
- Electric: Hall thruster (magnetic layer, ionization, acceleration), ion (grid, Kaufman, RIT), MPD, PPT; specific impulse vs thrust density trade-off
- Nuclear: NERVA concepts, nuclear thermal (hydrogen propellant), nuclear-electric (reactor + ion), shielding, safety
- Low-thrust trajectories: continuous thrust spiral (Earth→GEO→Moon→Mars), indirect shooting (primer vector), direct collocation
- Propellant management: pressurization, slosh dynamics, propellant settling (ullage), cryogenic storage (boil-off, zero-boil-off)
- ISRU: Sabatier reaction (CO₂ + 4H₂ → CH₄ + 2H₂O), water electrolysis, methane/LOX production, water ice mining on Moon/Mars

**Study:**
- *Rocket Propulsion Elements* (Sutton & Biblarz, 9th ed) — fundamentals, liquid, electric chapters
- *Introduction to Rocket Propulsion for Astronautics* (Musielak, 2025)
- *Use of Extraterrestrial Resources for Human Space Missions to Moon or Mars* (Rapp) — ISRU bible
- *Spacecraft Trajectory Optimization* (Conway) — low-thrust methods
- "Low-Thrust Trajectory Optimization" (lecture series, AGARD)

**Close:** Build a staging optimization calculator (liquid + solid stages); simulate low-thrust spiral trajectory to Mars with electric propulsion; model Sabatier reactor mass/energy balance for a 500-day Mars mission.

---

#### B.3 Planetary Surface Autonomy

**Subtopics:**
- Autonomous navigation: visual odometry (VO) for rovers, wheel slip detection, stereo depth estimation, hazard detection (rock, slope, soft soil)
- Terrain modeling: DEM generation from stereo, traversability analysis, soil properties (terramechanics: Bekker, Wong-Reece models)
- Communication-delayed ops: up to 40-min round trip, state-based autonomy, waypoint execution, safe hold states
- Multi-agent coordination: swarm exploration (frontier-based, coverage planning), shared mapping under intermittent comms, robot-robot relative localization
- Autonomous science: AEGIS (Autonomous Exploration for Gathering Increased Science) on Mars rovers, active learning for science target selection, anomaly detection (dust storms, wheel damage, thermal anomalies)
- Regolith utilization: 3D printing construction, ISRU feedstock characterization, in-situ manufacturing
- Fault tolerance: redundant navigation (visual + inertial + sun sensor), graceful degradation, safe mode entry

**Study:**
- NASA cFS — open-source flight software, runs on Raspberry Pi
- Basilisk (JPL/University of Colorado) — astrodynamics + rover simulation
- *Principles of Robot Motion* (Choset et al.) — planning algorithms for rovers
- *Terramechanics and Off-Road Vehicle Engineering* (Wong) — rover-soil interaction
- "Autonomous Science on Mars" (AEGIS papers) — Perseverance's science autonomy
- *Swarm Robotics: A Formal Approach* (Hamann) — swarm coordination patterns

**Close:** Set up cFS on Raspberry Pi with a GNC app that processes simulated stereo imagery for hazard detection; simulate communication delay and execute waypoint sequence autonomously; log all decisions for post-mission review.

---

#### B.4 Habitat Systems (Mechanical/Thermal/Electrical/Life Support)

**Subtopics:**
- Thermal control: radiation heat transfer (Stefan-Boltzmann, view factors), conduction, heat pipes (loop heat pipes, variable conductance), MLI (multi-layer insulation), radiator sizing (planet vs deep space), thermal storage (phase change materials)
- Life support: CO₂ scrubbing (zeolites, amine swing beds, Sabatier), water recycling (vapor compression distillation, reverse osmosis, multi-filtration), O₂ generation (water electrolysis), atmospheric pressure control (N₂/O₂ mix), ECLSS architecture (ISS-derived)
- Power systems: solar arrays (GaAs triple-junction, flexible blanket, dust mitigation), RTGs (Pu-238, thermocouples, MMRTG), battery management (Li-ion, LiFePO₄, depth of discharge, cycle life, thermal runaway), power distribution (regulated/unregulated bus, MPPT, DC-DC converters, fault isolation)
- Structural health monitoring: accelerometer networks, frequency response analysis, acoustic emission, damage detection neural networks
- In-situ manufacturing: 3D printing with regolith simulant (sintering, binder jet, extrusion), additive manufacturing for spare parts, automated assembly

**Study:**
- *Spacecraft Thermal Control Handbook* (Gilmore) — fundamentals, radiator design
- *Spacecraft Power Systems* (Patel) — solar arrays, batteries, power management
- *Spacecraft Life Support Systems* (Larson & Pranke) — NASA reference
- NASA 3D-Printed Habitat Challenge reports — in-situ construction
- *Extraterrestrial Construction* — ISRU-based building techniques
- Structural health monitoring review papers (vibration-based damage detection)

**Close:** Simulate a habitat thermal model (radiation + conduction + internal heat loads) with PID temperature control; build a power budget for 500-day Mars habitat (solar + RTG + battery) with RL-based load shedding; design a CO₂ scrubbing cycle with Sabatier methane production; model the mass/energy balance.

---

#### B.5 Advanced AI for Space

**Subtopics:**
- Vision-Language-Action for space: fine-tune VLM on orbital/surface imagery for science report generation, terrain assessment, anomaly description
- Fault detection: transformer-based telemetry anomaly detection (attention on sensor sequences), autoencoder + reconstruction error, contrastive learning for rare events
- Autonomous mission planning: PDDL planners (NASA EUROPA), goal-based planning vs reactive execution, onboard re-planning
- Multi-agent emergent behavior: MARL for exploration coordination (heterogeneous rovers + orbiter relay), communication under bandwidth constraints
- Foundation models for remote sensing: MAE (masked autoencoder) for satellite imagery, self-supervised learning on unlabeled data, fine-tune for specific tasks (change detection, cloud removal, land cover)
- Explainability: attribution maps for science decisions, uncertainty quantification in hazard detection

**Study:**
- RT-2, PaLM-E papers — vision-language-action models
- NASA AEGIS papers (onboard science target selection)
- "Foundation Models for Remote Sensing" (Jakubik et al., 2023)
- *Multi-Agent Reinforcement Learning* (Albrecht et al.) — foundations and algorithms
- PDDL / NASA EUROPA documentation — planning in space domain

**Close:** Fine-tune a VLM (LLaVA or similar) on satellite imagery + Mars rover photos for anomaly detection; build a multi-agent RL exploration simulation with 3 rovers + orbiter under 40-min delay; train a transformer-based anomaly detector on MSL telemetry data.

---

### Branch C: Robotics (Manipulation, Locomotion, Drones)

> Prerequisite: Cluster β (β.1–β.7). This branch adds depth on manipulation, legged locomotion, and aerial robotics.

#### C.1 Kinematics / Dynamics (DH, Jacobians, inverse kinematics, Newton-Euler, Lagrangian)

**Subtopics:**
- DH parameters: conventions (Craig vs Spong), transformation trees, end-effector pose
- Forward kinematics: product of exponentials (screw theory), recursive computation
- Inverse kinematics: analytical (6-DOF arm with spherical wrist), numerical (Jacobian pseudoinverse, damped LS, Levenberg-Marquardt)
- Velocity kinematics: geometric Jacobian, analytical Jacobian, singularity analysis, manipulability ellipsoid
- Dynamics: Newton-Euler (recursive, O(n)), Lagrangian (closed form, mass matrix), Featherstone's articulated-body algorithm (O(n))
- Contact dynamics: friction cone, complementarity (hard contact), spring-damper (soft contact), impact models

**Study:**
- "Modern Robotics" (Lynch & Park) — Chapters 2-4 (kinematics), 8 (dynamics) — free online
- "A Mathematical Introduction to Robotic Manipulation" (Murray, Li, Sastry) — screw theory
- Drake documentation — rigid-body dynamics, contact solving
- MuJoCo documentation — contact model, dynamics simulation

**Close:** Implement forward/inverse kinematics for a 6-DOF arm; derive and compute the Jacobian; simulate the arm reaching a target in MuJoCo; compare Newton-Euler vs Lagrangian for torque calculation.

---

#### C.2 Whole-body control (QP-based, Drake/CasADi)

**Subtopics:**
- Task-space control: operational space formulation, null-space projection, hierarchy of tasks
- QP formulation: quadratic cost (task error), linear/inequality constraints (joint limits, torque limits, friction cones), solver choice (OSQP, qpOASES, ProxQP)
- Contact-implicit optimization: complementarity constraints in optimization, contact scheduling
- Multi-contact: centroidal dynamics, contact force distribution, CoM regulation under multiple contacts
- Compliance: impedance control, admittance control, force-torque feedback, variable impedance
- Safety: self-collision detection, signed distance fields, potential fields for obstacle avoidance

**Study:**
- "Whole-Body Impulsive Behaviors for Humanoid Robots" (Hauser, 2014) — contact scheduling
- Drake tutorials (drake.mit.edu) — QP-based whole-body control
- *Model Predictive Control for Robotics* (Rawlings et al.) — contact-constrained MPC
- "A Data-Efficient Framework for Training and Sim-to-Real Transfer of Navigation Policies" (Zhu et al., 2018)

**Close:** Implement a QP-based whole-body controller for a simulated quadruped to stand and maintain balance under external pushes; log contact forces and torque saturations.

---

#### C.3 Manipulation (grasping, force control, impedance control, imitation learning)

**Subtopics:**
- Grasp planning: force-closure grasp, grasp metrics (Q₁, epsilon, Ferrari-Canny), antipodal grasp, suction vs finger
- Grasp synthesis: analytical (shape matching), data-driven (GraspNet, 6-DOF grasp detection), sim-to-real transfer
- Force control: hybrid position-force control, parallel force/position control, explicit vs implicit force control
- Impedance control: stiffness, damping, inertia shaping; interaction with stiff environment
- In-hand manipulation: dexterous hands, finger gaiting, in-hand regrasping, tactile sensing (GelSight, tactile array)
- Imitation learning: behavioral cloning (BC), DAgger (dataset aggregation), action chunking with transformers (ACT), diffusion policy
- Sim-to-real for manipulation: domain randomization, system identification, dynamics randomization, asset randomization

**Study:**
- *Grasping and Manipulation* (Murray, Li, Sastry) — force-closure, form-closure
- "GraspNet: 6-DOF Grasp Pose Estimation" (Fang et al., 2020)
- "A Framework of Space-Time Continuous Models for Algorithm Design on a Robot Arm" (Hogan, 1985) — impedance control fundamentals
- "Action Chunking with Transformers" (Zhao et al., 2023) — ACT for imitation
- "Diffusion Policy: Visuomotor Policy Learning via Action Diffusion" (Chi et al., 2023)

**Close:** Train a diffusion policy from 50 human demonstrations in simulation; transfer to real robotic arm (or sim-to-sim with domain randomization); evaluate success rate on pick-and-place; benchmark against behavioral cloning baseline.

---

#### C.4 Legged locomotion (ZMP, capture point, MPC, RL for gait)

**Subtopics:**
- ZMP (zero-moment point) criterion: for flat-footed walking, ZMP vs CoP, stability margin
- Capture point: pendulum model, divergent component of motion, foot placement heuristic
- Spring-loaded inverted pendulum (SLIP): running, hopping, gait selection
- Model predictive control: centroidal dynamics MPC, contact scheduling with MPC, whole-body MPC, real-time iteration
- RL for locomotion: PPO with domain randomization, reward shaping (tracking speed, energy efficiency, smoothness), symmetry priors, teacher-student (teacher privileged info, student from proprioception)
- Proprioceptive adaptation: online adaptation to payload changes, ground height, terrain compliance
- Gait library: walk, trot, pace, bound, gallop; gait transition, staircase climbing

**Study:**
- *Introduction to Humanoid Robotics* (Kajita) — ZMP, gait pattern generation
- "ANYmal: A Rugged Quadruped Robot" (Hutter et al.) — MPC + whole-body control
- "Learning Quadrupedal Locomotion over Challenging Terrain" (Lee et al., 2020, RSS) — RL with teacher-student
- "Rapid Locomotion via Reinforcement Learning" (Rudin et al., 2022) — parkour for ANYmal
- MuJoCo + Gymnasium — locomotion environment

**Close:** Train a PPO policy in MuJoCo for a quadruped to walk and trot on flat terrain; transfer to rough terrain (random steps, slopes) with domain randomization; compare gait efficiency (CoT = cost of transport) at different speeds.

---

#### C.5 ROS 2, MoveIt 2, PX4, simulation (Gazebo, MuJoCo, Isaac Sim)

**Subtopics:**
- ROS 2: nodes, publisher/subscriber, services (request-response), actions (goal, feedback, result), tf2 (transform tree), launch files (Python), composition (component containers)
- MoveIt 2: move_group node, OMPL (RRTConnect, RRTstar, PRM), collision checking (FCL, PQP), planning scene, motion planning pipelines, Cartesian paths
- PX4 / ArduPilot: SITL (software-in-the-loop), attitude/position controllers, EKF2 estimator, logging, MAVSDK/MAVLink, parameter tuning
- Gazebo: SDF models (world, model, link, joint, plugin), sensor simulation (GPU LiDAR, depth camera, IMU), timing and stepping
- MuJoCo: MJCF model format, actuators, sensors, contact parameters, hidden (render-only) geometries
- Isaac Sim: USD-based scene, RTX rendering, synthetic data generation, domain randomization, Omnigraph for physics control

**Study:**
- ROS 2 Official Tutorials — all beginner-to-intermediate
- MoveIt 2 documentation — kinematics, planning, collision checking
- PX4 SITL documentation — Gazebo simulation, MAVSDK examples
- *Robot Operating System (ROS) for Absolute Beginners* (Joseph) — concepts before code
- MuJoCo documentation — modeling, simulation, Python bindings
- Isaac Sim documentation — getting started, manipulator examples

**Close:** Set up a ROS 2 + MoveIt 2 + Gazebo pipeline for a 6-DOF arm with perception (depth camera); plan and execute a pick-and-place; log tf transforms and visualize in RViz; then deploy a PX4 quadcopter in SITL with the same ROS 2 bridge.

---

#### C.6 SLAM for robotics (ORB-SLAM3, VINS, visual-inertial odometry)

**Subtopics:**
- Visual SLAM pipeline: feature extraction → matching → motion estimation (PnP, essential matrix) → local mapping → loop closing → global optimization
- ORB-SLAM3: atlas (multi-map), IMU preintegration, visual-inertial initialization, place recognition (DBoW2), monocular/stereo/RGB-D
- VINS-Mono / VINS-Fusion: IMU preintegration theory, visual inertia alignment, marginalization, relocalization
- Visual-inertial odometry: MSCKF (stochastic cloning, sliding window), keyframe-based vs filtering
- Dense SLAM: KinectFusion (TSDF), octomap (probabilistic occupancy), RGB-D SLAM (ElasticFusion)
- LiDAR SLAM: LOAM/A-LOAM (scan matching, Lidar odometry), Cartographer (submap, scan-to-submap matching, loop closure), ICP variants (point-to-plane, GICP)
- Evaluation: evo (APE, RPE), TUM RGB-D, KITTI odometry, EuRoC MAV

**Study:**
- ORB-SLAM3 paper + GitHub — study the codebase architecture
- VINS-Mono paper + GitHub — IMU preintegration derivation
- "Visual-Inertial Monocular SLAM with Map Reuse" (Campos et al., ORB-SLAM3)
- Cartographer GitHub + ROS integration documentation
- *Multiple View Geometry in Computer Vision* (Hartley & Zisserman) — PnP, essential matrix, bundle adjustment

**Close:** Run ORB-SLAM3 on a EuRoC MAV sequence (V2_01_easy); evaluate trajectory with evo; extend with a custom loop closure visualization; run Cartographer on a KITTI sequence and compare output.

---

### Branch D: Autonomous Vehicles

> Prerequisite: Cluster β (β.1–β.7) + Cluster γ (edge inference). This branch adds depth on the AV stack.

#### D.1 Perception (3D object detection, sensor fusion, occupancy networks)

**Subtopics:**
- LiDAR perception: PointPillars (voxelization, pillar feature net, scatter, backbone, detection head), SECOND (sparse conv), VoxelNet, CenterPoint
- Camera perception: BEVFormer (transformer-based BEV features from multi-camera), monocular 3D detection (FCOS3D, DETR3D)
- Sensor fusion: camera-LiDAR fusion (point-painting, MVP, fusion transformer), radar-camera fusion, early vs late vs deep fusion
- Occupancy networks: OccNet (3D occupancy prediction from multi-camera), BEV segmentation, voxel occupancy, semantic occupancy, temporal occupancy
- Object tracking: SORT, DeepSORT, AB3DMOT, Kalman filter + Hungarian association, track management
- Domain adaptation: synthetic-to-real (data augmentation, style transfer, domain adversarial training), sensor degradation robustness

**Study:**
- PointPillars paper (Lang et al., 2019) — understand the architecture end-to-end
- BEVFormer paper (Li et al., 2022) — transformer-based BEV
- "Occupancy Networks: Learning 3D Reconstruction in Function Space" (Mescheder et al., 2019)
- OpenPCDet — implement and train a detector
- nuScenes devkit (nuscenes.org) — working with real AV data

**Close:** Train a PointPillars model on nuScenes; convert to TensorRT and deploy at >20 FPS on Jetson Orin; evaluate mAP vs inference latency trade-off.

---

#### D.2 Prediction (behavior modeling, trajectory prediction)

**Subtopics:**
- Trajectory prediction: LSTM encoder-decoder, social pooling (Social LSTM), scene transformer, MultiPath (multi-modal prediction), MultiPath++ (efficient multi-modal)
- Interaction modeling: graph neural nets (GNN) for social interactions, lane graph, lane attention, VectorNet (lanelet + agent polylines), HD map encoding
- Motion transformers: Wayformer (perceiver-based), MotionLM (language modeling of trajectories), MTR (multi-modal with learned query tokens)
- Scenario prediction: goals (goal-based prediction), heatmap output, game-theoretic prediction (level-K reasoning, iterative planning)
- Uncertainty: Gaussian mixture (N modalities, with confidence), Laplace distribution, conformal prediction for sets
- Evaluation: minADE (minimum average displacement error), minFDE, MR (miss rate), brier score for uncertainty, realisticness metrics

**Study:**
- Wayformer paper (Nayakanti et al., 2022) — attention-based motion forecasting
- Multipath++ (Varley et al., 2022) — multi-modal, efficient
- LaneGCN (Gao et al., 2020) — HD map priors for prediction
- "MotionLM: Multi-Agent Motion Forecasting as Language Modeling" (Seff et al., 2023)
- Argoverse / Waymo Open Motion Dataset — prediction benchmarks

**Close:** Train a trajectory prediction model on Argoverse 2; output 6 modes; evaluate minADE, minFDE, MR; implement a conformal prediction wrapper for calibrated uncertainty sets.

---

#### D.3 Localization and HD maps

**Subtopics:**
- HD maps: lane boundaries (geometry, topology), lane connectivity, traffic light associations, speed limits, stop lines, crosswalks
- Map creation: LiDAR + camera mapping, SLAM-based mapping, map update, quality assurance
- Localization: LiDAR localization (ICP, NDT scan-to-map), visual localization (map-based monocular), GNSS+IMU fusion (loosely vs tightly coupled)
- Multi-sensor localization: factor graph (GTSAM) fusing LiDAR, camera, IMU, GNSS, wheel odometry; failure detection and recovery
- Map-relative pose: lane geometry association, lateral/longitudinal localization, lane ID tracking
- Map updates: OTA map updates, incremental map changes, map versioning, automated map change detection

**Study:**
- "A Flexible and Scalable SLAM System with Full 3D Motion Estimation" (Hess et al., 2016) — Cartographer for mapping
- "Visual SLAM and Structure from Motion in Dynamic Environments" (Li et al., 2018)
- OpenDRIVE specification — lane model, boundary representation
- *Principles of GNSS, Inertial, and Multisensor Integrated Navigation Systems* (Groves) — sensor fusion

**Close:** Build a map of a simulated environment using Cartographer; localize in that map with LiDAR (ICP) + IMU using GTSAM; inject sensor dropout and observe degradation; implement recovery from lost localization.

---

#### D.4 Planning (behavior planning, motion planning, decision under uncertainty)

**Subtopics:**
- Behavior planning: FSM (finite state machines — lane keep, lane change, intersection), behavior tree, cost-weighted scenario selection
- Motion planning: lattice planner (pre-generated path set with Frenet frame), optimization-based (LTV-MPC, iterative LQR), sampling-based with spatio-temporal constraints
- Decision under uncertainty: Partially Observable MDPs (POMDPs) for AV decision-making, belief state, reward-dependent behavior
- Risk-aware planning: chance constraints (collision probability), worst-case (reachability), CVaR (conditional value at risk)
- Interaction-aware planning: game-theoretic planning (level-K reasoning, Stackelberg), joint trajectory optimization with other agents
- Safety: responsibility-sensitive safety (RSS, Mobileye), formal safety verification, safety envelope monitoring (run-time assurance)

**Study:**
- *Planning Algorithms* (LaValle, 2006) — sampling-based, combinatorial planning
- "A Survey of Motion Planning and Control Techniques for Self-driving Urban Vehicles" (Paden et al., 2016)
- "Scalable Autonomous Vehicle Safety using the RSS Model" (Shalev-Shwartz et al., 2017)
- "Efficient Uncertainty-aware Decision-making for Autonomous Vehicles" (Hübotter et al., 2023)
- CARLA autonomous driving leaderboard — state-of-the-art planners

**Close:** Implement a Frenet-frame lattice planner in CARLA that navigates lane keeping, lane change, and intersection; add a POMDP-based decision layer for yielding to pedestrians; evaluate against the CARLA LeaderBoard metrics (driving score, infractions).

---

#### D.5 Control (longitudinal, lateral, path tracking)

**Subtopics:**
- Longitudinal control: PID throttle/brake, feed-forward (grade compensation), MPC for speed tracking
- Lateral control: pure pursuit (look-ahead distance), Stanley (cross-track error + heading error), LQR (linearized bicycle model), MPC (non-linear / LTV MPC for path tracking)
- Path tracking: reference path interpolation, look-ahead distance scheduling, geometric vs dynamic vs model-based control
- Actuator dynamics: steer-by-wire (delay, rate limits), throttle response, brake pressure hysteresis, model for control latency
- Body control: active suspension (if relevant), anti-roll, torque vectoring, electronic stability control

**Study:**
- "A Survey of Motion Planning and Control Techniques for Self-driving Urban Vehicles" (Paden et al., 2016)
- Stanley: "Junior: The Stanford Entry in the Urban Challenge" (Thrun et al., 2007) — Stanley controller
- "Model Predictive Control of Highway Maneuvers" (Falcone et al., 2007)
- CARLA control stack examples — PID and MPC implementations
- Vehicle dynamics: *Tire and Vehicle Dynamics* (Pacejka) — Magic Formula tire model

**Close:** Implement Stanley and MPC in CARLA for lane keeping at 30 kph and 60 kph; compare cross-track error, yaw rate, and steering smoothness; tune Stanley's look-ahead as a function of speed.

---

#### D.6 Safety standards (ISO 26262, SOTIF, open-source stacks)

**Subtopics:**
- ISO 26262: ASIL (A/B/C/D), hazard analysis and risk assessment (HARA), functional safety concept (FSC), technical safety concept (TSC), hardware/software safety requirements
- SOTIF (ISO 21448): unknown hazardous scenarios, performance limitation analysis, validation of known scenarios, triggering events
- Safety case: argument structure, evidence (testing, simulation, analysis), safety manual
- Open-source stacks: Autoware (Autoware Universe, Autoware Core), Apollo (Baidu, planning + prediction + perception), openpilot (comma.ai, end-to-end imitation learning)
- Readiness: how to contribute to Autoware / Apollo / openpilot, running in simulation, supported hardware

**Study:**
- ISO 26262 overview — "ISO 26262 for Dummies" functional safety primer
- SOTIF: ISO 21448 summary papers
- Autoware documentation (autoware.org) — architecture, deployment, simulation
- openpilot GitHub — model architecture (end-to-end), driving and safety models
- *The Safety-Critical Systems Handbook* (Storey) — safety assurance concepts

**Close:** Conduct a HARA for a hypothetical AV lane-keeping system (define hazards, ASIL targets, safety goals); set up Autoware in simulation; run a scenario where a pedestrian jaywalks and trace the decision pipeline end-to-end (perception → prediction → planning → control).

---

### Branch E: Space Science / Physics

> Prerequisite: Cluster δ (δ.1–δ.7). This branch adds depth on heliophysics and space weather.

#### E.1 Plasma physics (MHD, waves, instabilities, magnetic reconnection)

**Subtopics:**
- Plasma fundamentals: Debye shielding, plasma frequency, gyro frequency, beta (plasma/magnetic pressure), types (ionosphere, solar corona, magnetosphere)
- MHD: ideal MHD equations, induction equation (frozen-in flux), magnetic tension, Reynolds number, MHD discontinuities (shocks, contact, tangential)
- MHD waves: Alfvén, fast/slow magnetosonic, group velocity, phase velocity diagrams
- Instabilities: Rayleigh-Taylor, Kelvin-Helmholtz, tearing (magnetic reconnection onset), sausage, kink, drift-wave
- Magnetic reconnection: Sweet-Parker (collisional), Petschek (fast), Hall reconnection, reconnection rate, diffusion region
- Particle acceleration: Fermi acceleration, shock drift acceleration, diffusive shock acceleration, solar energetic particles
- Spacecraft data: analyzing magnetometer (FGM), plasma (SWEA, SWIA), and energetic particle (EPD) data from missions

**Study:**
- *Introduction to Plasma Physics* (Chen) — fundamental, accessible
- *Plasma Physics for Astrophysics* (Priest) — space applications
- *Magnetic Reconnection* (Zweibel & Yamada, 2016) — Annual Review paper
- YouTube lectures: "Space Plasma Physics" (UCLA, mahjani)
- SPEDAS documentation — magnetospheric data analysis

**Close:** Analyze real magnetometer data from THEMIS/MMS during a reconnection event; compute the reconnection rate using the ion outflow velocity; plot the Hall magnetic field signature.

---

#### E.2 Solar / space weather (CMEs, flares, solar wind, geomagnetic indices)

**Subtopics:**
- Solar structure: corona, chromosphere, photosphere; solar magnetic field, sunspots, solar cycle (Schwabe, Hale, Gleissberg)
- Solar flares: GOES classification (A/B/C/M/X), Neupert effect, flare energy release, non-thermal emission (microwave, hard X-ray)
- CMEs: Coronal Mass Ejections — structure (flux rope, shock), speed, Earth-directedness, LASCO white-light imaging
- Solar wind: fast (coronal holes, 700+ km/s) vs slow (streamer belt, 300-400 km/s), Alfvénic fluctuations, magnetic clouds
- Geomagnetic indices: Kp (planetary, 0-9), Dst (storm time), AE (auroral electrojet), SYM-H (high-res Dst)
- Predictions: flare prediction (GOES X-ray flux, magnetic complexity), CME arrival (ENLIL cone model, drag-based model), storm prediction
- Tools: SunPy, SpacePy, CDAWeb, DONKI (NASA CME analysis), Kp forecast models

**Study:**
- *The Sun and Space Weather* (Hargreaves) — accessible overview
- SunPy documentation (sunpy.org) — solar data analysis
- SpacePy documentation — space physics data, coordinate transformations
- "The Solar Cycle" (Hathaway, 2015) — Living Reviews in Solar Physics
- NOAA SWPC — real-time space weather products and forecasts

**Close:** Download solar wind data from DSCOVR at L1; build an LSTM to predict Kp index 1-6 hours ahead; compare against persistence model and NOAA's current forecast; publish the model and evaluation.

---

#### E.3 Ionosphere / magnetosphere modeling

**Subtopics:**
- Ionosphere: D/E/F layers, Chapman production function, critical frequency (foF2), total electron content (TEC), equatorial anomaly, polar cap
- Ionosphere impacts: GPS scintillation, HF communication blackout, spacecraft charging
- Magnetosphere: magnetopause, bow shock, magnetotail (lobe, plasma sheet), ring current, plasmasphere, radiation belts
- Magnetosphere-ionosphere coupling: field-aligned currents, region 1/2 currents, auroral oval, substorms
- Modeling: SAMI2 (ionosphere), TIEGCM (thermosphere-ionosphere), LFM (magnetosphere), SWMF (space weather modeling framework)
- Data assimilation: IDA4D, TEC data assimilation, coupled model-data
- Ground-based: GNSS TEC receivers, magnetometer networks (SuperMAG, INTERMAGNET), ionosondes, incoherent scatter radars (Millstone Hill, Arecibo)

**Study:**
- *Ionosphere* (Davies, 1990) — classic reference
- *Magnetospheric Physics* (Kivelson & Russell) — comprehensive
- SAMI2 documentation — ionosphere model
- SWMF documentation (csem.engin.umich.edu) — coupled space weather modeling
- SuperMAG (supermag.jhuapl.edu) — ground magnetometer data

**Close:** Run SAMI2 to simulate the ionosphere at a mid-latitude station for one solar cycle; compare foF2 against real ionosonde data; compute GPS TEC and compare with GNSS-derived TEC over the same period.

---

#### E.4 Data analysis (time-series, image reconstruction, Bayesian inference)

**Subtopics:**
- Periodograms: Lomb-Scargle (unevenly spaced), wavelet scalogram (time-frequency), cross-wavelet (between two signals)
- Image reconstruction: CLEAN algorithm (radio synthesis), Richardson-Lucy deconvolution, MEM (maximum entropy method), Bayesian image reconstruction with priors
- Bayesian inference: Gaussian processes for time-series, MCMC parameter estimation (emcee, PyMC), nested sampling (MultiNest, dynesty)
- Fourier and spectral transforms: FFT, DFT, Hanning/windowing, Welch's method, spectrograms
- Machine learning for space data: classifying solar events (CNN on HMI magnetograms), predicting solar flares (LSTM on UV/X-ray)

**Study:**
- *Statistics, Data Mining, and Machine Learning in Astronomy* (Ivezić et al.) — comprehensive
- AstroPy documentation (astropy.org) — FITS, coordinates, convolution
- SunPy examples — solar image processing, time-series analysis
- emcee (Foreman-Mackey et al., 2013) — MCMC sampling
- "Lomb-Scargle Periodograms with Python" (VanderPlas, 2018)

**Close:** Download HMI magnetogram data; build a CNN to classify active region complexity (simple, beta, beta-gamma, beta-gamma-delta); train on NOAA AR catalog; evaluate flare prediction skill for M-class+ flares in a 24-hour window.

---

### Branch F: Infrastructure & Platform Engineering (Deep Systems)

> Prerequisite: Cluster γ (γ.1–γ.8), Cluster ε (ε.1–ε.7), Foundational Substrate FS.2–FS.4. This branch adds depth on GPU/CPU internals, HPC networking, and compiler stack.

#### F.1 GPU/CPU architecture internals (warps, tensor cores, memory hierarchy)

**Subtopics:**
- CPU: pipeline depth, branch predictor, out-of-order execution (reorder buffer, reservation stations), SIMD (AVX-512, SVE), cache (L1/L2/L3 inclusive/exclusive), NUMA topology detection (lstopo)
- GPU SM architecture: warp scheduler, warp divergence, shared memory banks, register file size, occupancy calculation, Maxwell/Pascal/Volta/Turing/Ampere/Hopper differences
- Tensor cores: matrix multiply-accumulate (4×4×4), precision support (fp16, bf16, tf32, int8), maximum throughput per SM, warp-level matrix operations (wmma)
- Memory hierarchy: HBM2/3 bandwidth, L1/shared memory (unified, size per SM), register spilling, global memory coalescing, L2 cache partitioning (MIG)
- NVLink: topology (NVSwitch, hybrid cube mesh), bandwidth per link (NVLink 2-4, NVSwitch 2/3), direct GPU-GPU access, peer mapping
- Profiling: Nsight Compute (kernel-level: occupancy, memory, instruction stalls), Nsight Systems (timeline: CUDA streams, memcpy, kernel execution overlap)

**Study:**
- NVIDIA CUDA Programming Guide — chapters on warp, occupancy, memory hierarchy
- Hopper H100 Architecture whitepaper (NVIDIA)
- "Dissecting the NVIDIA Volta GPU Architecture" (Hot Chips, 2017)
- Nsight Compute documentation + guided analysis examples
- *CPU Architecture* (Hennessy & Patterson, "Computer Architecture: A Quantitative Approach")

**Close:** Profile a matrix multiplication kernel across different block/tile sizes using Nsight Compute; plot occupancy vs performance; identify the bottleneck (memory vs compute) using the Roofline model; optimize to within 80% of theoretical peak.

---

#### F.2 Networking (RDMA, RoCE, NCCL, InfiniBand, interconnects)

**Subtopics:**
- RDMA: verbs API (ibv_post_send/recv, completion queue, protection domain), memory registration (MR), zero-copy semantics
- RoCE v2: RDMA over Converged Ethernet, PFC (priority flow control), DCQCN (congestion control), ECN marking, packet loss sensitivity
- InfiniBand: subnet manager (OpenSM), VL (virtual lanes), SL (service level), adaptive routing, SHArP (in-network reduction)
- NCCL: ring/all-gather algorithm, tree/rabenseifner all-reduce, topology-aware communication, user buffer registration, NCCL-IB vs RoCE
- Collective communication latency: all-reduce scaling (log N), multi-node communication overlap, bandwidth vs latency at scale
- GPUDirect: P2P (NVLink), RDMA (storage/network → GPU memory, no CPU copy), GDS (GPUDirect Storage)
- DPU: BlueField, ConnectX-7, offloading collective communication from host CPU

**Study:**
- InfiniBand Architecture Specification — volumes 1-2 (architecture, physical)
- "Introduction to InfiniBand" (Mellanox/NVIDIA whitepaper)
- NCCL documentation — usage, topology, tuning
- "A Quantitative Study on InfiniBand and RoCE Performance" (Yan et al., 2023)
- GPUDirect Storage documentation — GDS best practices

**Close:** Set up two GPU nodes with InfiniBand (or simulated via software loopback); run NCCL all-reduce benchmark across 1/2/4 GPUs; vary message sizes (1 KB to 1 GB); plot bandwidth vs message size; identify the transition from latency-bound to bandwidth-bound.

---

#### F.3 GPU scheduling on K8s (NVIDIA GPU Operator, Volcano, Slurm, Ray)

**Subtopics:**
- NVIDIA GPU Operator: node feature discovery, driver daemonset, device plugin, MIG manager, DCGM exporter
- GPU time-slicing: fractional GPU sharing, multi-instance GPU (MIG, A100/H100 partitions), time-slicing vs MIG trade-offs
- Volcano: queue management, podgroup (min member, min resources), fair-share scheduling, preemption, topology-aware (GPU affinity, NUMA)
- Slurm: partition, job, task, GRES (generic resource scheduling for GPUs), heterogenous jobs, topology plugin, GPU type constraints
- Ray scheduler: placement group, spread/bundle/pack strategy, GPU resource requirements, fractional GPU, node affinity
- DCGM: monitoring GPU metrics (temperature, power, utilization, memory bandwidth, PCIe throughput, NVLink counters)
- Cluster monitoring: Prometheus + DCGM exporter + Grafana dashboards for GPU fleet health

**Study:**
- NVIDIA GPU Operator documentation — deployment, MIG configuration
- Volcano documentation — queue, podgroup, schedulability
- Slurm documentation — GRES, GPU allocation, topology
- Ray documentation — placement groups, GPU scheduling
- DCGM documentation — metrics, health monitoring

**Close:** Deploy GPU Operator on a K8s cluster; partition an A100 into 7 MIG instances; schedule a multi-container inference workload (each container gets 1 MIG); monitor GPU utilization and MIG partitioning with DCGM + Prometheus.

---

#### F.4 Compilers for ML (MLIR, XLA, TVM, Triton compiler)

**Subtopics:**
- MLIR: dialects (linalg, tensor, scf, arith, vector, gpu, spirv), pass infrastructure, conversion patterns, folding/canonicalization, lowering flow
- XLA: HLO (high-level optimizer), buffer assignment, layout assignment, fusion, GPU code generation (HLO → LMHLO → LLVM), SPMD partitioner for sharding
- TVM: Relay IR, auto-tuning (AutoTVM, Ansor), schedule templates, meta-schedule, target-specific codegen (CUDA, OpenCL, metal, Vitis)
- Triton compiler architecture: TIR (Triton IR) → TritonGPU dialect → LLVM IR, block-level analysis, shared memory allocation, automatic pipeline
- ML compiler pipeline: frontend → IR → dialect conversion → optimization → code generation → lowering to target
- Domain-specific: Tensor Comprehensions, Tiramisu, Halide (image processing specialization)

**Study:**
- MLIR tutorial (mlir.llvm.org) — dialect definition, conversion patterns
- XLA: "XLA: Optimizing Compiler for Machine Learning" (Google, 2017)
- TVM documentation — auto-tuning, schedule templates
- Triton language documentation — compiler internals section
- "MLIR: A Compiler Infrastructure for the End of Moore's Law" (Lattner et al., 2019) — overview
- EVA: "Efficient Vision-Language Action Models" — compiler example for robotics

**Close:** Write an MLIR pass that fuses elementwise ops in a linalg dialect (e.g., ReLU + add → fused op); lower through TritonGPU → LLVM IR; JIT compile and run on GPU; verify fused kernel matches unfused PyTorch reference performance.

---

#### F.5 Storage / data for ML pipelines (Parquet, Arrow, HPC data formats)

**Subtopics:**
- Apache Arrow: columnar format, zero-copy sharing, IPC (flight RPC), Parquet-to-Arrow zero-copy, Arrow compute (C++/Py)
- Parquet: row group, page (data page, dictionary page, index page), encoding (RLE, dictionary, Delta BP), predicate pushdown, statistics
- HDF5: dataset, group, attribute, chunked layout, compression (gzip, szip, lzf), parallel HDF5, virtual datasets
- Data loading patterns: streaming (webdataset, Mosaic StreamingDataset), on-the-fly preprocessing vs preprocessed data
- Object store caching: AWS S3 → local SSD cache (alluxio, juicefs), content-addressable storage, LRU/ARC eviction
- File system for training: POSIX vs parallel FS (Lustre, GPFS, Weka), NVMe local SSDs, data loading pipeline dilation

**Study:**
- Apache Arrow documentation — format specification, CPU/gpu integration
- Parquet documentation — format specification, encoding
- HDF5 documentation — data model, parallel I/O
- "Data Loading Pipelines for Large-Scale ML Training" (Essays on fast.ai / ML blogs)
- Alluxio documentation — caching for ML workloads

**Close:** Benchmark a PyTorch data pipeline across formats: raw images (jpg) vs webdataset (tar) vs hdf5 vs parquet + arrow; measure throughput (samples/sec) and CPU utilization; identify the bottleneck (IO vs decode vs augmentation).

---

## UNIFIED LEARNING ORDER (Brutally Focused, 5 years)

1. **Foundation (12–18 months):** Core Mathematics + AI/ML Engineering Core + Embedded Basics. Get to the point where you can train a medium transformer model, quantize it, run it on a Jetson, and contribute to an open-source autonomy project (PX4/ROS 2).
2. **Embodiment & Space Introduction (18–30 months):** Add Control/Estimation Core, begin Orbital Mechanics & Attitude Control, and start building a signature project that combines learned control with a simulated rover or CubeSat. Concurrently, deepen AI into distributed training/custom kernels (Branch A).
3. **Mars & Habitat Specialization (30–48 months):** Incorporate Propulsion, Planetary Surface Autonomy, and Habitation systems (thermal/power/ISRU). Apply advanced AI: train a VLM for terrain analysis or fault detection. Contribute meaningfully to NASA cFS or an astrodynamics library. This is where you become a unique "AI for planetary exploration" engineer.
4. **Horizon (48+ months):** Choose to either go all-in on frontier AI research (publish, apply to labs) or lead autonomy in space/robotics startups (open-source, consulting, join a mission). Space physics remains an exploration side-door.

> **Phase 3 Career Tracks (parallel, optional):** Throughout all phases, **SDE Engineering (ζ)** runs alongside as interview‑style DSA + system design practice. **ML Engineering (η)** and **Fullstack/Product (θ)** are background skills that ramp up naturally as you build infrastructure and ship products (Goal OS dashboard, open‑source tools). They do not block or delay any Phase 1/2 gate.

---

## Resources That Span Multiple Categories (Read Once, Apply Everywhere)

| Resource | Relevant To |
|---|---|
| *Mathematics for Machine Learning* (Deisenroth) | Core Math, AI Core, Control |
| *Modern Robotics* (Lynch & Park) | Control, Robotics, AV, Space GNC |
| *Probabilistic Robotics* (Thrun et al.) | State Estimation, SLAM, Robotics, AV |
| *Orbital Mechanics for Engineering Students* (Curtis) | Space, Rockets |
| CUDA Programming Guide (NVIDIA) | AI Core, Infra, Edge Deployment |
| CS 285 (Berkeley) + CS 285 lecture videos | AI Core, Robotics, AV, Space AI |
| Cyrill Stachniss SLAM lectures (YouTube) | State Estimation, Robotics, AV |
| Karpathy's Zero to Hero + Build GPT | AI Core |
| Coursera "Modern Robotics" Specialization | Control, Robotics |

---

## How to Use This Map With Your AI Stack

1. **Load** the primary spine resource (textbook PDF or course page) into Claude or Gemini's large context window.
2. **Prompt**: "Teach me [topic] as an interactive dialogue. Quiz me on the math. Generate Python/C++ exercises. Critique my solutions."
3. **Code**: Use OpenCode in your IDE to scaffold projects, write tests, and generate boilerplate.
4. **Close**: Build the project or make the open-source commit listed above. Push publicly.

The rule: you never finish a category by reading. You finish it by **shipping**.

---

## Closing Checklist (Per Cluster)
For each cluster, answer YES to all three:
1. **Study closed:** I've consumed the spine resource and my notes are clear enough to teach the core ideas.
2. **Experiment closed:** I've built the toy version, intentionally broken it to observe failure modes, and fixed them.
3. **Practical work closed:** I have a public artifact (GitHub repo with clean README, merged PR, blog post with benchmarks, or video demo of hardware working) that proves applied competence.

> **Phase 3 Career Tracks (ζ, η, θ):** These clusters run in parallel to the core learning progression. Their checklist items are **optional for embodied‑AI roles** but **recommended for SDE/ML‑platform/startup‑building versatility**. The spine and projects interleave with the main timeline, not on a separate critical path.

---

## Spine Summary (If You Only Consume One Thing Per Cluster)

| Cluster | Spine Resource |
|---|---|---|
| Core Math | *Mathematics for Machine Learning* (Deisenroth) |
| AI/ML Engineering | Karpathy's Zero to Hero + Build GPT videos |
| Control & Robotics | Coursera "Modern Robotics" specialization |
| State Estimation / SLAM | Cyrill Stachniss SLAM lectures + *Probabilistic Robotics* |
| Embedded / Real-Time | FreeRTOS official tutorials + STM32 examples |
| Orbital Mechanics | Curtis book + CU Boulder "Advanced Spacecraft Dynamics" |
| Propulsion / ISRU / Surface Autonomy | NASA cFS + Basilisk examples + Rapp book (ISRU) |
| Space Science / Physics | Chen's Plasma book + SunPy tutorials |
| Deep Infra / Systems | NVIDIA CUDA Guide + MIT "Efficient Deep Learning" |
| SDE Engineering (ζ) | Neetcode.io (DSA) + *Designing Data-Intensive Applications* + Alex Xu SD |
| ML Engineering (η) | *Designing Machine Learning Systems* (Chip Huyen) |
| Fullstack / Product (θ) | React documentation (react.dev) + TypeScript Handbook |

---

## Final Picture
You are 30, IIT-trained, holding a mundane job that you automate with AI to free 5 hours a day. During those hours, you systematically construct the rare, high-ground expertise of a **Frontier AI Engineer for Embodied Autonomy**. In 3–5 years, you can be one of the few people on the planet who can design a novel transformer architecture, train it on a thousand GPUs, quantize it, deploy it on a spacecraft flight computer or a legged robot, and release the entire stack as open-source.

---

## Open-Source Ecosystem Map

> For each project: what it is, why it matters, and which target role it unlocks. These are the codebases you should be able to navigate, contribute to, and discuss in interviews.

---

### LLM Training & Fine-tuning

| Project | What it is | Why it matters |
|---|---|---|
| **nanotron** (HuggingFace) | Minimal 3D-parallel LLM training (TP+PP+DP); clean, readable codebase | Best first codebase for understanding distributed training internals before reading Megatron |
| **Megatron-LM** (NVIDIA) | Production tensor + pipeline parallelism; used to train GPT-4 class models | Required reading for Frontier Lab research engineer roles; a merged PR here is a strong signal |
| **DeepSpeed** (Microsoft) | ZeRO stages 1/2/3, ZeRO-Offload, ZeRO-Infinity, MoE training | Most widely used in practice; ZeRO-3 is the default for most academic labs |
| **torchtitan** (PyTorch) | Reference LLM training stack: FSDP2, async checkpointing, composable transforms | Becoming the canonical PyTorch-native training scaffold |
| **litgpt** (Lightning AI) | Clean single-file implementations of major LLM architectures | Study source: read the model implementations to compare architectural differences |
| **transformers** (HuggingFace) | Model implementations, pretrained weights, training utilities | Lingua franca of ML research; contributing here is resume gold |
| **accelerate** (HuggingFace) | Distributed training abstraction over FSDP/DeepSpeed | Simplest entry point to multi-GPU training before studying internals |
| **torchtune** (PyTorch) | Fine-tuning focused: SFT, DPO, GRPO on PyTorch native stack | Cleanest code for studying fine-tuning recipes |
| **Axolotl** | Feature-rich fine-tuning: QLoRA, DPO, GRPO, many architecture configs | Best for quickly running fine-tuning experiments with minimal boilerplate |
| **unsloth** | 2× memory-efficient fine-tuning via custom Triton kernels and gradient checkpointing | Use when you need to fine-tune on consumer hardware |
| **TRL** (HuggingFace) | RLHF, PPO, DPO, GRPO training for language models | Primary alignment training library; study the PPO and GRPO trainers closely |

---

### LLM Inference & Serving

| Project | What it is | Why it matters |
|---|---|---|
| **vLLM** | Paged attention, continuous batching; the production open-source serving standard | Core contributor knowledge = strong signal for Frontier Lab or inference startup roles |
| **SGLang** | RadixAttention (KV prefix sharing across requests), structured generation, extremely fast | Often 2–3× faster than vLLM for structured outputs; rapidly gaining adoption |
| **TensorRT-LLM** (NVIDIA) | Production LLM inference on NVIDIA GPUs: in-flight batching, speculative decoding, custom kernels | Required for NVIDIA DevTech roles; also for AV/robotics real-time inference |
| **llama.cpp** | CPU/GPU quantized inference with GGUF format | Understand quantization implementation, KV cache, and context handling at C++ level |
| **lmdeploy** (OpenMMLab) | Fast LLM serving with TurboMind backend, W4A16 quant, speculative decoding | Popular in Asian AI companies; alternative architecture to vLLM |
| **MLC-LLM** | Run LLMs on WebGPU, iOS, Android, embedded via TVM backend | Relevant for edge deployment on devices; understand TVM's code generation path |
| **ExLlamaV2** | GPU-optimized inference with EXL2 quantization format | Efficient for single-user inference; study the quantization kernels |
| **Ollama** | Simple local LLM serving with automatic GPU offloading | Good for local development and rapid prototyping; not for production |

---

### GPU Kernel Libraries

| Project | What it is | Why it matters |
|---|---|---|
| **FlashAttention** (Tri Dao) | IO-aware exact attention: FlashAttention 1/2/3, Flash-Decoding | The canonical benchmark for attention kernels; reading the source is an education in GPU programming |
| **ThunderKittens** (HazyResearch) | Tile-level GPU primitives on top of PTX; simpler to write fast kernels than raw CUDA | Emerging abstraction between Triton and CUTLASS; good for custom attention variants |
| **CUTLASS / CuTe** (NVIDIA) | C++ template library for GEMM and convolutions; CuTe is the new layout-agnostic API | Required knowledge for NVIDIA kernel roles; CUTLASS 3.x with CuTe is the modern API |
| **Triton** (OpenAI) | Python-like tile-level GPU kernel language compiling to efficient PTX | Fastest path to writing competitive GPU kernels without raw CUDA C++ |
| **xFormers** (Meta) | Memory-efficient attention, sparse attention, and other transformer ops | Useful toolbox; code is educational for understanding fused attention variants |

---

### Quantization & Efficiency

| Project | What it is | Why it matters |
|---|---|---|
| **bitsandbytes** (Tim Dettmers) | 8-bit/4-bit quantization via custom CUDA kernels; NF4 for QLoRA | The dominant quantization library; study the kernel implementation |
| **AutoGPTQ** | GPTQ quantization for LLMs | Study the approximate Hessian-based weight quantization method |
| **AutoAWQ** | AWQ activation-aware weight quantization | Study the activation-scale-based protection mechanism |
| **torchao** (PyTorch) | Unified quantization and sparsity toolkit, INT4 GEMM, float8 training | Becoming the canonical PyTorch quantization path; contributor signal is strong |

---

### Robotics

| Project | What it is | Why it matters |
|---|---|---|
| **ROS 2** (Open Robotics) | Standard robot middleware: pub/sub, services, actions, TF, launch, composition | Non-negotiable for robotics roles; contribute to core or a major package |
| **MoveIt 2** | Manipulation planning: OMPL, collision checking, Cartesian paths, servo | Standard for robotic arm integration; MoveIt 2 contributions valued at robotics companies |
| **Nav2** | Autonomous navigation: global+local planner, behavior tree, costmap, localization | The standard ROS 2 navigation stack for mobile robots |
| **Gazebo / Gz Sim** | Robot simulation with ROS 2 integration, sensor plugins, physics (ODE, Bullet, DART) | Primary open-source simulation; most ROS 2 tutorials use it |
| **Isaac Lab** (NVIDIA) | GPU-accelerated RL environments for robots: 10,000+ parallel sim instances on one GPU | Fastest path to large-scale robot learning research; growing rapidly |
| **Isaac Sim** (NVIDIA) | Photorealistic simulation via Omniverse/USD; synthetic data, domain randomization | Required for NVIDIA robotics roles; also used by top manipulation labs |
| **Drake** (TRI) | Trajectory optimization, manipulation, rigid-body dynamics, pydrake Python API | The reference tool for academic manipulation and optimal control; MIT/TRI pedigree |
| **Pinocchio** (LAAS-CNRS) | Fast rigid body dynamics: Jacobians, inverse dynamics, CRBA; used in MuJoCo + MoveIt internals | Best C++ lib for computing dynamics analytically; extremely fast |
| **BehaviorTree.CPP** | C++ behavior tree library used in Nav2, PX4, and production robots | Learn this before any senior robotics interview; it is the standard architecture pattern |
| **LeRobot** (HuggingFace) | Dataset formats and implementations of ACT, diffusion policy, TDMPC2 | Best single repo for learning robot learning policies; training scripts are clean and instructive |
| **OpenVLA** | Open-source 7B VLA (Vision-Language-Action) model | Fine-tune on your own robot data; good entry point for VLA research |
| **Octo** (Berkeley) | Generalist transformer robot policy, diffusion action head | Understand the architecture for generalist robot learning paper discussions |
| **ORB-SLAM3** | Visual + visual-inertial SLAM, multi-map, relocalization | The reference monocular/stereo SLAM system; understand the full pipeline architecture |
| **Cartographer** (Google) | LiDAR SLAM, submaps, loop closure, ROS 2 support | Production LiDAR SLAM; run on KITTI for familiarity |
| **GTSAM** (Georgia Tech) | Factor graph optimization for SLAM and robotics; iSAM2 incremental smoother | The standard backend for SLAM optimization; used in VINS and ORB-SLAM back-ends |
| **Ceres Solver** (Google) | Nonlinear least squares; used in SLAM (Cartographer), SfM (Colmap), calibration | Learn the API; most SLAM back-ends use Ceres or g2o |
| **Kalibr** (ETH) | Multi-sensor calibration: camera+IMU, multi-camera, LiDAR+camera temporal sync | Understand the calibration formulation; required before any real hardware work |
| **OpenPCDet** | 3D LiDAR object detection: PointPillars, CenterPoint, PV-RCNN, BEVFusion | The standard toolkit for 3D detection research; run nuScenes experiments here |

---

### Drone / Flight Control

| Project | What it is | Why it matters |
|---|---|---|
| **PX4** | Open-source flight stack for multirotor, fixed wing, VTOL; EKF2 estimator, NuttX RTOS | The dominant open-source drone platform; contributors are actively hired by drone and AV companies |
| **ArduPilot** | Alternative flight stack, very feature-rich; MAVLink protocol, vast hardware support | Widely deployed on real hardware; understand for any UAS/UAM engineering role |
| **MAVSDK** | MAVLink SDK for autonomous vehicle control from companion computer | API for interacting with PX4/ArduPilot from a mission computer or offboard system |
| **QGroundControl** | Ground control station for PX4/ArduPilot | Use during SITL development; understand the GCS architecture and protocol |

---

### Autonomous Vehicles

| Project | What it is | Why it matters |
|---|---|---|
| **Autoware Universe** | Full open-source AV stack on ROS 2: perception, localization, planning, control | The most complete open-source AV stack; a contribution here is a very strong AV hiring signal |
| **Apollo** (Baidu) | Mature AV stack: perception, prediction, planning, sim; widely deployed in China | Good reference architecture; study planning and prediction modules |
| **openpilot** (comma.ai) | End-to-end imitation-learned driving deployed on real consumer vehicles | Actually runs on roads; study the model architecture and real-world deployment pipeline |
| **CARLA** | High-fidelity AV simulation with Python API, sensor simulation, scenario scripting | The standard AV simulation platform; run Autoware in CARLA for end-to-end testing |
| **nuScenes devkit** | Dataset + evaluation toolkit for 3D detection, tracking, prediction | The standard benchmark; know the mAP/AMOTA metrics cold |
| **mmdetection3d** (OpenMMLab) | 3D detection toolkit with camera-based models (BEVFusion, FCOS3D, BEVDet) | Broader than OpenPCDet; useful for camera + LiDAR fusion architectures |
| **BEVFusion** | LiDAR + camera fusion in BEV space, faster than transformer-based approaches | State-of-art efficient fusion; understand the architecture for AV perception interviews |
| **StreamPETR** | Streaming temporal fusion for camera-only 3D detection | Strong baseline for camera-only perception; relevant for Tesla-like stacks |

---

### Space & Flight Software

| Project | What it is | Why it matters |
|---|---|---|
| **NASA cFS** (Core Flight System) | Space-grade flight software framework: scheduler, software bus, table manager, apps | Run this on Raspberry Pi as a portfolio project; directly relevant to SpaceX/ISRO/space startups |
| **Basilisk** (CU Boulder / JPL) | Python + C++ astrodynamics and spacecraft GNC simulation | Use for attitude control and orbit simulation; JPL-validated against real missions |
| **Orekit** (CS Group) | Java orbit propagation and space operations library, used by ESA/CNES | Study the orbit propagator concepts; poliastro (Python) wraps it more nicely |
| **poliastro** | Python orbital mechanics: orbit propagation, maneuvers, porkchop plots | Best for quick experimentation; clean Pythonic API |
| **GMAT** (NASA) | Free mission analysis tool, validated against real NASA missions | Use to cross-validate your orbit propagators; industry reference |
| **OpenMCT** (NASA) | Mission control telemetry UI framework built on JavaScript | Study the architecture; if you ever build a ground station UI, this is the starting point |
| **SpicePy / SPICE** (NAIF) | Spacecraft geometry: frames, pointing, ephemerides, time systems | Required for any real mission work; understand coordinate frames and time systems |
| **42** (NASA Goddard) | Spacecraft simulation: attitude dynamics, sensors, actuators, orbit | C-based, lightweight; good for learning flight software integration |
| **RTEMS** | Deterministic RTOS used in Mars rovers (Curiosity, Perseverance), Cassini, Juno | Study the API; most serious space flight software runs RTEMS or VxWorks |
| **NuttX** | POSIX-compliant RTOS used in PX4, some space applications | Cross-domain: drone and space flight software convergence |

---

### Embedded / RTOS

| Project | What it is | Why it matters |
|---|---|---|
| **Zephyr RTOS** (Linux Foundation) | Modern RTOS: device tree, west build system, rich driver support, networking | Growing fast; learning Zephyr is more forward-looking than FreeRTOS for new hardware |
| **FreeRTOS** (AWS) | Most deployed embedded RTOS; tasks, queues, semaphores, timers | The baseline embedded OS; every embedded interview will test this |
| **libopencm3** | Open-source STM32 peripheral library at register level (no vendor HAL) | Learn for deep understanding of peripherals; code is readable and educational |
| **Embassy** (Rust) | Async embedded framework using Rust's async/await | Worth knowing as Rust grows in safety-critical embedded; emerging in drone and space startups |
| **OpenOCD** | Open-source on-chip debugger (JTAG/SWD) | Required for hardware debugging; understand the protocol and debug interface |
| **PlatformIO** | Embedded build system for 50+ platforms, library management, unit testing on MCU | Use for building embedded projects; cleaner than raw Makefiles |

---

### ML Compiler Stack

| Project | What it is | Why it matters |
|---|---|---|
| **LLVM** | The backbone compiler infrastructure | Understand IR (SSA, basic blocks, phi nodes); required reading for compiler roles |
| **MLIR** (LLVM) | Dialect-based compiler infrastructure: linalg, tensor, gpu, spirv dialects | The future of ML compiler research; essential for NVIDIA/Google compiler roles |
| **XLA** (Google) | ML compiler for TPU/GPU; used by JAX, TensorFlow | Study HLO → optimization → codegen pipeline; required for Google/DeepMind roles |
| **TVM** (Apache) | ML compiler with AutoTVM/Ansor auto-tuning, targets CPU/GPU/MCU/WASM | The most complete open-source ML compiler; use for edge deployment |
| **Triton** (OpenAI) | GPU kernel language: JIT compiles Python tile-level code to efficient PTX | Currently the most practical path to writing competitive GPU kernels |
| **IREE** (Google) | Portable ML execution framework targeting edge, mobile, embedded | Alternative to TVM for inference; good for WASM and embedded targets |
| **Halide** | Image processing DSL with explicit separation of algorithm and schedule | Learn for computer vision pipeline optimization; teaches scheduling theory |

---

### MLOps & Infrastructure

| Project | What it is | Why it matters |
|---|---|---|
| **Ray** | Distributed compute: Ray Core, Ray Train, Ray Serve, Ray Data | Most versatile distributed Python framework; used at Anthropic, OpenAI, Anyscale |
| **Kubeflow** | ML workflows on Kubernetes: pipelines, Katib, KFServing | The standard enterprise ML platform; required for ML platform engineer roles |
| **MLflow** | Experiment tracking, model registry, deployment | The open-source alternative to W&B; widely deployed at enterprise AI teams |
| **DVC** | Data and model versioning on top of Git | Required for reproducible ML pipelines; pairs with any training framework |
| **Feast** | Open-source feature store: offline + online serving, point-in-time joins | The standard feature store for MLOps platforms |
| **Seldon Core** | ML model serving on Kubernetes: inference graphs, canary deployments | Study the architecture even if you use Triton/vLLM for inference |
| **Airflow** (Apache) | Workflow orchestration: DAGs, operators, sensors | Still dominant in data engineering; used in many ML training pipelines |
| **Great Expectations** | Data quality testing: expectations, suites, checkpoints | Data validation before training; required for robust ML pipelines |

---

### Scientific Computing

| Project | What it is | Why it matters |
|---|---|---|
| **JAX** (Google) | NumPy-like API with JIT (XLA), vmap, pmap, grad; used at DeepMind, Google Brain | Know jit + vmap + grad cold; DeepMind roles often require JAX fluency |
| **Flax / Equinox** | Neural network libraries built on JAX | Study one if you want to contribute to DeepMind or Google research |
| **AstroPy** | Python astronomy: FITS I/O, coordinates, convolution, time systems | Required for any space science or astrophysics data analysis work |
| **SunPy** | Solar physics data analysis: Fido data client, maps, time series | Space weather track; pairs with SpacePy for Branch E |
| **PETSc** | Parallel PDE solvers (MPI), linear algebra, ODE integrators | Large-scale computational physics; used in plasma and CFD simulations |
| **OpenFOAM** | CFD simulation: finite volume, parallel, complex geometries | Required for aerodynamics and plasma flow simulations |

---

## Target Role Interview Playbooks

> What is actually tested, what to prepare, and how the blueprint maps to each role.

---

### Playbook 1: Frontier AI Lab Research Engineer
**(OpenAI, Anthropic, Google DeepMind, Meta FAIR, xAI, Mistral)**

**What they actually test:**
- ML from scratch: implement attention, backprop, Adam, distributed all-reduce from memory in a live coding session
- Systems for training: memory layout for FSDP, ZeRO-3 communication patterns, throughput bottleneck diagnosis (loss spike, OOM, throughput drop)
- Research understanding: read a paper cold, identify weaknesses, propose follow-up experiments
- Coding: medium-hard LeetCode + ML implementation problems ("write batched matrix multiply in Triton", "implement layer norm backward pass")
- Research taste: what do you think the field is missing? What would you work on if hired?

**Preparation checklist:**
- [ ] Implement GPT-2 decoder block from scratch in ~200 lines (no library except PyTorch tensors)
- [ ] Write a fused attention kernel in Triton; benchmark vs `scaled_dot_product_attention`
- [ ] Profile a distributed training run; deliberately introduce a bottleneck (e.g., suboptimal all-reduce placement) and fix it
- [ ] Read DeepSeek-R1, Chinchilla, FlashAttention-3 papers well enough to discuss trade-offs and propose extensions
- [ ] Know GRPO vs PPO vs DPO trade-offs cold; be able to derive the GRPO loss from first principles
- [ ] Have one non-trivial open-source contribution to transformers, vLLM, TRL, or Megatron-LM
- [ ] Prepare 3 research ideas you're excited about: 1-sentence pitch + 1 experiment to validate each

**Blueprint coverage:** α.1–α.9, FS.2 (GPU arch), α.3 (distributed), α.4 (CUDA/Triton), Branch A

**Key gap if skipped:** α.9 (test-time compute) — interviewers at frontier labs ask about reasoning model training heavily in 2025+

---

### Playbook 2: NVIDIA Engineer
**(CUDA Engineer, Inference Engineer, Developer Technology, Compiler Engineer, Research Scientist)**

**Subtrack A — CUDA / Kernel Engineer:**
- Know H100/Hopper architecture cold: 132 SMs, 4th-gen tensor cores, HBM3 at 3.35 TB/s, NVLink 4 at 900 GB/s
- Write a tiled matrix multiply from scratch; explain each optimization (shared memory tiling, bank conflicts, register pressure, warp divergence)
- Use Nsight Compute to profile a kernel: position it on the roofline (compute-bound vs memory-bound)
- Know FlashAttention at kernel level: why tiling in SRAM avoids HBM round-trips; the online softmax trick
- Understand CuTe (CUTLASS 3.x) layouts and tiling abstractions

**Subtrack B — Inference / TRT-LLM:**
- Know TensorRT-LLM architecture: in-flight batching, paged KV cache, speculative decoding plugin
- Quantization at implementation level: GPTQ int4 GEMM kernel, FP8 tensor core usage on Hopper
- Understand PagedAttention vs RadixAttention (vLLM vs SGLang trade-offs)
- NCCL: know all-reduce, all-gather, reduce-scatter and their ring/tree algorithms

**Subtrack C — Compiler / MLIR:**
- MLIR dialects and lowering flow (linalg → affine → gpu → LLVM → PTX)
- Write an MLIR pass (e.g., op fusion, constant folding in linalg dialect)
- Understand Triton compiler internals: TIR → TritonGPU dialect → LLVM

**Preparation checklist:**
- [ ] Profile a GEMM kernel across tile sizes; plot occupancy vs FLOPS; hit 80% of theoretical peak
- [ ] Write a Triton attention kernel; profile with Nsight; compare to FlashAttention
- [ ] Explain the entire FlashAttention-2 forward pass at the memory access level (no hand-waving)
- [ ] Run TensorRT-LLM with speculative decoding; measure acceptance rate vs throughput trade-off
- [ ] Know NVLink vs PCIe vs InfiniBand bandwidth numbers and scheduling implications

**Blueprint coverage:** α.4 (CUDA/Triton), FS.2 (GPU arch), F.1 (GPU/CPU internals), F.2 (networking), F.4 (ML compilers), α.6 (inference)

---

### Playbook 3: Autonomous Vehicle Engineer
**(Waymo, Tesla AI, Cruise/GM, Mobileye, Zoox, Nuro, May Mobility)**

**Perception track:**
- Explain PointPillars end-to-end: pillar feature net, scatter op, backbone, detection head, NMS
- Know BEV representation: why it matters, how cameras project to BEV (LSS lift-splat-shoot, BEVDet, BEVFormer approaches)
- Multi-sensor fusion: early vs late vs deep fusion trade-offs; point-painting vs query-based fusion
- Implement AB3DMOT (Kalman filter + Hungarian assignment) from scratch

**Prediction track:**
- VectorNet: how map elements and agents are encoded as polylines, cross-attention between context and target
- Multi-modal output: K trajectory hypotheses with confidence scores; avoiding mode collapse
- minADE/minFDE: derive the metrics; understand their incentives and failure modes

**Planning track:**
- Frenet frame: s-d decomposition, lateral and longitudinal control decoupling, why it matters
- Lattice planner: state lattice, pre-generated path set, cost functions (safety, comfort, legality)
- RSS (Responsibility-Sensitive Safety): safe distance longitudinal + lateral model

**Control track:**
- Pure pursuit, Stanley, MPC for path tracking: derive cross-track error; know when each is appropriate
- Bicycle model: understand the linearized dynamics used in LTV-MPC

**Preparation checklist:**
- [ ] Train PointPillars on nuScenes (or KITTI); convert to TensorRT; run at >20 FPS on Jetson Orin
- [ ] Implement Stanley controller from scratch; test in CARLA at 30 and 60 kph
- [ ] Run Autoware Universe end-to-end in CARLA simulation on a simple urban scenario
- [ ] Know ISO 26262 ASIL levels (A/B/C/D) and SOTIF well enough to discuss for 15 minutes
- [ ] System design: "design the perception system for a level-4 AV in urban environment" — structured 45-minute answer

**Blueprint coverage:** β.1–β.4, D.1–D.6, γ.7–γ.8, ε.2, ζ.3

---

### Playbook 4: Flight Software / GNC Engineer
**(SpaceX, Rocket Lab, Relativity Space, India: Agnikul, Skyroot, Pixxel, Bellatrix, GalaxEye, Manastu Space)**

**What they test (software focus):**
- Real-time C++: deterministic implementation with no dynamic allocation after init, no exceptions, no RTTI
- RTOS: task design, priority inversion problem and solution (priority inheritance), watchdog patterns, IPC (queues, semaphores)
- GNC algorithms: EKF derivation (be able to derive the update step on a whiteboard), attitude quaternion math, PD control for attitude
- Communication buses: decode I2C/SPI/CAN at protocol level; be able to implement bit-bang SPI
- Safety culture: FDIR (Fault Detection, Isolation, Recovery) patterns; DO-178C level awareness (A/B/C/D and what testing they require)

**What they test (GNC focus):**
- Two-body orbital mechanics: propagate an orbit, compute delta-V for a Hohmann transfer on the whiteboard
- EKF: derive the innovation, Kalman gain, covariance update; explain why the UKF avoids Jacobians
- Quaternion algebra: multiply, normalize, convert to/from Euler angles, propagate with angular velocity
- Attitude control: PD law with quaternion error, reaction wheel desaturation via magnetic torquers
- Simulation mindset: always validate your GNC algorithm in simulation before hardware

**Preparation checklist:**
- [ ] FreeRTOS application: IMU via I2C, EKF in a dedicated task, UART logging, watchdog — no dynamic allocation
- [ ] Run NASA cFS on Raspberry Pi; implement a custom GNC app in the cFS framework
- [ ] Implement TRIAD or QUEST for attitude determination from simulated star tracker + sun sensor data
- [ ] Derive and implement PD quaternion attitude controller; simulate detumbling from ω₀ = [1,1,1] rad/s
- [ ] Understand DO-178C Level C requirements enough to discuss test coverage, reviews, and traceability matrices

**India startup context:** Agnikul (Agnibaan SoRTeD), Skyroot (Vikram-1), Pixxel (hyperspectral), Bellatrix (electric propulsion thrusters) — these companies move fast and value hands-on embedded + GNC + simulation skills more than formal safety certifications. A working FreeRTOS + EKF + cFS demo is worth more than certification knowledge.

**Blueprint coverage:** γ.1–γ.7, β.1–β.2, B.1–B.2, ζ.1–ζ.2

---

### Playbook 5: FAANG SDE 3
**(Google L5, Meta E5, Amazon L6, Apple ICT4, Microsoft 63)**

**Coding (45 min, 1–2 problems):**
- Hard LeetCode solved in <30 min with clean code, optimal complexity, tested edge cases
- Fluent in C++ or Python — not just correct, but readable with meaningful names
- Practice: Neetcode 150 + 50 random hard problems under timed conditions

**System design (45–60 min):**
- Scope requirements in 5 min; estimate (QPS, storage, bandwidth) in 3 min — must be fast and accurate
- Draw components, explain trade-offs, go 2 levels deep on any component when pressed
- Know when SQL vs NoSQL, sync vs async, push vs pull, strong vs eventual consistency
- Concurrency: explain how your system handles 10× traffic spike without data loss or silent errors
- SDE 3 signal: proactively surface edge cases, failure modes, cost implications, and operational concerns without being prompted

**ML-adjacent SDE 3 (Google/Meta/Apple):**
- Add ML system design: recommendation system, search ranking, content moderation, fraud detection
- Know Bigtable, Spanner, Dremel, Pub/Sub conceptually (Google)
- Know Hive, Presto/Trino, Scribe, TAO conceptually (Meta)

**Behavioral (30 min):**
- 5 leadership stories (STAR): drove a project, disagreed and committed, resolved conflict, mentored
- 3 technical depth stories: unusual technical call that was right (or wrong); show reasoning
- 2 failure/learning stories: be honest; show what concretely changed afterward

**SDE 3 vs SDE 2 differentiation:**
- Show you own a system end-to-end, not just features within it
- Proactively identify cross-team dependencies and risks before being asked
- Estimate business impact of technical choices (latency → conversion → revenue)
- Show evidence of setting technical direction for a team or sub-system

**Preparation checklist:**
- [ ] Neetcode 150 in C++ — every problem, clean code, understand all trade-offs
- [ ] 5 additional hard problems per week for 3 months before applying
- [ ] 5 deep-dive system design documents + 3 ML system design documents (see ζ.3)
- [ ] Behavioral story bank: 10 stories mapped to STAR format, cross-indexed by competency (leadership, depth, failure, collaboration)
- [ ] 5 coding mocks + 3 system design mocks via interviewer.io or a peer

**Blueprint coverage:** ζ.1–ζ.7, η.1 (ML system design), ε.3 (CI/CD)

---

## High-Output Engineering Practices

> High output per unit time is not about typing speed — it is about compressing feedback loops, eliminating decision overhead, and thinking in the right abstractions.

---

### Development Velocity Multipliers

**Fast feedback loops (highest leverage):**
- Hot reload everywhere: Vite for React, `bun --hot` for backend, `make -j$(nproc)` with ccache for C++
- Test in the smallest possible unit: a 5-line Python script beats a 500-line notebook for debugging a single idea
- REPL-driven development: `ipython` with `%autoreload 2` for Python ML work; `cling` REPL for C++
- Shell speed: `fzf` for file and history search, `ripgrep` over `grep`, `bat` over `cat`
- `tmux` with named sessions per project: one session per active context, context-switch in under 1 second

**Build caching:**
- `ccache` for C++ compilation: 10–100× faster recompile on unchanged files
- `sccache` for distributed caching across machines
- Bazel remote cache or GitHub Actions cache for reproducible CI builds
- Docker layer caching: order Dockerfile to put infrequently-changing layers (apt installs, pip installs) before frequently-changing ones (source code)

**AI-augmented coding (use surgically):**
- Use Claude Code / Cursor for boilerplate, scaffolding, and test generation
- Keep algorithm design in your head — never delegate thinking, only typing
- Use AI to explain unfamiliar codebases: "explain what this CUDA kernel is doing and why it tiles this way"
- Review AI output at the diff level, not the description level

---

### Benchmarking & Profiling Discipline

**The rule: measure before optimizing, every time. Guessing is almost always wrong.**

**Python:**
- `py-spy top` for sampling profiler on running processes (zero code change needed)
- `line_profiler` + `@profile` decorator for line-level profiling
- `memory_profiler` for memory leaks and peak memory tracking
- `pytest-benchmark` for microbenchmarks with statistical rigor (mean, stddev, outliers)

**C++:**
- Google Benchmark: `BENCHMARK(BM_Fn)->Ranges({1, 1<<20})` — parametric microbenchmarks
- `perf stat` for hardware counters: cycles, cache misses, branch mispredictions, IPC
- `perf record` + `flamegraph.pl` for call-graph profiling
- `valgrind --tool=cachegrind` for cache miss simulation

**GPU:**
- Nsight Compute: kernel-level — occupancy, memory throughput, instruction mix, warp stalls, roofline position
- Nsight Systems: timeline — CUDA streams, H2D/D2H transfers, kernel execution overlap, CPU/GPU synchronization points
- `torch.cuda.memory_summary()` for memory debugging (fragmentation, reserved vs allocated)
- `torch.profiler.profile()` + TensorBoard trace for end-to-end PyTorch profiling

**The Roofline Model (internalize this permanently):**
- Every kernel is either compute-bound (FLOP/s saturated) or memory-bound (bandwidth saturated)
- Arithmetic intensity = FLOPs / bytes transferred
- Plot your kernel against the roofline; never optimize until you know which bound you're hitting
- Most matrix multiplies are compute-bound on large tensors; most element-wise ops are memory-bound

---

### Mental Models for Fast Code

**Memory hierarchy costs (approximate, 2025 hardware):**

| Level | Latency | Bandwidth |
|---|---|---|
| L1 cache (32–64 KB) | ~4 cycles | ~2 TB/s |
| L2 cache (256 KB–1 MB) | ~12 cycles | ~1 TB/s |
| L3 cache (8–64 MB) | ~40 cycles | ~300 GB/s |
| DRAM | ~200 cycles | ~50–100 GB/s |
| NVMe SSD | ~100K cycles | ~7 GB/s |
| GPU HBM3 (H100) | ~200 cycles | ~3.35 TB/s |
| GPU L2 (50 MB, H100) | ~50 cycles | ~12 TB/s |

Implications:
- Sequential access beats random access by 10–100× (cache line: 64 bytes CPU, 128 bytes GPU)
- AoS → SoA transformation: if you process one field of many structs, struct-of-arrays is dramatically more cache-friendly
- Design hottest data structures to fit in L1/L2; the algorithm should be designed around cache capacity

**Data-oriented design:**
- Separate data by access pattern, not by conceptual ownership
- Avoid virtual dispatch in hot loops; use tag dispatch or devirtualization
- Prefer flat arrays over linked lists; use indices instead of pointers for cache locality and serialization

**SIMD / vectorization:**
- Compiler auto-vectorizes loops with: no pointer aliasing (`__restrict`), stride-1 access, no branches, small inner loop body
- Use `#pragma GCC ivdep` or `__builtin_assume_aligned` to hint the compiler
- AVX-512 on Intel Sapphire Rapids, SVE on ARM Neoverse N2: 64-byte registers, 16× float32 per instruction
- Hand-vectorize only after proving the compiler fails with Godbolt

**Branch prediction:**
- Hot branches (>90% one direction): use `[[likely]]` / `[[unlikely]]` C++20 attributes
- Profile-Guided Optimization (PGO): compile → run on representative workload → recompile with profile data; typical 10–30% speedup
- Remove branches from inner loops with bit tricks, lookup tables, or conditional moves (`cmov`)

---

### Parallel & Async Patterns

**C++ threading (choose the right primitive):**
- `std::atomic<T>` for lock-free shared state (prefer `memory_order_relaxed` when you can prove it is safe)
- `std::jthread` (C++20) for RAII-managed threads with cooperative cancellation via `stop_token`
- `tbb::parallel_for` / `tbb::parallel_pipeline` (Intel oneTBB) for task-parallel workloads without manual thread management
- C++20 coroutines for IO-bound async: `co_await` on a socket read; pair with io_uring for zero-copy async IO

**Python async:**
- `asyncio` + `uvloop` (Cython event loop, 2–4× faster) for IO-bound services
- `concurrent.futures.ProcessPoolExecutor` for CPU-bound work with picklable items
- `multiprocessing.shared_memory` for zero-copy data sharing between processes
- Never use `asyncio` for CPU-bound work; it is single-threaded

**GPU concurrency:**
- CUDA streams: overlap kernel execution with H2D/D2H transfers using multiple streams + `cudaEventRecord`
- Stream priority: high priority on inference critical path, low on background data loading
- Multi-GPU: NCCL `ncclGroupStart/End` to overlap communication with compute in the next layer
- `torch.set_float32_matmul_precision('high')` enables TF32 on Ampere+: free ~8× throughput on matrix multiplies with negligible accuracy loss

---

### Research-to-Production Discipline

**Paper → code velocity:**
- Read the paper once for the idea; read the math section twice; read the appendix once
- Pseudocode → Python prototype → profile bottlenecks → implement hot path in Triton/CUDA
- Time-box any implementation: if you don't have results in 3 days, re-read the paper — you misunderstood something
- Always compare against a simple baseline first; complex methods only matter if they beat the baseline

**Experiment hygiene:**
- Every experiment has a W&B run; config logged at start; random seed fixed and logged
- Never modify a running experiment; start a new run with a new config
- Keep a running hypothesis log: what you expected, what you observed, what you changed
- If loss does not go down in the first 100 steps, something is wrong — diagnose before scaling up

**Open-source contribution velocity:**
- Find a good first issue in a project you use daily; fix it with a minimal, focused diff
- Write the PR description as if explaining to someone unfamiliar with the issue: context → root cause → fix → test
- Respond to review comments within 24 hours; keep the diff small across revisions
- Target 1 merged PR per month in a top-10 project in your domain: 12 PRs/year = strong portfolio signal
- Contribution hierarchy by value: bug fix with test > performance improvement with benchmark > new feature with docs

That is not a race to the bottom. That is the summit. From that summit, you can help build a future where abundance is shared, the stars are open, and no one is left behind.