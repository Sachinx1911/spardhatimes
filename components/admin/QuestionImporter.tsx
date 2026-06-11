"use client";

import React, { useState, useRef } from "react";
import { bulkImportQuestions } from "@/app/actions/admin";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Select } from "../ui/select";
import { 
  FileSpreadsheet, 
  UploadCloud, 
  AlertTriangle, 
  CheckCircle, 
  Trash2, 
  Download,
  AlertCircle,
  FileText,
  HelpCircle,
  CheckCircle2
} from "lucide-react";
import * as XLSX from "xlsx";

interface Quiz {
  id: string;
  title: string;
}

interface ParsedRow {
  Question?: string;
  "Option A"?: string;
  "Option B"?: string;
  "Option C"?: string;
  "Option D"?: string;
  "Correct Answer"?: string;
  Explanation?: string;
  Category?: string;
  Difficulty?: string;
  Type?: string; // SINGLE (default) / MULTIPLE / TRUEFALSE
}

// Mirrors the server-side Type mapping in bulkImportQuestions.
function resolveRowType(raw?: string): "SINGLE" | "MULTIPLE" | "TRUEFALSE" {
  const t = String(raw || "").toUpperCase().replace(/[^A-Z]/g, "");
  if (t.startsWith("MULTI")) return "MULTIPLE";
  if (t.startsWith("TRUE")) return "TRUEFALSE";
  return "SINGLE";
}

interface ValidatedRow {
  data: ParsedRow;
  isValid: boolean;
  errors: string[];
  isDuplicate: boolean;
}

export function QuestionImporter({ quizzes }: { quizzes: Quiz[] }) {
  const [selectedQuizId, setSelectedQuizId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [validatedRows, setValidatedRows] = useState<ValidatedRow[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [successCount, setSuccessCount] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Download sample Excel sheet generated dynamically
  const handleDownloadSample = () => {
    const sampleData = [
      {
        "Question": "What is the capital of France?",
        "Option A": "Berlin",
        "Option B": "Madrid",
        "Option C": "Paris",
        "Option D": "Rome",
        "Correct Answer": "C",
        "Explanation": "Paris is the capital and largest city of France.",
        "Category": "Geography",
        "Difficulty": "EASY",
        "Type": "SINGLE"
      },
      {
        "Question": "Which of the following are prime numbers?",
        "Option A": "2",
        "Option B": "4",
        "Option C": "7",
        "Option D": "9",
        "Correct Answer": "A,C",
        "Explanation": "2 and 7 are prime; 4 and 9 are composite.",
        "Category": "Mathematics",
        "Difficulty": "MEDIUM",
        "Type": "MULTIPLE"
      },
      {
        "Question": "The Sun rises in the east.",
        "Option A": "",
        "Option B": "",
        "Option C": "",
        "Option D": "",
        "Correct Answer": "TRUE",
        "Explanation": "Due to Earth's west-to-east rotation, the Sun appears to rise in the east.",
        "Category": "Science",
        "Difficulty": "EASY",
        "Type": "TRUEFALSE"
      },
      {
        "Question": "Invalid Question Sample (This will show as error)",
        "Option A": "Missing options and correct answer will trigger validation alerts",
        "Option B": "",
        "Option C": "",
        "Option D": "",
        "Correct Answer": "",
        "Explanation": "Demonstration row.",
        "Category": "",
        "Difficulty": "MEDIUM",
        "Type": "SINGLE"
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "QuestionsTemplate");
    XLSX.writeFile(workbook, "quiz_questions_import_sample.xlsx");
  };

  // 2. Parse Excel file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (uploadedFile: File) => {
    setFile(uploadedFile);
    setError("");
    setSuccess(false);

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      if (!data) return;

      try {
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<ParsedRow>(worksheet);
        
        validateData(jsonData);
      } catch (err) {
        setError("Failed to parse Excel file. Please verify it is a valid XLSX/XLS document.");
        setFile(null);
      }
    };
    reader.readAsArrayBuffer(uploadedFile);
  };

  // 3. Validation Logic
  const validateData = (rows: ParsedRow[]) => {
    const questionTexts = new Set<string>();
    const validated: ValidatedRow[] = [];

    for (const r of rows) {
      const errors: string[] = [];
      const questionText = String(r.Question || "").trim();
      const rowType = resolveRowType(r.Type);

      // Check empty question
      if (!questionText) {
        errors.push("Empty Question field");
      }

      // Check options (True/False rows auto-fill True/False options)
      if (rowType !== "TRUEFALSE") {
        if (!r["Option A"]) errors.push("Missing Option A");
        if (!r["Option B"]) errors.push("Missing Option B");
        if (!r["Option C"]) errors.push("Missing Option C");
        if (!r["Option D"]) errors.push("Missing Option D");
      }

      // Check answer key per question type
      const ans = String(r["Correct Answer"] || "").toUpperCase().trim();
      if (!ans) {
        errors.push("Missing Correct Answer");
      } else if (rowType === "TRUEFALSE") {
        if (!["TRUE", "FALSE", "A", "B"].includes(ans)) {
          errors.push(`Invalid True/False answer: "${ans}" (Must be TRUE or FALSE)`);
        }
      } else if (rowType === "MULTIPLE") {
        const letters = ans.split(",").map((s) => s.trim()).filter(Boolean);
        const invalid = letters.filter((l) => !["A", "B", "C", "D"].includes(l));
        if (letters.length === 0 || invalid.length > 0) {
          errors.push(`Invalid multi-choice answer: "${ans}" (Use comma list like "A,C")`);
        }
      } else if (!["A", "B", "C", "D"].includes(ans)) {
        errors.push(`Invalid Correct Answer: "${ans}" (Must be A, B, C, or D)`);
      }

      // Check Category
      if (!r.Category) {
        errors.push("Missing Category");
      }

      // Duplicate Check
      let isDuplicate = false;
      if (questionText) {
        if (questionTexts.has(questionText.toLowerCase())) {
          isDuplicate = true;
          errors.push("Duplicate question detected in the spreadsheet");
        } else {
          questionTexts.add(questionText.toLowerCase());
        }
      }

      validated.push({
        data: r,
        isValid: errors.length === 0,
        errors,
        isDuplicate
      });
    }

    setValidatedRows(validated);
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  // 4. Trigger bulk import
  const handleImport = async () => {
    if (!selectedQuizId) {
      setError("Please select a target quiz to import questions into.");
      return;
    }

    const validQuestions = validatedRows
      .filter((r) => r.isValid)
      .map((r) => r.data);

    if (validQuestions.length === 0) {
      setError("No valid questions found to import.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await bulkImportQuestions(selectedQuizId, validQuestions);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        setSuccessCount(res.count!);
        // Reset file state
        setFile(null);
        setValidatedRows([]);
      }
    } catch (err) {
      setError("Connection error during question import.");
    } finally {
      setLoading(false);
    }
  };

  // Counts
  const totalCount = validatedRows.length;
  const validCount = validatedRows.filter((r) => r.isValid).length;
  const errorCount = totalCount - validCount;

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-foreground">Excel Bulk Import Module</h2>
        <p className="text-xs text-muted-foreground">Upload spreadsheet files to insert questions into a specific quiz.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: upload controls */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-5 space-y-4">
            
            {/* Quiz Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Target Quiz
              </label>
              <Select 
                value={selectedQuizId} 
                onChange={(e) => setSelectedQuizId(e.target.value)}
              >
                <option value="">-- Select Target Quiz --</option>
                {quizzes.map((q) => (
                  <option key={q.id} value={q.id}>{q.title}</option>
                ))}
              </Select>
            </div>

            {/* Drag and Drop Zone */}
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragOver 
                  ? "border-primary bg-primary/5" 
                  : "border-border/60 hover:bg-slate-50 dark:hover:bg-slate-900"
              }`}
            >
              <input 
                ref={fileInputRef}
                type="file" 
                accept=".xlsx,.xls" 
                onChange={handleFileChange}
                className="hidden"
              />
              <UploadCloud className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
              <p className="font-bold text-sm text-foreground">
                {file ? file.name : "Drag & Drop spreadsheet"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Supports .XLSX, .XLS files
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <Button 
                onClick={handleImport} 
                className="w-full font-semibold text-xs h-10" 
                disabled={loading || !file || !selectedQuizId || validCount === 0}
              >
                {loading ? "Importing..." : `Import ${validCount} Questions`}
              </Button>
              
              <Button 
                onClick={handleDownloadSample} 
                variant="outline" 
                className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold h-10"
              >
                <Download className="h-4 w-4" /> Download Excel Format
              </Button>
            </div>

          </Card>
        </div>

        {/* Right column: preview table & validation alerts */}
        <div className="lg:col-span-2 space-y-6">
          {error && (
            <div className="flex items-center gap-2.5 bg-danger/10 border border-danger/20 p-4 rounded-lg text-danger text-sm">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex flex-col items-center justify-center bg-success/10 border border-success/20 p-6 rounded-lg text-success text-center space-y-2">
              <CheckCircle2 className="h-10 w-10 text-success" />
              <h4 className="font-bold text-base">Questions Imported Successfully!</h4>
              <p className="text-xs">
                Successfully inserted {successCount} questions into your quiz. Database transaction committed.
              </p>
            </div>
          )}

          {file && (
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4">
                <div>
                  <CardTitle className="text-base font-bold">Import Spreadsheet Preview</CardTitle>
                  <CardDescription>Review parsed rows, error notifications, and warnings.</CardDescription>
                </div>
                <div className="flex gap-3 text-xs shrink-0 font-semibold">
                  <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded">Total: {totalCount}</span>
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400 rounded">Valid: {validCount}</span>
                  <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-400 rounded">Errors: {errorCount}</span>
                </div>
              </CardHeader>
              <CardContent className="p-0 max-h-[50vh] overflow-y-auto">
                {validatedRows.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground text-sm">No rows parsed from file.</div>
                ) : (
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950 border-b border-border/40 font-semibold text-muted-foreground uppercase tracking-wider">
                        <th className="p-3 w-12 text-center">Status</th>
                        <th className="p-3">Question</th>
                        <th className="p-3">Answer</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Alerts / Errors</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {validatedRows.map((r, index) => (
                        <tr 
                          key={index} 
                          className={`hover:bg-slate-50/50 dark:hover:bg-slate-950/20 ${
                            !r.isValid ? "bg-red-500/5" : ""
                          }`}
                        >
                          <td className="p-3 text-center">
                            {r.isValid ? (
                              <CheckCircle className="h-4 w-4 text-emerald-500 mx-auto" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-red-500 mx-auto" />
                            )}
                          </td>
                          <td className="p-3 font-semibold max-w-[200px] truncate">{r.data.Question || "(Empty)"}</td>
                          <td className="p-3 font-mono font-bold text-center w-16">{r.data["Correct Answer"] || "-"}</td>
                          <td className="p-3 text-muted-foreground">{r.data.Category || "-"}</td>
                          <td className="p-3 text-red-600 font-semibold max-w-[200px]">
                            {r.errors.length > 0 ? (
                              <ul className="list-disc pl-4 space-y-0.5">
                                {r.errors.map((err, i) => <li key={i}>{err}</li>)}
                              </ul>
                            ) : (
                              <span className="text-emerald-600">Row is Valid</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          )}

        </div>

      </div>

    </div>
  );
}
