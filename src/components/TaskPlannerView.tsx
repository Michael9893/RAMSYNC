/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  CheckSquare, 
  Trash2, 
  Plus, 
  Clock, 
  Zap, 
  BookOpen, 
  MessageSquare, 
  Sparkles,
  ClipboardCheck,
  Award,
  Users
} from "lucide-react";
import { TodayTask, RushDocument } from "../types";

interface TaskPlannerViewProps {
  todayTasks: TodayTask[];
  setTodayTasks: React.Dispatch<React.SetStateAction<TodayTask[]>>;
  rushDocuments: RushDocument[];
  setRushDocuments: React.Dispatch<React.SetStateAction<RushDocument[]>>;
  thingsLearned: string;
  setThingsLearned: (v: string) => void;
  officeAdvice: string;
  setOfficeAdvice: (v: string) => void;
  onCompileAndSave: () => void;
  time: string;
  date: string;
}

export default function TaskPlannerView({
  todayTasks,
  setTodayTasks,
  rushDocuments,
  setRushDocuments,
  thingsLearned,
  setThingsLearned,
  officeAdvice,
  setOfficeAdvice,
  onCompileAndSave,
  time,
  date,
}: TaskPlannerViewProps) {
  const [newTaskText, setNewTaskText] = useState("");
  const [newRushTitle, setNewRushTitle] = useState("");
  const [newRushTime, setNewRushTime] = useState("05:00 PM");

  // Task Handlers
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    const newTask: TodayTask = {
      id: `task_${Date.now()}`,
      text: newTaskText.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    };
    setTodayTasks((prev) => [...prev, newTask]);
    setNewTaskText("");
  };

  const handleToggleTask = (id: string) => {
    setTodayTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleDeleteTask = (id: string) => {
    setTodayTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // Rush Document Handlers
  const handleAddRush = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRushTitle.trim() || !newRushTime.trim()) return;
    const newRush: RushDocument = {
      id: `rush_${Date.now()}`,
      title: newRushTitle.trim(),
      targetTime: newRushTime.trim(),
      completed: false,
    };
    setRushDocuments((prev) => [...prev, newRush]);
    setNewRushTitle("");
  };

  const handleToggleRush = (id: string) => {
    setRushDocuments((prev) =>
      prev.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r))
    );
  };

  const handleDeleteRush = (id: string) => {
    setRushDocuments((prev) => prev.filter((r) => r.id !== id));
  };

  const pendingTasksCount = todayTasks.filter(t => !t.completed).length;
  const completedTasksCount = todayTasks.filter(t => t.completed).length;
  const pendingRushCount = rushDocuments.filter(r => !r.completed).length;
  const completedRushCount = rushDocuments.filter(r => r.completed).length;

  return (
    <div className="space-y-6 pt-1 text-left">
      {/* Top Planner Greeting Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm border border-slate-800 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_40%)] pointer-events-none" />
        <div className="relative z-10 flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Shift Planner
            </span>
            <span className="text-slate-400 text-xs font-semibold">• Desktop & Rush Deadlines</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black font-sans tracking-tight">
            Today's Task Scheduler & Growth Notes
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xl font-sans">
            Add, execute, and monitor your checklist priorities and urgent rush documents. Any items you document here will automatically compile in your final reports.
          </p>
        </div>

        {/* Dynamic Timing Stats Pill */}
        <div className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-xl shrink-0 text-right font-sans leading-tight relative z-10 w-full md:w-auto">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Plan Status</div>
          <div className="text-lg font-black text-blue-400 mt-0.5">{date}</div>
          <div className="flex items-center justify-end gap-3 mt-2 text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              {completedTasksCount}/{todayTasks.length} Checked
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              {pendingRushCount} Urgent Rush
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COMPONENT - TODAY'S CHECKLIST & PORTAL */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Today's Tasks Block */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-3xs p-5 md:p-6 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-extrabold text-slate-800 text-base font-sans">General Tasks for Today</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Quickly jot down things to complete throughout this shift.</p>
                </div>
              </div>
              <span className="text-xs bg-slate-100 text-slate-600 font-extrabold px-2.5 py-1 rounded-full">
                {pendingTasksCount} Pending
              </span>
            </div>

            {/* Form to Add Task */}
            <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                placeholder="Log a new task to complete (e.g. Sort Incoming Special Orders...)"
                className="flex-1 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-slate-400"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-4xs shrink-0 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Task
              </button>
            </form>

            {/* Task Item List */}
            {todayTasks.length === 0 ? (
              <div className="text-center py-10 bg-slate-50/50 rounded-xl border border-dashed border-slate-205 flex flex-col items-center justify-center">
                <ClipboardCheck className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-xs text-slate-400 font-bold">No tasks logged in your checklist yet.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Type one above to start tracking real-time completions!</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {todayTasks.map((t) => (
                  <div
                    key={t.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      t.completed 
                        ? "bg-emerald-50/20 border-emerald-100 text-slate-450 line-through" 
                        : "bg-white border-slate-150 text-slate-700 hover:border-slate-350"
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 mr-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={t.completed}
                        onChange={() => handleToggleTask(t.id)}
                        className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="text-xs font-bold font-sans truncate">{t.text}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteTask(t.id)}
                      className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rush Documents Tracker Block */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-3xs p-5 md:p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                  <Zap className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <h2 className="font-extrabold text-slate-800 text-base font-sans">Rush Documents with Deadlines</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Set precise hours to finish highly urgent physical/digital documents.</p>
                </div>
              </div>
              <span className="text-xs bg-amber-100 text-amber-800 font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 select-none">
                <Clock className="w-3.5 h-3.5" /> {pendingRushCount} Immediate
              </span>
            </div>

            {/* Form to Add Rush Documents */}
            <form onSubmit={handleAddRush} className="grid grid-cols-1 md:grid-cols-12 gap-2 mb-4">
              <div className="md:col-span-8">
                <input
                  type="text"
                  value={newRushTitle}
                  onChange={(e) => setNewRushTitle(e.target.value)}
                  placeholder="E.g. Routing Slip for regional special travel permits..."
                  className="w-full px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all placeholder-slate-400"
                />
              </div>
              <div className="md:col-span-2">
                <input
                  type="text"
                  value={newRushTime}
                  onChange={(e) => setNewRushTime(e.target.value)}
                  placeholder="Target Time (e.g. 2:30 PM)"
                  className="w-full px-3 py-2 text-xs font-bold text-center rounded-lg border border-slate-205 bg-slate-50 focus:outline-hidden focus:ring-1 focus:ring-amber-500 text-slate-700"
                />
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full h-full py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-extrabold transition-all shadow-4xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Save Rush
                </button>
              </div>
            </form>

            {/* Rush Document Item List */}
            {rushDocuments.length === 0 ? (
              <div className="text-center py-10 bg-slate-50/50 rounded-xl border border-dashed border-slate-205 flex flex-col items-center justify-center">
                <Zap className="w-8 h-8 text-amber-200 mb-2" />
                <p className="text-xs text-slate-400 font-bold">No urgent rush documents on your radar today.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Documents added here remind you of specific hours remaining.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {rushDocuments.map((r) => (
                  <div
                    key={r.id}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                      r.completed 
                        ? "bg-emerald-50/20 border-emerald-100 text-slate-450 line-through" 
                        : "bg-amber-50/10 border-amber-200/60 text-slate-700 hover:border-amber-400/50"
                    }`}
                  >
                    <div className="flex items-center gap-3 mr-3 min-w-0 flex-1">
                      <input
                        type="checkbox"
                        checked={r.completed}
                        onChange={() => handleToggleRush(r.id)}
                        className="w-4 h-4 text-amber-600 border-slate-300 rounded focus:ring-amber-500 cursor-pointer shrink-0"
                      />
                      <span className="text-xs font-extrabold font-sans truncate flex-1">{r.title}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded bg-amber-100 text-amber-800 flex items-center gap-1 leading-none select-none">
                        <Clock className="w-3 h-3" /> Target: {r.targetTime}
                      </span>
                      <button
                        onClick={() => handleDeleteRush(r.id)}
                        className="p-1 text-slate-400 hover:text-red-500 hover:bg-slate-100 rounded transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COMPONENT - MENTORSHIP NOTES & ACTION BOARD */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Growth, Reflection, & Advice Board */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-3xs p-5 md:p-6 space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Award className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h2 className="font-extrabold text-slate-800 text-base font-sans">Learning & Mentoring</h2>
                <p className="text-xs text-slate-400">Track and share continuous desk knowledge.</p>
              </div>
            </div>

            {/* Things I Learned Today */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-450 block flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-indigo-505" /> things learned today:
              </label>
              <textarea
                value={thingsLearned}
                onChange={(e) => setThingsLearned(e.target.value)}
                rows={3}
                placeholder="E.g., Learned how to request direct expedited logs from SWIDS; understood PSP classification codes..."
                className="w-full p-2.5 text-xs font-medium bg-slate-50/70 border border-slate-200 rounded-lg text-slate-700 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 transition-all font-sans"
              />
            </div>

            {/* Supervisor & Coworker Advice */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-450 block flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-blue-505" /> Supervisor & coworker advice:
              </label>
              <textarea
                value={officeAdvice}
                onChange={(e) => setOfficeAdvice(e.target.value)}
                rows={3}
                placeholder="E.g., Sir Michael advised verifying Special Orders on the database before stamping; Mam Joy suggested consolidating PSP documents by region to speed up logs..."
                className="w-full p-2.5 text-xs font-medium bg-slate-50/70 border border-slate-200 rounded-lg text-slate-700 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 transition-all font-sans"
              />
              <p className="text-[10px] text-slate-400 italic">
                * Saved tips and lessons optimize workload and accelerate administrative actions on your next shift.
              </p>
            </div>
          </div>

          {/* Quick Compilation Actions Panel */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 md:p-6 text-left space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm font-sans">Submit & Ledger Synced</h3>
            <p className="text-xs text-slate-500 leading-normal font-sans">
              All checklist totals, target times, advice notes, and logged wisdom are synchronized. Compile them anytime to generate your daily shift summary.
            </p>
            
            <button
              onClick={onCompileAndSave}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer"
            >
              <ClipboardCheck className="w-4 h-4" /> Save & Compile Today's Report
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
