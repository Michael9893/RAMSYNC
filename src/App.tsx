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
  FileSpreadsheet,
  LayoutDashboard,
  History,
  BookOpen,
  Menu,
  X as XIcon,
  ChevronRight,
  User,
  ShieldCheck,
  FileDown,
  PanelRight
} from "lucide-react";
import { BaseCounters, Report, TASK_CONFIGS } from "./types";
import { generateAutomatedSummary, getFriendlyDate, getInitialCounters } from "./utils";
import { TaskCard } from "./components/TaskCard";
import { OtherTasksManager } from "./components/OtherTasksManager";
import { ReportArchive } from "./components/ReportArchive";
import { RamSyncLogo } from "./components/RamSyncLogo";

export default function App() {
  const [counters, setCounters] = useState<BaseCounters>(getInitialCounters());
  const [comments, setComments] = useState<string[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [focusedKey, setFocusedKey] = useState<keyof BaseCounters | null>(null);
  const [time, setTime] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [buttonSearchQuery, setButtonSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"dashboard" | "archive" | "help" | "sidebar">("dashboard");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

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
    <div id="office-tracker-root" className="min-h-screen bg-slate-50 text-slate-800 font-sans leading-normal antialiased flex flex-col lg:flex-row">
      
      {/* Top Banner Message Notification (Toast) */}
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

      {/* 1. DESKTOP SIDEBAR - STICKY LEFT RAIL */}
      <aside className="hidden lg:flex w-68 h-screen sticky top-0 bg-slate-900 text-slate-100 flex-col justify-between border-r border-slate-800 shrink-0 select-none">
        
        {/* Sidebar Header & Brand Category */}
        <div className="p-5 space-y-6">
          <div className="flex items-center gap-3">
            <RamSyncLogo size={42} className="shadow-xs bg-slate-800/45 p-1 rounded-xl" />
            <div className="text-left">
              <h1 className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5 leading-none">
                RAMSync
                <span className="text-[10px] text-blue-400 font-bold bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded leading-none">v2.4</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-1">
                Internal Ledger
              </p>
            </div>
          </div>

          <div className="h-[1px] bg-slate-800/80 w-full"></div>

          {/* Sidebar Nav Buttons Selection */}
          <nav className="space-y-1.5 pt-1">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer group ${
                activeTab === "dashboard"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className={`w-4 h-4 shrink-0 transition-transform ${activeTab === "dashboard" ? "" : "group-hover:scale-110"}`} />
                <span>Session Dashboard</span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 opacity-50 shrink-0 transition-all ${activeTab === "dashboard" ? "translate-x-0" : "opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0"}`} />
            </button>

            <button
              onClick={() => setActiveTab("archive")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer group ${
                activeTab === "archive"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <History className={`w-4 h-4 shrink-0 transition-transform ${activeTab === "archive" ? "" : "group-hover:scale-110"}`} />
                <span>Shift Ledger Archive</span>
              </div>
              {reports.length > 0 ? (
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                  activeTab === "archive"
                    ? "bg-white/20 text-white"
                    : "bg-slate-800 text-slate-400 group-hover:bg-slate-700"
                }`}>
                  {reports.length}
                </span>
              ) : (
                <ChevronRight className={`w-3.5 h-3.5 opacity-50 shrink-0 transition-all ${activeTab === "archive" ? "translate-x-0" : "opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0"}`} />
              )}
            </button>

            <button
              onClick={() => setActiveTab("help")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer group ${
                activeTab === "help"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className={`w-4 h-4 shrink-0 transition-transform ${activeTab === "help" ? "" : "group-hover:scale-110"}`} />
                <span>Operations Handbook</span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 opacity-50 shrink-0 transition-all ${activeTab === "help" ? "translate-x-0" : "opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0"}`} />
            </button>

            <button
              onClick={() => setActiveTab("sidebar")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer group ${
                activeTab === "sidebar"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <PanelRight className={`w-4 h-4 shrink-0 transition-transform ${activeTab === "sidebar" ? "" : "group-hover:scale-110"}`} />
                <span>Page Sidebar Utility</span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 opacity-50 shrink-0 transition-all ${activeTab === "sidebar" ? "translate-x-0" : "opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0"}`} />
            </button>
          </nav>
        </div>

        {/* Sidebar Footer & Active User Profiles */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/20">
          
          {/* Active Timing Widgets */}
          <div className="px-1.5 py-2 mb-3 bg-slate-800/35 border border-slate-800/40 rounded-xl flex items-center justify-between gap-2">
            <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider">Clocked In</span>
            <div className="flex items-center gap-1 text-[11px] font-mono text-blue-400 font-bold">
              <Clock className="w-3.5 h-3.5" />
              <span>{time || "00:00:00"}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-1 rounded-lg">
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs select-none shadow-xs border border-blue-500/20">
              MB
            </div>
            <div className="text-left min-w-0 flex-1">
              <span className="text-xs font-bold text-white block truncate leading-none">M. Baniqued</span>
              <span className="text-[10px] text-slate-400 block truncate mt-1">michaelbaniqued.it@gmail.com</span>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-1.5 justify-center py-1 bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-bold rounded-lg uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Secure Ledger Online</span>
          </div>
        </div>
      </aside>

      {/* 2. MOBILE HEADER BAR */}
      <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-slate-200 shadow-3xs py-3 px-4 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2.5 select-none">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 -ml-2 rounded-lg hover:bg-slate-100 text-slate-600 focus:outline-hidden cursor-pointer"
            title="Toggle Sidebar Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <RamSyncLogo size={28} />
          <h1 className="text-base font-extrabold text-slate-800 tracking-tight flex items-center gap-1.5">
            RAMSync
            <span className="text-blue-600 font-bold text-[9px] bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded">v2.4</span>
          </h1>
        </div>

        {/* Compact Right Timer */}
        <div className="flex items-center gap-2">
          <div className="text-right select-none">
            <div className="flex items-center gap-1 font-mono text-xs font-bold text-slate-600">
              <Clock className="w-3 h-3 text-blue-600" />
              <span>{time ? time.split(" ").shift() : "00:00:00"}</span>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">
            MB
          </div>
        </div>
      </header>

      {/* 3. MOBILE BACKDROP & SIDEBAR DRAWER PANEL (ANIMATED) */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            {/* Backdrop slide click layer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.45 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
              className="fixed inset-0 z-50 bg-slate-900 pointer-events-auto"
            />

            {/* Sliding cabinet body */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0.1, duration: 0.35 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-slate-100 flex flex-col justify-between shadow-2xl border-r border-slate-800 select-none text-left"
            >
              <div className="p-5 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <RamSyncLogo size={36} className="bg-slate-800/40 p-0.5 rounded-lg border border-slate-700/30" />
                    <div className="text-left">
                      <h2 className="text-sm font-extrabold tracking-tight text-white leading-none">RAMSync</h2>
                      <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-1">Internal Ledger</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className="p-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>

                <div className="h-[1px] bg-slate-800/80 w-full" />

                <nav className="space-y-1.5">
                  <button
                    onClick={() => {
                      setActiveTab("dashboard");
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                      activeTab === "dashboard"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <LayoutDashboard className="w-4 h-4 shrink-0" />
                      <span>Session Dashboard</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-50 shrink-0" />
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab("archive");
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                      activeTab === "archive"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <History className="w-4 h-4 shrink-0" />
                      <span>Shift Ledger Archive</span>
                    </div>
                    {reports.length > 0 ? (
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                        activeTab === "archive" ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"
                      }`}>
                        {reports.length}
                      </span>
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 opacity-50 shrink-0" />
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab("help");
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                      activeTab === "help"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <BookOpen className="w-4 h-4 shrink-0" />
                      <span>Operations Handbook</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-50 shrink-0" />
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab("sidebar");
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                      activeTab === "sidebar"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <PanelRight className="w-4 h-4 shrink-0" />
                      <span>Page Sidebar Utility</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-50 shrink-0" />
                  </button>
                </nav>
              </div>

              <div className="p-4 border-t border-slate-800/80 bg-slate-950/25">
                <div className="px-1.5 py-2 mb-3 bg-slate-800/35 border border-slate-800/40 rounded-xl flex items-center justify-between gap-2">
                  <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider">Clock Status</span>
                  <div className="flex items-center gap-1 text-[11px] font-mono text-blue-400 font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{time || "00:00:00"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-1 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    MB
                  </div>
                  <div className="text-left min-w-0 flex-1">
                    <span className="text-xs font-bold text-white block truncate leading-none">M. Baniqued</span>
                    <span className="text-[9px] text-slate-400 block truncate mt-1">michaelbaniqued.it@gmail.com</span>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* 4. MAIN WORKSPACE SCROLL AREA */}
      <div className="flex-1 min-h-screen flex flex-col overflow-x-hidden">
        
        {/* Main interactive tabs content switcher with AnimatePresence */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6">
          <AnimatePresence mode="wait">
            
            {/* TAB A: THE INTERACTIVE DASHBOARD VIEW */}
            {activeTab === "dashboard" && (
              <motion.div
                key="tab-dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.18 }}
                className="space-y-6"
              >
                {/* Dynamic Analytics Counter Strip / Desk Statistics */}
                <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-slate-900 text-white rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/15 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="space-y-1.5 relative z-10 text-left">
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

                {/* Main counter dashboard blocks side-by-side gridding */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left Counter Box Column (8 blocks) */}
                  <div className="lg:col-span-8 flex flex-col gap-6 font-sans">
                    
                    {/* Instant Search Bar */}
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

                    {/* Filtered button list calculations block */}
                    {(() => {
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
                                
                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex gap-3 text-xs leading-relaxed text-slate-500">
                                  <div className="text-slate-400 p-0.5 shrink-0 animate-bounce">
                                    <HelpCircle className="w-5 h-5 text-blue-500" />
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-slate-700 mb-0.5 font-sans">Desktop Tip</h4>
                                    <p className="text-[11px] font-sans">
                                      Clicking any task card increments its count by +1 immediately. Click the inline pencil icon (<strong className="text-slate-600">✎</strong>) inside any button to directly enter bulk numbers manually.
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

                  {/* Right draft tracking controls Column (4 blocks) */}
                  <div className="lg:col-span-4 space-y-6">
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
                        <div className="text-left">
                          <h2 className="font-bold text-slate-800 text-sm leading-tight">
                            📊 Draft Summary Preview
                          </h2>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Live compiled overview of items to log.
                          </p>
                        </div>
                      </div>

                      {totalCount === 0 ? (
                        <div className="text-center py-8 text-xs text-slate-400 italic bg-slate-50/50 rounded-lg">
                          Draft is currently empty. Tap task counter buttons on the left to start summarizing metrics.
                        </div>
                      ) : (
                        <div className="space-y-4 text-left">
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
                                  <span className="font-mono font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md text-[11px]">
                                    {count}
                                  </span>
                                </div>
                              );
                            })}
                          </div>

                          <div className="bg-blue-50/40 border border-blue-100/55 rounded-lg p-3 text-[11px] text-blue-900 leading-relaxed font-sans text-left">
                            <span className="font-semibold text-blue-800 uppercase text-[9px] tracking-wider block mb-1">
                              📄 Current Automation Preview:
                            </span>
                            &quot;{generateAutomatedSummary(counters, comments)}&quot;
                          </div>

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
              </motion.div>
            )}

            {/* TAB B: THE APPPEND-ONLY SHIFT LEDGER ARCHIVE */}
            {activeTab === "archive" && (
              <motion.div
                key="tab-archive"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.18 }}
                className="w-full pt-1"
              >
                <div className="text-left mb-4">
                  <h2 className="text-base font-extrabold text-slate-800 tracking-tight">Shift Ledger Archives</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Explore secured logs, download receipts, and search narrative statements.</p>
                </div>
                
                <ReportArchive 
                  reports={reports} 
                  onRemoveReport={handleRemoveReport}
                  onUpdateReport={handleUpdateReport}
                />
              </motion.div>
            )}

            {/* TAB C: THE OPERATIONS HANDBOOK */}
            {activeTab === "help" && (
              <motion.div
                key="tab-help"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.18 }}
                className="space-y-6"
              >
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-3xs text-left">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-5">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold text-slate-800">
                        RAMSync Operations Manual
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Official user handbook, search tips, and local storage architecture.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-5">
                      <div>
                        <h3 className="text-xs font-black text-blue-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                          <CheckSquare className="w-4 h-4" /> 1. Interactive Counter Board
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed pl-5">
                          Use the dashboard counter cards to track daily task volumes. Clicking any card increments the value by <strong className="text-slate-800">+1</strong> instantly. Keep track of incoming phone calls, received/outgoing RSO/RTO, scan files, stamped files, and AD-RAMS submissions.
                        </p>
                      </div>

                      <div>
                        <h3 className="text-xs font-black text-blue-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                          <Sliders className="w-4 h-4" /> 2. Bulk Adjustments & Pencil Tool
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed pl-5">
                          To insert a large number manually, click minor drawer pencil icon (<strong className="text-slate-850">✎</strong>) inside the card buttons. You can write any integer above 0 directly to synchronize your desk counters instantly.
                        </p>
                      </div>

                      <div>
                        <h3 className="text-xs font-black text-blue-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                          <FileSpreadsheet className="w-4 h-4" /> 3. Automatic Summarization State
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed pl-5">
                          On the right side of the dashboard, see the live <strong className="text-slate-800">Draft Summary Preview</strong>. Our automated layout writes professional, administrative English paragraphs on-the-fly summarizing every recorded quantity and extra task comments.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <h3 className="text-xs font-black text-indigo-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                          <Send className="w-4 h-4" /> 4. Shift Log Locking & Archives
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed pl-5">
                          Clicking <strong className="text-indigo-800">&quot;Summarize &amp; Save to Archive&quot;</strong> locks your active counters draft, compiles the narrative statement, and writes chronological records securely to the persistent local database.
                        </p>
                      </div>

                      <div>
                        <h3 className="text-xs font-black text-indigo-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                          <FileDown className="w-4 h-4" /> 5. PDF Logistics Exports
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed pl-5">
                          Under the <strong className="text-indigo-850">Shift Ledger Archive</strong> tab section, you can check details of past sessions. You can copy raw statements to clipboard, edit summaries/log values, delete errant records, or generate individual <strong className="text-indigo-600">PDF Shift Receipts</strong>. You can also download a comprehensive consolidated audit of all shifts via the <strong className="text-indigo-600">Export All PDF</strong> utility.
                        </p>
                      </div>

                      <div>
                        <h3 className="text-xs font-black text-indigo-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                          <Lock className="w-4 h-4" /> 6. Sandbox Security
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed pl-5">
                          RAMSync operates inside your browser's sandboxed local data framework. Your credentials, call timestamps, and document counts are completely private and never uploaded to public network clouds.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Local Security Status: <strong>Encrypted &amp; Isolated</strong></span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">RAMSYNC OFFICE LEDGER CORE ENGINE v2.4</span>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "sidebar" && (
              <motion.div
                key="tab-sidebar"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.18 }}
                className="space-y-6 animate-fade-in"
              >
                {/* Intro Hero banner */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-3xs text-left">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-5 mb-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                        <PanelRight className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-base font-extrabold text-slate-800">
                          Brave & Edge Page Sidebar Integration
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5 animate-pulse">
                          Configure dual-panel workspace logging to operate counters seamlessly beside your active research sheets.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const width = 380;
                        const height = window.screen.availHeight || 850;
                        const left = window.screen.availWidth - width - 15;
                        const top = 0;
                        window.open(
                          window.location.origin,
                          "RAMSyncSidebar",
                          `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes,location=no,toolbar=no,menubar=no`
                        );
                      }}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer hover:shadow-sm"
                    >
                      <PanelRight className="w-4 h-4" />
                      Dock as Companion Sidebar Window
                    </button>
                  </div>

                  {/* Browser Setup Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Brave - Highlighted because they use Brave in screenshot */}
                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-5 text-left relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-base">🦁</span>
                        <h3 className="text-xs font-black text-amber-700 uppercase tracking-wider">
                          1st Choice: Brave Sidebar Setup
                        </h3>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
                        Brave's built-in sidebar allows full horizontal multi-tasking. Since you are active on Brave, pin RAMSync to logging side-pane instantly:
                      </p>
                      <ol className="text-xs text-slate-600 space-y-2 pl-4 list-decimal font-medium leading-relaxed">
                        <li>Open the Brave Sidebar (press <strong className="text-slate-800">Ctrl+Alt+B</strong> on Windows or <strong className="text-slate-800">Cmd+Option+B</strong> on Mac).</li>
                        <li>Click the <strong className="text-amber-600 font-bold">+</strong> button on the sidebar.</li>
                        <li>Click <strong className="text-amber-600 font-bold">Add active page</strong> to lock RAMSync permanently inside your browser rail!</li>
                      </ol>
                    </div>

                    {/* Edge */}
                    <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-5 text-left relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-base">🌐</span>
                        <h3 className="text-xs font-black text-blue-700 uppercase tracking-wider">
                          2nd Choice: Microsoft Edge Setup
                        </h3>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
                        Edge contains a secure utility panel on the right sidebar edge. Connect your app draft counters in seconds:
                      </p>
                      <ol className="text-xs text-slate-600 space-y-2 pl-4 list-decimal font-medium leading-relaxed font-sans">
                        <li>Look at the far right border of your Edge browser for the sidebar icons.</li>
                        <li>Click the <strong className="text-slate-800">+</strong> icon (Customize Sidebar) inside the tray.</li>
                        <li>Enter or paste our URL: <code className="bg-slate-100 p-1 text-[10px] rounded block truncate mt-1 text-slate-600 select-all">{window.location.origin}</code></li>
                        <li>Click <strong>Add</strong> and RAMSync is ready beside any active document!</li>
                      </ol>
                    </div>

                    {/* Opera / GX */}
                    <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5 text-left relative overflow-hidden font-sans">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-xl pointer-events-none" />
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-base">⭕</span>
                        <h3 className="text-xs font-black text-red-700 uppercase tracking-wider">
                          3rd Choice: Opera & GX Setup
                        </h3>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed mb-4 font-sans">
                        Opera contains specialized sidebar panels. Register RAMSync as a custom web messenger panel:
                      </p>
                      <ol className="text-xs text-slate-600 space-y-2 pl-4 list-decimal font-medium leading-relaxed font-sans">
                        <li>Right-click or tap the bottom 3 dots icon (<strong className="text-slate-800">...</strong>) on Opera's left sidebar.</li>
                        <li>Enable <strong>Custom Site Panels</strong>.</li>
                        <li>Input our web address: <code className="bg-slate-100 p-1 text-[10px] rounded block truncate mt-1 text-slate-600 select-all">{window.location.origin}</code></li>
                        <li>Set the panel name to <strong>RAMSync</strong> and click confirm to pin it!</li>
                      </ol>
                    </div>
                  </div>
                </div>

                {/* Simulation and Preview Box */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 text-left shadow-3xs">
                  <h3 className="text-xs font-extrabold text-slate-700 tracking-tight uppercase border-b border-slate-100 pb-2.5 mb-5 flex items-center gap-2 font-sans select-none">
                    🖥️ Interactive Sidebar Simulation Preview
                  </h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    {/* Left: explaining why */}
                    <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                      <div className="space-y-3 text-left">
                        <h4 className="text-xs font-bold text-slate-800">Why Use the Page Sidebar Mode?</h4>
                        <p className="text-xs text-slate-500 leading-relaxed font-sans">
                          By running RAMSync as a page sidebar utility, you do not have to flip tabs repeatedly to record increments while researching.
                        </p>
                        <p className="text-xs text-slate-500 leading-relaxed font-sans">
                          Your main browser window remains free for incoming RSO/RTO, sheets, emails, or scanning queues, while RAMSync occupies a slim vertical strip on the side.
                        </p>
                      </div>

                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Hassle-Free Syncing</span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                          All updates and logs automatically synchronize in real-time across both views since they utilize the same sandboxed localStorage database.
                        </p>
                      </div>
                    </div>

                    {/* Right: Mock Browser Window */}
                    <div className="lg:col-span-7 bg-slate-100 rounded-xl p-3 border border-slate-200 flex flex-col h-[340px] relative overflow-hidden select-none">
                      {/* Browser top-bar */}
                      <div className="flex items-center gap-1.5 bg-slate-200/80 px-3 py-2 rounded-t-lg border-b border-slate-300">
                        <div className="flex gap-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                          <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                        </div>
                        <div className="bg-white/80 rounded-md text-[9px] font-medium text-slate-500 px-3 py-0.5 flex-1 max-w-xs mx-auto text-center truncate shadow-3xs font-mono">
                          https://ramsync.vercel.app/
                        </div>
                      </div>

                      {/* Mock Browser Body */}
                      <div className="flex-1 flex bg-white rounded-b-lg overflow-hidden border-t border-slate-150">
                        {/* Mock Main Tab screen */}
                        <div className="flex-1 p-4 bg-slate-50 flex flex-col justify-center items-center text-center border-r border-slate-200 relative">
                          <span className="text-2xl mb-1">🦆</span>
                          <h5 className="text-[10px] font-extrabold text-slate-800">DuckDuckGo Search</h5>
                          <p className="text-[8px] text-slate-400 px-4 mt-0.5 font-sans">Searching the web privately without tracking.</p>
                          <div className="w-3/4 h-3 bg-white border border-slate-200 rounded mt-2 px-1 flex items-center justify-end">
                            <span className="text-[7px] text-slate-300">🔍</span>
                          </div>
                        </div>

                        {/* Mock Page Sidebar */}
                        <div className="w-44 bg-slate-900 text-white p-3 flex flex-col justify-between border-l border-slate-200">
                          <div className="space-y-2">
                            <div className="flex items-center gap-1.5 border-b border-slate-800 pb-1">
                              <RamSyncLogo size={14} />
                              <div className="text-left">
                                <h6 className="text-[9px] font-black leading-none text-white font-sans">RAMSync</h6>
                                <span className="text-[6px] text-slate-400 leading-none">Admin Core</span>
                              </div>
                            </div>
                            
                            <div className="bg-blue-600/10 border border-blue-500/20 rounded-md p-1.5 text-left space-y-1">
                              <span className="text-[6px] text-blue-300 font-extrabold tracking-wider block leading-none uppercase">COUNTERS DRAFT</span>
                              <div className="flex justify-between items-center text-[10px] font-mono">
                                <span className="text-[6px] text-slate-300">Today's Counts</span>
                                <span className="font-bold text-emerald-400 leading-none">{totalCount}</span>
                              </div>
                            </div>

                            <div className="bg-slate-800/40 rounded-md p-1.5 text-left space-y-1">
                              <span className="text-[5px] text-slate-400 uppercase leading-none block font-sans">Inbound Activity</span>
                              <div className="flex justify-between items-center text-[6px]">
                                <span>Calls</span>
                                <span className="bg-blue-500/20 px-1 rounded-sm text-blue-300 font-bold">{Number(counters.incomingCalls)}</span>
                              </div>
                              <div className="flex justify-between items-center text-[6px]">
                                <span>RSO/RTO</span>
                                <span className="bg-blue-500/20 px-1 rounded-sm text-blue-300 font-bold">{Number(counters.receivedRsoRto)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-[6px] text-slate-400 text-center border-t border-slate-800 pt-1 leading-none font-sans">
                            🔒 Local sandbox secure
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>

        {/* 5. VISUAL LEDGER FOOTER */}
        <footer className="w-full text-center py-8 text-[11px] text-slate-400 select-none bg-slate-50 border-t border-slate-100 mt-auto px-4 md:px-6">
          <p className="flex items-center justify-center gap-1.5 font-sans font-medium">
            <Lock className="w-3 h-3 text-slate-350" />
            Append-Only Local Operational Ledger. Data is stored locally in this browser sandbox.
          </p>
          <p className="mt-1 text-[10px] text-slate-350 font-mono">
            DESK ACTIVITY SYSTEM v1.3 • {new Date().getFullYear()} OFFICE LEDGER INC
          </p>
        </footer>

      </div>
    </div>
  );
}

