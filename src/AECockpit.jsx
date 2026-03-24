import { useState, useRef, useEffect, useCallback } from "react";

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

const CHAT_RESPONSES = {
  pipeline: "Here's your pipeline breakdown:\n\n**By Stage:**\n• Negotiation: $297K (Sandra $112K + Robert $185K) — highest probability\n• Proposal: $276K (Michelle $142K + Ahmed $134K)\n• Technical Eval: $168K (Karen $168K — POC in progress)\n• Discovery: $220K (Daniel $220K — Citrix displacement)\n• Demo: $96K (Jason $96K — Thursday)\n• Qualification: $78K (Lisa $78K — early stage)\n\n**Pipeline health:**\n• Total: $2.8M, Coverage: 2.3x (need 3x for comfort)\n• Weighted pipeline: $920K (commit forecast)\n• 3 deals closable in Q1: $453K (Sandra, Robert, Tom)\n• Gap to quota: $520K — needs 2-3 of the Q1 deals to land\n\n**Action:** Lock Sandra's PO this week ($112K), finalize Robert's contract ($185K), and re-engage Tom Reeves ($156K).",
  risk: "Your 6 at-risk deals ranked by save potential:\n\n1. **Tom Reeves** (Cascade Digital) — $156K, stalled 21 days. Was in negotiation. **Best save bet** — send the benchmark report and use Q1 pricing deadline (3/31) as urgency.\n2. **Rebecca Frost** (Alpine Tech) — $198K, evaluating VMware. Only 1 stakeholder. **Biggest deal at risk.** Need TCO comparison and multi-thread ASAP.\n3. **Kevin Andersen** (BluePeak) — $88K, procurement stuck. Tech team loves it. **Create CFO one-pager** to unstick procurement.\n4. **Diana Morales** (Pinnacle Cloud) — $144K, POC done but no next steps. **Decision maker not engaged.** Request intro to VP.\n5. **Eric Johansson** (DataStream) — $110K, budget frozen. **Offer deferred billing** to keep momentum.\n6. **Priya Patel** (Horizon) — $76K, ghosting. **Likely lost** — send a no-pressure breakup email.\n\n**Total at-risk ARR: $772K.** Focus saves on Tom, Rebecca, and Kevin — combined $442K with the clearest paths forward.",
  stakeholders: "**Multi-threading status across your pipeline:**\n\n| Deal | Contacts | Gap |\n|---|---|---|\n| Apex Financial ($185K) | CTO only | **Need CFO** — economic buyer |\n| Summit Health ($168K) | CISO only | **Need CIO + clinical IT lead** |\n| Meridian Cloud ($220K) | CEO only | **Need solutions architect** |\n| NorthPoint ($134K) | VP Eng only | **Need CFO + CISO** |\n| CloudBridge ($96K) | Head of Sales | **Need CEO/founder** |\n| Pacific ($78K) | COO only | **Need technical lead** |\n\n**4 of 8 active deals are single-threaded.** Your win rate drops from 38% to 14% when only 1 contact is engaged.\n\n**Priority intros this week:**\n1. Apex CFO — $185K deal in negotiation, needs sign-off\n2. Summit CIO — $168K, POC ending, decision maker missing\n3. NorthPoint CFO + CISO — committee forming, get ahead of it",
  coaching: "**Your performance insights vs top AEs:**\n\n**Where you're strong:**\n• Deal size: $85K avg vs $72K team avg — you sell bigger\n• Technical eval conversion: 68% vs 55% avg — POCs go well\n• Citrix displacement win rate: 65% — strong competitive muscle\n\n**Where to improve:**\n• **Deal velocity:** 62 days vs 54 avg. Gap is in Discovery→Demo (18 vs 11 days). Book demos in the first call.\n• **Multi-threading:** 50% of deals are single-threaded vs 25% for top performers. Each new contact adds ~12% to win probability.\n• **Email reply rate:** 24% vs 31% avg. Lead with ROI data instead of generic check-ins. Your ROI emails hit 38%.\n• **Discovery depth:** 8 questions avg vs 12 for top performers. Focus on budget, decision process, and paper process.\n\n**If you fix discovery speed + multi-threading, your forecast model shows an extra $180K-$240K per quarter.** Start with this week: book CloudBridge demo during Thursday's call, and get 2 stakeholder intros on Apex and Summit.",
  forecast: "**Q1 Forecast — 2 weeks remaining:**\n\n**Closed: $680K** (57% of $1.2M quota)\n**Gap: $520K**\n\n**Commit deals (80%+ probability):**\n• Sandra Liu — $112K, verbal commit, PO pending → **This week**\n• Robert Chen — $185K, contract redline → **Close by 3/28**\nSubtotal: $297K\n\n**Best case (50%+ with action):**\n• Tom Reeves — $156K, re-engage with benchmark + Q1 deadline\n• Michelle Park — $142K, follow up on proposal + ROI model\nSubtotal: $298K\n\n**If commit lands:** $680K + $297K = **$977K (81% of quota)**\n**If best case lands:** $680K + $595K = **$1.275M (106% of quota)**\n\nThe difference between 81% and 106% comes down to re-engaging Tom and closing Michelle this month. Both are doable with focused effort this week.",
  fallback: "Based on your current pipeline:\n\nYou have **$2.8M in pipeline** with **2.3x coverage** on a **$1.2M quota**. You've closed **$680K** (57%) with 2 weeks left.\n\n**Priorities this week:**\n1. Lock Sandra Liu's PO ($112K) — verbal commit, needs push\n2. Finalize Robert Chen's contract ($185K) — legal redline pending\n3. Re-engage Tom Reeves ($156K) — stalled 21 days, Q1 deadline play\n4. Multi-thread Apex and Summit — both need executive engagement\n5. Prep CloudBridge demo for Thursday\n\nWant me to dig into your forecast, deal risks, stakeholder gaps, or coaching insights?"
};

const PIPELINE_STAGES = [
  { stage: "Qualification", value: 78, deals: 1, color: "#B4B2A9" },
  { stage: "Discovery", value: 220, deals: 1, color: "#85B7EB" },
  { stage: "Demo", value: 96, deals: 1, color: "#AFA9EC" },
  { stage: "Tech Eval", value: 168, deals: 1, color: "#5DCAA5" },
  { stage: "Proposal", value: 276, deals: 2, color: "#EF9F27" },
  { stage: "Negotiation", value: 297, deals: 2, color: "#1D9E75" },
];

const WIN_RATE_DATA = [
  { month: "Oct", value: 22 }, { month: "Nov", value: 25 }, { month: "Dec", value: 30 },
  { month: "Jan", value: 26 }, { month: "Feb", value: 28 }, { month: "Mar", value: 28 },
];

function MiniLine({ data, maxH = 55, color = "#1D9E75" }) {
  const mx = Math.max(...data.map(d => d.value));
  const mn = Math.min(...data.map(d => d.value));
  const range = mx - mn || 1;
  const pts = data.map((d, i) => ({ x: (i / (data.length - 1)) * 100, y: maxH - ((d.value - mn) / range) * (maxH - 16) - 8 }));
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const area = path + ` L100,${maxH} L0,${maxH} Z`;
  return (
    <svg viewBox={`0 0 100 ${maxH}`} style={{ width: "100%", height: maxH, marginTop: 8 }} preserveAspectRatio="none">
      <defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.2" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs>
      <path d={area} fill="url(#ag)" />
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

export default function AECockpit() {
  const [activeTab, setActiveTab] = useState("Pipeline management");
  const [editingId, setEditingId] = useState(null);
  const [editedMessages, setEditedMessages] = useState({});
  const [sentIds, setSentIds] = useState(new Set());
  const [skippedIds, setSkippedIds] = useState(new Set());
  const [chatInput, setChatInput] = useState("");
  const [chatMsgs, setChatMsgs] = useState([
    { from: "claude", text: "Morning, Alex. You're at **$680K closed** with **$520K to go** and 2 weeks left in Q1." },
    { from: "claude", text: "Your best path to quota: **Sandra Liu** ($112K) has a verbal commit — chase the PO. **Robert Chen** ($185K) is in contract redline. Land both and you're at **$977K (81%)**. Re-engage **Tom Reeves** ($156K) and you could hit **106%**." },
    { from: "claude", text: "**Watch out:** 4 deals are single-threaded, and your deal velocity is 8 days slower than team avg. I've got specific coaching on both — check the Coaching tab or ask me." },
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [view, setView] = useState("queue");
  const chatEndRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMsgs, chatLoading]);

  const pctQuota = Math.round((REP.closed / REP.quota) * 1000) / 10;
  const gap = REP.quota - REP.closed;

  const allDeals = Object.values(ALL_DEALS).flat();
  const deals = (ALL_DEALS[activeTab] || []).filter(d => showCompleted || (!sentIds.has(d.id) && !skippedIds.has(d.id)));
  const tabCounts = {};
  TABS.forEach(t => { tabCounts[t] = (ALL_DEALS[t] || []).filter(d => !sentIds.has(d.id) && !skippedIds.has(d.id)).length; });
  const totalActions = Object.values(tabCounts).reduce((a, b) => a + b, 0);
  const completedToday = sentIds.size + skippedIds.size;

  const handleSend = (id) => { setSentIds(prev => new Set([...prev, id])); setEditingId(null); setSelectedDeal(null); };
  const handleSkip = (id) => { setSkippedIds(prev => new Set([...prev, id])); setSelectedDeal(null); };

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
        if (mentionedDeal) reply = `**${mentionedDeal.name} — ${mentionedDeal.company}**\n\nRole: ${mentionedDeal.role}\nStage: ${mentionedDeal.stage}\nAmount: ${mentionedDeal.amount}\nClose date: ${mentionedDeal.closeDate}\nProbability: ${mentionedDeal.probability}%\nSignals: ${mentionedDeal.signals.map(s => s.label).join(", ")}\n\nRecommended action: ${mentionedDeal.probability >= 70 ? "This deal is close — focus on removing final blockers and getting the PO. Build a mutual action plan with specific dates." : mentionedDeal.probability >= 40 ? "Good momentum but needs acceleration. Multi-thread to reduce risk and compress the timeline. Schedule next steps before ending every call." : "This deal needs intervention. Either re-engage with new value or qualify out to focus energy on higher-probability opportunities."}`;
      }
      setChatMsgs(prev => [...prev, { from: "claude", text: reply }]);
      setChatLoading(false);
    }, 800 + Math.random() * 600);
  }, [chatInput, allDeals]);

  const renderText = (text) => text.split("\n").map((line, i) => (
    <span key={i}>{i > 0 && <br />}{line.split("**").map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}</span>
  ));

  const sl = selectedDeal ? allDeals.find(d => d.id === selectedDeal) : null;
  const slMsg = sl ? (editedMessages[sl.id] || sl.message) : "";
  const isCoaching = activeTab === "Coaching insights";

  return (
    <div style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif", background: "#FAFAF8", minHeight: "100vh" }}>
      {/* Top nav */}
      <div style={{ background: "#fff", borderBottom: "1px solid #eee", padding: "0 24px", display: "flex", alignItems: "center", height: 52 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 32 }}>
          <svg width="20" height="20" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#0078D4"/><text x="4" y="17" fontSize="13" fontWeight="700" fill="#fff">N</text></svg>
          <span style={{ fontWeight: 600, fontSize: 15, letterSpacing: -0.3 }}>Nerdio</span>
          <span style={{ fontSize: 12, color: "#888", marginLeft: 4 }}>AE Cockpit</span>
        </div>
        <div style={{ display: "flex", gap: 2 }}>
          {["queue", "analytics"].map(v => (
            <button key={v} onClick={() => setView(v)} style={{ fontSize: 13, padding: "6px 16px", borderRadius: 6, background: view === v ? "#f0efe9" : "transparent", color: view === v ? "#1a1a1a" : "#888", border: "none", cursor: "pointer", fontWeight: view === v ? 500 : 400 }}>
              {v === "queue" ? "Deal board" : "Analytics"}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
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
            <div style={{ background: "#fff", borderRadius: 10, padding: "14px 16px", border: "1px solid #eee" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <div>
                  <p style={{ fontSize: 11, color: "#888", margin: 0, textTransform: "uppercase", letterSpacing: 0.5 }}>Quota attainment</p>
                  <p style={{ fontSize: 26, fontWeight: 600, margin: "4px 0 0", letterSpacing: -0.5 }}>${(REP.closed / 1000).toFixed(0)}K</p>
                </div>
                <span style={{ fontSize: 11, color: "#BA7517", fontWeight: 500 }}>${(gap / 1000).toFixed(0)}K gap</span>
              </div>
              <div style={{ height: 4, borderRadius: 2, background: "#f0efe9", marginTop: 10, overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 2, background: pctQuota >= 80 ? "#1D9E75" : "#EF9F27", width: `${pctQuota}%` }} />
              </div>
              <p style={{ fontSize: 10, color: "#888", margin: "4px 0 0", textAlign: "right" }}>{pctQuota}% of ${(REP.quota/1000).toFixed(0)}K</p>
            </div>
            <div style={{ background: "#fff", borderRadius: 10, padding: "14px 16px", border: "1px solid #eee" }}>
              <p style={{ fontSize: 11, color: "#888", margin: 0, textTransform: "uppercase", letterSpacing: 0.5 }}>Pipeline</p>
              <p style={{ fontSize: 26, fontWeight: 600, margin: "4px 0 0", letterSpacing: -0.5 }}>${(REP.pipeline / 1000000).toFixed(1)}M</p>
              <p style={{ fontSize: 11, color: REP.coverage >= 3 ? "#0F6E56" : "#BA7517", margin: "6px 0 0" }}>{REP.coverage}x coverage</p>
            </div>
            <div style={{ background: "#fff", borderRadius: 10, padding: "14px 16px", border: "1px solid #eee" }}>
              <p style={{ fontSize: 11, color: "#888", margin: 0, textTransform: "uppercase", letterSpacing: 0.5 }}>Win rate</p>
              <p style={{ fontSize: 26, fontWeight: 600, margin: "4px 0 0", letterSpacing: -0.5 }}>{REP.winRate}%</p>
              <p style={{ fontSize: 11, color: "#888", margin: "6px 0 0" }}>team avg 26%</p>
            </div>
            <div style={{ background: "#fff", borderRadius: 10, padding: "14px 16px", border: "1px solid #eee" }}>
              <p style={{ fontSize: 11, color: "#888", margin: 0, textTransform: "uppercase", letterSpacing: 0.5 }}>Avg deal size</p>
              <p style={{ fontSize: 26, fontWeight: 600, margin: "4px 0 0", letterSpacing: -0.5 }}>${(REP.avgDealSize / 1000).toFixed(0)}K</p>
              <p style={{ fontSize: 11, color: "#0F6E56", margin: "6px 0 0" }}>+$13K vs team</p>
            </div>
            <div style={{ background: "#fff", borderRadius: 10, padding: "14px 16px", border: "1px solid #eee" }}>
              <p style={{ fontSize: 11, color: "#888", margin: 0, textTransform: "uppercase", letterSpacing: 0.5 }}>Avg cycle</p>
              <p style={{ fontSize: 26, fontWeight: 600, margin: "4px 0 0", letterSpacing: -0.5 }}>{REP.avgCycle}d</p>
              <p style={{ fontSize: 11, color: "#A32D2D", margin: "6px 0 0" }}>+8d vs team</p>
            </div>
            <div style={{ background: "#fff", borderRadius: 10, padding: "14px 16px", border: "1px solid #eee" }}>
              <p style={{ fontSize: 11, color: "#888", margin: 0, textTransform: "uppercase", letterSpacing: 0.5 }}>Forecast</p>
              <p style={{ fontSize: 26, fontWeight: 600, margin: "4px 0 0", letterSpacing: -0.5 }}>${(REP.forecastCommit / 1000).toFixed(0)}K</p>
              <p style={{ fontSize: 11, color: "#888", margin: "6px 0 0" }}>commit</p>
            </div>
          </div>

          {view === "analytics" ? (
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
                <MiniLine data={WIN_RATE_DATA} maxH={120} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                  {WIN_RATE_DATA.map((d,i) => <span key={i} style={{ fontSize: 9, color: "#888" }}>{d.month}</span>)}
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
          ) : (
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
                            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#FFF0E6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>💡</div>
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
                      <button onClick={() => handleSkip(sl.id)} style={{ fontSize: 12, padding: "8px 16px", borderRadius: 6, background: "transparent", color: "#888", border: "1px solid #ddd", cursor: "pointer" }}>{sl.name ? "Skip" : "Dismiss"}</button>
                      <button onClick={() => handleChat(sl.name ? `Tell me more about ${sl.name} at ${sl.company}` : `Give me coaching advice on ${sl.stage}`)} style={{ fontSize: 12, padding: "8px 16px", borderRadius: 6, background: "transparent", color: "#185FA5", border: "1px solid #85B7EB", cursor: "pointer" }}>Ask Claude</button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right: Claude chat */}
        <div style={{ width: 340, flexShrink: 0, background: "#fff", border: "1px solid #eee", borderRadius: 12, display: "flex", flexDirection: "column", overflow: "hidden", height: "calc(100vh - 100px)", position: "sticky", top: 16 }}>
          <div style={{ padding: "10px 16px", borderBottom: "1px solid #eee", display: "flex", alignItems: "center", gap: 8, background: "#FAFAF8" }}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#D4A574", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#fff"/></svg>
            </div>
            <span style={{ fontWeight: 600, fontSize: 13 }}>Claude</span>
            <span style={{ fontSize: 11, color: "#888" }}>Deal coach</span>
          </div>

          <div style={{ flex: 1, padding: 14, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
            {chatMsgs.map((m, i) => (
              <div key={i} style={{ alignSelf: m.from === "user" ? "flex-end" : "flex-start", maxWidth: "92%", background: m.from === "user" ? "#E6F1FB" : "#FAFAF8", borderRadius: m.from === "user" ? "10px 10px 2px 10px" : "10px 10px 10px 2px", padding: "10px 14px", border: m.from === "user" ? "none" : "1px solid #f0efe9" }}>
                <p style={{ fontSize: 12, lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap" }}>{renderText(m.text)}</p>
              </div>
            ))}
            {chatLoading && (
              <div style={{ alignSelf: "flex-start", background: "#FAFAF8", borderRadius: "10px 10px 10px 2px", padding: "10px 14px", border: "1px solid #f0efe9" }}>
                <div style={{ display: "flex", gap: 4 }}>
                  {[0, 1, 2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#ccc", animation: `pulse 1s ${i * 0.2}s infinite` }} />)}
                </div>
                <style>{`@keyframes pulse { 0%,100% { opacity:0.3 } 50% { opacity:1 } }`}</style>
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
      </div>
    </div>
  );
}
