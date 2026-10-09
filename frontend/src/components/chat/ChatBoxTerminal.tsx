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
  Hash
} from 'lucide-react';
import { nexusData } from '../../data/demoData';
import { nexusApi } from '../../services/api';

interface ChatBoxTerminalProps {
  onOpenUpload: () => void;
  onOpenEvidence: (item?: any) => void;
}

const cleanTextForSpeech = (rawText: string) => {
  return rawText
    .replace(/^#+\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^[•\-\*]\s+/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/\n+/g, '. ');
};

const renderFormattedText = (rawText: string) => {
  if (!rawText) return null;
  const lines = rawText.split('\n');

  return (
    <div className="space-y-1.5 font-sans leading-relaxed text-xs">
      {lines.map((line, lIdx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={lIdx} className="h-1" />;

        if (trimmed.startsWith('###')) {
          const title = trimmed.replace(/^#+\s*/, '');
          return (
            <h4 key={lIdx} className="font-mono font-bold text-[#C9FF3D] text-xs pt-1 pb-0.5 tracking-wide">
              {title}
            </h4>
          );
        }

        const isBullet = trimmed.startsWith('•') || trimmed.startsWith('- ') || trimmed.startsWith('* ');
        const cleanContent = isBullet ? trimmed.replace(/^[•\-\*]\s*/, '') : trimmed;

        const parts = cleanContent.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);

        const renderedLine = parts.map((part, pIdx) => {
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

        if (isBullet) {
          return (
            <div key={lIdx} className="flex items-start space-x-2 pl-1">
              <span className="text-[#C9FF3D] font-bold text-xs mt-0.5">•</span>
              <div className="flex-1">{renderedLine}</div>
            </div>
          );
        }

        return <p key={lIdx}>{renderedLine}</p>;
      })}
    </div>
  );
};

export const ChatBoxTerminal: React.FC<ChatBoxTerminalProps> = ({
  onOpenUpload,
  onOpenEvidence
}) => {
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'nexus'; text: string; confidence?: number; citations?: string[] }>>([
    {
      sender: 'nexus',
      text: "I've initialized the multi-agent document intelligence graph.\n\nAsk me any question via text or voice about your uploaded files, cross-document discrepancies, extracted facts, or compliance parameters.",
      confidence: 96.5,
      citations: []
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  
  // Voice Input (Speech Recognition) State
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  // Voice Output (Speech Synthesis) State
  const [autoVoiceReply, setAutoVoiceReply] = useState(false);
  const [speakingMsgIdx, setSpeakingMsgIdx] = useState<number | null>(null);

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

      const newMsg = {
        sender: 'nexus' as const,
        text: response.answer || 'Query evaluated against verified fact ledger.',
        confidence: Math.round((response.confidence || 0.95) * 1000) / 10,
        citations: citations.length > 0 ? citations : undefined
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
      <div className="flex-1 space-y-3.5 overflow-y-auto max-h-60 pr-1 my-2 scrollbar-thin scrollbar-thumb-[#292D2B]">
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
