/**
 * High-fidelity Loan & Grant Verification Case Dataset
 * Demonstrates the full NEXUS AI intelligence pipeline:
 * Documents -> Facts -> Connections -> Validation -> Intelligence -> Decision
 */

export const mockDocuments = [
  {
    id: "doc-1",
    name: "Loan_Application_Form_NexusSolar.pdf",
    fileType: "pdf",
    fileSize: 2450100,
    totalPages: 4,
    uploadedAt: "2026-03-24T10:15:00Z",
    status: "PROCESSED",
    processingProgress: 100,
    documentCategory: "FINANCIAL",
  },
  {
    id: "doc-2",
    name: "Grant_Sanction_Order_MNRE_2025.pdf",
    fileType: "pdf",
    fileSize: 1120400,
    totalPages: 2,
    uploadedAt: "2026-03-24T10:15:30Z",
    status: "PROCESSED",
    processingProgress: 100,
    documentCategory: "GRANT",
  },
  {
    id: "doc-3",
    name: "Bank_Statement_HDFC_Q3_Q4_2025.pdf",
    fileType: "pdf",
    fileSize: 5890200,
    totalPages: 12,
    uploadedAt: "2026-03-24T10:16:00Z",
    status: "PROCESSED",
    processingProgress: 100,
    documentCategory: "FINANCIAL",
  },
  {
    id: "doc-4",
    name: "Audited_Financial_Statement_FY24_25.pdf",
    fileType: "pdf",
    fileSize: 8420000,
    totalPages: 18,
    uploadedAt: "2026-03-24T10:16:45Z",
    status: "PROCESSED",
    processingProgress: 100,
    documentCategory: "FINANCIAL",
  },
  {
    id: "doc-5",
    name: "ITR_V_Assessment_Year_2025_26.pdf",
    fileType: "pdf",
    fileSize: 980300,
    totalPages: 3,
    uploadedAt: "2026-03-24T10:17:15Z",
    status: "PROCESSED",
    processingProgress: 100,
    documentCategory: "TAX",
  }
];

export const mockEntities = [
  {
    id: "ent-1",
    name: "Nexus Solar Energy Solutions Pvt Ltd",
    type: "ORGANIZATION",
    aliases: ["Nexus Solar", "NSESPL", "Applicant Company"],
    description: "Renewable energy microgrid developer founded in 2021",
    mentionCount: 38,
    documentsPresent: ["doc-1", "doc-2", "doc-3", "doc-4", "doc-5"]
  },
  {
    id: "ent-2",
    name: "Arjun Mehta",
    type: "PERSON",
    aliases: ["A. Mehta", "Managing Director Mehta"],
    description: "Founder & Managing Director (DIN: 08924156)",
    mentionCount: 24,
    documentsPresent: ["doc-1", "doc-3", "doc-5"]
  },
  {
    id: "ent-3",
    name: "Project Alpha (Microgrid Phase 2)",
    type: "PROJECT",
    aliases: ["Project Alpha", "Solar Microgrid Phase II"],
    description: "500kW rooftop & hybrid storage microgrid installation",
    mentionCount: 19,
    documentsPresent: ["doc-1", "doc-2", "doc-4"]
  },
  {
    id: "ent-4",
    name: "Ministry of New & Renewable Energy (MNRE)",
    type: "GOVERNMENT_BODY",
    aliases: ["MNRE", "Central Sanctioning Authority"],
    description: "Government subsidy sanctioning department",
    mentionCount: 11,
    documentsPresent: ["doc-2"]
  },
  {
    id: "ent-5",
    name: "HDFC Bank - Commercial Credit Wing",
    type: "FINANCIAL_ACCOUNT",
    aliases: ["HDFC Bank", "Account #50200084920192"],
    description: "Primary operational current account bank",
    mentionCount: 15,
    documentsPresent: ["doc-1", "doc-3"]
  },
  {
    id: "ent-6",
    name: "R.K. & Associates Chartered Accountants",
    type: "ORGANIZATION",
    aliases: ["R.K. & Associates", "Statutory Auditor"],
    description: "Independent statutory auditing firm (FRN: 012492N)",
    mentionCount: 8,
    documentsPresent: ["doc-4"]
  }
];

export const mockFacts = [
  {
    id: "fact-1",
    entityId: "ent-3",
    entityName: "Project Alpha",
    entityType: "PROJECT",
    attribute: "Requested Loan Amount",
    value: "₹18,40,000",
    normalizedValue: 1840000,
    unit: "INR",
    timestamp: "2026-01-12",
    context: "Section 3.2: Capital Outlay & Loan Requirement Schedule",
    source: {
      documentId: "doc-1",
      documentName: "Loan_Application_Form_NexusSolar.pdf",
      pageNumber: 2,
      snippet: "The borrower requests a commercial term loan facility of INR 18,40,000 (Rupees Eighteen Lakh Forty Thousand only) towards procurement of specialized hybrid solar inverters for Project Alpha.",
      extractedAt: "2026-03-24T10:15:02Z",
      highlightCoordinates: { top: 340, left: 120, width: 480, height: 45 }
    },
    confidence: 0.98,
    extractedBy: "KEY_VALUE_NORMALIZER"
  },
  {
    id: "fact-2",
    entityId: "ent-3",
    entityName: "Project Alpha",
    entityType: "PROJECT",
    attribute: "Approved Subsidized Ceiling",
    value: "₹15,00,000",
    normalizedValue: 1500000,
    unit: "INR",
    timestamp: "2025-11-05",
    context: "Sanction Clause 4: Maximum Permissible Borrowing Limit",
    source: {
      documentId: "doc-2",
      documentName: "Grant_Sanction_Order_MNRE_2025.pdf",
      pageNumber: 1,
      snippet: "Sanction is hereby accorded for Project Alpha subject to an overall eligible debt cap not exceeding INR 15,00,000 (Rupees Fifteen Lakhs only). Any borrowing beyond this threshold invalidates the interest subvention.",
      extractedAt: "2026-03-24T10:15:32Z",
      highlightCoordinates: { top: 210, left: 95, width: 510, height: 50 }
    },
    confidence: 0.96,
    extractedBy: "TEXT_EXTRACTOR"
  },
  {
    id: "fact-3",
    entityId: "ent-2",
    entityName: "Arjun Mehta",
    entityType: "PERSON",
    attribute: "Reported Monthly Salary",
    value: "₹1,80,000",
    normalizedValue: 180000,
    unit: "INR/month",
    timestamp: "2026-01-12",
    context: "Section 1.4: Key Management Remuneration declaration",
    source: {
      documentId: "doc-1",
      documentName: "Loan_Application_Form_NexusSolar.pdf",
      pageNumber: 3,
      snippet: "Managing Director remuneration drawn by Mr. Arjun Mehta is declared at INR 1,80,000 per month as approved by Board Resolution dated 14/04/2024.",
      extractedAt: "2026-03-24T10:15:05Z",
      highlightCoordinates: { top: 480, left: 110, width: 470, height: 40 }
    },
    confidence: 0.97,
    extractedBy: "KEY_VALUE_NORMALIZER"
  },
  {
    id: "fact-4",
    entityId: "ent-2",
    entityName: "Arjun Mehta",
    entityType: "PERSON",
    attribute: "Verified Average Bank Credit",
    value: "₹1,25,000",
    normalizedValue: 125000,
    unit: "INR/month",
    timestamp: "2025-12-31",
    context: "Monthly Salary Inflow Analysis (HDFC Current/Salary Account)",
    source: {
      documentId: "doc-3",
      documentName: "Bank_Statement_HDFC_Q3_Q4_2025.pdf",
      pageNumber: 8,
      snippet: "Recurring monthly credit tagged 'DIR REMUNERATION - A MEHTA' recorded at INR 1,25,000 on 30-Sep, 31-Oct, 29-Nov, and 31-Dec 2025.",
      extractedAt: "2026-03-24T10:16:08Z",
      highlightCoordinates: { top: 190, left: 105, width: 520, height: 42 }
    },
    confidence: 0.99,
    extractedBy: "TABLE_PARSER"
  },
  {
    id: "fact-5",
    entityId: "ent-1",
    entityName: "Nexus Solar Energy Solutions Pvt Ltd",
    entityType: "ORGANIZATION",
    attribute: "Q1 FY25 Turnover",
    value: "₹30,00,000",
    normalizedValue: 3000000,
    unit: "INR",
    timestamp: "2024-06-30",
    context: "Quarterly Revenue Breakup - Note 14",
    source: {
      documentId: "doc-4",
      documentName: "Audited_Financial_Statement_FY24_25.pdf",
      pageNumber: 4,
      snippet: "Quarter ended 30 June 2024 (Q1) gross operating revenue stood at INR 30.00 Lakhs against previous year comparative of INR 22.50 Lakhs.",
      extractedAt: "2026-03-24T10:16:50Z",
      highlightCoordinates: { top: 310, left: 80, width: 530, height: 38 }
    },
    confidence: 0.95,
    extractedBy: "TABLE_PARSER"
  },
  {
    id: "fact-6",
    entityId: "ent-1",
    entityName: "Nexus Solar Energy Solutions Pvt Ltd",
    entityType: "ORGANIZATION",
    attribute: "Q2 FY25 Turnover",
    value: "₹35,00,000",
    normalizedValue: 3500000,
    unit: "INR",
    timestamp: "2024-09-30",
    context: "Quarterly Revenue Breakup - Note 14",
    source: {
      documentId: "doc-4",
      documentName: "Audited_Financial_Statement_FY24_25.pdf",
      pageNumber: 4,
      snippet: "Quarter ended 30 September 2024 (Q2) gross operating revenue expanded to INR 35.00 Lakhs following commercial commissioning of Sector 4 microgrid.",
      extractedAt: "2026-03-24T10:16:50Z",
      highlightCoordinates: { top: 360, left: 80, width: 530, height: 38 }
    },
    confidence: 0.95,
    extractedBy: "TABLE_PARSER"
  },
  {
    id: "fact-7",
    entityId: "ent-1",
    entityName: "Nexus Solar Energy Solutions Pvt Ltd",
    entityType: "ORGANIZATION",
    attribute: "Q3 FY25 Turnover",
    value: "₹42,00,000",
    normalizedValue: 4200000,
    unit: "INR",
    timestamp: "2024-12-31",
    context: "Quarterly Inflow Summary & GST Recalculation",
    source: {
      documentId: "doc-3",
      documentName: "Bank_Statement_HDFC_Q3_Q4_2025.pdf",
      pageNumber: 11,
      snippet: "Quarter ended 31 December 2024 (Q3) cumulative commercial collections deposited into primary account totaled INR 42,18,400 (normalized to INR 42.00 Lakhs net turnover).",
      extractedAt: "2026-03-24T10:16:15Z",
      highlightCoordinates: { top: 410, left: 90, width: 540, height: 40 }
    },
    confidence: 0.93,
    extractedBy: "TABLE_PARSER"
  },
  {
    id: "fact-8",
    entityId: "ent-1",
    entityName: "Nexus Solar Energy Solutions Pvt Ltd",
    entityType: "ORGANIZATION",
    attribute: "ITR Declared Gross Total Income",
    value: "₹15,60,000",
    normalizedValue: 1560000,
    unit: "INR",
    timestamp: "2025-07-28",
    context: "ITR-V Part B-TI: Computation of Total Income",
    source: {
      documentId: "doc-5",
      documentName: "ITR_V_Assessment_Year_2025_26.pdf",
      pageNumber: 1,
      snippet: "Gross Total Income declared in e-filed return: INR 15,60,000 under section 139(1) of the Income Tax Act.",
      extractedAt: "2026-03-24T10:17:18Z",
      highlightCoordinates: { top: 270, left: 115, width: 490, height: 35 }
    },
    confidence: 0.99,
    extractedBy: "KEY_VALUE_NORMALIZER"
  },
  {
    id: "fact-9",
    entityId: "ent-1",
    entityName: "Nexus Solar Energy Solutions Pvt Ltd",
    entityType: "ORGANIZATION",
    attribute: "Audited Profit Before Tax (PBT)",
    value: "₹17,80,000",
    normalizedValue: 1780000,
    unit: "INR",
    timestamp: "2025-08-15",
    context: "Statement of Profit and Loss (Schedule III)",
    source: {
      documentId: "doc-4",
      documentName: "Audited_Financial_Statement_FY24_25.pdf",
      pageNumber: 6,
      snippet: "Profit Before Tax for the fiscal period ended 31 March 2025 certified by independent auditor at INR 17,80,450.",
      extractedAt: "2026-03-24T10:16:55Z",
      highlightCoordinates: { top: 520, left: 90, width: 510, height: 40 }
    },
    confidence: 0.94,
    extractedBy: "TABLE_PARSER"
  }
];

export const mockFindings = [
  {
    id: "find-1",
    category: "BUDGET_DISCREPANCY",
    severity: "CRITICAL",
    title: "Budget discrepancy detected",
    summary: "Project Alpha requested loan exceeds the sanctioned subsidy ceiling by ₹3.4L, threatening subsidy revocation.",
    entityName: "Project Alpha (Nexus Solar)",
    conflictingFacts: [
      mockFacts[0], // Requested 18.4L
      mockFacts[1]  // Approved 15L
    ],
    discrepancyDelta: {
      expectedOrPrevious: "₹15,00,000 (Approved Grant Cap)",
      reportedOrNew: "₹18,40,000 (Loan Requested)",
      difference: "₹3,40,000",
      differencePercent: 22.7
    },
    reasoning: "The loan application seeks ₹18.4L for Project Alpha, whereas MNRE Grant Sanction Order Section 4 explicitly caps eligible borrowing at ₹15.0L. Borrowing above ₹15L breaches clause 4.2 and disqualifies the 3.5% interest subvention subsidy.",
    confidence: 0.94,
    recommendation: "Review required: Require applicant to align requested facility within the ₹15.0L ceiling or furnish supplemental equity co-funding letter.",
    detectedAt: "2026-03-24T10:18:00Z"
  },
  {
    id: "find-2",
    category: "INCOME_MISMATCH",
    severity: "HIGH",
    title: "Key Director Remuneration Mismatch",
    summary: "Managing Director stated monthly income in application form is ₹55,000 higher than verified bank deposits.",
    entityName: "Arjun Mehta",
    conflictingFacts: [
      mockFacts[2], // Stated 1.8L
      mockFacts[3]  // Bank credit 1.25L
    ],
    discrepancyDelta: {
      expectedOrPrevious: "₹1,25,000 / mo (Bank Verified)",
      reportedOrNew: "₹1,80,000 / mo (Application Stated)",
      difference: "₹55,000 / mo",
      differencePercent: 44.0
    },
    reasoning: "Loan Application Page 3 declares Managing Director Arjun Mehta draws ₹1,80,000/month. However, HDFC Current/Salary bank statement (Q3-Q4 2025) reflects actual recurring salary credits of only ₹1,25,000/month across September through December 2025.",
    confidence: 0.96,
    recommendation: "Review required: Obtain 6-month Form 16 / Form 26AS tax credit ledger to verify whether the ₹55,000 difference comprises deferred incentives or undisclosed deductions.",
    detectedAt: "2026-03-24T10:18:05Z"
  },
  {
    id: "find-3",
    category: "VALUE_MISMATCH",
    severity: "MEDIUM",
    title: "Tax Return vs Audited Financials Divergence",
    summary: "ITR-V declared income of ₹15.6L diverges from audited Profit Before Tax of ₹17.8L by ₹2.2L.",
    entityName: "Nexus Solar Energy Solutions Pvt Ltd",
    conflictingFacts: [
      mockFacts[7], // ITR 15.6L
      mockFacts[8]  // PBT 17.8L
    ],
    discrepancyDelta: {
      expectedOrPrevious: "₹17,80,000 (Audited PBT)",
      reportedOrNew: "₹15,60,000 (ITR-V Gross)",
      difference: "₹2,20,000",
      differencePercent: 12.4
    },
    reasoning: "ITR-V Acknowledgement reports Gross Total Income of ₹15,60,000, while Audited Financial Statements note Profit Before Tax of ₹17,80,450. Difference likely represents depreciation timing under Section 32 vs Companies Act.",
    confidence: 0.91,
    recommendation: "Review required: Inspect Computation of Total Income sheet from statutory auditor R.K. & Associates to confirm tax depreciation adjustments.",
    detectedAt: "2026-03-24T10:18:10Z"
  }
];

export const mockMissingInformation = [
  {
    id: "miss-1",
    entityName: "Corporate Guarantor",
    requiredAttribute: "Director Identification Number (DIN) & KYC of Co-Signatory",
    expectedInDocumentCategory: "IDENTITY / LEGAL",
    impactLevel: "CRITICAL",
    reason: "Under commercial MSME lending guidelines for exposures > ₹10 Lakhs, personal guarantee documentation for all >20% equity shareholders is mandatory. Second director KYC is unfiled.",
    suggestedRemedy: "Request Form DIR-12 and Aadhaar/PAN verification for second director Priya Sharma before credit committee submission."
  },
  {
    id: "miss-2",
    entityName: "Project Alpha Site",
    requiredAttribute: "State Pollution Control Board (SPCB) Green Clearance Certificate",
    expectedInDocumentCategory: "GRANT / STATUTORY",
    impactLevel: "WARNING",
    reason: "MNRE Sanction Order Clause 7 stipulates disbursement is contingent upon SPCB site NOC submission prior to project tranche drawdown.",
    suggestedRemedy: "Issue conditional sanctions milestone requiring SPCB clearance submission within 30 days of loan agreement execution."
  }
];

export const mockTemporalTrajectory = [
  {
    id: "temp-1",
    entityName: "Nexus Solar Energy Solutions Pvt Ltd",
    attribute: "Operating Turnover",
    periodOrDate: "Q1 FY25 (Jun 2024)",
    isoDate: "2024-06-30",
    value: "₹30,00,000",
    previousValue: "₹22,50,000",
    deltaPercent: 33.3,
    evidence: {
      documentId: "doc-4",
      documentName: "Audited_Financial_Statement_FY24_25.pdf",
      pageNumber: 4,
      snippet: "Quarter ended 30 June 2024 (Q1) gross operating revenue stood at INR 30.00 Lakhs against previous year comparative of INR 22.50 Lakhs.",
      extractedAt: "2026-03-24T10:16:50Z"
    }
  },
  {
    id: "temp-2",
    entityName: "Nexus Solar Energy Solutions Pvt Ltd",
    attribute: "Operating Turnover",
    periodOrDate: "Q2 FY25 (Sep 2024)",
    isoDate: "2024-09-30",
    value: "₹35,00,000",
    previousValue: "₹30,00,000",
    deltaPercent: 16.7,
    evidence: {
      documentId: "doc-4",
      documentName: "Audited_Financial_Statement_FY24_25.pdf",
      pageNumber: 4,
      snippet: "Quarter ended 30 September 2024 (Q2) gross operating revenue expanded to INR 35.00 Lakhs following commercial commissioning of Sector 4 microgrid.",
      extractedAt: "2026-03-24T10:16:50Z"
    }
  },
  {
    id: "temp-3",
    entityName: "Nexus Solar Energy Solutions Pvt Ltd",
    attribute: "Operating Turnover",
    periodOrDate: "Q3 FY25 (Dec 2024)",
    isoDate: "2024-12-31",
    value: "₹42,00,000",
    previousValue: "₹35,00,000",
    deltaPercent: 20.0,
    evidence: {
      documentId: "doc-3",
      documentName: "Bank_Statement_HDFC_Q3_Q4_2025.pdf",
      pageNumber: 11,
      snippet: "Quarter ended 31 December 2024 (Q3) cumulative commercial collections deposited into primary account totaled INR 42,18,400 (normalized to INR 42.00 Lakhs net turnover).",
      extractedAt: "2026-03-24T10:16:15Z"
    }
  }
];

export const mockRelationshipGraph = {
  nodes: [
    { id: "ent-1", label: "Nexus Solar Energy Solutions", type: "ORGANIZATION", category: "entity" },
    { id: "ent-2", label: "Arjun Mehta (Director)", type: "PERSON", category: "entity" },
    { id: "ent-3", label: "Project Alpha (Microgrid)", type: "PROJECT", category: "entity" },
    { id: "ent-4", label: "MNRE (Sanctioning Authority)", type: "GOVERNMENT_BODY", category: "entity" },
    { id: "ent-5", label: "HDFC Commercial Account", type: "FINANCIAL_ACCOUNT", category: "entity" },
    { id: "ent-6", label: "R.K. & Associates (Auditor)", type: "ORGANIZATION", category: "entity" },
    { id: "doc-1", label: "Loan Application Form", type: "DOCUMENT", category: "document" },
    { id: "doc-2", label: "Grant Sanction Order", type: "DOCUMENT", category: "document" },
    { id: "doc-3", label: "HDFC Bank Statement", type: "DOCUMENT", category: "document" },
    { id: "doc-4", label: "Audited Financials FY25", type: "DOCUMENT", category: "document" },
    { id: "doc-5", label: "ITR-V Assessment Ack", type: "DOCUMENT", category: "document" },
    { id: "fact-1", label: "Req. Loan: ₹18.4L", type: "FACT", category: "fact" },
    { id: "fact-2", label: "Cap: ₹15.0L", type: "FACT", category: "fact" },
    { id: "fact-3", label: "Claimed Sal: ₹1.8L", type: "FACT", category: "fact" },
    { id: "fact-4", label: "Bank Sal: ₹1.25L", type: "FACT", category: "fact" }
  ],
  edges: [
    { id: "e1", source: "ent-2", target: "ent-1", label: "DIRECTOR_OF", confidence: 0.99 },
    { id: "e2", source: "ent-1", target: "ent-3", label: "EXECUTES", confidence: 0.98 },
    { id: "e3", source: "ent-4", target: "ent-3", label: "SANCTIONED_GRANT", confidence: 0.97 },
    { id: "e4", source: "ent-1", target: "ent-5", label: "BANK_ACCOUNT_OF", confidence: 0.99 },
    { id: "e5", source: "ent-6", target: "ent-1", label: "AUDITED_BY", confidence: 0.96 },
    { id: "e6", source: "doc-1", target: "fact-1", label: "REPORTS", confidence: 0.98 },
    { id: "e7", source: "doc-2", target: "fact-2", label: "STIPULATES", confidence: 0.96 },
    { id: "e8", source: "doc-1", target: "fact-3", label: "CLAIMS", confidence: 0.97 },
    { id: "e9", source: "doc-3", target: "fact-4", label: "VERIFIES", confidence: 0.99 },
    { id: "e10", source: "fact-1", target: "fact-2", label: "CONTRADICTS (₹3.4L Exceeded)", confidence: 0.94 },
    { id: "e11", source: "fact-3", target: "fact-4", label: "CONTRADICTS (₹55K Shortfall)", confidence: 0.96 }
  ]
};

export const mockSystemMetrics = {
  totalDocuments: 5,
  processedDocuments: 5,
  totalFacts: 38,
  totalEntities: 6,
  totalRelationships: 14,
  totalConflicts: 3,
  criticalConflicts: 1,
  missingDataCount: 2,
  evidenceCount: 48,
  averageConfidence: 0.942,
  systemStatus: "ONLINE"
};
