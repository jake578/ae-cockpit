import { useState, useRef, useEffect, useCallback } from "react";

// ─── DATA ───────────────────────────────────────────────────────────────────

const REP = { name: "Jordan Reeves", initials: "JR", title: "Senior AE — Mid-Market", quarter: "Q2 2026", quota: 950000, closed: 312000, pipeline: 2100000, coverage: 2.2, winRate: 31, avgDealSize: 62000, avgCycle: 48, dealsOpen: 14, dealsAtRisk: 3, forecastCommit: 580000 };

const DEALS = [
  { id: 1, name: "Sarah Chen", company: "Ridgeline Capital", role: "VP Data", stage: "Negotiation", amount: 128000, closeDate: "4/18", probability: 78, signals: ["Contract sent", "Champion active", "Budget confirmed"], priority: "critical", lastActivity: "2d ago" },
  { id: 2, name: "Marcus Webb", company: "Helios Health Systems", role: "CTO", stage: "Proposal", amount: 95000, closeDate: "4/25", probability: 55, signals: ["RFP response due 4/12", "Competitor shortlisted", "Technical eval passed"], priority: "critical", lastActivity: "1d ago" },
  { id: 3, name: "Diana Russo", company: "Apex Logistics", role: "COO", stage: "Technical Eval", amount: 142000, closeDate: "5/10", probability: 45, signals: ["POC week 2 of 3", "Security review pending", "3 stakeholders engaged"], priority: "high", lastActivity: "Today" },
  { id: 4, name: "Kevin Nakamura", company: "Stratos Financial", role: "Head of Analytics", stage: "Discovery", amount: 78000, closeDate: "5/20", probability: 30, signals: ["Great first call", "Data migration concerns", "Incumbent is legacy BI"], priority: "high", lastActivity: "3d ago" },
  { id: 5, name: "Anya Patel", company: "CloudNine SaaS", role: "VP Revenue Ops", stage: "Demo Scheduled", amount: 56000, closeDate: "5/15", probability: 25, signals: ["Demo Thursday", "Fast-growing — 200% YoY", "No current analytics platform"], priority: "medium", lastActivity: "1d ago" },
  { id: 6, name: "Tom Briggs", company: "Meridian Insurance", role: "Director BI", stage: "Proposal", amount: 88000, closeDate: "4/22", probability: 50, signals: ["Proposal sent 4/1 — no reply", "Budget approved", "Evaluating Looker"], priority: "high", lastActivity: "8d ago" },
  { id: 7, name: "Rachel Kim", company: "NovaTech Solutions", role: "CEO", stage: "Qualification", amount: 45000, closeDate: "6/1", probability: 15, signals: ["Inbound lead", "50-person company", "Outgrowing spreadsheets"], priority: "medium", lastActivity: "5d ago" },
  { id: 8, name: "James Okafor", company: "PeakView Partners", role: "Managing Director", stage: "Stalled", amount: 110000, closeDate: "4/15", probability: 15, signals: ["No response 18 days", "Was in Negotiation", "Internal reorg rumored"], priority: "critical", lastActivity: "18d ago" },
  { id: 9, name: "Lisa Fernandez", company: "Greenlight Analytics", role: "VP Engineering", stage: "Technical Eval", amount: 72000, closeDate: "5/5", probability: 40, signals: ["API integration testing", "Dev team engaged", "Competing with in-house build"], priority: "high", lastActivity: "2d ago" },
  { id: 10, name: "Derek Chang", company: "Summit Retail Group", role: "CFO", stage: "Discovery", amount: 165000, closeDate: "6/15", probability: 20, signals: ["Large opportunity", "Need ROI justification", "Multi-location rollout"], priority: "high", lastActivity: "4d ago" },
];

const STAGES = ["Qualification", "Discovery", "Demo Scheduled", "Technical Eval", "Proposal", "Negotiation", "Stalled"];
const STAGE_COLORS = { Qualification: "#B4B2A9", Discovery: "#85B7EB", "Demo Scheduled": "#AFA9EC", "Technical Eval": "#5DCAA5", Proposal: "#EF9F27", Negotiation: "#1D9E75", Stalled: "#E24B4A" };

// ─── AGENT RESPONSES ────────────────────────────────────────────────────────

const AGENT_RESPONSES = {
  rfp: {
    defaults: [
      { q: "Draft the executive summary for the Helios Health RFP", a: "**Executive Summary — Helios Health Systems RFP Response**\n\nBenchmark Analytics is pleased to present our proposal for Helios Health Systems' enterprise analytics platform initiative. Our solution delivers:\n\n**Why Benchmark Analytics for Helios:**\n\n1. **Healthcare-native analytics** — Pre-built models for claims analysis, patient outcomes tracking, and operational efficiency metrics. HIPAA-compliant by design with BAA-ready infrastructure.\n\n2. **Proven scale in healthcare** — Currently serving 12 health systems processing 2B+ data points daily. Average customer sees 40% reduction in reporting cycle time within 90 days.\n\n3. **Integration-first architecture** — Native connectors for Epic, Cerner, and Allscripts EHR systems. RESTful API layer supports custom integrations with your existing data warehouse.\n\n4. **Rapid time-to-value** — Typical enterprise deployment in 6-8 weeks vs 4-6 months for legacy BI tools. Dedicated onboarding team with healthcare domain expertise.\n\n**Investment & ROI:**\n- Annual platform cost: $95,000 (as quoted)\n- Projected 3-year ROI: 340% based on comparable health system deployments\n- Payback period: 7 months\n\n**Competitive edge:** Unlike Looker (also shortlisted), Benchmark Analytics offers embedded AI insights, no per-seat licensing, and healthcare-specific compliance frameworks out of the box.\n\n---\n*Ready to customize further. Should I draft the technical requirements section next, or adjust the competitive positioning?*" },
      { q: "Write the security & compliance section for Helios", a: "**Section 5: Security & Compliance**\n\n**5.1 Healthcare Compliance**\nBenchmark Analytics maintains full HIPAA compliance across our platform:\n- BAA execution available prior to deployment\n- PHI data encrypted at rest (AES-256) and in transit (TLS 1.3)\n- Role-based access control with row-level security\n- Complete audit trail for all data access and modifications\n- Automated PII/PHI detection and masking in shared dashboards\n\n**5.2 Certifications**\n- SOC 2 Type II (Security, Availability, Confidentiality)\n- HITRUST CSF certified\n- ISO 27001 certified\n- Annual third-party penetration testing by NCC Group\n\n**5.3 Data Architecture**\n- Customer data isolated in dedicated tenant environments\n- Data residency options: US-East, US-West, EU (Frankfurt)\n- All processing within customer-selected region\n- No data sharing across tenants\n- Customer retains full data ownership and portability\n\n**5.4 Access Controls**\n- SSO via SAML 2.0 / OIDC (integrates with Okta, Azure AD, Ping)\n- MFA enforced for all admin access\n- IP allowlisting available\n- Session management with configurable timeout policies\n\n**5.5 Incident Response**\n- 24/7 security monitoring via dedicated SOC\n- <1 hour initial response SLA for critical incidents\n- Customer notification within 4 hours of confirmed breach\n- Quarterly security review meetings with enterprise customers\n\n*Tailored for healthcare RFP requirements. I can add specific control mappings for NIST 800-53 or CMS requirements if needed.*" },
      { q: "Generate a competitive comparison vs Looker for the Helios deal", a: "**Competitive Analysis: Benchmark Analytics vs Looker**\n*For: Helios Health Systems evaluation*\n\n| Capability | Benchmark Analytics | Looker (Google Cloud) |\n|---|---|---|\n| **Pricing model** | Flat platform fee — unlimited users | Per-user licensing — costs scale with adoption |\n| **Healthcare compliance** | HIPAA + HITRUST + BAA ready | HIPAA capable but no HITRUST |\n| **EHR integrations** | Native Epic, Cerner, Allscripts connectors | Custom-built via LookML |\n| **AI/ML insights** | Embedded — anomaly detection, forecasting, NL queries | Requires separate Vertex AI setup |\n| **Time to deploy** | 6-8 weeks (healthcare template) | 3-5 months (custom modeling required) |\n| **Self-service for analysts** | Drag-and-drop + SQL + natural language | LookML required — steep learning curve |\n| **Data governance** | Built-in lineage, catalog, PII detection | Relies on Google Data Catalog |\n| **Support model** | Dedicated CSM + healthcare domain specialist | Tiered support — premium costs extra |\n\n**Key talking points for your conversation with Marcus Webb:**\n\n1. **Cost at scale:** Helios has ~200 analysts. At Looker's per-seat pricing, that's ~$180K/year vs our $95K. As they grow, the gap widens.\n\n2. **Speed to value:** Marcus mentioned Q3 reporting deadline. Our healthcare template gets them live in 6-8 weeks. Looker's custom LookML modeling takes 3-5 months.\n\n3. **AI differentiation:** Marcus's team wants predictive analytics. We include it — Looker requires a separate Vertex AI project and data engineering work.\n\n4. **Objection handling:** If Marcus says \"Google ecosystem advantage\" — counter with our native BigQuery connector + the fact that we're cloud-agnostic (Helios runs multi-cloud).\n\n*Want me to draft a one-pager version of this for Marcus, or build it into the RFP response?*" },
      { q: "Build a pricing justification for the Apex Logistics deal", a: "**Pricing Justification — Apex Logistics ($142K)**\n\n**Why $142K is the right investment for Apex:**\n\nApex operates 14 distribution centers generating ~500M data points/month across fleet tracking, warehouse ops, and route optimization. Here's how the numbers work:\n\n**Current State Costs (estimated):**\n| Item | Annual Cost |\n|---|---|\n| Legacy BI tool licensing | $85K |\n| Data engineering contractors | $140K |\n| Manual reporting labor (3 FTEs × 30%) | $90K |\n| Downtime from reporting delays | $60K |\n| **Total** | **$375K** |\n\n**With Benchmark Analytics:**\n| Item | Annual Cost |\n|---|---|\n| Platform license | $142K |\n| Implementation (Year 1 only) | $25K |\n| Reduced contractor need (-60%) | $56K |\n| Reduced manual reporting (-80%) | $18K |\n| **Total Year 1** | **$241K** |\n| **Total Year 2+** | **$216K** |\n\n**3-Year Savings: $319K**\n**Payback period: 9 months**\n**ROI: 225% over 3 years**\n\n**Logistics-specific value adds included in the $142K:**\n- Pre-built supply chain dashboards (route optimization, warehouse throughput, fleet utilization)\n- Real-time alerting on delivery SLA breaches\n- Embedded forecasting for demand planning\n- Multi-location rollout support (14 DCs)\n\n*Diana Russo (COO) will care most about the operational efficiency angle. The CFO — if/when engaged — will want the 3-year TCO comparison. Want me to draft a CFO-ready version?*" },
    ],
    fallback: "I'll help draft that RFP content. To generate the most targeted response, tell me:\n\n1. **Which deal/account** is this for?\n2. **Specific section** needed (executive summary, security, pricing, technical architecture, competitive positioning)\n3. **Key differentiators** to emphasize\n4. **Competitor** they're evaluating against\n\nI have context on all 10 of your open deals — just name the account and section.\n\n**Quick options:**\n- Draft a full RFP response for Helios Health (due 4/12)\n- Build a competitive comparison vs Looker, Tableau, or Power BI\n- Write a pricing justification for any deal\n- Generate a technical architecture overview",
  },
  research: {
    defaults: [
      { q: "Research Ridgeline Capital for my negotiation call", a: "**Account Briefing: Ridgeline Capital**\n*Deal: $128K — Negotiation stage*\n\n---\n\n**Company Overview**\n- **Industry:** Asset Management / Private Equity\n- **AUM:** $4.2B across 6 funds\n- **Employees:** ~180 | HQ: Boston, MA\n- **IT stack:** Snowflake data warehouse, Salesforce CRM, currently using Tableau (contract expires Q3)\n\n**Key Stakeholders**\n| Name | Title | Status | Notes |\n|---|---|---|---|\n| Sarah Chen | VP Data | Champion ✅ | Driving the initiative. Data-first leader. |\n| Michael Torres | CFO | Engaged ✅ | Approved budget. Wants ROI proof. |\n| David Park | CIO | Not yet met ⚠️ | Final sign-off authority. Risk-averse. |\n| Amy Liu | Head of Portfolio Analytics | Evaluator ✅ | Ran the technical eval. Very positive. |\n\n**Strategic Context**\n- Tableau contract renewal coming Q3 — they want to switch before that\n- Sarah's team spent 6 months evaluating. We beat Looker and Sigma in their bake-off\n- Key driver: they need real-time portfolio analytics that Tableau can't deliver at their data volume\n- Compliance requirement: SEC Rule 206 reporting automation\n\n**Deal Intel**\n- Contract sent 2 days ago — Sarah reviewing with legal\n- No known pricing objections (budget was $140K, we're at $128K)\n- Potential blocker: CIO David Park hasn't been in any meetings\n- Sarah said \"we're planning to sign this month\" on last call\n\n**Negotiation Prep**\n- Likely asks: multi-year discount, expanded training, SLA guarantees\n- Our leverage: they're on a timeline (Tableau renewal), we won the bake-off clearly\n- Risk: CIO could slow things if he hasn't been briefed\n\n**Suggested approach:** Ask Sarah if David has been briefed. Offer a 15-min CIO briefing focused on security architecture and vendor risk. Don't discount without getting multi-year or case study commitment.\n\n**Conversation starters:**\n1. \"How's the legal review going on the contract?\"\n2. \"Has David had a chance to review the security documentation we sent?\"\n3. \"If we can get this wrapped up by end of April, I can include the advanced training package.\"" },
      { q: "Build a stakeholder map for Apex Logistics", a: "**Stakeholder Map: Apex Logistics**\n*Deal: $142K — Technical Eval (POC week 2)*\n\n---\n\n**Decision Structure**\n\n```\n              [CEO - Frank Mercer]\n              Final authority on $100K+ purchases\n              STATUS: Not engaged ⚠️\n                      |\n        ┌─────────────┼─────────────┐\n        |             |             |\n  [COO - Diana    [CFO - TBD]   [CTO - Sam\n   Russo]         Budget          Weiss]\n  Your champion   approval        Tech sign-off\n  ENGAGED ✅      NOT MET ⚠️     ENGAGED ✅\n        |                          |\n  [Ops Director   [Head of Data -\n   - Maria Vega]   Chris Yoon]\n  End-user team    Running the POC\n  ENGAGED ✅      ENGAGED ✅\n```\n\n**Engagement Status:**\n🟢 **Strong:** Diana Russo (COO), Sam Weiss (CTO), Chris Yoon (Data), Maria Vega (Ops)\n🔴 **Critical gaps:** CFO (unknown name), CEO Frank Mercer\n\n**Risk assessment:** You have 4 stakeholders engaged — good. But the CFO and CEO are missing. For a $142K deal at a mid-market company, the CFO will need to approve and the CEO may want to sign off.\n\n**Action plan:**\n1. **This week:** Ask Diana for the CFO's name and role in procurement. Frame it as \"I want to make sure we have the ROI documentation ready for whoever handles vendor approval.\"\n2. **After POC results:** Request a joint readout with Diana + CFO. Lead with operational efficiency numbers.\n3. **CEO:** Likely doesn't need to be in meetings — just needs Diana or CFO to brief him. Prepare a 1-page executive summary.\n\n**Dynamics to watch:**\n- Diana (COO) and Sam (CTO) appear aligned — both want this\n- Chris Yoon's POC results will be the key internal evidence\n- Maria Vega's team is the end-user base — their adoption enthusiasm sells internally" },
      { q: "Prep me for the CloudNine demo on Thursday", a: "**Demo Prep: CloudNine SaaS**\n*Anya Patel, VP Revenue Ops — Demo Thursday*\n\n---\n\n**Company Context**\n- **What they do:** B2B SaaS platform for field service management\n- **Stage:** Series B, $28M raised, 200% YoY revenue growth\n- **Employees:** 85 (up from 30 last year)\n- **Current state:** No analytics platform — running on spreadsheets and basic Salesforce reports\n\n**Why they're looking:**\n- Anya was hired 4 months ago to build Revenue Ops function from scratch\n- Board is asking for better metrics: CAC, LTV, cohort analysis, churn prediction\n- Leadership can't get reliable pipeline or forecast numbers today\n- Growing too fast for spreadsheets — data is across Salesforce, Stripe, HubSpot, and Intercom\n\n**Demo strategy — tailor to these 3 things:**\n\n**1. Revenue Operations dashboard (15 min)**\n- Show the RevOps template: pipeline waterfall, forecast vs actual, rep performance\n- This is Anya's #1 job — make her look like a hero to her CEO\n- Connect Salesforce live if possible, or use the demo instance with similar data\n\n**2. Data unification (10 min)**\n- Show how we pull from Salesforce + Stripe + HubSpot in one view\n- This is their biggest pain — data is fragmented across 4 tools\n- Emphasize: no engineering required, Anya's team can set this up\n\n**3. Board-ready reporting (5 min)**\n- Show the investor metrics template: ARR, NRR, CAC payback, magic number\n- CloudNine's board is asking for this — it's a buying trigger\n\n**What NOT to demo:**\n- Heavy data engineering features (no data team yet)\n- Complex ML/AI models (too early for them)\n- Enterprise security features (not their concern at this stage)\n\n**Objection prep:**\n- \"We might hire a data analyst instead\" → Our platform + 1 analyst > 3 analysts without a platform\n- \"Can we start smaller?\" → Yes, our starter tier at $56K is built for this stage\n- \"What about Metabase/free tools?\" → They'll outgrow it in 6 months at their growth rate. Show the scaling story.\n\n**Close the demo with:** \"Based on what we've seen today, I'd love to set up a technical session with your Salesforce admin to map out the integration. Does next Tuesday work?\"" },
      { q: "What's happening at Meridian Insurance?", a: "**Account Intel: Meridian Insurance**\n*Deal: $88K — Proposal stage (sent 4/1, no reply in 8 days)*\n\n---\n\n**What we know:**\n- Tom Briggs (Director BI) has gone quiet since proposal delivery\n- Budget was confirmed at $90K — we're under at $88K\n- They're also evaluating Looker (according to Tom's LinkedIn activity — he liked a Looker post last week)\n- Tom's boss (VP Analytics, Sandra Wells) has NOT been engaged\n\n**Recent company news:**\n- Meridian announced Q1 earnings: missed revenue by 4% — stock down 8%\n- New Chief Data Officer hired last month: Raj Krishnan (previously at MetLife)\n- Company-wide \"data transformation\" initiative announced in their last all-hands\n\n**What this means for the deal:**\n- 🟡 **Budget risk:** Earnings miss could trigger spending scrutiny. But the new CDO initiative actually strengthens the strategic case.\n- 🔴 **Silence risk:** 8 days without reply on a proposal is a yellow flag. Tom may be socializing it internally, or he may be going cold.\n- 🟡 **New stakeholder:** Raj Krishnan (CDO) is a wildcard. He could accelerate this (new leader wants quick wins) or reset the evaluation.\n\n**Recommended actions:**\n1. **Today:** Send Tom a value-first follow-up (not \"just checking in\"). Lead with the new CDO angle — \"I saw Meridian brought on a Chief Data Officer. That's exciting. Our platform is built for exactly the kind of data transformation initiative he'll be driving.\"\n2. **This week:** Research Raj Krishnan on LinkedIn. If he came from MetLife, check if MetLife is a Benchmark Analytics customer.\n3. **If no response by Friday:** Ask Tom if Sandra Wells or Raj Krishnan should be included in the conversation.\n\n*Want me to draft that follow-up email?*" },
    ],
    fallback: "I'll research that for you. What kind of intel do you need?\n\n**Account Research:**\n- Company overview & strategic context\n- Stakeholder mapping & org chart\n- Recent news & trigger events\n- Technology stack intelligence\n\n**Deal Prep:**\n- Pre-meeting briefing package\n- Discovery question framework\n- Competitive landscape for the account\n- Objection handling prep\n\n**Market Research:**\n- Industry trends affecting your deals\n- Competitive intelligence\n- Pricing & positioning benchmarks\n\nName any of your 10 open deals and I'll pull together a comprehensive brief.",
  },
  email: {
    defaults: [
      { q: "Write a follow-up to Tom Briggs at Meridian — he's gone dark", a: "**Subject: Meridian's new CDO + a thought on your analytics roadmap**\n\nHi Tom,\n\nI saw Meridian brought on Raj Krishnan as Chief Data Officer — that's a strong hire. Having led data strategy at MetLife, he'll likely be pushing for quick wins on the analytics front.\n\nI mention this because the proposal I sent positions Benchmark Analytics as exactly the kind of platform a new CDO wants in place: enterprise-grade analytics with fast time-to-value (6-8 weeks to live dashboards vs months for traditional BI).\n\nTwo data points that might help as you socialize this internally:\n\n1. **Insurance customers on our platform see 35% reduction in reporting cycle time** — that's meaningful for regulatory and actuarial reporting\n2. **No per-seat licensing** — so Raj can roll this out across the data org without budget per-head concerns\n\nWould it be helpful to include Raj or Sandra in a brief overview call? I'm happy to tailor the conversation to whatever's most useful right now.\n\nBest,\nJordan\n\n---\n\n**Why this works:**\n- Leads with a relevant trigger event (CDO hire), not \"checking in\"\n- Positions our platform in the context of the CDO's priorities\n- Offers a path to multi-thread (Raj, Sandra) without being pushy\n- Two concrete data points give Tom ammunition for internal conversations\n\n**Send time:** Tuesday 8:15 AM (Tom's timezone)\n**If no reply by Thursday:** Connect with Tom on LinkedIn, comment on something relevant, then follow up via InMail" },
      { q: "Draft a meeting recap for the Diana Russo POC review", a: "**Subject: Apex Logistics POC Review — Week 2 Results & Next Steps**\n\nHi Diana,\n\nThank you for the productive review today. Here's a summary of where the POC stands and what's next.\n\n---\n\n**POC Results — Week 2 of 3**\n\n| Metric | Target | Actual | Status |\n|---|---|---|---|\n| Data sources connected | 6 | 6 | ✅ Complete |\n| Dashboard load time | <3 sec | 1.8 sec | ✅ Exceeding |\n| Fleet utilization model | Working | Working | ✅ Live |\n| Route optimization alerts | Configured | Configured | ✅ Live |\n| Warehouse throughput tracking | 14 locations | 11 of 14 | 🟡 In progress |\n| User adoption (pilot group) | 20 users | 24 active | ✅ Exceeding |\n\n**Key Wins:**\n- Chris Yoon's team reported the fleet utilization dashboard is \"already better than what we had\" — and it's only week 2\n- Maria Vega's ops team proactively added 4 users beyond the original pilot group\n- Real-time SLA breach alerts caught 3 delivery exceptions that would have been missed\n\n**Open Items:**\n- 3 remaining warehouse locations need data connector configuration (Chris's team to complete by Friday)\n- Security review with Sam Weiss: scheduled for Monday 4/14\n- One API rate limit issue with your WMS — our engineering team is working on a fix (ETA: Thursday)\n\n**Agreed Next Steps:**\n| Action | Owner | Due |\n|---|---|---|\n| Complete remaining 3 warehouse connections | Chris Yoon | 4/11 |\n| Security architecture review | Sam Weiss + our SE | 4/14 |\n| Final POC readout presentation | Jordan (me) | 4/18 |\n| Business case / ROI summary for leadership | Jordan (me) | 4/18 |\n\nPlease let me know if I've missed anything. Looking forward to the final readout.\n\nBest,\nJordan\n\n---\n*Formatted for both email and CRM logging. Want me to also draft the ROI summary for the 4/18 readout?*" },
      { q: "Create a re-engagement sequence for James Okafor at PeakView", a: "**Re-engagement Sequence: James Okafor — PeakView Partners**\n*$110K deal — Stalled 18 days, was in Negotiation*\n\n---\n\n**Email 1: Value-first + graceful pressure (Send: Tomorrow)**\n\nSubject: PeakView analytics — one thing before I close this out\n\nHi James,\n\nI know things can shift quickly at PeakView — especially if there are organizational changes underway. I don't want to keep pinging you if the timing isn't right.\n\nBefore I pause outreach, I wanted to share one thing: we just completed a deployment for a PE firm managing $3B AUM (similar to PeakView's profile). Their portfolio analytics went from 2-week reporting cycles to real-time dashboards in 5 weeks. Happy to share the details if useful.\n\nIf the timing has changed, no hard feelings at all — just let me know and I'll follow up when it makes sense.\n\nBest,\nJordan\n\n---\n\n**Email 2: New angle, 10 days later (only if no reply)**\n\nSubject: Quick question about PeakView's reporting timeline\n\nHi James,\n\nI had a thought — if PeakView's Q2 LP reporting is coming up, our platform could have your portfolio dashboards live before the deadline. We've done it in under 4 weeks for similar firms.\n\nWorth a 15-minute call to see if the timeline works?\n\nJordan\n\n---\n\n**Email 3: Go-around attempt, 2 weeks later (only if no reply)**\n\nSubject: Analytics platform for PeakView Partners\n\nHi [James's colleague — needs research],\n\nI've been working with James on an analytics initiative for PeakView. I understand priorities may have shifted, and I want to make sure the evaluation materials and proposal we prepared are with the right people.\n\nWould you be the right person to connect with on this, or can you point me in the right direction?\n\nBest,\nJordan\n\n---\n\n**Sequence strategy:**\n- Email 1: Breakup email pattern — reduces pressure, often triggers a response\n- Email 2: LP reporting deadline as new urgency lever\n- Email 3: Go around if James is truly gone (reorg rumor)\n- If all 3 fail: mark Closed Lost, set 90-day follow-up reminder\n\n**Note:** Your data shows value-first emails get 38% reply rate vs 12% for check-ins. All 3 emails lead with value." },
      { q: "Draft an internal deal update for my manager", a: "**Subject: Q2 Pipeline Update — Jordan Reeves (Week of 4/7)**\n\nHi [Manager],\n\nQuick update on my key deals and Q2 forecast.\n\n---\n\n**Forecast Summary**\n- Closed: $312K (33% of $950K quota)\n- Commit: $580K (includes Ridgeline + Helios + Meridian)\n- Best case: $780K (adds Apex + Greenlight)\n- Gap to quota: $170K on commit, covered if best case lands\n\n**Deals to Watch:**\n\n🟢 **Ridgeline Capital — $128K (Negotiation)**\nContract with legal. Champion active. Expect signed by 4/18. Only risk: CIO hasn't been briefed yet — working to get a 15-min security review on his calendar.\n\n🟡 **Helios Health — $95K (Proposal, RFP due 4/12)**\nRFP response nearly final. We passed their technical eval. Main competition is Looker. Our edge: healthcare compliance, no per-seat pricing, embedded AI. Confident but competitive.\n\n🟡 **Apex Logistics — $142K (Tech Eval, POC week 2)**\nPOC going very well — exceeding all benchmarks. 4 stakeholders engaged. Need to get CFO involved before final readout on 4/18. Big deal if we land it.\n\n🔴 **PeakView Partners — $110K (Stalled)**\nJames Okafor went dark 18 days ago. Was in Negotiation. Sending breakup email tomorrow. Internal reorg may be the cause. May need to downgrade from commit.\n\n🔴 **Meridian Insurance — $88K (Proposal, no reply 8d)**\nTom Briggs hasn't responded to proposal. New CDO hired — could be opportunity or reset. Sending follow-up today using CDO hire as conversation hook.\n\n**Help needed:**\n- Can you intro me to anyone at Helios? Their CTO (Marcus Webb) would respond well to a peer-level touch.\n- Should I downgrade PeakView from commit to best case? I want the forecast to be accurate.\n\n---\nJordan" },
    ],
    fallback: "I'll draft that for you. What type of content?\n\n**Follow-up emails:**\n- Post-meeting follow-up with next steps\n- Proposal follow-up (no response)\n- Re-engagement for stalled deals\n- Multi-thread introduction emails\n\n**Meeting recaps:**\n- Discovery call summary\n- POC / technical review recap\n- Executive meeting notes\n- Demo follow-up with key takeaways\n\n**Sequences:**\n- Multi-touch outreach\n- Re-engagement campaigns\n- Nurture sequences\n\n**Internal:**\n- Deal updates for manager\n- Win/loss reports\n- Forecast narratives\n\nName the deal and scenario — I'll draft something ready to send.",
  },
};

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  const c = { success: { bg: "#E1F5EE", c: "#0F6E56", b: "#C2EDD8" }, info: { bg: "#E6F1FB", c: "#185FA5", b: "#C7DEF7" } }[type] || { bg: "#E6F1FB", c: "#185FA5", b: "#C7DEF7" };
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, background: c.bg, color: c.c, border: `1px solid ${c.b}`, borderRadius: 10, padding: "12px 20px", fontSize: 13, fontWeight: 500, zIndex: 9999, boxShadow: "0 4px 20px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", gap: 8, animation: "slideUp 0.3s ease" }}>
      {type === "success" ? "✓" : "ℹ"} {message}
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: c.c, marginLeft: 8 }}>×</button>
    </div>
  );
}

function PriorityDot({ p }) {
  return <span style={{ width: 6, height: 6, borderRadius: "50%", background: { critical: "#E24B4A", high: "#EF9F27", medium: "#85B7EB" }[p] || "#B4B2A9", display: "inline-block", flexShrink: 0 }} />;
}

function ProbBadge({ v }) {
  const c = v >= 60 ? { bg: "#E1F5EE", c: "#0F6E56" } : v >= 35 ? { bg: "#FAEEDA", c: "#854F0B" } : { bg: "#FCEBEB", c: "#A32D2D" };
  return <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 5, background: c.bg, color: c.c, fontWeight: 600 }}>{v}%</span>;
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

export default function AECockpit() {
  const load = (k, d) => { try { const v = localStorage.getItem(`ba-ae-${k}`); return v ? JSON.parse(v) : d; } catch { return d; } };

  const [activeAgent, setActiveAgent] = useState(load("activeAgent", null));
  const [agentChats, setAgentChats] = useState(load("agentChats", {}));
  const [agentInput, setAgentInput] = useState("");
  const [agentLoading, setAgentLoading] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState(null);
  const [pipelineFilter, setPipelineFilter] = useState("all");
  const agentEndRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => { localStorage.setItem("ba-ae-activeAgent", JSON.stringify(activeAgent)); }, [activeAgent]);
  useEffect(() => { localStorage.setItem("ba-ae-agentChats", JSON.stringify(agentChats)); }, [agentChats]);
  useEffect(() => { agentEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [agentChats, agentLoading]);

  useEffect(() => {
    const h = (e) => {
      if (e.metaKey && e.key === "k") { e.preventDefault(); setSearchOpen(o => !o); setTimeout(() => searchRef.current?.focus(), 50); }
      if (e.key === "Escape") { setSearchOpen(false); setSearchQuery(""); }
      if (e.metaKey && e.key === "1") { e.preventDefault(); setActiveAgent("rfp"); }
      if (e.metaKey && e.key === "2") { e.preventDefault(); setActiveAgent("research"); }
      if (e.metaKey && e.key === "3") { e.preventDefault(); setActiveAgent("email"); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const showToast = (m, t = "success") => setToast({ message: m, type: t });
  const copyToClipboard = (t) => { navigator.clipboard.writeText(t.replace(/\*\*/g, "")); showToast("Copied to clipboard"); };

  const agents = [
    { id: "rfp", name: "RFP & Response Support", icon: "📋", desc: "Draft and refine responses with AI-assisted research and formatting", color: "#534AB7", bg: "#F5F4FE", border: "#DDDAFC" },
    { id: "research", name: "Account & Deal Research", icon: "🔍", desc: "Surface relevant context for opportunities, accounts, and deal preparation", color: "#185FA5", bg: "#F0F6FE", border: "#C7DEF7" },
    { id: "email", name: "Email & Recap Generation", icon: "✉️", desc: "Draft follow-up emails and meeting recaps for rep review and send", color: "#0F6E56", bg: "#EEFBF5", border: "#C2EDD8" },
  ];

  const currentAgent = agents.find(a => a.id === activeAgent);
  const currentResponses = activeAgent ? AGENT_RESPONSES[activeAgent] : null;
  const currentPrompts = currentResponses?.defaults?.map(d => d.q) || [];
  const currentChat = agentChats[activeAgent] || [];

  const handleAgentChat = useCallback((text) => {
    const q = text || agentInput;
    if (!q.trim() || !activeAgent) return;
    setAgentChats(prev => ({ ...prev, [activeAgent]: [...(prev[activeAgent] || []), { from: "user", text: q }] }));
    setAgentInput("");
    setAgentLoading(true);
    setTimeout(() => {
      const responses = AGENT_RESPONSES[activeAgent];
      const match = responses?.defaults?.find(d => d.q === q);
      const reply = match ? match.a : responses?.fallback || "I'll work on that. Can you give me a bit more context about which deal this is for?";
      setAgentChats(prev => ({ ...prev, [activeAgent]: [...(prev[activeAgent] || []), { from: "agent", text: reply }] }));
      setAgentLoading(false);
    }, 900 + Math.random() * 700);
  }, [agentInput, activeAgent]);

  const renderText = (text) => {
    if (!text) return null;
    return text.split("\n").map((line, i) => (
      <span key={i}>{i > 0 && <br />}{line.split("**").map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}</span>
    ));
  };

  const pctQuota = Math.round((REP.closed / REP.quota) * 100);
  const gap = REP.quota - REP.closed;
  const filteredDeals = pipelineFilter === "all" ? DEALS : DEALS.filter(d => pipelineFilter === "at-risk" ? d.probability < 25 || d.stage === "Stalled" : d.stage === pipelineFilter);
  const sl = selectedDeal ? DEALS.find(d => d.id === selectedDeal) : null;

  const searchResults = searchQuery.trim() ? DEALS.filter(d => {
    const q = searchQuery.toLowerCase();
    return d.name.toLowerCase().includes(q) || d.company.toLowerCase().includes(q) || d.stage.toLowerCase().includes(q);
  }) : [];

  return (
    <div style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif", background: "#FAFAF8", minHeight: "100vh" }}>
      <style>{`@keyframes slideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}@keyframes pulse{0%,100%{opacity:.3}50%{opacity:1}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}`}</style>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Search */}
      {searchOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 9998, display: "flex", justifyContent: "center", paddingTop: 100 }} onClick={() => { setSearchOpen(false); setSearchQuery(""); }}>
          <div style={{ width: 540, background: "#fff", borderRadius: 14, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", overflow: "hidden", maxHeight: 460, animation: "fadeIn 0.15s ease" }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid #eee", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ color: "#888" }}>&#128269;</span>
              <input ref={searchRef} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search deals, contacts, companies..." autoFocus style={{ flex: 1, fontSize: 15, border: "none", outline: "none" }} />
              <kbd style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "#f0efe9", color: "#888", border: "1px solid #ddd" }}>ESC</kbd>
            </div>
            <div style={{ maxHeight: 360, overflowY: "auto", padding: "6px 0" }}>
              {searchQuery.trim() && searchResults.length === 0 && <p style={{ padding: 20, textAlign: "center", color: "#888", fontSize: 13 }}>No results</p>}
              {searchResults.map(d => (
                <div key={d.id} onClick={() => { setSelectedDeal(d.id); setSearchOpen(false); setSearchQuery(""); }} style={{ padding: "10px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #f5f5f2" }} onMouseOver={e => e.currentTarget.style.background = "#f7f6f3"} onMouseOut={e => e.currentTarget.style.background = ""}>
                  <PriorityDot p={d.priority} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 500, fontSize: 13 }}>{d.name}</span>
                    <span style={{ fontSize: 11, color: "#888", marginLeft: 8 }}>{d.company} · ${(d.amount/1000).toFixed(0)}K</span>
                  </div>
                  <ProbBadge v={d.probability} />
                </div>
              ))}
              {!searchQuery.trim() && DEALS.slice(0, 5).map(d => (
                <div key={d.id} onClick={() => { setSelectedDeal(d.id); setSearchOpen(false); }} style={{ padding: "8px 18px", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 8 }} onMouseOver={e => e.currentTarget.style.background = "#f7f6f3"} onMouseOut={e => e.currentTarget.style.background = ""}>
                  <PriorityDot p={d.priority} />{d.name} — {d.company}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ TOP NAV ═══ */}
      <div style={{ background: "#fff", borderBottom: "1px solid #eee", padding: "0 20px", display: "flex", alignItems: "center", height: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 24 }}>
          <div style={{ width: 22, height: 22, borderRadius: 5, background: "linear-gradient(135deg, #534AB7, #185FA5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>BA</span>
          </div>
          <span style={{ fontWeight: 600, fontSize: 15, letterSpacing: -0.3 }}>Benchmark Analytics</span>
          <span style={{ fontSize: 12, color: "#888", marginLeft: 4 }}>AE Cockpit</span>
        </div>

        {/* Agent tabs */}
        <div style={{ display: "flex", gap: 2, marginLeft: 8 }}>
          {agents.map((a, i) => (
            <button key={a.id} onClick={() => setActiveAgent(activeAgent === a.id ? null : a.id)} style={{ fontSize: 12, padding: "6px 14px", borderRadius: 6, background: activeAgent === a.id ? a.bg : "transparent", color: activeAgent === a.id ? a.color : "#888", border: activeAgent === a.id ? `1px solid ${a.border}` : "1px solid transparent", cursor: "pointer", fontWeight: activeAgent === a.id ? 500 : 400, display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ fontSize: 13 }}>{a.icon}</span> {a.name}
              <kbd style={{ fontSize: 9, padding: "1px 4px", borderRadius: 3, background: "#f0efe9", color: "#999", border: "1px solid #e8e7e3" }}>⌘{i + 1}</kbd>
            </button>
          ))}
        </div>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => { setSearchOpen(true); setTimeout(() => searchRef.current?.focus(), 50); }} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 6, background: "#f7f6f3", color: "#888", border: "1px solid #e0e0e0", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
            &#128269; <kbd style={{ fontSize: 9, padding: "1px 4px", borderRadius: 3, background: "#e8e7e3", border: "1px solid #ddd" }}>⌘K</kbd>
          </button>
          <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: pctQuota >= 70 ? "#E1F5EE" : "#FAEEDA", color: pctQuota >= 70 ? "#0F6E56" : "#854F0B", fontWeight: 500 }}>{pctQuota}% to quota</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#E6F1FB", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 10, color: "#185FA5" }}>JR</div>
            <span style={{ fontSize: 12, fontWeight: 500 }}>Jordan Reeves</span>
          </div>
        </div>
      </div>

      {/* ═══ MAIN LAYOUT ═══ */}
      <div style={{ display: "flex", height: "calc(100vh - 50px)" }}>

        {/* ─── LEFT: Pipeline ─── */}
        <div style={{ width: activeAgent ? 360 : "100%", flexShrink: 0, borderRight: activeAgent ? "1px solid #eee" : "none", background: "#fff", display: "flex", flexDirection: "column", overflow: "hidden", transition: "width 0.2s ease" }}>
          {/* Metrics */}
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #eee", display: "grid", gridTemplateColumns: activeAgent ? "1fr 1fr 1fr" : "1fr 1fr 1fr 1fr 1fr 1fr", gap: 10 }}>
            {[
              { l: "Closed", v: `$${(REP.closed/1000).toFixed(0)}K`, s: `${pctQuota}% of $${(REP.quota/1000).toFixed(0)}K`, c: pctQuota >= 70 ? "#0F6E56" : "#BA7517" },
              { l: "Pipeline", v: `$${(REP.pipeline/1000000).toFixed(1)}M`, s: `${REP.coverage}x coverage`, c: REP.coverage >= 3 ? "#0F6E56" : "#BA7517" },
              { l: "Forecast", v: `$${(REP.forecastCommit/1000).toFixed(0)}K`, s: "commit", c: "#888" },
              ...(!activeAgent ? [
                { l: "Win Rate", v: `${REP.winRate}%`, s: "vs 28% team", c: "#0F6E56" },
                { l: "Avg Deal", v: `$${(REP.avgDealSize/1000).toFixed(0)}K`, s: "vs $55K team", c: "#0F6E56" },
                { l: "Cycle", v: `${REP.avgCycle}d`, s: "vs 52d team", c: "#0F6E56" },
              ] : []),
            ].map((m, i) => (
              <div key={i} style={{ padding: activeAgent ? "6px 0" : "8px 0" }}>
                <p style={{ fontSize: 9, color: "#888", margin: 0, textTransform: "uppercase", letterSpacing: 0.5 }}>{m.l}</p>
                <p style={{ fontSize: activeAgent ? 16 : 20, fontWeight: 600, margin: "2px 0 0", letterSpacing: -0.3 }}>{m.v}</p>
                <p style={{ fontSize: 10, color: m.c, margin: 0 }}>{m.s}</p>
              </div>
            ))}
          </div>

          {/* Pipeline filter */}
          <div style={{ padding: "8px 16px", borderBottom: "1px solid #eee", display: "flex", gap: 4, flexWrap: "wrap" }}>
            {[{ id: "all", l: "All deals" }, { id: "at-risk", l: "At risk" }, ...STAGES.map(s => ({ id: s, l: s }))].map(f => (
              <button key={f.id} onClick={() => { setPipelineFilter(f.id); setSelectedDeal(null); }} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 4, background: pipelineFilter === f.id ? "#1a1a1a" : "transparent", color: pipelineFilter === f.id ? "#fff" : "#888", border: pipelineFilter === f.id ? "none" : "1px solid #e8e7e3", cursor: "pointer" }}>{f.l}</button>
            ))}
          </div>

          {/* Deal list + detail */}
          <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
            <div style={{ width: sl && !activeAgent ? "50%" : "100%", overflowY: "auto", borderRight: sl && !activeAgent ? "1px solid #eee" : "none" }}>
              {filteredDeals.map(d => (
                <div key={d.id} onClick={() => setSelectedDeal(selectedDeal === d.id ? null : d.id)} style={{ padding: "10px 16px", borderBottom: "1px solid #f5f5f2", cursor: "pointer", background: selectedDeal === d.id ? "#f7f6f3" : "#fff", borderLeft: `3px solid ${STAGE_COLORS[d.stage] || "#B4B2A9"}`, transition: "background 0.1s" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <PriorityDot p={d.priority} />
                    <span style={{ fontWeight: 500, fontSize: 13, flex: 1 }}>{d.name}</span>
                    <ProbBadge v={d.probability} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3, marginLeft: 12 }}>
                    <span style={{ fontSize: 11, color: "#555" }}>{d.company}</span>
                    <span style={{ fontSize: 11, color: "#888" }}>${(d.amount/1000).toFixed(0)}K</span>
                    <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 3, background: STAGE_COLORS[d.stage] + "20", color: STAGE_COLORS[d.stage] }}>{d.stage}</span>
                    <span style={{ fontSize: 10, color: "#aaa", marginLeft: "auto" }}>{d.lastActivity}</span>
                  </div>
                  {!activeAgent && (
                    <div style={{ display: "flex", gap: 4, marginTop: 4, marginLeft: 12, flexWrap: "wrap" }}>
                      {d.signals.slice(0, 2).map((s, i) => (
                        <span key={i} style={{ fontSize: 9, padding: "1px 6px", borderRadius: 3, background: "#f0efe9", color: "#666" }}>{s}</span>
                      ))}
                      {d.signals.length > 2 && <span style={{ fontSize: 9, color: "#aaa" }}>+{d.signals.length - 2}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Deal detail panel (when no agent is active) */}
            {sl && !activeAgent && (
              <div style={{ width: "50%", overflowY: "auto", padding: 20, animation: "fadeIn 0.15s ease" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#E6F1FB", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 12, color: "#185FA5" }}>{sl.name.split(" ").map(n => n[0]).join("")}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>{sl.name}</p>
                    <p style={{ fontSize: 12, color: "#888", margin: 0 }}>{sl.role} — {sl.company}</p>
                  </div>
                  <ProbBadge v={sl.probability} />
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                  <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 5, background: "#f0efe9", color: "#555" }}>${(sl.amount/1000).toFixed(0)}K</span>
                  <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 5, background: STAGE_COLORS[sl.stage] + "20", color: STAGE_COLORS[sl.stage] }}>{sl.stage}</span>
                  <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 5, background: "#f0efe9", color: "#555" }}>Close {sl.closeDate}</span>
                  <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 5, background: "#f0efe9", color: "#888" }}>Last: {sl.lastActivity}</span>
                </div>
                <p style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 500, margin: "0 0 6px" }}>Signals</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 16 }}>
                  {sl.signals.map((s, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.toLowerCase().includes("risk") || s.toLowerCase().includes("no ") || s.toLowerCase().includes("stall") || s.toLowerCase().includes("competitor") ? "#E24B4A" : s.toLowerCase().includes("approved") || s.toLowerCase().includes("active") || s.toLowerCase().includes("passed") || s.toLowerCase().includes("engaged") ? "#1D9E75" : "#EF9F27", display: "inline-block" }} />
                      <span style={{ fontSize: 12 }}>{s}</span>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 500, margin: "0 0 8px" }}>Quick actions with Claude</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {[
                    { agent: "research", label: `Research ${sl.company}`, prompt: `Research ${sl.company} for my ${sl.stage.toLowerCase()} call` },
                    { agent: "email", label: `Draft follow-up to ${sl.name.split(" ")[0]}`, prompt: `Write a follow-up email to ${sl.name} at ${sl.company}` },
                    { agent: "rfp", label: `Draft proposal content for ${sl.company}`, prompt: `Build a proposal section for the ${sl.company} deal ($${(sl.amount/1000).toFixed(0)}K, ${sl.stage})` },
                  ].map((action, i) => (
                    <button key={i} onClick={() => { setActiveAgent(action.agent); setTimeout(() => handleAgentChat(action.prompt), 100); }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 6, background: agents.find(a => a.id === action.agent).bg, color: agents.find(a => a.id === action.agent).color, border: `1px solid ${agents.find(a => a.id === action.agent).border}`, cursor: "pointer", fontSize: 12, textAlign: "left" }}>
                      <span>{agents.find(a => a.id === action.agent).icon}</span>
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ─── RIGHT: Agent Panel ─── */}
        {activeAgent && currentAgent && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", animation: "fadeIn 0.15s ease" }}>
            {/* Agent header */}
            <div style={{ padding: "10px 16px", borderBottom: "1px solid #eee", background: currentAgent.bg, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 18 }}>{currentAgent.icon}</span>
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 600, fontSize: 13, color: currentAgent.color }}>{currentAgent.name}</span>
                <span style={{ fontSize: 11, color: "#888", marginLeft: 8 }}>{currentAgent.desc}</span>
              </div>
              <button onClick={() => { setAgentChats(prev => ({ ...prev, [activeAgent]: [] })); showToast("Cleared", "info"); }} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 4, background: "transparent", color: "#888", border: "1px solid #e0e0e0", cursor: "pointer" }}>Clear</button>
              <button onClick={() => setActiveAgent(null)} style={{ fontSize: 13, padding: "3px 10px", borderRadius: 4, background: "transparent", color: "#888", border: "1px solid #e0e0e0", cursor: "pointer" }}>×</button>
            </div>

            {/* Chat area */}
            <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
              {currentChat.length === 0 && (
                <div style={{ textAlign: "center", padding: "30px 20px" }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>{currentAgent.icon}</div>
                  <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 4px" }}>{currentAgent.name}</p>
                  <p style={{ fontSize: 12, color: "#888", margin: "0 0 16px" }}>{currentAgent.desc}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: 500, margin: "0 auto" }}>
                    {currentPrompts.map((p, i) => (
                      <button key={i} onClick={() => handleAgentChat(p)} style={{ textAlign: "left", fontSize: 12, padding: "10px 14px", borderRadius: 8, background: currentAgent.bg, color: "#333", border: `1px solid ${currentAgent.border}`, cursor: "pointer", lineHeight: 1.4 }}>{p}</button>
                    ))}
                  </div>
                </div>
              )}
              {currentChat.map((m, i) => (
                <div key={i} style={{ alignSelf: m.from === "user" ? "flex-end" : "flex-start", maxWidth: "80%" }}>
                  <div style={{ background: m.from === "user" ? "#E6F1FB" : currentAgent.bg, borderRadius: m.from === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px", padding: "12px 16px", border: m.from === "user" ? "none" : `1px solid ${currentAgent.border}` }}>
                    <p style={{ fontSize: 12, lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>{renderText(m.text)}</p>
                  </div>
                  {m.from === "agent" && (
                    <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                      <button onClick={() => copyToClipboard(m.text)} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: "#f7f6f3", color: "#888", border: "1px solid #e0e0e0", cursor: "pointer" }}>Copy</button>
                      <button onClick={() => showToast("Sent to email draft")} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: "#f7f6f3", color: "#888", border: "1px solid #e0e0e0", cursor: "pointer" }}>Email</button>
                      <button onClick={() => showToast("Exported to docs", "info")} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: "#f7f6f3", color: "#888", border: "1px solid #e0e0e0", cursor: "pointer" }}>Export</button>
                    </div>
                  )}
                </div>
              ))}
              {agentLoading && (
                <div style={{ alignSelf: "flex-start", background: currentAgent.bg, borderRadius: "12px 12px 12px 2px", padding: "12px 16px", border: `1px solid ${currentAgent.border}` }}>
                  <div style={{ display: "flex", gap: 4 }}>{[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: currentAgent.color, animation: `pulse 1s ${i*0.2}s infinite` }} />)}</div>
                </div>
              )}
              <div ref={agentEndRef} />
            </div>

            {/* Suggested prompts strip */}
            {currentChat.length > 0 && (
              <div style={{ padding: "6px 16px", borderTop: "1px solid #f0efe9", display: "flex", gap: 4, overflowX: "auto" }}>
                {currentPrompts.filter(p => !currentChat.some(m => m.text === p)).slice(0, 3).map((p, i) => (
                  <button key={i} onClick={() => handleAgentChat(p)} style={{ fontSize: 10, padding: "4px 10px", borderRadius: 5, background: currentAgent.bg, color: currentAgent.color, border: `1px solid ${currentAgent.border}`, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>{p.length > 50 ? p.slice(0, 50) + "..." : p}</button>
                ))}
              </div>
            )}

            {/* Input */}
            <div style={{ padding: "12px 16px", borderTop: "1px solid #eee", background: "#FAFAF8" }}>
              <div style={{ display: "flex", gap: 8 }}>
                <input value={agentInput} onChange={e => setAgentInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAgentChat()} placeholder={`Ask ${currentAgent.name}...`} style={{ flex: 1, fontSize: 13, padding: "10px 14px", borderRadius: 8, border: "1px solid #ddd", outline: "none", background: "#fff" }} />
                <button onClick={() => handleAgentChat()} style={{ fontSize: 13, padding: "10px 18px", borderRadius: 8, background: "#1a1a1a", color: "#fff", border: "none", cursor: "pointer", fontWeight: 500 }}>Send</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
