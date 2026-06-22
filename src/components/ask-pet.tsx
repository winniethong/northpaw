"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function AskPet({
  petId,
  petName,
}: {
  petId: string;
  petName: string;
}) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = question.trim();
    if (!q || pending) return;
    setPending(true);
    setError(null);
    setAnswer("");

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ petId, question: q }),
      });
      if (!res.ok || !res.body) {
        setError((await res.text()) || "Something went wrong.");
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        setAnswer((prev) => prev + decoder.decode(value, { stream: true }));
      }
    } catch {
      setError("Could not reach the assistant.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="size-5 text-primary" aria-hidden="true" />
          Ask about {petName}&apos;s records
        </CardTitle>
        <CardDescription>
          Answers come only from {petName}&apos;s uploaded documents. Your
          records are sent to the AI provider to generate an answer.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <form onSubmit={onSubmit} className="flex gap-2">
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. When is the next vaccine due?"
          />
          <Button type="submit" disabled={pending || !question.trim()}>
            {pending ? "Asking…" : "Ask"}
          </Button>
        </form>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        {answer && (
          <div className="whitespace-pre-wrap rounded-lg border bg-muted/40 p-4 text-sm">
            {answer}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
