"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ArrowUp, Menu, X } from "lucide-react";

const TOC = [
  { id: "s1",  num: 1,  title: "Introduction" },
  { id: "s2",  num: 2,  title: "Who We Are" },
  { id: "s3",  num: 3,  title: "Scope of This Policy" },
  { id: "s4",  num: 4,  title: "Data We Collect" },
  { id: "s5",  num: 5,  title: "How We Collect Data" },
  { id: "s6",  num: 6,  title: "Why We Process Data" },
  { id: "s7",  num: 7,  title: "Lawful Bases" },
  { id: "s8",  num: 8,  title: "Cookies" },
  { id: "s9",  num: 9,  title: "Sharing Data" },
  { id: "s10", num: 10, title: "Cross-Border Transfers" },
  { id: "s11", num: 11, title: "Data Security" },
  { id: "s12", num: 12, title: "Data Breaches" },
  { id: "s13", num: 13, title: "Data Retention" },
  { id: "s14", num: 14, title: "Your Rights" },
  { id: "s15", num: 15, title: "Children" },
  { id: "s16", num: 16, title: "Automated Decisions" },
  { id: "s17", num: 17, title: "Third-Party Links" },
  { id: "s18", num: 18, title: "Marketing" },
  { id: "s19", num: 19, title: "Policy Changes" },
  { id: "s20", num: 20, title: "Contact Us" },
  { id: "s21", num: 21, title: "Complaints" },
];

function SectionHeading({ num, title }) {
  return (
    <div className="mb-4 flex items-center gap-3 border-l-4 border-leather pl-4">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-leather text-xs font-bold text-cream">
        {num}
      </span>
      <h2 className="text-xl font-semibold text-ink">{title}</h2>
    </div>
  );
}

function SubHeading({ children }) {
  return (
    <h3 className="mb-2 mt-5 flex items-center gap-2 text-base font-semibold text-leather">
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
      {children}
    </h3>
  );
}

function BulletList({ items }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-neutral-800">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-leather/60" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Callout({ children }) {
  return (
    <div className="my-4 rounded-r-xl border-l-4 border-gold bg-gold/10 px-5 py-4 text-sm text-neutral-800">
      {children}
    </div>
  );
}

export default function PrivacyPolicy() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeId, setActiveId] = useState("s1");
  const [showTop, setShowTop] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
      setShowTop(window.scrollY > 500);
      const sections = document.querySelectorAll("section[id]");
      let current = "s1";
      sections.forEach((el) => {
        if (el.getBoundingClientRect().top <= 120) current = el.id;
      });
      setActiveId(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTocOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-espresso via-leather to-espresso">
      {/* Reading progress bar */}
      <div className="fixed left-0 top-0 z-50 h-0.5 w-full bg-white/10">
        <div
          className="h-full bg-gradient-to-r from-gold via-cream to-gold transition-all duration-100"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Header */}
      <header className="sticky top-0.5 z-40 border-b border-white/10 bg-espresso/80 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <img src="/leddar-logo.svg" alt="Leddar" className="h-10 w-auto" />
          <div className="flex items-center gap-4">
            <span className="hidden text-xs text-white/50 sm:inline">Premium Leather Manufacturing</span>
            <button
              className="flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-medium text-white/70 hover:bg-white/10 lg:hidden"
              onClick={() => setTocOpen(!tocOpen)}
            >
              {tocOpen ? <X className="h-3.5 w-3.5" /> : <Menu className="h-3.5 w-3.5" />}
              Contents
            </button>
          </div>
        </div>

        {tocOpen && (
          <div className="border-t border-white/10 bg-espresso/95 px-4 py-4 lg:hidden">
            <div className="grid grid-cols-2 gap-1">
              {TOC.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-colors ${
                    activeId === item.id ? "bg-leather/30 text-gold font-medium" : "text-white/60 hover:bg-white/10"
                  }`}
                >
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                    activeId === item.id ? "bg-gold text-espresso" : "bg-white/10 text-white/50"
                  }`}>
                    {item.num}
                  </span>
                  {item.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      <div className="mx-auto w-full max-w-7xl px-4 pt-10 pb-20 sm:px-6 lg:px-8">
        <div className="flex gap-8 lg:gap-12">

          {/* Sidebar TOC */}
          <aside className="hidden w-56 shrink-0 lg:block">
            <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-white/30">Contents</p>
              <nav className="space-y-0.5">
                {TOC.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollTo(item.id)}
                    className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-colors ${
                      activeId === item.id ? "bg-leather/30 text-gold font-semibold" : "text-white/50 hover:bg-white/10"
                    }`}
                  >
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-colors ${
                      activeId === item.id ? "bg-gold text-espresso" : "bg-white/10 text-white/40"
                    }`}>
                      {item.num}
                    </span>
                    {item.title}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <main className="min-w-0 flex-1">
            <Link href="/signup" className="mb-6 inline-flex items-center gap-1.5 text-sm text-gold/80 hover:text-gold transition-colors">
              <ChevronLeft className="h-4 w-4" />
              Back to Signup
            </Link>

            {/* Hero card */}
            <div className="mb-8 rounded-3xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
              <div className="rounded-2xl border border-surface-500 bg-cream px-8 py-8 shadow-card">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-leather/10 px-3 py-1 text-xs font-semibold text-leather">
                  <span className="h-1.5 w-1.5 rounded-full bg-leather" />
                  Legal Document
                </div>
                <h1 className="mb-4 text-4xl font-bold text-ink">Privacy Policy</h1>
                <div className="flex flex-wrap gap-3">
                  {[["Effective", "May 1, 2026"], ["Version", "v1.0.0.0"], ["Platform", "LEDDAR"], ["Operator", "Leddar Systems Limited"]].map(([label, value]) => (
                    <div key={label} className="rounded-lg border border-surface-400 bg-surface-100 px-3 py-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-neutral-600">{label}</span>
                      <p className="text-xs font-medium text-ink">{value}</p>
                    </div>
                  ))}
                  <div className="rounded-lg border border-surface-400 bg-surface-100 px-3 py-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-neutral-600">Website</span>
                    <p className="text-xs font-medium">
                      <a href="https://www.myleddar.com" className="text-leather underline hover:text-espresso">www.myleddar.com</a>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sections */}
            <div className="space-y-4">

              {[
                {
                  id: "s1", num: 1, title: "Introduction",
                  content: (
                    <>
                      <p className="mb-3 text-neutral-800">LEDDAR respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how LEDDAR collects, uses, stores, shares, and protects personal data when you:</p>
                      <BulletList items={["visit our website", "create an account", "apply as a Brand or Artisan", "complete verification", "submit a production request", "request a sample", "make or receive payments", "communicate through the platform", "contact support", "otherwise use LEDDAR's services"]} />
                      <p className="mt-3 text-neutral-800">This Privacy Policy should be read together with our{" "}<Link href="/terms-and-conditions" target="_blank" rel="noopener noreferrer" className="text-leather underline hover:text-espresso">Terms &amp; Conditions</Link>{" "}and any related policies referenced on the platform.</p>
                    </>
                  )
                },
                {
                  id: "s2", num: 2, title: "Who We Are",
                  content: (
                    <>
                      <p className="mb-3 text-neutral-800">LEDDAR is a technology platform that connects Brands and Artisans through structured workflows for samples, production requests, production tracking, quality control, and selected payment-related flows.</p>
                      <p className="mb-3 text-neutral-800">For the purposes of applicable data protection law, LEDDAR may act as a data controller in relation to personal data collected for its own platform operations. The Nigeria Data Protection Act 2023 recognizes obligations for both data controllers and data processors.</p>
                    </>
                  )
                },
                {
                  id: "s3", num: 3, title: "Scope of This Policy",
                  content: (
                    <>
                      <p className="mb-3 text-neutral-800">This Privacy Policy applies to:</p>
                      <BulletList items={["Brands", "Artisans", "website visitors", "business contacts", "support users", "anyone whose personal data is processed by LEDDAR in connection with the platform"]} />
                      <p className="mt-3 text-neutral-800">It does not apply to third-party websites, services, or payment pages linked from or integrated into the platform. Those providers may have their own privacy policies.</p>
                    </>
                  )
                },
              ].map(({ id, num, title, content }) => (
                <div key={id} className="rounded-3xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
                  <div className="rounded-2xl border border-surface-500 bg-cream px-8 py-7 shadow-card">
                    <section id={id} className="scroll-mt-24">
                      <SectionHeading num={num} title={title} />
                      {content}
                    </section>
                  </div>
                </div>
              ))}

              <div className="rounded-3xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
                <div className="rounded-2xl border border-surface-500 bg-cream px-8 py-7 shadow-card">
                  <section id="s4" className="scroll-mt-24">
                    <SectionHeading num={4} title="The Personal Data We Collect" />
                    <p className="mb-4 text-neutral-800">Depending on how you use LEDDAR, we may collect the following categories of personal data.</p>
                    <SubHeading>4.1 Identity Data</SubHeading>
                    <BulletList items={["full name", "date of birth, where required", "gender, where required", "government-issued identification details, where required", "photograph or selfie, where required for verification"]} />
                    <SubHeading>4.2 Contact Data</SubHeading>
                    <BulletList items={["email address", "phone number", "WhatsApp number", "business address", "delivery address", "billing address"]} />
                    <SubHeading>4.3 Business and Profile Data</SubHeading>
                    <BulletList items={["business name", "brand or workshop name", "role or title", "category or specialization", "city, state, and country", "production capacity or service profile", "portfolio and uploaded work samples"]} />
                    <SubHeading>4.4 Verification Data</SubHeading>
                    <BulletList items={["KYC documents", "identity validation results", "bank account verification information", "compliance-related information", "fraud screening results"]} />
                    <SubHeading>4.5 Transaction and Order Data</SubHeading>
                    <BulletList items={["quote requests and production requests", "product specifications, quantity, and timeline details", "invoice, payment, and payout records", "refund or cancellation records", "support history related to orders"]} />
                    <SubHeading>4.6 Communications Data</SubHeading>
                    <BulletList items={["messages sent through the platform", "emails to support", "WhatsApp or SMS messages sent through LEDDAR channels", "call notes where support interactions are recorded internally"]} />
                    <SubHeading>4.7 Technical and Usage Data</SubHeading>
                    <BulletList items={["IP address, browser type, device type, operating system", "pages visited, date and time of access, referring links", "actions taken on the platform", "cookie and analytics data"]} />
                    <SubHeading>4.8 Sensitive Personal Data</SubHeading>
                    <Callout>
                      Where necessary and lawful, we may process sensitive personal data such as government ID data and certain biometric-style verification inputs used by identity verification providers. Nigeria&apos;s Data Protection Act 2023 specifically addresses sensitive personal data and imposes additional obligations around such processing.
                    </Callout>
                  </section>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
                <div className="rounded-2xl border border-surface-500 bg-cream px-8 py-7 shadow-card">
                  <section id="s5" className="scroll-mt-24">
                    <SectionHeading num={5} title="How We Collect Personal Data" />
                    <SubHeading>5.1 Directly from You</SubHeading>
                    <p className="mb-2 text-neutral-800">When you create an account, complete forms, request pricing, request a sample, submit a production request, upload documents, or contact us.</p>
                    <SubHeading>5.2 Automatically</SubHeading>
                    <p className="mb-2 text-neutral-800">When you use the platform, we may collect technical and usage data through cookies, logs, analytics tools, and related technologies.</p>
                    <SubHeading>5.3 From Third Parties</SubHeading>
                    <p className="text-neutral-800">We may receive information from payment providers, verification providers, analytics providers, fraud prevention tools, customer support tools, and publicly available business sources where lawful.</p>
                  </section>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
                <div className="rounded-2xl border border-surface-500 bg-cream px-8 py-7 shadow-card">
                  <section id="s6" className="scroll-mt-24">
                    <SectionHeading num={6} title="Why We Process Your Personal Data" />
                    <p className="mb-4 text-neutral-800">We process personal data only where we have a lawful basis and a legitimate operational reason to do so.</p>
                    <SubHeading>6.1 Provide Platform Services</SubHeading>
                    <p className="mb-3 text-neutral-800">Create and manage accounts, onboard users, enable workflows, manage dashboards, records, and support interactions.</p>
                    <SubHeading>6.2 Verify Users and Prevent Fraud</SubHeading>
                    <p className="mb-3 text-neutral-800">Complete KYC checks, validate identity or business details, screen for fraud and abuse, enforce platform trust and safety rules.</p>
                    <SubHeading>6.3 Process Payments and Payouts</SubHeading>
                    <p className="mb-3 text-neutral-800">Support billing records, confirm payment status, support artisan payout workflows, handle refunds, reversals, and reconciliation.</p>
                    <SubHeading>6.4 Support Operations and Customer Care</SubHeading>
                    <p className="mb-3 text-neutral-800">Respond to user requests, resolve complaints, investigate incidents, and improve user experience.</p>
                    <SubHeading>6.5 Improve the Platform</SubHeading>
                    <p className="mb-3 text-neutral-800">Analyze usage, measure performance, fix bugs, improve features, and understand demand and supply behavior.</p>
                    <SubHeading>6.6 Marketing and Communications</SubHeading>
                    <p className="mb-3 text-neutral-800">Where permitted by law, we may send product updates, onboarding reminders, transaction notices, service messages, and marketing communications. You may opt out of non-essential marketing at any time.</p>
                    <SubHeading>6.7 Legal and Compliance Purposes</SubHeading>
                    <p className="text-neutral-800">Comply with legal obligations, respond to lawful requests, enforce our contracts, investigate fraud or misuse, and protect our rights, users, and platform.</p>
                  </section>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
                <div className="rounded-2xl border border-surface-500 bg-cream px-8 py-7 shadow-card">
                  <section id="s7" className="scroll-mt-24">
                    <SectionHeading num={7} title="Lawful Bases for Processing" />
                    <p className="mb-3 text-neutral-800">Depending on the context, our lawful basis may include:</p>
                    <div className="space-y-2.5">
                      {[
                        ["Contract", "where processing is necessary to provide the platform, manage requests, process production workflows, or administer accounts"],
                        ["Consent", "where consent is required, such as some marketing communications or certain optional features"],
                        ["Legal Obligation", "where we must comply with law, lawful requests, or regulatory obligations"],
                        ["Legitimate Interests", "where necessary for platform security, fraud prevention, support, analytics, or service improvement, provided such interests do not override your rights"],
                        ["Protection of Vital or Public Interests", "where applicable under law"],
                      ].map(([label, desc]) => (
                        <div key={label} className="flex gap-3 rounded-xl bg-surface-100 p-3">
                          <span className="mt-0.5 shrink-0 font-semibold text-leather text-sm">{label}:</span>
                          <span className="text-sm text-neutral-800">{desc}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>

              {[
                {
                  id: "s8", num: 8, title: "Cookies and Similar Technologies",
                  content: <><p className="mb-2 text-neutral-800">We may use cookies, session technologies, analytics tools, and similar technologies to keep you logged in, remember preferences, improve performance, understand platform interactions, and support security and fraud monitoring.</p><p className="text-neutral-800">You can manage cookies through your browser settings or any cookie controls we make available.</p></>
                },
                {
                  id: "s10", num: 10, title: "International and Cross-Border Transfers",
                  content: <p className="text-neutral-800">Your data may be stored or processed outside Nigeria where our service providers or infrastructure require it. Where we transfer personal data outside Nigeria, we will take reasonable steps to ensure that an appropriate legal basis and reasonable safeguards are in place.</p>
                },
                {
                  id: "s11", num: 11, title: "Data Security",
                  content: <><p className="mb-2 text-neutral-800">We use reasonable technical, administrative, and organizational measures to protect personal data, including access controls, password protection, encrypted transmission where appropriate, role-based permissions, vendor controls, and logging and monitoring.</p><p className="text-neutral-800">No system is completely secure, and we cannot guarantee absolute security.</p></>
                },
                {
                  id: "s15", num: 15, title: "Children",
                  content: <p className="text-neutral-800">LEDDAR is intended for adults and business users. We do not knowingly offer the platform to children or intentionally collect children&apos;s personal data. If you believe a child has provided personal data to LEDDAR improperly, contact us so we can take appropriate action.</p>
                },
                {
                  id: "s16", num: 16, title: "Automated Decision-Making",
                  content: <p className="text-neutral-800">LEDDAR may use rule-based systems or automated checks for risk screening, onboarding prioritization, fraud detection, verification routing, or service optimization. Where applicable, such processing will be conducted in line with applicable law.</p>
                },
                {
                  id: "s17", num: 17, title: "Third-Party Links and Services",
                  content: <p className="text-neutral-800">Our platform may contain links to third-party services or use third-party tools. We are not responsible for the privacy practices of third parties. You should review their privacy policies separately.</p>
                },
                {
                  id: "s18", num: 18, title: "Marketing Communications",
                  content: <p className="text-neutral-800">We may send service-related communications necessary for account and platform operation. Where we send optional marketing communications, you may unsubscribe using the available link or by contacting us.</p>
                },
                {
                  id: "s19", num: 19, title: "Changes to This Policy",
                  content: <p className="text-neutral-800">We may update this Privacy Policy from time to time. Where changes are material, we may notify users through the website, dashboard, or email. The &quot;Effective Date&quot; above shows when this version took effect.</p>
                },
                {
                  id: "s21", num: 21, title: "Complaints",
                  content: <p className="text-neutral-800">If you believe your data rights have been violated, you may contact LEDDAR first so we can attempt to resolve the issue. You may also have the right to complain to the Nigeria Data Protection Commission, which is the data protection authority established under the NDPA.</p>
                },
              ].filter(s => !["s9", "s12", "s13", "s14"].includes(s.id)).map(({ id, num, title, content }) => (
                <div key={id} className="rounded-3xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
                  <div className="rounded-2xl border border-surface-500 bg-cream px-8 py-7 shadow-card">
                    <section id={id} className="scroll-mt-24">
                      <SectionHeading num={num} title={title} />
                      {content}
                    </section>
                  </div>
                </div>
              ))}

              <div className="rounded-3xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
                <div className="rounded-2xl border border-surface-500 bg-cream px-8 py-7 shadow-card">
                  <section id="s9" className="scroll-mt-24">
                    <SectionHeading num={9} title="When We Share Personal Data" />
                    <Callout>We do not sell personal data. We may share personal data only where necessary and lawful.</Callout>
                    <SubHeading>9.1 With Service Providers</SubHeading>
                    <p className="mb-2 text-neutral-800">We may share data with vendors supporting cloud hosting, analytics, messaging, email delivery, KYC and identity verification, payment processing, fraud prevention, customer support, and document storage. These providers process data on our behalf under contractual controls.</p>
                    <SubHeading>9.2 Between Platform Users</SubHeading>
                    <p className="mb-2 text-neutral-800">We may share limited information between Brands and Artisans where necessary to perform a transaction or production workflow, limited to what is reasonably needed.</p>
                    <SubHeading>9.3 With Regulators, Authorities, or Courts</SubHeading>
                    <p className="mb-2 text-neutral-800">We may disclose personal data where required by law, lawful process, or to protect legal rights.</p>
                    <SubHeading>9.4 In a Corporate Transaction</SubHeading>
                    <p className="text-neutral-800">If LEDDAR is involved in a merger, acquisition, or sale of assets, personal data may be disclosed as part of that process, subject to appropriate safeguards.</p>
                  </section>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
                <div className="rounded-2xl border border-surface-500 bg-cream px-8 py-7 shadow-card">
                  <section id="s12" className="scroll-mt-24">
                    <SectionHeading num={12} title="Personal Data Breaches" />
                    <p className="mb-3 text-neutral-800">If a personal data breach occurs, LEDDAR will assess the incident and respond as required by applicable law. Where required, we may:</p>
                    <BulletList items={["contain and investigate the breach", "notify affected parties", "notify the appropriate authority", "take remedial action"]} />
                  </section>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
                <div className="rounded-2xl border border-surface-500 bg-cream px-8 py-7 shadow-card">
                  <section id="s13" className="scroll-mt-24">
                    <SectionHeading num={13} title="Data Retention" />
                    <p className="mb-2 text-neutral-800">We keep personal data only for as long as reasonably necessary for account administration, production and transaction records, compliance and audit requirements, dispute handling, fraud prevention, and legal defense.</p>
                    <p className="text-neutral-800">We may retain some information after account closure for tax and accounting records, payment reconciliation, legal claims or defense, fraud prevention, and regulatory compliance.</p>
                  </section>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
                <div className="rounded-2xl border border-surface-500 bg-cream px-8 py-7 shadow-card">
                  <section id="s14" className="scroll-mt-24">
                    <SectionHeading num={14} title="Your Rights" />
                    <Callout>
                      Under the NDPA, you may have rights including the right to be informed, access, rectification, objection, restriction, portability, erasure, and not to be subject to certain automated decision-making.
                    </Callout>
                    <p className="mb-3 text-neutral-800">Subject to law and verification of your identity, you may request to:</p>
                    <BulletList items={["access your personal data", "correct inaccurate or incomplete data", "withdraw consent where consent is the basis", "object to certain processing", "restrict certain processing", "request deletion where applicable", "request portability where applicable", "complain to the appropriate authority"]} />
                    <p className="mt-3 text-neutral-800">To exercise your rights, contact us using the details below.</p>
                  </section>
                </div>
              </div>

              {/* Contact */}
              <div id="s20" className="scroll-mt-24 rounded-3xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
                <div className="rounded-2xl border border-surface-500 bg-cream px-8 py-7 shadow-card">
                  <SectionHeading num={20} title="Contact Us" />
                  <p className="mb-5 text-neutral-800">For privacy questions, complaints, or data rights requests, contact:</p>
                  <div className="rounded-xl border border-surface-400 bg-surface-100 p-5">
                    <p className="mb-3 font-semibold text-ink">LEDDAR — Leddar Systems Limited</p>
                    <div className="space-y-2 text-sm text-neutral-800">
                      {[
                        ["www.myleddar.com", "https://www.myleddar.com"],
                        ["345 Odusami Street, Ogba, Lagos", null],
                        ["Alfred.j@myleddar.com", "mailto:Alfred.j@myleddar.com"],
                        ["Support@myleddar.com", "mailto:Support@myleddar.com"],
                        ["+2349067688122", "tel:+2349067688122"],
                      ].map(([text, href]) => (
                        <div key={text} className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-leather/60 shrink-0" />
                          {href ? <a href={href} className="text-leather underline hover:text-espresso">{text}</a> : <span>{text}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer nav */}
              <div className="rounded-3xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
                <div className="flex items-center justify-between rounded-2xl border border-surface-500 bg-cream px-6 py-4 shadow-card">
                  <Link href="/signup" className="flex items-center gap-1.5 text-sm text-leather hover:text-espresso transition-colors">
                    <ChevronLeft className="h-4 w-4" />
                    Back to Signup
                  </Link>
                  <Link href="/terms-and-conditions" target="_blank" rel="noopener noreferrer" className="text-sm text-leather underline hover:text-espresso transition-colors">
                    View Terms &amp; Conditions →
                  </Link>
                </div>
              </div>

            </div>
          </main>
        </div>
      </div>

      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-8 right-8 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-gold text-espresso shadow-lg hover:bg-gold/80 transition-colors"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
