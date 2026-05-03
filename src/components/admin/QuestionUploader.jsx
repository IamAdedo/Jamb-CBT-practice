import { useState, useRef } from "react";
import { supabase } from "../../lib/supabaseClient";

const SUBJECTS = [
  "English Language", "Mathematics", "Physics", "Chemistry",
  "Biology", "Geography", "Government", "Economics",
  "Literature", "Commerce", "Accounting", "Agricultural Science", "CRS", "IRS",
];

const VALID_ANSWERS = ["A", "B", "C", "D"];

// ── JSON template the admin can download as a reference ──────────────────────
const JSON_TEMPLATE = JSON.stringify([
  {
    subject: "Mathematics",
    question_text: "What is 2 + 2?",
    option_a: "3",
    option_b: "4",
    option_c: "5",
    option_d: "6",
    correct_answer: "B",
    year: 2023,
    explanation: "2 + 2 equals 4.",
  },
], null, 2);

const CSV_TEMPLATE =
  `subject,question_text,option_a,option_b,option_c,option_d,correct_answer,year,explanation\n` +
  `Mathematics,What is 2 + 2?,3,4,5,6,B,2023,2 + 2 equals 4.`;

// ── Validators ────────────────────────────────────────────────────────────────
function validateRow(row, index) {
  const errors = [];
  const n = `Row ${index + 1}`;

  if (!SUBJECTS.includes(row.subject))
    errors.push(`${n}: Invalid subject "${row.subject}"`);
  if (!row.question_text?.trim())
    errors.push(`${n}: Missing question_text`);
  if (!row.option_a?.trim()) errors.push(`${n}: Missing option_a`);
  if (!row.option_b?.trim()) errors.push(`${n}: Missing option_b`);
  if (!row.option_c?.trim()) errors.push(`${n}: Missing option_c`);
  if (!row.option_d?.trim()) errors.push(`${n}: Missing option_d`);
  if (!VALID_ANSWERS.includes(row.correct_answer?.toUpperCase()))
    errors.push(`${n}: correct_answer must be A, B, C, or D`);

  return errors;
}

function parseCSV(text) {
  const [headerLine, ...rows] = text.trim().split("\n");
  const headers = headerLine.split(",").map((h) => h.trim().toLowerCase());

  return rows.map((row) => {
    const values = row.split(",").map((v) => v.trim());
    const obj = {};
    headers.forEach((h, i) => { obj[h] = values[i] || ""; });
    if (obj.correct_answer) obj.correct_answer = obj.correct_answer.toUpperCase();
    if (obj.year) obj.year = parseInt(obj.year) || null;
    return obj;
  });
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function QuestionUploader() {
  const fileRef = useRef(null);

  const [tab, setTab]           = useState("upload"); // "upload" | "manual"
  const [parsed, setParsed]     = useState([]);
  const [errors, setErrors]     = useState([]);
  const [uploading, setUploading] = useState(false);
  const [result, setResult]     = useState(null); // { inserted, failed }
  const [fileName, setFileName] = useState("");

  // Manual form state
  const [manual, setManual] = useState({
    subject: "", question_text: "", option_a: "", option_b: "",
    option_c: "", option_d: "", correct_answer: "", year: "", explanation: "",
  });
  const [manualError, setManualError]   = useState("");
  const [manualSuccess, setManualSuccess] = useState("");

  // ── File parsing ────────────────────────────────────────────────────────────
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setParsed([]);
    setErrors([]);
    setResult(null);

    const reader = new FileReader();
    reader.onload = ({ target: { result: text } }) => {
      try {
        let rows;
        if (file.name.endsWith(".json")) {
          rows = JSON.parse(text);
          if (!Array.isArray(rows)) throw new Error("JSON must be an array");
        } else {
          rows = parseCSV(text);
        }

        const allErrors = rows.flatMap((r, i) => validateRow(r, i));
        setErrors(allErrors);
        setParsed(rows);
      } catch (err) {
        setErrors([`Parse error: ${err.message}`]);
      }
    };
    reader.readAsText(file);
  };

  // ── Bulk upload ─────────────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!parsed.length || errors.length) return;
    setUploading(true);
    setResult(null);

    const clean = parsed.map((r) => ({
      subject:       r.subject,
      question_text: r.question_text.trim(),
      option_a:      r.option_a.trim(),
      option_b:      r.option_b.trim(),
      option_c:      r.option_c.trim(),
      option_d:      r.option_d.trim(),
      correct_answer: r.correct_answer.toUpperCase(),
      year:          r.year ? parseInt(r.year) : null,
      explanation:   r.explanation?.trim() || null,
    }));

    // Batch in chunks of 100
    let inserted = 0, failed = 0;
    for (let i = 0; i < clean.length; i += 100) {
      const chunk = clean.slice(i, i + 100);
      const { error } = await supabase.from("questions").insert(chunk);
      if (error) { failed += chunk.length; console.error(error); }
      else inserted += chunk.length;
    }

    setResult({ inserted, failed });
    setUploading(false);
    if (!failed) { setParsed([]); setFileName(""); }
  };

  // ── Manual submit ────────────────────────────────────────────────────────────
  const handleManual = async (e) => {
    e.preventDefault();
    setManualError("");
    setManualSuccess("");

    const errs = validateRow(manual, 0);
    if (errs.length) { setManualError(errs.join(" · ")); return; }

    const { error } = await supabase.from("questions").insert({
      ...manual,
      correct_answer: manual.correct_answer.toUpperCase(),
      year: manual.year ? parseInt(manual.year) : null,
      explanation: manual.explanation || null,
    });

    if (error) { setManualError(error.message); return; }

    setManualSuccess("✓ Question added successfully!");
    setManual({
      subject: "", question_text: "", option_a: "", option_b: "",
      option_c: "", option_d: "", correct_answer: "", year: "", explanation: "",
    });
  };

  // ── Download templates ───────────────────────────────────────────────────────
  const download = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {["upload", "manual"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-sm font-semibold capitalize transition
              border-b-2 -mb-px
              ${tab === t
                ? "border-jamb-blue text-jamb-blue"
                : "border-transparent text-gray-500 hover:text-jamb-blue"}`}
          >
            {t === "upload" ? "📁 Bulk Upload" : "✏️ Add Single Question"}
          </button>
        ))}
      </div>

      {/* ── BULK UPLOAD TAB ── */}
      {tab === "upload" && (
        <div className="space-y-6">

          {/* Template downloads */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-jamb-blue mb-3">
              📥 Download a template to get started:
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => download(JSON_TEMPLATE, "questions_template.json", "application/json")}
                className="text-sm bg-white border border-jamb-blue text-jamb-blue
                           px-4 py-2 rounded-lg font-medium hover:bg-jamb-light transition"
              >
                ⬇ JSON Template
              </button>
              <button
                onClick={() => download(CSV_TEMPLATE, "questions_template.csv", "text/csv")}
                className="text-sm bg-white border border-jamb-blue text-jamb-blue
                           px-4 py-2 rounded-lg font-medium hover:bg-jamb-light transition"
              >
                ⬇ CSV Template
              </button>
            </div>
          </div>

          {/* Drop zone */}
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-xl p-10
                       text-center cursor-pointer hover:border-jamb-blue
                       hover:bg-jamb-light transition group"
          >
            <p className="text-4xl mb-3">📂</p>
            <p className="font-semibold text-gray-600 group-hover:text-jamb-blue">
              Click to select a JSON or CSV file
            </p>
            {fileName && (
              <p className="mt-2 text-sm text-jamb-blue font-medium">{fileName}</p>
            )}
            <input
              ref={fileRef}
              type="file"
              accept=".json,.csv"
              className="hidden"
              onChange={handleFile}
            />
          </div>

          {/* Validation errors */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4
                            max-h-48 overflow-y-auto">
              <p className="text-sm font-bold text-red-600 mb-2">
                ❌ {errors.length} validation error(s):
              </p>
              <ul className="text-sm text-red-500 space-y-1 list-disc list-inside">
                {errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}

          {/* Preview */}
          {parsed.length > 0 && !errors.length && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm font-bold text-jamb-green mb-3">
                ✓ {parsed.length} question(s) validated and ready to upload
              </p>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {parsed.slice(0, 5).map((q, i) => (
                  <div key={i} className="text-xs bg-white rounded-lg p-3
                                          border border-green-100">
                    <span className="font-bold text-jamb-blue">[{q.subject}]</span>{" "}
                    {q.question_text.slice(0, 80)}
                    {q.question_text.length > 80 ? "…" : ""}
                  </div>
                ))}
                {parsed.length > 5 && (
                  <p className="text-xs text-gray-400 text-center">
                    …and {parsed.length - 5} more
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Upload result */}
          {result && (
            <div className={`rounded-xl p-4 border text-sm font-medium
              ${result.failed
                ? "bg-orange-50 border-orange-200 text-orange-700"
                : "bg-green-50 border-green-200 text-jamb-green"}`}>
              {result.failed
                ? `⚠️ ${result.inserted} inserted, ${result.failed} failed. Check console for details.`
                : `🎉 Successfully inserted ${result.inserted} question(s)!`}
            </div>
          )}

          {/* Upload button */}
          <button
            onClick={handleUpload}
            disabled={!parsed.length || !!errors.length || uploading}
            className="w-full bg-jamb-blue text-white py-3 rounded-xl font-bold
                       hover:bg-blue-900 transition disabled:opacity-40
                       disabled:cursor-not-allowed"
          >
            {uploading
              ? "Uploading…"
              : `Upload ${parsed.length || ""} Question${parsed.length !== 1 ? "s" : ""}`}
          </button>
        </div>
      )}

      {/* ── MANUAL TAB ── */}
      {tab === "manual" && (
        <form onSubmit={handleManual} className="space-y-4">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Subject */}
            <div>
              <label className="label">Subject *</label>
              <select
                value={manual.subject}
                onChange={(e) => setManual({ ...manual, subject: e.target.value })}
                required
                className="input"
              >
                <option value="">Select subject…</option>
                {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>

            {/* Year */}
            <div>
              <label className="label">Year (optional)</label>
              <input
                type="number"
                placeholder="e.g. 2023"
                value={manual.year}
                onChange={(e) => setManual({ ...manual, year: e.target.value })}
                className="input"
                min="1990" max="2099"
              />
            </div>
          </div>

          {/* Question text */}
          <div>
            <label className="label">Question Text *</label>
            <textarea
              rows={3}
              value={manual.question_text}
              onChange={(e) => setManual({ ...manual, question_text: e.target.value })}
              required
              className="input resize-none"
              placeholder="Type the question here…"
            />
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {["a", "b", "c", "d"].map((letter) => (
              <div key={letter}>
                <label className="label">Option {letter.toUpperCase()} *</label>
                <input
                  type="text"
                  value={manual[`option_${letter}`]}
                  onChange={(e) =>
                    setManual({ ...manual, [`option_${letter}`]: e.target.value })
                  }
                  required
                  className="input"
                  placeholder={`Option ${letter.toUpperCase()}`}
                />
              </div>
            ))}
          </div>

          {/* Correct answer */}
          <div>
            <label className="label">Correct Answer *</label>
            <div className="flex gap-3">
              {VALID_ANSWERS.map((ans) => (
                <button
                  type="button"
                  key={ans}
                  onClick={() => setManual({ ...manual, correct_answer: ans })}
                  className={`w-12 h-12 rounded-xl font-bold text-lg border-2 transition
                    ${manual.correct_answer === ans
                      ? "bg-jamb-green text-white border-jamb-green"
                      : "bg-white text-gray-600 border-gray-300 hover:border-jamb-green"}`}
                >
                  {ans}
                </button>
              ))}
            </div>
          </div>

          {/* Explanation */}
          <div>
            <label className="label">Explanation (optional)</label>
            <textarea
              rows={2}
              value={manual.explanation}
              onChange={(e) => setManual({ ...manual, explanation: e.target.value })}
              className="input resize-none"
              placeholder="Briefly explain why this answer is correct…"
            />
          </div>

          {manualError && (
            <p className="text-red-500 text-sm">{manualError}</p>
          )}
          {manualSuccess && (
            <p className="text-jamb-green font-semibold text-sm">{manualSuccess}</p>
          )}

          <button
            type="submit"
            className="w-full bg-jamb-blue text-white py-3 rounded-xl font-bold
                       hover:bg-blue-900 transition"
          >
            Add Question
          </button>
        </form>
      )}
    </div>
  );
}
