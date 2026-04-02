import { useState, useRef, useEffect, useCallback } from "react";

// ─── DATA ───────────────────────────────────────────────────────────────────

const REP = { name: "Alex Navarro", initials: "AN", title: "Enterprise AE — North America", quarter: "Q1 2026", week: "Week 11 of 13", quota: 1200000, closed: 680000, pipeline: 2800000, coverage: 2.3, winRate: 28, avgDealSize: 85000, avgCycle: 62, dealsOpen: 18, dealsAtRisk: 4, meetingsThisWeek: 12, forecastCommit: 920000 };

const TABS = ["Pipeline management", "Deal risk", "Stakeholder gaps", "Coaching insights"];

const mkDeal = (id, name, company, role, stage, amount, closeDate, probability, signals, message, priority) => ({ id, name, company, role, stage, amount, closeDate, probability, signals, message, priority });
const sig = (label, type) => {
  const m = { risk: { bg: "#FCEBEB", color: "#A32D2D" }, momentum: { bg: "#E1F5EE", color: "#0F6E56" }, stakeholder: { bg: "#E6F1FB", color: "#185FA5" }, timing: { bg: "#FAEEDA", color: "#854F0B" }, competitive: { bg: "#EEEDFE", color: "#534AB7" }, coaching: { bg: "#FFF0E6", color: "#9C4D1A" } };
  return { label, ...(m[type] || m.timing) };
};

const ALL_DEALS = {
  "Pipeline management": [
    mkDeal(1,"Robert Chen","Apex Financial Group","CTO","Negotiation","$185K","3/28",75,[sig("Contract redline in progress","momentum"),sig("Legal review started","timing"),sig("Champion pushing internally","stakeholder")],"Robert — I've reviewed the redline your legal team sent back. Most of the changes are standard and we can accommodate. I've flagged two items that need our legal's input — expect those back by EOD tomorrow. Can we schedule a call Thursday to finalize terms? I'd love to get this wrapped up before quarter end.","critical"),
    mkDeal(2,"Michelle Park","TechVantage MSP","VP Operations","Proposal","$142K","3/31",60,[sig("Proposal sent 3/7 — no response","risk"),sig("Budget approved Q1","timing"),sig("Competitor demo scheduled","competitive")],"Michelle — checking in on the proposal I sent last week. I know TechVantage has Q1 budget earmarked, and I want to make sure we address any questions before you evaluate alternatives. I've also prepared a custom ROI model based on your 2,400 desktops. Can we review together tomorrow?","critical"),
    mkDeal(3,"Daniel Okafor","Meridian Cloud Services","CEO","Discovery","$220K","4/15",35,[sig("First meeting went well","momentum"),sig("Managing 8,000+ desktops","stakeholder"),sig("Current Citrix customer","competitive")],"Daniel — great conversation last week about Meridian's desktop strategy. I've put together a migration roadmap specifically for your Citrix environment — showing how other MSPs at your scale moved 8,000+ desktops to AVD with Nerdio in under 90 days. Worth a deeper technical session with your architects?","high"),
    mkDeal(4,"Karen Walsh","Summit Health Network","CISO","Technical Eval","$168K","4/10",50,[sig("Security review in progress","timing"),sig("POC approved — week 2","momentum"),sig("HIPAA compliance required","stakeholder")],"Karen — our SE team tells me the POC is going well — your team has migrated 200 test desktops with zero security incidents. I've prepared the HIPAA compliance documentation and SOC 2 report you requested. Can we schedule a mid-POC review for Friday to discuss the security architecture in detail?","high"),
    mkDeal(5,"Jason Huang","CloudBridge IT","Head of Sales","Demo scheduled","$96K","4/22",30,[sig("Demo Thursday 3/20","timing"),sig("Growing MSP — 400% YoY","momentum"),sig("No current AVD solution","stakeholder")],"Jason — looking forward to the demo Thursday. Given CloudBridge's 400% growth, I'm going to focus on how Nerdio scales multi-tenant management without adding headcount. I'll show the automated provisioning that lets your team onboard new clients in hours instead of days. Any specific scenarios you'd like me to cover?","high"),
    mkDeal(6,"Lisa Thornton","Pacific Managed IT","COO","Qualification","$78K","5/1",20,[sig("Inbound — requested pricing","timing"),sig("50-person MSP","stakeholder"),sig("Using manual AVD deployment","competitive")],"Lisa — thanks for reaching out about pricing. Before I put together a proposal, I'd love to understand Pacific's current workflow for AVD deployments. Most MSPs your size are spending 15-20 hours per client setup — Nerdio cuts that to under an hour. Can we do a 30-minute discovery call this week?","medium"),
    mkDeal(7,"Ahmed Hassan","NorthPoint Systems","VP Engineering","Proposal","$134K","4/8",55,[sig("Multi-year interest","momentum"),sig("Enterprise — 3,200 desktops","stakeholder"),sig("Decision committee formed","timing")],"Ahmed — great news on the decision committee. I'd like to prepare tailored materials for each stakeholder: TCO analysis for finance, security architecture for your CISO, and the technical deep-dive for your engineering leads. Can you share the committee roster so I can customize the presentation?","high"),
    mkDeal(8,"Sandra Liu","Vertex Cloud Partners","Managing Partner","Negotiation","$112K","3/25",80,[sig("Verbal commit — awaiting PO","momentum"),sig("MSP partner program interest","stakeholder"),sig("Closing this week","timing")],"Sandra — appreciate the verbal commit! I've sent the PO template and our standard MSP partnership agreement to your ops team. I'm also looping in our Partner Director to discuss co-marketing and referral incentives. Can your team get the PO processed by Wednesday?","critical"),
  ],
  "Deal risk": [
    mkDeal(9,"Tom Reeves","Cascade Digital","CTO","Stalled","$156K","3/31",25,[sig("No activity in 21 days","risk"),sig("Champion went silent","risk"),sig("Was in Negotiation stage","timing")],"Tom — I noticed we've gone quiet since the last call. I wanted to share something that might re-energize the conversation: we just published the Cascade-sized MSP benchmark report showing $340K avg annual savings with Nerdio. Also, our Q1 pricing promotion expires 3/31. Can we reconnect this week?","critical"),
    mkDeal(10,"Rebecca Frost","Alpine Technology","VP of IT","At risk","$198K","4/5",20,[sig("Evaluating VMware Horizon","competitive"),sig("Budget concerns raised","risk"),sig("Only 1 stakeholder engaged","stakeholder")],"Rebecca — I heard Alpine is also evaluating VMware Horizon. I'd love the chance to do a side-by-side comparison — Nerdio customers typically see 40-60% lower TCO vs Horizon, and deployment is weeks instead of months. On budget: our flexible licensing model means you can start with your highest-priority use case and expand. Can I send a comparison deck?","critical"),
    mkDeal(11,"Kevin Andersen","BluePeak MSP","CEO","Slipping","$88K","3/28",30,[sig("Close date pushed twice","risk"),sig("Procurement bottleneck","timing"),sig("Technical team bought in","momentum")],"Kevin — I know procurement has been a bottleneck. Since your technical team is already bought in, would it help if I put together a one-page executive summary for your CFO? I can highlight the 8-month payback period and include references from MSPs at your scale. Sometimes that unsticks things fast.","critical"),
    mkDeal(12,"Diana Morales","Pinnacle Cloud","Head of Infrastructure","Stalled","$144K","4/12",30,[sig("POC completed — no next steps","risk"),sig("Decision maker not engaged","stakeholder"),sig("Positive technical feedback","momentum")],"Diana — the POC results were strong: 99.8% uptime, 45% cost reduction in the test environment, and your team gave great feedback on the management console. I'd love to translate those results into a business case for your VP. Would you be open to an intro call so I can present the ROI model directly?","high"),
    mkDeal(13,"Eric Johansson","DataStream IT","Director of Cloud","At risk","$110K","4/1",20,[sig("Budget frozen for Q1","risk"),sig("Asked to revisit Q2","timing"),sig("Strong technical fit confirmed","momentum")],"Eric — I understand the Q1 budget freeze. I've seen other companies in this situation benefit from our deferred billing program — we can get DataStream started now and align the first payment with your Q2 cycle. This way your team doesn't lose momentum on the Snowflake + AVD initiative. Worth exploring?","high"),
    mkDeal(14,"Priya Patel","Horizon Services Group","VP Strategy","Ghosting","$76K","3/28",10,[sig("No response to 4 follow-ups","risk"),sig("Was engaged after demo","risk"),sig("Internal reorg rumored","stakeholder")],"Priya — I've tried reaching out a few times and I know things get busy, especially if there are organizational changes happening. I wanted to leave you with one thing: we helped a services company of similar size save $180K in their first year with Nerdio. If and when the timing is right, I'd love to pick this back up. No pressure at all.","medium"),
  ],
  "Stakeholder gaps": [
    mkDeal(15,"Robert Chen","Apex Financial Group","CTO","Negotiation","$185K","3/28",75,[sig("CFO not yet engaged","stakeholder"),sig("Legal involved — good sign","momentum"),sig("Need economic buyer sign-off","risk")],"Robert — as we finalize the contract, I want to make sure your CFO has everything they need to approve. I've prepared an executive ROI summary: $420K projected savings over 3 years, 8-month payback, and risk mitigation through SOC 2 compliance. Would you be comfortable introducing me, or should I draft an email you can forward?","critical"),
    mkDeal(16,"Karen Walsh","Summit Health Network","CISO","Technical Eval","$168K","4/10",50,[sig("CIO not in the loop","stakeholder"),sig("Need clinical IT lead buy-in","stakeholder"),sig("CISO engaged but not the decision maker","risk")],"Karen — as the POC wraps up, I want to make sure we're building consensus across your team. Specifically, I'd love to connect with your CIO to discuss the strategic fit and your clinical IT lead to review the end-user experience. Would a joint readout meeting work, or should I reach out to them separately?","high"),
    mkDeal(17,"Daniel Okafor","Meridian Cloud Services","CEO","Discovery","$220K","4/15",35,[sig("No technical evaluator engaged","stakeholder"),sig("CEO bought vision, needs proof","timing"),sig("Solutions architect needed","stakeholder")],"Daniel — our conversation about the strategic vision was great. To move forward, I'd love to bring your solutions architect into a technical deep-dive where we walk through the Citrix-to-AVD migration architecture. I'll have our SE demonstrate the automated migration tool. Who on your team should I coordinate with?","high"),
    mkDeal(18,"Ahmed Hassan","NorthPoint Systems","VP Engineering","Proposal","$134K","4/8",55,[sig("CFO on decision committee — not met","stakeholder"),sig("CISO review required","stakeholder"),sig("Procurement timeline unknown","timing")],"Ahmed — with the decision committee forming, I'd like to proactively engage your CFO and CISO before the formal review. For your CFO, I have a TCO comparison vs your current environment. For your CISO: our compliance certifications package and encryption architecture doc. Can you make those introductions this week?","high"),
    mkDeal(19,"Jason Huang","CloudBridge IT","Head of Sales","Demo scheduled","$96K","4/22",30,[sig("Founder/CEO not engaged","stakeholder"),sig("Need finance approval","stakeholder"),sig("Jason is influencer, not buyer","risk")],"Jason — after our demo Thursday, I think it would be valuable to get your founder involved for a strategic conversation about how Nerdio supports CloudBridge's growth trajectory. I've seen deals at growing MSPs move fastest when the CEO sees the operational leverage. Would you be open to a joint call next week?","medium"),
    mkDeal(20,"Lisa Thornton","Pacific Managed IT","COO","Qualification","$78K","5/1",20,[sig("Technical lead unknown","stakeholder"),sig("COO is economic buyer","momentum"),sig("Need end-user champion","stakeholder")],"Lisa — as we get into the evaluation, I'd love to connect with whoever manages your AVD deployments day-to-day. The hands-on practitioner usually becomes our strongest internal champion once they see the time savings. Can you point me to the right person on your team?","medium"),
  ],
  "Coaching insights": [
    mkDeal(21,"","","","Multi-threading","","",0,[sig("4 of 8 deals are single-threaded","coaching"),sig("Win rate drops 60% without 3+ contacts","coaching"),sig("Apex & Summit need exec engagement","coaching")],"**Multi-threading alert:** You have 4 deals where only 1 stakeholder is engaged. Your historical data shows deals with 3+ contacts close at 38% vs 14% for single-threaded. Priority: Get CFO engaged on Apex Financial ($185K) and CIO + clinical lead on Summit Health ($168K). These two deals alone represent $353K.","critical"),
    mkDeal(22,"","","","Deal velocity","","",0,[sig("Avg cycle: 62 days (team avg 54)","coaching"),sig("Discovery→Demo taking 18 days","coaching"),sig("Fastest deals: strong first call","coaching")],"**Velocity insight:** Your average deal cycle is 62 days vs 54 day team average. The biggest gap is Discovery to Demo — you're averaging 18 days vs the team's 11. Your fastest closed deals all had a demo scheduled in the first call. Try booking the demo during discovery to compress the cycle. This could add $120K+ to Q1 if applied to CloudBridge and Pacific.","high"),
    mkDeal(23,"","","","Competitive positioning","","",0,[sig("3 deals facing competition","coaching"),sig("Win rate vs Citrix: 65%","coaching"),sig("Win rate vs VMware: 42% — improve","coaching")],"**Competitive intel:** You're facing competition in 3 active deals. Your win rate vs Citrix is strong at 65% — lead with the cloud-native migration story. However, your VMware Horizon win rate is 42%. For the Alpine deal ($198K), use the TCO calculator and emphasize Nerdio's Azure-native advantage and deployment speed (weeks vs months). Reference the Forrester TEI study.","high"),
    mkDeal(24,"","","","Closing patterns","","",0,[sig("3 deals potentially closable in Q1","coaching"),sig("$445K at risk of slipping to Q2","coaching"),sig("Mutual action plans increase close rate 2x","coaching")],"**Q1 close plan:** You have 3 deals that can close this quarter: Sandra Liu ($112K, verbal commit), Robert Chen ($185K, in negotiation), and Tom Reeves ($156K, needs re-engagement). That's $453K potential vs your $520K gap to quota.\n\nAction: Build mutual action plans with clear milestones and dates for each. Deals with MAPs close at 2x the rate. I can draft templates for each — want me to?","critical"),
    mkDeal(25,"","","","Discovery quality","","",0,[sig("Top reps ask 12+ questions in disco","coaching"),sig("Your avg: 8 questions","coaching"),sig("Missing: budget timeline, decision process","coaching")],"**Discovery improvement:** Top-performing AEs ask 12+ questions in discovery calls. Your average is 8, and the gaps are typically around budget timeline, decision process, and success criteria. For your upcoming calls with CloudBridge and Pacific, try the MEDDPICC framework — specifically nail the Decision Process and Paper Process early. Deals where budget and process are confirmed in disco close 3x faster.","medium"),
    mkDeal(26,"","","","Email effectiveness","","",0,[sig("Your reply rate: 24% (team 31%)","coaching"),sig("Best template: ROI-lead emails at 38%","coaching"),sig("Worst: generic check-in at 12%","coaching")],"**Email optimization:** Your reply rate is 24% vs 31% team average. Your ROI-lead emails get 38% replies — use them more. Generic \"checking in\" emails only get 12%. For your at-risk deals (Tom Reeves, Rebecca Frost), switch to value-first messaging: lead with a specific insight or data point, not a status ask. I can rewrite your pending follow-ups — want me to?","medium"),
  ],
};

// ─── BENCHMARK DATA ─────────────────────────────────────────────────────────

const BENCHMARKS = {
  categories: [
    { label: "Win Rate", you: 28, team: 26, topPerformer: 38, industry: 22, unit: "%" },
    { label: "Avg Deal Size", you: 85, team: 72, topPerformer: 110, industry: 65, unit: "$K" },
    { label: "Avg Cycle (days)", you: 62, team: 54, topPerformer: 42, industry: 68, unit: "d", inverted: true },
    { label: "Pipeline Coverage", you: 2.3, team: 2.8, topPerformer: 3.5, industry: 2.5, unit: "x" },
    { label: "Discovery→Demo", you: 18, team: 11, topPerformer: 7, industry: 14, unit: "d", inverted: true },
    { label: "Email Reply Rate", you: 24, team: 31, topPerformer: 42, industry: 28, unit: "%" },
    { label: "Multi-threading", you: 1.5, team: 2.2, topPerformer: 3.4, industry: 2.0, unit: "contacts" },
    { label: "Meetings/Week", you: 12, team: 10, topPerformer: 15, industry: 9, unit: "" },
  ],
  trends: {
    winRate: [{ m: "Oct", v: 22 }, { m: "Nov", v: 25 }, { m: "Dec", v: 30 }, { m: "Jan", v: 26 }, { m: "Feb", v: 28 }, { m: "Mar", v: 28 }],
    dealSize: [{ m: "Oct", v: 68 }, { m: "Nov", v: 72 }, { m: "Dec", v: 78 }, { m: "Jan", v: 80 }, { m: "Feb", v: 83 }, { m: "Mar", v: 85 }],
    cycle: [{ m: "Oct", v: 72 }, { m: "Nov", v: 68 }, { m: "Dec", v: 65 }, { m: "Jan", v: 64 }, { m: "Feb", v: 63 }, { m: "Mar", v: 62 }],
    pipeline: [{ m: "Oct", v: 1.8 }, { m: "Nov", v: 2.1 }, { m: "Dec", v: 2.4 }, { m: "Jan", v: 2.0 }, { m: "Feb", v: 2.2 }, { m: "Mar", v: 2.3 }],
  },
  quarterComps: [
    { q: "Q3 2025", closed: 480000, quota: 1000000, win: 22, deals: 14 },
    { q: "Q4 2025", closed: 720000, quota: 1100000, win: 25, deals: 16 },
    { q: "Q1 2026", closed: 680000, quota: 1200000, win: 28, deals: 18 },
  ],
};

const PIPELINE_STAGES = [
  { stage: "Qualification", value: 78, deals: 1, color: "#B4B2A9" },
  { stage: "Discovery", value: 220, deals: 1, color: "#85B7EB" },
  { stage: "Demo", value: 96, deals: 1, color: "#AFA9EC" },
  { stage: "Tech Eval", value: 168, deals: 1, color: "#5DCAA5" },
  { stage: "Proposal", value: 276, deals: 2, color: "#EF9F27" },
  { stage: "Negotiation", value: 297, deals: 2, color: "#1D9E75" },
];

// ─── AGENT DEFINITIONS ──────────────────────────────────────────────────────

const AGENTS = [
  {
    id: "copilot",
    name: "AE Insight Copilot",
    icon: "🧠",
    color: "#D4A574",
    bgColor: "#FFF8F0",
    borderColor: "#F0E6D6",
    description: "Real-time deal intelligence, coaching nudges, and strategic recommendations powered by your pipeline data",
    capabilities: ["Deal scoring & prioritization", "Coaching recommendations", "Competitive intelligence", "Forecast modeling", "Risk early warnings"],
    prompts: [
      "What should I focus on this week?",
      "Which deals are most likely to slip?",
      "How do I improve my win rate?",
      "Build me a Q1 close plan",
      "Score my pipeline health",
    ],
  },
  {
    id: "rfp",
    name: "RFP & Response Support",
    icon: "📋",
    color: "#534AB7",
    bgColor: "#F5F4FE",
    borderColor: "#DDDAFC",
    description: "Draft and refine RFP responses with AI-assisted research, formatting, and compliance checking",
    capabilities: ["RFP response drafting", "Compliance checklist generation", "Competitive differentiation sections", "Technical spec formatting", "Win theme identification"],
    prompts: [
      "Draft a security & compliance section for Summit Health",
      "Create an RFP response for the Apex Financial deal",
      "Generate a competitive comparison vs VMware Horizon",
      "Write the executive summary for NorthPoint proposal",
      "Build a pricing justification section",
    ],
  },
  {
    id: "research",
    name: "Account & Deal Research",
    icon: "🔍",
    color: "#185FA5",
    bgColor: "#F0F6FE",
    borderColor: "#C7DEF7",
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
    id: "email",
    name: "Email & Recap Generation",
    icon: "✉️",
    color: "#0F6E56",
    bgColor: "#EEFBF5",
    borderColor: "#C2EDD8",
    description: "Draft follow-up emails, meeting recaps, and outreach sequences for rep review and send",
    capabilities: ["Follow-up email drafts", "Meeting recap summaries", "Multi-touch sequences", "Re-engagement campaigns", "Internal deal update emails"],
    prompts: [
      "Write a follow-up to Tom Reeves at Cascade",
      "Draft a meeting recap for the Karen Walsh POC review",
      "Create a re-engagement sequence for Priya Patel",
      "Write an internal deal update for my manager",
      "Draft a multi-thread intro email for Apex CFO",
    ],
  },
];

// ─── AGENT RESPONSES ────────────────────────────────────────────────────────

const AGENT_RESPONSES = {
  copilot: {
    "What should I focus on this week?": "**This Week's Priority Stack — March 18-22**\n\n**1. Sandra Liu / Vertex Cloud — $112K** 🔴 CLOSE\nVerbal commit in hand. PO pending. Chase ops team for PO by Wednesday. This is your highest-probability close.\n\n**2. Robert Chen / Apex Financial — $185K** 🔴 CLOSE\nContract redline in progress. Get your legal to respond to their 2 flagged items TODAY. Schedule Thursday call to finalize. Don't let this slip past quarter.\n\n**3. Tom Reeves / Cascade Digital — $156K** 🟡 RE-ENGAGE\n21 days dark. Send the benchmark report + Q1 pricing deadline as urgency lever. If no response by Wednesday, try his LinkedIn or a different channel.\n\n**4. CloudBridge Demo Prep — Thursday** 🟡 PREPARE\nCustomize the demo for 400% growth story. Focus: multi-tenant scale, automated provisioning, headcount efficiency.\n\n**5. Multi-thread Apex + Summit** 🟡 EXPAND\nBoth $185K and $168K deals are single-threaded. Get CFO intro at Apex. Get CIO + clinical lead at Summit.\n\n**If you execute all 5:** Path to $977K closed (81% of quota) with upside to $1.27M (106%).",
    "Which deals are most likely to slip?": "**Slip Risk Analysis — Ranked by Probability of Missing Close Date**\n\n🔴 **HIGH SLIP RISK:**\n\n**1. Priya Patel / Horizon — $76K (Due 3/28)**\nSlip confidence: **95%**\n4 unreturned follow-ups + rumored reorg = effectively dead for Q1. Recommend: breakup email, revisit Q2.\n\n**2. Tom Reeves / Cascade — $156K (Due 3/31)**\nSlip confidence: **75%**\n21 days stalled after being in Negotiation. Champion silent. However, Q1 pricing deadline and benchmark report could re-engage. Worth one strong attempt.\n\n**3. Kevin Andersen / BluePeak — $88K (Due 3/28)**\nSlip confidence: **65%**\nClose date already pushed twice. Procurement bottleneck. Tech team loves it but can't get PO through. CFO one-pager may help.\n\n🟡 **MODERATE SLIP RISK:**\n\n**4. Rebecca Frost / Alpine — $198K (Due 4/5)**\nSlip confidence: **55%**\nCompetitor eval + budget concerns + single-threaded. Biggest dollar risk.\n\n**5. Michelle Park / TechVantage — $142K (Due 3/31)**\nSlip confidence: **40%**\nProposal sent 3/7, no response. Budget approved but competitor demo scheduled.\n\n**Total Q1 at risk of slipping: $660K.** Focus saves on Tom ($156K) and Kevin ($88K) — clearest paths with tightest deadlines.",
    "How do I improve my win rate?": "**Win Rate Improvement Plan — From 28% to 35%+**\n\nBased on your last 4 quarters of data, here are the 3 highest-leverage changes:\n\n**1. Multi-thread earlier (Impact: +6% win rate)**\nYour single-threaded deals close at 14%. Deals with 3+ contacts close at 38%. That's a 2.7x multiplier. You currently have 50% of deals single-threaded vs 25% for top performers.\n→ **Action:** Add a mandatory \"who else should we include?\" in every discovery call. Target 3+ contacts by Proposal stage.\n\n**2. Compress Discovery→Demo (Impact: +4% win rate)**\nYou take 18 days vs 11 team average. Your fastest closes all had demo booked in the first call. Every extra week in early stages correlates with -3% close rate.\n→ **Action:** End every discovery call with a demo date on the calendar. Even if it's 2 weeks out, it creates commitment.\n\n**3. Upgrade email quality (Impact: +2% win rate)**\nYour 24% reply rate vs 31% team avg means lost touchpoints. Your ROI-lead emails hit 38% — use that template for everything. Kill generic \"checking in\" emails (12% reply).\n→ **Action:** Lead every email with a specific data point or insight. I can rewrite your pending follow-ups.\n\n**Combined expected impact: +8-12% win rate** → takes you from 28% to ~36-40%, which at your deal volume means **$200K+ additional annual revenue.**",
    fallback: "Let me analyze that based on your current pipeline data.\n\nYou have **$2.8M in pipeline** across **18 open deals** with **2.3x coverage** on a $1.2M quota. You've closed **$680K (57%)** with 2 weeks remaining in Q1.\n\n**Key signals I'm watching:**\n• 3 deals closable this quarter totaling $453K\n• 4 deals single-threaded (biggest risk factor)\n• Deal velocity 8 days above team average\n• Email engagement below team benchmark\n\nWant me to go deeper on any of these? I can model scenarios, draft action plans, or give you specific coaching on any deal.",
  },
  rfp: {
    "Draft a security & compliance section for Summit Health": "**Section 4: Security & Compliance**\n\n**4.1 HIPAA Compliance**\nNerdio Manager for Enterprise is designed to support HIPAA-regulated healthcare environments. Our platform:\n- Operates within the customer's Azure tenant — no patient data transits Nerdio infrastructure\n- Supports BAA execution with Microsoft Azure\n- Enforces session-level encryption (TLS 1.2+) and disk encryption (AES-256)\n- Provides audit logging for all administrative actions\n- Supports conditional access policies aligned with HIPAA technical safeguards\n\n**4.2 SOC 2 Type II Certification**\nNerdio has achieved SOC 2 Type II certification covering:\n- Security, Availability, and Confidentiality trust principles\n- Annual third-party audit by [Auditor Name]\n- Most recent report period: January — December 2025\n\n**4.3 Data Residency & Isolation**\n- All compute and data remain in Summit Health's Azure tenant\n- Nerdio's control plane communicates via secure API — no data storage\n- Role-based access control (RBAC) with Azure AD integration\n- Multi-factor authentication enforced for all admin access\n\n**4.4 Incident Response**\n- 24/7 security monitoring with <1 hour response SLA\n- Quarterly penetration testing by independent third parties\n- Vulnerability disclosure program in place\n\n*This section is drafted based on Nerdio's standard compliance posture. Please review with your SE team for any Summit Health-specific requirements.*\n\n---\n**Ready to review?** I can adjust for specific RFP questions or add clinical workflow security details.",
    "Create an RFP response for the Apex Financial deal": "**RFP Response Draft — Apex Financial Group**\n**Virtual Desktop Infrastructure Solution**\n\n---\n\n**Executive Summary**\nNerdio Manager for Enterprise delivers a fully managed Azure Virtual Desktop (AVD) solution that reduces Apex Financial's desktop infrastructure costs by an estimated 40-60% while strengthening security posture and compliance readiness. Our platform automates provisioning, scaling, and management of virtual desktops within Apex's existing Azure tenant — eliminating the need for on-premises VDI infrastructure.\n\n**Key Differentiators for Apex Financial:**\n- **Financial services compliance:** SOC 2 Type II, supports SOX and PCI-DSS requirements\n- **Cost optimization:** Auto-scaling reduces Azure spend by 30-50% vs always-on VDI\n- **Zero data exposure:** All data stays in Apex's Azure tenant\n- **Rapid deployment:** 3,200 desktops migrated in ~60 days (based on comparable deployments)\n\n**Projected ROI — 3 Years:**\n| Metric | Current State | With Nerdio |\n|---|---|---|\n| Annual infra cost | $620K | $290K |\n| Admin hours/month | 180 hrs | 40 hrs |\n| Deployment time | 4-6 weeks | 2-4 hours |\n| Uptime SLA | 99.5% | 99.9% |\n\n**3-Year Savings: $420K+ projected**\n**Payback period: 8 months**\n\n*I've structured this for Robert Chen's CTO perspective. Want me to create a CFO-focused version for the economic buyer?*",
    fallback: "I'll help draft that RFP response. To generate the most effective content, let me know:\n\n1. **Which account/deal** is this for?\n2. **Specific sections** needed (executive summary, technical specs, compliance, pricing justification, etc.)\n3. **Key differentiators** to emphasize\n4. **Competitor** they're evaluating against\n\nI have context on all your open deals — I can pull relevant details automatically if you name the account.\n\nQuick options:\n• Generate a full RFP response template\n• Draft a specific section (security, ROI, technical architecture)\n• Create a competitive comparison table\n• Build a win theme document",
  },
  research: {
    "Research Apex Financial Group for my meeting": "**Account Briefing: Apex Financial Group**\n*Prepared for: Alex Navarro — Meeting prep*\n\n---\n\n**Company Overview**\n- **Industry:** Financial Services / Wealth Management\n- **Founded:** 2004 | HQ: Chicago, IL\n- **Employees:** ~2,200 | Revenue: Est. $340M (2025)\n- **IT footprint:** 3,200+ desktops across 14 offices\n\n**Key Stakeholders Identified**\n| Name | Title | Relevance |\n|---|---|---|\n| Robert Chen | CTO | Your champion — driving the AVD initiative |\n| Margaret Wu | CFO | Economic buyer — NOT yet engaged ⚠️ |\n| David Park | VP Infrastructure | Technical evaluator — likely involved in implementation |\n| Sarah Kim | CISO | Security sign-off required for financial services |\n\n**Strategic Context**\n- Apex is in the middle of a cloud-first transformation (announced Q3 2025)\n- Recently migrated core trading platform to Azure — signaling Azure commitment\n- Regulatory pressure: OCC published new guidelines on remote desktop security for financial firms\n- Current state: On-prem Citrix infrastructure nearing end-of-life (estimated $180K annual maintenance)\n\n**Competitive Intelligence**\n- No known active competitor evaluation for this deal\n- Apex previously evaluated VMware Horizon in 2024 — rejected on cost\n- Robert Chen attended a Nerdio webinar in November (strong inbound signal)\n\n**Conversation Starters**\n1. \"I saw Apex completed the Azure migration for your trading platform — how's that going?\"\n2. \"With the new OCC desktop security guidelines, has that changed your timeline?\"\n3. \"Your Citrix environment — are you seeing the maintenance cost increases other financial firms are reporting?\"\n\n**Risk Factors**\n- CFO not engaged — deal could stall at procurement\n- Financial services compliance requirements add 2-3 weeks to eval cycle\n- Q1 budget deadline creates urgency but also pressure to defer to Q2",
    "Build a stakeholder map for Summit Health": "**Stakeholder Map: Summit Health Network**\n*Deal: $168K — Technical Eval stage*\n\n---\n\n**Power/Influence Grid**\n\n```\n HIGH POWER\n ┌─────────────────────────────────────┐\n │                                     │\n │  [CIO - Unknown]      [CISO - Karen]│\n │  Decision maker ⚠️    Technical lead │\n │  NOT ENGAGED          ENGAGED ✅     │\n │                                     │\n │  [CFO - Unknown]                    │\n │  Budget authority ⚠️                │\n │  NOT ENGAGED                        │\n ├─────────────────────────────────────┤\n │                                     │\n │  [Clinical IT Lead]   [IT Admin Team]│\n │  End-user champion ⚠️ Day-to-day ✅  │\n │  NOT ENGAGED          POC users     │\n │                                     │\n LOW POWER                             │\n └─────────────────────────────────────┘\n  LOW INFLUENCE ──────── HIGH INFLUENCE\n```\n\n**Engagement Status**\n🔴 **Critical gaps:** CIO (decision maker) and Clinical IT Lead (champion)\n🟡 **Needs attention:** CFO for budget approval\n🟢 **Engaged:** CISO Karen Walsh, IT admin team running POC\n\n**Recommended Engagement Sequence:**\n1. **This week:** Ask Karen for CIO intro — frame as \"strategic alignment\" before POC readout\n2. **Next week:** Joint readout meeting with CIO + Karen — present POC results + business case\n3. **Week 3:** Clinical IT Lead demo — show end-user experience, build internal champion\n4. **Week 4:** CFO meeting — ROI presentation with CIO endorsement\n\n**Healthcare-Specific Dynamics:**\n- Clinical IT leads in healthcare often have outsized influence (they can block adoption)\n- CIOs at health networks typically delegate to CISO for security but retain final budget authority\n- HIPAA compliance is table stakes — lead with it, don't save it for objection handling\n\n**Risk if gaps not addressed:** POC completes but no one with budget authority has context → deal stalls 60+ days while you rebuild momentum. This is exactly what happened with Diana Morales at Pinnacle.",
    fallback: "I'll research that for you. What would be most helpful?\n\n**Account Research:**\n• Company overview & strategic context\n• Stakeholder mapping & org chart\n• Recent news & trigger events\n• Technology stack intelligence\n\n**Market Research:**\n• Industry trends affecting your deals\n• Competitive landscape analysis\n• Pricing & packaging benchmarks\n\n**Deal Prep:**\n• Pre-meeting briefing package\n• Discovery question framework\n• Objection handling prep\n\nName an account or topic and I'll pull together a comprehensive brief.",
  },
  email: {
    "Write a follow-up to Tom Reeves at Cascade": "**Subject: Cascade's MSP benchmark data + Q1 deadline**\n\nHi Tom,\n\nI know it's been a few weeks since our last conversation — things move fast in Q1.\n\nI wanted to share something I think you'll find valuable: we just published our MSP benchmark report for companies at Cascade's scale. The headline number: MSPs managing 5,000-10,000 desktops see an average of **$340K in annual savings** after deploying Nerdio — mostly from automated scaling and reduced admin overhead.\n\nI've attached the executive summary. The section on page 3 about reducing per-desktop management cost from $18 to $6 is particularly relevant given our earlier conversations about Cascade's operational efficiency goals.\n\nTwo things worth noting:\n1. Our Q1 pricing promotion (15% off first-year licensing) expires **March 31**\n2. I can have a custom TCO analysis ready for your team in 48 hours\n\nWould you have 20 minutes this week to reconnect? I can walk you through the benchmark data and how it maps to Cascade's environment.\n\nBest,\nAlex\n\n---\n\n**Strategy notes:**\n- Lead with value (benchmark data), not \"checking in\"\n- Create urgency with Q1 deadline without being pushy\n- Offer something tangible (custom TCO) as reason to re-engage\n- Short — Tom hasn't responded in 21 days, respect his time\n\n**Recommended send time:** Tuesday 8:30 AM (Tom's timezone)\n**Follow-up if no response:** Thursday, different channel (LinkedIn)",
    "Draft a meeting recap for the Karen Walsh POC review": "**Subject: Summit Health POC Mid-Review — Recap & Next Steps**\n\nHi Karen,\n\nThank you for the productive mid-POC review today. Here's a summary of what we covered and the agreed next steps.\n\n---\n\n**POC Results (Week 2 of 4)**\n\n| Metric | Target | Actual |\n|---|---|---|\n| Desktops migrated | 200 | 200 ✅ |\n| Uptime | 99.5% | 99.8% ✅ |\n| Security incidents | 0 | 0 ✅ |\n| Cost vs on-prem (projected) | -30% | -45% ✅ |\n| User satisfaction | 4.0/5 | 4.3/5 ✅ |\n\n**Key Discussion Points:**\n- Your team confirmed the management console is \"significantly more intuitive\" than current tooling\n- HIPAA compliance documentation reviewed — no gaps identified\n- SOC 2 Type II report shared and accepted by your security team\n- Question raised about DR/failover for clinical workstations — our SE team will provide architecture doc by Friday\n\n**Agreed Next Steps:**\n| Action | Owner | Due |\n|---|---|---|\n| DR/failover architecture doc | Nerdio SE team | March 22 |\n| Phase 2 POC scope (clinical desktops) | Karen's team | March 25 |\n| CIO strategic alignment meeting | Alex to schedule | March 26 |\n| Full POC readout presentation | Joint | April 1 |\n\n**Open Items:**\n- Clinical IT lead involvement for end-user workflow testing (Karen to identify)\n- Budget discussion timeline (Karen to confirm with CIO)\n\nPlease let me know if I've missed anything or if any items need correction. Looking forward to the next phase.\n\nBest,\nAlex\n\n---\n*Copy this to your CRM notes? I've formatted it for both email send and internal logging.*",
    "Create a re-engagement sequence for Priya Patel": "**Re-engagement Sequence: Priya Patel — Horizon Services Group**\n*$76K deal — Ghosting since demo (4 unreturned follow-ups)*\n\n---\n\n**Email 1: Value-first breakup (Send: Monday)**\nSubject: One last thing before I close this out\n\nHi Priya,\n\nI know things have been busy at Horizon — especially if there are organizational changes happening. I don't want to keep filling your inbox, so this will be my last outreach for now.\n\nBefore I close this out, I wanted to leave you with one data point: we helped a services company of similar size (50-person team, 3,000+ desktops) save **$180K in their first year** with Nerdio. Most of that came from eliminating manual provisioning — their team went from 15 hours per client setup to under 1 hour.\n\nIf and when the timing is right, I'd love to pick this conversation back up. No pressure at all.\n\nBest,\nAlex\n\n---\n\n**Email 2: Trigger-based follow-up (Send: 3 weeks later, IF no response)**\nSubject: Thought of Horizon when I saw this\n\nHi Priya,\n\nI came across [relevant industry article/case study] and thought of our earlier conversation about Horizon's desktop management challenges. [Specific insight from the article].\n\nWorth a quick chat if this is back on the radar?\n\nAlex\n\n---\n\n**Email 3: New angle via different stakeholder (Send: 5 weeks later, IF no response)**\nSubject: Quick question about Horizon's cloud strategy\n\nHi [Priya's colleague — research needed],\n\nI've been working with Priya on a desktop virtualization initiative at Horizon. I understand the team may be re-evaluating priorities, and I wanted to make sure the evaluation materials we prepared are getting to the right people.\n\nWould you be the right person to discuss Horizon's cloud desktop plans going forward?\n\nAlex\n\n---\n\n**Sequence Strategy:**\n- Email 1 breaks the pattern (no ask, just give value)\n- Email 2 waits for a trigger event to justify re-engagement\n- Email 3 goes around — if Priya is truly gone (reorg), find the new owner\n- Total sequence: 5 weeks. If all 3 fail → mark as Closed Lost, revisit Q3.",
    fallback: "I'll draft that for you. What type of email do you need?\n\n**Follow-up emails:**\n• Post-meeting follow-up with action items\n• Proposal follow-up (no response)\n• Check-in after demo/POC\n• Re-engagement after going dark\n\n**Meeting recaps:**\n• Discovery call summary\n• POC review recap\n• Executive meeting notes\n• Demo follow-up with key takeaways\n\n**Outreach sequences:**\n• Multi-touch prospecting sequence\n• Re-engagement campaign\n• Multi-thread intro emails\n• Internal deal update for leadership\n\nName the account and context, and I'll draft something ready to review and send.",
  },
};

// ─── CHAT RESPONSES (Deal board) ────────────────────────────────────────────

const CHAT_RESPONSES = {
  pipeline: "Here's your pipeline breakdown:\n\n**By Stage:**\n• Negotiation: $297K (Sandra $112K + Robert $185K) — highest probability\n• Proposal: $276K (Michelle $142K + Ahmed $134K)\n• Technical Eval: $168K (Karen $168K — POC in progress)\n• Discovery: $220K (Daniel $220K — Citrix displacement)\n• Demo: $96K (Jason $96K — Thursday)\n• Qualification: $78K (Lisa $78K — early stage)\n\n**Pipeline health:**\n• Total: $2.8M, Coverage: 2.3x (need 3x for comfort)\n• Weighted pipeline: $920K (commit forecast)\n• 3 deals closable in Q1: $453K (Sandra, Robert, Tom)\n• Gap to quota: $520K — needs 2-3 of the Q1 deals to land\n\n**Action:** Lock Sandra's PO this week ($112K), finalize Robert's contract ($185K), and re-engage Tom Reeves ($156K).",
  risk: "Your 6 at-risk deals ranked by save potential:\n\n1. **Tom Reeves** (Cascade Digital) — $156K, stalled 21 days. Was in negotiation. **Best save bet** — send the benchmark report and use Q1 pricing deadline (3/31) as urgency.\n2. **Rebecca Frost** (Alpine Tech) — $198K, evaluating VMware. Only 1 stakeholder. **Biggest deal at risk.** Need TCO comparison and multi-thread ASAP.\n3. **Kevin Andersen** (BluePeak) — $88K, procurement stuck. Tech team loves it. **Create CFO one-pager** to unstick procurement.\n4. **Diana Morales** (Pinnacle Cloud) — $144K, POC done but no next steps. **Decision maker not engaged.** Request intro to VP.\n5. **Eric Johansson** (DataStream) — $110K, budget frozen. **Offer deferred billing** to keep momentum.\n6. **Priya Patel** (Horizon) — $76K, ghosting. **Likely lost** — send a no-pressure breakup email.\n\n**Total at-risk ARR: $772K.** Focus saves on Tom, Rebecca, and Kevin — combined $442K with the clearest paths forward.",
  stakeholders: "**Multi-threading status across your pipeline:**\n\n| Deal | Contacts | Gap |\n|---|---|---|\n| Apex Financial ($185K) | CTO only | **Need CFO** — economic buyer |\n| Summit Health ($168K) | CISO only | **Need CIO + clinical IT lead** |\n| Meridian Cloud ($220K) | CEO only | **Need solutions architect** |\n| NorthPoint ($134K) | VP Eng only | **Need CFO + CISO** |\n| CloudBridge ($96K) | Head of Sales | **Need CEO/founder** |\n| Pacific ($78K) | COO only | **Need technical lead** |\n\n**4 of 8 active deals are single-threaded.** Your win rate drops from 38% to 14% when only 1 contact is engaged.\n\n**Priority intros this week:**\n1. Apex CFO — $185K deal in negotiation, needs sign-off\n2. Summit CIO — $168K, POC ending, decision maker missing\n3. NorthPoint CFO + CISO — committee forming, get ahead of it",
  coaching: "**Your performance insights vs top AEs:**\n\n**Where you're strong:**\n• Deal size: $85K avg vs $72K team avg — you sell bigger\n• Technical eval conversion: 68% vs 55% avg — POCs go well\n• Citrix displacement win rate: 65% — strong competitive muscle\n\n**Where to improve:**\n• **Deal velocity:** 62 days vs 54 avg. Gap is in Discovery→Demo (18 vs 11 days). Book demos in the first call.\n• **Multi-threading:** 50% of deals are single-threaded vs 25% for top performers. Each new contact adds ~12% to win probability.\n• **Email reply rate:** 24% vs 31% avg. Lead with ROI data instead of generic check-ins. Your ROI emails hit 38%.\n• **Discovery depth:** 8 questions avg vs 12 for top performers. Focus on budget, decision process, and paper process.\n\n**If you fix discovery speed + multi-threading, your forecast model shows an extra $180K-$240K per quarter.** Start with this week: book CloudBridge demo during Thursday's call, and get 2 stakeholder intros on Apex and Summit.",
  forecast: "**Q1 Forecast — 2 weeks remaining:**\n\n**Closed: $680K** (57% of $1.2M quota)\n**Gap: $520K**\n\n**Commit deals (80%+ probability):**\n• Sandra Liu — $112K, verbal commit, PO pending → **This week**\n• Robert Chen — $185K, contract redline → **Close by 3/28**\nSubtotal: $297K\n\n**Best case (50%+ with action):**\n• Tom Reeves — $156K, re-engage with benchmark + Q1 deadline\n• Michelle Park — $142K, follow up on proposal + ROI model\nSubtotal: $298K\n\n**If commit lands:** $680K + $297K = **$977K (81% of quota)**\n**If best case lands:** $680K + $595K = **$1.275M (106% of quota)**\n\nThe difference between 81% and 106% comes down to re-engaging Tom and closing Michelle this month. Both are doable with focused effort this week.",
  fallback: "Based on your current pipeline:\n\nYou have **$2.8M in pipeline** with **2.3x coverage** on a **$1.2M quota**. You've closed **$680K** (57%) with 2 weeks left.\n\n**Priorities this week:**\n1. Lock Sandra Liu's PO ($112K) — verbal commit, needs push\n2. Finalize Robert Chen's contract ($185K) — legal redline pending\n3. Re-engage Tom Reeves ($156K) — stalled 21 days, Q1 deadline play\n4. Multi-thread Apex and Summit — both need executive engagement\n5. Prep CloudBridge demo for Thursday\n\nWant me to dig into your forecast, deal risks, stakeholder gaps, or coaching insights?"
};

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function MiniLine({ data, maxH = 55, color = "#1D9E75", label }) {
  const vals = data.map(d => d.v !== undefined ? d.v : d.value);
  const mx = Math.max(...vals);
  const mn = Math.min(...vals);
  const range = mx - mn || 1;
  const pts = vals.map((v, i) => ({ x: (i / (vals.length - 1)) * 100, y: maxH - ((v - mn) / range) * (maxH - 16) - 8 }));
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const area = path + ` L100,${maxH} L0,${maxH} Z`;
  const gradId = `ag-${label || Math.random()}`;
  return (
    <svg viewBox={`0 0 100 ${maxH}`} style={{ width: "100%", height: maxH, marginTop: 8 }} preserveAspectRatio="none">
      <defs><linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.2" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs>
      <path d={area} fill={`url(#${gradId})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" />
      <circle cx={pts[pts.length-1].x} cy={pts[pts.length-1].y} r="2.5" fill={color} />
    </svg>
  );
}

function DealBadge({ probability }) {
  if (probability === 0) return null;
  const c = probability >= 70 ? { bg: "#E1F5EE", color: "#0F6E56" } : probability >= 40 ? { bg: "#FAEEDA", color: "#854F0B" } : { bg: "#FCEBEB", color: "#A32D2D" };
  return <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 5, background: c.bg, color: c.color, fontWeight: 600, whiteSpace: "nowrap" }}>{probability}%</span>;
}

function PriorityDot({ priority }) {
  const c = { critical: "#E24B4A", high: "#EF9F27", medium: "#85B7EB", low: "#B4B2A9" };
  return <span style={{ width: 6, height: 6, borderRadius: "50%", background: c[priority] || c.low, display: "inline-block", flexShrink: 0 }} />;
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

function BenchmarkBar({ label, you, team, topPerformer, industry, unit, inverted }) {
  const max = Math.max(you, team, topPerformer, industry) * 1.15;
  const barW = (v) => `${(v / max) * 100}%`;
  const isGood = inverted ? you <= team : you >= team;
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 12, color: isGood ? "#0F6E56" : "#A32D2D", fontWeight: 600 }}>{you}{unit}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {[
          { label: "You", value: you, color: isGood ? "#1D9E75" : "#E24B4A" },
          { label: "Team avg", value: team, color: "#85B7EB" },
          { label: "Top performer", value: topPerformer, color: "#EF9F27" },
          { label: "Industry", value: industry, color: "#B4B2A9" },
        ].map((b, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 9, color: "#888", width: 70, textAlign: "right", flexShrink: 0 }}>{b.label}</span>
            <div style={{ flex: 1, height: 8, background: "#f0efe9", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", background: b.color, borderRadius: 4, width: barW(b.value), transition: "width 0.5s ease" }} />
            </div>
            <span style={{ fontSize: 9, color: "#888", width: 40, flexShrink: 0 }}>{b.value}{unit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function AECockpit() {
  // ── Persisted state via localStorage
  const load = (key, def) => { try { const v = localStorage.getItem(`ae-cockpit-${key}`); return v ? JSON.parse(v) : def; } catch { return def; } };
  const [activeTab, setActiveTab] = useState(load("activeTab", "Pipeline management"));
  const [editingId, setEditingId] = useState(null);
  const [editedMessages, setEditedMessages] = useState(load("editedMessages", {}));
  const [sentIds, setSentIds] = useState(new Set(load("sentIds", [])));
  const [skippedIds, setSkippedIds] = useState(new Set(load("skippedIds", [])));
  const [chatInput, setChatInput] = useState("");
  const [chatMsgs, setChatMsgs] = useState(load("chatMsgs", [
    { from: "claude", text: "Morning, Alex. You're at **$680K closed** with **$520K to go** and 2 weeks left in Q1." },
    { from: "claude", text: "Your best path to quota: **Sandra Liu** ($112K) has a verbal commit — chase the PO. **Robert Chen** ($185K) is in contract redline. Land both and you're at **$977K (81%)**. Re-engage **Tom Reeves** ($156K) and you could hit **106%**." },
    { from: "claude", text: "**Watch out:** 4 deals are single-threaded, and your deal velocity is 8 days slower than team avg. I've got specific coaching on both — check the Coaching tab or ask me." },
  ]));
  const [chatLoading, setChatLoading] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [view, setView] = useState(load("view", "queue"));
  const [activeAgent, setActiveAgent] = useState(null);
  const [agentChatMsgs, setAgentChatMsgs] = useState(load("agentChatMsgs", {}));
  const [agentInput, setAgentInput] = useState("");
  const [agentLoading, setAgentLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [benchmarkFilter, setBenchmarkFilter] = useState("all");
  const chatEndRef = useRef(null);
  const agentChatEndRef = useRef(null);
  const searchRef = useRef(null);

  // ── Persist to localStorage
  useEffect(() => { localStorage.setItem("ae-cockpit-activeTab", JSON.stringify(activeTab)); }, [activeTab]);
  useEffect(() => { localStorage.setItem("ae-cockpit-editedMessages", JSON.stringify(editedMessages)); }, [editedMessages]);
  useEffect(() => { localStorage.setItem("ae-cockpit-sentIds", JSON.stringify([...sentIds])); }, [sentIds]);
  useEffect(() => { localStorage.setItem("ae-cockpit-skippedIds", JSON.stringify([...skippedIds])); }, [skippedIds]);
  useEffect(() => { localStorage.setItem("ae-cockpit-chatMsgs", JSON.stringify(chatMsgs)); }, [chatMsgs]);
  useEffect(() => { localStorage.setItem("ae-cockpit-view", JSON.stringify(view)); }, [view]);
  useEffect(() => { localStorage.setItem("ae-cockpit-agentChatMsgs", JSON.stringify(agentChatMsgs)); }, [agentChatMsgs]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMsgs, chatLoading]);
  useEffect(() => { agentChatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [agentChatMsgs, agentLoading]);

  // ── Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.metaKey && e.key === "k") { e.preventDefault(); setSearchOpen(o => !o); setTimeout(() => searchRef.current?.focus(), 50); }
      if (e.key === "Escape") { setSearchOpen(false); setSearchQuery(""); setActiveAgent(null); }
      if (e.metaKey && e.key === "1") { e.preventDefault(); setView("queue"); }
      if (e.metaKey && e.key === "2") { e.preventDefault(); setView("benchmarks"); }
      if (e.metaKey && e.key === "3") { e.preventDefault(); setView("agents"); }
      if (e.metaKey && e.key === "4") { e.preventDefault(); setView("analytics"); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const showToast = (message, type = "success") => setToast({ message, type });

  const pctQuota = Math.round((REP.closed / REP.quota) * 1000) / 10;
  const gap = REP.quota - REP.closed;
  const allDeals = Object.values(ALL_DEALS).flat();

  // ── Search filter
  const searchResults = searchQuery.trim() ? allDeals.filter(d => {
    const q = searchQuery.toLowerCase();
    return (d.name && d.name.toLowerCase().includes(q)) || (d.company && d.company.toLowerCase().includes(q)) || (d.stage && d.stage.toLowerCase().includes(q)) || d.signals.some(s => s.label.toLowerCase().includes(q));
  }) : [];

  const deals = (ALL_DEALS[activeTab] || []).filter(d => showCompleted || (!sentIds.has(d.id) && !skippedIds.has(d.id)));
  const tabCounts = {};
  TABS.forEach(t => { tabCounts[t] = (ALL_DEALS[t] || []).filter(d => !sentIds.has(d.id) && !skippedIds.has(d.id)).length; });
  const totalActions = Object.values(tabCounts).reduce((a, b) => a + b, 0);
  const completedToday = sentIds.size + skippedIds.size;

  const handleSend = (id) => { setSentIds(prev => new Set([...prev, id])); setEditingId(null); setSelectedDeal(null); showToast("Email sent successfully"); };
  const handleSkip = (id) => { setSkippedIds(prev => new Set([...prev, id])); setSelectedDeal(null); showToast("Action skipped", "info"); };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text.replace(/\*\*/g, "").replace(/\n/g, "\n"));
    showToast("Copied to clipboard");
  };

  const handleChat = useCallback((text) => {
    const q = text || chatInput;
    if (!q.trim()) return;
    setChatMsgs(prev => [...prev, { from: "user", text: q }]);
    setChatInput("");
    setChatLoading(true);
    setTimeout(() => {
      const ql = q.toLowerCase();
      let reply = CHAT_RESPONSES.fallback;
      if (ql.includes("pipeline") || ql.includes("stage") || ql.includes("coverage")) reply = CHAT_RESPONSES.pipeline;
      else if (ql.includes("risk") || ql.includes("stall") || ql.includes("slip") || ql.includes("stuck")) reply = CHAT_RESPONSES.risk;
      else if (ql.includes("stakeholder") || ql.includes("thread") || ql.includes("contact") || ql.includes("champion")) reply = CHAT_RESPONSES.stakeholders;
      else if (ql.includes("coach") || ql.includes("improve") || ql.includes("advice") || ql.includes("tip") || ql.includes("better")) reply = CHAT_RESPONSES.coaching;
      else if (ql.includes("forecast") || ql.includes("quota") || ql.includes("commit") || ql.includes("close") || ql.includes("q1")) reply = CHAT_RESPONSES.forecast;
      else {
        const mentionedDeal = allDeals.find(d => d.name && (ql.includes(d.name.split(" ")[0].toLowerCase()) || ql.includes(d.company.toLowerCase())));
        if (mentionedDeal) reply = `**${mentionedDeal.name} — ${mentionedDeal.company}**\n\nRole: ${mentionedDeal.role}\nStage: ${mentionedDeal.stage}\nAmount: ${mentionedDeal.amount}\nClose date: ${mentionedDeal.closeDate}\nProbability: ${mentionedDeal.probability}%\nSignals: ${mentionedDeal.signals.map(s => s.label).join(", ")}\n\nRecommended action: ${mentionedDeal.probability >= 70 ? "This deal is close — focus on removing final blockers and getting the PO." : mentionedDeal.probability >= 40 ? "Good momentum but needs acceleration. Multi-thread and compress timeline." : "This deal needs intervention. Re-engage with new value or qualify out."}`;
      }
      setChatMsgs(prev => [...prev, { from: "claude", text: reply }]);
      setChatLoading(false);
    }, 800 + Math.random() * 600);
  }, [chatInput, allDeals]);

  // ── Agent chat handler
  const handleAgentChat = useCallback((text) => {
    const q = text || agentInput;
    if (!q.trim() || !activeAgent) return;
    const agentId = activeAgent.id;
    setAgentChatMsgs(prev => ({ ...prev, [agentId]: [...(prev[agentId] || []), { from: "user", text: q }] }));
    setAgentInput("");
    setAgentLoading(true);
    setTimeout(() => {
      const responses = AGENT_RESPONSES[agentId] || {};
      let reply = responses[q] || responses.fallback || "I'll research that and get back to you with specific recommendations based on your pipeline data.";
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

  const sl = selectedDeal ? allDeals.find(d => d.id === selectedDeal) : null;
  const slMsg = sl ? (editedMessages[sl.id] || sl.message) : "";

  // ── Styles
  const navBtn = (v, label) => (
    <button key={v} onClick={() => { setView(v); setActiveAgent(null); }} style={{ fontSize: 13, padding: "6px 16px", borderRadius: 6, background: view === v ? "#f0efe9" : "transparent", color: view === v ? "#1a1a1a" : "#888", border: "none", cursor: "pointer", fontWeight: view === v ? 500 : 400 }}>
      {label}
    </button>
  );

  return (
    <div style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif", background: "#FAFAF8", minHeight: "100vh" }}>
      <style>{`
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes pulse { 0%,100% { opacity:0.3 } 50% { opacity:1 } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Search overlay */}
      {searchOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 9998, display: "flex", justifyContent: "center", paddingTop: 120 }} onClick={() => { setSearchOpen(false); setSearchQuery(""); }}>
          <div style={{ width: 560, background: "#fff", borderRadius: 14, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", overflow: "hidden", maxHeight: 480, animation: "fadeIn 0.15s ease" }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #eee", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ color: "#888", fontSize: 16 }}>&#x1F50D;</span>
              <input ref={searchRef} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search deals, contacts, companies..." autoFocus style={{ flex: 1, fontSize: 15, border: "none", outline: "none", background: "transparent" }} />
              <kbd style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "#f0efe9", color: "#888", border: "1px solid #ddd" }}>ESC</kbd>
            </div>
            <div style={{ maxHeight: 380, overflowY: "auto", padding: "8px 0" }}>
              {searchQuery.trim() && searchResults.length === 0 && <p style={{ padding: "20px", textAlign: "center", color: "#888", fontSize: 13 }}>No results found</p>}
              {searchResults.map(d => (
                <div key={d.id} onClick={() => { setSelectedDeal(d.id); setSearchOpen(false); setSearchQuery(""); setView("queue"); const tab = TABS.find(t => ALL_DEALS[t]?.some(deal => deal.id === d.id)); if (tab) setActiveTab(tab); }} style={{ padding: "10px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #f5f5f2" }} onMouseOver={e => e.currentTarget.style.background = "#f7f6f3"} onMouseOut={e => e.currentTarget.style.background = "transparent"}>
                  <PriorityDot priority={d.priority} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 500, fontSize: 13 }}>{d.name || d.stage}</span>
                    {d.company && <span style={{ fontSize: 11, color: "#888", marginLeft: 8 }}>{d.company} · {d.amount}</span>}
                  </div>
                  {d.probability > 0 && <DealBadge probability={d.probability} />}
                </div>
              ))}
              {!searchQuery.trim() && (
                <div style={{ padding: "12px 20px" }}>
                  <p style={{ fontSize: 11, color: "#888", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Quick actions</p>
                  {["Pipeline management", "Deal risk", "Benchmarks", "Agents"].map(item => (
                    <div key={item} onClick={() => { setSearchOpen(false); setSearchQuery(""); if (item === "Benchmarks") setView("benchmarks"); else if (item === "Agents") setView("agents"); else { setView("queue"); setActiveTab(item); } }} style={{ padding: "8px 12px", cursor: "pointer", borderRadius: 6, fontSize: 13 }} onMouseOver={e => e.currentTarget.style.background = "#f7f6f3"} onMouseOut={e => e.currentTarget.style.background = "transparent"}>
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Top nav */}
      <div style={{ background: "#fff", borderBottom: "1px solid #eee", padding: "0 24px", display: "flex", alignItems: "center", height: 52 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 32 }}>
          <svg width="20" height="20" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#0078D4"/><text x="4" y="17" fontSize="13" fontWeight="700" fill="#fff">N</text></svg>
          <span style={{ fontWeight: 600, fontSize: 15, letterSpacing: -0.3 }}>Nerdio</span>
          <span style={{ fontSize: 12, color: "#888", marginLeft: 4 }}>AE Cockpit</span>
        </div>
        <div style={{ display: "flex", gap: 2 }}>
          {navBtn("queue", "Deal board")}
          {navBtn("benchmarks", "Benchmarks")}
          {navBtn("agents", "Agents")}
          {navBtn("analytics", "Analytics")}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => { setSearchOpen(true); setTimeout(() => searchRef.current?.focus(), 50); }} style={{ fontSize: 12, padding: "5px 12px", borderRadius: 6, background: "#f7f6f3", color: "#888", border: "1px solid #e0e0e0", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            Search <kbd style={{ fontSize: 9, padding: "1px 4px", borderRadius: 3, background: "#e8e7e3", border: "1px solid #ddd" }}>&#8984;K</kbd>
          </button>
          <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "#E1F5EE", color: "#0F6E56", fontWeight: 500 }}>{totalActions} actions</span>
          <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "#FCEBEB", color: "#A32D2D", fontWeight: 500 }}>{REP.dealsAtRisk} at risk</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#E6F1FB", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 11, color: "#185FA5" }}>AN</div>
            <span style={{ fontSize: 13, fontWeight: 500 }}>Alex Navarro</span>
          </div>
        </div>
      </div>

      <div style={{ padding: "16px 24px", display: "flex", gap: 16 }}>
        {/* Left column */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Metrics strip */}
          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr 1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
            {[
              { label: "Quota attainment", main: `$${(REP.closed / 1000).toFixed(0)}K`, sub: `${pctQuota}% of $${(REP.quota/1000).toFixed(0)}K`, badge: `$${(gap / 1000).toFixed(0)}K gap`, badgeColor: "#BA7517", progress: pctQuota, wide: true },
              { label: "Pipeline", main: `$${(REP.pipeline / 1000000).toFixed(1)}M`, sub: `${REP.coverage}x coverage`, subColor: REP.coverage >= 3 ? "#0F6E56" : "#BA7517" },
              { label: "Win rate", main: `${REP.winRate}%`, sub: "team avg 26%" },
              { label: "Avg deal size", main: `$${(REP.avgDealSize / 1000).toFixed(0)}K`, sub: "+$13K vs team", subColor: "#0F6E56" },
              { label: "Avg cycle", main: `${REP.avgCycle}d`, sub: "+8d vs team", subColor: "#A32D2D" },
              { label: "Forecast", main: `$${(REP.forecastCommit / 1000).toFixed(0)}K`, sub: "commit" },
            ].map((m, i) => (
              <div key={i} onClick={() => { if (m.label === "Win rate" || m.label === "Avg deal size" || m.label === "Avg cycle" || m.label === "Pipeline") { setView("benchmarks"); } }} style={{ background: "#fff", borderRadius: 10, padding: "14px 16px", border: "1px solid #eee", cursor: ["Win rate", "Avg deal size", "Avg cycle", "Pipeline"].includes(m.label) ? "pointer" : "default", transition: "border-color 0.15s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div>
                    <p style={{ fontSize: 11, color: "#888", margin: 0, textTransform: "uppercase", letterSpacing: 0.5 }}>{m.label}</p>
                    <p style={{ fontSize: 26, fontWeight: 600, margin: "4px 0 0", letterSpacing: -0.5 }}>{m.main}</p>
                  </div>
                  {m.badge && <span style={{ fontSize: 11, color: m.badgeColor, fontWeight: 500 }}>{m.badge}</span>}
                </div>
                {m.progress !== undefined && (
                  <>
                    <div style={{ height: 4, borderRadius: 2, background: "#f0efe9", marginTop: 10, overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 2, background: pctQuota >= 80 ? "#1D9E75" : "#EF9F27", width: `${m.progress}%` }} />
                    </div>
                    <p style={{ fontSize: 10, color: "#888", margin: "4px 0 0", textAlign: "right" }}>{m.sub}</p>
                  </>
                )}
                {m.progress === undefined && <p style={{ fontSize: 11, color: m.subColor || "#888", margin: "6px 0 0" }}>{m.sub}</p>}
              </div>
            ))}
          </div>

          {/* ═══ BENCHMARKS VIEW ═══ */}
          {view === "benchmarks" && (
            <div style={{ animation: "fadeIn 0.2s ease" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0, letterSpacing: -0.3 }}>Benchmark Analytics</h2>
                  <p style={{ fontSize: 12, color: "#888", margin: "2px 0 0" }}>Your performance vs team, top performers, and industry</p>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  {["all", "strengths", "gaps"].map(f => (
                    <button key={f} onClick={() => setBenchmarkFilter(f)} style={{ fontSize: 11, padding: "4px 12px", borderRadius: 5, background: benchmarkFilter === f ? "#1a1a1a" : "#fff", color: benchmarkFilter === f ? "#fff" : "#666", border: benchmarkFilter === f ? "none" : "1px solid #e0e0e0", cursor: "pointer", textTransform: "capitalize" }}>{f}</button>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {/* Benchmark bars */}
                <div style={{ background: "#fff", borderRadius: 10, padding: 20, border: "1px solid #eee" }}>
                  <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 4px" }}>Performance Benchmarks</p>
                  <p style={{ fontSize: 11, color: "#888", margin: "0 0 16px" }}>You vs team, top performers, and industry averages</p>
                  {BENCHMARKS.categories
                    .filter(b => {
                      if (benchmarkFilter === "all") return true;
                      const isGood = b.inverted ? b.you <= b.team : b.you >= b.team;
                      return benchmarkFilter === "strengths" ? isGood : !isGood;
                    })
                    .map((b, i) => <BenchmarkBar key={i} {...b} />)}
                </div>

                {/* Trend charts */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {[
                    { title: "Win Rate Trend", data: BENCHMARKS.trends.winRate, color: "#1D9E75", current: "28%", target: "35%+" },
                    { title: "Avg Deal Size Trend", data: BENCHMARKS.trends.dealSize, color: "#185FA5", current: "$85K", target: "$95K" },
                    { title: "Deal Cycle Trend", data: BENCHMARKS.trends.cycle, color: "#EF9F27", current: "62d", target: "54d" },
                    { title: "Pipeline Coverage Trend", data: BENCHMARKS.trends.pipeline, color: "#534AB7", current: "2.3x", target: "3.0x" },
                  ].map((t, i) => (
                    <div key={i} style={{ background: "#fff", borderRadius: 10, padding: "14px 16px", border: "1px solid #eee" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <p style={{ fontSize: 12, fontWeight: 500, margin: 0 }}>{t.title}</p>
                          <span style={{ fontSize: 10, color: "#888" }}>6-month trend</span>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ fontSize: 16, fontWeight: 600 }}>{t.current}</span>
                          <span style={{ fontSize: 10, color: "#888", display: "block" }}>target: {t.target}</span>
                        </div>
                      </div>
                      <MiniLine data={t.data} maxH={50} color={t.color} label={t.title} />
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                        {t.data.map((d, j) => <span key={j} style={{ fontSize: 8, color: "#888" }}>{d.m}</span>)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quarter over quarter */}
                <div style={{ background: "#fff", borderRadius: 10, padding: 20, border: "1px solid #eee" }}>
                  <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 4px" }}>Quarter over Quarter</p>
                  <p style={{ fontSize: 11, color: "#888", margin: "0 0 14px" }}>Progression across recent quarters</p>
                  {BENCHMARKS.quarterComps.map((q, i) => (
                    <div key={i} style={{ padding: "10px 0", borderBottom: i < 2 ? "1px solid #f5f5f2" : "none" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{q.q}</span>
                        <span style={{ fontSize: 12, color: "#0F6E56", fontWeight: 500 }}>{Math.round(q.closed / q.quota * 100)}% attainment</span>
                      </div>
                      <div style={{ display: "flex", gap: 16, fontSize: 11, color: "#888" }}>
                        <span>Closed: ${(q.closed/1000).toFixed(0)}K / ${(q.quota/1000).toFixed(0)}K</span>
                        <span>Win rate: {q.win}%</span>
                        <span>Deals: {q.deals}</span>
                      </div>
                      <div style={{ height: 4, background: "#f0efe9", borderRadius: 2, marginTop: 8, overflow: "hidden" }}>
                        <div style={{ height: "100%", borderRadius: 2, background: q.closed / q.quota >= 0.8 ? "#1D9E75" : "#EF9F27", width: `${Math.min(q.closed / q.quota * 100, 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* AI Benchmark Insights */}
                <div style={{ background: "#FFFBF5", borderRadius: 10, padding: 20, border: "1px solid #F0E6D6" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#D4A574", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#fff"/></svg>
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>Claude Benchmark Insights</p>
                      <p style={{ fontSize: 11, color: "#9C4D1A", margin: 0 }}>AI-powered performance analysis</p>
                    </div>
                  </div>
                  {[
                    { title: "Biggest leverage point", text: "Multi-threading. Your single-threaded deals close at 14% vs 38% for multi-threaded. Moving 2 deals from single to multi-threaded could add $80K+ to Q1.", color: "#E24B4A" },
                    { title: "Strongest trend", text: "Deal size is climbing — $68K in Oct to $85K in Mar (+25%). Your large-deal skill is a differentiator. Lean into enterprise accounts.", color: "#1D9E75" },
                    { title: "Quick win available", text: "Your ROI-lead emails get 38% reply rate (team best). If you switch all your follow-ups to ROI-lead format, that's an estimated +7% overall reply rate.", color: "#EF9F27" },
                    { title: "Improvement trajectory", text: "At current trajectory, you'll hit 32% win rate by Q2 and 35% by Q3. Compressing discovery→demo by 4 days could accelerate that to Q2.", color: "#185FA5" },
                  ].map((insight, i) => (
                    <div key={i} style={{ padding: "10px 0", borderBottom: i < 3 ? "1px solid #F0E6D6" : "none" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: insight.color, display: "inline-block" }} />
                        <span style={{ fontSize: 12, fontWeight: 600 }}>{insight.title}</span>
                      </div>
                      <p style={{ fontSize: 12, color: "#555", margin: 0, lineHeight: 1.5 }}>{insight.text}</p>
                    </div>
                  ))}
                  <button onClick={() => { setView("agents"); setActiveAgent(AGENTS[0]); }} style={{ marginTop: 12, fontSize: 12, padding: "8px 16px", borderRadius: 6, background: "#D4A574", color: "#fff", border: "none", cursor: "pointer", fontWeight: 500, width: "100%" }}>
                    Open AE Insight Copilot for deeper analysis
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ═══ AGENTS VIEW ═══ */}
          {view === "agents" && !activeAgent && (
            <div style={{ animation: "fadeIn 0.2s ease" }}>
              <div style={{ marginBottom: 14 }}>
                <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0, letterSpacing: -0.3 }}>Agent Hub</h2>
                <p style={{ fontSize: 12, color: "#888", margin: "2px 0 0" }}>Claude-powered agents for every stage of your workflow</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {AGENTS.map(agent => (
                  <div key={agent.id} onClick={() => setActiveAgent(agent)} style={{ background: agent.bgColor, borderRadius: 12, padding: 20, border: `1px solid ${agent.borderColor}`, cursor: "pointer", transition: "transform 0.15s, box-shadow 0.15s" }} onMouseOver={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"; }} onMouseOut={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, border: `1px solid ${agent.borderColor}` }}>{agent.icon}</div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, margin: 0, color: "#1a1a1a" }}>{agent.name}</p>
                        <p style={{ fontSize: 11, color: agent.color, margin: 0, fontWeight: 500 }}>Claude-powered</p>
                      </div>
                    </div>
                    <p style={{ fontSize: 12, color: "#555", lineHeight: 1.5, margin: "0 0 12px" }}>{agent.description}</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {agent.capabilities.slice(0, 3).map((cap, i) => (
                        <span key={i} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: "#fff", color: agent.color, border: `1px solid ${agent.borderColor}` }}>{cap}</span>
                      ))}
                      {agent.capabilities.length > 3 && <span style={{ fontSize: 10, color: "#888", padding: "2px 4px" }}>+{agent.capabilities.length - 3}</span>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent agent activity */}
              <div style={{ background: "#fff", borderRadius: 10, padding: 20, border: "1px solid #eee", marginTop: 14 }}>
                <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 12px" }}>Recent Agent Activity</p>
                {Object.entries(agentChatMsgs).filter(([, msgs]) => msgs.length > 0).length === 0 ? (
                  <p style={{ fontSize: 12, color: "#888", textAlign: "center", padding: 16 }}>No agent conversations yet. Pick an agent above to get started.</p>
                ) : (
                  Object.entries(agentChatMsgs).filter(([, msgs]) => msgs.length > 0).map(([agentId, msgs]) => {
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
                  })
                )}
              </div>
            </div>
          )}

          {/* ═══ ACTIVE AGENT VIEW ═══ */}
          {view === "agents" && activeAgent && (
            <div style={{ animation: "fadeIn 0.2s ease" }}>
              {/* Agent header */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <button onClick={() => setActiveAgent(null)} style={{ fontSize: 13, padding: "6px 12px", borderRadius: 6, background: "#f0efe9", border: "none", cursor: "pointer", color: "#666" }}>← Back</button>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: activeAgent.bgColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, border: `1px solid ${activeAgent.borderColor}` }}>{activeAgent.icon}</div>
                <div>
                  <p style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>{activeAgent.name}</p>
                  <p style={{ fontSize: 11, color: activeAgent.color, margin: 0 }}>{activeAgent.description}</p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 14 }}>
                {/* Agent chat */}
                <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #eee", display: "flex", flexDirection: "column", height: "calc(100vh - 240px)", overflow: "hidden" }}>
                  <div style={{ padding: "10px 16px", borderBottom: "1px solid #eee", background: activeAgent.bgColor, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 16 }}>{activeAgent.icon}</span>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{activeAgent.name}</span>
                    <span style={{ fontSize: 11, color: activeAgent.color }}>Claude-powered</span>
                    <button onClick={() => { setAgentChatMsgs(prev => ({ ...prev, [activeAgent.id]: [] })); showToast("Conversation cleared", "info"); }} style={{ marginLeft: "auto", fontSize: 11, padding: "3px 8px", borderRadius: 4, background: "transparent", color: "#888", border: "1px solid #e0e0e0", cursor: "pointer" }}>Clear</button>
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
                          <div style={{ display: "flex", gap: 4, marginTop: 4, justifyContent: "flex-start" }}>
                            <button onClick={() => copyToClipboard(m.text)} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: "#f7f6f3", color: "#888", border: "1px solid #e0e0e0", cursor: "pointer" }}>Copy</button>
                            <button onClick={() => { showToast("Sent to email draft", "success"); }} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: "#f7f6f3", color: "#888", border: "1px solid #e0e0e0", cursor: "pointer" }}>Email</button>
                          </div>
                        )}
                      </div>
                    ))}
                    {agentLoading && (
                      <div style={{ alignSelf: "flex-start", background: activeAgent.bgColor, borderRadius: "12px 12px 12px 2px", padding: "12px 16px", border: `1px solid ${activeAgent.borderColor}` }}>
                        <div style={{ display: "flex", gap: 4 }}>
                          {[0, 1, 2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: activeAgent.color, animation: `pulse 1s ${i * 0.2}s infinite` }} />)}
                        </div>
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

                {/* Agent suggested prompts */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ background: "#fff", borderRadius: 10, padding: 16, border: "1px solid #eee" }}>
                    <p style={{ fontSize: 12, fontWeight: 500, margin: "0 0 10px", color: "#888", textTransform: "uppercase", letterSpacing: 0.5 }}>Suggested prompts</p>
                    {activeAgent.prompts.map((p, i) => (
                      <button key={i} onClick={() => handleAgentChat(p)} style={{ display: "block", width: "100%", textAlign: "left", fontSize: 12, padding: "8px 12px", borderRadius: 6, background: activeAgent.bgColor, color: "#333", border: `1px solid ${activeAgent.borderColor}`, cursor: "pointer", marginBottom: 6, lineHeight: 1.4 }}>{p}</button>
                    ))}
                  </div>

                  <div style={{ background: "#fff", borderRadius: 10, padding: 16, border: "1px solid #eee" }}>
                    <p style={{ fontSize: 12, fontWeight: 500, margin: "0 0 10px", color: "#888", textTransform: "uppercase", letterSpacing: 0.5 }}>Capabilities</p>
                    {activeAgent.capabilities.map((cap, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: i < activeAgent.capabilities.length - 1 ? "1px solid #f5f5f2" : "none" }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: activeAgent.color, display: "inline-block", flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: "#555" }}>{cap}</span>
                      </div>
                    ))}
                  </div>

                  {/* Quick switch to other agents */}
                  <div style={{ background: "#fff", borderRadius: 10, padding: 16, border: "1px solid #eee" }}>
                    <p style={{ fontSize: 12, fontWeight: 500, margin: "0 0 10px", color: "#888", textTransform: "uppercase", letterSpacing: 0.5 }}>Other agents</p>
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

          {/* ═══ ANALYTICS VIEW ═══ */}
          {view === "analytics" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div style={{ background: "#fff", borderRadius: 10, padding: 20, border: "1px solid #eee" }}>
                <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 4px" }}>Pipeline by Stage</p>
                <p style={{ fontSize: 11, color: "#888", margin: "0 0 12px" }}>Value in $K · {REP.dealsOpen} open deals</p>
                {PIPELINE_STAGES.map((s, i) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color, display: "inline-block" }} />
                        <span>{s.stage}</span>
                      </div>
                      <span style={{ fontWeight: 500 }}>${s.value}K <span style={{ color: "#888", fontWeight: 400 }}>({s.deals})</span></span>
                    </div>
                    <div style={{ height: 6, background: "#f0efe9", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", background: s.color, borderRadius: 3, width: `${(s.value / 300) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background: "#fff", borderRadius: 10, padding: 20, border: "1px solid #eee" }}>
                <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 4px" }}>Win Rate Trend</p>
                <p style={{ fontSize: 11, color: "#888", margin: "0 0 4px" }}>Monthly close rate (%)</p>
                <MiniLine data={BENCHMARKS.trends.winRate} maxH={120} label="wr-big" />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                  {BENCHMARKS.trends.winRate.map((d,i) => <span key={i} style={{ fontSize: 9, color: "#888" }}>{d.m}</span>)}
                </div>
              </div>
              <div style={{ background: "#fff", borderRadius: 10, padding: 20, border: "1px solid #eee" }}>
                <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 12px" }}>Deals at Risk</p>
                {[
                  { name: "Tom Reeves — Cascade", amount: "$156K", days: "21 days stalled", prob: 25 },
                  { name: "Rebecca Frost — Alpine", amount: "$198K", days: "Competitor eval", prob: 20 },
                  { name: "Kevin Andersen — BluePeak", amount: "$88K", days: "Close pushed 2x", prob: 30 },
                  { name: "Diana Morales — Pinnacle", amount: "$144K", days: "No next steps", prob: 30 },
                  { name: "Eric Johansson — DataStream", amount: "$110K", days: "Budget frozen", prob: 20 },
                  { name: "Priya Patel — Horizon", amount: "$76K", days: "Ghosting", prob: 10 },
                ].map((r, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", borderBottom: i < 5 ? "1px solid #f5f5f2" : "none" }}>
                    <div>
                      <p style={{ fontSize: 12, margin: 0 }}>{r.name}</p>
                      <p style={{ fontSize: 10, color: "#A32D2D", margin: 0 }}>{r.amount} · {r.days}</p>
                    </div>
                    <DealBadge probability={r.prob} />
                  </div>
                ))}
                <div style={{ marginTop: 12, padding: "8px 12px", background: "#FCEBEB", borderRadius: 6 }}>
                  <p style={{ fontSize: 11, color: "#A32D2D", fontWeight: 500, margin: 0 }}>Total at risk: $772K</p>
                </div>
              </div>
              <div style={{ background: "#fff", borderRadius: 10, padding: 20, border: "1px solid #eee" }}>
                <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 12px" }}>Coaching Scorecard</p>
                {[
                  { metric: "Deal velocity", you: "62 days", team: "54 days", status: "behind" },
                  { metric: "Multi-threading", you: "50% single", team: "25% single", status: "behind" },
                  { metric: "Email reply rate", you: "24%", team: "31%", status: "behind" },
                  { metric: "Discovery questions", you: "8 avg", team: "12 avg", status: "behind" },
                  { metric: "Deal size", you: "$85K", team: "$72K", status: "ahead" },
                  { metric: "Tech eval conversion", you: "68%", team: "55%", status: "ahead" },
                ].map((m, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", borderBottom: i < 5 ? "1px solid #f5f5f2" : "none" }}>
                    <span style={{ fontSize: 12 }}>{m.metric}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 12, fontWeight: 500 }}>{m.you}</span>
                      <span style={{ fontSize: 10, color: "#888" }}>vs {m.team}</span>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: m.status === "ahead" ? "#1D9E75" : "#E24B4A", display: "inline-block" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══ DEAL BOARD VIEW ═══ */}
          {view === "queue" && (
            <>
              {/* Tabs */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ display: "flex", gap: 4, flex: 1, flexWrap: "wrap" }}>
                  {TABS.map(t => (
                    <button key={t} onClick={() => { setActiveTab(t); setSelectedDeal(null); }} style={{ fontSize: 12, padding: "5px 14px", borderRadius: 6, background: activeTab === t ? "#1a1a1a" : "#fff", color: activeTab === t ? "#fff" : "#666", border: activeTab === t ? "none" : "1px solid #e0e0e0", cursor: "pointer", fontWeight: activeTab === t ? 500 : 400 }}>
                      {t} <span style={{ opacity: 0.7 }}>({tabCounts[t]})</span>
                    </button>
                  ))}
                </div>
                {completedToday > 0 && (
                  <button onClick={() => setShowCompleted(!showCompleted)} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 5, background: showCompleted ? "#f0efe9" : "transparent", color: "#888", border: "1px solid #e0e0e0", cursor: "pointer" }}>
                    {showCompleted ? "Hide" : "Show"} completed ({completedToday})
                  </button>
                )}
              </div>

              {/* Split: list + detail */}
              <div style={{ display: "grid", gridTemplateColumns: sl ? "1fr 1.1fr" : "1fr", gap: 12 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 520, overflowY: "auto", paddingRight: 4 }}>
                  {deals.length === 0 && <div style={{ padding: 40, textAlign: "center", color: "#888", fontSize: 13 }}>All caught up in this queue!</div>}
                  {deals.map(deal => {
                    const isSent = sentIds.has(deal.id);
                    const isSkipped = skippedIds.has(deal.id);
                    const isSelected = selectedDeal === deal.id;
                    const isCoachItem = !deal.name;
                    const borderColor = isCoachItem ? "#D4A574" : deal.probability >= 70 ? "#1D9E75" : deal.probability >= 40 ? "#EF9F27" : "#E24B4A";
                    return (
                      <div key={deal.id} onClick={() => !isSent && !isSkipped && setSelectedDeal(isSelected ? null : deal.id)} style={{ background: isSelected ? "#f7f6f3" : isCoachItem ? "#FFFBF5" : "#fff", border: `1px solid ${isSelected ? "#ccc" : isCoachItem ? "#F0E6D6" : "#eee"}`, borderLeft: `3px solid ${borderColor}`, borderRadius: 8, padding: "10px 12px", cursor: isSent || isSkipped ? "default" : "pointer", opacity: isSent || isSkipped ? 0.45 : 1, transition: "all 0.15s" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <PriorityDot priority={deal.priority} />
                          <span style={{ fontWeight: 500, fontSize: 13, flex: 1 }}>{isCoachItem ? deal.stage : deal.name}</span>
                          {!isCoachItem && <DealBadge probability={deal.probability} />}
                          {isCoachItem && <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 5, background: "#FFF0E6", color: "#9C4D1A", fontWeight: 600 }}>Insight</span>}
                        </div>
                        {!isCoachItem && <p style={{ fontSize: 11, color: "#888", margin: "3px 0 0 12px" }}>{deal.company} · {deal.amount} · Close {deal.closeDate}</p>}
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 5, marginLeft: 12 }}>
                          {deal.signals.slice(0, 2).map((sg, i) => (
                            <span key={i} style={{ fontSize: 9, padding: "1px 6px", borderRadius: 4, background: sg.bg, color: sg.color }}>{sg.label}</span>
                          ))}
                          {deal.signals.length > 2 && <span style={{ fontSize: 9, color: "#888" }}>+{deal.signals.length - 2}</span>}
                        </div>
                        {(isSent || isSkipped) && <p style={{ fontSize: 10, color: isSent ? "#0F6E56" : "#888", margin: "4px 0 0 12px", fontWeight: 500 }}>{isSent ? "Done" : "Skipped"}</p>}
                      </div>
                    );
                  })}
                </div>

                {sl && (
                  <div style={{ background: sl.name ? "#fff" : "#FFFBF5", border: `1px solid ${sl.name ? "#eee" : "#F0E6D6"}`, borderRadius: 10, padding: 20, maxHeight: 520, overflowY: "auto" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {sl.name ? (
                            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#E6F1FB", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 12, color: "#185FA5" }}>{sl.name.split(" ").map(n => n[0]).join("")}</div>
                          ) : (
                            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#FFF0E6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>&#128161;</div>
                          )}
                          <div>
                            <p style={{ fontWeight: 600, fontSize: 15, margin: 0 }}>{sl.name || sl.stage}</p>
                            {sl.name && <p style={{ fontSize: 12, color: "#888", margin: "1px 0 0" }}>{sl.role}</p>}
                            {!sl.name && <p style={{ fontSize: 12, color: "#9C4D1A", margin: "1px 0 0" }}>Coaching insight</p>}
                          </div>
                        </div>
                      </div>
                      {sl.name ? <DealBadge probability={sl.probability} /> : <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 5, background: "#FFF0E6", color: "#9C4D1A", fontWeight: 600 }}>Insight</span>}
                    </div>
                    {sl.name && (
                      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 5, background: "#f0efe9", color: "#555" }}>{sl.company}</span>
                        <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 5, background: "#f0efe9", color: "#555" }}>{sl.stage}</span>
                        <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 5, background: "#f0efe9", color: "#555" }}>{sl.amount}</span>
                        <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 5, background: "#f0efe9", color: "#555" }}>Close {sl.closeDate}</span>
                      </div>
                    )}

                    <p style={{ fontSize: 11, color: "#888", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 500 }}>Signals</p>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 16 }}>
                      {sl.signals.map((sg, i) => (
                        <span key={i} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 5, background: sg.bg, color: sg.color }}>{sg.label}</span>
                      ))}
                    </div>

                    <p style={{ fontSize: 11, color: "#888", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 500 }}>{sl.name ? "Suggested action" : "Recommendation"}</p>
                    <div style={{ background: sl.name ? "#FAFAF8" : "#FFF8F0", borderRadius: 8, padding: 14, marginBottom: 14, border: `1px solid ${sl.name ? "#f0efe9" : "#F0E6D6"}` }}>
                      {editingId === sl.id ? (
                        <textarea value={slMsg} onChange={e => setEditedMessages({ ...editedMessages, [sl.id]: e.target.value })} style={{ width: "100%", fontSize: 13, lineHeight: 1.6, border: "1px solid #ccc", borderRadius: 6, padding: 10, minHeight: 100, resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }} />
                      ) : (
                        <p style={{ fontSize: 13, lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap" }}>{renderText(slMsg)}</p>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {sl.name && (
                        <>
                          <button onClick={() => handleSend(sl.id)} style={{ fontSize: 12, padding: "8px 20px", borderRadius: 6, background: "#1a1a1a", color: "#fff", border: "none", cursor: "pointer", fontWeight: 500 }}>Send via email</button>
                          {editingId === sl.id ? (
                            <button onClick={() => setEditingId(null)} style={{ fontSize: 12, padding: "8px 16px", borderRadius: 6, background: "transparent", color: "#0F6E56", border: "1px solid #0F6E56", cursor: "pointer" }}>Save</button>
                          ) : (
                            <button onClick={() => { setEditingId(sl.id); if (!editedMessages[sl.id]) setEditedMessages({ ...editedMessages, [sl.id]: sl.message }); }} style={{ fontSize: 12, padding: "8px 16px", borderRadius: 6, background: "transparent", color: "#666", border: "1px solid #ddd", cursor: "pointer" }}>Edit message</button>
                          )}
                        </>
                      )}
                      <button onClick={() => copyToClipboard(slMsg)} style={{ fontSize: 12, padding: "8px 16px", borderRadius: 6, background: "transparent", color: "#666", border: "1px solid #ddd", cursor: "pointer" }}>Copy</button>
                      <button onClick={() => handleSkip(sl.id)} style={{ fontSize: 12, padding: "8px 16px", borderRadius: 6, background: "transparent", color: "#888", border: "1px solid #ddd", cursor: "pointer" }}>{sl.name ? "Skip" : "Dismiss"}</button>
                      <button onClick={() => handleChat(sl.name ? `Tell me more about ${sl.name} at ${sl.company}` : `Give me coaching advice on ${sl.stage}`)} style={{ fontSize: 12, padding: "8px 16px", borderRadius: 6, background: "transparent", color: "#185FA5", border: "1px solid #85B7EB", cursor: "pointer" }}>Ask Claude</button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* ═══ RIGHT PANEL: Claude Chat (visible on non-agent views) ═══ */}
        {(view !== "agents" || !activeAgent) && (
          <div style={{ width: 340, flexShrink: 0, background: "#fff", border: "1px solid #eee", borderRadius: 12, display: "flex", flexDirection: "column", overflow: "hidden", height: "calc(100vh - 100px)", position: "sticky", top: 16 }}>
            <div style={{ padding: "10px 16px", borderBottom: "1px solid #eee", display: "flex", alignItems: "center", gap: 8, background: "#FAFAF8" }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#D4A574", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#fff"/></svg>
              </div>
              <span style={{ fontWeight: 600, fontSize: 13 }}>Claude</span>
              <span style={{ fontSize: 11, color: "#888" }}>Deal coach</span>
              <button onClick={() => { setChatMsgs([]); showToast("Chat cleared", "info"); }} style={{ marginLeft: "auto", fontSize: 10, padding: "2px 8px", borderRadius: 4, background: "transparent", color: "#888", border: "1px solid #e0e0e0", cursor: "pointer" }}>Clear</button>
            </div>

            <div style={{ flex: 1, padding: 14, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
              {chatMsgs.map((m, i) => (
                <div key={i} style={{ alignSelf: m.from === "user" ? "flex-end" : "flex-start", maxWidth: "92%" }}>
                  <div style={{ background: m.from === "user" ? "#E6F1FB" : "#FAFAF8", borderRadius: m.from === "user" ? "10px 10px 2px 10px" : "10px 10px 10px 2px", padding: "10px 14px", border: m.from === "user" ? "none" : "1px solid #f0efe9" }}>
                    <p style={{ fontSize: 12, lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap" }}>{renderText(m.text)}</p>
                  </div>
                  {m.from === "claude" && (
                    <div style={{ display: "flex", gap: 4, marginTop: 2 }}>
                      <button onClick={() => copyToClipboard(m.text)} style={{ fontSize: 9, padding: "1px 6px", borderRadius: 3, background: "transparent", color: "#aaa", border: "1px solid #e8e7e3", cursor: "pointer" }}>Copy</button>
                    </div>
                  )}
                </div>
              ))}
              {chatLoading && (
                <div style={{ alignSelf: "flex-start", background: "#FAFAF8", borderRadius: "10px 10px 10px 2px", padding: "10px 14px", border: "1px solid #f0efe9" }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[0, 1, 2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#ccc", animation: `pulse 1s ${i * 0.2}s infinite` }} />)}
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div style={{ padding: "10px 14px", borderTop: "1px solid #eee", background: "#FAFAF8" }}>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
                {["Pipeline breakdown", "Deal risks", "Stakeholder gaps", "Q1 forecast", "How can I improve?"].map((sg, i) => (
                  <button key={i} onClick={() => handleChat(sg)} style={{ fontSize: 10, padding: "4px 8px", borderRadius: 5, background: "#fff", color: "#666", border: "1px solid #e0e0e0", cursor: "pointer" }}>{sg}</button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleChat()} placeholder="Ask about your deals..." style={{ flex: 1, fontSize: 12, padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd", outline: "none", background: "#fff" }} />
                <button onClick={() => handleChat()} style={{ fontSize: 12, padding: "8px 14px", borderRadius: 8, background: "#1a1a1a", color: "#fff", border: "none", cursor: "pointer", fontWeight: 500 }}>Send</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
