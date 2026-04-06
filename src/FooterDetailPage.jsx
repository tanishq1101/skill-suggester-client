import React from "react";
import "./FooterDetailPage.css";

const FOOTER_PAGE_CONTENT = {
  "skill-analyzer": {
    group: "Product",
    title: "Skill Analyzer",
    intro:
      "Skill Analyzer compares your current profile with live market expectations and shows exactly where your strengths and gaps are for your target role.",
    highlightsTitle: "Core Capabilities",
    highlights: [
      "Role-aware matching across technical, domain, and collaboration skills.",
      "Priority-based gap scoring so you know what to learn first.",
      "Evidence-backed recommendations mapped to current hiring demand.",
      "Progress checkpoints to track readiness over time.",
    ],
    detailsTitle: "What You Can Do Here",
    details: [
      "Run personalized analyses for any supported role and industry.",
      "Identify missing must-have skills versus optional skills.",
      "Bookmark critical skills and build a focused study queue.",
      "Export summaries to share with mentors, managers, or recruiters.",
    ],
  },
  "salary-benchmarks": {
    group: "Product",
    title: "Salary Benchmarks",
    intro:
      "Salary Benchmarks gives you transparent compensation bands by role, skill depth, and market demand so you can negotiate with confidence.",
    highlightsTitle: "Core Capabilities",
    highlights: [
      "Min, median, and max salary views for role comparisons.",
      "Compensation trend snapshots aligned with demand levels.",
      "Region and specialization-aware salary interpretation.",
      "Context indicators for growth potential and volatility.",
    ],
    detailsTitle: "What You Can Do Here",
    details: [
      "Compare two roles side-by-side before making a career move.",
      "Set realistic compensation targets for interviews and promotions.",
      "Understand how specific skills impact earning potential.",
      "Use trend signals to time role switches strategically.",
    ],
  },
  "career-roadmaps": {
    group: "Product",
    title: "Career Roadmaps",
    intro:
      "Career Roadmaps breaks long-term growth into practical milestones so you always know the next best step for your chosen path.",
    highlightsTitle: "Core Capabilities",
    highlights: [
      "Stage-based plans for beginner, intermediate, and advanced levels.",
      "Skill sequencing to avoid learning topics in the wrong order.",
      "Suggested certifications and portfolio milestones.",
      "Company hiring alignment for each stage of progression.",
    ],
    detailsTitle: "What You Can Do Here",
    details: [
      "Follow a guided path tailored to your target specialization.",
      "Review milestone checklists before moving to advanced topics.",
      "Align learning outcomes with employer expectations.",
      "Track skill completion and readiness for next-step roles.",
    ],
  },
  "market-trends": {
    group: "Product",
    title: "Market Trends",
    intro:
      "Market Trends keeps you ahead with concise demand signals so you can prioritize the right skills before they become mandatory.",
    highlightsTitle: "Core Capabilities",
    highlights: [
      "Emerging-skill detection with hot-topic indicators.",
      "Industry-level demand and growth movement tracking.",
      "Trend summaries designed for fast decision making.",
      "Forward-looking insights for planning next quarter goals.",
    ],
    detailsTitle: "What You Can Do Here",
    details: [
      "Monitor in-demand capabilities as the market shifts.",
      "Adjust your roadmap based on high-impact trends.",
      "Use trend snapshots in team planning or mentoring sessions.",
      "Spot early opportunities before the market saturates.",
    ],
  },
  blog: {
    group: "Resources",
    title: "Blog",
    intro:
      "The Zync Blog shares practical insights on careers, hiring, and technology so you can make better, faster career decisions.",
    highlightsTitle: "What You Will Find",
    highlights: [
      "Weekly articles on role transitions, salary strategy, and upskilling.",
      "Deep dives into fast-growing domains and hiring behaviors.",
      "Practical guides with examples, templates, and checklists.",
      "Opinion pieces from practitioners and industry contributors.",
    ],
    detailsTitle: "How To Use It",
    details: [
      "Read topic clusters by role, industry, or career stage.",
      "Save relevant articles for your current roadmap.",
      "Turn article checklists into weekly action plans.",
      "Use summaries to prepare for interviews and appraisals.",
    ],
  },
  "api-documentation": {
    group: "Resources",
    title: "API Documentation",
    intro:
      "API Documentation helps product and engineering teams integrate Zync intelligence into internal tools and customer-facing experiences.",
    highlightsTitle: "What You Will Find",
    highlights: [
      "Endpoint references for analysis, trends, and recommendation data.",
      "Request and response examples for quick integration.",
      "Authentication patterns and environment setup notes.",
      "Error handling, rate limits, and reliability guidelines.",
    ],
    detailsTitle: "How To Use It",
    details: [
      "Start with authentication, then test core endpoints.",
      "Validate payload formats with sample requests.",
      "Use staging flows before production rollout.",
      "Implement retries and fallback handling for resilient UX.",
    ],
  },
  "community-forum": {
    group: "Resources",
    title: "Community Forum",
    intro:
      "Community Forum is a peer space where professionals exchange guidance, share roadmaps, and collaborate on growth strategies.",
    highlightsTitle: "What You Will Find",
    highlights: [
      "Role-specific discussion threads and live Q&A topics.",
      "Peer-reviewed study paths and resource recommendations.",
      "Career transition stories with actionable lessons.",
      "Community events focused on skills and market signals.",
    ],
    detailsTitle: "How To Use It",
    details: [
      "Join role channels aligned with your target path.",
      "Post your roadmap and request improvement feedback.",
      "Contribute insights from your interview or project experience.",
      "Follow expert threads to stay current with best practices.",
    ],
  },
  "help-center": {
    group: "Resources",
    title: "Help Center",
    intro:
      "Help Center provides practical onboarding guides and troubleshooting references so you can get value from Zync quickly.",
    highlightsTitle: "What You Will Find",
    highlights: [
      "Step-by-step setup guides for first-time users.",
      "Troubleshooting articles for common issues and fixes.",
      "FAQ entries covering features, billing, and workflows.",
      "Best-practice walkthroughs for better analysis outcomes.",
    ],
    detailsTitle: "How To Use It",
    details: [
      "Start with the quick setup checklist.",
      "Use the troubleshooting guides before contacting support.",
      "Review best-practice docs to improve result quality.",
      "Share Help Center links with teams for smooth onboarding.",
    ],
  },
  "about-us": {
    group: "Company",
    title: "About Us",
    intro:
      "Zync was built to make career intelligence more practical, transparent, and actionable for professionals and teams.",
    highlightsTitle: "Who We Are",
    highlights: [
      "Mission-driven team focused on AI-enabled career growth.",
      "Cross-functional experts in talent strategy and data systems.",
      "Product philosophy centered on clarity and measurable outcomes.",
      "Continuous collaboration with users to refine guidance quality.",
    ],
    detailsTitle: "What We Value",
    details: [
      "Trust through clear recommendations and transparent logic.",
      "Practical advice over generic one-size-fits-all content.",
      "Inclusive opportunity mapping for diverse career backgrounds.",
      "Responsible data use and privacy-by-design principles.",
    ],
  },
  careers: {
    group: "Company",
    title: "Careers",
    intro:
      "Careers at Zync are for builders who care about meaningful impact, fast learning, and shaping the future of career decision intelligence.",
    highlightsTitle: "Why Join",
    highlights: [
      "Ownership-first culture with high trust and autonomy.",
      "Mission-focused work directly tied to user outcomes.",
      "Collaborative teams across product, engineering, and research.",
      "Growth environment with mentorship and continuous learning.",
    ],
    detailsTitle: "Hiring Focus",
    details: [
      "Engineering roles in AI systems, platform reliability, and frontend UX.",
      "Product and design roles for high-impact user workflows.",
      "Data and operations roles that scale insights quality.",
      "People and culture roles that strengthen team excellence.",
    ],
  },
  "privacy-policy": {
    group: "Company",
    title: "Privacy Policy",
    intro:
      "Our privacy approach explains what we collect, why we collect it, and how we protect your information throughout the product lifecycle.",
    highlightsTitle: "Policy Highlights",
    highlights: [
      "Clear data collection boundaries tied to product functionality.",
      "Purpose-limited processing for analysis and personalization features.",
      "Strong safeguards for storage, access control, and monitoring.",
      "User rights for access, correction, and deletion requests.",
    ],
    detailsTitle: "Important Notes",
    details: [
      "You can review and manage profile information in your account.",
      "Operational logs are retained only for required security and support needs.",
      "Sensitive data handling follows strict internal access controls.",
      "Policy updates are communicated with a visible effective date.",
    ],
  },
  "terms-of-service": {
    group: "Company",
    title: "Terms of Service",
    intro:
      "Terms of Service defines the rules, responsibilities, and usage standards that keep the Zync platform safe, reliable, and fair.",
    highlightsTitle: "Key Terms",
    highlights: [
      "Platform usage rights and account responsibilities.",
      "Acceptable use boundaries and prohibited activities.",
      "Service availability, limitations, and support scope.",
      "Intellectual property and content ownership basics.",
    ],
    detailsTitle: "Important Notes",
    details: [
      "Users must provide accurate account and profile details.",
      "Abusive or unauthorized usage can lead to suspension.",
      "Service changes may occur as features evolve over time.",
      "Continued use indicates agreement with active terms.",
    ],
  },
};

export default function FooterDetailPage({ pageKey, onBack, onGetStarted, theme, toggleTheme }) {
  const page = FOOTER_PAGE_CONTENT[pageKey] || FOOTER_PAGE_CONTENT["skill-analyzer"];

  return (
    <div className="detail-page-shell">
      <header className="header" style={{ position: "relative", margin: "0" }}>
        <div className="header-logo" style={{ cursor: "pointer" }} onClick={onBack}>
          <span className="logo-icon">⚡</span>
          <span className="gradient-text">Zync</span>
        </div>
        <nav className="header-nav" style={{ gap: "20px" }}>
          <button className="nav-link" onClick={onBack}>Home</button>
          <button className="nav-link active">{page.group}</button>
          <button className="nav-link active">{page.title}</button>
        </nav>
        <div className="header-actions">
          <button className="theme-btn" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          <button className="btn-primary detail-header-btn" onClick={onGetStarted}>
            Get Started
          </button>
        </div>
      </header>

      <main className="detail-main">
        <section className="detail-hero">
          <span className="detail-badge">{page.group}</span>
          <h1>{page.title}</h1>
          <p>{page.intro}</p>
          <div className="detail-hero-actions">
            <button className="btn-primary detail-hero-btn" onClick={onGetStarted}>
              Open Skill Analyzer
            </button>
            <button className="btn-export" onClick={onBack}>
              Back to Footer Links
            </button>
          </div>
        </section>

        <section className="detail-grid">
          <article className="detail-card">
            <h2>{page.highlightsTitle}</h2>
            <ul>
              {page.highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article className="detail-card">
            <h2>{page.detailsTitle}</h2>
            <ul>
              {page.details.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </section>
      </main>
    </div>
  );
}
