import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import "./App.css";

/* ═══════════════════════════════════════════════════
   THEME HOOK
   ═══════════════════════════════════════════════════ */
function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);
  const toggle = () => setTheme(t => (t === "dark" ? "light" : "dark"));
  return { theme, toggle };
}

/* ═══════════════════════════════════════════════════
   SKILL INPUT with autocomplete chips (F1)
   ═══════════════════════════════════════════════════ */
function SkillInput({ chips, setChips }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const debounceRef = useRef(null);
  const inputRef = useRef(null);

  const getSkillName = (skill) => {
    if (typeof skill === "string") return skill.trim();
    if (skill && typeof skill.name === "string") return skill.name.trim();
    return "";
  };

  const normalizeSuggestion = (skill) => {
    const name = getSkillName(skill);
    if (!name) return null;

    return {
      id: typeof skill === "object" && skill?.id ? String(skill.id) : `custom:${name.toLowerCase()}`,
      name,
      category: typeof skill === "object" && skill?.category ? skill.category : "Uncategorized",
      tags: Array.isArray(skill?.tags) ? skill.tags : [],
      source: typeof skill === "object" && skill?.source ? skill.source : "dataset",
    };
  };

  const fetchSuggestions = useCallback((q) => {
    if (!q.trim()) { setSuggestions([]); return; }

    axios.get(`/api/skills/search?q=${encodeURIComponent(q)}`)
      .then(r => {
        const chipSet = new Set(chips.map(c => c.toLowerCase()));
        const normalized = (r.data || [])
          .map(normalizeSuggestion)
          .filter(Boolean)
          .filter(s => !chipSet.has(s.name.toLowerCase()))
          .slice(0, 6);

        setSuggestions(normalized);
      })
      .catch(() => setSuggestions([]));
  }, [chips]);

  const onInput = (val) => {
    setQuery(val);
    setActiveIdx(-1);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 250);
  };

  const addChip = (skill) => {
    const name = getSkillName(skill);
    if (!name) return;

    const exists = chips.some(chip => chip.toLowerCase() === name.toLowerCase());
    if (!exists) setChips([...chips, name]);

    setQuery("");
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const removeChip = (name) => setChips(chips.filter(c => c !== name));

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (activeIdx >= 0 && suggestions[activeIdx]) addChip(suggestions[activeIdx]);
      else if (query.trim()) addChip(query.trim());
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, -1));
    } else if (e.key === "Backspace" && !query && chips.length) {
      removeChip(chips[chips.length - 1]);
    } else if (e.key === "Escape") {
      setSuggestions([]);
    }
  };

  return (
    <div className="skill-input-wrap">
      <div className="chip-area" onClick={() => inputRef.current?.focus()}>
        {chips.map(c => (
          <span key={c} className="chip">{c}<button type="button" onClick={() => removeChip(c)} aria-label={`Remove ${c}`}>×</button></span>
        ))}
        <input
          ref={inputRef}
          className="chip-input"
          value={query}
          onChange={e => onInput(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => setTimeout(() => setSuggestions([]), 150)}
          placeholder={chips.length ? "" : "Type a skill and press Enter…"}
          aria-label="Add skills"
          autoComplete="off"
        />
      </div>
      {suggestions.length > 0 && (
        <div className="suggestions" role="listbox">
          {suggestions.map((s, i) => (
            <div
              key={s.id}
              className={`suggestion-item${i === activeIdx ? " active" : ""}`}
              role="option"
              aria-selected={i === activeIdx}
              onMouseDown={() => addChip(s)}
            >
              {s.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   SKILL GAP SCORE (F2)
   ═══════════════════════════════════════════════════ */
function SkillGapScore({ matched = 0, recommended = 0 }) {
  const total = matched + recommended;
  const pct = total > 0 ? Math.round((matched / total) * 100) : 0;
  const circumference = 2 * Math.PI * 34;
  const offset = circumference - (pct / 100) * circumference;
  const color = pct >= 70 ? "var(--success)" : pct >= 40 ? "var(--amber)" : "var(--rose)";

  return (
    <div className="gap-score">
      <div className="gap-ring">
        <svg viewBox="0 0 80 80" width="80" height="80">
          <circle className="gap-ring-bg" cx="40" cy="40" r="34" />
          <circle className="gap-ring-fill" cx="40" cy="40" r="34" stroke={color} strokeDasharray={circumference} strokeDashoffset={offset} />
        </svg>
        <div className="gap-ring-text">{pct}%</div>
      </div>
      <div className="gap-details">
        <strong>Skill Coverage</strong>
        <p>{matched} of your skills matched · {recommended} new skills recommended</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   COMPARE ROLES (F4)
   ═══════════════════════════════════════════════════ */
function CompareRoles({ salaryData }) {
  const [roleA, setRoleA] = useState("");
  const [roleB, setRoleB] = useState("");
  const a = salaryData.find(d => d.role === roleA);
  const b = salaryData.find(d => d.role === roleB);
  if (!salaryData || salaryData.length < 2) return null;

  return (
    <section className="compare-section glass" aria-labelledby="compare-heading">
      <h3 className="section-title" id="compare-heading">Compare Roles</h3>
      <div className="compare-selects">
        <select className="form-select" value={roleA} onChange={e => setRoleA(e.target.value)} aria-label="Select first role">
          <option value="">Select role A</option>
          {salaryData.map(d => <option key={d.role} value={d.role}>{d.role}</option>)}
        </select>
        <select className="form-select" value={roleB} onChange={e => setRoleB(e.target.value)} aria-label="Select second role">
          <option value="">Select role B</option>
          {salaryData.map(d => <option key={d.role} value={d.role}>{d.role}</option>)}
        </select>
      </div>
      {a && b && (
        <div className="compare-grid">
          {[a, b].map(r => (
            <div key={r.role} className="compare-card glass">
              <h4>{r.role}</h4>
              <div className="compare-stat"><div className="label">Min</div><div className="value">${r.min?.toLocaleString()}</div></div>
              <div className="compare-stat"><div className="label">Median</div><div className="value">${r.median?.toLocaleString()}</div></div>
              <div className="compare-stat"><div className="label">Max</div><div className="value">${r.max?.toLocaleString()}</div></div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   HISTORY PANEL (F3)
   ═══════════════════════════════════════════════════ */
function HistoryPanel({ onLoad }) {
  const [history, setHistory] = useState([]);
  const [open, setOpen] = useState(false);

  const fetchHistory = () => {
    axios.get("/api/history")
      .then(r => { setHistory(r.data || []); setOpen(true); })
      .catch(() => setHistory([]));
  };

  return (
    <section className="history-panel" aria-labelledby="history-heading">
      <button className="btn-export" onClick={() => open ? setOpen(false) : fetchHistory()} aria-expanded={open}>
        📋 {open ? "Hide History" : "View Past Analyses"}
      </button>
      {open && (
        <div className="glass" style={{ marginTop: 12 }}>
          <h3 className="section-title" id="history-heading">Analysis History</h3>
          {history.length === 0 ? (
            <p className="history-empty">No past analyses yet.</p>
          ) : (
            <div className="history-list" role="list">
              {history.slice(0, 10).map((item, i) => (
                <div
                  key={i} className="history-item" role="listitem"
                  tabIndex={0}
                  onClick={() => onLoad(item)}
                  onKeyDown={e => e.key === "Enter" && onLoad(item)}
                >
                  <span className="history-item-info">{item.input?.industry} — {item.input?.specialization}</span>
                  <span className="history-item-meta">{item.timestamp ? new Date(item.timestamp).toLocaleDateString() : ""}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   INDUSTRIES DATA
   ═══════════════════════════════════════════════════ */
const INDUSTRIES = [
  "Technology", "Financial Services", "Healthcare Life Sciences",
  "Manufacturing & Industrial", "Retail & Consumer", "Energy & Utilities",
  "Education & Training", "Professional Services", "Telecommunications & Logistics"
];

const SPECIALIZATIONS = {
  "Technology": ["AI/ML Engineer","Cybersecurity Analyst","Cloud Engineer","DevOps Engineer","Data Scientist","Full-Stack Developer","Software Architect","Blockchain Developer"],
  "Financial Services": ["Investment Banking","Financial Analysis","Risk Management","FinTech Development","Corporate Finance","Treasury Management","Wealth Management","Compliance Officer"],
  "Healthcare Life Sciences": ["Clinical Research","Biomedical Engineering","Medical Lab Tech","Dietetics/Nutrition","Biotechnology","Public Health","Pharmaceutical R&D","Operation Theatre Tech"],
  "Manufacturing & Industrial": ["Industrial Automation","Supply Chain Management","Quality Engineering","Robotics Engineering","Lean Manufacturing","Product Design","Process Engineering","Additive Manufacturing"],
  "Retail & Consumer": ["E-commerce Management","Supply Chain Logistics","Digital Marketing","Merchandising","Customer Experience Design","Retail Analytics","Inventory Management","Omnichannel Retail"],
  "Energy & Utilities": ["Renewable Energy Engineering","Energy Trading","Grid Management","Sustainable Energy Systems","Oil & Gas Operations","Nuclear Engineering","Energy Efficiency Consulting","Carbon Management"],
  "Education & Training": ["EdTech Development","Instructional Design","Curriculum Development","Educational Leadership","Online Learning Platforms","Data Analytics in Education","Corporate Training","Special Education"],
  "Professional Services": ["Management Consulting","IT Consulting","HR Consulting","Legal Services","Accounting/Audit","Marketing Strategy","Digital Transformation","Sustainability Consulting"],
  "Telecommunications & Logistics": ["Network Engineering","5G/6G Development","Supply Chain Optimization","Logistics Analytics","Telecom Cybersecurity","IoT Integration","Freight Management","Last-Mile Delivery"],
};

/* ═══════════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════════ */
function App() {
  const { theme, toggle } = useTheme();

  // Form state
  const [industry, setIndustry] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [skillChips, setSkillChips] = useState([]);
  const [experience, setExperience] = useState("");

  // App state
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState({});

  const statusRef = useRef(null);

  const validate = () => {
    const errs = {};
    if (!industry) errs.industry = "Required";
    if (!specialization) errs.specialization = "Required";
    if (skillChips.length === 0) errs.skills = "Add at least one skill";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const analyze = async () => {
    if (!validate()) return;
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const res = await axios.post("/api/analyze", {
        industry,
        specialization,
        skills: skillChips.join(", "),
        experience: experience || "0",
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Analysis failed. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadFromHistory = (item) => {
    setResult(item);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const specs = SPECIALIZATIONS[industry] || [];

  // Derived chart data
  const salaryChartData = (result?.salaryData || []).map(d => ({
    role: d.role, Min: d.min, Median: d.median, Max: d.max,
  }));

  // Trend scoring
  const userSkillsLower = skillChips.map(s => s.toLowerCase());
  const specWords = specialization.toLowerCase().split(" ").filter(Boolean);
  const scoredTrends = (result?.trends || []).map(trend => {
    let score = 0;
    const t = trend.toLowerCase();
    userSkillsLower.forEach(sk => { if (t.includes(sk)) score += 2; });
    specWords.forEach(w => { if (t.includes(w)) score += 1; });
    return { trend, score };
  }).sort((a, b) => b.score - a.score);

  return (
    <div className="app">
      {/* ─── Header ─── */}
      <header className="header">
        <div className="header-logo">Skill<span>Suggester</span></div>
        <div className="header-actions">
          <button className="theme-btn" onClick={toggle} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      <main className="app-main" role="main">
        {/* Live status region */}
        <div ref={statusRef} aria-live="polite" aria-atomic="true" className="visually-hidden" role="status">
          {loading ? "Analyzing your profile…" : error ? `Error: ${error}` : result ? "Analysis complete." : ""}
        </div>

        {/* ─── Error Banner ─── */}
        {error && (
          <div className="error-banner" role="alert">
            <span>⚠️ {error}</span>
            <button onClick={() => setError("")} aria-label="Dismiss error">×</button>
          </div>
        )}

        {/* ─── Loading ─── */}
        {loading && (
          <div className="loading-overlay" aria-busy="true">
            <div className="spinner" />
            <p className="loading-text">Analyzing market data…</p>
          </div>
        )}

        {/* ─── Form ─── */}
        {!loading && !result && (
          <section className="form-section" aria-labelledby="form-title">
            <div className="glass">
              <h1 className="form-title" id="form-title">Future-Proof Your Career</h1>
              <p className="form-subtitle">Get market insights based on your skills and industry.</p>

              <form onSubmit={e => { e.preventDefault(); analyze(); }} noValidate>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label" htmlFor="industry">Industry<span className="req">*</span></label>
                    <select
                      id="industry" className="form-select" value={industry}
                      onChange={e => { setIndustry(e.target.value); setSpecialization(""); }}
                      aria-invalid={!!formErrors.industry} aria-describedby={formErrors.industry ? "err-ind" : undefined}
                    >
                      <option value="">Select Industry</option>
                      {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                    {formErrors.industry && <span className="form-error-text" id="err-ind">{formErrors.industry}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="specialization">Specialization<span className="req">*</span></label>
                    <select
                      id="specialization" className="form-select" value={specialization}
                      onChange={e => setSpecialization(e.target.value)}
                      disabled={!industry}
                      aria-invalid={!!formErrors.specialization} aria-describedby={formErrors.specialization ? "err-spec" : undefined}
                    >
                      <option value="">Select Specialization</option>
                      {specs.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {formErrors.specialization && <span className="form-error-text" id="err-spec">{formErrors.specialization}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="experience">Years of Experience</label>
                    <input
                      id="experience" className="form-input" type="number" min="0" max="50"
                      value={experience} onChange={e => setExperience(e.target.value)}
                      placeholder="e.g., 3"
                    />
                  </div>

                  <div className="form-group full">
                    <label className="form-label">Skills<span className="req">*</span></label>
                    <SkillInput chips={skillChips} setChips={setSkillChips} />
                    {formErrors.skills ? (
                      <span className="form-error-text">{formErrors.skills}</span>
                    ) : (
                      <span className="form-hint">Type and press Enter, or select from suggestions</span>
                    )}
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? "Analyzing…" : "Analyze Profile →"}
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}

        {/* ─── Dashboard ─── */}
        {!loading && result && (
          <section className="dashboard" aria-labelledby="dash-heading">
            <div className="dash-header">
              <div>
                <h2 id="dash-heading">{result.input?.industry || industry} — {result.input?.specialization || specialization}</h2>
                <p className="last-updated">Data as of {result.meta?.lastUpdated || "Jan 2026"} · Source: {result.meta?.source || "Market Index"}</p>
              </div>
              <button className="btn-back" onClick={() => setResult(null)}>← New Analysis</button>
            </div>

            {/* Metrics */}
            <div className="metrics-grid">
              <article className="glass metric-card">
                <div className="metric-label">Market Outlook</div>
                <div className="metric-value">{result.outlook}</div>
                <div className="metric-sub">Forecast Q1 2026</div>
              </article>
              <article className="glass metric-card">
                <div className="metric-label">Industry Growth</div>
                <div className="metric-value">{result.growth}</div>
                <div className="metric-bar"><div className="metric-bar-fill teal" style={{ width: result.growth || "0%" }} /></div>
              </article>
              <article className="glass metric-card">
                <div className="metric-label">Demand Level</div>
                <div className="metric-value">{result.demandLevel}</div>
                <div className="metric-bar">
                  <div className="metric-bar-fill rose" style={{ width: result.demandLevel === "High" ? "90%" : result.demandLevel === "Medium" ? "60%" : "25%" }} />
                </div>
              </article>
            </div>

            {/* Skill Gap Score (F2) */}
            <div className="glass">
              <h3 className="section-title">Skill Gap Analysis</h3>
              <SkillGapScore matched={(result.matchedSkills || []).length} recommended={(result.recommendedSkills || []).length} />
            </div>

            {/* Salary Chart */}
            {salaryChartData.length > 0 && (
              <div className="glass" style={{ marginTop: 20 }}>
                <h3 className="section-title">Salary Distribution (USD)</h3>
                <div className="chart-wrap">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salaryChartData} barCategoryGap="20%">
                      <XAxis dataKey="role" tick={{ fill: "var(--text-secondary)", fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={60} />
                      <YAxis tick={{ fill: "var(--text-dim)", fontSize: 11 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={v => `$${v.toLocaleString()}`} contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text-primary)" }} />
                      <Legend />
                      <Bar dataKey="Min" fill="var(--chart-min)" radius={[4,4,0,0]} />
                      <Bar dataKey="Median" fill="var(--chart-med)" radius={[4,4,0,0]} />
                      <Bar dataKey="Max" fill="var(--chart-max)" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Content grid: Skills + Trends */}
            <div className="content-grid" style={{ marginTop: 20 }}>
              <div className="glass">
                <h3 className="section-title">Top In-Demand Skills</h3>
                <div className="skill-tags">
                  {(result.topSkills || []).map((s, i) => <span key={i} className="skill-tag">{s}</span>)}
                </div>
                {(result.recommendedSkills || []).length > 0 && (
                  <>
                    <h3 className="section-title" style={{ marginTop: 20 }}>Recommended for You</h3>
                    <div className="skill-tags">
                      {result.recommendedSkills.map((s, i) => (
                        <span key={i} className="skill-tag recommended" title={s.reason || "Recommended"}>
                          {typeof s === "string" ? s : s.name}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="glass">
                <h3 className="section-title">Emerging Trends</h3>
                <div className="trend-list">
                  {scoredTrends.map((item, i) => (
                    <div key={i} className="trend-item">
                      <span className="trend-icon">{item.score >= 3 ? "🔥" : item.score === 2 ? "⚡" : "ℹ️"}</span>
                      {item.trend}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Compare Roles (F4) */}
            <CompareRoles salaryData={result.salaryData || []} />

            {/* Export (F5) + History (F3) */}
            <div className="export-bar">
              <button className="btn-export" onClick={() => window.print()}>🖨️ Print / Export PDF</button>
            </div>
            <HistoryPanel onLoad={loadFromHistory} />
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
