/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Plus, X, MessageSquare, PlusCircle, CheckCircle } from "lucide-react";

interface OtherTasksManagerProps {
  otherCount: number;
  comments: string[];
  onAddComment: (comment: string) => void;
  onRemoveComment: (index: number) => void;
  onIncrementOther: () => void;
}

const COMMON_OFFICE_TASKS = [
  "Attended department meeting",
  "Audited physical files cabinet",
  "Walk-in client inquiry resolved",
  "Drafted circular memorandum",
  "Sorted incoming postal mail bags",
  "Assisted IT support desk session",
];

export function OtherTasksManager({
  otherCount,
  comments,
  onAddComment,
  onRemoveComment,
  onIncrementOther,
}: OtherTasksManagerProps) {
  const [inputValue, setInputValue] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onAddComment(inputValue.trim());
      setInputValue("");
    }
  };

  const handleQuickAdd = (taskText: string) => {
    onAddComment(taskText);
  };

  return (
    <div id="other-tasks-manager" className="bg-white rounded-xl border border-slate-200 shadow-3xs p-5 flex flex-col h-full">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
        <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
          <MessageSquare className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-bold text-slate-800 text-sm leading-tight">
            📝 &quot;Other&quot; Action Log Details
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Add detailed descriptions for your custom tasks.
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1 bg-blue-100/50 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono">
          Count: {otherCount}
        </div>
      </div>

      {otherCount === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
          <MessageSquare className="w-8 h-8 text-slate-300 stroke-[1.2] mb-2" />
          <p className="text-xs font-medium text-slate-600">No custom actions initiated yet</p>
          <p className="text-[11px] text-slate-400 max-w-xs mt-1">
            Tap the <strong className="text-slate-600">&quot;Other Desktop Actions&quot;</strong> button or type a note below to start logging custom tasks.
          </p>
          <button
            onClick={onIncrementOther}
            className="mt-3 flex items-center gap-1 text-[11px] text-blue-600 font-bold bg-blue-50/80 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-all"
            id="btn-increment-other-prompt"
          >
            <PlusCircle className="w-3.5 h-3.5" /> Initialize Action Group
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-between gap-4">
          <div className="space-y-3.5 max-h-[180px] overflow-y-auto pr-1">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Draft Comments &amp; Descriptions ({comments.length})
            </h3>
            
            {comments.length === 0 ? (
              <p className="text-xs italic text-slate-400 p-2 text-center bg-slate-50 border border-slate-100 rounded-lg">
                Please type what you did below to ensure detailed summary accuracy.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {comments.map((comment, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between gap-2 p-2 bg-gradient-to-r from-slate-50 to-slate-50/50 hover:from-blue-50/40 hover:to-slate-50/40 border border-slate-100 rounded-lg group transition-all text-xs text-slate-700"
                  >
                    <div className="flex items-start gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="leading-tight">{comment}</span>
                    </div>
                    <button
                      onClick={() => onRemoveComment(index)}
                      className="text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                      title="Delete draft comment"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <form onSubmit={handleAdd} className="mt-auto space-y-3">
            <div className="flex gap-1.5">
              <input
                type="text"
                placeholder="Type what you did..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-slate-200 bg-slate-50 focus:bg-white rounded-lg text-xs placeholder-slate-400 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500 transition-all font-sans"
                id="other-comment-input"
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white rounded-lg text-xs font-bold transition-all shrink-0 flex items-center justify-center gap-1 hover:shadow-xs"
                id="btn-add-other-comment"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>

            {/* Quick Suggestions Cards */}
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                ⚡ Quick Suggestions:
              </span>
              <div className="flex flex-wrap gap-1 max-h-[84px] overflow-y-auto pr-1">
                {COMMON_OFFICE_TASKS.map((task) => {
                  const isAlreadyAdded = comments.includes(task);
                  return (
                    <button
                      key={task}
                      type="button"
                      disabled={isAlreadyAdded}
                      onClick={() => handleQuickAdd(task)}
                      className={`text-[10px] px-2 py-1 rounded-md border text-left transition-colors truncate max-w-[170px] ${
                        isAlreadyAdded
                          ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                          : "bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border-slate-200 hover:border-blue-200 text-slate-600 font-sans"
                      }`}
                      title={task}
                    >
                      + {task}
                    </button>
                  );
                })}
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
