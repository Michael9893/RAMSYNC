/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  PhoneCall,
  FileSpreadsheet,
  FolderHeart,
  Copy,
  SendToBack,
  Send,
  Truck,
  MailOpen,
  Archive,
  FileCheck,
  FileSymlink,
  Files,
  ClipboardCopy,
  Plus,
  Minus,
  Edit2,
  Check,
  FileDown,
  Scan,
  Stamp
} from "lucide-react";
import { TaskConfig } from "../types";

const IconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  PhoneCall,
  FileSpreadsheet,
  FolderHeart,
  Copy,
  SendToBack,
  Send,
  Truck,
  MailOpen,
  Archive,
  FileCheck,
  FileSymlink,
  Files,
  ClipboardCopy,
  FileDown,
  Scan,
  Stamp
};

interface TaskCardProps {
  config: TaskConfig;
  count: number;
  onIncrement: (detail?: string) => void;
  onDecrement: () => void;
  onSetSpecific: (value: number) => void;
  isFocused: boolean;
  onFocus: () => void;
  incomingCallTimes?: string[];
  onRemoveIncomingCallTime?: (index: number) => void;
  detailsList?: string[];
  onRemoveDetailIndex?: (index: number) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  config,
  count,
  onIncrement,
  onDecrement,
  onSetSpecific,
  isFocused,
  onFocus,
  incomingCallTimes,
  onRemoveIncomingCallTime,
  detailsList,
  onRemoveDetailIndex,
}) => {
  const IconComponent = IconMap[config.iconName] || ClipboardCopy;
  const [isEditing, setIsEditing] = useState(false);
  const [editVal, setEditVal] = useState(count.toString());
  const [typedHandcarry, setTypedHandcarry] = useState("");
  const [typedOffice, setTypedOffice] = useState("");

  const handleApplyEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(editVal, 10);
    if (!isNaN(num) && num >= 0) {
      onSetSpecific(num);
    }
    setIsEditing(false);
  };

  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditVal(count.toString());
    setIsEditing(true);
  };

  const categoryThemes = {
    incoming: {
      border: "border-slate-200 hover:border-blue-400",
      bg: "bg-white",
      accent: "text-blue-600 bg-blue-50",
      badge: "bg-blue-50 text-blue-700 border border-blue-100",
      indicator: "bg-blue-600",
      hoverBg: "hover:bg-blue-50/10",
    },
    processed: {
      border: "border-slate-200 hover:border-sky-400",
      bg: "bg-white",
      accent: "text-sky-600 bg-sky-50",
      badge: "bg-slate-100 text-slate-700 border border-slate-200",
      indicator: "bg-sky-600",
      hoverBg: "hover:bg-sky-50/10",
    },
    outgoing: {
      border: "border-slate-200 hover:border-amber-400",
      bg: "bg-white",
      accent: "text-amber-600 bg-amber-50",
      badge: "bg-amber-50 text-amber-700 border border-amber-100",
      indicator: "bg-amber-600",
      hoverBg: "hover:bg-amber-50/10",
    },
    other: {
      border: "border-slate-200 hover:border-blue-400",
      bg: "bg-slate-900 text-white",
      accent: "text-blue-400 bg-blue-950/50",
      badge: "bg-slate-800 text-slate-300 border border-slate-700",
      indicator: "bg-blue-500",
      hoverBg: "hover:bg-slate-800",
    },
  };

  const theme = categoryThemes[config.category];
  const isAdRams = config.key === "filesAdRamsHead";
  const customBorder = isAdRams 
    ? "border-l-4 border-l-blue-500 shadow-xs border-r-slate-200 border-t-slate-200 border-b-slate-200" 
    : theme.border;

  return (
    <motion.div
      id={`task-card-${config.key}`}
      whileTap={{ scale: 0.98 }}
      onClick={() => {
        if (!isEditing) {
          if (config.key === "incomingCalls") {
            onIncrement("Within DSWD");
          } else if (config.key === "receivedRsoRto") {
            onIncrement("Unspecified Office");
          } else if (config.key === "incomingHandcarryFiles") {
            onIncrement("General Desk");
          } else if (config.key === "messengerialCoPsp") {
            onIncrement("Unspecified Office");
          } else if (config.key === "messengerialPsp") {
            onIncrement("Unspecified Office");
          } else if (config.key === "messengerialGeneral") {
            onIncrement("Unspecified Office");
          } else if (config.key === "messengerialPostal") {
            onIncrement("Unspecified Office");
          } else {
            onIncrement();
          }
          onFocus();
        }
      }}
      className={`relative flex flex-col justify-between min-h-[10rem] h-auto p-4 rounded-xl border ${customBorder} ${theme.bg} ${theme.hoverBg} transition-all cursor-pointer shadow-3xs overflow-hidden select-none group ${
        isFocused ? "ring-2 ring-blue-500 border-transparent shadow-md" : ""
      }`}
    >
      {/* Background Pulse Effect on Increment */}
      <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
        <IconComponent className="w-24 h-24 stroke-[1.2]" />
      </div>

      {/* Card Header Info */}
      <div className="relative z-10 text-left w-full">
        <div className="flex items-center justify-between mb-1">
          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${theme.badge}`}>
            {config.category}
          </span>
          <div className={`p-1.5 rounded-lg ${theme.accent}`}>
            <IconComponent className="w-4 h-4 stroke-[2]" />
          </div>
        </div>
        <h3 className="font-semibold text-sm text-slate-800 leading-tight">
          {config.label}
        </h3>
        <p className="text-[11px] text-slate-500 mt-0.5" title={config.description}>
          {config.description}
        </p>

        {/* Dynamic Interactive Selection Fields for incomingCalls */}
        {config.key === "incomingCalls" && (
          <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-col gap-2 relative z-20" onClick={(e) => e.stopPropagation()}>
            <label className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold block">Call Concern (Tap to log):</label>
            <div className="grid grid-cols-2 gap-1">
              {["Within DSWD", "TRANSFER ACC", "CREATE ACC", "Concerns of other ODSUs"].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onIncrement(opt);
                  }}
                  className="px-1.5 py-1 text-[9px] text-left font-bold truncate rounded bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-700 border border-slate-200 hover:border-blue-600 transition-all shadow-4xs cursor-pointer"
                  title={`Log call for: ${opt}`}
                >
                  + {opt === "Concerns of other ODSUs" ? "Other ODSU" : opt === "TRANSFER ACC" ? "Transfer Acc" : opt === "CREATE ACC" ? "Create Acc" : "Within DSWD"}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Interactive Selection Fields for receivedRsoRto */}
        {config.key === "receivedRsoRto" && (
          <div className="mt-3 py-2 border-t border-slate-100 flex flex-col gap-1.5 relative z-20" onClick={(e) => e.stopPropagation()}>
            <label className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold block">Office Origin:</label>
            <div className="flex gap-1">
              <input
                type="text"
                placeholder="Type office & Enter..."
                value={typedOffice}
                onChange={(e) => setTypedOffice(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    const val = typedOffice.trim() || "Unspecified Office";
                    onIncrement(val);
                    setTypedOffice("");
                  }
                }}
                className="flex-1 min-w-0 px-2 py-1 text-xs font-semibold rounded bg-slate-50 border border-slate-200 text-slate-705 placeholder-slate-400 outline-hidden focus:bg-white focus:border-blue-400 transition-all font-sans"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const val = typedOffice.trim() || "Unspecified Office";
                  onIncrement(val);
                  setTypedOffice("");
                }}
                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold transition-all shadow-4xs shrink-0 cursor-pointer"
              >
                + Log
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Interactive Selection Fields for messengerial categories */}
        {(config.key === "messengerialCoPsp" || 
          config.key === "messengerialPsp" || 
          config.key === "messengerialGeneral" || 
          config.key === "messengerialPostal") && (
          <div className="mt-3 py-2 border-t border-slate-100 flex flex-col gap-1.5 relative z-20" onClick={(e) => e.stopPropagation()}>
            <label className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold block">Office Received For:</label>
            <div className="flex gap-1">
              <input
                type="text"
                placeholder="Type office & Enter..."
                value={typedOffice}
                onChange={(e) => setTypedOffice(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    const val = typedOffice.trim() || "Unspecified Office";
                    onIncrement(val);
                    setTypedOffice("");
                  }
                }}
                className="flex-1 min-w-0 px-2 py-1 text-xs font-semibold rounded bg-slate-50 border border-slate-200 text-slate-705 placeholder-slate-400 outline-hidden focus:bg-white focus:border-blue-400 transition-all font-sans"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const val = typedOffice.trim() || "Unspecified Office";
                  onIncrement(val);
                  setTypedOffice("");
                }}
                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold transition-all shadow-4xs shrink-0 cursor-pointer"
              >
                + Log
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Interactive Selection Fields for incomingHandcarryFiles */}
        {config.key === "incomingHandcarryFiles" && (
          <div className="mt-3 py-2 border-t border-slate-100 flex flex-col gap-1.5 relative z-20" onClick={(e) => e.stopPropagation()}>
            <label className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold block">Where was paper received?</label>
            <div className="flex gap-1">
              <input
                type="text"
                placeholder="Type location & Enter..."
                value={typedHandcarry}
                onChange={(e) => setTypedHandcarry(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    const val = typedHandcarry.trim() || "Unspecified Office";
                    onIncrement(val);
                    setTypedHandcarry("");
                  }
                }}
                className="flex-1 min-w-0 px-2 py-1 text-xs font-semibold rounded bg-slate-50 border border-slate-200 text-slate-700 placeholder-slate-400 outline-hidden focus:bg-white focus:border-blue-400 transition-all font-sans"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const val = typedHandcarry.trim() || "Unspecified Office";
                  onIncrement(val);
                  setTypedHandcarry("");
                }}
                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold transition-all shadow-4xs shrink-0 cursor-pointer"
              >
                + Log
              </button>
            </div>
          </div>
        )}

        {/* Real-time Feeds Display & Removal Badges */}
        {((config.key === "incomingCalls" && incomingCallTimes && incomingCallTimes.length > 0) || 
          (detailsList && detailsList.length > 0)) && (
          <div 
            className="flex flex-wrap gap-1 mt-2.5 pt-2.5 border-t border-slate-100/50 max-h-[105px] overflow-y-auto pr-1 relative z-20" 
            onClick={(e) => e.stopPropagation()}
          >
            {config.key === "incomingCalls" && incomingCallTimes
              ? incomingCallTimes.map((t, idx) => (
                  <span 
                    key={idx} 
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveIncomingCallTime?.(idx);
                    }}
                    title="Click to remove this specific call log"
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[8.5px] font-semibold leading-none bg-blue-50 hover:bg-rose-50 text-blue-800 hover:text-rose-700 border border-blue-200 hover:border-rose-200 rounded-sm transition-all cursor-pointer"
                  >
                    {t}
                    <span className="font-sans font-extrabold text-blue-400 hover:text-rose-500 select-none ml-0.5">×</span>
                  </span>
                ))
              : detailsList && detailsList.map((d, idx) => (
                  <span 
                    key={idx} 
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveDetailIndex?.(idx);
                    }}
                    title="Click to remove this specific log item"
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[8.5px] font-semibold leading-none bg-indigo-50 hover:bg-rose-50 text-indigo-800 hover:text-rose-700 border border-indigo-200 hover:border-rose-200 rounded-sm transition-all cursor-pointer"
                  >
                    {d}
                    <span className="font-sans font-extrabold text-indigo-400 hover:text-rose-500 select-none ml-0.5">×</span>
                  </span>
                ))
            }
          </div>
        )}
      </div>

      {/* Main Count Display State */}
      <div className="relative z-10 flex items-end justify-between mt-auto">
        <div className="flex items-baseline gap-1 animate-pulse-once">
          <AnimatePresence mode="popLayout">
            <motion.span
              key={count}
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight"
            >
              {count}
            </motion.span>
          </AnimatePresence>
          <span className="text-[10px] text-slate-400 font-medium font-sans uppercase">
            Logged
          </span>
        </div>

        {/* Action Tray for Decrementing & Manual Editing */}
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {isEditing ? (
            <form onSubmit={handleApplyEdit} className="flex items-center gap-1">
              <input
                type="text"
                pattern="[0-9]*"
                inputMode="numeric"
                value={editVal}
                onChange={(e) => setEditVal(e.target.value)}
                className="w-12 h-7 text-center font-mono text-sm border border-blue-300 rounded-md bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-slate-800"
                autoFocus
                onBlur={() => setIsEditing(false)}
              />
              <button
                type="submit"
                className="p-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <>
              {/* Manual input trigger */}
              <button
                onClick={handleStartEdit}
                title="Edit quantity manually"
                className="p-1.5 rounded-md hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 transition-colors"
                id={`btn-edit-${config.key}`}
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>

              {/* Deduct Button */}
              <button
                disabled={count === 0}
                onClick={onDecrement}
                title="Deduct 1 count"
                className={`p-1.5 rounded-md transition-colors ${
                  count === 0
                    ? "text-slate-300 cursor-not-allowed"
                    : "hover:bg-rose-50 text-slate-400 hover:text-rose-600"
                }`}
                id={`btn-deduct-${config.key}`}
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
