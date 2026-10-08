# NEXUS AI — MEMBER 3 USER INTERFACE & EXPERIENCE GUIDE

**Author:** Member 3 (User Experience & Frontend Architect)  
**System:** NEXUS AI — Evidence-Centric Information Intelligence  
**Design Language:** Futuristic Glassmorphic Dark UI with Neon Lime Accents  

---

## 1. Visual Language & Aesthetics

- **Theme:** Ultra-dark cybernetic aesthetic (`#080a0f` base background with radial glowing ambient gradients).
- **Glassmorphism:** Multi-layered translucent panels (`backdrop-filter: blur(16px)`, `rgba(15, 19, 29, 0.72)`).
- **Accent Identity:**
  - **Neon Lime (`#ccff00`):** Core brand accent, high-priority buttons, highlighted evidence nodes, and active tab states.
  - **Emerald Green (`#10b981`):** Verified facts, passing audit thresholds, and positive trends.
  - **Crimson Rose (`#f43f5e`):** Contradiction alerts, critical severity discrepancies, and budget violations.
  - **Cyan (`#06b6d4`):** Temporal sequence nodes, document categories, and informational metrics.
  - **Amber (`#f59e0b`):** Missing regulatory information and review advisories.

---

## 2. Views & Screen Specifications

### 2.1 Header & Pipeline Visualizer (`Header.tsx`)
- Displays the brand lockup `NEXUS.AI` with glowing neon icon.
- Features the live sequence stepper:  
  `Documents → Facts → Connections → Validation → Intelligence → Decision`
- Houses real-time system status indicators (`NEXUS CORE ONLINE`) and an instant session reset trigger.
- Navigation bar with count badges (e.g., Findings `3`, Documents `5`).

### 2.2 Main Dashboard (`DashboardView.tsx`)
- **6 KPI Metric Cards:** Verified Documents (5), Extracted Facts (38), Mapped Relationships (14), Contradictions (3), Missing Info (2), Confidence (94.2%).
- **Critical Contradiction Spotlight:** Highlights the highest-severity conflict (Budget Discrepancy of ₹3.4L) with immediate one-click launch of the Evidence Inspector.
- **Recommended Decision Status Pill:** Clear `REVIEW REQUIRED` card with actionable underwriter advisories.
- **Recent Ingestion Stream:** Displays document categories, file sizes, and processing completion.

### 2.3 Documents & Ingestion Experience (`DocumentsView.tsx`)
- Multi-document drag-and-drop zone.
- Real-time processing progress banner showing stage feedback (`Extracting tabular schemas... 18s remaining, 85%`).
- Table view with categorical filtering (`ALL`, `FINANCIAL`, `GRANT`, `TAX`).
- Lifecycle status badges: `PENDING`, `PROCESSING` (animated spinner), `PROCESSED` (100% check), `FAILED`.

### 2.4 Findings & Contradictions (`FindingsView.tsx`)
- Interactive filter pills (`ALL`, `CRITICAL`, `HIGH`, `MEDIUM`) and full-text keyword search.
- Discrepancy Cards with exact delta comparison:
  - **Budget Discrepancy:** Requested ₹18.4L vs Approved Ceiling ₹15.0L (Difference: ₹3.4L).
  - **Director Remuneration Mismatch:** Declared ₹1,80,000/mo vs Bank Verified ₹1,25,000/mo (Difference: ₹55,000/mo).
  - **Audited PBT vs Tax Return:** Declared ₹15.6L vs Audited ₹17.8L (Difference: ₹2.2L).
- Missing Regulatory Documentation checklist with impact levels and explicit remedies.

### 2.5 Evidence Modal — "Why did NEXUS say this?" (`EvidenceModal.tsx`)
- Opened whenever an underwriter clicks "Inspect Evidence" or an evidence citation chip.
- Answers the fundamental audit question: *"Why did NEXUS say this?"*
- Side-by-side or stacked card breakdown of Fact 1 vs Fact 2.
- Displays Document Name, Page Number, Normalized Values, and exact highlighted quote from the document text.
- Recommends actionable underwriter verification steps.

### 2.6 Temporal Trajectory View (`TimelineView.tsx`)
- Displays chronological value shifts across quarters.
- Example: Operating Turnover progression:  
  `₹30,00,000 (Q1) → ₹35,00,000 (Q2) → ₹42,00,000 (Q3)` (+40.0% surge).
- Interactive timeline nodes with clickable audit anchors detailing the underlying source files and page numbers.

### 2.7 Knowledge & Relationship Graph (`KnowledgeGraphView.tsx`)
- Interactive SVG network diagram mapping Persons, Organizations, Projects, Documents, and Facts.
- Distinct color-coded nodes with directional relationship edges (`DIRECTOR_OF`, `EXECUTES`, `SANCTIONED_GRANT`, `REPORTS`, `CONTRADICTS`).
- Selected Node Inspector pane displaying entity metadata and connected edge list.

### 2.8 "Ask NEXUS" Natural Language Q&A (`QAView.tsx`)
- Grounded conversational interface preventing hallucinations.
- One-click suggested prompts:
  - *"What information is inconsistent?"*
  - *"What changed over time?"*
  - *"What information is missing?"*
  - *"Show evidence for the income mismatch."*
  - *"Which document contains the latest value?"*
- Interactive evidence citation chips that launch the Evidence Inspector directly.

### 2.9 Decision Intelligence Report (`ReportView.tsx`)
- Audit-ready case dossier for credit and risk committees.
- Risk Index meter (68/100) and `REVIEW REQUIRED` verdict.
- Formatted sections: Executive Summary, Critical Findings, Missing Information, Temporal Trajectory, and Recommended Human Actions.
- Instant actions: Print / Save to PDF, Download Markdown, and Copy Summary.
