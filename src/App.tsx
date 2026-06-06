/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Briefcase,
  CheckSquare,
  Clock,
  Calendar,
  RotateCcw,
  Zap,
  TrendingUp,
  Sliders,
  Send,
  Lock,
  MessageSquare,
  Plus,
  HelpCircle,
  FileSpreadsheet
} from "lucide-react";
import { BaseCounters, Report, TASK_CONFIGS } from "./types";
import { generateAutomatedSummary, getFriendlyDate, getInitialCounters } from "./utils";
import { TaskCard } from "./components/TaskCard";
import { OtherTasksManager } from "./components/OtherTasksManager";
import { ReportArchive } from "./components/ReportArchive";

export default function App() {
  const [counters, setCounters] = useState<BaseCounters>(getInitialCounters());
  const [comments, setComments] = useState<string[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [focusedKey, setFocusedKey] = useState<keyof BaseCounters | null>(null);
  const [time, setTime] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [buttonSearchQuery, setButtonSearchQuery] = useState<string>("");

  // Keep track of incoming call timestamps (e.g. ['11:21:40 AM']) with persistent local cache
  const [incomingCallTimes, setIncomingCallTimes] = useState<string[]>(() => {
    const saved = localStorage.getItem("office_activity_tracker_draft_incoming_times");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("office_activity_tracker_draft_incoming_times", JSON.stringify(incomingCallTimes));
  }, [incomingCallTimes]);

  // Clock trigger to keep real-time desk tracking fresh
  useEffect(() => {
    const updateTime = () => {
      const friendlyObj = getFriendlyDate();
      setDate(friendlyObj.dateString);
      setTime(friendlyObj.timeString);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Load Reports from append-only LocalStorage
  useEffect(() => {
    const stored = localStorage.getItem("office_activity_tracker_reports");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Report[];
        // Sort newest first
        parsed.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setReports(parsed);
      } catch (err) {
        console.error("Failed to parse archived reports ledger", err);
      }
    }
  }, []);

  // Callback to increment a task counter by 1
  const handleIncrement = (key: keyof BaseCounters) => {
    setCounters((prev) => {
      const nextVal = prev[key] + 1;
      return { ...prev, [key]: nextVal };
    });
    setFocusedKey(key);

    if (key === "incomingCalls") {
      const timeObj = getFriendlyDate();
      // Extract only the hour:minute:second part for compact display
      setIncomingCallTimes((prev) => [...prev, timeObj.timeString]);
    }
  };

  // Callback to decrement a task counter by 1 (clamped at 0)
  const handleDecrement = (key: keyof BaseCounters) => {
    setCounters((prev) => {
      const nextVal = Math.max(0, prev[key] - 1);
      return { ...prev, [key]: nextVal };
    });
    setFocusedKey(key);

    if (key === "incomingCalls") {
      setIncomingCallTimes((prev) => prev.slice(0, -1));
    }
  };

  // Callback to set specific task count manually (for adjustments)
  const handleSetSpecific = (key: keyof BaseCounters, value: number) => {
    const nextVal = Math.max(0, value);
    setCounters((prev) => ({
      ...prev,
      [key]: nextVal,
    }));
    setFocusedKey(key);

    if (key === "incomingCalls") {
      setIncomingCallTimes((prev) => {
        const diff = nextVal - prev.length;
        if (diff > 0) {
          const nowStr = new Date().toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          });
          const extra = Array(diff).fill(nowStr);
          return [...prev, ...extra];
        } else if (diff < 0) {
          return prev.slice(0, nextVal);
        }
        return prev;
      });
    }
  };

  // Reset counters to pristine state for active session draft
  const handleClearDraft = () => {
    const hasActiveValues = (Object.keys(counters) as Array<keyof BaseCounters>).some((k) => counters[k] > 0) || comments.length > 0;
    if (hasActiveValues) {
      if (window.confirm("Are you sure you want to reset your current draft counters? This cannot be undone.")) {
        setCounters(getInitialCounters());
        setComments([]);
        setIncomingCallTimes([]);
        setFocusedKey(null);
      }
    }
  };

  // Add Comment to "Other Tasks" lists
  const handleAddComment = (comment: string) => {
    setComments((prev) => [...prev, comment]);
    // Automatically increment the 'other' counter to align with comments inputted
    setCounters((prev) => ({
      ...prev,
      other: Math.max(Number(prev.other), comments.length + 1),
    }));
    setFocusedKey("other");
  };

  // Remove comment list element
  const handleRemoveComment = (indexToKill: number) => {
    setComments((prev) => prev.filter((_, idx) => idx !== indexToKill));
    setCounters((prev) => ({
      ...prev,
      other: Math.max(0, Number(prev.other) - 1),
    }));
  };

  // Compile active session, generate professional report, and commit to locked ledger archive
  const handleCompileAndSave = () => {
    const totalItems = (Object.keys(counters) as Array<keyof BaseCounters>).reduce(
      (sum, k) => sum + Number(counters[k]),
      0
    );
    if (totalItems === 0) {
      alert("Please log at least 1 task or counter before compiling a summary report.");
      return;
    }

    const compiledText = generateAutomatedSummary(counters, comments);
    const timeObj = getFriendlyDate();

    const newReport: Report = {
      id: `report_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      dateString: timeObj.dateString,
      timeString: timeObj.timeString,
      counts: { ...counters },
      comments: [...comments],
      manualSummaryText: compiledText,
      incomingCallTimes: [...incomingCallTimes],
    };

    const nextReports = [newReport, ...reports];
    setReports(nextReports);
    localStorage.setItem("office_activity_tracker_reports", JSON.stringify(nextReports));

    // Reset draft counters successfully to prompt for next task session
    setCounters(getInitialCounters());
    setComments([]);
    setIncomingCallTimes([]);
    setFocusedKey(null);

    // Dynamic toast highlight
    const notification = document.getElementById("save-notification");
    if (notification) {
      notification.classList.remove("opacity-0", "translate-y-2");
      notification.classList.add("opacity-100", "translate-y-0");
      setTimeout(() => {
        notification.classList.remove("opacity-100", "translate-y-0");
        notification.classList.add("opacity-0", "translate-y-2");
      }, 3505);
    }
  };

  const handleRemoveReport = (id: string) => {
    const nextReports = reports.filter((r) => r.id !== id);
    setReports(nextReports);
    localStorage.setItem("office_activity_tracker_reports", JSON.stringify(nextReports));
  };

  const handleUpdateReport = (id: string, updatedReport: Report) => {
    const nextReports = reports.map((r) => (r.id === id ? updatedReport : r));
    setReports(nextReports);
    localStorage.setItem("office_activity_tracker_reports", JSON.stringify(nextReports));
  };

  // Quick action: Tap a suggestion button to increment its specific counter
  const handleQuickTap = (key: keyof BaseCounters) => {
    handleIncrement(key);
  };

  // Task Category Groupings for Grid Segmentation
  const groups = [
    {
      title: "📞 Incoming Inbound Intake",
      keys: ["incomingCalls", "receivedRsoRto", "incomingHandcarryFiles"] as const,
      bg: "bg-blue-50/20 text-blue-900 border-blue-100/50",
    },
    {
      title: "📨 Processed Document Logistics",
      keys: ["filesAdRamsHead", "processedSecondCopiesCo", "scanFiles", "stampedDocuments", "inventoryRecords"] as const,
      bg: "bg-indigo-50/20 text-indigo-900 border-indigo-100/50",
    },
    {
      title: "🚚 Processed Messengerial Spends",
      keys: ["messengerialCoPsp", "messengerialPsp", "messengerialGeneral", "messengerialPostal"] as const,
      bg: "bg-purple-50/20 text-purple-900 border-purple-100/50",
    },
    {
      title: "📤 Outgoing Dispatches",
      keys: ["outgoingDocuments", "outgoingRsoRto", "outgoingSecondCopies"] as const,
      bg: "bg-amber-50/20 text-amber-900 border-amber-100/50",
    },
  ];

  // Dynamic values summary for live statistics widget
  const totalCount = (Object.keys(counters) as Array<keyof BaseCounters>).reduce(
    (sum, k) => sum + Number(counters[k]),
    0
  );

  return (
    <div id="office-tracker-root" className="min-h-screen bg-slate-50 text-slate-800 font-sans leading-normal antialiased pb-12">
      {/* Top Banner Message Notification */}
      <div
        id="save-notification"
        className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white rounded-xl shadow-lg border border-slate-800 p-4 flex items-center gap-3 transition-all duration-300 transform opacity-0 translate-y-2 pointer-events-none"
      >
        <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
          ✓
        </div>
        <div>
          <h4 className="text-xs font-bold">Log Record Committed Successfully</h4>
          <p className="text-[10px] text-slate-400">Archived append-only report generated securely.</p>
        </div>
      </div>

      {/* Main Container Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-3xs py-3 px-6 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-black shadow-xs">
              <Briefcase className="w-4 h-4" id="app-header-logo-icon" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2 select-none">
                RAMSync
                <span className="text-blue-600 font-bold text-xs bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">v2.4</span>
                <span className="hidden sm:inline text-[9px] bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">
                  Internal Ledger
                </span>
              </h1>
              <p className="text-xs text-slate-400 font-medium">
                Operate high-fidelity counters, log documents, and catalog activities securely.
              </p>
            </div>
          </div>

          {/* Right section: System Time / User status */}
          <div className="flex items-center gap-5 justify-between md:justify-end self-stretch md:self-auto">
            <div className="text-right">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Shift Duration Tracker</p>
              <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-slate-700">
                <Clock className="w-3.5 h-3.5 text-blue-600 inline" />
                <span>{time || "00:00:00"}</span>
              </div>
            </div>
            
            <div className="h-8 w-[1px] bg-slate-200"></div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs select-none">
                MB
              </div>
              <div className="text-left select-none">
                <span className="text-xs font-semibold text-slate-700 block">M. Baniqued</span>
                <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider block">● Active Now</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 mt-6 space-y-6">
        
        {/* Dynamic Analytics Counter Strip / Desk Statistics */}
        <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-slate-900 text-white rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
          {/* Subtle geometry graphics backgrounds */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/15 rounded-full blur-2xl pointer-events-none" />
          
          <div className="space-y-1.5 relative z-10">
            <h2 className="text-sm font-extrabold tracking-wide uppercase text-blue-300 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" /> Active Session Tracking Core
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              These counts constitute your current operational draft. Increment actions by clicking buttons below. Every logged session can be saved chronologically to your locked local audit catalog.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xs border border-white/10 px-5 py-3 rounded-xl shrink-0 self-start md:self-auto select-none relative z-10 transition-colors hover:bg-white/15">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-blue-300 tracking-wider block">Active Draft Items</span>
              <span className="text-xs text-slate-300 font-medium font-mono">{date || "Today"}</span>
            </div>
            <span className="text-3xl font-extrabold font-mono text-emerald-400 tracking-tight pl-2 border-l border-white/20">
              {totalCount}
            </span>
          </div>
        </div>

        {/* Triple Column Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Block: Interactive counter buttons (8 columns on lg) */}
          <div className="lg:col-span-8 flex flex-col gap-6 font-sans">
            
            {/* Beautiful, responsive Search & Filter bar for action buttons */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-3xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Sliders className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h3 className="font-extrabold text-slate-800 text-sm leading-tight">🔍 Instant Button Search</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5 animate-pulse">Filter buttons by category, title, or task description</p>
                </div>
              </div>
              <div className="relative w-full sm:w-64 shrink-0">
                <input
                  type="text"
                  placeholder="Filter buttons (e.g., Scan, handcarry, Call)..."
                  value={buttonSearchQuery}
                  onChange={(e) => setButtonSearchQuery(e.target.value)}
                  className="w-full pl-3 pr-8 py-2 border border-slate-200 bg-slate-50 focus:bg-white rounded-lg text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500 transition-all font-sans"
                />
                {buttonSearchQuery && (
                  <button
                    onClick={() => setButtonSearchQuery("")}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 font-extrabold text-sm leading-none cursor-pointer select-none"
                    title="Clear filter query"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Filter rendering computation */}
            {(() => {
              // Pre-filter groups based on matching keys
              const matchedGroups = groups.map((group) => {
                const visibleKeys = group.keys.filter((key) => {
                  const configInstance = TASK_CONFIGS.find((c) => c.key === key);
                  if (!configInstance) return false;
                  if (!buttonSearchQuery.trim()) return true;
                  const query = buttonSearchQuery.toLowerCase();
                  return (
                    configInstance.label.toLowerCase().includes(query) ||
                    configInstance.description.toLowerCase().includes(query) ||
                    configInstance.category.toLowerCase().includes(query)
                  );
                });
                return { ...group, visibleKeys };
              }).filter((g) => g.visibleKeys.length > 0);

              const visibleOtherConfigs = TASK_CONFIGS.filter((t) => t.category === "other").filter((configInstance) => {
                if (!buttonSearchQuery.trim()) return true;
                const query = buttonSearchQuery.toLowerCase();
                return (
                  configInstance.label.toLowerCase().includes(query) ||
                  configInstance.description.toLowerCase().includes(query) ||
                  configInstance.category.toLowerCase().includes(query)
                );
              });

              const totalVisibleMatches = matchedGroups.length + visibleOtherConfigs.length;

              if (totalVisibleMatches === 0) {
                return (
                  <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-3xs animate-fade-in select-none">
                    <div className="w-12 h-12 bg-slate-50 text-slate-400 border border-slate-200 border-dashed rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-mono">
                      🔍
                    </div>
                    <h4 className="font-extrabold text-slate-700 text-sm">No Counter Buttons Match &quot;{buttonSearchQuery}&quot;</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto font-sans">
                      Try searching for a simpler term, or check for common keywords like <strong className="text-slate-600">file</strong>, <strong className="text-slate-600">copies</strong>, <strong className="text-slate-600">call</strong>, or <strong className="text-slate-600">outgoing</strong>.
                    </p>
                    <button
                      onClick={() => setButtonSearchQuery("")}
                      className="mt-4 px-4 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg transition-all focus:outline-hidden cursor-pointer"
                    >
                      Reset Filter Search
                    </button>
                  </div>
                );
              }

              return (
                <>
                  {/* Procedure Groups render dynamically */}
                  {matchedGroups.map((group) => (
                    <div key={group.title} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-3xs text-left">
                      <h3 className="text-xs font-extrabold text-slate-700 tracking-tight border-b border-slate-100 pb-2.5 mb-4 uppercase flex justify-between items-center">
                        <span>{group.title}</span>
                        {buttonSearchQuery.trim() && (
                          <span className="text-[9px] bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded uppercase font-black tracking-wider">
                            Matched ({group.visibleKeys.length})
                          </span>
                        )}
                      </h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {group.visibleKeys.map((key) => {
                          const configInstance = TASK_CONFIGS.find((c) => c.key === key);
                          if (!configInstance) return null;
                          return (
                            <TaskCard
                              key={key}
                              config={configInstance}
                              count={Number(counters[key])}
                              onIncrement={() => handleIncrement(key)}
                              onDecrement={() => handleDecrement(key)}
                              onSetSpecific={(val: number) => handleSetSpecific(key, val)}
                              isFocused={focusedKey === key}
                              onFocus={() => { setFocusedKey(key); }}
                              incomingCallTimes={key === "incomingCalls" ? incomingCallTimes : undefined}
                              onRemoveIncomingCallTime={
                                key === "incomingCalls"
                                  ? (idx) => {
                                      setIncomingCallTimes((prev) => prev.filter((_, i) => i !== idx));
                                      setCounters((prev) => ({
                                        ...prev,
                                        incomingCalls: Math.max(0, Number(prev.incomingCalls) - 1),
                                      }));
                                    }
                                  : undefined
                              }
                            />
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {/* Other / Out-of-Scope Button Section */}
                  {visibleOtherConfigs.length > 0 && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-3xs text-left">
                      <h3 className="text-xs font-extrabold text-slate-700 tracking-tight border-b border-slate-100 pb-2.5 mb-4 uppercase flex justify-between items-center">
                        <span>🛠️ Custom Tasks &amp; Out-of-Scope Logging</span>
                        {buttonSearchQuery.trim() && (
                          <span className="text-[9px] bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded uppercase font-black tracking-wider font-sans">
                            Matched ({visibleOtherConfigs.length})
                          </span>
                        )}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {visibleOtherConfigs.map((configInstance) => (
                          <TaskCard
                            key={configInstance.key}
                            config={configInstance}
                            count={Number(counters[configInstance.key])}
                            onIncrement={() => handleIncrement(configInstance.key)}
                            onDecrement={() => handleDecrement(configInstance.key)}
                            onSetSpecific={(val: number) => handleSetSpecific(configInstance.key, val)}
                            isFocused={focusedKey === configInstance.key}
                            onFocus={() => { setFocusedKey(configInstance.key); }}
                          />
                        ))}
                        
                        {/* Information Card clarifying how to use the Counter Board */}
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex gap-3 text-xs leading-relaxed text-slate-500">
                          <div className="text-slate-400 p-0.5 shrink-0">
                            <HelpCircle className="w-5 h-5 text-blue-500" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-700 mb-0.5 font-sans">Desktop Tip</h4>
                            <p className="text-[11px] font-sans">
                              Clicking a task card increments its count by +1 immediately. Click the inline pencil icon (<strong className="text-slate-600">✎</strong>) inside any button to directly enter bulk numbers manually.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}

          </div>

          {/* Right Block: Active comments panel and summarize submission triggers (4 columns on lg) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            {/* comments box for custom other actions */}
            <OtherTasksManager
              otherCount={counters.other}
              comments={comments}
              onAddComment={handleAddComment}
              onRemoveComment={handleRemoveComment}
              onIncrementOther={() => handleIncrement("other")}
            />

            {/* Live draft summary list presentation */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-3xs p-5">
              <div className="flex items-center gap-2 border-b border-slate-110 pb-3 mb-4">
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-800 text-sm leading-tight">
                    📊 Draft Summary Preview
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Live compiled overview of items to log.
                  </p>
                </div>
              </div>

              {/* Counters present list */}
              {totalCount === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 italic bg-slate-50/50 rounded-lg">
                  Draft is currently empty. Tap task counter buttons on the left to start summarizing metrics.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="max-h-[170px] overflow-y-auto space-y-2 pr-1">
                    {TASK_CONFIGS.map((config) => {
                      const count = counters[config.key];
                      if (count === 0) return null;
                      return (
                        <div
                          key={config.key}
                          className="flex items-center justify-between text-xs p-2 bg-slate-50 border border-slate-100 rounded-lg"
                        >
                          <span className="font-medium text-slate-700">{config.label}</span>
                          <span className="font-mono font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Summary preview paragraph display box */}
                  <div className="bg-blue-50/40 border border-blue-100/55 rounded-lg p-3 text-[11px] text-blue-900 leading-relaxed font-sans">
                    <span className="font-semibold text-blue-800 uppercase text-[9px] tracking-wider block mb-1">
                      📄 Current Automation Preview:
                    </span>
                    &quot;{generateAutomatedSummary(counters, comments)}&quot;
                  </div>

                  {/* Trigger operation actions row */}
                  <div className="grid grid-cols-1 gap-2.5 pt-1.5">
                    <button
                      onClick={handleCompileAndSave}
                      className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold leading-tight transition-all flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md cursor-pointer"
                      id="btn-summarize-log"
                    >
                      <Send className="w-4 h-4 shrink-0" />
                      Summarize &amp; Save to Archive
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleClearDraft}
                      className="w-full py-2 px-4 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      id="btn-reset-draft"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Clear Current Draft
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Stored reports catalog ledger ledger section */}
        <section className="pt-6">
          <ReportArchive 
            reports={reports} 
            onRemoveReport={handleRemoveReport}
            onUpdateReport={handleUpdateReport}
          />
        </section>

      </main>

      {/* Humble professional visual desk log footer */}
      <footer className="max-w-7xl mx-auto px-4 md:px-6 pt-12 text-center text-[11px] text-slate-400 select-none">
        <p className="flex items-center justify-center gap-1.5 font-sans font-medium">
          <Lock className="w-3 h-3 text-slate-350" />
          Append-Only Local Operational Ledger. Data is stored locally in this browser sandbox.
        </p>
        <p className="mt-1 text-[10px] text-slate-350 font-mono">
          DESK ACTIVITY SYSTEM v1.3 • {new Date().getFullYear()} OFFICE LEDGER INC
        </p>
      </footer>
    </div>
  );
}

