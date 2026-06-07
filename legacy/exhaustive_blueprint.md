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

## Knowledge Clusters (α–ε + Foundational Substrate)

### Cluster α — Frontier AI/ML: The Model Engine
Serves: Research Scientist, Research Engineer. Underpins all AI-for-physical-systems work.

**Topics:**
- Transformer architectures, state-space models (Mamba, S4), mixture-of-experts, multimodal models (vision-language-action)
- Scaling laws, training dynamics, data curation, evaluation
- Distributed training: FSDP, DeepSpeed, Megatron, tensor/pipeline parallelism
- Low-level GPU programming: CUDA, Triton, CUTLASS, kernel fusion, memory optimization
- Numerical stability: mixed precision (fp16/bf16), gradient accumulation, loss scaling
- Inference optimization: quantization (GPTQ, AWQ), distillation, pruning, TensorRT-LLM, ONNX Runtime
- Reinforcement learning: PPO, SAC, RLHF/DPO (alignment), sim-to-real, multi-agent RL
- Data pipelines: tokenization, streaming datasets, data filtering/curation

### Cluster β — Embodied AI: Making Models Move
Serves: Space GNC, Robotics, AV. The physics of intelligent motion.

**Topics:**
- Classical and modern control: PID, LQR, LQG, MPC, robust control
- State estimation: Kalman filters (KF, EKF, UKF, ensemble), particle filters, factor graphs, nonlinear least squares (GTSAM, Ceres)
- SLAM: visual SLAM, LiDAR SLAM, visual-inertial odometry, multi-agent SLAM
- Sensor modeling: IMU, GPS/GNSS, star trackers, cameras, LiDAR, radar, thermal cameras
- Rigid-body dynamics: kinematics, Newton-Euler, Lagrangian mechanics, quaternions
- Trajectory optimization: direct collocation, shooting methods, sampling-based planning (RRT*, PRM), behavior trees
- Physics simulation: MuJoCo, Isaac Sim, Gazebo, sim-to-real transfer, domain randomization

### Cluster γ — Real-Time & Embedded Systems: Deploying to the Edge
Serves: Research Engineer (deployment), Space Flight Software, Robotics, AV.

**Topics:**
- Real-time C/C++: deterministic memory management, MISRA guidelines, interrupt handling, watchdog timers
- RTOS: FreeRTOS, Zephyr, QNX, VxWorks, RTEMS
- Embedded Linux: Yocto, Buildroot, device trees, kernel modules
- Microcontrollers: ARM Cortex-M, RISC-V; memory-mapped I/O, peripherals
- FPGAs and hardware acceleration: basic HDL, high-level synthesis
- Hardware-in-the-loop testing
- Communication buses: CAN, SPI, I2C, UART, SpaceWire, EtherCAT, MIL-STD-1553
- Edge inference: TensorRT, ONNX Runtime, TFLite Micro, custom operator deployment, TVM

### Cluster δ — Computational Physics & Domain Science
Serves: Space Physics, advanced Space GNC, Mars habitat simulation.

**Topics:**
- Classical mechanics: Lagrangian and Hamiltonian formulations, perturbation theory
- Electromagnetism: Maxwell's equations, radiation, antenna theory
- Plasma physics: MHD, particle-in-cell methods
- Numerical methods for PDEs: finite difference, finite volume, spectral methods
- Physics-informed neural networks (PINNs) and operator learning (DeepONet, FNO)
- Scientific computing: HPC patterns, parallel I/O, GPU-accelerated PDE solvers
- Astrophysics data analysis: time-series (periodograms, wavelets), image reconstruction, Bayesian inference

### Cluster ε — Software Infrastructure & MLOps: The Supporting Layer
Serves: All roles. Necessary fluency, not a deep moat.

**Topics:**
- Cloud: AWS basics (EC2, S3, Lambda)
- Infrastructure-as-code: Terraform, Kubernetes basics, Docker
- CI/CD: GitHub Actions, GitLab CI, automated testing (pytest, GTest)
- Build systems: CMake, Bazel, PlatformIO
- Data pipelines: Apache Kafka, Ray, distributed data loading
- Open-source collaboration: Git, semantic versioning, PR etiquette, licenses, documentation
- Experiment tracking: Weights & Biases, MLflow

### Foundational Substrate — Underpins All Clusters

**Topics:**
- Mathematics: linear algebra (matrix calculus, SVD, eigen), probability & statistics (Bayesian, Monte Carlo, information theory), optimization (convex, gradient-based), numerical methods (integration, root-finding, ODE solvers)
- DSA: arrays, trees, graphs, dynamic programming, complexity analysis — maintain via periodic practice
- Computer Systems: OS concepts (processes, virtual memory, file systems), computer architecture (pipeline, cache, memory hierarchy, RISC-V/x86), GPU architecture (SM, warps, tensor cores)
- Networking: TCP/IP, sockets, high-speed interconnects (InfiniBand, RDMA, RoCE)
- Compilers: basics of LLVM, MLIR, XLA, TVM, code generation, optimization passes

---

## COMMON CORE — The Universal Backbone

### 1. Mathematical & Algorithmic Maturity

**Topics:**
- Linear algebra (SVD, eigen, matrix calculus, pseudoinverse)
- Probability & statistics (Bayesian inference, Monte Carlo, information theory)
- Numerical methods (ODE/PDE solvers, integration, root-finding)
- Optimization (convex, gradient descent, Lagrangian duality)
- Data structures & algorithms (maintain sharp, not obsessive; IIT base is strong)

**Study Resources:**
- **Spine:** *Mathematics for Machine Learning* (Deisenroth, Faisal, Ong) — free at mml-book.github.io
- *Modern Statistics: Intuition, Math, Python, R* (Mike X Cohen) — code-first; GitHub exercises at `github.com/mikexcohen/Statistics_book`
- Neetcode.io (curated 150 DSA problems) — for algorithmic maintenance
- MIT 6.006 Introduction to Algorithms (YouTube) — conceptual refresh

**Projects to Close:**
- Implement SVD from scratch in NumPy, use it to compress an image, blog the derivation
- Solve 10–15 Neetcode problems per quarter, focusing on graphs and DP

---

### 2. AI/ML Engineering Core (Frontier-Leaning)

**Topics:**
- Deep learning fundamentals (backprop, computational graphs, autodiff)
- Transformer family (self-attention, RoPE, MoE, SSMs, long context, multimodal)
- Training large models: FSDP, DeepSpeed, Megatron, mixed precision, gradient accumulation
- Inference optimization: quantization (GPTQ, AWQ, bitsandbytes), distillation, TensorRT-LLM, ONNX Runtime, vLLM, Triton Inference Server
- GPU programming: CUDA (thread hierarchy, memory types, tensor cores), Triton, CUTLASS, profiling with Nsight
- Reinforcement learning: PPO, SAC, RLHF/DPO (alignment), sim-to-real methods, multi-agent RL
- Data pipelines: tokenization, streaming datasets, data filtering/curation, synthetic data

**Study Resources:**
- **Spine:** Andrej Karpathy's "Neural Networks: Zero to Hero" (YouTube) + "Let's build GPT from scratch"
- *The Annotated Transformer* (Harvard NLP, online)
- Andrew Ng's Deep Learning Specialization (Coursera) — breadth
- O'Reilly: "Train Large Language Models Faster — Parallelism Deep Dive" (8-hour course)
- PyTorch FSDP official tutorial
- DeepSpeed GitHub + documentation (ZeRO papers)
- NVIDIA CUDA Programming Guide (official, docs.nvidia.com)
- "CUDA Mode" YouTube lectures (Mark Saroufim)
- Triton official tutorials (triton-lang.org)
- *Programming Massively Parallel Processors* (Kirk & Hwu)
- vLLM GitHub — study PagedAttention, continuous batching
- TensorRT-LLM documentation
- CS 285: Deep Reinforcement Learning (UC Berkeley, YouTube)
- "Spinning Up in Deep RL" (OpenAI)

**Projects to Close:**
1. Train a GPT-2–sized model from scratch on 2+ GPUs using FSDP. Log loss curves, throughput, GPU utilization
2. Write a custom CUDA kernel for fused attention; benchmark against PyTorch's implementation
3. Quantize an LLM to INT4 with GPTQ and deploy via vLLM; measure throughput/latency at different batch sizes
4. Train a PPO agent in MuJoCo, record video, write up reward curves
5. Reproduce a recent SSM or MoE paper from scratch; publish reproducibility report

---

### 3. Control, Estimation & Physics for Autonomy

**Topics:**
- Classical control: PID, root locus, frequency domain
- State-space methods: LQR, LQG, pole placement
- Model predictive control (MPC) and trajectory optimization (direct collocation, shooting)
- State estimation: Kalman filter (KF, EKF, UKF, ensemble), particle filters, factor graphs (GTSAM, g2o)
- SLAM: visual SLAM, LiDAR SLAM, graph-based, multi-agent
- Sensor modeling: IMU, GPS/GNSS, cameras, LiDAR, radar, star trackers, thermal cameras
- Rigid-body kinematics/dynamics (quaternions, Euler-Lagrange, Newton-Euler)
- Behavior trees for task planning

**Study Resources:**
- **Spine:** Coursera "Modern Robotics: Mechanics, Planning, and Control" (Northwestern, Kevin Lynch) — free book + video lectures + exercises
- *Probabilistic Robotics* (Thrun, Burgard, Fox)
- Cyrill Stachniss' SLAM Course (YouTube, University of Bonn) — full lectures + slides + Python exercises
- CMU 16-299: Introduction to Feedback Control Systems (designed for CS majors)
- *Modern Control Engineering* (Ogata)
- *Model Predictive Control* (Rawlings, Mayne)
- GTSAM documentation and examples
- CasADi documentation + examples
- *Behavior Trees in Robotics and AI* (Colledanchise & Ögren) — for task planning
- *Introduction to Humanoid Robotics* (Kajita) — ZMP and legged locomotion basics

**Projects to Close:**
1. Implement a Kalman filter from scratch for a 2D robot; publish derivation as blog post
2. Build a full planar SLAM using GTSAM or g2o with a public dataset
3. Control a simulated inverted pendulum with PID, LQR, and MPC; compare performance
4. Run ORB-SLAM3 on a public dataset and trace the full pipeline in code
5. Implement a behavior tree for a simple pick-and-place task in simulation

---

### 4. Embedded & Real-Time Systems

**Topics:**
- C/C++ for real-time/safety-critical (MISRA, deterministic memory)
- RTOS: FreeRTOS, Zephyr, QNX/VxWorks awareness
- Embedded Linux (Yocto, Buildroot) and NVIDIA Jetson
- Microcontrollers: ARM Cortex-M, RISC-V
- FPGAs and high-level synthesis (basic HDL)
- Hardware-in-the-loop testing
- Communication buses: CAN, SPI, I2C, UART, SpaceWire, EtherCAT, MIL-STD-1553
- Edge inference: TensorRT, ONNX Runtime, TFLite Micro, TVM, custom kernels

**Study Resources:**
- **Spine:** FreeRTOS official tutorials + STM32CubeIDE example projects
- "Mastering FreeRTOS using STM32" (Udemy)
- *Hands-On RTOS with Microcontrollers* (Amos, 2nd edition)
- MISRA C++ guidelines (reference with Claude)
- TensorRT documentation, ONNX Runtime documentation, TFLite Micro
- TVM documentation — ML compiler for edge deployment
- FPGA: "FPGA Programming for Beginners" (Packt) or Xilinx Vivado tutorials

**Projects to Close:**
1. Set up FreeRTOS on STM32 Nucleo; read IMU via I2C, log data to SD card in real-time task loop
2. Train a small classifier, quantize, deploy via TFLite Micro on Nucleo; measure latency
3. Build HITL: Python sim streams sensor data to Nucleo, which runs EKF and sends back control commands
4. Deploy a quantized transformer on Jetson with TensorRT; benchmark throughput
5. Write a custom TVM schedule for a matrix multiplication on Cortex-M; compare against TFLite Micro

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

**Additional Topics:**
- Distributed training internals (Megatron tensor/pipeline, ZeRO stage analysis)
- MoE expert parallelism, load balancing
- LLM evaluation, red-teaming, alignment (RLHF, DPO)
- Data engineering at scale (CommonCrawl curation, deduplication)
- (Scientist track) novel architecture design, publishing at top venues

**Resources:**
- Megatron-LM GitHub — study tensor and pipeline parallelism
- "Efficient Deep Learning" course (MIT, Cheng) — systems perspective
- Anthropic alignment papers, DeepMind scaling literature
- TRL (Transformer Reinforcement Learning) library

**Projects:**
- Implement an MoE layer with expert parallelism and load balancing; benchmark throughput
- Set up a full RLHF pipeline (SFT → reward model → PPO) using TRL on a small model
- Curate a high-quality dataset from CommonCrawl, deduplicate, filter; show improvement on a pretrained model

---

### Branch B: Space & Rockets (Including Mars/Habitat)

#### Orbital & Attitude GNC

**Topics:**
- Orbital mechanics: two-body, Kepler, perturbations (J2, drag, SRP, third-body), interplanetary transfers, Lagrange points, low-thrust trajectories
- Attitude determination & control: TRIAD, QUEST, reaction wheels, magnetic torquers, quaternion control, momentum management
- Flight software frameworks: NASA cFS, F Prime, KubOS

**Resources:**
- **Spine:** *Orbital Mechanics for Engineering Students* (Curtis) + CU Boulder "Advanced Spacecraft Dynamics and Control" (Coursera)
- *Spacecraft Attitude Determination and Control* (Wertz)
- *Fundamentals of Spacecraft Attitude Determination and Control* (Markley & Crassidis)
- AIAA: "Fundamentals of Space Vehicle GNC and Astrodynamics" short course
- Orekit Tutorials (orekit.org)
- Poliastro (Python)
- GMAT (General Mission Analysis Tool) — NASA, for validation
- SPICE (NAIF) — for ephemerides and frames
- *Spacecraft Trajectory Optimization* (Conway) — low-thrust and interplanetary

**Projects:**
1. Implement full orbit propagator with J2, drag, third-body perturbations in Python/C++; validate against GMAT
2. Design an attitude control loop (PD + reaction wheels) and simulate detumbling and slew maneuvers
3. Build an EKF for orbit determination using simulated GPS measurements; run on Raspberry Pi in real time
4. Use SPICE to compute planetary positions and transfer windows; visualize a Mars trajectory
5. Train an RL agent for low-thrust orbital transfer (Earth to Mars) using a simplified model; compare to classical optimization

#### Propulsion

**Topics:**
- Rocket equation, specific impulse, mass fractions
- Chemical propulsion (liquid, solid, hybrid) vs electric (Hall, ion, MPD)
- Nuclear thermal/electric concepts
- Low-thrust trajectory optimization (indirect/direct methods, RL)
- ISRU fundamentals (Sabatier reaction, water electrolysis, methane/LOX production)

**Resources:**
- *Rocket Propulsion Elements* (Sutton & Biblarz, 9th edition) — chapters on fundamentals, liquid, electric
- *Introduction to Rocket Propulsion for Astronautics* (Musielak, 2025)
- *Use of Extraterrestrial Resources for Human Space Missions to Moon or Mars* (Rapp) — ISRU bible
- *Spacecraft Trajectory Optimization* (Conway) — low-thrust methods

**Projects:**
- Build a simple rocket equation calculator; plot delta-V for different mass fractions and Isp
- Implement a low-thrust spiral trajectory simulation (continuous thrust) using Python; compare fuel mass vs impulsive
- Model a Sabatier reactor mass/energy balance in Python

#### Planetary Surface Autonomy

**Topics:**
- Long-duration autonomy with communication delays (up to 40 min)
- Rover navigation in extreme terrain (vision+thermal+radar, traction control)
- Autonomous construction/assembly (regolith 3D printing, multi-agent coordination)
- Autonomous science decision-making (active learning, anomaly detection)
- Swarm coordination under intermittent communications
- Terramechanics (wheel-soil interaction)

**Resources:**
- NASA cFS (core Flight System) — open-source, build on Raspberry Pi; underpins Artemis, Gateway, Mars Sample Return
- Basilisk (JPL/University of Colorado) — astrodynamics simulation; includes rover models
- *Principles of Robot Motion* (Choset et al.) — planning for rovers
- "Autonomous Science on Mars" papers (NASA AEGIS, Perseverance)
- Swarm robotics: "Swarm Robotics: A Formal Approach" (Hamann), or review papers on multi-agent coordination
- *Terramechanics and Off-Road Vehicle Engineering* (Wong) — brief reference

**Projects:**
1. Set up NASA cFS on Raspberry Pi, add a custom GNC app, run closed-loop simulation with Basilisk
2. Implement a communication-delayed teleoperation interface: simulate 10-min delay, control a robot in Gazebo
3. Build a multi-agent exploration simulation: 3 rovers with intermittent comms, shared map building
4. Fine-tune a VLM on satellite/rover imagery for anomaly detection (e.g., dust storms, wheel damage)

#### Mechanical/Thermal/Electrical for Habitats

**Topics:**
- Thermal control: radiation, conduction, heat pipes, MLI (Multi-Layer Insulation)
- Life support systems: CO₂ scrubbing, water recycling, atmospheric pressure control
- Power systems: solar arrays, RTGs, battery management, power distribution
- Structural health monitoring (vibration data, damage detection)
- In-situ manufacturing (3D printing with regolith)

**Resources:**
- *Spacecraft Thermal Control Handbook* (Gilmore) — fundamentals
- *Spacecraft Power Systems* (Patel)
- *Spacecraft Life Support Systems* (Larson & Pranke) — NASA reference
- *Extraterrestrial Construction* — NASA 3D-Printed Habitat Challenge reports, or "Additive Manufacturing in Space" papers
- Structural Health Monitoring: review papers on vibration-based damage detection

**Projects:**
- Simulate a simple thermal model of a habitat (radiation+conduction) and design a PID temperature controller
- Build a power budget model for a Mars base (solar+RTG+battery) and optimize load shedding with RL
- Use a CNN to detect damage in structural vibration data (public dataset or synthetic)

#### Advanced AI for Space

**Topics:**
- Vision-Language-Action models for science reporting and task planning (RT-2, PaLM-E, Octo)
- Sim-to-real for Mars analogue environments (domain randomization, system identification)
- Fault detection and recovery with sequence models (propulsion, life support)
- Multi-agent emergent communication and planning (MARL)

**Resources:**
- RT-2, PaLM-E, Octo model papers
- NASA AEGIS system documentation
- "Multi-Agent Reinforcement Learning: Foundations and Modern Approaches" (Albrecht et al.)
- *Domain Randomization for Sim-to-Real Transfer* (Tobin et al.)

**Projects:**
1. Build a VLM that analyzes satellite/rover imagery and generates a science report or flags anomalies; fine-tune on Earth observation data
2. Train a multi-agent RL system (3 agents) to coordinate coverage of a region with communication constraints in a grid world, then transfer to Gazebo
3. Use a transformer-based anomaly detector on simulated spacecraft telemetry (NASA SMAP/MSL datasets) and benchmark against LSTM

---

### Branch C: Robotics (Manipulation, Locomotion, Drones)

**Topics:**
- Kinematics/dynamics: DH parameters, Jacobians, inverse kinematics, Newton-Euler, Lagrangian
- Whole-body control QP (e.g., using Drake or CasADi)
- Motion planning: RRT*, trajectory optimization, behavior trees, state machines
- Manipulation: grasping, force control, impedance control, imitation learning
- Legged locomotion: ZMP, capture point, MPC, RL for gait
- ROS 2, MoveIt 2, Gazebo/Ignition, MuJoCo, Isaac Sim
- SLAM: ORB-SLAM3, VINS, visual-inertial odometry
- Sim-to-real transfer, domain randomization

**Resources:**
- **Spine:** "Modern Robotics" (Lynch & Park) — free book + Coursera specialization
- ROS 2 Official Tutorials
- MoveIt 2 documentation
- MuJoCo + Gymnasium
- PX4 / ArduPilot — drone autopilot codebases
- ORB-SLAM3 GitHub
- *Behavior Trees in Robotics and AI* (Colledanchise & Ögren)
- *Introduction to Humanoid Robotics* (Kajita) — ZMP, gait generation
- *Grasping and Manipulation* (Murray, Li, Sastry)

**Projects:**
1. Build a ROS 2–based robot simulation with SLAM, navigation, and obstacle avoidance
2. Train an RL agent in MuJoCo for cube rotation with domain randomization; transfer to a real robot arm (or video demo in sim)
3. Contribute a working feature or sensor driver to PX4/ArduPilot, tested in SITL
4. Implement a whole-body QP controller for a simulated quadruped to stand and walk
5. Develop a behavior tree for a pick-and-place task integrating perception and motion

---

### Branch D: Autonomous Vehicles

**Topics:**
- Perception: 3D object detection (PointPillars, BEVFormer), sensor fusion (camera+LiDAR+radar), occupancy networks
- Prediction: behavior modeling (GNNs, transformers), trajectory prediction
- Localization: HD maps, GNSS/INS, visual localization
- Planning: behavior planning (FSM, behavior trees), motion planning (lattice, optimization), decision under uncertainty (POMDPs)
- Control: longitudinal (PID, MPC), lateral (pure pursuit, Stanley, LQR)
- Safety standards: ISO 26262 (functional safety), SOTIF (ISO 21448)
- Open-source stacks: Autoware, Apollo, openpilot, CARLA

**Resources:**
- "Self-Driving Cars" Specialization (University of Toronto, Coursera)
- MIT 6.S094: Deep Learning for Self-Driving Cars (YouTube)
- CARLA simulator
- Autoware (open-source AV stack)
- Apollo (Baidu) — open-source AV platform
- openpilot (comma.ai) — end-to-end approach
- OpenPCDet — LiDAR-based 3D object detection
- ISO 26262 overview: "ISO 26262 for Dummies" or *The Safety-Critical Systems Handbook*
- SOTIF: "The Safety of the Intended Functionality" (ISO 21448) — summary papers

**Projects:**
1. Train a LiDAR-based 3D object detector on nuScenes and run in real-time with TensorRT
2. Implement a motion planner in CARLA handling lane keeping, lane change, and intersection crossing
3. Deploy a perception pipeline (YOLO + depth) on Jetson at >15fps
4. Build a simple functional safety analysis (HAZOP) for an imaginary AV lane-keeping function

---

### Branch E: Space Science / Physics

**Topics:**
- Plasma physics: MHD, waves, instabilities, magnetic reconnection
- Solar/space weather: CMEs, flares, solar wind, Kp/Dst indices
- Ionosphere/magnetosphere modeling
- Data analysis: time-series (wavelets, Lomb-Scargle), image reconstruction, Bayesian inference
- PINNs and operator learning for plasma/fluid simulations
- Tools: SunPy, SpacePy, AstroPy, NASA CDAWeb data, SPEDAS

**Resources:**
- *Introduction to Plasma Physics and its Space Applications* (Conde, 2nd edition, 2025)
- *The Magnetic Solar System* (von Kusserow & Marsch, 2025)
- *Introduction to Plasma Physics* (Chen) — classic
- SunPy, SpacePy, AstroPy documentation
- NASA CDAWeb — real solar wind/magnetometer data
- PySPEDAS — for magnetospheric mission data

**Projects:**
1. Download real solar wind data and build a DL model to predict Kp index 1 hour ahead; benchmark against persistence and NOAA
2. Implement a PINN to solve a plasma wave equation (e.g., 1D MHD wave) and compare to finite-difference solution
3. Contribute a new data loading function for a NASA mission to SunPy or SpacePy

---

### Branch F: Infrastructure & Platform Engineering (Deep Systems)

**Topics:**
- GPU/CPU architecture internals (warps, tensor cores, memory hierarchy)
- Networking: RDMA, RoCE, NCCL, InfiniBand, high-speed interconnects
- Kubernetes GPU scheduling (NVIDIA GPU Operator, Volcano), Slurm, Ray
- Compilers: MLIR, XLA, TVM (schedules, codegen), Triton
- Storage: high-perf data pipelines (Parquet, Arrow), data versioning (DVC, Pachyderm)
- Profiling and debugging: Nsight Systems/Compute, perf, eBPF

**Resources:**
- NVIDIA-Certified Professional: AI Infrastructure (Udemy)
- "The Complete Guide to AI Infrastructure: Zero to Hero" (Udemy)
- Kubernetes + NVIDIA GPU Operator deployment guide
- Ray documentation — distributed execution engine
- TVM documentation — compiler stack, custom schedules
- MLIR documentation (mlir.llvm.org)
- XLA overview: "XLA: Optimizing Compiler for Machine Learning"
- Slurm documentation (slurm.schedmd.com) — HPC workload manager
- "Introduction to InfiniBand" (Mellanox/NVIDIA)
- DVC documentation (dvc.org)
- NCCL documentation (NVIDIA)

**Projects:**
1. Set up a multi-node Kubernetes cluster with GPU support, deploy a distributed training job via Kubeflow
2. Profile a training bottleneck (data loading, NCCL, compute) and fix it; document before/after
3. Write a custom TVM schedule for matrix multiplication on a Cortex-M; compare against hand-tuned CMSIS-NN
4. Use DVC to version a dataset and model pipeline; integrate with W&B

---

## UNIFIED LEARNING ORDER (Brutally Focused, 5 years)

1. **Foundation (12–18 months):** Core Mathematics + AI/ML Engineering Core + Embedded Basics. Get to the point where you can train a medium transformer model, quantize it, run it on a Jetson, and contribute to an open-source autonomy project (PX4/ROS 2).
2. **Embodiment & Space Introduction (18–30 months):** Add Control/Estimation Core, begin Orbital Mechanics & Attitude Control, and start building a signature project that combines learned control with a simulated rover or CubeSat. Concurrently, deepen AI into distributed training/custom kernels (Branch A).
3. **Mars & Habitat Specialization (30–48 months):** Incorporate Propulsion, Planetary Surface Autonomy, and Habitation systems (thermal/power/ISRU). Apply advanced AI: train a VLM for terrain analysis or fault detection. Contribute meaningfully to NASA cFS or an astrodynamics library. This is where you become a unique “AI for planetary exploration” engineer.
4. **Horizon (48+ months):** Choose to either go all-in on frontier AI research (publish, apply to labs) or lead autonomy in space/robotics startups (open-source, consulting, join a mission). Space physics remains an exploration side-door.

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
1. **Study closed:** I’ve consumed the spine resource and my notes are clear enough to teach the core ideas.
2. **Experiment closed:** I’ve built the toy version, intentionally broken it to observe failure modes, and fixed them.
3. **Practical work closed:** I have a public artifact (GitHub repo with clean README, merged PR, blog post with benchmarks, or video demo of hardware working) that proves applied competence.

---

## Spine Summary (If You Only Consume One Thing Per Cluster)

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