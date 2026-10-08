import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Plus,
  Sparkles,
  ShieldCheck,
  FileText,
  AlertTriangle,
  ArrowRight,
  UploadCloud
} from 'lucide-react';
import { nexusData } from '../../data/demoData';

interface ChatBoxTerminalProps {
  onOpenUpload: () => void;
  onOpenEvidence: (item?: any) => void;
}

export const ChatBoxTerminal: React.FC<ChatBoxTerminalProps> = ({
  onOpenUpload,
  onOpenEvidence
}) => {
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'nexus'; text: string; confidence?: number; citations?: string[] }>>([
    {
      sender: 'nexus',
      text: "I've analyzed 6 documents. I identified 7 potential conflicts, 4 missing compliance requirements, and 186 relationships.\n\nWould you like me to show the critical budget ceiling breach (₹3.4L) or the director salary variance?",
      confidence: 94.2,
      citations: ["Applicant_Form.pdf (Page 2)", "Bank_Statement.pdf (Page 4)", "Grant_Sanction.pdf (Page 1)"]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const suggestedPrompts = [
    "What conflicts did you find?",
    "Show evidence for the income conflict",
    "What's missing from the dossier?",
    "Which document has the latest value?"
  ];

  const handleSend = (queryText?: string) => {
    const q = (queryText || inputValue).trim();
    if (!q || isThinking) return;

    setMessages(prev => [...prev, { sender: 'user', text: q }]);
    setInputValue('');
    setIsThinking(true);

    setTimeout(() => {
      let reply = "";
      let citations = ["Applicant_Form.pdf (Page 2)", "Bank_Statement.pdf (Page 4)"];

      if (q.toLowerCase().includes('income') || q.toLowerCase().includes('salary')) {
        reply = "Income conflict detected: Managing Director declared ₹42,000/mo on the loan schedule, but recurring bank deposits average only ₹31,500/mo across the trailing 6 months (33.3% variance). Click citation below to inspect verbatim excerpts.";
      } else if (q.toLowerCase().includes('missing')) {
        reply = "Critical missing data: 1) Managing Director signature on board authorizing resolution is unfiled; 2) State Pollution Control Board environmental site NOC is unsubmitted.";
        citations = ["Board_Resolution.pdf", "Policy_Guidelines.pdf"];
      } else {
        reply = "Found 7 contradictions across the loan file. Top critical item: Project Alpha requested loan (₹18.4L) exceeds the approved grant subsidy debt ceiling (₹15.0L) by ₹3.4L, invalidating interest subvention.";
        citations = ["Applicant_Form.pdf (Page 2)", "Grant_Sanction.pdf (Page 1)"];
      }

      setMessages(prev => [...prev, {
        sender: 'nexus',
        text: reply,
        confidence: 95.0,
        citations
      }]);
      setIsThinking(false);
    }, 900);
  };

  return (
    <div className="glass-panel-nexus rounded-3xl p-6 sm:p-7 border border-[#292D2B] flex flex-col justify-between shadow-2xl relative overflow-hidden min-h-[440px]">
      {/* Top Header Row of the Chat Box (matching sketch: "Chat box" with "+ upload Document" button inside!) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#292D2B]">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#C9FF3D]/10 border border-[#C9FF3D]/30 flex items-center justify-center text-[#C9FF3D]">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#F5F7F5] font-mono tracking-wide">
              Chat Terminal
            </h3>
            <span className="text-[10px] text-[#8F9691] font-sans">
              Grounded Natural Language Investigation Engine
            </span>
          </div>
        </div>

        {/* The prominent Upload Document button */}
        <button
          onClick={onOpenUpload}
          className="px-4 py-2 rounded-full bg-[#C9FF3D] hover:bg-[#bbf030] text-[#0D0F0E] font-bold text-xs tracking-wider uppercase font-mono flex items-center space-x-1.5 transition-all shadow-[0_0_15px_rgba(201,255,61,0.25)] hover:shadow-[0_0_20px_rgba(201,255,61,0.4)] self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="flex items-center space-x-1.5 overflow-x-auto py-2 scrollbar-none text-[11px] font-mono">
        <span className="text-[#8F9691] text-[10px] uppercase mr-1">Prompts:</span>
        {suggestedPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="px-2.5 py-1 rounded-full bg-[#171A18] hover:bg-[#1D211F] text-[#8F9691] hover:text-[#C9FF3D] border border-[#292D2B] hover:border-[#C9FF3D]/40 transition-colors whitespace-nowrap"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Message History Area */}
      <div className="flex-1 space-y-3.5 overflow-y-auto max-h-56 pr-1 my-2">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`p-3.5 rounded-2xl max-w-lg text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-[#C9FF3D]/15 text-[#F5F7F5] border border-[#C9FF3D]/30 rounded-tr-none'
                  : 'bg-[#171A18] text-[#F5F7F5] border border-[#292D2B] rounded-tl-none space-y-2'
              }`}
            >
              <p className="whitespace-pre-line font-sans">{m.text}</p>

              {/* Citations & Evidence Pill Links */}
              {m.citations && (
                <div className="pt-2 border-t border-[#292D2B] flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
                  <span className="text-[#8F9691]">Citations:</span>
                  {m.citations.map((c, ci) => (
                    <button
                      key={ci}
                      onClick={() => onOpenEvidence()}
                      className="px-2 py-0.5 rounded bg-[#111312] text-[#C9FF3D] hover:bg-[#C9FF3D]/10 border border-[#292D2B] hover:border-[#C9FF3D]/40 transition-colors flex items-center space-x-1"
                    >
                      <FileText className="w-2.5 h-2.5" />
                      <span>{c}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex items-center space-x-2 text-xs font-mono text-[#C9FF3D] p-2">
            <div className="w-3.5 h-3.5 rounded-full border-2 border-[#C9FF3D] border-t-transparent animate-spin" />
            <span>Reasoning over extracted facts and documents...</span>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="pt-3 border-t border-[#292D2B] flex items-center space-x-2"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask NEXUS anything about your documents..."
          className="flex-1 bg-[#111312] border border-[#292D2B] rounded-full px-4 py-2.5 text-xs text-[#F5F7F5] placeholder-[#8F9691] focus:outline-none focus:border-[#C9FF3D]/50 font-sans"
        />
        <button
          type="submit"
          disabled={!inputValue.trim()}
          className="w-9 h-9 rounded-full bg-[#C9FF3D] hover:bg-[#bbf030] disabled:opacity-40 text-[#0D0F0E] flex items-center justify-center flex-shrink-0 transition-all shadow-[0_0_12px_rgba(201,255,61,0.25)]"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
