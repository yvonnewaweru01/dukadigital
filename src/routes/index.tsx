import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowRight,
  Check,
  Mail,
  Phone,
  ShoppingBag,
  Sparkles,
  Store,
  Rocket,
  MessageCircle,
} from "lucide-react";
import heroImage from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Duka Digital — E-commerce websites for Kenyan businesses" },
      {
        name: "description",
        content:
          "Duka Digital builds beautiful, fully-functional e-commerce websites for local Kenyan businesses moving online. Book a free discovery call.",
      },
      { property: "og:title", content: "Duka Digital — Your local shop, online." },
      {
        property: "og:description",
        content:
          "We design and build e-commerce stores that help Kenyan businesses sell online with confidence.",
      },
    ],
  }),
  component: Index,
});

const WHATSAPP_NUMBER = "254745230608";
const PHONE_DISPLAY = "0745 230 608";
const EMAIL = "hello@dukadigital.co.ke";

const packages = [
  {
    name: "Kibanda Starter",
    price: "KSh 15,000",
    tag: "Perfect for first-time online sellers",
    icon: Store,
    features: [
      "5-page responsive website",
      "Up to 20 products catalog",
      "M-Pesa & card checkout",
      "WhatsApp order button",
      "1 month free support",
    ],
  },
  {
    name: "Duka Growth",
    price: "KSh 30,000",
    tag: "Our most-loved package",
    icon: ShoppingBag,
    featured: true,
    features: [
      "Full e-commerce store",
      "Unlimited products & categories",
      "M-Pesa, card & Pay-on-Delivery",
      "Inventory & order dashboard",
      "SEO + Google Business setup",
      "3 months free support",
    ],
  },
  {
    name: "Soko Scale",
    price: "KSh 50,000",
    tag: "For ambitious, growing brands",
    icon: Rocket,
    features: [
      "Custom-designed storefront",
      "Multi-vendor / branch support",
      "Automated invoicing & receipts",
      "Email & SMS marketing wired in",
      "Analytics dashboard",
      "6 months priority support",
    ],
  },
];

const industries = [
  "Fashion & Apparel",
  "Food & Beverage",
  "Beauty & Cosmetics",
  "Electronics",
  "Home & Furniture",
  "Agriculture",
  "Services",
  "Other",
];

const times = [
  "09:00", "10:00", "11:00", "12:00",
  "14:00", "15:00", "16:00", "17:00",
];

const bookingSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Please enter your full name." })
    .max(80, { message: "Name must be under 80 characters." }),
  industry: z
    .string()
    .min(1, { message: "Please choose your business industry." }),
  date: z
    .string()
    .min(1, { message: "Please pick a preferred date." })
    .refine((v) => {
      const d = new Date(v + "T00:00:00");
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return !Number.isNaN(d.getTime()) && d >= today;
    }, { message: "Pick today or a future date." }),
  time: z
    .string()
    .min(1, { message: "Please pick a preferred time." })
    .regex(/^\d{2}:\d{2}$/, { message: "Invalid time." }),
  phone: z
    .string()
    .trim()
    .min(7, { message: "Phone number looks too short." })
    .max(15, { message: "Phone number looks too long." })
    .regex(/^(\+?254|0)[17]\d{8}$/, {
      message: "Use a valid Kenyan number, e.g. 07XX XXX XXX or +2547XX XXX XXX.",
    }),
});

type FormState = z.input<typeof bookingSchema>;
type FieldErrors = Partial<Record<keyof FormState, string>>;

function Index() {
  const [form, setForm] = useState<FormState>({
    name: "",
    industry: "",
    date: "",
    time: "",
    phone: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const phoneClean = form.phone.replace(/\s+/g, "");
    const parsed = bookingSchema.safeParse({ ...form, phone: phoneClean });
    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FormState | undefined;
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      toast.error("Please fix the highlighted fields and try again.");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("discovery_calls").insert({
        name: parsed.data.name,
        industry: parsed.data.industry,
        preferred_date: parsed.data.date,
        preferred_time: parsed.data.time,
        phone: parsed.data.phone,
      });
      if (error) throw error;
      toast.success("Discovery call requested!", {
        description: `We'll confirm ${parsed.data.date} at ${parsed.data.time} with you shortly.`,
      });
      setForm({ name: "", industry: "", date: "", time: "", phone: "" });
      setErrors({});
    } catch (err) {
      console.error("discovery_calls insert failed", err);
      toast.error("Couldn't send your request", {
        description: "Please try again, or WhatsApp us directly.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster position="top-center" richColors />

      {/* NAV */}
      <header className="absolute inset-x-0 top-0 z-30">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <a href="#top" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-[var(--brand-amber)] text-[var(--brand-emerald-deep)] font-display font-bold">
              D
            </span>
            <span className="font-display text-lg font-semibold tracking-tight text-[var(--brand-cream)]">
              Duka Digital
            </span>
          </a>
          <div className="hidden items-center gap-8 text-sm text-[var(--brand-cream)]/80 md:flex">
            <a href="#about" className="hover:text-[var(--brand-cream)]">About</a>
            <a href="#packages" className="hover:text-[var(--brand-cream)]">Packages</a>
            <a href="#book" className="hover:text-[var(--brand-cream)]">Book a call</a>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-[var(--brand-cream)]">
              <ThemeToggle />
            </div>
            <a
              href="#book"
              className="hidden rounded-full bg-[var(--brand-amber)] px-5 py-2 text-sm font-semibold text-[var(--brand-emerald-deep)] transition hover:brightness-105 sm:inline-flex"
            >
              Get started
            </a>
          </div>
        </nav>
      </header>

      {/* HERO */}
      <section
        id="top"
        className="relative isolate overflow-hidden pb-20 pt-32 md:pb-32 md:pt-40"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="pointer-events-none absolute inset-0 opacity-25 mix-blend-overlay">
          <img
            src={heroImage}
            alt=""
            width={1920}
            height={1080}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="relative mx-auto grid max-w-7xl gap-12 px-6 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div className="text-[var(--brand-cream)]">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--brand-cream)]/25 bg-[var(--brand-cream)]/10 px-4 py-1.5 text-xs uppercase tracking-[0.18em] backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-[var(--brand-amber)]" />
              Local businesses, online.
            </div>
            <h1 className="font-display text-5xl font-semibold leading-[1.02] sm:text-6xl md:text-7xl">
              Your <em className="not-italic text-[var(--brand-amber)]">duka</em>,
              <br /> open to the world.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-[var(--brand-cream)]/85">
              We design and build full-function e-commerce websites for Kenyan businesses
              ready to sell online — with M-Pesa, delivery and the right tools baked in.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href="#book"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-amber)] px-6 py-3 text-sm font-semibold text-[var(--brand-emerald-deep)] shadow-[var(--shadow-soft)] transition hover:brightness-105"
              >
                Book a discovery call <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#packages"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--brand-cream)]/30 px-6 py-3 text-sm font-medium text-[var(--brand-cream)] hover:bg-[var(--brand-cream)]/10"
              >
                See packages
              </a>
            </div>
            <dl className="mt-12 grid grid-cols-3 gap-6 border-t border-[var(--brand-cream)]/15 pt-8 text-[var(--brand-cream)]/90">
              {[
                ["40+", "Stores launched"],
                ["M-Pesa", "Ready, day one"],
                ["14 days", "Avg. delivery"],
              ].map(([k, v]) => (
                <div key={v}>
                  <dt className="font-display text-3xl text-[var(--brand-amber)]">{k}</dt>
                  <dd className="mt-1 text-xs uppercase tracking-wider text-[var(--brand-cream)]/70">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative hidden md:block">
            <div className="absolute -inset-4 rounded-[2rem] bg-[var(--brand-amber)]/30 blur-2xl" />
            <img
              src={heroImage}
              alt="Kenyan shop owner working online with Duka Digital"
              width={1600}
              height={1200}
              className="relative aspect-[4/5] w-full rounded-[2rem] object-cover shadow-[var(--shadow-soft)]"
            />
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="relative mx-auto max-w-7xl px-6 py-24 md:py-32">
        <div className="grid gap-16 md:grid-cols-[0.9fr_1.1fr] md:items-start">
          <div>
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--brand-clay)]">
              About Duka Digital
            </span>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-tight md:text-5xl">
              We build online dukas <em className="text-[var(--brand-clay)]">that actually sell.</em>
            </h2>
          </div>
          <div className="space-y-6 text-lg text-muted-foreground">
            <p>
              Duka Digital is a Nairobi-based web studio helping local businesses make the
              jump online — without the jargon, without the bloat, and without breaking
              the bank.
            </p>
            <p>
              From a single-shop boutique to multi-branch wholesalers, we craft
              e-commerce stores with proper M-Pesa checkout, delivery flows, inventory
              tools and the kind of design that earns trust at first scroll.
            </p>
            <div className="grid gap-4 pt-2 sm:grid-cols-2">
              {[
                "Built mobile-first for Kenyan buyers",
                "M-Pesa, card & Pay-on-Delivery",
                "Trained on your products, not templates",
                "Real support from real humans",
              ].map((f) => (
                <div key={f} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-6 w-6 place-items-center rounded-full bg-[var(--brand-emerald)] text-[var(--brand-cream)]">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-base text-foreground">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PACKAGES */}
      <section id="packages" className="bg-[var(--brand-emerald-deep)] py-24 text-[var(--brand-cream)] md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--brand-amber)]">
              Packages
            </span>
            <h2 className="mt-4 font-display text-4xl font-semibold md:text-5xl">
              Pick a plan that grows with your shop.
            </h2>
            <p className="mt-4 text-[var(--brand-cream)]/75">
              Transparent pricing. No hidden fees. Every package can be tailored to your
              business after the discovery call.
            </p>
          </div>
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {packages.map((p) => {
              const Icon = p.icon;
              return (
                <article
                  key={p.name}
                  className={`relative flex flex-col rounded-3xl p-8 transition ${
                    p.featured
                      ? "bg-[var(--brand-amber)] text-[var(--brand-emerald-deep)] shadow-[var(--shadow-soft)] md:-translate-y-4"
                      : "bg-[var(--brand-cream)]/[0.04] text-[var(--brand-cream)] ring-1 ring-[var(--brand-cream)]/10 hover:bg-[var(--brand-cream)]/[0.07]"
                  }`}
                >
                  {p.featured && (
                    <span className="absolute -top-3 left-8 rounded-full bg-[var(--brand-emerald-deep)] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--brand-amber)]">
                      Most popular
                    </span>
                  )}
                  <Icon className="h-8 w-8" />
                  <h3 className="mt-6 font-display text-2xl font-semibold">{p.name}</h3>
                  <p className={`mt-1 text-sm ${p.featured ? "text-[var(--brand-emerald-deep)]/75" : "text-[var(--brand-cream)]/70"}`}>
                    {p.tag}
                  </p>
                  <div className="mt-6 font-display text-4xl font-semibold">{p.price}</div>
                  <ul className="mt-6 space-y-3 text-sm">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#book"
                    className={`mt-8 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${
                      p.featured
                        ? "bg-[var(--brand-emerald-deep)] text-[var(--brand-amber)] hover:brightness-110"
                        : "bg-[var(--brand-cream)] text-[var(--brand-emerald-deep)] hover:brightness-105"
                    }`}
                  >
                    Start with {p.name.split(" ")[0]} <ArrowRight className="h-4 w-4" />
                  </a>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* BOOK A CALL */}
      <section id="book" className="mx-auto max-w-7xl px-6 py-24 md:py-32">
        <div className="grid gap-12 md:grid-cols-[0.9fr_1.1fr] md:items-start">
          <div>
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--brand-clay)]">
              Discovery call
            </span>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-tight md:text-5xl">
              Let's talk about your <em className="text-[var(--brand-clay)]">business.</em>
            </h2>
            <p className="mt-6 max-w-md text-muted-foreground">
              Book a free 30-minute call. We'll understand your products, your customers
              and what online success looks like for you — then propose the best way
              forward.
            </p>
            <ul className="mt-8 space-y-3 text-sm">
              {[
                "Free, no obligation",
                "On Zoom, Google Meet or WhatsApp",
                "Walk away with a clear plan",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[var(--brand-emerald)]" /> {f}
                </li>
              ))}
            </ul>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-3xl bg-card p-8 shadow-[var(--shadow-card)] ring-1 ring-border"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="name">Your name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Jane Wanjiku"
                  maxLength={80}
                  className="mt-2"
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Business industry</Label>
                <Select
                  value={form.industry}
                  onValueChange={(v) => setForm({ ...form, industry: v })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((i) => (
                      <SelectItem key={i} value={i}>{i}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date">Preferred date</Label>
                <Input
                  id="date"
                  type="date"
                  min={today}
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Preferred time</Label>
                <Select
                  value={form.time}
                  onValueChange={(v) => setForm({ ...form, time: v })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Pick a time" />
                  </SelectTrigger>
                  <SelectContent>
                    {times.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="phone">Phone number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="07XX XXX XXX"
                  maxLength={15}
                  className="mt-2"
                />
              </div>
            </div>
            <Button
              type="submit"
              size="lg"
              className="mt-6 w-full rounded-full bg-[var(--brand-emerald)] text-[var(--brand-cream)] hover:bg-[var(--brand-emerald-deep)]"
            >
              Book my discovery call
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              We'll confirm by phone or WhatsApp within one business day.
            </p>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[var(--brand-emerald-deep)] text-[var(--brand-cream)]">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-md bg-[var(--brand-amber)] font-display font-bold text-[var(--brand-emerald-deep)]">
                D
              </span>
              <span className="font-display text-lg font-semibold">Duka Digital</span>
            </div>
            <p className="mt-4 max-w-xs text-sm text-[var(--brand-cream)]/70">
              E-commerce websites built for Kenyan businesses. Made with care in Nairobi.
            </p>
          </div>
          <div>
            <h4 className="font-display text-base font-semibold text-[var(--brand-amber)]">
              Get in touch
            </h4>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <a href={`mailto:${EMAIL}`} className="inline-flex items-center gap-2 hover:text-[var(--brand-amber)]">
                  <Mail className="h-4 w-4" /> {EMAIL}
                </a>
              </li>
              <li>
                <a href={`tel:+254745230608`} className="inline-flex items-center gap-2 hover:text-[var(--brand-amber)]">
                  <Phone className="h-4 w-4" /> {PHONE_DISPLAY}
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 hover:text-[var(--brand-amber)]"
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp us
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-base font-semibold text-[var(--brand-amber)]">
              Explore
            </h4>
            <ul className="mt-4 space-y-3 text-sm text-[var(--brand-cream)]/80">
              <li><a href="#about" className="hover:text-[var(--brand-amber)]">About</a></li>
              <li><a href="#packages" className="hover:text-[var(--brand-amber)]">Packages</a></li>
              <li><a href="#book" className="hover:text-[var(--brand-amber)]">Book a call</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[var(--brand-cream)]/10">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-6 text-xs text-[var(--brand-cream)]/60 md:flex-row">
            <span>© {new Date().getFullYear()} Duka Digital. All rights reserved.</span>
            <span>Nairobi, Kenya</span>
          </div>
        </div>
      </footer>

      {/* WhatsApp floating button */}
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat with Duka Digital on WhatsApp"
        className="fixed bottom-6 right-6 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[var(--shadow-soft)] transition hover:scale-105"
      >
        <MessageCircle className="h-7 w-7" />
      </a>
    </div>
  );
}
