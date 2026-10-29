import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Plus,
  Sparkles,
  ShieldCheck,
  FileText,
  AlertTriangle,
  ArrowRight,
  UploadCloud,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  Tag,
  Hash,
  Download,
  FileSpreadsheet,
  Boxes,
  Printer,
  Trash2
} from 'lucide-react';
import { nexusData } from '../../data/demoData';
import { nexusApi, getArtifactUrl } from '../../services/api';

interface ChatBoxTerminalProps {
  onOpenUpload: () => void;
  onOpenEvidence: (item?: any) => void;
}

const cleanTextForSpeech = (rawText: string) => {
  return rawText
    .replace(/```[\s\S]*?```/g, 'Code implementation example provided in chat.')
    .replace(/^#+\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^[•\-\*]\s+/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/\n+/g, '. ');
};

const renderInline = (text: string) => {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((part, pIdx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={pIdx} className="font-bold text-[#F5F7F5]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={pIdx} className="text-[#8F9691] not-italic text-[11px] font-mono">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={pIdx} className="px-1.5 py-0.5 rounded bg-[#111312] text-[#C9FF3D] font-mono text-[11px] border border-[#292D2B]">
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={pIdx}>{part}</span>;
  });
};

const renderFormattedText = (rawText: string) => {
  if (!rawText) return null;
  const elements: React.ReactNode[] = [];
  const lines = rawText.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      elements.push(<div key={`space-${i}`} className="h-1" />);
      i++;
      continue;
    }

    // Fenced Code Block
    if (trimmed.startsWith('```')) {
      const lang = trimmed.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length && lines[i].trim().startsWith('```')) {
        i++;
      }
      elements.push(
        <div key={`code-${i}`} className="my-2 rounded-lg bg-[#0A0C0B] border border-[#232724] overflow-hidden shadow-inner">
          {lang && (
            <div className="flex items-center justify-between px-3 py-1 bg-[#131614] border-b border-[#232724] text-[10px] font-mono text-[#8F9691] uppercase tracking-wider">
              <span>{lang}</span>
              <span className="text-[9px] text-[#555E57]">verified snippet</span>
            </div>
          )}
          <pre className="p-3 font-mono text-[11px] leading-relaxed text-[#D2EBD4] overflow-x-auto whitespace-pre">
            <code>{codeLines.join('\n')}</code>
          </pre>
        </div>
      );
      continue;
    }

    // Markdown Headings
    if (trimmed.startsWith('#')) {
      const level = trimmed.match(/^#+/)?.[0].length || 1;
      const title = trimmed.replace(/^#+\s*/, '');
      const headerClass = level <= 3
        ? "font-mono font-bold text-[#C9FF3D] text-xs pt-2 pb-0.5 tracking-wide border-b border-[#232724]/60"
        : "font-mono font-bold text-[#A6E22E] text-xs pt-1.5 pb-0.5";
      elements.push(
        <h4 key={`h-${i}`} className={headerClass}>
          {title}
        </h4>
      );
      i++;
      continue;
    }

    // Bullets & Numbered lists
    const isBullet = trimmed.startsWith('•') || trimmed.startsWith('- ') || trimmed.startsWith('* ');
    const isNumbered = /^\d+\.\s+/.test(trimmed);

    if (isBullet || isNumbered) {
      const marker = isBullet ? '•' : trimmed.match(/^\d+\./)?.[0];
      const cleanContent = isBullet
        ? trimmed.replace(/^[•\-\*]\s*/, '')
        : trimmed.replace(/^\d+\.\s*/, '');

      elements.push(
        <div key={`item-${i}`} className="flex items-start space-x-2 pl-1.5 py-0.5">
          <span className="text-[#C9FF3D] font-mono font-bold text-xs mt-0.5 shrink-0">{marker}</span>
          <div className="flex-1 text-[#E0E5E1]">{renderInline(cleanContent)}</div>
        </div>
      );
      i++;
      continue;
    }

    // Normal paragraph
    elements.push(
      <p key={`p-${i}`} className="text-[#E0E5E1] leading-relaxed">
        {renderInline(line)}
      </p>
    );
    i++;
  }

  return (
    <div className="space-y-1.5 font-sans leading-relaxed text-xs">
      {elements}
    </div>
  );
};

export interface ArtifactInfo {
  artifactType: 'PDF' | 'EXCEL' | 'IMAGE' | 'DOCX';
  fileName: string;
  downloadUrl: string;
  fileSize: string;
  title?: string;
}

export interface ChatMessage {
  sender: 'user' | 'nexus';
  text: string;
  confidence?: number;
  citations?: string[];
  artifact?: ArtifactInfo;
}

const CHAT_STORAGE_KEY = 'nexus_chat_terminal_history';

export const ChatBoxTerminal: React.FC<ChatBoxTerminalProps> = ({
  onOpenUpload,
  onOpenEvidence
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = sessionStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [
      {
        sender: 'nexus',
        text: "I've initialized the multi-agent document intelligence graph.\n\nAsk me any question via text or voice about your uploaded files, cross-document discrepancies, extracted facts, or compliance parameters.",
        confidence: 96.5,
        citations: []
      }
    ];
  });

  // Persist conversation so screen lock / tab blur does not reset chat history
  useEffect(() => {
    try {
      sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    } catch {}
  }, [messages]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  
  // Voice Input (Speech Recognition) State
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  // Voice Output (Speech Synthesis) State
  const [autoVoiceReply, setAutoVoiceReply] = useState(false);
  const [speakingMsgIdx, setSpeakingMsgIdx] = useState<number | null>(null);
  const [generatingArtifactIdx, setGeneratingArtifactIdx] = useState<{ idx: number; type: string } | null>(null);

  const handleGenerateAndDownload = async (msgIdx: number, type: 'pdf' | 'excel' | 'diagram' | 'docx') => {
    const msg = messages[msgIdx];
    if (!msg || msg.sender !== 'nexus') return;

    setGeneratingArtifactIdx({ idx: msgIdx, type });
    try {
      let payload: any = {};
      const answer = msg.text;
      const firstHeading = answer.match(/^#+\s*(.+)$/m)?.[1] || 'Technical Analysis Dossier';

      if (type === 'pdf') {
        const codeSnippets: any[] = [];
        const codeRegex = /```(\w+)?\n([\s\S]*?)```/g;
        let match;
        while ((match = codeRegex.exec(answer)) !== null) {
          codeSnippets.push({
            language: match[1] || 'code',
            code: match[2].trim(),
            title: `Verified ${match[1] ? match[1].toUpperCase() : 'Code'} Implementation`
          });
        }
        const cleanAnswer = answer.replace(/```[\s\S]*?```/g, '');
        const rawSections = cleanAnswer.split(/###?\s+/).filter(s => s.trim().length > 0);
        const sections = rawSections.map(s => {
          const lines = s.split('\n');
          return { title: lines[0].trim(), content: lines.slice(1).join('\n').trim() };
        });

        payload = {
          title: firstHeading,
          subtitle: 'NEXUS AI Grounded Intelligence Dossier',
          sections: sections.length > 0 ? sections : [{ title: 'Analysis', content: answer }],
          code_snippets: codeSnippets,
          citations: msg.citations || [],
          filename: `NEXUS_${firstHeading.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 25)}_${Date.now()}.pdf`
        };
      } else if (type === 'excel') {
        const lines = answer.split('\n').filter(l => l.trim().length > 0);
        const rows = lines.map((l, i) => ({
          item_number: i + 1,
          section_or_content: l.replace(/^#+\s*/, '').replace(/^[•\-\*]\s*/, '').slice(0, 180),
          citation_source: (msg.citations && msg.citations[0]) || 'Verified Courseware'
        }));
        payload = {
          title: firstHeading.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 25),
          sheets_data: { 'Intelligence_Summary': rows },
          filename: `NEXUS_Ledger_${Date.now()}.xlsx`
        };
      } else if (type === 'diagram') {
        let topic = 'system';
        const aLower = answer.toLowerCase();
        if (aLower.includes('servlet') || aLower.includes('serverlet')) topic = 'servlet';
        else if (aLower.includes('react') || aLower.includes('props')) topic = 'react';
        else if (aLower.includes('http')) topic = 'http';
        else if (aLower.includes('xml')) topic = 'xml';

        payload = {
          topic,
          title: `${topic.toUpperCase()} Architecture & Lifecycle Diagram`,
          filename: `${topic}_architecture_${Date.now()}.png`
        };
      } else if (type === 'docx') {
        payload = {
          title: firstHeading,
          subtitle: 'NEXUS AI Grounded Intelligence Dossier',
          sections: [{ title: 'Technical Analysis', content: answer }],
          filename: `NEXUS_Report_${Date.now()}.docx`
        };
      }

      const artifact = await nexusApi.generateArtifact(type, payload);
      if (artifact && artifact.downloadUrl) {
        setMessages(prev => {
          const updated = [...prev];
          updated[msgIdx] = { ...updated[msgIdx], artifact };
          return updated;
        });

        const link = document.createElement('a');
        link.href = getArtifactUrl(artifact.downloadUrl);
        link.download = artifact.fileName;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err: any) {
      console.warn('[GENERATE_ERROR]', err);
      alert(`Generation notice: ${err.message || 'Please check service'}`);
    } finally {
      setGeneratingArtifactIdx(null);
    }
  };

  // Active Tag Filter
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const availableTags = [
    '#academic-lab',
    '#coursework',
    '#financial-statement',
    '#tax-filing',
    '#grant-subsidy',
    '#kyc-identity',
    '#board-resolution'
  ];

  const [suggestedPrompts, setSuggestedPrompts] = useState([
    "What conflicts did you find?",
    "Show evidence for the income conflict",
    "What's missing from the dossier?",
    "Which document has the latest value?"
  ]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInputValue(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('[SPEECH_RECOGNITION_ERROR]', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setSpeechSupported(false);
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('[VOICE_START_ERR]', err);
      }
    }
  };

  const speakMessage = (text: string, idx: number) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingMsgIdx === idx) {
      window.speechSynthesis.cancel();
      setSpeakingMsgIdx(null);
      return;
    }

    window.speechSynthesis.cancel();
    const clean = cleanTextForSpeech(text);
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    // Pick English Voice if available
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Online')));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onstart = () => setSpeakingMsgIdx(idx);
    utterance.onend = () => setSpeakingMsgIdx(null);
    utterance.onerror = () => setSpeakingMsgIdx(null);

    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (queryText?: string) => {
    const rawQ = (queryText || inputValue).trim();
    if (!rawQ || isThinking) return;

    // Prepend tag scope if selected
    const q = selectedTag && !rawQ.includes(selectedTag)
      ? `[Filter Scope: ${selectedTag}] ${rawQ}`
      : rawQ;

    setMessages(prev => [...prev, { sender: 'user', text: rawQ }]);
    setInputValue('');
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    setIsThinking(true);

    try {
      const response: any = await nexusApi.askQuestion(q, messages);
      const rawCitations: string[] = ((response.citations || response.citedEvidence || []) as any[]).map(
        (e: any) => `${e.file || e.fileName || e.documentName || 'Document'} (Page ${e.page || e.pageNumber || 1})`
      );
      const citations: string[] = Array.from(new Set(rawCitations));

      if (Array.isArray(response.suggestedFollowUps) && response.suggestedFollowUps.length > 0) {
        setSuggestedPrompts(response.suggestedFollowUps);
      }

      const newMsg: ChatMessage = {
        sender: 'nexus',
        text: response.answer || 'Query evaluated against verified fact ledger.',
        confidence: Math.round((response.confidence || 0.95) * 1000) / 10,
        citations: citations.length > 0 ? citations : undefined,
        artifact: response.artifact || undefined
      };

      setMessages(prev => {
        const next = [...prev, newMsg];
        // Auto-Voice reply if enabled or if user spoke query
        if (autoVoiceReply || isListening) {
          setTimeout(() => {
            speakMessage(newMsg.text, next.length - 1);
          }, 200);
        }
        return next;
      });
    } catch (err: any) {
      console.warn('[QA_ERROR]', err);
      setMessages(prev => [
        ...prev,
        {
          sender: 'nexus',
          text: `⚠️ Query evaluation failed: ${err.message || 'Network timeout'}. Please ensure the Orchestrator service is running on port 5001.`,
          confidence: 0,
          citations: []
        }
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="glass-panel-nexus rounded-3xl p-5 sm:p-7 border border-[#292D2B] flex flex-col justify-between shadow-2xl relative overflow-hidden min-h-[460px]">
      {/* Top Header Row of the Chat Box */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-[#292D2B]">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#C9FF3D]/10 border border-[#C9FF3D]/30 flex items-center justify-center text-[#C9FF3D]">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-[#F5F7F5] font-mono tracking-wide">
                Voice & Text Intelligence Terminal
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-[#C9FF3D]/15 text-[#C9FF3D] border border-[#C9FF3D]/30 text-[9px] font-mono font-bold">
                MULTI-AGENT Q&A
              </span>
            </div>
            <span className="text-[10px] text-[#8F9691] font-sans">
              Grounded Q&A with real-time speech synthesis & auto-taxonomy
            </span>
          </div>
        </div>

        {/* Action Controls: Voice Reply Toggle + Upload Button */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          {/* Clear Chat Button */}
          <button
            type="button"
            onClick={() => {
              sessionStorage.removeItem(CHAT_STORAGE_KEY);
              setMessages([
                {
                  sender: 'nexus',
                  text: "I've initialized the multi-agent document intelligence graph.\n\nAsk me any question via text or voice about your uploaded files, cross-document discrepancies, extracted facts, or compliance parameters.",
                  confidence: 96.5,
                  citations: []
                }
              ]);
            }}
            className="p-1.5 rounded-xl border border-[#292D2B] bg-[#171A18] text-[#8F9691] hover:text-rose-400 hover:border-rose-400/40 transition-colors cursor-pointer"
            title="Clear chat history and reset terminal"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Auto Voice Reply Toggle */}
          <button
            type="button"
            onClick={() => {
              if (speakingMsgIdx !== null) {
                window.speechSynthesis.cancel();
                setSpeakingMsgIdx(null);
              }
              setAutoVoiceReply(!autoVoiceReply);
            }}
            className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-mono flex items-center space-x-1.5 transition-all cursor-pointer ${
              autoVoiceReply
                ? 'bg-[#C9FF3D]/20 text-[#C9FF3D] border-[#C9FF3D]/50 shadow-[0_0_10px_rgba(201,255,61,0.2)]'
                : 'bg-[#171A18] text-[#8F9691] hover:text-white border-[#292D2B]'
            }`}
            title="Toggle Auto-Voice Reply (speaks answers aloud automatically)"
          >
            {autoVoiceReply ? <Volume2 className="w-3.5 h-3.5 text-[#C9FF3D]" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{autoVoiceReply ? 'Voice On' : 'Voice Off'}</span>
          </button>

          {/* Upload Button */}
          <button
            onClick={onOpenUpload}
            className="px-3.5 py-1.5 rounded-full bg-[#C9FF3D] hover:bg-[#bbf030] text-[#0D0F0E] font-bold text-xs tracking-wider uppercase font-mono flex items-center space-x-1.5 transition-all shadow-[0_0_15px_rgba(201,255,61,0.25)] hover:shadow-[0_0_20px_rgba(201,255,61,0.4)] cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Upload</span>
          </button>
        </div>
      </div>

      {/* Auto-Taxonomy Tag Filter Bar */}
      <div className="flex items-center space-x-1.5 overflow-x-auto py-2 scrollbar-none text-[10px] font-mono border-b border-[#292D2B]/50">
        <span className="text-[#8F9691] uppercase flex items-center space-x-1 mr-1 flex-shrink-0">
          <Tag className="w-3 h-3 text-[#C9FF3D]" />
          <span>Tags:</span>
        </span>
        <button
          onClick={() => setSelectedTag(null)}
          className={`px-2 py-0.5 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
            selectedTag === null
              ? 'bg-[#C9FF3D] text-[#0D0F0E] font-bold'
              : 'bg-[#171A18] text-[#8F9691] hover:text-white border border-[#292D2B]'
          }`}
        >
          #all-dossier
        </button>
        {availableTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
            className={`px-2 py-0.5 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              selectedTag === tag
                ? 'bg-[#C9FF3D] text-[#0D0F0E] font-bold border border-[#C9FF3D]'
                : 'bg-[#171A18] text-[#8F9691] hover:text-[#C9FF3D] border border-[#292D2B]'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Suggested Prompt Chips */}
      <div className="flex items-center space-x-1.5 overflow-x-auto py-1.5 scrollbar-none text-[11px] font-mono">
        <span className="text-[#8F9691] text-[10px] uppercase mr-1">Prompts:</span>
        {suggestedPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="px-2.5 py-1 rounded-full bg-[#171A18] hover:bg-[#1D211F] text-[#8F9691] hover:text-[#C9FF3D] border border-[#292D2B] hover:border-[#C9FF3D]/40 transition-colors whitespace-nowrap cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Message History Area */}
      <div className="flex-1 space-y-3.5 overflow-y-auto max-h-[520px] pr-1 my-2 scrollbar-thin scrollbar-thumb-[#292D2B]">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`p-3.5 rounded-2xl max-w-2xl text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-[#C9FF3D]/15 text-[#F5F7F5] border border-[#C9FF3D]/30 rounded-tr-none'
                  : 'bg-[#171A18] text-[#F5F7F5] border border-[#292D2B] rounded-tl-none space-y-2'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  {renderFormattedText(m.text)}
                </div>

                {/* Speaker Button on NEXUS Answers */}
                {m.sender === 'nexus' && (
                  <button
                    type="button"
                    onClick={() => speakMessage(m.text, idx)}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer flex-shrink-0 ${
                      speakingMsgIdx === idx
                        ? 'bg-[#C9FF3D] text-[#0D0F0E] animate-pulse'
                        : 'bg-[#111312] text-[#8F9691] hover:text-[#C9FF3D] border border-[#292D2B]'
                    }`}
                    title={speakingMsgIdx === idx ? 'Stop Speaking' : 'Read Answer Aloud'}
                  >
                    {speakingMsgIdx === idx ? (
                      <VolumeX className="w-3.5 h-3.5" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>

              {/* Generated Production Artifact (PDF, Excel, Diagram, Word) */}
              {m.artifact && (
                <div className="pt-2 mt-2 border-t border-[#292D2B]/80 flex flex-col gap-2">
                  {m.artifact.artifactType === 'IMAGE' && (
                    <div className="rounded-xl overflow-hidden border border-[#292D2B] bg-[#0A0C0B] shadow-lg">
                      <div className="px-3 py-1.5 bg-[#131614] border-b border-[#292D2B] flex items-center justify-between text-[10px] font-mono text-[#8F9691]">
                        <span>Generated Architecture Diagram</span>
                        <span className="text-[#C9FF3D] font-bold">150 DPI High-Res</span>
                      </div>
                      <img
                        src={getArtifactUrl(m.artifact.downloadUrl)}
                        alt={m.artifact.fileName}
                        className="w-full h-auto object-contain max-h-[380px] p-1.5"
                      />
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-[#111412] border border-[#C9FF3D]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#C9FF3D]/10 border border-[#C9FF3D]/30 flex items-center justify-center text-[#C9FF3D] shrink-0">
                        {m.artifact.artifactType === 'PDF' && <FileText className="w-4 h-4 text-emerald-400" />}
                        {m.artifact.artifactType === 'EXCEL' && <FileSpreadsheet className="w-4 h-4 text-green-400" />}
                        {m.artifact.artifactType === 'IMAGE' && <Boxes className="w-4 h-4 text-cyan-400" />}
                        {m.artifact.artifactType === 'DOCX' && <FileText className="w-4 h-4 text-blue-400" />}
                      </div>
                      <div>
                        <div className="text-xs font-mono font-bold text-[#F5F7F5] flex items-center space-x-1.5">
                          <span>{m.artifact.fileName}</span>
                          <span className="px-1.5 py-0.2 rounded bg-[#C9FF3D]/15 text-[#C9FF3D] text-[9px] font-bold uppercase">
                            {m.artifact.artifactType}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#8F9691]">
                          Verified generated artifact &bull; {m.artifact.fileSize}
                        </div>
                      </div>
                    </div>

                    <a
                      href={getArtifactUrl(m.artifact.downloadUrl)}
                      download={m.artifact.fileName}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-[#C9FF3D] text-[#0D0F0E] hover:bg-[#d8ff66] text-xs font-mono font-bold transition-all flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download {m.artifact.artifactType}</span>
                    </a>
                  </div>
                </div>
              )}

              {/* On-Demand Document Export Bar */}
              {m.sender === 'nexus' && (
                <div className="pt-2 mt-2 border-t border-[#292D2B]/60 flex flex-wrap items-center justify-between gap-1.5 text-[10px] font-mono">
                  <div className="flex items-center space-x-1 text-[#8F9691]">
                    <Sparkles className="w-3 h-3 text-[#C9FF3D]" />
                    <span>Export format:</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      onClick={() => handleGenerateAndDownload(idx, 'pdf')}
                      disabled={generatingArtifactIdx?.idx === idx}
                      className="px-2 py-0.5 rounded bg-[#111312] text-rose-300 hover:bg-rose-500/20 border border-[#292D2B] hover:border-rose-400/50 transition-colors flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                      title="Download as PDF Document"
                    >
                      <FileText className="w-3 h-3 text-rose-400" />
                      <span>{generatingArtifactIdx?.idx === idx && generatingArtifactIdx?.type === 'pdf' ? 'Generating...' : 'PDF'}</span>
                    </button>

                    <button
                      onClick={() => handleGenerateAndDownload(idx, 'excel')}
                      disabled={generatingArtifactIdx?.idx === idx}
                      className="px-2 py-0.5 rounded bg-[#111312] text-emerald-300 hover:bg-emerald-500/20 border border-[#292D2B] hover:border-emerald-400/50 transition-colors flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                      title="Download as Excel Spreadsheet (.xlsx)"
                    >
                      <FileSpreadsheet className="w-3 h-3 text-emerald-400" />
                      <span>{generatingArtifactIdx?.idx === idx && generatingArtifactIdx?.type === 'excel' ? 'Generating...' : 'Excel'}</span>
                    </button>

                    <button
                      onClick={() => handleGenerateAndDownload(idx, 'docx')}
                      disabled={generatingArtifactIdx?.idx === idx}
                      className="px-2 py-0.5 rounded bg-[#111312] text-blue-300 hover:bg-blue-500/20 border border-[#292D2B] hover:border-blue-400/50 transition-colors flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                      title="Download as Word Document (.docx)"
                    >
                      <FileText className="w-3 h-3 text-blue-400" />
                      <span>{generatingArtifactIdx?.idx === idx && generatingArtifactIdx?.type === 'docx' ? 'Generating...' : 'Word'}</span>
                    </button>

                    <button
                      onClick={() => handleGenerateAndDownload(idx, 'diagram')}
                      disabled={generatingArtifactIdx?.idx === idx}
                      className="px-2 py-0.5 rounded bg-[#111312] text-cyan-300 hover:bg-cyan-500/20 border border-[#292D2B] hover:border-cyan-400/50 transition-colors flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                      title="Generate 150 DPI Architecture Diagram"
                    >
                      <Boxes className="w-3 h-3 text-cyan-400" />
                      <span>{generatingArtifactIdx?.idx === idx && generatingArtifactIdx?.type === 'diagram' ? 'Generating...' : 'Diagram'}</span>
                    </button>

                    <button
                      onClick={() => window.print()}
                      className="px-2 py-0.5 rounded bg-[#111312] text-[#8F9691] hover:text-[#C9FF3D] border border-[#292D2B] hover:border-[#C9FF3D]/40 transition-colors flex items-center space-x-1 cursor-pointer"
                      title="Print or Save Document"
                    >
                      <Printer className="w-3 h-3" />
                      <span>Print</span>
                    </button>
                  </div>
                </div>
              )}

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
          <div className="flex items-center space-x-2 text-xs font-mono text-[#C9FF3D] p-2 animate-pulse">
            <div className="w-3.5 h-3.5 rounded-full border-2 border-[#C9FF3D] border-t-transparent animate-spin" />
            <span>Reasoning across local document intelligence graph...</span>
          </div>
        )}
      </div>

      {/* Voice Listening Active Indicator Banner */}
      {isListening && (
        <div className="p-2.5 rounded-2xl bg-[#C9FF3D]/15 border border-[#C9FF3D]/40 text-[#C9FF3D] flex items-center justify-between text-xs font-mono mb-2 animate-in fade-in">
          <div className="flex items-center space-x-2">
            <Radio className="w-4 h-4 text-[#C9FF3D] animate-ping" />
            <span>
              <strong>Listening to your voice...</strong> Speak your question clearly
            </span>
          </div>
          <button
            onClick={toggleVoiceInput}
            className="text-[10px] uppercase font-bold text-rose-400 hover:underline cursor-pointer"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Input Bar with Integrated Microphone Button */}
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
          placeholder={isListening ? "Listening to your voice..." : selectedTag ? `Ask about documents matching ${selectedTag}...` : "Ask NEXUS anything (type or click mic to speak)..."}
          className={`flex-1 bg-[#111312] border rounded-full px-4 py-2.5 text-xs text-[#F5F7F5] placeholder-[#8F9691] focus:outline-none font-sans transition-all ${
            isListening
              ? 'border-[#C9FF3D] shadow-[0_0_12px_rgba(201,255,61,0.3)] animate-pulse'
              : 'border-[#292D2B] focus:border-[#C9FF3D]/50'
          }`}
        />

        {/* Microphone Button (Speech to Text) */}
        {speechSupported && (
          <button
            type="button"
            onClick={toggleVoiceInput}
            className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${
              isListening
                ? 'bg-rose-500 text-white animate-bounce shadow-[0_0_15px_rgba(244,63,94,0.5)]'
                : 'bg-[#171A18] hover:bg-[#1D211F] text-[#8F9691] hover:text-[#C9FF3D] border border-[#292D2B]'
            }`}
            title={isListening ? "Listening... Click to stop" : "Click to speak your question"}
          >
            {isListening ? <Mic className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4" />}
          </button>
        )}

        {/* Send Button */}
        <button
          type="submit"
          disabled={!inputValue.trim()}
          className="w-9 h-9 rounded-full bg-[#C9FF3D] hover:bg-[#bbf030] disabled:opacity-40 text-[#0D0F0E] flex items-center justify-center flex-shrink-0 transition-all shadow-[0_0_12px_rgba(201,255,61,0.25)] cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
