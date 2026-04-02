import { useState, useRef, useEffect, useCallback } from "react";

// ─── BENCHMARK DATA ─────────────────────────────────────────────────────────

const REP = { name: "Alex Navarro", initials: "AN", title: "Enterprise AE — North America", quarter: "Q1 2026", week: "Week 11 of 13", quota: 1200000, closed: 680000, pipeline: 2800000, coverage: 2.3, winRate: 28, avgDealSize: 85000, avgCycle: 62, dealsOpen: 18, dealsAtRisk: 4, meetingsThisWeek: 12, forecastCommit: 920000, activitiesLogged: 147, emailsSent: 68, callsMade: 42, proposalsSent: 9 };

const BENCHMARK_METRICS = [
  { id: "winRate", label: "Win Rate", you: 28, team: 26, topPerformer: 38, industry: 22, unit: "%", trend: [{ m: "Oct", v: 22 }, { m: "Nov", v: 25 }, { m: "Dec", v: 30 }, { m: "Jan", v: 26 }, { m: "Feb", v: 28 }, { m: "Mar", v: 28 }], insight: "Your win rate is 2pts above team avg but 10pts below top performers. The gap is driven by single-threaded deals — your multi-threaded deals close at 38%. Fix multi-threading and you close the gap.", category: "effectiveness" },
  { id: "dealSize", label: "Avg Deal Size", you: 85, team: 72, topPerformer: 110, industry: 65, unit: "$K", trend: [{ m: "Oct", v: 68 }, { m: "Nov", v: 72 }, { m: "Dec", v: 78 }, { m: "Jan", v: 80 }, { m: "Feb", v: 83 }, { m: "Mar", v: 85 }], insight: "Strong upward trajectory — $68K in Oct to $85K now (+25%). You're selling larger than team avg. Lean into enterprise accounts where your consultative approach lands bigger deals.", category: "effectiveness" },
  { id: "cycle", label: "Sales Cycle", you: 62, team: 54, topPerformer: 42, industry: 68, unit: " days", trend: [{ m: "Oct", v: 72 }, { m: "Nov", v: 68 }, { m: "Dec", v: 65 }, { m: "Jan", v: 64 }, { m: "Feb", v: 63 }, { m: "Mar", v: 62 }], insight: "Trending down (good) but still 8 days above team. The bottleneck: Discovery→Demo averages 18 days vs 11 for team. Book demos during discovery calls to compress.", inverted: true, category: "velocity" },
  { id: "coverage", label: "Pipeline Coverage", you: 2.3, team: 2.8, topPerformer: 3.5, industry: 2.5, unit: "x", trend: [{ m: "Oct", v: 1.8 }, { m: "Nov", v: 2.1 }, { m: "Dec", v: 2.4 }, { m: "Jan", v: 2.0 }, { m: "Feb", v: 2.2 }, { m: "Mar", v: 2.3 }], insight: "Below the 3x safety threshold. You need ~$600K more pipeline to be comfortable. Focus prospecting on enterprise MSPs where your deal sizes are strongest.", category: "pipeline" },
  { id: "discoToDemo", label: "Discovery → Demo", you: 18, team: 11, topPerformer: 7, industry: 14, unit: " days", trend: [{ m: "Oct", v: 24 }, { m: "Nov", v: 22 }, { m: "Dec", v: 20 }, { m: "Jan", v: 19 }, { m: "Feb", v: 18 }, { m: "Mar", v: 18 }], insight: "Your biggest velocity gap. Top performers book demos in the first call. Every extra week in early stages correlates with -3% close probability.", inverted: true, category: "velocity" },
  { id: "emailReply", label: "Email Reply Rate", you: 24, team: 31, topPerformer: 42, industry: 28, unit: "%", trend: [{ m: "Oct", v: 20 }, { m: "Nov", v: 22 }, { m: "Dec", v: 23 }, { m: "Jan", v: 23 }, { m: "Feb", v: 24 }, { m: "Mar", v: 24 }], insight: "7pts below team. Your ROI-lead emails get 38% reply rate — use them everywhere. Kill generic 'checking in' emails (12% reply rate). Lead every email with a data point.", category: "activity" },
  { id: "multiThread", label: "Multi-threading Score", you: 1.5, team: 2.2, topPerformer: 3.4, industry: 2.0, unit: " avg contacts", trend: [{ m: "Oct", v: 1.2 }, { m: "Nov", v: 1.3 }, { m: "Dec", v: 1.4 }, { m: "Jan", v: 1.4 }, { m: "Feb", v: 1.5 }, { m: "Mar", v: 1.5 }], insight: "50% of your deals are single-threaded vs 25% for top performers. Win rate jumps from 14% to 38% with 3+ contacts. This is your #1 leverage point.", category: "effectiveness" },
  { id: "meetings", label: "Meetings / Week", you: 12, team: 10, topPerformer: 15, industry: 9, unit: "", trend: [{ m: "Oct", v: 9 }, { m: "Nov", v: 10 }, { m: "Dec", v: 11 }, { m: "Jan", v: 11 }, { m: "Feb", v: 12 }, { m: "Mar", v: 12 }], insight: "Above team avg — good activity level. To reach top performer territory (15/wk), add 1 discovery call and 2 stakeholder expansion meetings per week.", category: "activity" },
  { id: "discoQuality", label: "Discovery Quality", you: 8, team: 10, topPerformer: 12, industry: 9, unit: " questions", trend: [{ m: "Oct", v: 6 }, { m: "Nov", v: 7 }, { m: "Dec", v: 7 }, { m: "Jan", v: 8 }, { m: "Feb", v: 8 }, { m: "Mar", v: 8 }], insight: "Top AEs ask 12+ questions in discovery. You're missing budget timeline, decision process, and success criteria questions. Use MEDDPICC — deals where budget + process are confirmed close 3x faster.", category: "effectiveness" },
  { id: "proposalToClose", label: "Proposal → Close", you: 42, team: 48, topPerformer: 55, industry: 40, unit: "%", trend: [{ m: "Oct", v: 35 }, { m: "Nov", v: 38 }, { m: "Dec", v: 40 }, { m: "Jan", v: 41 }, { m: "Feb", v: 42 }, { m: "Mar", v: 42 }], insight: "Solid conversion once you get to proposal. Your technical eval skills drive this — 68% POC conversion vs 55% team avg. Keep leveraging POCs as a closing mechanism.", category: "effectiveness" },
  { id: "pipelineGen", label: "Pipeline Generated / Mo", you: 380, team: 420, topPerformer: 620, industry: 350, unit: "$K", trend: [{ m: "Oct", v: 290 }, { m: "Nov", v: 340 }, { m: "Dec", v: 360 }, { m: "Jan", v: 350 }, { m: "Feb", v: 370 }, { m: "Mar", v: 380 }], insight: "Below team avg on pipe gen. Your inbound conversion is strong but outbound is weak. Dedicate 2 hours/week to targeted outbound to enterprise MSPs.", category: "pipeline" },
  { id: "forecastAccuracy", label: "Forecast Accuracy", you: 72, team: 68, topPerformer: 85, industry: 60, unit: "%", trend: [{ m: "Oct", v: 58 }, { m: "Nov", v: 62 }, { m: "Dec", v: 68 }, { m: "Jan", v: 70 }, { m: "Feb", v: 71 }, { m: "Mar", v: 72 }], insight: "Improving steadily and above team avg. The gap to top performers (85%) comes from over-forecasting at-risk deals. Be more aggressive about downgrading stalled deals.", category: "pipeline" },
];

const CATEGORIES = [
  { id: "all", label: "All Metrics" },
  { id: "effectiveness", label: "Effectiveness" },
  { id: "velocity", label: "Velocity" },
  { id: "pipeline", label: "Pipeline" },
  { id: "activity", label: "Activity" },
];

const QUARTER_COMPS = [
  { q: "Q3 2025", closed: 480000, quota: 1000000, win: 22, deals: 14, cycle: 72, coverage: 1.8, pipeGen: 290 },
  { q: "Q4 2025", closed: 720000, quota: 1100000, win: 25, deals: 16, cycle: 65, coverage: 2.1, pipeGen: 340 },
  { q: "Q1 2026", closed: 680000, quota: 1200000, win: 28, deals: 18, cycle: 62, coverage: 2.3, pipeGen: 380 },
];

const COMPETITIVE_BENCHMARKS = [
  { competitor: "Citrix Displacement", winRate: 65, avgCycle: 55, avgDeal: 145, deals: 8, trend: "up" },
  { competitor: "VMware Horizon", winRate: 42, avgCycle: 78, avgDeal: 165, deals: 5, trend: "flat" },
  { competitor: "Greenfield (No VDI)", winRate: 35, avgCycle: 48, avgDeal: 72, deals: 12, trend: "up" },
  { competitor: "AWS WorkSpaces", winRate: 58, avgCycle: 42, avgDeal: 88, deals: 3, trend: "up" },
];

const TEAM_LEADERBOARD = [
  { name: "Sarah Kim", closed: 1050000, quota: 1100000, win: 36, deals: 22, rank: 1 },
  { name: "Marcus Cole", closed: 880000, quota: 1000000, win: 32, deals: 19, rank: 2 },
  { name: "Priya Singh", closed: 820000, quota: 1100000, win: 30, deals: 17, rank: 3 },
  { name: "Alex Navarro", closed: 680000, quota: 1200000, win: 28, deals: 18, rank: 4, isYou: true },
  { name: "Jake Torres", closed: 620000, quota: 900000, win: 24, deals: 15, rank: 5 },
  { name: "Emily Chen", closed: 540000, quota: 1000000, win: 22, deals: 13, rank: 6 },
];

// ─── AGENT DEFINITIONS ──────────────────────────────────────────────────────

const AGENTS = [
  {
    id: "copilot", name: "AE Insight Copilot", icon: "🧠", color: "#D4A574", bgColor: "#FFF8F0", borderColor: "#F0E6D6",
    description: "Real-time benchmark intelligence, coaching nudges, and strategic recommendations",
    capabilities: ["Benchmark deep-dives", "Performance gap analysis", "Coaching recommendations", "Competitive intelligence", "Forecast modeling"],
    prompts: [
      "What are my biggest performance gaps?",
      "How do I close the gap to top performers?",
      "Where am I trending up vs down?",
      "Build me an improvement plan for Q2",
      "What should I focus on this week?",
    ],
  },
  {
    id: "rfp", name: "RFP & Response Support", icon: "📋", color: "#534AB7", bgColor: "#F5F4FE", borderColor: "#DDDAFC",
    description: "Draft and refine RFP responses with AI-assisted research, formatting, and compliance checking",
    capabilities: ["RFP response drafting", "Compliance checklist generation", "Competitive differentiation sections", "Technical spec formatting", "Win theme identification"],
    prompts: [
      "Draft a security & compliance section for a healthcare RFP",
      "Create an executive summary for an enterprise proposal",
      "Generate a competitive comparison vs VMware Horizon",
      "Write a pricing justification based on our benchmark data",
      "Build a customer success stories section",
    ],
  },
  {
    id: "research", name: "Account & Deal Research", icon: "🔍", color: "#185FA5", bgColor: "#F0F6FE", borderColor: "#C7DEF7",
    description: "Surface relevant context for opportunities, accounts, and deal preparation from public and internal sources",
    capabilities: ["Company research & briefings", "Stakeholder mapping", "Industry trends & triggers", "Competitive landscape analysis", "Deal prep packages"],
    prompts: [
      "Research Apex Financial Group for my meeting",
      "Build a stakeholder map for Summit Health",
      "What's happening in the MSP market this quarter?",
      "Prep me for the CloudBridge demo Thursday",
      "Find recent news about Meridian Cloud Services",
    ],
  },
  {
    id: "email", name: "Email & Recap Generation", icon: "✉️", color: "#0F6E56", bgColor: "#EEFBF5", borderColor: "#C2EDD8",
    description: "Draft follow-up emails, meeting recaps, and outreach sequences for rep review and send",
    capabilities: ["Follow-up email drafts", "Meeting recap summaries", "Multi-touch sequences", "Re-engagement campaigns", "Internal deal update emails"],
    prompts: [
      "Write a follow-up to a stalled deal using benchmark data",
      "Draft a meeting recap for a POC review",
      "Create a re-engagement sequence for a ghosting prospect",
      "Write an internal deal update for my manager",
      "Draft a multi-thread intro email for a CFO",
    ],
  },
];

// ─── AGENT RESPONSES ────────────────────────────────────────────────────────

const AGENT_RESPONSES = {
  copilot: {
    "What are my biggest performance gaps?": "**Performance Gap Analysis — Alex Navarro**\n\nRanked by revenue impact (highest to lowest):\n\n**1. Multi-threading Score — Gap: -1.9 contacts** 🔴\nYou: 1.5 avg contacts | Top: 3.4 | Revenue impact: **~$240K/year**\nYour single-threaded deals close at 14% vs 38% for multi-threaded. This is your #1 lever. Each additional contact adds ~12% to win probability.\n→ Action: Add \"who else should we include?\" to every discovery call.\n\n**2. Discovery → Demo Speed — Gap: +11 days** 🔴\nYou: 18 days | Top: 7 | Revenue impact: **~$180K/year**\nEvery extra week in early stages = -3% close rate. Your fastest wins all had demos booked in the first call.\n→ Action: End every discovery with a demo date on the calendar.\n\n**3. Email Reply Rate — Gap: -18pts** 🟡\nYou: 24% | Top: 42% | Revenue impact: **~$120K/year**\nYour ROI-lead emails hit 38% — that's almost top-performer level. The drag is generic \"checking in\" emails at 12%.\n→ Action: Lead every email with a specific data point or insight.\n\n**4. Pipeline Coverage — Gap: -1.2x** 🟡\nYou: 2.3x | Top: 3.5x | Revenue impact: **~$100K/year**\nYou're ~$600K short of comfortable coverage. Outbound prospecting is the gap.\n→ Action: 2 hours/week targeted outbound to enterprise MSPs.\n\n**5. Discovery Quality — Gap: -4 questions** 🟡\nYou: 8 | Top: 12 | Revenue impact: **~$80K/year**\nMissing: budget timeline, decision process, success criteria. MEDDPICC would close this.\n\n**Total estimated revenue gap: ~$720K/year** if all gaps closed to top-performer level. Focus on #1 and #2 for the biggest immediate impact ($420K combined).",
    "How do I close the gap to top performers?": "**Closing the Gap to Top Performer (Sarah Kim, 36% win rate)**\n\nSarah's edge breaks down into 3 main differences:\n\n**1. Multi-threading discipline**\nSarah averages 3.2 contacts per deal. You average 1.5. She never advances a deal past Discovery without 2+ contacts engaged.\n→ **Your play:** Before any deal moves to Proposal, require yourself to have 3+ contacts. Use the research agent to build stakeholder maps for your top 5 deals.\n\n**2. Speed to demo**\nSarah books 80% of demos during the first call. Her Discovery→Demo is 8 days vs your 18.\n→ **Your play:** Pre-schedule demo slots for the week. When discovery goes well, say \"I have Thursday at 2pm open for a deeper technical look — does that work?\" Don't let them leave without a date.\n\n**3. Email precision**\nSarah never sends generic follow-ups. Every email leads with an account-specific insight or data point. Her reply rate: 41%.\n→ **Your play:** Use the Email agent to rewrite your pending follow-ups. Lead with benchmark data, ROI projections, or competitive intelligence specific to each account.\n\n**Timeline to close the gap:**\n- Weeks 1-2: Fix multi-threading on top 5 deals\n- Weeks 3-4: Implement same-call demo booking\n- Ongoing: Switch all emails to insight-first format\n\n**Expected impact:** +8-10% win rate within 2 quarters → estimated **$200K+ additional revenue per quarter.**",
    "Where am I trending up vs down?": "**Trend Analysis — 6 Month View**\n\n📈 **Trending UP (keep doing this):**\n\n| Metric | Oct | Now | Change | Trajectory |\n|---|---|---|---|---|\n| Deal Size | $68K | $85K | **+25%** | Strong upward |\n| Forecast Accuracy | 58% | 72% | **+14pts** | Steady climb |\n| Proposal→Close | 35% | 42% | **+7pts** | Accelerating |\n| Meetings/Week | 9 | 12 | **+33%** | Good momentum |\n| Win Rate | 22% | 28% | **+6pts** | Steady improvement |\n| Pipeline Gen | $290K | $380K | **+31%** | Solid growth |\n\n📉 **Trending FLAT (need intervention):**\n\n| Metric | Oct | Now | Change | Issue |\n|---|---|---|---|---|\n| Email Reply Rate | 20% | 24% | +4pts | Plateau'd at 24% — below team |\n| Multi-threading | 1.2 | 1.5 | +0.3 | Barely moving — structural issue |\n| Discovery Quality | 6 | 8 | +2 | Slow improvement — still below team |\n| Disco→Demo | 24d | 18d | -6d | Improving but stalled last 2 months |\n\n**Key insight:** Your effectiveness metrics (deal size, conversion) are strong and improving. Your velocity and coverage metrics are the drag. You're selling well when you get to the table — the issue is getting to the table faster and with more stakeholders.\n\n**One sentence summary:** You're becoming a better closer but need to become a faster, wider prospector.",
    "Build me an improvement plan for Q2": "**Q2 2026 Performance Improvement Plan**\n\n**Goal:** Close the gap to top-performer benchmarks\n- Win rate: 28% → 34% (+6pts)\n- Pipeline coverage: 2.3x → 3.0x\n- Multi-threading: 1.5 → 2.5 contacts/deal\n- Deal velocity: 62 days → 54 days\n\n**Month 1 (April): Foundation**\nWeek 1: Audit all open deals — add missing stakeholders to top 8\nWeek 2: Implement same-call demo booking (target: 70% of discoveries)\nWeek 3: Rewrite email templates — all ROI-first format\nWeek 4: Block 2 hours/week for targeted outbound\nKPI check: Multi-threading at 2.0, Disco→Demo at 15 days\n\n**Month 2 (May): Acceleration**\nWeek 5-6: MEDDPICC certification — focus on Decision Process & Paper Process\nWeek 7-8: Build mutual action plans for all deals >$100K\nKPI check: Discovery quality at 10 questions, Proposal→Close at 45%\n\n**Month 3 (June): Optimization**\nWeek 9-10: Analyze win/loss on Q2 deals — identify patterns\nWeek 11-12: Refine competitive playbooks based on H1 data\nKPI check: Win rate at 34%, Coverage at 3.0x\n\n**Agent support plan:**\n- Use **AE Insight Copilot** weekly for benchmark tracking\n- Use **Research Agent** before every first meeting\n- Use **Email Agent** for all follow-ups (enforce insight-first)\n- Use **RFP Agent** for all proposals >$100K\n\n**Expected Q2 outcome:** $1.1M-$1.3M closed (vs $680K Q1 pace → 90-108% of quota)",
    "What should I focus on this week?": "**This Week's Benchmark-Driven Priorities**\n\n**Based on your biggest performance gaps:**\n\n🔴 **Priority 1: Multi-thread your top 3 deals**\nYour benchmark gap: 1.5 vs 3.4 contacts/deal\n- Apex Financial ($185K): Get CFO intro from Robert Chen\n- Summit Health ($168K): Get CIO + clinical IT lead from Karen Walsh\n- NorthPoint ($134K): Connect with CFO + CISO before committee review\nTarget: Add 5 new stakeholder contacts this week\n\n🔴 **Priority 2: Book demos during discovery calls**\nYour benchmark gap: 18 days vs 7 days (Discovery→Demo)\n- CloudBridge demo is Thursday — during the call, propose a technical deep-dive for the following week with their founder\n- Pacific Managed IT — schedule discovery AND demo in one session\n\n🟡 **Priority 3: Rewrite pending follow-ups**\nYour benchmark gap: 24% vs 42% reply rate\n- Tom Reeves (Cascade) — replace generic check-in with benchmark data email\n- Rebecca Frost (Alpine) — lead with TCO comparison vs VMware\n- Use the Email Agent to draft insight-first versions\n\n🟡 **Priority 4: Pipeline generation block**\nYour benchmark gap: 2.3x vs 3.0x coverage\n- Block Thursday AM for 2 hours of targeted outbound\n- Focus: Enterprise MSPs managing 5,000+ desktops\n\n**If you execute all 4:** Multi-threading improves to ~2.0, velocity compresses by ~3 days, pipeline coverage moves toward 2.5x. That's meaningful movement on your 3 biggest gaps.",
    fallback: "Based on your benchmark data, here's what I see:\n\n**Strongest areas:** Deal size ($85K, +18% vs team), forecast accuracy (72%, +4pts vs team), and meeting volume (12/wk, +20% vs team).\n\n**Biggest gaps:** Multi-threading (1.5 vs 3.4 contacts), Discovery→Demo speed (18d vs 7d), and email reply rate (24% vs 42%).\n\n**Overall trajectory:** Improving across most metrics over the last 6 months. Your effectiveness is strong — the gap is in velocity and coverage.\n\nWant me to dig deeper into any specific benchmark, build an improvement plan, or analyze competitive performance?",
  },
  rfp: {
    "Draft a security & compliance section for a healthcare RFP": "**Section 4: Security & Compliance**\n\n**4.1 HIPAA Compliance**\nNerdio Manager for Enterprise is designed to support HIPAA-regulated healthcare environments. Our platform:\n- Operates within the customer's Azure tenant — no patient data transits Nerdio infrastructure\n- Supports BAA execution with Microsoft Azure\n- Enforces session-level encryption (TLS 1.2+) and disk encryption (AES-256)\n- Provides audit logging for all administrative actions\n- Supports conditional access policies aligned with HIPAA technical safeguards\n\n**4.2 SOC 2 Type II Certification**\nNerdio has achieved SOC 2 Type II certification covering:\n- Security, Availability, and Confidentiality trust principles\n- Annual third-party audit\n- Most recent report period: January — December 2025\n\n**4.3 Data Residency & Isolation**\n- All compute and data remain in the customer's Azure tenant\n- Nerdio's control plane communicates via secure API — no data storage on our side\n- Role-based access control (RBAC) with Azure AD integration\n- Multi-factor authentication enforced for all admin access\n\n**4.4 Incident Response**\n- 24/7 security monitoring with <1 hour response SLA\n- Quarterly penetration testing by independent third parties\n- Vulnerability disclosure program in place\n\n*Drafted based on standard healthcare compliance requirements. Customize for the specific RFP's security questionnaire.*",
    "Write a pricing justification based on our benchmark data": "**Pricing Justification — Benchmark-Backed ROI Analysis**\n\n**Why Nerdio's pricing delivers outsized value:**\n\nBased on our customer benchmark data across 200+ deployments:\n\n**1. Infrastructure Cost Reduction**\n- Benchmark avg savings: 40-60% vs on-prem VDI\n- Auto-scaling alone reduces Azure spend by 30-50%\n- Customers managing 3,000+ desktops see avg $340K annual savings\n\n**2. Admin Efficiency Gains**\n- Pre-Nerdio avg: 15-20 hours per client desktop setup\n- Post-Nerdio avg: <1 hour per client setup (93% reduction)\n- Admin hours saved per month: 140 hours (benchmark avg for mid-market)\n\n**3. Time to Value**\n- Benchmark avg deployment: 45-60 days for 3,000+ desktops\n- Competitors: 4-6 months for comparable scale\n- Faster deployment = faster ROI realization\n\n**4. Total Cost of Ownership (3-Year)**\n| Component | Without Nerdio | With Nerdio | Savings |\n|---|---|---|---|\n| Azure infrastructure | $580K | $290K | $290K |\n| Admin labor | $340K | $80K | $260K |\n| Deployment & migration | $120K | $40K | $80K |\n| Downtime costs | $90K | $15K | $75K |\n| **Total** | **$1.13M** | **$425K** | **$705K** |\n\n**Payback period: 8 months** (benchmark avg across enterprise customers)\n\n*Customize these figures for the specific prospect's scale and current environment.*",
    fallback: "I'll help draft that RFP content. What do you need?\n\n**Standard sections:**\n- Executive summary\n- Technical architecture & requirements\n- Security & compliance\n- Implementation & deployment plan\n- Pricing justification with ROI model\n- Customer success references\n- Competitive differentiation\n\n**Benchmark-powered content:**\n- ROI projections based on customer benchmark data\n- TCO comparisons with industry benchmarks\n- Performance SLA commitments backed by deployment data\n\nName the section, industry, or account and I'll generate ready-to-customize content.",
  },
  research: {
    "Research Apex Financial Group for my meeting": "**Account Briefing: Apex Financial Group**\n*Prepared for: Alex Navarro — Meeting prep*\n\n---\n\n**Company Overview**\n- Industry: Financial Services / Wealth Management\n- Founded: 2004 | HQ: Chicago, IL\n- Employees: ~2,200 | Revenue: Est. $340M (2025)\n- IT footprint: 3,200+ desktops across 14 offices\n\n**Key Stakeholders**\n| Name | Title | Relevance |\n|---|---|---|\n| Robert Chen | CTO | Your champion — driving the AVD initiative |\n| Margaret Wu | CFO | Economic buyer — NOT yet engaged |\n| David Park | VP Infrastructure | Technical evaluator |\n| Sarah Kim | CISO | Security sign-off required |\n\n**Strategic Context**\n- Cloud-first transformation underway (announced Q3 2025)\n- Recently migrated core trading platform to Azure\n- Current state: On-prem Citrix infrastructure nearing end-of-life ($180K annual maintenance)\n- OCC published new guidelines on remote desktop security for financial firms\n\n**Benchmark Context (relevant to your pitch):**\n- Financial services customers avg 45% cost reduction with Nerdio\n- Avg deployment for 3,000+ desktops: 60 days\n- Your win rate vs Citrix displacement: **65%** — strong position\n\n**Conversation Starters**\n1. \"I saw Apex completed the Azure migration for your trading platform — how's that going?\"\n2. \"With the new OCC desktop security guidelines, has that changed your timeline?\"\n3. \"Your Citrix environment — are you seeing the maintenance cost increases other financial firms are reporting?\"",
    "What's happening in the MSP market this quarter?": "**MSP Market Intelligence — Q1 2026**\n\n**Macro trends affecting your pipeline:**\n\n**1. Azure Virtual Desktop adoption accelerating**\n- 40% YoY growth in AVD deployments among MSPs\n- Gartner predicts 60% of MSPs will offer DaaS by 2027\n- Driver: hybrid work permanence + Azure commitment by enterprises\n\n**2. Citrix uncertainty creating displacement opportunities**\n- Cloud Software Group restructuring continues\n- Citrix on-prem customers facing 15-25% price increases\n- Your benchmark data: 65% win rate on Citrix displacement — lean into this\n\n**3. VMware/Broadcom integration disruption**\n- Broadcom's pricing changes pushing VMware customers to evaluate alternatives\n- Your benchmark data: 42% win rate vs VMware — room to improve with better TCO messaging\n\n**4. MSP consolidation wave**\n- PE-backed MSP roll-ups driving demand for standardized tooling\n- Growing MSPs (like CloudBridge, 400% YoY) need scale-without-headcount solutions\n- Average MSP evaluating 3-4 VDI management platforms\n\n**Impact on your deals:**\n- Apex Financial: Citrix displacement — play to your 65% strength\n- Alpine Technology: VMware eval — need stronger TCO story (42% win rate)\n- CloudBridge IT: Growth narrative — multi-tenant scale pitch\n- Meridian Cloud: Citrix migration — 8,000 desktops is right in your sweet spot\n\n**Prospecting angle:** Target Citrix-heavy MSPs managing 5,000+ desktops. That's where your deal size and win rate benchmarks are strongest.",
    fallback: "I'll research that for you. What would be most helpful?\n\n**Account Research:** Company overview, stakeholder mapping, competitive intel\n**Market Research:** Industry trends, competitive landscape, pricing benchmarks\n**Deal Prep:** Pre-meeting briefing, discovery question framework, objection prep\n\nI'll cross-reference with your benchmark data to give you context on how similar deals have performed.\n\nName an account or topic and I'll build a comprehensive brief.",
  },
  email: {
    "Write a follow-up to a stalled deal using benchmark data": "**Subject: MSPs your size are saving $340K/year — here's the data**\n\nHi [Name],\n\nI wanted to share something from our latest benchmark report that I think is directly relevant to [Company].\n\nWe analyzed 200+ MSP deployments at your scale (5,000-10,000 managed desktops) and the results were striking:\n\n- **$340K average annual savings** from automated scaling and provisioning\n- **93% reduction in per-client setup time** (from 15-20 hours to under 1 hour)\n- **99.8% average uptime** across all managed environments\n- **8-month average payback period** on the investment\n\nThe most interesting finding: MSPs that switched from manual AVD management to Nerdio added an average of **12 new clients in the first year** without adding headcount — the automation freed up enough capacity to grow.\n\nI've attached the executive summary. Page 3 has the breakdown most relevant to your current setup.\n\nWould you have 20 minutes this week to walk through how these benchmarks map to [Company]'s environment?\n\nBest,\nAlex\n\n---\n\n**Strategy notes:**\n- Leads with benchmark data, not \"checking in\"\n- Specific numbers create credibility and urgency\n- The \"grow without headcount\" angle resonates with MSP owners\n- Keep it short — stalled deals need value, not walls of text\n\n**Benchmark tip:** Your ROI-lead emails get 38% reply rate vs 12% for generic check-ins. This format plays to your strength.",
    "Draft a meeting recap for a POC review": "**Subject: POC Mid-Review Recap — Results & Next Steps**\n\nHi [Name],\n\nThank you for the productive POC review today. Here's a summary of results and agreed next steps.\n\n---\n\n**POC Results vs Benchmarks**\n\n| Metric | Your POC | Benchmark Avg | Status |\n|---|---|---|---|\n| Desktops migrated | 200 | 150 | Above avg |\n| Uptime | 99.8% | 99.7% | Above avg |\n| Cost reduction (projected) | 45% | 40% | Above avg |\n| Setup time per desktop | 12 min | 18 min | Above avg |\n| User satisfaction | 4.3/5 | 4.1/5 | Above avg |\n| Security incidents | 0 | 0 | On benchmark |\n\n**Key takeaway:** Your results are tracking above our customer benchmarks across every metric — particularly on cost reduction (45% vs 40% avg) and user satisfaction.\n\n**Discussion Highlights:**\n- Management console rated \"significantly more intuitive\" by your team\n- Compliance documentation reviewed — no gaps identified\n- Question raised about DR/failover — architecture doc coming by Friday\n\n**Next Steps:**\n| Action | Owner | Due |\n|---|---|---|\n| DR/failover architecture doc | Nerdio SE team | [Date] |\n| Phase 2 POC scope | Your team | [Date] |\n| Executive alignment meeting | Alex to schedule | [Date] |\n| Full POC readout | Joint | [Date] |\n\nPlease let me know if I've missed anything.\n\nBest,\nAlex\n\n---\n*The benchmark comparison in the table is a strong closing tool — it shows the prospect they're getting better-than-average results, which reduces risk perception.*",
    fallback: "I'll draft that for you. What type of content do you need?\n\n**Follow-up emails:** Post-meeting, proposal follow-up, re-engagement\n**Meeting recaps:** Discovery, POC review, executive meeting\n**Outreach sequences:** Multi-touch, re-engagement, multi-thread intros\n**Internal comms:** Deal updates, forecast notes, win/loss reports\n\nI'll weave in relevant benchmark data to strengthen every message — your ROI-lead emails get 38% reply rate (your top-performing format).\n\nName the scenario and I'll generate ready-to-review content.",
  },
};

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function MiniLine({ data, maxH = 55, color = "#1D9E75", id: lineId }) {
  const vals = data.map(d => d.v !== undefined ? d.v : d.value);
  const mx = Math.max(...vals); const mn = Math.min(...vals); const range = mx - mn || 1;
  const pts = vals.map((v, i) => ({ x: (i / (vals.length - 1)) * 100, y: maxH - ((v - mn) / range) * (maxH - 16) - 8 }));
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const area = path + ` L100,${maxH} L0,${maxH} Z`;
  const gid = `ag-${lineId || Math.random()}`;
  return (
    <svg viewBox={`0 0 100 ${maxH}`} style={{ width: "100%", height: maxH }} preserveAspectRatio="none">
      <defs><linearGradient id={gid} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.18" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs>
      <path d={area} fill={`url(#${gid})`} /><path d={path} fill="none" stroke={color} strokeWidth="1.5" />
      <circle cx={pts[pts.length-1].x} cy={pts[pts.length-1].y} r="2.5" fill={color} />
    </svg>
  );
}

function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  const colors = { success: { bg: "#E1F5EE", color: "#0F6E56", border: "#C2EDD8" }, info: { bg: "#E6F1FB", color: "#185FA5", border: "#C7DEF7" }, warning: { bg: "#FAEEDA", color: "#854F0B", border: "#F0E6D6" } };
  const c = colors[type] || colors.info;
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, background: c.bg, color: c.color, border: `1px solid ${c.border}`, borderRadius: 10, padding: "12px 20px", fontSize: 13, fontWeight: 500, zIndex: 9999, boxShadow: "0 4px 20px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", gap: 8, animation: "slideUp 0.3s ease" }}>
      {type === "success" ? "✓" : "ℹ"} {message}
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: c.color, marginLeft: 8 }}>×</button>
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function AECockpit() {
  const load = (key, def) => { try { const v = localStorage.getItem(`ae-bench-${key}`); return v ? JSON.parse(v) : def; } catch { return def; } };

  const [view, setView] = useState(load("view", "benchmarks"));
  const [category, setCategory] = useState("all");
  const [expandedMetric, setExpandedMetric] = useState(null);
  const [activeAgent, setActiveAgent] = useState(null);
  const [agentChatMsgs, setAgentChatMsgs] = useState(load("agentChatMsgs", {}));
  const [agentInput, setAgentInput] = useState("");
  const [agentLoading, setAgentLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [leaderboardSort, setLeaderboardSort] = useState("rank");
  const [compSort, setCompSort] = useState("winRate");
  const agentChatEndRef = useRef(null);
  const searchRef = useRef(null);

  // Persist
  useEffect(() => { localStorage.setItem("ae-bench-view", JSON.stringify(view)); }, [view]);
  useEffect(() => { localStorage.setItem("ae-bench-agentChatMsgs", JSON.stringify(agentChatMsgs)); }, [agentChatMsgs]);
  useEffect(() => { agentChatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [agentChatMsgs, agentLoading]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.metaKey && e.key === "k") { e.preventDefault(); setSearchOpen(o => !o); setTimeout(() => searchRef.current?.focus(), 50); }
      if (e.key === "Escape") { setSearchOpen(false); setSearchQuery(""); if (activeAgent) setActiveAgent(null); else setExpandedMetric(null); }
      if (e.metaKey && e.key === "1") { e.preventDefault(); setView("benchmarks"); }
      if (e.metaKey && e.key === "2") { e.preventDefault(); setView("competitive"); }
      if (e.metaKey && e.key === "3") { e.preventDefault(); setView("leaderboard"); }
      if (e.metaKey && e.key === "4") { e.preventDefault(); setView("agents"); setActiveAgent(null); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeAgent]);

  const showToast = (msg, type = "success") => setToast({ message: msg, type });

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text.replace(/\*\*/g, ""));
    showToast("Copied to clipboard");
  };

  // Agent chat
  const handleAgentChat = useCallback((text) => {
    const q = text || agentInput;
    if (!q.trim() || !activeAgent) return;
    const agentId = activeAgent.id;
    setAgentChatMsgs(prev => ({ ...prev, [agentId]: [...(prev[agentId] || []), { from: "user", text: q }] }));
    setAgentInput("");
    setAgentLoading(true);
    setTimeout(() => {
      const responses = AGENT_RESPONSES[agentId] || {};
      let reply = responses[q] || responses.fallback || "I'll analyze that based on your benchmark data and get back to you with specific recommendations.";
      setAgentChatMsgs(prev => ({ ...prev, [agentId]: [...(prev[agentId] || []), { from: "agent", text: reply }] }));
      setAgentLoading(false);
    }, 1000 + Math.random() * 800);
  }, [agentInput, activeAgent]);

  const renderText = (text) => {
    if (!text) return null;
    return text.split("\n").map((line, i) => (
      <span key={i}>{i > 0 && <br />}{line.split("**").map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}</span>
    ));
  };

  const filteredMetrics = category === "all" ? BENCHMARK_METRICS : BENCHMARK_METRICS.filter(m => m.category === category);
  const pctQuota = Math.round((REP.closed / REP.quota) * 100);

  // Search
  const searchResults = searchQuery.trim() ? [
    ...BENCHMARK_METRICS.filter(m => m.label.toLowerCase().includes(searchQuery.toLowerCase()) || m.insight.toLowerCase().includes(searchQuery.toLowerCase())),
  ] : [];

  const navBtn = (v, label, shortcut) => (
    <button key={v} onClick={() => { setView(v); if (v !== "agents") setActiveAgent(null); }} style={{ fontSize: 13, padding: "6px 16px", borderRadius: 6, background: view === v ? "#f0efe9" : "transparent", color: view === v ? "#1a1a1a" : "#888", border: "none", cursor: "pointer", fontWeight: view === v ? 500 : 400, display: "flex", alignItems: "center", gap: 6 }}>
      {label}
      {shortcut && <kbd style={{ fontSize: 9, padding: "1px 4px", borderRadius: 3, background: view === v ? "#e0dfd8" : "#f0efe9", color: "#999", border: "1px solid #ddd" }}>{shortcut}</kbd>}
    </button>
  );

  const statusColor = (you, target, inverted) => {
    const diff = inverted ? target - you : you - target;
    return diff >= 0 ? "#0F6E56" : diff >= -0.2 * target ? "#BA7517" : "#A32D2D";
  };

  return (
    <div style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif", background: "#FAFAF8", minHeight: "100vh" }}>
      <style>{`
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes pulse { 0%,100% { opacity:0.3 } 50% { opacity:1 } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Search overlay */}
      {searchOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 9998, display: "flex", justifyContent: "center", paddingTop: 120 }} onClick={() => { setSearchOpen(false); setSearchQuery(""); }}>
          <div style={{ width: 560, background: "#fff", borderRadius: 14, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", overflow: "hidden", maxHeight: 480, animation: "fadeIn 0.15s ease" }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #eee", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ color: "#888", fontSize: 16 }}>&#x1F50D;</span>
              <input ref={searchRef} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search metrics, benchmarks, agents..." autoFocus style={{ flex: 1, fontSize: 15, border: "none", outline: "none", background: "transparent" }} />
              <kbd style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "#f0efe9", color: "#888", border: "1px solid #ddd" }}>ESC</kbd>
            </div>
            <div style={{ maxHeight: 380, overflowY: "auto", padding: "8px 0" }}>
              {searchQuery.trim() && searchResults.length === 0 && <p style={{ padding: 20, textAlign: "center", color: "#888", fontSize: 13 }}>No results</p>}
              {searchResults.map((m, i) => (
                <div key={i} onClick={() => { setView("benchmarks"); setExpandedMetric(m.id); setSearchOpen(false); setSearchQuery(""); }} style={{ padding: "10px 20px", cursor: "pointer", borderBottom: "1px solid #f5f5f2" }} onMouseOver={e => e.currentTarget.style.background = "#f7f6f3"} onMouseOut={e => e.currentTarget.style.background = "transparent"}>
                  <span style={{ fontWeight: 500, fontSize: 13 }}>{m.label}</span>
                  <span style={{ fontSize: 11, color: "#888", marginLeft: 8 }}>{m.you}{m.unit} (you) vs {m.topPerformer}{m.unit} (top)</span>
                </div>
              ))}
              {!searchQuery.trim() && (
                <div style={{ padding: "12px 20px" }}>
                  <p style={{ fontSize: 11, color: "#888", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Jump to</p>
                  {[{ l: "Benchmarks", v: "benchmarks" }, { l: "Competitive Analysis", v: "competitive" }, { l: "Team Leaderboard", v: "leaderboard" }, { l: "Agent Hub", v: "agents" }].map(item => (
                    <div key={item.v} onClick={() => { setView(item.v); setSearchOpen(false); setSearchQuery(""); }} style={{ padding: "8px 12px", cursor: "pointer", borderRadius: 6, fontSize: 13 }} onMouseOver={e => e.currentTarget.style.background = "#f7f6f3"} onMouseOut={e => e.currentTarget.style.background = "transparent"}>
                      {item.l}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ TOP NAV ═══ */}
      <div style={{ background: "#fff", borderBottom: "1px solid #eee", padding: "0 24px", display: "flex", alignItems: "center", height: 52 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 32 }}>
          <svg width="20" height="20" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#0078D4"/><text x="4" y="17" fontSize="13" fontWeight="700" fill="#fff">N</text></svg>
          <span style={{ fontWeight: 600, fontSize: 15, letterSpacing: -0.3 }}>Nerdio</span>
          <span style={{ fontSize: 12, color: "#888", marginLeft: 4 }}>AE Benchmark Analytics</span>
        </div>
        <div style={{ display: "flex", gap: 2 }}>
          {navBtn("benchmarks", "Benchmarks", "⌘1")}
          {navBtn("competitive", "Competitive", "⌘2")}
          {navBtn("leaderboard", "Leaderboard", "⌘3")}
          {navBtn("agents", "Agents", "⌘4")}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => { setSearchOpen(true); setTimeout(() => searchRef.current?.focus(), 50); }} style={{ fontSize: 12, padding: "5px 12px", borderRadius: 6, background: "#f7f6f3", color: "#888", border: "1px solid #e0e0e0", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            Search <kbd style={{ fontSize: 9, padding: "1px 4px", borderRadius: 3, background: "#e8e7e3", border: "1px solid #ddd" }}>⌘K</kbd>
          </button>
          <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: pctQuota >= 80 ? "#E1F5EE" : "#FAEEDA", color: pctQuota >= 80 ? "#0F6E56" : "#854F0B", fontWeight: 500 }}>{pctQuota}% to quota</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#E6F1FB", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 11, color: "#185FA5" }}>AN</div>
            <span style={{ fontSize: 13, fontWeight: 500 }}>Alex Navarro</span>
          </div>
        </div>
      </div>

      <div style={{ padding: "16px 24px" }}>

        {/* ═══ BENCHMARKS VIEW (Default) ═══ */}
        {view === "benchmarks" && (
          <div style={{ animation: "fadeIn 0.2s ease" }}>
            {/* Snapshot strip */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10, marginBottom: 16 }}>
              {[
                { label: "Quota Attainment", value: `${pctQuota}%`, sub: `$${(REP.closed/1000).toFixed(0)}K / $${(REP.quota/1000).toFixed(0)}K`, color: pctQuota >= 80 ? "#0F6E56" : "#BA7517" },
                { label: "Win Rate", value: `${REP.winRate}%`, sub: "vs 26% team", color: "#0F6E56" },
                { label: "Avg Deal Size", value: `$${(REP.avgDealSize/1000).toFixed(0)}K`, sub: "vs $72K team", color: "#0F6E56" },
                { label: "Sales Cycle", value: `${REP.avgCycle}d`, sub: "vs 54d team", color: "#A32D2D" },
                { label: "Pipeline", value: `${REP.coverage}x`, sub: `$${(REP.pipeline/1000000).toFixed(1)}M total`, color: "#BA7517" },
                { label: "Forecast", value: `$${(REP.forecastCommit/1000).toFixed(0)}K`, sub: "commit", color: "#888" },
              ].map((m, i) => (
                <div key={i} style={{ background: "#fff", borderRadius: 10, padding: "14px 16px", border: "1px solid #eee" }}>
                  <p style={{ fontSize: 10, color: "#888", margin: 0, textTransform: "uppercase", letterSpacing: 0.5 }}>{m.label}</p>
                  <p style={{ fontSize: 24, fontWeight: 600, margin: "4px 0 2px", letterSpacing: -0.5 }}>{m.value}</p>
                  <p style={{ fontSize: 11, color: m.color, margin: 0 }}>{m.sub}</p>
                </div>
              ))}
            </div>

            {/* Category filter */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", gap: 4 }}>
                {CATEGORIES.map(c => (
                  <button key={c.id} onClick={() => setCategory(c.id)} style={{ fontSize: 12, padding: "5px 14px", borderRadius: 6, background: category === c.id ? "#1a1a1a" : "#fff", color: category === c.id ? "#fff" : "#666", border: category === c.id ? "none" : "1px solid #e0e0e0", cursor: "pointer", fontWeight: category === c.id ? 500 : 400 }}>{c.label}</button>
                ))}
              </div>
              <button onClick={() => { setView("agents"); setActiveAgent(AGENTS[0]); }} style={{ fontSize: 12, padding: "6px 14px", borderRadius: 6, background: "#FFF8F0", color: "#D4A574", border: "1px solid #F0E6D6", cursor: "pointer", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
                🧠 Ask Copilot about my benchmarks
              </button>
            </div>

            {/* Metric cards grid */}
            <div style={{ display: "grid", gridTemplateColumns: expandedMetric ? "1fr 1fr" : "1fr 1fr 1fr", gap: 12 }}>
              {filteredMetrics.map(m => {
                const isExpanded = expandedMetric === m.id;
                const isGood = m.inverted ? m.you <= m.team : m.you >= m.team;
                const vsTop = m.inverted ? m.topPerformer - m.you : m.you - m.topPerformer;
                const max = Math.max(m.you, m.team, m.topPerformer, m.industry) * 1.15;
                const barW = (v) => `${(v / max) * 100}%`;

                if (expandedMetric && !isExpanded) {
                  return (
                    <div key={m.id} onClick={() => setExpandedMetric(m.id)} style={{ background: "#fff", borderRadius: 10, padding: "12px 14px", border: "1px solid #eee", cursor: "pointer", transition: "all 0.15s" }} onMouseOver={e => e.currentTarget.style.borderColor = "#ccc"} onMouseOut={e => e.currentTarget.style.borderColor = "#eee"}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 12, fontWeight: 500 }}>{m.label}</span>
                        <span style={{ fontSize: 14, fontWeight: 600, color: isGood ? "#0F6E56" : "#A32D2D" }}>{m.you}{m.unit}</span>
                      </div>
                      <MiniLine data={m.trend} maxH={32} color={isGood ? "#1D9E75" : "#E24B4A"} id={m.id + "-sm"} />
                    </div>
                  );
                }

                return (
                  <div key={m.id} onClick={() => setExpandedMetric(isExpanded ? null : m.id)} style={{ background: "#fff", borderRadius: 12, padding: isExpanded ? 24 : 18, border: `1px solid ${isExpanded ? "#ccc" : "#eee"}`, cursor: "pointer", gridColumn: isExpanded ? "span 2" : "span 1", transition: "all 0.2s" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: isExpanded ? 16 : 10 }}>
                      <div>
                        <p style={{ fontSize: isExpanded ? 15 : 13, fontWeight: 600, margin: 0 }}>{m.label}</p>
                        <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 4, background: { effectiveness: "#EEEDFE", velocity: "#FAEEDA", pipeline: "#E6F1FB", activity: "#E1F5EE" }[m.category], color: { effectiveness: "#534AB7", velocity: "#854F0B", pipeline: "#185FA5", activity: "#0F6E56" }[m.category] }}>{m.category}</span>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: isExpanded ? 28 : 22, fontWeight: 600, margin: 0, color: isGood ? "#0F6E56" : "#A32D2D" }}>{m.you}{m.unit}</p>
                        <p style={{ fontSize: 10, color: "#888", margin: 0 }}>{vsTop > 0 ? "+" : ""}{m.unit === "$K" || m.unit === " avg contacts" ? vsTop.toFixed(1) : Math.round(vsTop)}{m.unit} vs top</p>
                      </div>
                    </div>

                    {/* Benchmark bars */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: isExpanded ? 16 : 8 }}>
                      {[
                        { label: "You", value: m.you, color: isGood ? "#1D9E75" : "#E24B4A" },
                        { label: "Team", value: m.team, color: "#85B7EB" },
                        { label: "Top", value: m.topPerformer, color: "#EF9F27" },
                        { label: "Industry", value: m.industry, color: "#B4B2A9" },
                      ].map((b, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 9, color: "#888", width: 44, textAlign: "right", flexShrink: 0 }}>{b.label}</span>
                          <div style={{ flex: 1, height: 7, background: "#f0efe9", borderRadius: 4, overflow: "hidden" }}>
                            <div style={{ height: "100%", background: b.color, borderRadius: 4, width: barW(b.value), transition: "width 0.4s ease" }} />
                          </div>
                          <span style={{ fontSize: 9, color: "#888", width: 46, flexShrink: 0 }}>{b.value}{m.unit}</span>
                        </div>
                      ))}
                    </div>

                    {/* Trend */}
                    <MiniLine data={m.trend} maxH={isExpanded ? 70 : 40} color={isGood ? "#1D9E75" : "#E24B4A"} id={m.id} />
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                      {m.trend.map((d, j) => <span key={j} style={{ fontSize: 8, color: "#aaa" }}>{d.m}</span>)}
                    </div>

                    {/* Expanded: insight + actions */}
                    {isExpanded && (
                      <div style={{ marginTop: 16, animation: "fadeIn 0.2s ease" }}>
                        <div style={{ background: "#FFFBF5", borderRadius: 8, padding: 14, border: "1px solid #F0E6D6", marginBottom: 12 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                            <span style={{ fontSize: 14 }}>🧠</span>
                            <span style={{ fontSize: 11, fontWeight: 600, color: "#9C4D1A" }}>Claude Insight</span>
                          </div>
                          <p style={{ fontSize: 12, lineHeight: 1.6, margin: 0, color: "#555" }}>{m.insight}</p>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={(e) => { e.stopPropagation(); copyToClipboard(`${m.label}: ${m.you}${m.unit} (you) vs ${m.team}${m.unit} (team) vs ${m.topPerformer}${m.unit} (top)\n\n${m.insight}`); }} style={{ fontSize: 11, padding: "6px 14px", borderRadius: 6, background: "#f0efe9", color: "#666", border: "none", cursor: "pointer" }}>Copy insight</button>
                          <button onClick={(e) => { e.stopPropagation(); setView("agents"); setActiveAgent(AGENTS[0]); }} style={{ fontSize: 11, padding: "6px 14px", borderRadius: 6, background: "#FFF8F0", color: "#D4A574", border: "1px solid #F0E6D6", cursor: "pointer" }}>Dig deeper with Copilot</button>
                          <button onClick={(e) => { e.stopPropagation(); showToast("Exported to report", "info"); }} style={{ fontSize: 11, padding: "6px 14px", borderRadius: 6, background: "#f0efe9", color: "#666", border: "none", cursor: "pointer" }}>Export</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quarter over Quarter */}
            <div style={{ marginTop: 16, background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #eee" }}>
              <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 4px" }}>Quarter over Quarter Progression</p>
              <p style={{ fontSize: 11, color: "#888", margin: "0 0 14px" }}>Tracking improvement across key benchmarks</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                {QUARTER_COMPS.map((q, i) => {
                  const att = Math.round(q.closed / q.quota * 100);
                  const isCurrent = i === QUARTER_COMPS.length - 1;
                  return (
                    <div key={i} style={{ padding: 16, borderRadius: 10, background: isCurrent ? "#F7F6F3" : "transparent", border: isCurrent ? "1px solid #e0e0e0" : "1px solid transparent" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <span style={{ fontSize: 14, fontWeight: 600 }}>{q.q}</span>
                        {isCurrent && <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: "#E6F1FB", color: "#185FA5" }}>CURRENT</span>}
                      </div>
                      <div style={{ height: 6, background: "#f0efe9", borderRadius: 3, marginBottom: 10, overflow: "hidden" }}>
                        <div style={{ height: "100%", borderRadius: 3, background: att >= 80 ? "#1D9E75" : att >= 50 ? "#EF9F27" : "#E24B4A", width: `${Math.min(att, 100)}%` }} />
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 11 }}>
                        <div><span style={{ color: "#888" }}>Attainment</span><p style={{ fontWeight: 600, margin: "2px 0 0" }}>{att}%</p></div>
                        <div><span style={{ color: "#888" }}>Win Rate</span><p style={{ fontWeight: 600, margin: "2px 0 0" }}>{q.win}%</p></div>
                        <div><span style={{ color: "#888" }}>Cycle</span><p style={{ fontWeight: 600, margin: "2px 0 0" }}>{q.cycle}d</p></div>
                        <div><span style={{ color: "#888" }}>Coverage</span><p style={{ fontWeight: 600, margin: "2px 0 0" }}>{q.coverage}x</p></div>
                        <div><span style={{ color: "#888" }}>Deals</span><p style={{ fontWeight: 600, margin: "2px 0 0" }}>{q.deals}</p></div>
                        <div><span style={{ color: "#888" }}>Pipe Gen/Mo</span><p style={{ fontWeight: 600, margin: "2px 0 0" }}>${q.pipeGen}K</p></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ═══ COMPETITIVE VIEW ═══ */}
        {view === "competitive" && (
          <div style={{ animation: "fadeIn 0.2s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Competitive Benchmark Analysis</h2>
                <p style={{ fontSize: 12, color: "#888", margin: "2px 0 0" }}>Your performance against different competitive scenarios</p>
              </div>
              <button onClick={() => { setView("agents"); setActiveAgent(AGENTS[0]); }} style={{ fontSize: 12, padding: "6px 14px", borderRadius: 6, background: "#FFF8F0", color: "#D4A574", border: "1px solid #F0E6D6", cursor: "pointer", fontWeight: 500 }}>🧠 Ask Copilot</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {COMPETITIVE_BENCHMARKS.map((c, i) => (
                <div key={i} style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #eee" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 14 }}>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>{c.competitor}</p>
                      <p style={{ fontSize: 11, color: "#888", margin: "2px 0 0" }}>{c.deals} deals analyzed</p>
                    </div>
                    <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: c.trend === "up" ? "#E1F5EE" : "#FAEEDA", color: c.trend === "up" ? "#0F6E56" : "#854F0B", fontWeight: 500 }}>{c.trend === "up" ? "↑ Improving" : "→ Flat"}</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                    <div>
                      <p style={{ fontSize: 10, color: "#888", margin: 0, textTransform: "uppercase", letterSpacing: 0.5 }}>Win Rate</p>
                      <p style={{ fontSize: 22, fontWeight: 600, margin: "4px 0 0", color: c.winRate >= 50 ? "#0F6E56" : c.winRate >= 35 ? "#BA7517" : "#A32D2D" }}>{c.winRate}%</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 10, color: "#888", margin: 0, textTransform: "uppercase", letterSpacing: 0.5 }}>Avg Cycle</p>
                      <p style={{ fontSize: 22, fontWeight: 600, margin: "4px 0 0" }}>{c.avgCycle}d</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 10, color: "#888", margin: 0, textTransform: "uppercase", letterSpacing: 0.5 }}>Avg Deal</p>
                      <p style={{ fontSize: 22, fontWeight: 600, margin: "4px 0 0" }}>${c.avgDeal}K</p>
                    </div>
                  </div>
                  <div style={{ marginTop: 14, padding: 12, background: "#FAFAF8", borderRadius: 8, border: "1px solid #f0efe9" }}>
                    <p style={{ fontSize: 11, color: "#555", margin: 0, lineHeight: 1.5 }}>
                      {c.competitor === "Citrix Displacement" && "Your strongest competitive position. Lead with cloud-native migration story and automation. Customers respond to the 90-day migration timeline and $340K avg savings."}
                      {c.competitor === "VMware Horizon" && "Weakest competitive area — need stronger TCO messaging. Emphasize Azure-native advantage, deployment speed (weeks vs months), and 40-60% lower TCO. Reference Forrester TEI study."}
                      {c.competitor === "Greenfield (No VDI)" && "Longer education cycle but good deal sizes. Lead with hybrid work enablement and operational efficiency. These prospects need the \"why VDI\" pitch before the \"why Nerdio\" pitch."}
                      {c.competitor === "AWS WorkSpaces" && "Strong win rate due to Azure-native advantage. Emphasize multi-cloud flexibility, existing Microsoft licensing leverage, and management console superiority."}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <button onClick={() => { copyToClipboard(`${c.competitor}: ${c.winRate}% win rate, ${c.avgCycle}d avg cycle, $${c.avgDeal}K avg deal`); }} style={{ fontSize: 11, padding: "5px 12px", borderRadius: 5, background: "#f0efe9", color: "#666", border: "none", cursor: "pointer" }}>Copy</button>
                    <button onClick={() => { setView("agents"); setActiveAgent(AGENTS[1]); }} style={{ fontSize: 11, padding: "5px 12px", borderRadius: 5, background: "#F5F4FE", color: "#534AB7", border: "1px solid #DDDAFC", cursor: "pointer" }}>Draft competitive response</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Win/Loss summary */}
            <div style={{ marginTop: 16, background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #eee" }}>
              <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 14px" }}>Win/Loss Pattern Analysis</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                <div style={{ padding: 16, background: "#E1F5EE", borderRadius: 10, border: "1px solid #C2EDD8" }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "#0F6E56", margin: "0 0 8px" }}>What you win on</p>
                  {["Technical eval / POC performance", "Azure-native architecture story", "Automation & time savings messaging", "Multi-tenant management at scale"].map((w, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 0" }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#0F6E56", display: "inline-block" }} />
                      <span style={{ fontSize: 11, color: "#0F6E56" }}>{w}</span>
                    </div>
                  ))}
                </div>
                <div style={{ padding: 16, background: "#FCEBEB", borderRadius: 10, border: "1px solid #F5D1D1" }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "#A32D2D", margin: "0 0 8px" }}>What you lose on</p>
                  {["Single-threaded deals (14% win rate)", "Long Discovery→Demo gaps", "Generic follow-up emails", "VMware Horizon TCO comparisons"].map((l, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 0" }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#A32D2D", display: "inline-block" }} />
                      <span style={{ fontSize: 11, color: "#A32D2D" }}>{l}</span>
                    </div>
                  ))}
                </div>
                <div style={{ padding: 16, background: "#FAEEDA", borderRadius: 10, border: "1px solid #F0E6D6" }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "#854F0B", margin: "0 0 8px" }}>Highest impact actions</p>
                  {["Multi-thread every deal by Proposal stage", "Book demo in first discovery call", "Switch to ROI-first email format", "Build VMware-specific battle card"].map((a, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 0" }}>
                      <span style={{ fontSize: 11, color: "#854F0B" }}>{i + 1}. {a}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ LEADERBOARD VIEW ═══ */}
        {view === "leaderboard" && (
          <div style={{ animation: "fadeIn 0.2s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Team Leaderboard</h2>
                <p style={{ fontSize: 12, color: "#888", margin: "2px 0 0" }}>Q1 2026 performance rankings — North America Enterprise</p>
              </div>
              <button onClick={() => { setView("agents"); setActiveAgent(AGENTS[0]); }} style={{ fontSize: 12, padding: "6px 14px", borderRadius: 6, background: "#FFF8F0", color: "#D4A574", border: "1px solid #F0E6D6", cursor: "pointer", fontWeight: 500 }}>🧠 How do I move up?</button>
            </div>

            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #eee", overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "50px 1fr 120px 100px 80px 80px 120px", padding: "12px 20px", borderBottom: "1px solid #eee", background: "#FAFAF8" }}>
                {["#", "Name", "Closed / Quota", "Attainment", "Win Rate", "Deals", ""].map((h, i) => (
                  <span key={i} style={{ fontSize: 10, color: "#888", textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 500 }}>{h}</span>
                ))}
              </div>
              {TEAM_LEADERBOARD.map((rep, i) => {
                const att = Math.round(rep.closed / rep.quota * 100);
                return (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "50px 1fr 120px 100px 80px 80px 120px", padding: "14px 20px", borderBottom: i < TEAM_LEADERBOARD.length - 1 ? "1px solid #f5f5f2" : "none", background: rep.isYou ? "#F7F6F3" : "transparent", alignItems: "center" }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: rep.rank <= 3 ? "#EF9F27" : "#888" }}>
                      {rep.rank <= 3 ? ["🥇", "🥈", "🥉"][rep.rank - 1] : rep.rank}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 30, height: 30, borderRadius: "50%", background: rep.isYou ? "#E6F1FB" : "#f0efe9", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 10, color: rep.isYou ? "#185FA5" : "#888" }}>
                        {rep.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <span style={{ fontSize: 13, fontWeight: rep.isYou ? 600 : 400 }}>{rep.name}</span>
                        {rep.isYou && <span style={{ fontSize: 9, marginLeft: 6, padding: "1px 6px", borderRadius: 4, background: "#E6F1FB", color: "#185FA5" }}>YOU</span>}
                      </div>
                    </div>
                    <span style={{ fontSize: 12 }}>${(rep.closed/1000).toFixed(0)}K / ${(rep.quota/1000).toFixed(0)}K</span>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: att >= 80 ? "#0F6E56" : att >= 50 ? "#BA7517" : "#A32D2D" }}>{att}%</span>
                      <div style={{ height: 3, background: "#f0efe9", borderRadius: 2, marginTop: 4, overflow: "hidden", width: 80 }}>
                        <div style={{ height: "100%", borderRadius: 2, background: att >= 80 ? "#1D9E75" : att >= 50 ? "#EF9F27" : "#E24B4A", width: `${Math.min(att, 100)}%` }} />
                      </div>
                    </div>
                    <span style={{ fontSize: 12 }}>{rep.win}%</span>
                    <span style={{ fontSize: 12 }}>{rep.deals}</span>
                    <div>
                      {rep.isYou && (
                        <button onClick={() => { setView("agents"); setActiveAgent(AGENTS[0]); }} style={{ fontSize: 10, padding: "4px 10px", borderRadius: 5, background: "#FFF8F0", color: "#D4A574", border: "1px solid #F0E6D6", cursor: "pointer" }}>View gap analysis</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Gap to #3 analysis */}
            <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div style={{ background: "#FFFBF5", borderRadius: 12, padding: 20, border: "1px solid #F0E6D6" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 16 }}>🧠</span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>Gap to #3 (Priya Singh)</p>
                    <p style={{ fontSize: 11, color: "#9C4D1A", margin: 0 }}>What it takes to move up</p>
                  </div>
                </div>
                {[
                  { label: "Closed revenue gap", value: "$140K", detail: "Need 1.5 more deals at your avg size" },
                  { label: "Win rate gap", value: "+2pts", detail: "Close 1 more deal from current pipeline" },
                  { label: "Attainment gap", value: "+18pts", detail: "Priya at 75%, you at 57%" },
                  { label: "Key difference", value: "Multi-threading", detail: "Priya averages 2.8 contacts/deal vs your 1.5" },
                ].map((g, i) => (
                  <div key={i} style={{ padding: "8px 0", borderBottom: i < 3 ? "1px solid #F0E6D6" : "none" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 12, color: "#555" }}>{g.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#9C4D1A" }}>{g.value}</span>
                    </div>
                    <p style={{ fontSize: 10, color: "#888", margin: "2px 0 0" }}>{g.detail}</p>
                  </div>
                ))}
              </div>
              <div style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #eee" }}>
                <p style={{ fontSize: 13, fontWeight: 600, margin: "0 0 12px" }}>Your Relative Strengths</p>
                <p style={{ fontSize: 11, color: "#888", margin: "0 0 12px" }}>Where you outperform teammates</p>
                {[
                  { label: "Deal size", value: "$85K", team: "$72K", diff: "+18%" },
                  { label: "Tech eval conversion", value: "68%", team: "55%", diff: "+13pts" },
                  { label: "Citrix win rate", value: "65%", team: "52%", diff: "+13pts" },
                  { label: "Forecast accuracy", value: "72%", team: "68%", diff: "+4pts" },
                  { label: "Meetings/week", value: "12", team: "10", diff: "+20%" },
                ].map((s, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: i < 4 ? "1px solid #f5f5f2" : "none" }}>
                    <span style={{ fontSize: 12 }}>{s.label}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 500 }}>{s.value}</span>
                      <span style={{ fontSize: 10, color: "#0F6E56", fontWeight: 500 }}>{s.diff}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══ AGENTS VIEW ═══ */}
        {view === "agents" && !activeAgent && (
          <div style={{ animation: "fadeIn 0.2s ease" }}>
            <div style={{ marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Agent Hub</h2>
              <p style={{ fontSize: 12, color: "#888", margin: "2px 0 0" }}>Claude-powered agents for every stage of your workflow</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {AGENTS.map(agent => (
                <div key={agent.id} onClick={() => setActiveAgent(agent)} style={{ background: agent.bgColor, borderRadius: 12, padding: 20, border: `1px solid ${agent.borderColor}`, cursor: "pointer", transition: "transform 0.15s, box-shadow 0.15s" }} onMouseOver={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"; }} onMouseOut={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, border: `1px solid ${agent.borderColor}` }}>{agent.icon}</div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>{agent.name}</p>
                      <p style={{ fontSize: 11, color: agent.color, margin: 0, fontWeight: 500 }}>Claude-powered</p>
                    </div>
                  </div>
                  <p style={{ fontSize: 12, color: "#555", lineHeight: 1.5, margin: "0 0 12px" }}>{agent.description}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {agent.capabilities.slice(0, 3).map((cap, i) => (
                      <span key={i} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: "#fff", color: agent.color, border: `1px solid ${agent.borderColor}` }}>{cap}</span>
                    ))}
                    {agent.capabilities.length > 3 && <span style={{ fontSize: 10, color: "#888" }}>+{agent.capabilities.length - 3}</span>}
                  </div>
                </div>
              ))}
            </div>
            {/* Recent activity */}
            {Object.entries(agentChatMsgs).some(([, m]) => m.length > 0) && (
              <div style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #eee", marginTop: 14 }}>
                <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 12px" }}>Recent Agent Activity</p>
                {Object.entries(agentChatMsgs).filter(([, msgs]) => msgs.length > 0).map(([agentId, msgs]) => {
                  const agent = AGENTS.find(a => a.id === agentId);
                  if (!agent) return null;
                  const lastUserMsg = [...msgs].reverse().find(m => m.from === "user");
                  return (
                    <div key={agentId} onClick={() => setActiveAgent(agent)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #f5f5f2", cursor: "pointer" }}>
                      <span style={{ fontSize: 18 }}>{agent.icon}</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 12, fontWeight: 500, margin: 0 }}>{agent.name}</p>
                        <p style={{ fontSize: 11, color: "#888", margin: 0 }}>{lastUserMsg ? lastUserMsg.text.slice(0, 60) + (lastUserMsg.text.length > 60 ? "..." : "") : "..."}</p>
                      </div>
                      <span style={{ fontSize: 10, color: "#888" }}>{msgs.length} messages</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ═══ ACTIVE AGENT VIEW ═══ */}
        {view === "agents" && activeAgent && (
          <div style={{ animation: "fadeIn 0.2s ease" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <button onClick={() => setActiveAgent(null)} style={{ fontSize: 13, padding: "6px 12px", borderRadius: 6, background: "#f0efe9", border: "none", cursor: "pointer", color: "#666" }}>← Back</button>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: activeAgent.bgColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, border: `1px solid ${activeAgent.borderColor}` }}>{activeAgent.icon}</div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>{activeAgent.name}</p>
                <p style={{ fontSize: 11, color: activeAgent.color, margin: 0 }}>{activeAgent.description}</p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 14 }}>
              {/* Chat */}
              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #eee", display: "flex", flexDirection: "column", height: "calc(100vh - 210px)", overflow: "hidden" }}>
                <div style={{ padding: "10px 16px", borderBottom: "1px solid #eee", background: activeAgent.bgColor, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16 }}>{activeAgent.icon}</span>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{activeAgent.name}</span>
                  <button onClick={() => { setAgentChatMsgs(prev => ({ ...prev, [activeAgent.id]: [] })); showToast("Cleared", "info"); }} style={{ marginLeft: "auto", fontSize: 11, padding: "3px 8px", borderRadius: 4, background: "transparent", color: "#888", border: "1px solid #e0e0e0", cursor: "pointer" }}>Clear</button>
                </div>
                <div style={{ flex: 1, padding: 16, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
                  {(!agentChatMsgs[activeAgent.id] || agentChatMsgs[activeAgent.id].length === 0) && (
                    <div style={{ textAlign: "center", padding: "40px 20px" }}>
                      <div style={{ fontSize: 40, marginBottom: 12 }}>{activeAgent.icon}</div>
                      <p style={{ fontSize: 15, fontWeight: 600, margin: "0 0 4px" }}>{activeAgent.name}</p>
                      <p style={{ fontSize: 12, color: "#888", margin: "0 0 20px", lineHeight: 1.5 }}>{activeAgent.description}</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
                        {activeAgent.capabilities.map((cap, i) => (
                          <span key={i} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 5, background: activeAgent.bgColor, color: activeAgent.color, border: `1px solid ${activeAgent.borderColor}` }}>{cap}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {(agentChatMsgs[activeAgent.id] || []).map((m, i) => (
                    <div key={i} style={{ alignSelf: m.from === "user" ? "flex-end" : "flex-start", maxWidth: "85%" }}>
                      <div style={{ background: m.from === "user" ? "#E6F1FB" : activeAgent.bgColor, borderRadius: m.from === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px", padding: "12px 16px", border: m.from === "user" ? "none" : `1px solid ${activeAgent.borderColor}` }}>
                        <p style={{ fontSize: 12, lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>{renderText(m.text)}</p>
                      </div>
                      {m.from === "agent" && (
                        <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                          <button onClick={() => copyToClipboard(m.text)} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: "#f7f6f3", color: "#888", border: "1px solid #e0e0e0", cursor: "pointer" }}>Copy</button>
                          <button onClick={() => showToast("Sent to email draft")} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: "#f7f6f3", color: "#888", border: "1px solid #e0e0e0", cursor: "pointer" }}>Email</button>
                        </div>
                      )}
                    </div>
                  ))}
                  {agentLoading && (
                    <div style={{ alignSelf: "flex-start", background: activeAgent.bgColor, borderRadius: "12px 12px 12px 2px", padding: "12px 16px", border: `1px solid ${activeAgent.borderColor}` }}>
                      <div style={{ display: "flex", gap: 4 }}>{[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: activeAgent.color, animation: `pulse 1s ${i*0.2}s infinite` }} />)}</div>
                    </div>
                  )}
                  <div ref={agentChatEndRef} />
                </div>
                <div style={{ padding: "12px 16px", borderTop: "1px solid #eee", background: "#FAFAF8" }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input value={agentInput} onChange={e => setAgentInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAgentChat()} placeholder={`Ask ${activeAgent.name}...`} style={{ flex: 1, fontSize: 13, padding: "10px 14px", borderRadius: 8, border: "1px solid #ddd", outline: "none", background: "#fff" }} />
                    <button onClick={() => handleAgentChat()} style={{ fontSize: 13, padding: "10px 18px", borderRadius: 8, background: "#1a1a1a", color: "#fff", border: "none", cursor: "pointer", fontWeight: 500 }}>Send</button>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ background: "#fff", borderRadius: 10, padding: 16, border: "1px solid #eee" }}>
                  <p style={{ fontSize: 11, fontWeight: 500, margin: "0 0 10px", color: "#888", textTransform: "uppercase", letterSpacing: 0.5 }}>Suggested prompts</p>
                  {activeAgent.prompts.map((p, i) => (
                    <button key={i} onClick={() => handleAgentChat(p)} style={{ display: "block", width: "100%", textAlign: "left", fontSize: 12, padding: "8px 12px", borderRadius: 6, background: activeAgent.bgColor, color: "#333", border: `1px solid ${activeAgent.borderColor}`, cursor: "pointer", marginBottom: 6, lineHeight: 1.4 }}>{p}</button>
                  ))}
                </div>
                <div style={{ background: "#fff", borderRadius: 10, padding: 16, border: "1px solid #eee" }}>
                  <p style={{ fontSize: 11, fontWeight: 500, margin: "0 0 10px", color: "#888", textTransform: "uppercase", letterSpacing: 0.5 }}>Other agents</p>
                  {AGENTS.filter(a => a.id !== activeAgent.id).map(a => (
                    <div key={a.id} onClick={() => setActiveAgent(a)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", cursor: "pointer", borderBottom: "1px solid #f5f5f2" }}>
                      <span style={{ fontSize: 16 }}>{a.icon}</span>
                      <span style={{ fontSize: 12, fontWeight: 500 }}>{a.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
