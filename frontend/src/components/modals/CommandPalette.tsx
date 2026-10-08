import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  FileText,
  AlertTriangle,
  Share2,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { nexusData } from '../../data/demoData';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (type: string, payload?: any) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectAction
}) => {
  const [search, setSearch] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickActions = [
    { id: 'q1', title: 'What conflicts did you find?', type: 'qa', query: 'What information is inconsistent?', icon: AlertTriangle, color: '#FF7777' },
    { id: 'q2', title: 'Show evidence for the income conflict', type: 'evidence', icon: Sparkles, color: '#C9FF3D' },
    { id: 'q3', title: 'What information is missing?', type: 'qa', query: 'What information is missing?', icon: AlertTriangle, color: '#FFBD59' },
    { id: 'q4', title: 'Explore Knowledge Graph', type: 'graph', icon: Share2, color: '#38BDF8' },
    { id: 'q5', title: 'Inspect Chronological Timeline', type: 'timeline', icon: Clock, color: '#79DF9B' },
    { id: 'q6', title: 'Applicant_Form.pdf (Primary Application)', type: 'doc', icon: FileText, color: '#F5F7F5' },
    { id: 'q7', title: 'Bank_Statement_HDFC.pdf (Financial Ledger)', type: 'doc', icon: FileText, color: '#F5F7F5' }
  ];

  const filtered = quickActions.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl glass-panel-nexus rounded-2xl border border-[#C9FF3D]/40 p-4 shadow-2xl space-y-3">
        {/* Search Input Bar */}
        <div className="flex items-center space-x-3 px-3 py-2 rounded-xl bg-[#111312] border border-[#292D2B]">
          <Search className="w-4 h-4 text-[#C9FF3D] flex-shrink-0" />
          <input
            type="text"
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search intelligence, conflicts, documents, or actions..."
            className="w-full bg-transparent text-xs text-[#F5F7F5] placeholder-[#8F9691] focus:outline-none font-sans"
          />
          <button
            onClick={onClose}
            className="p-1 rounded text-[#8F9691] hover:text-[#F5F7F5]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
          <span className="text-[10px] font-mono uppercase text-[#8F9691] px-2 block">
            Suggested Intelligence Actions
          </span>

          {filtered.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => {
                  onSelectAction(item.type, item);
                  onClose();
                }}
                className="p-2.5 rounded-xl bg-[#171A18]/80 hover:bg-[#1D211F] border border-transparent hover:border-[#C9FF3D]/30 flex items-center justify-between text-xs cursor-pointer group transition-all"
              >
                <div className="flex items-center space-x-3 truncate">
                  <div
                    className="p-1.5 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${item.color}15`, color: item.color }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[#F5F7F5] truncate font-sans group-hover:text-[#C9FF3D] transition-colors">
                    {item.title}
                  </span>
                </div>

                <ArrowRight className="w-3.5 h-3.5 text-[#8F9691] group-hover:text-[#C9FF3D] transition-colors flex-shrink-0 ml-2" />
              </div>
            );
          })}
        </div>

        {/* Footer shortcuts */}
        <div className="pt-2 border-t border-[#292D2B] flex items-center justify-between text-[10px] font-mono text-[#8F9691]">
          <span>Use <kbd className="px-1.5 py-0.5 rounded bg-[#1D211F] text-[#F5F7F5]">Esc</kbd> to exit</span>
          <span>NEXUS Command Engine</span>
        </div>
      </div>
    </div>
  );
};
