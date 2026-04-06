import React from "react";
import "./LandingPage.css";

const PRODUCT_LINKS = [
  {
    key: "skill-analyzer",
    title: "Skill Analyzer",
  },
  {
    key: "salary-benchmarks",
    title: "Salary Benchmarks",
  },
  {
    key: "career-roadmaps",
    title: "Career Roadmaps",
  },
  {
    key: "market-trends",
    title: "Market Trends",
  },
];

const RESOURCE_LINKS = [
  {
    key: "blog",
    title: "Blog",
  },
  {
    key: "api-documentation",
    title: "API Documentation",
  },
  {
    key: "community-forum",
    title: "Community Forum",
  },
  {
    key: "help-center",
    title: "Help Center",
  },
];

const COMPANY_LINKS = [
  {
    key: "about-us",
    title: "About Us",
  },
  {
    key: "careers",
    title: "Careers",
  },
  {
    key: "privacy-policy",
    title: "Privacy Policy",
  },
  {
    key: "terms-of-service",
    title: "Terms of Service",
  },
];

export default function LandingPage({ onGetStarted, onOpenFooterPage, theme, toggleTheme }) {
  // Simple scroll-to utility for anchor links
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const openFooterPage = (key) => (e) => {
    e.preventDefault();
    if (typeof onOpenFooterPage === "function") {
      onOpenFooterPage(key);
    }
  };

  const renderFooterLinks = (links) => (
    <div className="footer-links-rich">
      {links.map((link) => (
        <div className="footer-rich-item" key={link.key}>
          <a href="#" onClick={openFooterPage(link.key)}>{link.title}</a>
        </div>
      ))}
    </div>
  );

  return (
    <div className="landing-page">
      {/* ─── Navbar ─── */}
      <header className="header" style={{ position: 'relative', margin: '0' }}>
        <div className="header-logo">
          <span className="logo-icon">⚡</span>
          <span className="gradient-text">Zync</span>
        </div>
        <nav className="header-nav" style={{ gap: '20px' }}>
          <button className="nav-link" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Home</button>
          <button className="nav-link" onClick={() => scrollTo('about')}>About</button>
          <button className="nav-link" onClick={() => scrollTo('testimonials')}>Testimonials</button>
          <button className="nav-link" onClick={() => scrollTo('contact')}>Contact</button>
        </nav>
        <div className="header-actions">
          <button className="theme-btn" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          <button className="btn-primary" onClick={onGetStarted} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
            Get Started
          </button>
        </div>
      </header>

      <main>
        {/* ─── Hero Section ─── */}
        <section className="hero-section">
          <div className="hero-hero-badge">✨ 2026 Career Intelligence Powered by AI</div>
          <h1 className="hero-title">
            Unlock Your Next <br />
            <span className="gradient-text">Career Breakthrough</span>
          </h1>
          <p className="hero-subtitle">
            Navigate the modern job market with personalized skill gap analysis, real-time salary benchmarks, and actionable learning roadmaps.
          </p>
          <div className="hero-cta">
            <button className="btn-primary" style={{ padding: '16px 32px', fontSize: '1.1rem' }} onClick={onGetStarted}>
              Start Exploring Now 🚀
            </button>
            <button className="btn-export" style={{ padding: '16px 32px', fontSize: '1.1rem' }} onClick={() => scrollTo('about')}>
              Learn More
            </button>
          </div>
        </section>

        {/* ─── About Section ─── */}
        <section id="about" className="about-section">
          <div className="section-header">
            <h2>Why Choose Zync?</h2>
            <p>We analyze live market data across 12+ industries to give you an unfair advantage in your career progression.</p>
          </div>
          <div className="about-grid">
            <div className="feature-card">
              <span className="feature-icon">🎯</span>
              <h3>Precision Skill Matching</h3>
              <p>Instantly compare your current skills against market demands. Identify critical gaps and discover which tools are strictly required vs. nice-to-have in your dream role.</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">💰</span>
              <h3>Live Salary Benchmarks</h3>
              <p>Stop guessing your worth. Access real-time salary data including minimum, median, and maximum bands for specialized roles so you can negotiate with confidence.</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🗺️</span>
              <h3>Dynamic Roadmaps</h3>
              <p>Get a step-by-step learning trajectory. From beginner basics to advanced architectural patterns, we tell you exactly what to learn and which certifications hold weight.</p>
            </div>
          </div>
        </section>

        {/* ─── Testimonials Section ─── */}
        <section id="testimonials" className="testimonials-section">
          <div className="section-header">
            <h2>Success Stories</h2>
            <p>Join thousands of professionals who have accelerated their career growth.</p>
          </div>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <p className="test-text">
                "Zync helped me transition from a Junior Dev to a Cloud Engineer in under 6 months. The roadmap was precise, and the salary benchmark gave me the leverage to negotiate a 40% raise."
              </p>
              <div className="test-author">
                <div className="author-avatar">SC</div>
                <div className="author-info">
                  <h4>Sarah Chen</h4>
                  <p>Cloud Engineer @ TechFlow</p>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <p className="test-text">
                "As an HR consultant, I use the market trend data daily to advise candidates. The visual skill gap analysis is the best feature I've seen in any career tool."
              </p>
              <div className="test-author">
                <div className="author-avatar">MJ</div>
                <div className="author-info">
                  <h4>Marcus Johnson</h4>
                  <p>Senior Talent Advisor</p>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <p className="test-text">
                "I didn't know which certifications were actually valuable until I used this platform. Saved me months of studying the wrong material!"
              </p>
              <div className="test-author">
                <div className="author-avatar">EL</div>
                <div className="author-info">
                  <h4>Elena Rodriguez</h4>
                  <p>Cybersecurity Analyst</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ─── Footer ─── */}
      <footer id="contact" className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="logo-text">⚡ Zync</span>
            <p>Empowering professionals with AI-driven career intelligence and market trends.</p>
            <div className="social-links">
              <a href="#" className="social-link" aria-label="Twitter">𝕏</a>
              <a href="#" className="social-link" aria-label="LinkedIn">in</a>
              <a href="#" className="social-link" aria-label="GitHub">gh</a>
            </div>
          </div>
          
          <div className="footer-col">
            <h4>Product</h4>
            {renderFooterLinks(PRODUCT_LINKS)}
          </div>

          <div className="footer-col">
            <h4>Resources</h4>
            {renderFooterLinks(RESOURCE_LINKS)}
          </div>

          <div className="footer-col">
            <h4>Company</h4>
            {renderFooterLinks(COMPANY_LINKS)}
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Zync Inc. All rights reserved.</p>
          <p>Made with ⚡ for modern professionals.</p>
        </div>
      </footer>
    </div>
  );
}
