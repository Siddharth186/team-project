/**
 * NEXUS AI — Realistic Loan Application Verification Case Study Demo
 *
 * Demonstrates:
 *   1. Multi-document ingestion
 *   2. Entity resolution ("Mr. Ramesh Kumar", "R. Kumar", "Ramesh K.", "R KUMAR") → PERSON_001
 *   3. Fact linking across documents
 *   4. Contradiction detection (Stated income ₹42,000 vs Bank salary credit ₹31,500)
 *   5. Cross-document consistency verification (Salary Slip ₹31,500 == Bank Statement ₹31,500)
 *   6. Temporal progression timeline (2023 ₹30K → Jan 2024 ₹30K → Mar 2024 ₹31.5K)
 *   7. Missing information audit (Address, Signature)
 *   8. Traceable evidence down to Document → Page → Source text
 *   9. Multi-signal confidence calculation
 *  10. Human-understandable findings with actionable underwriting recommendations
 */

import type { IngestedCasePayload } from './models/types.ts';
import { IntelligencePipeline } from './intelligence_pipeline.ts';

export const LOAN_CASE_STUDY: IngestedCasePayload = {
  case_id: 'CASE-LOAN-2026-8841',
  case_type: 'LOAN_VERIFICATION',
  documents: [
    {
      document_id: 'DOC_APP_01',
      document_name: 'LoanApplication.pdf',
      doc_type: 'LOAN_APPLICATION',
      page_count: 3,
      upload_timestamp: '2026-10-01T10:00:00Z',
    },
    {
      document_id: 'DOC_BANK_01',
      document_name: 'BankStatement_Q1_2024.pdf',
      doc_type: 'BANK_STATEMENT',
      page_count: 5,
      upload_timestamp: '2026-10-01T10:02:00Z',
    },
    {
      document_id: 'DOC_PAYSLIP_01',
      document_name: 'SalarySlip_March2024.pdf',
      doc_type: 'SALARY_SLIP',
      page_count: 1,
      upload_timestamp: '2026-10-01T10:05:00Z',
    },
    {
      document_id: 'DOC_ITR_01',
      document_name: 'ITR_Acknowledgement_FY2023.pdf',
      doc_type: 'TAX_RETURN',
      page_count: 2,
      upload_timestamp: '2026-10-01T10:06:00Z',
    },
  ],
  raw_entities: [
    {
      mention_id: 'ENT_01',
      raw_name: 'Mr. Ramesh Kumar',
      entity_type: 'PERSON',
      identifiers: { pan: 'ABCDE1234F', phone: '+91-98765-43210' },
      evidence: {
        document_id: 'DOC_APP_01',
        document_name: 'LoanApplication.pdf',
        page_number: 1,
        source_text: 'Applicant Full Name: Mr. Ramesh Kumar, PAN: ABCDE1234F',
        extraction_confidence: 0.98,
      },
    },
    {
      mention_id: 'ENT_02',
      raw_name: 'R. Kumar',
      entity_type: 'PERSON',
      identifiers: { pan: 'ABCDE1234F', account_number: '987654321098' },
      evidence: {
        document_id: 'DOC_BANK_01',
        document_name: 'BankStatement_Q1_2024.pdf',
        page_number: 1,
        source_text: 'Account Title: R. Kumar | PAN: ABCDE1234F | A/C: 987654321098',
        extraction_confidence: 0.95,
      },
    },
    {
      mention_id: 'ENT_03',
      raw_name: 'Ramesh K.',
      entity_type: 'PERSON',
      identifiers: {},
      evidence: {
        document_id: 'DOC_PAYSLIP_01',
        document_name: 'SalarySlip_March2024.pdf',
        page_number: 1,
        source_text: 'Employee Name: Ramesh K. | Dept: Engineering',
        extraction_confidence: 0.94,
      },
    },
    {
      mention_id: 'ENT_04',
      raw_name: 'R KUMAR',
      entity_type: 'PERSON',
      identifiers: { pan: 'ABCDE1234F' },
      evidence: {
        document_id: 'DOC_ITR_01',
        document_name: 'ITR_Acknowledgement_FY2023.pdf',
        page_number: 1,
        source_text: 'Assessee: R KUMAR, Permanent Account Number: ABCDE1234F',
        extraction_confidence: 0.97,
      },
    },
  ],
  raw_facts: [
    // Identity facts
    {
      fact_id: 'FACT_01',
      entity_mention_id: 'ENT_01',
      attribute: 'date_of_birth',
      raw_value: '15/04/1985',
      raw_time: '1985-04-15',
      context: 'Self-declared date of birth on loan application',
      evidence: {
        document_id: 'DOC_APP_01',
        document_name: 'LoanApplication.pdf',
        page_number: 1,
        source_text: 'Date of Birth: 15/04/1985',
        extraction_confidence: 0.96,
      },
    },
    {
      fact_id: 'FACT_02',
      entity_mention_id: 'ENT_01',
      attribute: 'pan_number',
      raw_value: 'ABCDE1234F',
      evidence: {
        document_id: 'DOC_APP_01',
        document_name: 'LoanApplication.pdf',
        page_number: 1,
        source_text: 'PAN: ABCDE1234F',
        extraction_confidence: 0.99,
      },
    },
    {
      fact_id: 'FACT_03',
      entity_mention_id: 'ENT_02',
      attribute: 'pan_number',
      raw_value: 'ABCDE1234F',
      evidence: {
        document_id: 'DOC_BANK_01',
        document_name: 'BankStatement_Q1_2024.pdf',
        page_number: 1,
        source_text: 'PAN Linked: ABCDE1234F',
        extraction_confidence: 0.97,
      },
    },

    // Loan amount requested
    {
      fact_id: 'FACT_04',
      entity_mention_id: 'ENT_01',
      attribute: 'loan_amount_requested',
      raw_value: '₹15 Lakh',
      raw_time: '2024-03-25',
      context: 'Application loan amount field',
      evidence: {
        document_id: 'DOC_APP_01',
        document_name: 'LoanApplication.pdf',
        page_number: 1,
        source_text: 'Loan Amount Requested: ₹15 Lakh (Rs. 15,00,000)',
        extraction_confidence: 0.98,
      },
    },

    // Employment
    {
      fact_id: 'FACT_05',
      entity_mention_id: 'ENT_01',
      attribute: 'employer_name',
      raw_value: 'Tech Innovations Pvt Ltd',
      context: 'Current employer on application form',
      evidence: {
        document_id: 'DOC_APP_01',
        document_name: 'LoanApplication.pdf',
        page_number: 2,
        source_text: 'Current Employer: Tech Innovations Pvt Ltd',
        extraction_confidence: 0.95,
      },
    },
    {
      fact_id: 'FACT_06',
      entity_mention_id: 'ENT_03',
      attribute: 'employer_name',
      raw_value: 'Tech Innovations Pvt Ltd',
      context: 'Company heading on monthly payslip',
      evidence: {
        document_id: 'DOC_PAYSLIP_01',
        document_name: 'SalarySlip_March2024.pdf',
        page_number: 1,
        source_text: 'Tech Innovations Pvt Ltd — Salary Statement March 2024',
        extraction_confidence: 0.97,
      },
    },

    // Income Facts: Direct contradiction at application time!
    {
      fact_id: 'FACT_07',
      entity_mention_id: 'ENT_01',
      attribute: 'monthly_income',
      raw_value: '₹42,000',
      raw_time: 'March 2024',
      context: 'Self-declared monthly income in loan application form',
      evidence: {
        document_id: 'DOC_APP_01',
        document_name: 'LoanApplication.pdf',
        page_number: 2,
        source_text: 'Monthly Income: ₹42,000',
        extraction_confidence: 0.97,
      },
    },
    {
      fact_id: 'FACT_08',
      entity_mention_id: 'ENT_02',
      attribute: 'salary_credit',
      raw_value: '₹31,500',
      raw_time: 'March 2024',
      context: 'Verified monthly salary credit line item from Tech Innovations',
      evidence: {
        document_id: 'DOC_BANK_01',
        document_name: 'BankStatement_Q1_2024.pdf',
        page_number: 3,
        source_text: '31-Mar-2024 SALARY CREDIT / TECH INNOVATIONS : ₹31,500.00 CR',
        extraction_confidence: 0.99,
      },
    },
    {
      fact_id: 'FACT_09',
      entity_mention_id: 'ENT_03',
      attribute: 'salary',
      raw_value: '31500 INR',
      raw_time: 'March 2024',
      context: 'Net take home pay on March payslip',
      evidence: {
        document_id: 'DOC_PAYSLIP_01',
        document_name: 'SalarySlip_March2024.pdf',
        page_number: 1,
        source_text: 'Net Pay: Rs. 31,500.00',
        extraction_confidence: 0.98,
      },
    },

    // Historical income data: Temporal progression
    {
      fact_id: 'FACT_10',
      entity_mention_id: 'ENT_04',
      attribute: 'monthly_income',
      raw_value: 'Rs. 30,000',
      raw_time: '2023',
      context: 'Derived from FY2023 gross taxable income of Rs 3,60,000',
      evidence: {
        document_id: 'DOC_ITR_01',
        document_name: 'ITR_Acknowledgement_FY2023.pdf',
        page_number: 1,
        source_text: 'Gross Total Income: Rs. 3,60,000 (Monthly average: Rs. 30,000)',
        extraction_confidence: 0.95,
      },
    },
    {
      fact_id: 'FACT_11',
      entity_mention_id: 'ENT_02',
      attribute: 'salary_credit',
      raw_value: '₹30,000',
      raw_time: 'January 2024',
      context: 'Salary credit line item January',
      evidence: {
        document_id: 'DOC_BANK_01',
        document_name: 'BankStatement_Q1_2024.pdf',
        page_number: 2,
        source_text: '31-Jan-2024 SALARY CREDIT : ₹30,000.00 CR',
        extraction_confidence: 0.99,
      },
    },
  ],
};

export function runDemo(): void {
  console.log('='.repeat(75));
  console.log('  NEXUS AI — INFORMATION INTELLIGENCE ENGINE DEMO (MEMBER 2)');
  console.log('  Use Case: Loan Application Verification Package');
  console.log('='.repeat(75));

  const pipeline = new IntelligencePipeline();
  const report = pipeline.processCase(LOAN_CASE_STUDY);

  console.log(`\n[CASE PROCESSED] Case ID: ${report.case_id}`);
  console.log(`Verification Status: ${report.summary.verification_status}`);
  console.log(`Total Documents: ${report.summary.total_documents}`);
  console.log(`Total Raw Facts: ${report.summary.total_raw_facts}`);
  console.log(`Resolved Entities: ${report.summary.total_resolved_entities}`);

  console.log('\n--- 1. MULTI-SIGNAL ENTITY RESOLUTION ---');
  for (const ent of report.resolved_entities) {
    console.log(`\n• Canonical ID: ${ent.entity_id}`);
    console.log(`  Canonical Name: "${ent.canonical_name}"`);
    console.log(`  Entity Type: ${ent.entity_type}`);
    console.log(`  Aliases Resolved: [${ent.aliases.map(a => `"${a}"`).join(', ')}]`);
    console.log(`  Merged Identifiers: ${JSON.stringify(ent.identifiers)}`);
    console.log(`  Resolution Confidence: ${(ent.confidence_score * 100).toFixed(1)}%`);
    console.log(`  Rationale: ${ent.resolution_rationale}`);
  }

  console.log('\n--- 2. VALIDATED FINDINGS ---');
  for (const finding of report.findings) {
    console.log(`\n[${finding.finding_id}] Type: ${finding.type} | Severity: ${finding.severity}`);
    console.log(`Title: ${finding.title}`);
    console.log(`Description: ${finding.description}`);
    console.log(`Confidence: ${finding.confidence.level} (${(finding.confidence.score * 100).toFixed(0)}%) — ${finding.confidence.explanation}`);
    console.log(`Recommended Action: ${finding.recommended_action}`);

    if (finding.evidence.length > 0) {
      console.log('Traceable Evidence:');
      for (const ev of finding.evidence) {
        console.log(`  → [${ev.document_name} — p.${ev.page_number}] "${ev.source_text}"`);
      }
    }
  }

  console.log('\n--- 3. TEMPORAL ANALYSIS & TIMELINES ---');
  for (const timeline of report.timelines) {
    console.log(`\n• Timeline for Entity: ${timeline.canonical_name} (${timeline.entity_id}) | Attribute: ${timeline.attribute}`);
    console.log(`  Narrative: ${timeline.summary}`);
    console.log('  Event Progression:');
    for (const evt of timeline.events) {
      const deltaStr = evt.delta_from_previous
        ? ` (Delta: ${evt.delta_from_previous.numeric_delta !== undefined ? (evt.delta_from_previous.numeric_delta >= 0 ? '+' : '') + evt.delta_from_previous.numeric_delta : ''} ${evt.delta_from_previous.percentage_change !== undefined ? `[${evt.delta_from_previous.percentage_change}%]` : ''})`
        : ' (Baseline)';
      console.log(`    - ${evt.date_string}: ${evt.value.standardized_representation}${deltaStr} [${evt.document_name} p.${evt.page_number}]`);
    }
  }

  console.log('\n--- 4. MISSING INFORMATION AUDIT ---');
  for (const item of report.missing_information) {
    const status = item.is_missing ? '✗ MISSING' : '✓ PRESENT';
    console.log(`  ${status.padEnd(11)} | ${item.label.padEnd(45)} | Required for: ${item.required_for}`);
  }

  console.log('\n' + '='.repeat(75));
  console.log('  MEMBER 2 INTELLIGENCE ENGINE RUN COMPLETE — READY FOR MEMBER 3 INTEGRATION');
  console.log('='.repeat(75));
}

// Run if called directly
if (process.argv[1] && (process.argv[1].endsWith('demo.ts') || process.argv[1].endsWith('demo.js'))) {
  runDemo();
}
