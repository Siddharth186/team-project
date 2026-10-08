import React, { useState } from 'react';
import {
  FileCheck,
  Download,
  Printer,
  Copy,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  HelpCircle,
  FileText
} from 'lucide-react';
import { CaseDecisionReport, Finding } from '../types/nexus';

interface ReportViewProps {
  report: CaseDecisionReport | null;
  onOpenFinding: (finding: Finding) => void;
}

export const ReportView: React.FC<ReportViewProps> = ({ report, onOpenFinding }) => {
  const [copied, setCopied] = useState(false);

  if (!report) {
    return (
      <div className="p-12 text-center glass-panel rounded-2xl text-slate-400 font-mono text-xs">
        Generating decision intelligence report...
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    const text = `NEXUS AI DECISION INTELLIGENCE REPORT
Case: ${report.caseTitle}
Status: ${report.decisionStatus}
Risk Score: ${report.riskScore}/100
Confidence: ${(report.overallConfidence * 100).toFixed(1)}%

Summary:
${report.executiveSummary}

Recommended Actions:
${report.recommendedHumanActions.map((a, i) => `${i + 1}. ${a}`).join('\n')}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMd = () => {
    window.open('/api/report/markdown', '_blank');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Actions */}
      <div className="p-6 rounded-2xl glass-panel border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center space-x-2 text-lime-400 font-mono text-xs uppercase tracking-wider">
            <FileCheck className="w-4 h-4" />
            <span>Audit-Ready Case Intelligence File</span>
          </div>
          <h2 className="text-xl font-bold text-white font-mono mt-1">
            Decision Intelligence Dossier
          </h2>
          <p className="text-xs text-slate-400">
            Case ID: <code className="text-lime-300 font-mono">{report.caseId}</code> • Generated: {report.generatedAt.replace('T', ' ').substring(0, 16)}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs flex items-center space-x-1.5 border border-white/10 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
          </button>
          <button
            onClick={handleDownloadMd}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs flex items-center space-x-1.5 border border-white/10 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Markdown</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-lg bg-lime-400 hover:bg-lime-300 text-black font-semibold font-mono text-xs flex items-center space-x-1.5 transition-colors shadow-md shadow-lime-400/20"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Report Document Shell */}
      <div className="p-8 rounded-2xl glass-panel border border-white/15 space-y-8 bg-[#0a0d14]/95 text-xs text-slate-200 leading-relaxed font-sans shadow-2xl">
        {/* Top Status & Risk Header */}
        <div className="pb-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Target Case Assessment</span>
            <h1 className="text-xl font-extrabold text-white font-mono">{report.caseTitle}</h1>
            <p className="text-xs text-slate-400">Application Category: Commercial Term Facility & Renewable Subsidy</p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Risk Index */}
            <div className="text-right">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Risk Index</span>
              <span className="text-2xl font-extrabold font-mono text-amber-400">{report.riskScore}/100</span>
            </div>

            {/* Decision Status Pill */}
            <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-center">
              <span className="text-[10px] uppercase block text-amber-400 font-bold">DECISION VERDICT</span>
              <span className="text-sm font-black tracking-wider">{report.decisionStatus}</span>
            </div>
          </div>
        </div>

        {/* 1. Executive Summary */}
        <div className="space-y-2">
          <h3 className="text-xs font-mono uppercase tracking-wider text-lime-400 font-bold flex items-center space-x-2">
            <span>1. Executive Summary</span>
          </h3>
          <p className="text-slate-300 leading-relaxed text-xs p-4 rounded-xl bg-slate-900/60 border border-white/5">
            {report.executiveSummary}
          </p>
        </div>

        {/* 2. Critical Findings & Cross-Document Contradictions */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-rose-400 font-bold flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4" />
            <span>2. Critical Findings & Cross-Document Contradictions</span>
          </h3>

          <div className="space-y-3">
            {report.criticalFindings.map((finding, idx) => (
              <div
                key={finding.id}
                className="p-4 rounded-xl bg-slate-900/80 border border-rose-500/20 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold">
                      {finding.severity}
                    </span>
                    <h4 className="text-xs font-bold text-white font-mono">{idx + 1}. {finding.title}</h4>
                  </div>
                  <span className="text-lime-400 font-mono text-[11px]">
                    Confidence: {(finding.confidence * 100).toFixed(0)}%
                  </span>
                </div>

                {finding.discrepancyDelta && (
                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 font-mono text-xs flex flex-wrap items-center justify-between gap-2">
                    <span className="text-slate-400">Approved: <strong className="text-emerald-400">{finding.discrepancyDelta.expectedOrPrevious}</strong></span>
                    <span className="text-slate-400">Claimed: <strong className="text-rose-400">{finding.discrepancyDelta.reportedOrNew}</strong></span>
                    <span className="text-amber-300 font-bold">Variance: {finding.discrepancyDelta.difference}</span>
                  </div>
                )}

                <p className="text-slate-300">{finding.reasoning}</p>

                {/* Evidence citations */}
                <div className="space-y-1 pt-1 border-t border-white/5">
                  <span className="text-[10px] uppercase font-mono text-slate-500 block">Source Traceability:</span>
                  {finding.conflictingFacts.map((fact, i) => (
                    <div key={i} className="text-[11px] text-slate-400 font-mono">
                      • <strong>{fact.source.documentName}</strong> (Page {fact.source.pageNumber}): <em>"{fact.source.snippet}"</em>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Missing Regulatory Documentation */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center space-x-2">
            <HelpCircle className="w-4 h-4" />
            <span>3. Missing Regulatory & Policy Documentation</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {report.missingInformation.map((item, idx) => (
              <div key={item.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-amber-500/20 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white font-mono">{idx + 1}. {item.requiredAttribute}</span>
                  <span className="text-[10px] font-mono text-amber-400">{item.impactLevel}</span>
                </div>
                <p className="text-slate-300 text-[11px]">{item.reason}</p>
                <p className="text-[11px] text-amber-300 font-mono"><strong>Action:</strong> {item.suggestedRemedy}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Temporal Progression Summary */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>4. Chronological Trajectory (Quarterly Turnover)</span>
          </h3>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-cyan-500/20 font-mono text-xs flex flex-wrap items-center justify-between gap-3">
            {report.temporalTrajectory.map((t, idx) => (
              <div key={t.id} className="flex items-center space-x-2">
                <div>
                  <span className="text-[10px] text-slate-500 block">{t.periodOrDate}</span>
                  <span className="text-white font-bold">{t.value}</span>
                </div>
                {idx < report.temporalTrajectory.length - 1 && (
                  <ArrowRight className="w-3.5 h-3.5 text-cyan-500" />
                )}
              </div>
            ))}
            <div className="px-3 py-1 rounded bg-cyan-500/10 text-cyan-300 text-[11px] font-bold">
              +40.0% Verified Inflow Expansion
            </div>
          </div>
        </div>

        {/* 5. Recommended Human Underwriter Actions */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-lime-400 font-bold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>5. Recommended Human Actions (Non-Autonomous Decision Support)</span>
          </h3>

          <div className="p-4 rounded-xl bg-lime-400/5 border border-lime-400/20 space-y-2.5">
            {report.recommendedHumanActions.map((action, idx) => (
              <div key={idx} className="flex items-start space-x-2.5 text-xs">
                <span className="w-5 h-5 rounded bg-lime-400/20 text-lime-400 font-mono font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                  {idx + 1}
                </span>
                <span className="text-slate-200">{action}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="pt-4 border-t border-white/10 text-[11px] text-slate-500 italic text-center font-sans">
          {report.disclaimer}
        </div>
      </div>
    </div>
  );
};
