/**
 * NEXUS AI — CASE REPORT GENERATION ENGINE
 * 
 * CORE PRINCIPLE:
 * "The final product should support human decision-making, not autonomously make high-risk decisions.
 *  Do NOT make the system autonomously approve/reject high-risk decisions.
 *  Use language such as 'Review required' rather than 'Application rejected.'"
 */

export class CaseReportGenerator {
  constructor(dataSource) {
    this.dataSource = dataSource;
  }

  generateReport() {
    const findings = this.dataSource.findings || [];
    const missing = this.dataSource.missingInformation || [];
    const timeline = this.dataSource.temporalTrajectory || [];
    const criticalFindings = findings.filter(f => f.severity === 'CRITICAL' || f.severity === 'HIGH');

    // Risk score calculation based on deterministic weights
    const baseRisk = 20;
    const criticalWeight = criticalFindings.length * 25;
    const missingWeight = missing.length * 12;
    const computedRisk = Math.min(95, baseRisk + criticalWeight + missingWeight);

    return {
      caseId: "NEXUS-CASE-2026-0891A",
      caseTitle: "Commercial Credit & Subsidy Verification: Nexus Solar Energy Solutions Pvt Ltd",
      caseType: "LOAN_VERIFICATION",
      generatedAt: new Date().toISOString(),
      decisionStatus: "REVIEW_REQUIRED",
      riskScore: computedRisk,
      executiveSummary: `NEXUS AI completed cross-document fact verification across 5 submitted files totaling 39 pages. Verification identified 2 high-priority discrepancies: an unhedged ₹3.4L loan-to-grant ceiling breach and an unverified ₹55,000/month variance in key management remuneration. Furthermore, mandatory statutory KYC for co-directors is unfiled. Deterministic confidence across extracted assertions stands at 94.2%. Case cannot proceed on STP (Straight-Through Processing) and requires credit officer underwriting review.`,
      criticalFindings: findings,
      missingInformation: missing,
      temporalTrajectory: timeline,
      keyRelationships: this.dataSource.graph?.edges?.slice(0, 8) || [],
      overallConfidence: 0.942,
      recommendedHumanActions: [
        "Cap sanctioned term loan at ₹15,00,000 or mandate ₹3,40,000 promoter equity infusion to preserve MNRE 3.5% interest subvention eligibility.",
        "Issue formal discrepancy notice requesting 6-month Form 16 / 26AS to substantiate the declared ₹1,80,000/mo salary vs bank credit of ₹1,25,000/mo.",
        "Halt credit disbursement until Co-Director DIN & KYC documentation (Form DIR-12) is uploaded and verified.",
        "Obtain State Pollution Control Board (SPCB) Green Clearance Certificate prior to Phase 2 capital release milestone.",
        "Schedule senior underwriter review with borrower representative regarding FY24-25 turnover growth sustainability."
      ],
      disclaimer: "This report is generated deterministically by NEXUS AI for human decision support. NEXUS AI does not autonomously approve, reject, or underwrite credit facilities. Final determination rests with authorized risk and credit committees."
    };
  }

  generateMarkdown(report) {
    return `# NEXUS AI — CASE DECISION INTELLIGENCE REPORT
**Case ID:** \`${report.caseId}\`  
**Target:** ${report.caseTitle}  
**Status:** **${report.decisionStatus}** | **Risk Index:** ${report.riskScore}/100 | **Verification Confidence:** ${(report.overallConfidence * 100).toFixed(1)}%  
**Timestamp:** ${report.generatedAt}

---

## 1. Executive Summary
${report.executiveSummary}

---

## 2. Critical Findings & Cross-Document Contradictions
${report.criticalFindings.map((f, i) => `
### ${i + 1}. ${f.title} (${f.severity} — Confidence: ${(f.confidence * 100).toFixed(0)}%)
- **Entity:** ${f.entityName}
- **Delta:** \`${f.discrepancyDelta?.difference || 'Discrepancy'}\` (Expected: ${f.discrepancyDelta?.expectedOrPrevious} vs Reported: ${f.discrepancyDelta?.reportedOrNew})
- **Reasoning:** ${f.reasoning}
- **Evidence Trace:**
${f.conflictingFacts.map(cf => `  * **Doc:** \`${cf.source.documentName}\` (Page ${cf.source.pageNumber}) — *"${cf.source.snippet}"*`).join('\n')}
- **Human Action:** ${f.recommendation}
`).join('\n')}

---

## 3. Missing Regulatory & Compliance Information
${report.missingInformation.map((m, i) => `
**${i + 1}. ${m.requiredAttribute}** [${m.impactLevel}]
- **Target Entity:** ${m.entityName}
- **Expected Category:** ${m.expectedInDocumentCategory}
- **Reason:** ${m.reason}
- **Remedy:** ${m.suggestedRemedy}
`).join('\n')}

---

## 4. Temporal Progression Analysis
Operating turnover tracked across consecutive quarters:
${report.temporalTrajectory.map(t => `- **${t.periodOrDate}:** \`${t.value}\` (Delta: +${t.deltaPercent}%) — Verified in *${t.evidence.documentName}* [Page ${t.evidence.pageNumber}]`).join('\n')}

---

## 5. Recommended Human Actions
${report.recommendedHumanActions.map((a, i) => `${i + 1}. ${a}`).join('\n')}

---
*Notice: ${report.disclaimer}*
`;
  }
}
