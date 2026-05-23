# The Embodied Autonomy AI Engineer — Complete Blueprint

## The Dream
Build the capacity to create the intelligent core of machines that move, fly, and explore. Operate at the frontier of AI (research engineer) AND apply that capability to embodied systems: spacecraft, rockets, robots, autonomous vehicles. Release work into the open-source commons to bend the future toward Scenario C/D — post-scarcity abundance, not techno-feudalism.

## Target Roles
1. **Frontier AI Research Scientist** — LLM/VLM architecture, scaling laws, novel training paradigms, multimodal foundation models
2. **Frontier AI Research Engineer** — Large-scale distributed training, CUDA/C++ optimization, inference acceleration, model deployment infrastructure
3. **Embodied Autonomy — Space & Rockets** — Orbital GNC, flight software, satellite autonomy, onboard AI, propulsion, ISRU, planetary surface operations
4. **Embodied Autonomy — Robotics** — Manipulation, locomotion, drones, sim-to-real
5. **Embodied Autonomy — Autonomous Vehicles** — Perception, planning, prediction, embedded deployment
6. **Space Science / Physics** — ML for astrophysics, space weather, plasma simulation (escape hatch)
7. **Infrastructure & Platform Engineering** — Deep systems: ML infra, HPC, edge deployment, GPU/CPU architecture

---

## Knowledge Clusters (α–ε + Foundational Substrate)

### Cluster α — Frontier AI/ML: The Model Engine
Serves: Research Scientist, Research Engineer. Underpins all AI-for-physical-systems work.

**Topics:**
- Transformer architectures, state-space models (Mamba, S4), mixture-of-experts, multimodal models (vision-language-action)
- Scaling laws, training dynamics, data curation, evaluation
- Distributed training: FSDP, DeepSpeed, Megatron, tensor/pipeline parallelism
- Low-level GPU programming: CUDA, Triton, CUTLASS, kernel fusion, memory optimization
- Numerical stability: mixed precision (fp16/bf16), gradient accumulation, loss scaling
- Inference optimization: quantization (GPTQ, AWQ), distillation, pruning, TensorRT, ONNX Runtime
- Reinforcement learning: PPO, SAC, RLHF/DPO (alignment), sim-to-real

**Study Resources:**
- **Spine:** Andrej Karpathy's "Neural Networks: Zero to Hero" (YouTube) + "Let's build GPT from scratch"
- *The Annotated Transformer* (Harvard NLP, online)
- PyTorch FSDP official tutorial
- DeepSpeed GitHub + documentation
- NVIDIA CUDA Programming Guide (official, docs.nvidia.com)
- "CUDA Mode" YouTube lectures (Mark Saroufim)
- Triton official tutorials (triton-lang.org)
- *Programming Massively Parallel Processors* (Kirk & Hwu)
- vLLM GitHub — study PagedAttention, continuous batching
- TensorRT-LLM documentation
- CS 285: Deep Reinforcement Learning (UC Berkeley, YouTube)
- "Spinning Up in Deep RL" (OpenAI)
- O'Reilly: "Train Large Language Models Faster — Parallelism Deep Dive"

**Experiments & Practical Work:**
- Train a GPT-2–sized model from scratch on 2+ GPUs using FSDP. Log loss curves, throughput, GPU utilization
- Write a custom CUDA kernel for fused attention; benchmark against PyTorch's implementation
- Quantize an LLM to INT4 with GPTQ and deploy via vLLM; measure throughput/latency
- Train a PPO agent in MuJoCo; record video and write up reward curves
- Reproduce a recent paper (new SSM or MoE architecture); publish a reproducibility report

---

### Cluster β — Embodied AI: Making Models Move
Serves: Space GNC, Robotics, AV. The physics of intelligent motion.

**Topics:**
- Classical and modern control: PID, LQR, LQG, MPC, robust control
- State estimation: Kalman filters (KF, EKF, UKF, ensemble), particle filters, factor graphs, nonlinear least squares (GTSAM, Ceres)
- SLAM: visual SLAM, LiDAR SLAM, visual-inertial odometry
- Sensor modeling: IMU, GPS/GNSS, star trackers, cameras, LiDAR, radar
- Rigid-body dynamics: kinematics, Newton-Euler, Lagrangian mechanics, quaternions
- Trajectory optimization: direct collocation, shooting methods, sampling-based planning (RRT*, PRM)
- Physics simulation: MuJoCo, Isaac Sim, Gazebo, sim-to-real transfer, domain randomization

**Study Resources:**
- **Spine:** Coursera "Modern Robotics" Specialization (Northwestern, Kevin Lynch) — free book + videos + exercises
- *Probabilistic Robotics* (Thrun, Burgard, Fox)
- Cyrill Stachniss SLAM Course (YouTube, University of Bonn)
- GTSAM documentation and examples
- CMU 16-299: Introduction to Feedback Control Systems (for CS majors)
- *Modern Control Engineering* (Ogata)
- CasADi documentation + examples
- *Model Predictive Control* (Rawlings, Mayne)

**Experiments & Practical Work:**
- Implement a Kalman filter from scratch for a 2D robot; publish derivation blog post
- Build a full planar SLAM using GTSAM or g2o with a public dataset
- Control a simulated inverted pendulum with PID, LQR, and MPC; compare performance
- Run ORB-SLAM3 on a public dataset and trace the full pipeline in code
- Build a ROS 2–based robot simulation with SLAM, navigation, and obstacle avoidance

---

### Cluster γ — Real-Time & Embedded Systems: Deploying to the Edge
Serves: Research Engineer (deployment), Space Flight Software, Robotics, AV.

**Topics:**
- Real-time C/C++: deterministic memory management, MISRA guidelines, interrupt handling, watchdog timers
- RTOS: FreeRTOS, Zephyr, QNX, VxWorks, RTEMS
- Embedded Linux: Yocto, Buildroot, device trees, kernel modules
- Microcontrollers: ARM Cortex-M, RISC-V; memory-mapped I/O, peripherals
- FPGAs and hardware acceleration: basic HDL, high-level synthesis
- Hardware-in-the-loop testing
- Communication buses: CAN, SPI, I2C, UART, SpaceWire, EtherCAT
- Edge inference: TensorRT, ONNX Runtime, TFLite Micro, custom operator deployment

**Study Resources:**
- **Spine:** FreeRTOS official tutorials + STM32CubeIDE example projects
- "Mastering FreeRTOS using STM32" (Udemy)
- *Hands-On RTOS with Microcontrollers* (Amos)
- MISRA C++ guidelines (reference with Claude)
- TensorRT documentation
- ONNX Runtime documentation
- TensorFlow Lite Micro documentation

**Experiments & Practical Work:**
- Set up FreeRTOS on an STM32 Nucleo; read an IMU via I2C, log data to SD card in a real-time task loop
- Train a small classifier, quantize, deploy via TFLite Micro on the Nucleo; measure latency
- Build HITL setup: Python sim streams sensor data to the Nucleo, which runs an EKF and sends back control commands
- Deploy a quantized transformer on Jetson with TensorRT; benchmark throughput

---

### Cluster δ — Computational Physics & Domain Science
Serves: Space Physics, advanced Space GNC, Mars habitat simulation.

**Topics:**
- Classical mechanics: Lagrangian and Hamiltonian formulations, perturbation theory
- Electromagnetism: Maxwell's equations, radiation, antenna theory
- Plasma physics: MHD, particle-in-cell methods
- Numerical methods for PDEs: finite difference, finite volume, spectral methods
- Physics-informed neural networks (PINNs)
- Scientific computing: HPC patterns, parallel I/O, GPU-accelerated PDE solvers
- Astrophysics data analysis: time-series (periodograms, wavelets), image reconstruction, Bayesian inference

**Study Resources:**
- *Introduction to Plasma Physics and its Space Applications* (Conde, 2025)
- *The Magnetic Solar System* (von Kusserow & Marsch, 2025)
- *Introduction to Plasma Physics* (Chen) — classic
- *Classical Mechanics* (Goldstein)
- *Introduction to Electrodynamics* (Griffiths) — first chapters
- SunPy, SpacePy, AstroPy documentation
- NASA CDAWeb for real data
- Original PINNs paper (Raissi et al.)

**Experiments & Practical Work:**
- Download real solar wind data; build DL model to predict Kp index 1 hour ahead; benchmark against persistence and NOAA
- Implement a PINN to solve a plasma wave equation or 1D heat equation
- Contribute a data loading function for a NASA mission to SunPy or SpacePy

---

### Cluster ε — Software Infrastructure & MLOps: The Supporting Layer
Serves: All roles. Necessary fluency, not a deep moat.

**Topics:**
- Cloud: AWS basics (EC2, S3, Lambda)
- Infrastructure-as-code: Terraform, Kubernetes basics, Docker
- CI/CD: GitHub Actions, GitLab CI, automated testing (pytest, GTest)
- Build systems: CMake, Bazel, PlatformIO
- Data pipelines: Apache Kafka, Ray, distributed data loading
- Open-source collaboration: Git, semantic versioning, PR etiquette, licenses, documentation

**Study Resources:**
- GitHub Actions documentation
- CMake official tutorial
- Docker documentation
- Weights & Biases quickstart

**Experiments & Practical Work:**
- Containerize a PyTorch training script with Docker, run on cloud GPU, log metrics to W&B
- Set up CI/CD pipeline for a C++ or Python project with automated tests

---

### Foundational Substrate — Underpins All Clusters

**Topics:**
- Mathematics: linear algebra (matrix calculus, SVD, eigen), probability & statistics (Bayesian, Monte Carlo, information theory), optimization (convex, gradient-based), numerical methods (integration, root-finding, ODE solvers)
- DSA: arrays, trees, graphs, dynamic programming, complexity analysis — maintain via periodic practice, not daily grind
- Computer Systems: OS concepts (processes, virtual memory, file systems), computer architecture (pipeline, cache, memory hierarchy, RISC-V/x86), GPU architecture (SM, warps, tensor cores)
- Networking: TCP/IP, sockets, high-speed interconnects (InfiniBand/RDMA)
- Compilers: basics of LLVM, code generation, optimization passes

**Study Resources:**
- **Spine:** *Mathematics for Machine Learning* (Deisenroth, Faisal, Ong) — free at mml-book.github.io
- *Modern Statistics: Intuition, Math, Python, R* (Mike X Cohen) — code-first, GitHub with exercises
- Neetcode.io (curated 150 DSA problems)
- MIT 6.006 Introduction to Algorithms (YouTube)
- NVIDIA CUDA Programming Guide (architecture sections)
- CS 61C: Machine Structures (UC Berkeley, YouTube) — for computer architecture

**Experiments & Practical Work:**
- Implement SVD from scratch in NumPy; use to compress an image; blog post explaining every step

---

## Specialized Branches — Additive on Core

### Branch A: Frontier AI Research Engineer/Scientist
- Megatron-LM GitHub — tensor/pipeline parallelism
- "Efficient Deep Learning" course (MIT, Cheng)
- Anthropic alignment papers, DeepMind scaling literature
- **Project:** Reproduce a recent paper (SSM or MoE) from scratch

### Branch B: Space & Rockets (Including Mars/Habitat)

**Orbital Mechanics & GNC:**
- **Spine:** *Orbital Mechanics for Engineering Students* (Curtis) + CU Boulder "Advanced Spacecraft Dynamics and Control" (Coursera)
- *Spacecraft Attitude Determination and Control* (Wertz)
- *Fundamentals of Spacecraft Attitude Determination and Control* (Markley & Crassidis)
- Orekit Tutorials (orekit.org)
- Poliastro (Python)
- AIAA: "Fundamentals of Space Vehicle GNC and Astrodynamics" short course

**Propulsion:**
- *Rocket Propulsion Elements* (Sutton & Biblarz) — read fundamentals, liquid, electric; skip turbopump details
- *Introduction to Rocket Propulsion for Astronautics* (Musielak, 2025) — more accessible

**Planetary Surface Autonomy & ISRU:**
- NASA cFS (core Flight System) — build and run on Raspberry Pi; add custom app
- Basilisk (JPL) — astrodynamics simulation; study GNC modules
- *Use of Extraterrestrial Resources for Human Space Missions to Moon or Mars* (Rapp) — ISRU reference

**Advanced AI for Space:**
- RT-2 / PaLM-E / Octo model papers — vision-language-action models
- NASA AEGIS system documentation — autonomous science targeting

**Projects:**
- Implement full orbit propagator with J2, drag, third-body perturbations; validate against GMAT
- Design attitude control loop (PD + reaction wheels); simulate detumbling and slew
- Build EKF for orbit determination using simulated GPS; run on Raspberry Pi in real time
- Set up NASA cFS on Raspberry Pi, add custom GNC app, closed-loop simulation with Basilisk
- Build a VLM that analyzes satellite imagery and flags anomalies; fine-tune on Earth observation data
- Train an RL agent for low-thrust orbital transfer; compare against classical optimization

### Branch C: Robotics (Manipulation, Locomotion, Drones)
- **Spine:** "Modern Robotics" (Lynch & Park) — same as Core β spine
- ROS 2 Official Tutorials
- MoveIt 2 documentation
- MuJoCo + Gymnasium
- PX4 / ArduPilot — study control and estimation modules
- ORB-SLAM3 GitHub
- **Projects:**
  - Build ROS 2 robot sim with SLAM + navigation + obstacle avoidance
  - Train RL agent in MuJoCo for cube rotation with domain randomization
  - Contribute working feature or sensor driver to PX4/ArduPilot, tested in SITL

### Branch D: Autonomous Vehicles
- "Self-Driving Cars" Specialization (University of Toronto, Coursera)
- MIT 6.S094: Deep Learning for Self-Driving Cars (YouTube)
- CARLA simulator
- Autoware (open-source AV stack)
- OpenPCDet — LiDAR-based 3D object detection
- **Projects:**
  - Train LiDAR 3D object detector on nuScenes; run real-time with TensorRT
  - Implement motion planner in CARLA (lane keeping, lane change, intersection crossing)
  - Deploy perception pipeline (YOLO + depth) on Jetson at >15fps

### Branch E: Space Science / Physics
- *Introduction to Plasma Physics and its Space Applications* (Conde, 2025)
- *The Magnetic Solar System* (von Kusserow & Marsch, 2025)
- *Introduction to Plasma Physics* (Chen)
- SunPy, SpacePy, AstroPy — contribute data access/analysis functions
- **Projects:**
  - Predict Kp index 1 hour ahead with DL; benchmark against NOAA
  - Implement PINN for plasma wave equation
  - Contribute data loading function for NASA mission to SunPy/SpacePy

### Branch F: Infrastructure & Platform Engineering (Deep Systems)
- NVIDIA-Certified Professional: AI Infrastructure (Udemy)
- "The Complete Guide to AI Infrastructure: Zero to Hero" (Udemy)
- Kubernetes + NVIDIA GPU Operator
- Ray documentation
- TVM documentation
- **Projects:**
  - Set up multi-node Kubernetes cluster with GPU support; deploy distributed training via Kubeflow
  - Profile training bottleneck (data loading, NCCL, compute) and fix; document before/after
  - Write custom TVM schedule for matrix multiplication on a microcontroller

---

## Unified Learning Order

### Phase 1: Foundation (12–18 months)
**Focus:** Foundational Substrate + Cluster α (deep) + Cluster γ (light)

- Solidify math/stats/DSA to crisp, interview-ready level
- Deepen α: distributed training, CUDA, model architecture
- Introduce γ: STM32 + FreeRTOS basics, embedded C patterns
- Ship 10+ mini-projects across α and γ

### Phase 2: Embodiment & Space Introduction (18–30 months)
**Focus:** Cluster β begins in earnest; α and γ continue

- Start β: classical control → Kalman filtering → factor-graph SLAM
- Begin orbital mechanics and attitude control (Branch B basics)
- Build signature project: learned control + simulated rover or CubeSat
- Deepen α into custom kernels, quantization, deployment
- Contribute to open-source (PX4, ArduPilot, Poliastro)

### Phase 3: Mars & Habitat Specialization (30–48 months)
**Focus:** Full Branch B (propulsion, surface autonomy, ISRU, advanced AI-for-space)

- Incorporate propulsion, ISRU, thermal/power for habitats
- Apply advanced AI: train VLM for terrain analysis or fault detection
- Contribute to NASA cFS, Basilisk, or astrodynamics libraries
- Become a unique "AI for planetary exploration" engineer

### Phase 4: Horizon (48+ months)
- **Path A (AI-heavy):** Push α toward research engineer; work where big models are trained
- **Path B (Embodied-heavy):** Lead autonomy at space/robotics startups; open-source, consulting, mission roles
- Space physics (δ) remains an exploration side-door

---

## Open-Source Ecosystems to Live In
- **Robotics/Drones:** ROS 2, PX4, ArduPilot, MoveIt 2
- **Space:** Orekit, Poliastro, Basilisk, NASA cFS, F Prime
- **AI/ML Infra:** vLLM, DeepSpeed, Triton, TVM, Ray, PyTorch
- **Perception:** ORB-SLAM3, OpenPCDet, Autoware
- **Space Science:** SunPy, SpacePy, AstroPy

---

## Cross-Cutting Resources (Read Once, Apply Everywhere)

| Resource | Relevant To |
|---|---|
| *Mathematics for Machine Learning* (Deisenroth) | Core Math, AI Core, Control |
| *Modern Robotics* (Lynch & Park) | Control, Robotics, AV, Space GNC |
| *Probabilistic Robotics* (Thrun et al.) | State Estimation, SLAM, Robotics, AV |
| *Orbital Mechanics for Engineering Students* (Curtis) | Space, Rockets |
| CUDA Programming Guide (NVIDIA) | AI Core, Infra, Edge Deployment |
| CS 285 (Berkeley) lectures | AI Core, Robotics, AV, Space AI |
| Cyrill Stachniss SLAM lectures (YouTube) | State Estimation, Robotics, AV |
| Karpathy's Zero to Hero + Build GPT | AI Core |
| "Modern Robotics" Coursera Specialization | Control, Robotics |

---

## How to Use This Blueprint With Your AI Stack

1. **Load** the primary spine resource (textbook PDF, course page) into Claude or Gemini's large context window
2. **Prompt:** "Teach me [topic] as an interactive dialogue. Quiz me on the math. Generate Python/C++ exercises. Critique my solutions."
3. **Code:** Use OpenCode in your IDE to scaffold projects, write tests, generate boilerplate
4. **Close:** Build the project or make the open-source commit. Push publicly.

**The rule:** You never finish a category by reading. You finish it by **shipping**.

---

## Closing Checklist (Per Cluster)
For each cluster, you should be able to answer YES to all three:

1. **Study closed:** I've consumed the spine resource and my notes are clear enough that I could teach the core ideas
2. **Experiment closed:** I've built the toy version and intentionally broken it, observed failure modes, and fixed them
3. **Practical work closed:** I have a public artifact (GitHub repo with clean README, merged PR, blog post with benchmarks, or video demo of working hardware)

Only then do you move on.

---

## The Spine Summary (If You Only Consume One Thing Per Cluster)

| Cluster | Spine Resource |
|---|---|
| Core Math | *Mathematics for Machine Learning* (Deisenroth) |
| AI/ML Engineering | Karpathy's Zero to Hero + Build GPT videos |
| Control & Robotics | Coursera "Modern Robotics" specialization |
| State Estimation / SLAM | Cyrill Stachniss SLAM lectures + *Probabilistic Robotics* |
| Embedded / Real-Time | FreeRTOS official tutorials + STM32 examples |
| Orbital Mechanics | Curtis book + CU Boulder "Advanced Spacecraft Dynamics" |
| Propulsion / ISRU / Surface Autonomy | NASA cFS + Basilisk examples + Rapp book (ISRU) |
| Space Science / Physics | Chen's Plasma book + SunPy tutorials |
| Deep Infra / Systems | NVIDIA CUDA Guide + MIT "Efficient Deep Learning" |

---

## Final Picture
You are 30, IIT-trained, holding a mundane job that you automate with AI to free 5 hours a day. During those hours, you systematically construct the rare, high-ground expertise of a **Frontier AI Engineer for Embodied Autonomy**. In 3–5 years, you can be one of the few people on the planet who can design a novel transformer architecture, train it on a thousand GPUs, quantize it, deploy it on a spacecraft flight computer or a legged robot, and release the entire stack as open-source.

That is not a race to the bottom. That is the summit. From that summit, you can help build a future where abundance is shared, the stars are open, and no one is left behind.