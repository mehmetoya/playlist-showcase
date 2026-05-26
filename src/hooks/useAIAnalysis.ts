"use client";

import { useState, useEffect, useCallback } from "react";
import type { AIAnalysis, ChatMessage } from "@/types";

export function useAIAnalysis(playlistId: string) {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // playlistId değişince önceki analizi temizle
  useEffect(() => {
    setAnalysis(null);
    setError(null);
  }, [playlistId]);

  const analyze = useCallback(async () => {
    if (loading) return; // analysis kontrolü kaldırıldı
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playlistId }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setAnalysis(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }, [playlistId, loading]);

  return { analysis, loading, error, analyze };
}
export function useAIChat(playlistId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (userMessage: string) => {
      const newMessages: ChatMessage[] = [
        ...messages,
        { role: "user", content: userMessage },
      ];
      setMessages(newMessages);
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            playlistId,
            messages,
            userMessage,
          }),
        });
        const json = await res.json();
        if (json.error) throw new Error(json.error);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: json.data.reply },
        ]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Chat failed");
        setMessages(messages);
      } finally {
        setLoading(false);
      }
    },
    [playlistId, messages]
  );

  const reset = useCallback(() => setMessages([]), []);

  return { messages, loading, error, sendMessage, reset };
}