import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, CartesianGrid
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
   ANIMATED COUNTER
   ═══════════════════════════════════════════════════ */
function AnimatedCounter({ value, prefix = "", suffix = "", duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef(null);
  const reqRef = useRef(null);

  useEffect(() => {
    if (typeof value !== "number" || isNaN(value)) return;
    const start = performance.now();
    const from = 0;
    const to = value;
    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (progress < 1) reqRef.current = requestAnimationFrame(animate);
    };
    reqRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(reqRef.current);
  }, [value, duration]);

  return <>{prefix}{display.toLocaleString()}{suffix}</>;
}

/* ═══════════════════════════════════════════════════
   SKILL INPUT with autocomplete chips
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
        const normalized = (r.data || []).map(normalizeSuggestion).filter(Boolean)
          .filter(s => !chipSet.has(s.name.toLowerCase())).slice(0, 6);
        setSuggestions(normalized);
      })
      .catch(() => setSuggestions([]));
  }, [chips]);

  const onInput = (val) => {
    setQuery(val);
    setActiveIdx(-1);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 200);
  };

  const addChip = (skill) => {
    const name = getSkillName(skill);
    if (!name) return;
    if (!chips.some(c => c.toLowerCase() === name.toLowerCase())) setChips([...chips, name]);
    setQuery(""); setSuggestions([]); inputRef.current?.focus();
  };

  const removeChip = (name) => setChips(chips.filter(c => c !== name));

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (activeIdx >= 0 && suggestions[activeIdx]) addChip(suggestions[activeIdx]);
      else if (query.trim()) addChip(query.trim());
    } else if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, suggestions.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, -1)); }
    else if (e.key === "Backspace" && !query && chips.length) removeChip(chips[chips.length - 1]);
    else if (e.key === "Escape") setSuggestions([]);
  };

  return (
    <div className="skill-input-wrap">
      <div className="chip-area" onClick={() => inputRef.current?.focus()}>
        {chips.map(c => (
          <span key={c} className="chip">
            {c}
            <button type="button" onClick={() => removeChip(c)} aria-label={`Remove ${c}`}>×</button>
          </span>
        ))}
        <input ref={inputRef} className="chip-input" value={query}
          onChange={e => onInput(e.target.value)} onKeyDown={onKeyDown}
          onBlur={() => setTimeout(() => setSuggestions([]), 150)}
          placeholder={chips.length ? "" : "Type a skill and press Enter…"}
          aria-label="Add skills" autoComplete="off" />
      </div>
      {suggestions.length > 0 && (
        <div className="suggestions" role="listbox">
          {suggestions.map((s, i) => (
            <div key={s.id} className={`suggestion-item${i === activeIdx ? " active" : ""}`}
              role="option" aria-selected={i === activeIdx} onMouseDown={() => addChip(s)}>
              <span className="sugg-name">{s.name}</span>
              <span className="sugg-cat">{s.category}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   SKILL GAP SCORE
   ═══════════════════════════════════════════════════ */
function SkillGapScore({ matched = 0, recommended = 0 }) {
  const total = matched + recommended;
  const pct = total > 0 ? Math.round((matched / total) * 100) : 0;
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (pct / 100) * circumference;
  const color = pct >= 70 ? "var(--success)" : pct >= 40 ? "var(--amber)" : "var(--rose)";
  const label = pct >= 70 ? "Excellent" : pct >= 40 ? "Developing" : "Growing";

  return (
    <div className="gap-score">
      <div className="gap-ring">
        <svg viewBox="0 0 100 100" width="100" height="100">
          <circle className="gap-ring-bg" cx="50" cy="50" r="40" />
          <circle className="gap-ring-fill" cx="50" cy="50" r="40" stroke={color}
            strokeDasharray={circumference} strokeDashoffset={offset} />
        </svg>
        <div className="gap-ring-text">{pct}%</div>
      </div>
      <div className="gap-details">
        <strong>Skill Coverage — <span style={{ color }}>{label}</span></strong>
        <p>{matched} matched · {recommended} new skills recommended</p>
        <div className="gap-bar-row">
          <div className="gap-mini-bar" style={{ background: color, width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   COMPARE ROLES
   ═══════════════════════════════════════════════════ */
function CompareRoles({ salaryData }) {
  const [roleA, setRoleA] = useState("");
  const [roleB, setRoleB] = useState("");
  const a = salaryData.find(d => d.role === roleA);
  const b = salaryData.find(d => d.role === roleB);
  if (!salaryData || salaryData.length < 2) return null;

  return (
    <section className="compare-section glass" aria-labelledby="compare-heading">
      <h3 className="section-title" id="compare-heading">⚖️ Compare Roles</h3>
      <div className="compare-selects">
        <select className="form-select" value={roleA} onChange={e => setRoleA(e.target.value)} aria-label="Select role A">
          <option value="">Select role A</option>
          {salaryData.map(d => <option key={d.role} value={d.role}>{d.role}</option>)}
        </select>
        <select className="form-select" value={roleB} onChange={e => setRoleB(e.target.value)} aria-label="Select role B">
          <option value="">Select role B</option>
          {salaryData.map(d => <option key={d.role} value={d.role}>{d.role}</option>)}
        </select>
      </div>
      {a && b && (
        <div className="compare-grid">
          {[a, b].map(r => (
            <div key={r.role} className="compare-card glass">
              <h4>{r.role}</h4>
              <div className="compare-stat"><div className="label">Min</div><div className="value accent">${r.min?.toLocaleString()}</div></div>
              <div className="compare-stat"><div className="label">Median</div><div className="value teal">${r.median?.toLocaleString()}</div></div>
              <div className="compare-stat"><div className="label">Max</div><div className="value rose">${r.max?.toLocaleString()}</div></div>
              <div className="compare-bar">
                <div className="compare-bar-fill" style={{ width: `${(r.median / Math.max(a.max, b.max)) * 100}%`, background: "var(--accent)" }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   LEARNING ROADMAP
   ═══════════════════════════════════════════════════ */
function LearningRoadmap({ learningPath, certifications, companiesHiring }) {
  const [activeLevel, setActiveLevel] = useState("beginner");
  if (!learningPath || Object.keys(learningPath).length === 0) return null;
  const levels = ["beginner", "intermediate", "advanced"];
  const levelLabels = { beginner: "🌱 Beginner", intermediate: "⚡ Intermediate", advanced: "🚀 Advanced" };

  return (
    <section className="roadmap-section glass" aria-labelledby="roadmap-heading">
      <h3 className="section-title" id="roadmap-heading">🗺️ Learning Roadmap</h3>
      <div className="roadmap-tabs">
        {levels.map(lvl => (
          <button key={lvl}
            className={`roadmap-tab${activeLevel === lvl ? " active" : ""}`}
            onClick={() => setActiveLevel(lvl)}>
            {levelLabels[lvl]}
          </button>
        ))}
      </div>
      <div className="roadmap-skills">
        {(learningPath[activeLevel] || []).map((skill, i) => (
          <div key={i} className="roadmap-skill" style={{ animationDelay: `${i * 60}ms` }}>
            <span className="roadmap-step">{i + 1}</span>
            <span>{skill}</span>
          </div>
        ))}
      </div>
      {certifications && certifications.length > 0 && (
        <div className="certs-row">
          <div className="certs-label">🏅 Top Certifications</div>
          <div className="certs-list">
            {certifications.map((cert, i) => (
              <span key={i} className="cert-badge">{cert}</span>
            ))}
          </div>
        </div>
      )}
      {companiesHiring && companiesHiring.length > 0 && (
        <div className="companies-row">
          <div className="certs-label">🏢 Companies Hiring</div>
          <div className="certs-list">
            {companiesHiring.map((co, i) => (
              <span key={i} className="company-badge">{co}</span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   CAREER TIMELINE CARD
   ═══════════════════════════════════════════════════ */
function CareerTimeline({ timeline }) {
  if (!timeline) return null;
  return (
    <div className="career-timeline glass">
      <h3 className="section-title">⏱️ Career Trajectory</h3>
      <div className="timeline-grid">
        <div className="timeline-item">
          <div className="timeline-icon">👤</div>
          <div className="timeline-label">Current Level</div>
          <div className="timeline-value accent">{timeline.experienceLevel}</div>
        </div>
        <div className="timeline-item">
          <div className="timeline-icon">📈</div>
          <div className="timeline-label">Time to Promotion</div>
          <div className="timeline-value teal">{timeline.timeToPromotion}</div>
        </div>
        <div className="timeline-item">
          <div className="timeline-icon">💰</div>
          <div className="timeline-label">Annual Salary Growth</div>
          <div className="timeline-value emerald">{timeline.salaryGrowthRate}</div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MATCHED SKILLS PANEL (with categories)
   ═══════════════════════════════════════════════════ */
function MatchedSkillsPanel({ matchedSkills, recommendedSkills, onBookmark, bookmarked }) {
  const [tab, setTab] = useState("matched");

  return (
    <div className="matched-panel glass">
      <div className="panel-tabs">
        <button className={`panel-tab${tab === "matched" ? " active" : ""}`} onClick={() => setTab("matched")}>
          ✅ Matched ({matchedSkills.length})
        </button>
        <button className={`panel-tab${tab === "recommended" ? " active" : ""}`} onClick={() => setTab("recommended")}>
          💡 Recommended ({recommendedSkills.length})
        </button>
      </div>
      <div className="panel-skills">
        {tab === "matched" && matchedSkills.map((s, i) => {
          const name = typeof s === "string" ? s : s.name;
          const cat = typeof s === "object" ? s.category : "";
          const isBookmarked = bookmarked.has(name);
          return (
            <div key={i} className="skill-row">
              <div className="skill-row-info">
                <span className="skill-row-name">{name}</span>
                {cat && <span className="skill-row-cat">{cat}</span>}
              </div>
              <button title={isBookmarked ? "Remove bookmark" : "Bookmark skill"}
                className={`bookmark-btn${isBookmarked ? " bookmarked" : ""}`}
                onClick={() => onBookmark(name)}>
                {isBookmarked ? "★" : "☆"}
              </button>
            </div>
          );
        })}
        {tab === "recommended" && recommendedSkills.map((s, i) => {
          const name = typeof s === "string" ? s : s.name;
          const reason = typeof s === "object" ? s.reason : "";
          const cat = typeof s === "object" ? s.category : "";
          const isBookmarked = bookmarked.has(name);
          return (
            <div key={i} className="skill-row recommended-row">
              <div className="skill-row-info">
                <span className="skill-row-name">{name}</span>
                {cat && <span className="skill-row-cat">{cat}</span>}
                {reason && <span className="skill-row-reason">{reason}</span>}
              </div>
              <button title={isBookmarked ? "Remove bookmark" : "Bookmark skill"}
                className={`bookmark-btn${isBookmarked ? " bookmarked" : ""}`}
                onClick={() => onBookmark(name)}>
                {isBookmarked ? "★" : "☆"}
              </button>
            </div>
          );
        })}
        {((tab === "matched" && matchedSkills.length === 0) || (tab === "recommended" && recommendedSkills.length === 0)) && (
          <p className="empty-state">No {tab} skills found.</p>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   BOOKMARKS WIDGET
   ═══════════════════════════════════════════════════ */
function BookmarksWidget({ bookmarked, onRemove, onCopyAll }) {
  const [open, setOpen] = useState(false);
  if (bookmarked.size === 0) return null;
  return (
    <div className="bookmarks-widget glass">
      <div className="bookmarks-header" onClick={() => setOpen(o => !o)}>
        <span>⭐ Saved Skills ({bookmarked.size})</span>
        <span className="bm-toggle">{open ? "▲" : "▼"}</span>
      </div>
      {open && (
        <div className="bookmarks-body">
          {[...bookmarked].map(name => (
            <div key={name} className="bookmark-item">
              <span>{name}</span>
              <button onClick={() => onRemove(name)} aria-label={`Remove ${name}`}>×</button>
            </div>
          ))}
          <button className="btn-copy-bm" onClick={onCopyAll}>📋 Copy All</button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   TRENDS PANEL (enhanced with hot badge)
   ═══════════════════════════════════════════════════ */
function TrendsPanel({ trends }) {
  if (!trends || trends.length === 0) return null;
  return (
    <div className="trends-panel glass">
      <h3 className="section-title">📡 Emerging Trends</h3>
      <div className="trend-list">
        {trends.map((item, i) => {
          const title = typeof item === "string" ? item : item.title;
          const summary = typeof item === "object" ? item.summary : "";
          const hot = typeof item === "object" ? item.hot : false;
          return (
            <div key={i} className="trend-item">
              <div className="trend-top">
                <span className="trend-icon">{hot ? "🔥" : "ℹ️"}</span>
                <span className="trend-title">{title}</span>
                {hot && <span className="trend-badge">HOT</span>}
              </div>
              {summary && <p className="trend-summary">{summary}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   HISTORY PANEL (enhanced with clear + stats)
   ═══════════════════════════════════════════════════ */
function HistoryPanel({ onLoad }) {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("list");

  const fetchHistory = () => {
    axios.get("/api/history").then(r => { setHistory(r.data || []); });
    axios.get("/api/history/stats").then(r => { setStats(r.data); });
  };

  const clearHistory = () => {
    if (!window.confirm("Clear all analysis history?")) return;
    axios.delete("/api/history").then(() => { setHistory([]); setStats(null); });
  };

  const toggleOpen = () => {
    if (!open) fetchHistory();
    setOpen(o => !o);
  };

  return (
    <section className="history-panel" aria-labelledby="history-heading">
      <button className="btn-export" onClick={toggleOpen} aria-expanded={open}>
        📋 {open ? "Hide History" : "Past Analyses"}
      </button>
      {open && (
        <div className="glass history-content">
          <div className="history-header-row">
            <h3 className="section-title" id="history-heading">Analysis History</h3>
            <div style={{ display: "flex", gap: 8 }}>
              <button className={`panel-tab${tab === "list" ? " active" : ""}`} onClick={() => setTab("list")}>List</button>
              <button className={`panel-tab${tab === "stats" ? " active" : ""}`} onClick={() => setTab("stats")}>Stats</button>
              {history.length > 0 && <button className="btn-danger-sm" onClick={clearHistory}>🗑️ Clear</button>}
            </div>
          </div>
          {tab === "list" && (
            history.length === 0
              ? <p className="history-empty">No past analyses yet.</p>
              : <div className="history-list" role="list">
                  {history.slice(0, 15).map((item, i) => (
                    <div key={i} className="history-item" role="listitem" tabIndex={0}
                      onClick={() => onLoad(item)} onKeyDown={e => e.key === "Enter" && onLoad(item)}>
                      <div className="history-item-main">
                        <span className="history-dot" />
                        <span className="history-item-info">{item.input?.industry} — {item.input?.specialization}</span>
                      </div>
                      <div className="history-item-right">
                        <span className={`demand-badge ${(item.demandLevel || "").toLowerCase()}`}>{item.demandLevel}</span>
                        <span className="history-item-meta">{item.timestamp ? new Date(item.timestamp).toLocaleDateString() : ""}</span>
                      </div>
                    </div>
                  ))}
                </div>
          )}
          {tab === "stats" && stats && (
            <div className="history-stats">
              <div className="stat-box">
                <div className="stat-box-num">{stats.totalAnalyses}</div>
                <div className="stat-box-label">Total Analyses</div>
              </div>
              {stats.topIndustries.length > 0 && (
                <div className="stat-section">
                  <div className="stat-sub-label">Top Industries</div>
                  {stats.topIndustries.slice(0, 4).map((ind, i) => (
                    <div key={i} className="stat-row">
                      <span>{ind.name}</span>
                      <span className="stat-count">{ind.count}×</span>
                    </div>
                  ))}
                </div>
              )}
              {stats.topSkills.length > 0 && (
                <div className="stat-section">
                  <div className="stat-sub-label">Most Used Skills</div>
                  {stats.topSkills.slice(0, 5).map((sk, i) => (
                    <div key={i} className="stat-row">
                      <span>{sk.name}</span>
                      <span className="stat-count">{sk.count}×</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   INDUSTRIES & SPECIALIZATIONS DATA
   ═══════════════════════════════════════════════════ */
const INDUSTRIES = [
  "Technology", "Financial Services", "Healthcare Life Sciences",
  "Manufacturing & Industrial", "Retail & Consumer", "Energy & Utilities",
  "Education & Training", "Professional Services", "Telecommunications & Logistics",
  "Creative & Media", "Government & Public Sector", "Real Estate & Construction"
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
  "Creative & Media": ["Graphic Designer","Video Producer","UX/UI Designer","Brand Strategist","Motion Designer","Content Director","3D Artist","Copywriter / Content Strategist"],
  "Government & Public Sector": ["Policy Analyst","Public Administrator","GIS Analyst","Grant Writer","Urban Planner","IT Specialist (Federal)","Intelligence Analyst","Procurement Officer"],
  "Real Estate & Construction": ["Real Estate Agent","Property Developer","Construction Project Manager","BIM Specialist","Facility Manager","Real Estate Analyst","Sustainable Architect","Property Manager"]
};

const INDUSTRY_ICONS = {
  "Technology": "💻", "Financial Services": "📈", "Healthcare Life Sciences": "🏥",
  "Manufacturing & Industrial": "🏭", "Retail & Consumer": "🛍️", "Energy & Utilities": "⚡",
  "Education & Training": "🎓", "Professional Services": "💼", "Telecommunications & Logistics": "📡",
  "Creative & Media": "🎨", "Government & Public Sector": "🏛️", "Real Estate & Construction": "🏗️"
};

/* ═══════════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════════ */
function App() {
  const { theme, toggle } = useTheme();

  const [industry, setIndustry] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [skillChips, setSkillChips] = useState([]);
  const [experience, setExperience] = useState("");

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [bookmarked, setBookmarked] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem("bookmarks") || "[]")); } catch { return new Set(); }
  });
  const [activeSection, setActiveSection] = useState("overview");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    localStorage.setItem("bookmarks", JSON.stringify([...bookmarked]));
  }, [bookmarked]);

  const toggleBookmark = (name) => {
    setBookmarked(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const copyAllBookmarks = () => {
    navigator.clipboard.writeText([...bookmarked].join(", ")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

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
    setError(""); setResult(null); setLoading(true);
    try {
      const res = await axios.post("/api/analyze", {
        industry, specialization,
        skills: skillChips.join(", "),
        experience: experience || "0",
      });
      setResult(res.data);
      setActiveSection("overview");
    } catch (err) {
      setError(err.response?.data?.error || "Analysis failed. Check your connection and try again.");
    } finally { setLoading(false); }
  };

  const loadFromHistory = (item) => {
    setResult(item);
    setActiveSection("overview");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const exportJSON = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `skill-analysis-${Date.now()}.json`;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const copyResultSummary = () => {
    if (!result) return;
    const text = [
      `Industry: ${result.input?.industry}`,
      `Role: ${result.input?.specialization}`,
      `Outlook: ${result.outlook} | Growth: ${result.growth} | Demand: ${result.demandLevel}`,
      `Top Skills: ${(result.topSkills || []).slice(0, 5).join(", ")}`,
      `Recommended: ${(result.recommendedSkills || []).slice(0, 5).map(s => s.name || s).join(", ")}`,
    ].join("\n");
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const specs = SPECIALIZATIONS[industry] || [];
  const salaryChartData = (result?.salaryData || []).map(d => ({ role: d.role, Min: d.min, Median: d.median, Max: d.max }));

  const radarData = (result?.matchedSkills || []).slice(0, 6).map(s => ({
    skill: typeof s === "string" ? s : s.name,
    score: Math.round(Math.random() * 40 + 60)
  }));

  const SECTIONS = ["overview", "skills", "chart", "roadmap", "trends"];
  const SECTION_LABELS = { overview: "📊 Overview", skills: "🎯 Skills", chart: "💰 Salary", roadmap: "🗺️ Roadmap", trends: "📡 Trends" };

  return (
    <div className="app">
      {/* ─── Header ─── */}
      <header className="header">
        <div className="header-logo">
          <span className="logo-icon">⚡</span>
          Skill<span className="gradient-text">Suggester</span>
        </div>
        <nav className="header-nav">
          {result && SECTIONS.map(s => (
            <button key={s} className={`nav-link${activeSection === s ? " active" : ""}`} onClick={() => setActiveSection(s)}>
              {SECTION_LABELS[s]}
            </button>
          ))}
        </nav>
        <div className="header-actions">
          {bookmarked.size > 0 && (
            <div className="bm-pill" title={`${bookmarked.size} saved skills`}>⭐ {bookmarked.size}</div>
          )}
          <button className="theme-btn" onClick={toggle} aria-label="Toggle theme">
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      <main className="app-main" role="main">
        <div aria-live="polite" aria-atomic="true" className="visually-hidden" role="status">
          {loading ? "Analyzing your profile…" : error ? `Error: ${error}` : result ? "Analysis complete." : ""}
        </div>

        {error && (
          <div className="error-banner" role="alert">
            <span>⚠️ {error}</span>
            <button onClick={() => setError("")} aria-label="Dismiss error">×</button>
          </div>
        )}

        {loading && (
          <div className="loading-overlay" aria-busy="true">
            <div className="loader-ring">
              <div /><div /><div /><div />
            </div>
            <p className="loading-text">Analyzing market data…</p>
            <p className="loading-sub">Matching skills · Fetching trends · Building insights</p>
          </div>
        )}

        {/* ─── Form ─── */}
        {!loading && !result && (
          <section className="form-section" aria-labelledby="form-title">
            <div className="hero-badge">✨ 2026 Market Intelligence</div>
            <h1 className="form-title" id="form-title">Future-Proof<br /><span className="gradient-text">Your Career</span></h1>
            <p className="form-subtitle">Get personalized skill insights, salary benchmarks, and career roadmaps based on live market data.</p>

            <div className="stats-banner">
              <div className="stat-pill">📋 180+ Skills</div>
              <div className="stat-pill">🏢 12 Industries</div>
              <div className="stat-pill">💰 Salary Data</div>
              <div className="stat-pill">🗺️ Learning Paths</div>
            </div>

            <div className="glass form-card">
              <form onSubmit={e => { e.preventDefault(); analyze(); }} noValidate>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label" htmlFor="industry">Industry<span className="req">*</span></label>
                    <div className="select-wrap">
                      {industry && <span className="industry-icon">{INDUSTRY_ICONS[industry] || "🏢"}</span>}
                      <select id="industry" className="form-select" value={industry}
                        onChange={e => { setIndustry(e.target.value); setSpecialization(""); }}
                        aria-invalid={!!formErrors.industry}>
                        <option value="">Select Industry</option>
                        {INDUSTRIES.map(i => <option key={i} value={i}>{INDUSTRY_ICONS[i]} {i}</option>)}
                      </select>
                    </div>
                    {formErrors.industry && <span className="form-error-text">{formErrors.industry}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="specialization">Specialization<span className="req">*</span></label>
                    <select id="specialization" className="form-select" value={specialization}
                      onChange={e => setSpecialization(e.target.value)} disabled={!industry}
                      aria-invalid={!!formErrors.specialization}>
                      <option value="">Select Role</option>
                      {specs.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {formErrors.specialization && <span className="form-error-text">{formErrors.specialization}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="experience">Years of Experience</label>
                    <input id="experience" className="form-input" type="number" min="0" max="50"
                      value={experience} onChange={e => setExperience(e.target.value)} placeholder="e.g., 3" />
                  </div>

                  <div className="form-group full">
                    <label className="form-label">Current Skills<span className="req">*</span></label>
                    <SkillInput chips={skillChips} setChips={setSkillChips} />
                    {formErrors.skills
                      ? <span className="form-error-text">{formErrors.skills}</span>
                      : <span className="form-hint">Type any skill and press Enter — or pick from suggestions</span>}
                  </div>
                </div>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? "Analyzing…" : "🚀 Analyze My Career Profile"}
                </button>
              </form>
            </div>

            {bookmarked.size > 0 && (
              <BookmarksWidget bookmarked={bookmarked} onRemove={toggleBookmark} onCopyAll={copyAllBookmarks} />
            )}
            <HistoryPanel onLoad={loadFromHistory} />
          </section>
        )}

        {/* ─── Dashboard ─── */}
        {!loading && result && (
          <section className="dashboard" aria-labelledby="dash-heading">
            <div className="dash-header">
              <div>
                <div className="dash-industry-badge">
                  {INDUSTRY_ICONS[result.input?.industry] || "🏢"} {result.input?.industry}
                </div>
                <h2 id="dash-heading">{result.input?.specialization}</h2>
                <p className="last-updated">
                  📅 Data as of {result.meta?.lastUpdated || "2026"} · {result.meta?.source || "Market Index"}
                </p>
              </div>
              <div className="dash-actions">
                <button className="btn-icon" onClick={copyResultSummary} title="Copy summary">
                  {copied ? "✅" : "📋"}
                </button>
                <button className="btn-icon" onClick={exportJSON} title="Download JSON">⬇️</button>
                <button className="btn-icon" onClick={() => window.print()} title="Print">🖨️</button>
                <button className="btn-back" onClick={() => setResult(null)}>← New Analysis</button>
              </div>
            </div>

            {/* Section nav (mobile-friendly) */}
            <div className="section-nav">
              {SECTIONS.map(s => (
                <button key={s} className={`section-nav-btn${activeSection === s ? " active" : ""}`}
                  onClick={() => setActiveSection(s)}>{SECTION_LABELS[s]}</button>
              ))}
            </div>

            {/* ── OVERVIEW ── */}
            {activeSection === "overview" && (
              <div className="fade-in">
                {/* Big stats */}
                <div className="metrics-grid">
                  <article className="glass metric-card">
                    <div className="metric-label">Market Outlook</div>
                    <div className={`metric-value outlook-${(result.outlook || "").toLowerCase()}`}>{result.outlook}</div>
                    <div className="metric-sub">Forecast Q2 2026</div>
                  </article>
                  <article className="glass metric-card">
                    <div className="metric-label">Industry Growth</div>
                    <div className="metric-value teal">{result.growth}</div>
                    <div className="metric-bar"><div className="metric-bar-fill teal" style={{ width: result.growth || "0%" }} /></div>
                  </article>
                  <article className="glass metric-card">
                    <div className="metric-label">Demand Level</div>
                    <div className={`metric-value demand-${(result.demandLevel || "").toLowerCase()}`}>{result.demandLevel}</div>
                    <div className="metric-bar">
                      <div className={`metric-bar-fill demand-bar-${(result.demandLevel || "low").toLowerCase()}`}
                        style={{ width: result.demandLevel === "High" ? "90%" : result.demandLevel === "Medium" ? "58%" : "25%" }} />
                    </div>
                  </article>
                  {result.avgSalary && (
                    <article className="glass metric-card">
                      <div className="metric-label">Avg Salary (USD)</div>
                      <div className="metric-value accent">
                        <AnimatedCounter value={result.avgSalary} prefix="$" />
                      </div>
                      <div className="metric-sub">Industry median</div>
                    </article>
                  )}
                  {result.jobOpenings && (
                    <article className="glass metric-card">
                      <div className="metric-label">Open Positions</div>
                      <div className="metric-value purple">
                        <AnimatedCounter value={result.jobOpenings} suffix="+" />
                      </div>
                      <div className="metric-sub">Active job listings</div>
                    </article>
                  )}
                </div>

                {/* Career Timeline */}
                <CareerTimeline timeline={result.careerTimeline} />

                {/* Skill Gap */}
                <div className="glass" style={{ marginTop: 20 }}>
                  <h3 className="section-title">🎯 Skill Gap Analysis</h3>
                  <SkillGapScore matched={(result.matchedSkills || []).length} recommended={(result.recommendedSkills || []).length} />
                </div>

                {/* Top Skills (quick view) */}
                <div className="glass top-skills-card">
                  <h3 className="section-title">🏆 Top In-Demand Skills</h3>
                  <div className="skill-tags">
                    {(result.topSkills || []).map((s, i) => <span key={i} className="skill-tag">{s}</span>)}
                  </div>
                </div>

                <BookmarksWidget bookmarked={bookmarked} onRemove={toggleBookmark} onCopyAll={copyAllBookmarks} />
                <HistoryPanel onLoad={loadFromHistory} />
              </div>
            )}

            {/* ── SKILLS ── */}
            {activeSection === "skills" && (
              <div className="fade-in">
                <MatchedSkillsPanel
                  matchedSkills={result.matchedSkills || []}
                  recommendedSkills={result.recommendedSkills || []}
                  onBookmark={toggleBookmark}
                  bookmarked={bookmarked} />

                {radarData.length > 0 && (
                  <div className="glass radar-card">
                    <h3 className="section-title">🕸️ Skill Strength Profile</h3>
                    <p className="section-hint">Visual overview of your matched skills (illustrative)</p>
                    <div className="chart-wrap">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData}>
                          <PolarGrid stroke="var(--border)" />
                          <PolarAngleAxis dataKey="skill" tick={{ fill: "var(--text-secondary)", fontSize: 11 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "var(--text-dim)", fontSize: 9 }} />
                          <Radar name="Skill Score" dataKey="score" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.25} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── CHART ── */}
            {activeSection === "chart" && (
              <div className="fade-in">
                {salaryChartData.length > 0 && (
                  <div className="glass">
                    <h3 className="section-title">💰 Salary Distribution (USD)</h3>
                    <div className="chart-wrap chart-wrap-lg">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={salaryChartData} barCategoryGap="18%">
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                          <XAxis dataKey="role" tick={{ fill: "var(--text-secondary)", fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={70} />
                          <YAxis tick={{ fill: "var(--text-dim)", fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                          <Tooltip formatter={v => `$${v.toLocaleString()}`}
                            contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--text-primary)" }} />
                          <Legend />
                          <Bar dataKey="Min" fill="var(--chart-min)" radius={[4,4,0,0]} />
                          <Bar dataKey="Median" fill="var(--chart-med)" radius={[4,4,0,0]} />
                          <Bar dataKey="Max" fill="var(--chart-max)" radius={[4,4,0,0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
                <CompareRoles salaryData={result.salaryData || []} />
              </div>
            )}

            {/* ── ROADMAP ── */}
            {activeSection === "roadmap" && (
              <div className="fade-in">
                <LearningRoadmap
                  learningPath={result.learningPath}
                  certifications={result.certifications}
                  companiesHiring={result.companiesHiring} />
              </div>
            )}

            {/* ── TRENDS ── */}
            {activeSection === "trends" && (
              <div className="fade-in">
                <TrendsPanel trends={result.trends} />
              </div>
            )}

            {/* Export bar (always visible in dashboard) */}
            <div className="export-bar" style={{ marginTop: 32 }}>
              <button className="btn-export" onClick={exportJSON}>⬇️ Export JSON</button>
              <button className="btn-export" onClick={copyResultSummary}>{copied ? "✅ Copied!" : "📋 Copy Summary"}</button>
              <button className="btn-export" onClick={() => window.print()}>🖨️ Print PDF</button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
