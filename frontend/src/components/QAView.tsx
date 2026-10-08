import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  ShieldCheck,
  FileText,
  ArrowRight,
  HelpCircle,
  Clock,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { QAResponse, Fact, EvidenceSource, Finding } from '../types/nexus';

interface QAViewProps {
  onAsk: (query: string) => Promise<QAResponse>;
  onInspectEvidence: (finding: Finding) => void;
  findings: Finding[];
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'nexus';
  text: string;
  confidence?: number;
  citedFacts?: Fact[];
  citedEvidence?: EvidenceSource[];
  suggestedFollowUps?: string[];
  timestamp: string;
}

export const QAView: React.FC<QAViewProps> = ({ onAsk, onInspectEvidence, findings }) => {
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'nexus',
      text: `### Welcome to NEXUS Grounded Reasoning Engine\n\nI am connected directly to **Member 2's deterministic intelligence layer**. I do not guess, summarize blindly, or invent answers. Every conclusion is retrieved directly from extracted facts, verified contradictions, and cross-document source citations.\n\nSelect a suggested inquiry below or ask your own question regarding **Nexus Solar Energy Solutions Pvt Ltd** or **Arjun Mehta**.`,
      confidence: 0.98,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedFollowUps: [
        "What information is inconsistent?",
        "What changed over time?",
        "What information is missing?",
        "Show evidence for the income mismatch.",
        "Which document contains the latest value?"
      ]
    }
  ]);

  const quickPrompts = [
    "What information is inconsistent?",
    "What changed over time?",
    "What information is missing?",
    "Show evidence for the income mismatch.",
    "Which document contains the latest value?"
  ];

  const handleSend = async (queryText?: string) => {
    const q = (queryText || inputQuery).trim();
    if (!q || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const result = await onAsk(q);
      const nexusMsg: ChatMessage = {
        id: `nexus-${Date.now()}`,
        sender: 'nexus',
        text: result.answer,
        confidence: result.confidence,
        citedFacts: result.citedFacts,
        citedEvidence: result.citedEvidence,
        suggestedFollowUps: result.suggestedFollowUps,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, nexusMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'nexus',
        text: 'An error occurred while retrieving grounded intelligence. Please verify backend orchestrator connection.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRelatedFinding = (docName: string) => {
    const matchingFinding = findings.find(f =>
      f.conflictingFacts.some(fact => fact.source.documentName === docName)
    ) || findings[0];
    onInspectEvidence(matchingFinding);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl glass-panel border border-lime-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-lime-400 font-mono text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Deterministic Grounded Reasoning Interface</span>
          </div>
          <h2 className="text-xl font-bold text-white font-mono mt-1">
            "Ask NEXUS anything..."
          </h2>
          <p className="text-xs text-slate-400">
            Answers are synthesized strictly from structured facts, detected contradictions, and page-level source text.
          </p>
        </div>

        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-lime-400/10 border border-lime-400/20 text-lime-400 font-mono text-xs">
          <ShieldCheck className="w-4 h-4" />
          <span>Zero Hallucination Guarantee</span>
        </div>
      </div>

      {/* Suggested Query Chips */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none text-xs font-mono">
        <span className="text-slate-500 whitespace-nowrap text-[11px]">Recommended:</span>
        {quickPrompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleSend(prompt)}
            className="px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-lime-400/15 text-slate-300 hover:text-lime-300 border border-white/10 hover:border-lime-400/30 transition-all whitespace-nowrap"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div className="space-y-5 min-h-[400px]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="text-[10px] font-mono text-slate-500 mb-1 px-1">
              {msg.sender === 'user' ? 'Credit Officer' : 'NEXUS Reasoning Engine'} • {msg.timestamp}
            </div>

            <div
              className={`p-5 rounded-2xl max-w-3xl space-y-4 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-lime-400/15 border border-lime-400/30 text-white rounded-tr-none'
                  : 'glass-panel border-white/10 text-slate-200 rounded-tl-none'
              }`}
            >
              {/* Formatted Markdown Rendering */}
              <div className="prose prose-invert prose-sm max-w-none space-y-2 whitespace-pre-wrap font-sans text-xs">
                {msg.text}
              </div>

              {/* Confidence Badge */}
              {msg.confidence && (
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono">
                  <span className="flex items-center space-x-1 text-lime-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Deterministic Confidence: {(msg.confidence * 100).toFixed(0)}%</span>
                  </span>
                  <span className="text-slate-500">Source: Member 2 Validated Intelligence</span>
                </div>
              )}

              {/* Cited Evidence Chips */}
              {msg.citedEvidence && msg.citedEvidence.length > 0 && (
                <div className="pt-3 border-t border-white/10 space-y-2">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block tracking-wider">
                    Traceable Citations (Document → Page):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {msg.citedEvidence.map((ev, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleOpenRelatedFinding(ev.documentName)}
                        className="px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-lime-400/10 text-slate-300 hover:text-lime-300 border border-white/10 hover:border-lime-400/30 font-mono text-[11px] flex items-center space-x-1.5 transition-all"
                      >
                        <FileText className="w-3 h-3 text-lime-400" />
                        <span className="truncate max-w-[200px]">{ev.documentName}</span>
                        <span className="text-lime-400 font-bold">Pg {ev.pageNumber}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Follow-Ups */}
              {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                <div className="pt-3 border-t border-white/10 space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Suggested Exploration:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.suggestedFollowUps.map((su, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(su)}
                        className="px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700/80 text-lime-300 text-[11px] font-mono flex items-center space-x-1 border border-white/5 transition-colors"
                      >
                        <span>{su}</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-3 text-xs text-lime-400 font-mono p-4 rounded-xl glass-panel border border-lime-400/20 max-w-sm">
            <div className="w-4 h-4 rounded-full border-2 border-lime-400 border-t-transparent animate-spin"></div>
            <span>Grounding response in structured facts & evidence...</span>
          </div>
        )}
      </div>

      {/* Input Form Bar */}
      <div className="sticky bottom-4 glass-panel rounded-2xl border border-white/15 p-2 shadow-2xl backdrop-blur-xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask NEXUS anything (e.g., 'What information is inconsistent?', 'Show evidence for income mismatch')..."
            className="flex-1 bg-transparent px-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none font-sans"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || loading}
            className="px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 disabled:opacity-40 text-black font-semibold text-xs tracking-wider uppercase font-mono flex items-center space-x-1.5 transition-all shadow-md shadow-lime-400/20"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
