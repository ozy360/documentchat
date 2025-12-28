"use client";

import { createClient } from "@/lib/supabase/client";
import { Send, Bot, User, Copy, Check, MoreHorizontal } from "lucide-react";
import { useState, FormEvent, KeyboardEvent, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

interface HistoryItem {
  role: "user" | "assistant";
  content: string;
}

interface RightSectionProps {
  onDocumentClick?: (documentName: string) => void;
}

export default function RightSection({
  onDocumentClick,
}: RightSectionProps = {}) {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Function to copy text to clipboard
  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Failed to copy.");
    }
  };

  // Function to insert document name at cursor position
  const insertDocumentName = (documentName: string) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);
      const newText = before + `"${documentName}"` + after;
      setQuery(newText);

      // Set cursor position after the inserted text
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd =
          start + documentName.length + 2; // +2 for quotes
        textarea.focus();
      }, 0);
    }
  };

  // Expose function globally for document insertion
  useEffect(() => {
    (window as any).insertDocumentToPrompt = insertDocumentName;
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        const { data, error } = await supabase
          .from("chat_history")
          .select("role, content")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: true });

        if (error) {
          console.error("Error fetching history:", error);
          toast.error("Could not load chat history.");
        } else if (data) {
          setHistory(
            data.map((msg) => ({
              role: msg.role as "user" | "assistant",
              content: msg.content,
            }))
          );
        }
      }
      setIsHistoryLoading(false);
    };

    fetchHistory();
  }, []);

  const handleSubmit = async (e?: FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    const currentQuery = query.trim();
    if (currentQuery) {
      setHistory((prev) => [...prev, { role: "user", content: currentQuery }]);
      setQuery("");

      const supabase = createClient();
      const {
        data: { session },
        error: authError,
      } = await supabase.auth.getSession();

      if (authError || !session?.user) {
        console.error("Auth Error:", authError);
        toast.error("Please log in to send history.");
        setHistory((prev) => prev.slice(0, -1));
        return;
      }

      // Save user history to Supabase
      const { error: userHistoryError } = await supabase
        .from("chat_history")
        .insert({
          user_id: session.user.id,
          role: "user",
          content: currentQuery,
        });

      if (userHistoryError) {
        console.error("Error saving user history:", userHistoryError);
        toast.error("Failed to save your history.");
      }

      setIsLoading(true);
      try {
        const formData = new FormData();
        formData.append("email", session.user.email || "");
        formData.append("content", currentQuery);
        formData.append("userId", session.user.id);

        const response = await fetch("/api/chat", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.message?.content) {
          setHistory((prev) => [
            ...prev,
            { role: "assistant", content: data.message.content },
          ]);

          // Save assistant history to Supabase
          const { error: assistantHistoryError } = await supabase
            .from("chat_history")
            .insert({
              user_id: session.user.id,
              role: "assistant",
              content: data.message.content,
            });

          if (assistantHistoryError) {
            console.error(
              "Error saving assistant history:",
              assistantHistoryError
            );
            toast.error("Failed to save assistant's response.");
          }
        }
      } catch (error: any) {
        console.error("Error submitting:", error);
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative flex flex-col w-full max-w-3xl mx-auto min-h-screen">
      <Toaster />
      <div className="flex-1 p-6 pb-32">
        {isHistoryLoading ? (
          <div className="flex justify-center items-center h-[50vh]">
            <MoreHorizontal className="h-8 w-8 animate-pulse text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
            {history.map((historyItem, index) => (
              <div
                key={index}
                className={`flex items-start gap-4 ${
                  historyItem.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {historyItem.role === "assistant" && (
                  <div className="flex items-center gap-1">
                    <div className="bg-muted rounded-full p-2 flex-shrink-0">
                      <Bot className="h-5 w-5" />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground"
                      onClick={() =>
                        copyToClipboard(historyItem.content, index)
                      }
                    >
                      {copiedIndex === index ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                      <span className="sr-only">Copy message</span>
                    </Button>
                  </div>
                )}
                <div
                  className={`max-w-xl rounded-lg p-3 whitespace-pre-wrap ${
                    historyItem.role === "user"
                      ? "bg-zinc-800 text-zinc-100"
                      : "bg-muted"
                  }`}
                >
                  {historyItem.content}
                </div>
                {historyItem.role === "user" && (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground"
                      onClick={() =>
                        copyToClipboard(historyItem.content, index)
                      }
                    >
                      {copiedIndex === index ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                      <span className="sr-only">Copy message</span>
                    </Button>
                    <div className="bg-zinc-800 text-zinc-100 rounded-full p-2 flex-shrink-0">
                      <User className="h-5 w-5" />
                    </div>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-4 justify-start">
                <div className="flex items-center gap-1">
                  <div className="bg-muted rounded-full p-2 flex-shrink-0">
                    <Bot className="h-5 w-5" />
                  </div>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <MoreHorizontal className="h-5 w-5 animate-pulse" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* This is the input area fixed to the bottom */}
      <div
        id="prompt-input"
        className={
          history.length === 0 && !isHistoryLoading
            ? "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl px-4"
            : "sticky bottom-0 z-10 w-full max-w-3xl bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 px-4"
        }
      >
        <div className="relative rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-3">
            <form
              onSubmit={handleSubmit}
              className="flex w-full items-center gap-3"
            >
              <Textarea
                ref={textareaRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 resize-none self-center bg-transparent min-h-[3rem] max-h-48 rounded-lg"
                rows={1}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!query.trim() || isLoading}
                className="flex-shrink-0 h-11 w-11 rounded-lg"
              >
                <Send className="h-5 w-5" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
