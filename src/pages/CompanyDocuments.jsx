import React, { useMemo, useState } from "react";
import { FileText, Wand2, Printer, Download, RefreshCw, Building2, Mail, Phone, Globe2 } from "lucide-react";
import "./CompanyDocuments.css";

const DEFAULT_COMPANY = {
  name: "STYLZ DIGITAL SOLUTIONS",
  tagline: "Creative Printing, Branding & Digital Solutions",
  registration: "Reg No. 2023/916461/07 · Zimbabwe & South Africa",
  address: "Randfontein, Gauteng, South Africa",
  phone: "",
  email: "info@stylzdigital.co.za",
  website: "stylzdigital.co.za",
  colors: "#e31b23, #174ea6",
  services: "Large-format printing, digital printing, graphic design, websites, online applications and branding.",
};

const emptyDraft = {
  recipient: "",
  subject: "",
  body: "",
  signatory: "Welly",
  position: "Administrator",
};

function readCompany() {
  try {
    return { ...DEFAULT_COMPANY, ...(JSON.parse(localStorage.getItem("stylz_ims_company_profile") || "{}")) };
  } catch {
    return DEFAULT_COMPANY;
  }
}

function parsePrompt(prompt, company) {
  const text = prompt.trim();
  if (!text) return {};
  const lower = text.toLowerCase();
  const changes = {};
  if (lower.includes("printing")) changes.services = "Professional digital and large-format printing, signage, branding and promotional print solutions.";
  if (lower.includes("construction")) changes.services = "Professional construction and building services with a focus on quality, reliability and customer satisfaction.";
  if (lower.includes("security")) changes.services = "Professional security, guarding and protection services for businesses, properties and events.";
  const nameMatch = text.match(/(?:company|business)\s*(?:name)?\s*[:=-]\s*([^,\n]+)/i);
  if (nameMatch) changes.name = nameMatch[1].trim();
  const taglineMatch = text.match(/(?:tagline|slogan)\s*[:=-]\s*([^,\n]+)/i);
  if (taglineMatch) changes.tagline = taglineMatch[1].trim();
  return changes;
}

function makeProfile(company, prompt) {
  const context = prompt ? ` Based on the brief provided, ${prompt.trim().replace(/\.$/, "")}.` : "";
  return {
    overview: `${company.name} is a customer-focused business committed to delivering dependable, professional solutions with attention to quality, presentation and service.${context}`,
    mission: `To provide practical, high-quality solutions that help customers present, operate and grow their businesses professionally.`,
    vision: `To build a trusted and recognisable brand known for quality workmanship, responsive service and modern solutions.`,
    values: ["Quality", "Reliability", "Creativity", "Professionalism", "Customer service"],
  };
}

export default function CompanyDocuments() {
  const [company, setCompany] = useState(readCompany);
  const [prompt, setPrompt] = useState("");
  const [documentType, setDocumentType] = useState("profile");
  const [draft, setDraft] = useState(emptyDraft);
  const [profile, setProfile] = useState(() => makeProfile(readCompany(), ""));

  const saveCompany = (next) => {
    setCompany(next);
    localStorage.setItem("stylz_ims_company_profile", JSON.stringify(next));
  };

  const generateProfile = () => {
    const changes = parsePrompt(prompt, company);
    const next = { ...company, ...changes };
    saveCompany(next);
    setProfile(makeProfile(next, prompt));
    setDocumentType("profile");
  };

  const generateLetter = () => {
    const changes = parsePrompt(prompt, company);
    const next = { ...company, ...changes };
    saveCompany(next);
    const purpose = prompt.trim() || "a professional business communication";
    setDraft({
      recipient: draft.recipient,
      subject: draft.subject || "Business Communication",
      body: `Dear Sir/Madam,\n\nWe are pleased to introduce ${next.name}. ${purpose.charAt(0).toUpperCase() + purpose.slice(1)}. We would be delighted to discuss how our services can assist you and provide a professional solution tailored to your requirements.\n\nPlease feel free to contact us should you require any further information.\n\nYours faithfully,`,
      signatory: draft.signatory || "Welly",
      position: draft.position || "Administrator",
    });
    setDocumentType("letter");
  };

  const print = () => window.print();
  const profileText = useMemo(() => `${company.name}\n${company.tagline}\n\nABOUT US\n${profile.overview}\n\nMISSION\n${profile.mission}\n\nVISION\n${profile.vision}\n\nOUR VALUES\n${profile.values.join(" • ")}`, [company, profile]);

  const copyText = async () => {
    await navigator.clipboard?.writeText(profileText);
  };

  return (
    <div className="company-documents-page">
      <div className="documents-toolbar no-print">
        <div>
          <div className="eyebrow">DOCUMENT STUDIO</div>
          <h1>Company Profile & Letterhead</h1>
          <p>Generate polished business documents from structured entries or a natural-language prompt.</p>
        </div>
        <div className="toolbar-actions">
          <button className="doc-button secondary" onClick={() => { setPrompt(""); setProfile(makeProfile(company, "")); setDraft(emptyDraft); }}><RefreshCw size={16}/> Reset</button>
          <button className="doc-button primary" onClick={print}><Printer size={16}/> Print / PDF</button>
        </div>
      </div>

      <div className="document-workspace no-print">
        <section className="document-panel">
          <div className="panel-title"><Wand2 size={18}/><div><strong>AI-style prompt builder</strong><span>Describe what you need in plain language.</span></div></div>
          <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Example: Create a modern company profile for a printing and branding company focused on businesses in Randfontein. Make it professional and customer-focused." />
          <div className="generation-actions">
            <button className="doc-button primary" onClick={generateProfile}><Wand2 size={16}/> Generate Profile</button>
            <button className="doc-button outline" onClick={generateLetter}><FileText size={16}/> Generate Letter</button>
          </div>
          <div className="tip">The generator works locally and keeps company information in this browser. It does not require an API key.</div>

          <div className="panel-title entries-title"><Building2 size={18}/><div><strong>Company details</strong><span>These details are reused in every document.</span></div></div>
          <div className="entry-grid">
            {[["name","Company name"],["tagline","Tagline / slogan"],["registration","Registration"],["address","Address"],["phone","Phone"],["email","Email"],["website","Website"],["colors","Brand colours"]].map(([key,label]) => (
              <label key={key}>{label}<input value={company[key] || ""} onChange={e => saveCompany({ ...company, [key]: e.target.value })}/></label>
            ))}
            <label className="wide">Services / description<textarea value={company.services} onChange={e => saveCompany({ ...company, services: e.target.value })}/></label>
          </div>
        </section>

        <section className="document-panel document-options">
          <div className="panel-title"><FileText size={18}/><div><strong>Document type</strong><span>Choose the document to preview.</span></div></div>
          <div className="type-switcher">
            <button className={documentType === "profile" ? "selected" : ""} onClick={() => setDocumentType("profile")}>Company Profile</button>
            <button className={documentType === "letter" ? "selected" : ""} onClick={() => setDocumentType("letter")}>Letterhead</button>
          </div>
          {documentType === "letter" && <div className="entry-grid letter-fields">
            <label>Recipient<input value={draft.recipient} onChange={e => setDraft({...draft, recipient:e.target.value})}/></label>
            <label>Subject<input value={draft.subject} onChange={e => setDraft({...draft, subject:e.target.value})}/></label>
            <label className="wide">Letter body<textarea rows="9" value={draft.body} onChange={e => setDraft({...draft, body:e.target.value})}/></label>
            <label>Signatory<input value={draft.signatory} onChange={e => setDraft({...draft, signatory:e.target.value})}/></label>
            <label>Position<input value={draft.position} onChange={e => setDraft({...draft, position:e.target.value})}/></label>
          </div>}
          {documentType === "profile" && <div className="profile-controls"><button className="doc-button outline" onClick={copyText}>Copy profile text</button><p>Use the prompt repeatedly to create different versions, then edit the company details before printing.</p></div>}
        </section>
      </div>

      <div className="paper-wrap">
        {documentType === "profile" ? <ProfilePreview company={company} profile={profile} /> : <LetterPreview company={company} draft={draft} />}
      </div>
    </div>
  );
}

function Header({ company }) {
  return <div className="doc-header">
    <img src="/stylz_digital_logo.png" alt="Company logo" onError={e => e.currentTarget.style.display = "none"}/>
    <div className="header-brand"><strong>{company.name}</strong><span>{company.tagline}</span></div>
    <div className="header-contact"><span><Phone size={11}/> {company.phone || ""}</span><span><Mail size={11}/> {company.email}</span><span><Globe2 size={11}/> {company.website}</span></div>
  </div>;
}

function ProfilePreview({ company, profile }) {
  return <article className="paper profile-paper">
    <Header company={company}/>
    <div className="profile-hero"><span>COMPANY PROFILE</span><h2>{company.name}</h2><p>{company.tagline}</p></div>
    <div className="profile-body">
      <section><h3>About Us</h3><p>{profile.overview}</p></section>
      <div className="two-col"><section><h3>Our Mission</h3><p>{profile.mission}</p></section><section><h3>Our Vision</h3><p>{profile.vision}</p></section></div>
      <section><h3>What We Do</h3><p>{company.services}</p></section>
      <section><h3>Our Values</h3><div className="value-grid">{profile.values.map(v => <div key={v}>{v}</div>)}</div></section>
    </div>
    <footer className="doc-footer"><span>{company.registration}</span><span>{company.address}</span></footer>
  </article>;
}

function LetterPreview({ company, draft }) {
  return <article className="paper letter-paper">
    <Header company={company}/>
    <div className="letter-meta"><span>{new Date().toLocaleDateString("en-ZA")}</span><span>Ref: STZ-DOC-{new Date().getFullYear()}</span></div>
    <div className="letter-recipient">{draft.recipient || "Recipient Name"}<br/><span>{company.address}</span></div>
    <h2 className="letter-subject">{draft.subject || "Business Communication"}</h2>
    <div className="letter-body">{(draft.body || "Dear Sir/Madam,\n\nYour letter content will appear here.").split("\n").map((line, i) => <p key={i}>{line || "\u00a0"}</p>)}</div>
    <div className="signature"><strong>{draft.signatory || "Welly"}</strong><span>{draft.position || "Administrator"}</span><span>{company.name}</span></div>
    <footer className="doc-footer"><span>{company.registration}</span><span>{company.email} · {company.website}</span></footer>
  </article>;
}
