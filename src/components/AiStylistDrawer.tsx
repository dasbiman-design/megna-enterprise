import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Send, X, Bot, User } from "lucide-react";
import { api } from "../api-client";

interface AiStylistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currency: "INR" | "BDT";
}

export default function AiStylistDrawer({ isOpen, onClose, currency }: AiStylistDrawerProps) {
  const [messages, setMessages] = useState<{ role: "user" | "model"; text: string }[]>([
    {
      role: "model",
      text: "Greetings, elite client. I am the **Megna Luxe Stylist**. Tell me what style mood, festival, or footwear silhouette you are looking to elevate today."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, text: m.text }));
      const response = await api.askStylist(userText, history);
      setMessages((prev) => [...prev, { role: "model", text: response.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "model", text: "Apologies, my luxury styling servers are currently refresh-tuning. Please try asking again shortly!" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="ai-stylist-panel" className="fixed inset-y-0 right-0 w-full sm:w-96 z-50 bg-[#121212] text-white shadow-2xl flex flex-col border-l border-neutral-800 transition-transform duration-300">
      {/* Drawer Header */}
      <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-orange-500 animate-pulse" />
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider">Megna AI Stylist</h3>
            <p className="text-[10px] text-neutral-400">Virtual Wardrobe Concierge</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-neutral-800 rounded-full transition-colors text-neutral-400 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4" ref={scrollRef}>
        {messages.map((m, idx) => (
          <div key={idx} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role !== "user" && (
              <div className="w-7 h-7 rounded-full bg-orange-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                <Bot className="w-4 h-4" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-xl p-3 text-xs leading-relaxed ${
                m.role === "user"
                  ? "bg-white text-black font-medium rounded-tr-none"
                  : "bg-neutral-900 text-neutral-200 border border-neutral-800 rounded-tl-none"
              }`}
            >
              {/* Parse rudimentary markdown with simple paragraphs/bolding */}
              {m.text.split("\n").map((line, lIdx) => {
                let formatted = line;
                // Simple bold parsing
                if (line.includes("**")) {
                  const parts = line.split("**");
                  return (
                    <p key={lIdx} className="mb-1">
                      {parts.map((p, pIdx) => (pIdx % 2 === 1 ? <strong key={pIdx} className="text-orange-400 font-bold">{p}</strong> : p))}
                    </p>
                  );
                }
                return (
                  <p key={lIdx} className="mb-1">
                    {formatted}
                  </p>
                );
              })}
            </div>
            {m.role === "user" && (
              <div className="w-7 h-7 rounded-full bg-neutral-800 flex items-center justify-center text-[10px] font-bold shrink-0">
                <User className="w-4 h-4 text-neutral-400" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-7 h-7 rounded-full bg-orange-600 flex items-center justify-center text-xs text-white shrink-0 animate-spin">
              ⌛
            </div>
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl rounded-tl-none p-3 text-xs text-neutral-400">
              Curating high-fashion palettes for you...
            </div>
          </div>
        )}
      </div>

      {/* Quick Suggestions */}
      <div className="p-3 bg-neutral-900/50 border-t border-neutral-800 flex flex-wrap gap-2 justify-center">
        {[
          "Saree for a wedding",
          "Athletic comfort combo",
          "Premium boardroom loafers",
          "Active Coupon Sale"
        ].map((s, sIdx) => (
          <button
            key={sIdx}
            onClick={() => {
              setInput(s);
            }}
            className="px-2.5 py-1 rounded-full bg-neutral-800 text-[10px] hover:bg-neutral-700 hover:text-orange-400 transition-colors"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Footer Form */}
      <form onSubmit={handleSend} className="p-4 border-t border-neutral-800 bg-neutral-950 flex gap-2">
        <input
          id="stylist-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask stylist: Saree, Heels, Loafers, active coupons..."
          className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-orange-500 text-white"
        />
        <button
          id="stylist-send-btn"
          type="submit"
          disabled={loading}
          className="bg-orange-600 hover:bg-orange-500 text-white p-2.5 rounded-lg transition-all duration-150 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
