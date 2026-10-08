/**
 * High-fidelity production mock data matching the reference image exactly.
 */

export const nexusData = {
  kpis: {
    documents: {
      value: 24,
      change: "+6 today",
      label: "Documents"
    },
    relationships: {
      value: 186,
      change: "+32 today",
      label: "Relationships"
    },
    conflicts: {
      value: 7,
      critical: 2,
      criticalText: "2 critical",
      label: "Conflicts"
    },
    missingData: {
      value: 4,
      critical: 1,
      criticalText: "1 critical",
      label: "Missing Data"
    }
  },

  processing: {
    progress: 78,
    activeCount: 6,
    statusText: "Processing 6 documents...",
    fileTypes: [
      { type: "PDF", count: 2, color: "#C9FF3D" },
      { type: "DOCX", count: 1, color: "#C9FF3D" },
      { type: "CSV", count: 1, color: "#C9FF3D" },
      { type: "TXT", count: 1, color: "#C9FF3D" },
      { type: "Images", count: 1, color: "#C9FF3D" }
    ],
    stages: [
      { name: "Analyzing", active: true },
      { name: "Extracting", active: true },
      { name: "Connecting", active: true },
      { name: "Validating", active: false }
    ],
    checklist: [
      { id: "c1", label: "Text Extraction", done: true },
      { id: "c2", label: "OCR Processing", done: true },
      { id: "c3", label: "Entity Recognition", done: true },
      { id: "c4", label: "Relationship Mapping", done: true },
      { id: "c5", label: "Cross-Document Analysis", done: true }
    ]
  },

  recentIntelligence: [
    {
      id: "intel-1",
      title: "Income mismatch detected",
      description: "Applicant Form vs Bank Statement",
      confidence: 94,
      timestamp: "2m ago",
      type: "critical",
      color: "#FF7777",
      evidence: {
        docA: { name: "Applicant_Form.pdf", page: 2, text: "Stated executive salary: ₹42,000 / month declared under personal income.", val: "₹42,000" },
        docB: { name: "Bank_Statement.pdf", page: 4, text: "Average recurring salary credit tagged: ₹31,500 / month across 6 months.", val: "₹31,500" },
        variance: "₹10,500 / month (33.3% variance)",
        reason: "Declared salary on loan schedule exceeds verified bank deposit history."
      }
    },
    {
      id: "intel-2",
      title: "Missing signature",
      description: "Required document not found",
      confidence: 91,
      timestamp: "8m ago",
      type: "warning",
      color: "#FFBD59",
      evidence: {
        docA: { name: "Board_Resolution.pdf", page: 1, text: "Managing Director signature section empty. Witness signature missing.", val: "Unsigned" },
        docB: { name: "Policy_Guidelines.pdf", page: 3, text: "Clause 2.1: Authorizing board resolutions must contain two verified sign-offs.", val: "Mandatory" },
        variance: "Missing Sign-Off",
        reason: "Statutory authorization document lacks requisite signatory endorsement."
      }
    },
    {
      id: "intel-3",
      title: "Deadline conflict",
      description: "Different dates found across sources",
      confidence: 87,
      timestamp: "15m ago",
      type: "warning",
      color: "#FFBD59",
      evidence: {
        docA: { name: "Grant_Application.pdf", page: 1, text: "Completion milestone date specified as 30-Nov-2026.", val: "30-Nov-2026" },
        docB: { name: "Contract_Addendum.pdf", page: 5, text: "Phase II delivery date amended to 15-Jan-2027.", val: "15-Jan-2027" },
        variance: "46 Days Discrepancy",
        reason: "Delivery timeline schedule conflict between grant proposal and vendor contract."
      }
    },
    {
      id: "intel-4",
      title: "New relationship discovered",
      description: "Vendor linked to 3 other entities",
      confidence: 82,
      timestamp: "21m ago",
      type: "success",
      color: "#79DF9B",
      evidence: {
        docA: { name: "Vendor_Ledger.pdf", page: 7, text: "Supplier 'Aura Solar Components' shares registered address with Director's secondary entity.", val: "Related Entity" },
        docB: { name: "Ministry_Filings.pdf", page: 2, text: "Common Director identified across entities #09214 and #08412.", val: "Directorship Link" },
        variance: "Entity Network Mapped",
        reason: "Automated entity resolution uncovered undisclosed vendor affiliation."
      }
    }
  ],

  documentSummary: {
    total: 24,
    processing: 6,
    breakdown: [
      { type: "PDF", count: 10 },
      { type: "DOCX", count: 6 },
      { type: "CSV", count: 4 },
      { type: "TXT", count: 2 },
      { type: "Images", count: 2 }
    ],
    latestUploads: [
      {
        id: "doc-1",
        name: "Applicant_Form.pdf",
        time: "2m ago",
        status: "Processing",
        category: "FINANCIAL",
        size: "2.4 MB",
        pages: 4
      },
      {
        id: "doc-2",
        name: "Income_Certificate.pdf",
        time: "5m ago",
        status: "Analyzed",
        category: "TAX",
        size: "1.1 MB",
        pages: 2
      },
      {
        id: "doc-3",
        name: "Bank_Statement.pdf",
        time: "8m ago",
        status: "Analyzed",
        category: "FINANCIAL",
        size: "5.8 MB",
        pages: 12
      }
    ]
  },

  knowledgeGraph: {
    centralNode: { id: "applicant", label: "Applicant", type: "primary" },
    nodes: [
      { id: "bank_acc", label: "Bank Account", icon: "Landmark", type: "secondary" },
      { id: "income", label: "Income ₹42,000", icon: "Coins", type: "value" },
      { id: "application", label: "Application", icon: "FileText", type: "document" },
      { id: "policy", label: "Policy", icon: "Shield", type: "rule" },
      { id: "bank_income", label: "Verified ₹31,500", icon: "AlertTriangle", type: "conflict" }
    ],
    edges: [
      { from: "applicant", to: "bank_acc", label: "owns" },
      { from: "applicant", to: "income", label: "declares" },
      { from: "applicant", to: "application", label: "submits" },
      { from: "applicant", to: "policy", label: "governed by" },
      { from: "income", to: "bank_income", label: "CONTRADICTS (₹10.5K Diff)", isConflict: true }
    ]
  },

  timeline: [
    {
      period: "JAN 2026",
      text: "Initial budget ₹10L",
      status: "normal",
      color: "#79DF9B",
      source: "Project_Proposal_Draft.pdf (Page 1)"
    },
    {
      period: "MAR 2026",
      text: "Budget revised ₹12L",
      status: "normal",
      color: "#79DF9B",
      source: "Board_Meeting_Minutes.pdf (Page 4)"
    },
    {
      period: "JUN 2026",
      text: "Budget revised ₹15L",
      status: "warning",
      color: "#FFBD59",
      source: "Grant_Ceiling_Cap.pdf (Page 2)"
    },
    {
      period: "OCT 2026",
      text: "New proposal ₹18.4L",
      conflict: "Conflict detected",
      status: "critical",
      color: "#FF7777",
      source: "Commercial_Loan_Application.pdf (Page 2)"
    }
  ],

  hud: {
    status: "ONLINE",
    aiMessage: `I've analyzed 6 documents.

I found 7 potential conflicts,
4 missing pieces of information,
and 186 relationships.

Would you like me to show you
the most critical findings?`,
    metrics: [
      { label: "DOCUMENTS", value: 24, pos: "top-left" },
      { label: "CONFLICTS", value: 7, pos: "top-right" },
      { label: "FACTS", value: 142, pos: "mid-left" },
      { label: "MISSING", value: 4, pos: "mid-right" },
      { label: "RELATIONSHIPS", value: 186, pos: "bottom-left" },
      { label: "CONFIDENCE", value: "94.2%", pos: "bottom-right" }
    ]
  },

  keyInsights: [
    {
      id: "ins-1",
      text: "Inconsistent income declarations",
      icon: "TrendingDown",
      detail: "Declared salary ₹42,000/mo exceeds verified bank credit ₹31,500/mo by 33.3%."
    },
    {
      id: "ins-2",
      text: "2 missing required documents",
      icon: "FileQuestion",
      detail: "Board resolution second signature & site pollution clearance certificate are unfiled."
    },
    {
      id: "ins-3",
      text: "High risk application (87%)",
      icon: "AlertOctagon",
      detail: "Deterministic risk model scores 87% risk due to unhedged budget ceiling breach."
    },
    {
      id: "ins-4",
      text: "1 new entity relationship",
      icon: "Share2",
      detail: "Primary applicant cross-identified as Director of subcontractor vendor entity."
    }
  ]
};
