import type { Metadata } from "next";
import { Notice } from "@/components/ui/input";

export const metadata: Metadata = { title: "Pricing" };

const plans = [
  {
    name: "Free",
    price: "$0",
    detail: "One CV, basic templates, and a small allowance for voice and AI edits.",
  },
  {
    name: "Pro",
    price: "$3.99/mo",
    detail: "More versions, higher allowances, job tailoring, and premium templates.",
  },
  {
    name: "Job-search pass",
    price: "$5.99",
    detail: "A short pass with a defined duration. The exact window is not final.",
  },
];

export default function PricingPage() {
  return (
    <main id="main" className="mx-auto grid max-w-6xl gap-8 px-4 py-16">
      <div className="max-w-2xl">
        <h1 className="serif text-4xl">Pricing hypothesis</h1>
        <p className="mt-3 text-ink-soft">
          These numbers are a starting experiment from the product spec. Checkout
          is not open.
        </p>
      </div>
      <Notice>No plan can be purchased yet. Nothing on this page charges a card.</Notice>
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <article
            key={plan.name}
            className="grid gap-3 rounded-3xl border border-line bg-paper-raised p-6"
          >
            <h2 className="serif text-2xl">{plan.name}</h2>
            <p className="text-lg font-semibold">{plan.price}</p>
            <p className="text-sm leading-6 text-ink-soft">{plan.detail}</p>
            <p className="text-sm font-semibold text-ink-soft">Not for sale</p>
          </article>
        ))}
      </div>
    </main>
  );
}
