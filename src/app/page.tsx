import Link from "next/link";
import {
  Activity,
  Calculator,
  CalendarCheck,
  FileText,
  ShieldCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PublicHeader } from "@/components/public-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const featureCards = [
  {
    title: "Health Timeline",
    description: "Every visit, vaccine, symptom, and diagnosis in one view.",
    icon: Activity,
  },
  {
    title: "Document Vault",
    description: "PDFs, labs, insurance papers, and notes filed by pet.",
    icon: FileText,
  },
  {
    title: "Insurance Dashboard",
    description: "Deductibles, limits, and reimbursement details without the portal hunt.",
    icon: ShieldCheck,
  },
  {
    title: "Care Cost Planner",
    description: "Estimates for dental cleanings, bloodwork, surgery, and more.",
    icon: Calculator,
  },
  {
    title: "Preventative Care",
    description: "A clearer view of what is due, what is coming, and what to ask the vet.",
    icon: CalendarCheck,
  },
];

export default function Home() {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <section className="border-b border-border/70">
        <PublicHeader />

        <div className="mx-auto grid min-h-[680px] max-w-6xl items-center px-6 py-20">
          <div className="max-w-4xl">
            <Badge variant="outline" className="mb-8 border-secondary/40 text-secondary">
              Built for modern pet households
            </Badge>
            <h1 className="max-w-4xl font-serif text-5xl font-semibold leading-[1.02] tracking-tight text-foreground md:text-7xl">
              Your pet&apos;s health and the cost of caring well.
            </h1>
            <p className="mt-8 max-w-2xl text-xl leading-8 text-muted-foreground md:text-2xl">
              Records, insurance, care history, and future costs in one calm
              place for the pets you are building a life around.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className={cn(buttonVariants({ size: "lg" }), "h-12 px-6")}
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="mission" className="border-b border-border/70 bg-card/25">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            The mission
          </p>
          <h2 className="mt-6 max-w-4xl font-serif text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
            Every feature answers one of two questions.
          </h2>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            <Card className="border-border/80 bg-card/80">
              <CardHeader>
                <CardTitle className="text-2xl text-primary">
                  How is my pet doing?
                </CardTitle>
                <CardDescription className="text-base leading-7">
                  Timeline, records, vaccinations, notes, and the little things
                  you usually remember five minutes after the vet leaves the room.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-border/80 bg-card/80">
              <CardHeader>
                <CardTitle className="text-2xl text-secondary">
                  What will this cost me?
                </CardTitle>
                <CardDescription className="text-base leading-7">
                  Insurance details and care estimates, so a scary bill feels a
                  little less mysterious before you make the call.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-muted-foreground">
          What is inside
        </p>
        <h2 className="mt-6 max-w-4xl font-serif text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
          Five things, designed to work as one.
        </h2>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {featureCards.map((feature) => {
            const Icon = feature.icon;

            return (
              <Card
                key={feature.title}
                className="border-border/80 bg-card/70 transition-colors hover:border-secondary/60"
              >
                <CardHeader>
                  <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-secondary/15 text-secondary">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-2xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-base leading-7 text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </main>
  );
}
