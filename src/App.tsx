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
  FileDown
} from "lucide-react";
import { BaseCounters, Report, TASK_CONFIGS, TodayTask, RushDocument } from "./types";
import { generateAutomatedSummary, getFriendlyDate, getInitialCounters } from "./utils";
import { TaskCard } from "./components/TaskCard";
import { OtherTasksManager } from "./components/OtherTasksManager";
import { ReportArchive } from "./components/ReportArchive";
import { RamSyncLogo } from "./components/RamSyncLogo";
import TaskPlannerView from "./components/TaskPlannerView";

export default function App() {
  const [counters, setCounters] = useState<BaseCounters>(getInitialCounters());
  const [comments, setComments] = useState<string[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [focusedKey, setFocusedKey] = useState<keyof BaseCounters | null>(null);
  const [time, setTime] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [buttonSearchQuery, setButtonSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"dashboard" | "planner" | "archive" | "help">("dashboard");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Today's Tasks checklist with persistent local cache
  const [todayTasks, setTodayTasks] = useState<TodayTask[]>(() => {
    const saved = localStorage.getItem("office_activity_tracker_today_tasks");
    return saved ? JSON.parse(saved) : [];
  });

  // Rush Documents with target completion times
  const [rushDocuments, setRushDocuments] = useState<RushDocument[]>(() => {
    const saved = localStorage.getItem("office_activity_tracker_rush_documents");
    return saved ? JSON.parse(saved) : [];
  });

  // Self-reflection learning logs
  const [thingsLearned, setThingsLearned] = useState<string>(() => {
    return localStorage.getItem("office_activity_tracker_things_learned") || "";
  });

  // Work acceleration coworker / supervisor advice
  const [officeAdvice, setOfficeAdvice] = useState<string>(() => {
    return localStorage.getItem("office_activity_tracker_office_advice") || "";
  });

  // Keep track of incoming call timestamps (e.g. ['11:21:40 AM - Within DSWD']) with persistent local cache
  const [incomingCallTimes, setIncomingCallTimes] = useState<string[]>(() => {
    const saved = localStorage.getItem("office_activity_tracker_draft_incoming_times");
    return saved ? JSON.parse(saved) : [];
  });

  // Keep track of received RSO & RTO origin logs
  const [receivedRsoRtoDetails, setReceivedRsoRtoDetails] = useState<string[]>(() => {
    const saved = localStorage.getItem("office_activity_tracker_draft_rso_details");
    return saved ? JSON.parse(saved) : [];
  });

  // Keep track of handcarry received locations
  const [incomingHandcarryDetails, setIncomingHandcarryDetails] = useState<string[]>(() => {
    const saved = localStorage.getItem("office_activity_tracker_draft_handcarry_details");
    return saved ? JSON.parse(saved) : [];
  });

  // Keep track of messengerial processed locations
  const [messengerialCoPspDetails, setMessengerialCoPspDetails] = useState<string[]>(() => {
    const saved = localStorage.getItem("office_activity_tracker_draft_messengerial_co_psp");
    return saved ? JSON.parse(saved) : [];
  });

  const [messengerialPspDetails, setMessengerialPspDetails] = useState<string[]>(() => {
    const saved = localStorage.getItem("office_activity_tracker_draft_messengerial_psp");
    return saved ? JSON.parse(saved) : [];
  });

  const [messengerialGeneralDetails, setMessengerialGeneralDetails] = useState<string[]>(() => {
    const saved = localStorage.getItem("office_activity_tracker_draft_messengerial_general");
    return saved ? JSON.parse(saved) : [];
  });

  const [messengerialPostalDetails, setMessengerialPostalDetails] = useState<string[]>(() => {
    const saved = localStorage.getItem("office_activity_tracker_draft_messengerial_postal");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("office_activity_tracker_draft_incoming_times", JSON.stringify(incomingCallTimes));
  }, [incomingCallTimes]);

  useEffect(() => {
    localStorage.setItem("office_activity_tracker_draft_rso_details", JSON.stringify(receivedRsoRtoDetails));
  }, [receivedRsoRtoDetails]);

  useEffect(() => {
    localStorage.setItem("office_activity_tracker_draft_handcarry_details", JSON.stringify(incomingHandcarryDetails));
  }, [incomingHandcarryDetails]);

  useEffect(() => {
    localStorage.setItem("office_activity_tracker_draft_messengerial_co_psp", JSON.stringify(messengerialCoPspDetails));
  }, [messengerialCoPspDetails]);

  useEffect(() => {
    localStorage.setItem("office_activity_tracker_draft_messengerial_psp", JSON.stringify(messengerialPspDetails));
  }, [messengerialPspDetails]);

  useEffect(() => {
    localStorage.setItem("office_activity_tracker_draft_messengerial_general", JSON.stringify(messengerialGeneralDetails));
  }, [messengerialGeneralDetails]);

  useEffect(() => {
    localStorage.setItem("office_activity_tracker_draft_messengerial_postal", JSON.stringify(messengerialPostalDetails));
  }, [messengerialPostalDetails]);

  useEffect(() => {
    localStorage.setItem("office_activity_tracker_today_tasks", JSON.stringify(todayTasks));
  }, [todayTasks]);

  useEffect(() => {
    localStorage.setItem("office_activity_tracker_rush_documents", JSON.stringify(rushDocuments));
  }, [rushDocuments]);

  useEffect(() => {
    localStorage.setItem("office_activity_tracker_things_learned", thingsLearned);
  }, [thingsLearned]);

  useEffect(() => {
    localStorage.setItem("office_activity_tracker_office_advice", officeAdvice);
  }, [officeAdvice]);

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
  const handleIncrement = (key: keyof BaseCounters, detail?: string) => {
    setCounters((prev) => {
      const nextVal = prev[key] + 1;
      return { ...prev, [key]: nextVal };
    });
    setFocusedKey(key);

    const timeObj = getFriendlyDate();
    const compactTime = timeObj.timeString;

    if (key === "incomingCalls") {
      const label = detail ? ` - ${detail}` : " - Within DSWD";
      setIncomingCallTimes((prev) => [...prev, `${compactTime}${label}`]);
    } else if (key === "receivedRsoRto") {
      const origin = detail || "Unspecified Office";
      setReceivedRsoRtoDetails((prev) => [...prev, `${compactTime} from ${origin}`]);
    } else if (key === "incomingHandcarryFiles") {
      const location = detail || "General Desk";
      setIncomingHandcarryDetails((prev) => [...prev, `${compactTime} at ${location}`]);
    } else if (key === "messengerialCoPsp") {
      const office = detail || "Unspecified Office";
      setMessengerialCoPspDetails((prev) => [...prev, `${compactTime} at ${office}`]);
    } else if (key === "messengerialPsp") {
      const office = detail || "Unspecified Office";
      setMessengerialPspDetails((prev) => [...prev, `${compactTime} at ${office}`]);
    } else if (key === "messengerialGeneral") {
      const office = detail || "Unspecified Office";
      setMessengerialGeneralDetails((prev) => [...prev, `${compactTime} at ${office}`]);
    } else if (key === "messengerialPostal") {
      const office = detail || "Unspecified Office";
      setMessengerialPostalDetails((prev) => [...prev, `${compactTime} at ${office}`]);
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
    } else if (key === "receivedRsoRto") {
      setReceivedRsoRtoDetails((prev) => prev.slice(0, -1));
    } else if (key === "incomingHandcarryFiles") {
      setIncomingHandcarryDetails((prev) => prev.slice(0, -1));
    } else if (key === "messengerialCoPsp") {
      setMessengerialCoPspDetails((prev) => prev.slice(0, -1));
    } else if (key === "messengerialPsp") {
      setMessengerialPspDetails((prev) => prev.slice(0, -1));
    } else if (key === "messengerialGeneral") {
      setMessengerialGeneralDetails((prev) => prev.slice(0, -1));
    } else if (key === "messengerialPostal") {
      setMessengerialPostalDetails((prev) => prev.slice(0, -1));
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

    const timeObj = getFriendlyDate();
    const compactTime = timeObj.timeString;

    if (key === "incomingCalls") {
      setIncomingCallTimes((prev) => {
        const diff = nextVal - prev.length;
        if (diff > 0) {
          return [...prev, ...Array(diff).fill(`${compactTime} - Within DSWD`)];
        } else if (diff < 0) {
          return prev.slice(0, nextVal);
        }
        return prev;
      });
    } else if (key === "receivedRsoRto") {
      setReceivedRsoRtoDetails((prev) => {
        const diff = nextVal - prev.length;
        if (diff > 0) {
          return [...prev, ...Array(diff).fill(`${compactTime} from Unspecified Office`)];
        } else if (diff < 0) {
          return prev.slice(0, nextVal);
        }
        return prev;
      });
    } else if (key === "incomingHandcarryFiles") {
      setIncomingHandcarryDetails((prev) => {
        const diff = nextVal - prev.length;
        if (diff > 0) {
          return [...prev, ...Array(diff).fill(`${compactTime} at General Desk`)];
        } else if (diff < 0) {
          return prev.slice(0, nextVal);
        }
        return prev;
      });
    } else if (key === "messengerialCoPsp") {
      setMessengerialCoPspDetails((prev) => {
        const diff = nextVal - prev.length;
        if (diff > 0) {
          return [...prev, ...Array(diff).fill(`${compactTime} at Unspecified Office`)];
        } else if (diff < 0) {
          return prev.slice(0, nextVal);
        }
        return prev;
      });
    } else if (key === "messengerialPsp") {
      setMessengerialPspDetails((prev) => {
        const diff = nextVal - prev.length;
        if (diff > 0) {
          return [...prev, ...Array(diff).fill(`${compactTime} at Unspecified Office`)];
        } else if (diff < 0) {
          return prev.slice(0, nextVal);
        }
        return prev;
      });
    } else if (key === "messengerialGeneral") {
      setMessengerialGeneralDetails((prev) => {
        const diff = nextVal - prev.length;
        if (diff > 0) {
          return [...prev, ...Array(diff).fill(`${compactTime} at Unspecified Office`)];
        } else if (diff < 0) {
          return prev.slice(0, nextVal);
        }
        return prev;
      });
    } else if (key === "messengerialPostal") {
      setMessengerialPostalDetails((prev) => {
        const diff = nextVal - prev.length;
        if (diff > 0) {
          return [...prev, ...Array(diff).fill(`${compactTime} at Unspecified Office`)];
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
        setReceivedRsoRtoDetails([]);
        setIncomingHandcarryDetails([]);
        setMessengerialCoPspDetails([]);
        setMessengerialPspDetails([]);
        setMessengerialGeneralDetails([]);
        setMessengerialPostalDetails([]);
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
    ) + todayTasks.length + rushDocuments.length;
    
    if (totalItems === 0 && !thingsLearned.trim() && !officeAdvice.trim()) {
      alert("Please log some tasks, desk actions, or planner notes before compiling a summary report.");
      return;
    }

    const compiledText = generateAutomatedSummary(
      counters, 
      comments, 
      incomingCallTimes, 
      receivedRsoRtoDetails, 
      incomingHandcarryDetails,
      messengerialCoPspDetails,
      messengerialPspDetails,
      messengerialGeneralDetails,
      messengerialPostalDetails,
      todayTasks,
      rushDocuments,
      thingsLearned,
      officeAdvice
    );
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
      receivedRsoRtoDetails: [...receivedRsoRtoDetails],
      incomingHandcarryDetails: [...incomingHandcarryDetails],
      messengerialCoPspDetails: [...messengerialCoPspDetails],
      messengerialPspDetails: [...messengerialPspDetails],
      messengerialGeneralDetails: [...messengerialGeneralDetails],
      messengerialPostalDetails: [...messengerialPostalDetails],
      todayTasks: [...todayTasks],
      rushDocuments: [...rushDocuments],
      thingsLearned: thingsLearned,
      officeAdvice: officeAdvice,
    };

    const nextReports = [newReport, ...reports];
    setReports(nextReports);
    localStorage.setItem("office_activity_tracker_reports", JSON.stringify(nextReports));

    // Reset draft counters successfully to prompt for next task session
    setCounters(getInitialCounters());
    setComments([]);
    setIncomingCallTimes([]);
    setReceivedRsoRtoDetails([]);
    setIncomingHandcarryDetails([]);
    setMessengerialCoPspDetails([]);
    setMessengerialPspDetails([]);
    setMessengerialGeneralDetails([]);
    setMessengerialPostalDetails([]);
    setTodayTasks([]);
    setRushDocuments([]);
    setThingsLearned("");
    setOfficeAdvice("");
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
              onClick={() => setActiveTab("planner")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer group ${
                activeTab === "planner"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CheckSquare className={`w-4 h-4 shrink-0 transition-transform ${activeTab === "planner" ? "" : "group-hover:scale-110"}`} />
                <span>Today's Task Planner</span>
              </div>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 transition-colors ${
                activeTab === "planner"
                  ? "bg-white/20 text-white"
                  : (todayTasks.some(t => !t.completed) || rushDocuments.some(r => !r.completed))
                  ? "bg-amber-650 text-white animate-pulse"
                  : "bg-slate-800 text-slate-400 group-hover:bg-slate-700"
              }`}>
                {todayTasks.filter(t => !t.completed).length + rushDocuments.filter(r => !r.completed).length}
              </span>
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
                      setActiveTab("planner");
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                      activeTab === "planner"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <CheckSquare className="w-4 h-4 shrink-0" />
                      <span>Today's Task Planner</span>
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-600 text-white leading-none">
                      {todayTasks.filter(t => !t.completed).length + rushDocuments.filter(r => !r.completed).length}
                    </span>
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
                                      onIncrement={(detail) => handleIncrement(key, detail)}
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
                                      detailsList={
                                        key === "receivedRsoRto"
                                          ? receivedRsoRtoDetails
                                          : key === "incomingHandcarryFiles"
                                          ? incomingHandcarryDetails
                                          : key === "messengerialCoPsp"
                                          ? messengerialCoPspDetails
                                          : key === "messengerialPsp"
                                          ? messengerialPspDetails
                                          : key === "messengerialGeneral"
                                          ? messengerialGeneralDetails
                                          : key === "messengerialPostal"
                                          ? messengerialPostalDetails
                                          : undefined
                                      }
                                      onRemoveDetailIndex={
                                        key === "receivedRsoRto"
                                          ? (idx) => {
                                              setReceivedRsoRtoDetails((prev) => prev.filter((_, i) => i !== idx));
                                              setCounters((prev) => ({
                                                ...prev,
                                                receivedRsoRto: Math.max(0, Number(prev.receivedRsoRto) - 1),
                                              }));
                                            }
                                          : key === "incomingHandcarryFiles"
                                          ? (idx) => {
                                              setIncomingHandcarryDetails((prev) => prev.filter((_, i) => i !== idx));
                                              setCounters((prev) => ({
                                                ...prev,
                                                incomingHandcarryFiles: Math.max(0, Number(prev.incomingHandcarryFiles) - 1),
                                              }));
                                            }
                                          : key === "messengerialCoPsp"
                                          ? (idx) => {
                                              setMessengerialCoPspDetails((prev) => prev.filter((_, i) => i !== idx));
                                              setCounters((prev) => ({
                                                ...prev,
                                                messengerialCoPsp: Math.max(0, Number(prev.messengerialCoPsp) - 1),
                                              }));
                                            }
                                          : key === "messengerialPsp"
                                          ? (idx) => {
                                              setMessengerialPspDetails((prev) => prev.filter((_, i) => i !== idx));
                                              setCounters((prev) => ({
                                                ...prev,
                                                messengerialPsp: Math.max(0, Number(prev.messengerialPsp) - 1),
                                              }));
                                            }
                                          : key === "messengerialGeneral"
                                          ? (idx) => {
                                              setMessengerialGeneralDetails((prev) => prev.filter((_, i) => i !== idx));
                                              setCounters((prev) => ({
                                                ...prev,
                                                messengerialGeneral: Math.max(0, Number(prev.messengerialGeneral) - 1),
                                              }));
                                            }
                                          : key === "messengerialPostal"
                                          ? (idx) => {
                                              setMessengerialPostalDetails((prev) => prev.filter((_, i) => i !== idx));
                                              setCounters((prev) => ({
                                                ...prev,
                                                messengerialPostal: Math.max(0, Number(prev.messengerialPostal) - 1),
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
                                    onIncrement={(detail) => handleIncrement(configInstance.key, detail)}
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

            {/* TAB PLANNER: THE INTERACTIVE TASK SCHEDULER & NOTES */}
            {activeTab === "planner" && (
              <motion.div
                key="tab-planner"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.18 }}
                className="w-full"
              >
                <TaskPlannerView
                  todayTasks={todayTasks}
                  setTodayTasks={setTodayTasks}
                  rushDocuments={rushDocuments}
                  setRushDocuments={setRushDocuments}
                  thingsLearned={thingsLearned}
                  setThingsLearned={setThingsLearned}
                  officeAdvice={officeAdvice}
                  setOfficeAdvice={setOfficeAdvice}
                  onCompileAndSave={handleCompileAndSave}
                  time={time}
                  date={date}
                />
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

