# 🛰️ NEXUS FORENSIC — Multi-Agent Document Intelligence Platform
An enterprise-grade, multi-agent AI forensic document analysis platform designed to process heterogeneous document streams, perform multi-stage cognitive reasoning, detect cross-document contradictions, construct interactive entity knowledge graphs, and generate audit-ready forensic reports.
---
## 🌟 Key Features
- **Multi-Agent Orchestration Architecture:**
  - **Member 1 (Extraction & Ingestion Engine):** OCR, multi-format document parser (PDF, DOCX, CSV, JSON, TXT, Images), metadata extractor, and vector chunking.
  - **Member 2 (Cognitive Reasoning Engine):** Rule-based heuristics + LLM-backed cross-document contradiction detection and fact-checking.
  - **Member 3 (Master Orchestrator):** Multi-agent LangGraph workflow manager, verification pipelines, timeline consolidation, and dynamic report generation.
- **Interactive Forensic UI / Dashboard:**
  - **Live Multi-Entity Knowledge Graph:** Dynamic graph mapping shared relationships, batch connections, and entity-to-document traces.
  - **Chronological Audit Timeline:** Unified timestamped event flow across batches and document entities.
  - **Evidence Drawer & Direct File Inspector:** Real-time preview of processed documents with forensic confidence scores and metadata tags.
  - **Forensic Report Generator:** 1-Page minimal executive summaries & detailed PDF forensic briefs with voice narration.
  - **Voice-Enabled Terminal:** Integrated Speech-to-Text (Voice Query) & Text-to-Speech (Voice Assistant) in the terminal interface.
- **Privacy-First Local AI Support:**
  - Full local inference compatibility powered by **Ollama (`llama3.2` / `mistral` / `phi3`)** alongside optional cloud providers.
---
## 🏗️ System Architecture

  
                         ┌───────────────────────────┐
                           │   Vite + React Frontend   │
                           │    (Port 3000 / Web UI)   │
                           └─────────────┬─────────────┘
                                         │ REST / SSE / WebSockets
                                         ▼
                           ┌───────────────────────────┐
                           │ Master Orchestrator (Node)│
                           │        (Port 5001)        │
                           └───────┬───────────┬───────┘
                                   │           │
        ┌──────────────────────────┘           └──────────────────────────┐
        ▼                                                                 ▼

  

┌───────────────────────────┐                                     ┌───────────────────────────┐
│ Member 1: Parser & Ingest │                                     │ Member 2: Reasoning Engine│
│   (Extraction Pipeline)   │                                     │ (Contradiction / Audit)   │
│        (Port 5001)        │                                     │        (Port 3002)        │
└───────────┬───────────────┘                                     └───────────┬───────────────┘
│                                                                 │
└──────────────────────────┬──────────────────────────────────────┘
▼
┌───────────────────────────────┐
│      Local Ollama LLM /       │
│    Vector Embedding Engine    │
│          (Port 11434)         │
└───────────────────────────────┘


  
---
## 🚀 Quick Start & Installation
### Prerequisites
- **Node.js**: v18.0+ or v20.0+
- **npm** or **pnpm**
- **Git**
- *(Optional for offline AI)*: [Ollama](https://ollama.com/) with `llama3.2` pulled (`ollama pull llama3.2`)
---
### 1. Clone the Repository
```bash
git clone https://github.com/Siddharth186/team-project.git
cd team-project

2. Install Dependencies

bash
# Root & Orchestrator dependencies
npm install
npm --prefix orchestrator install
# Frontend dependencies
npm --prefix frontend install


3. Environment Configuration

Create a .env file in the project root (or inside orchestrator/ and frontend/ as needed):
  
env
# Server Configurations
PORT=5001
ORCHESTRATOR_PORT=5001
MEMBER2_PORT=3002
FRONTEND_PORT=3000
# AI / LLM Configuration
USE_LOCAL_LLM=true
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3.2
# Optional Cloud API Fallback
OPENAI_API_KEY=your_openai_api_key_here

  
4. Running the Platform

You can run each service in separate terminal windows:
 
Terminal 1: Member 2 Reasoning Engine
 
bash
node --experimental-strip-types src/index.ts

Terminal 2: Orchestrator Server
 
bash
node orchestrator/server.js
  
Terminal 3: Frontend Dashboard

bash
npm --prefix frontend run dev
 
Terminal 4 (Optional): Local Ollama Service

bash
ollama serve

Access the platform in your browser at: http://localhost:3000

 
📂 Project Structure

  
team-project/
├── frontend/                     # React + TypeScript + Vite UI
│   ├── src/
│   │   ├── components/
│   │   │   ├── chat/             # Terminal, Voice I/O
│   │   │   ├── dashboard/        # Intelligence feeds, Document processors
│   │   │   ├── layout/           # Navbar, TopBar, Live Clock
│   │   │   └── modals/           # Knowledge Graph, Timeline, Evidence, Reports
│   │   ├── services/             # REST & WebSocket API clients
│   │   └── types/                # Forensic & Graph TypeScript interfaces
│   └── package.json
├── orchestrator/                 # Multi-Agent Workflow Coordinator
│   ├── agents/                   # Orchestrator, Reasoning, Research & Verifier agents
│   ├── graph/                    # Cognitive state machine pipelines
│   ├── services/                 # Vector service, Ollama bridge, Report generator
│   └── server.js                 # Primary backend API
├── src/                          # Member 2 Contradiction & Heuristics engine
├── scripts/                      # System verification and load-testing scripts
├── .gitignore
└── README.md

  
🧪 Testing & Verification

Run the automated test suites to verify system pipelines:
 
bash
# Test multi-agent local system
node scripts/test-local-multi-agent-system.js
# Verify the 12-stage cognitive pipeline
node scripts/verify-12-stages.js
# Run master requirement checks
node scripts/test-master-requirements.js

🛡️ License

This project is licensed under the MIT License. See the LICENSE file for details.
