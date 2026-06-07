/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Calendar,
  Clock,
  Search,
  Copy,
  Check,
  Lock,
  FileSpreadsheet,
  FileText,
  Trash2,
  Edit,
  Save,
  X,
  Plus,
  Minus,
  FileDown
} from "lucide-react";
import { Report, BaseCounters, TASK_CONFIGS } from "../types";
import { jsPDF } from "jspdf";

interface ReportArchiveProps {
  reports: Report[];
  onRemoveReport?: (id: string) => void;
  onUpdateReport?: (id: string, updatedReport: Report) => void;
}

export function ReportArchive({ reports, onRemoveReport, onUpdateReport }: ReportArchiveProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // States for live corrections/editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSummaryText, setEditSummaryText] = useState("");
  const [editCounts, setEditCounts] = useState<BaseCounters | null>(null);

  // Custom confirmation state for deleting a log entry (anti-iframe blocks)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleCopyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStartEdit = (report: Report) => {
    setEditingId(report.id);
    setEditSummaryText(report.manualSummaryText);
    setEditCounts({ ...report.counts });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditCounts(null);
  };

  const handleSaveEdit = (report: Report) => {
    if (!onUpdateReport || !editCounts) return;
    onUpdateReport(report.id, {
      ...report,
      manualSummaryText: editSummaryText,
      counts: editCounts,
    });
    setEditingId(null);
    setEditCounts(null);
  };

  const handleRemoveClick = (id: string) => {
    if (onRemoveReport) {
      onRemoveReport(id);
    }
    setConfirmDeleteId(null);
  };

  const handleDownloadSinglePDF = (report: Report) => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      // Top header background bar
      doc.setFillColor(30, 41, 59); // Slate-800
      doc.rect(0, 0, 210, 35, "F");

      // Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(255, 255, 255);
      doc.text("RAMSync Desk Activity Report", 14, 18);

      // Subtitle / metadata
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(203, 213, 225); // Slate-300
      doc.text(`Official Log Entry Receipt | Record ID: ${report.id}`, 14, 25);

      // Left & Right boundary margins
      const startX = 14;
      let currentY = 48;

      // Session metadata box
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(30, 41, 59); // Slate-800
      doc.text("SESSION RECORD METADATA", startX, currentY);
      
      doc.setDrawColor(226, 232, 240); // Slate-200
      doc.setLineWidth(0.5);
      doc.line(startX, currentY + 2, 196, currentY + 2);
      currentY += 8;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(100, 116, 139); // Slate-500
      doc.text("Date Logged:", startX, currentY);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(15, 23, 42); // Slate-900
      doc.text(report.dateString, startX + 26, currentY);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(100, 116, 139);
      doc.text("Time Logged:", startX + 90, currentY);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(15, 23, 42);
      doc.text(report.timeString, startX + 116, currentY);
      currentY += 8;

      // Render activity breakdown list / grid
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(30, 41, 59);
      doc.text("RECORDED QUANTITIES BREAKDOWN", startX, currentY);
      doc.line(startX, currentY + 2, 196, currentY + 2);
      currentY += 8;

      const labelsMap: Record<string, string> = {
        incomingCalls: "Incoming Calls",
        receivedRsoRto: "Received RSO/RTO",
        incomingHandcarryFiles: "Incoming Handcarry Files",
        scanFiles: "Scan Files",
        stampedDocuments: "Stamped Documents",
        filesAdRamsHead: "AD-RAMS Submissions",
        processedSecondCopiesCo: "CO 2nd Copies",
        messengerialCoPsp: "CO  PSP logs",
        messengerialPsp: "PSP dispatches",
        messengerialGeneral: "General Mess.",
        messengerialPostal: "Postal Send",
        inventoryRecords: "Reg Inventory",
        outgoingDocuments: "Outgoing Docs",
        outgoingRsoRto: "Outgoing RSO/RTO",
        outgoingSecondCopies: "Outgoing 2nd Copies",
        other: "Other Activities",
      };

      const loggedItems = Object.entries(report.counts).filter(([_, val]) => Number(val) > 0);
      
      if (loggedItems.length === 0) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9.5);
        doc.setTextColor(148, 163, 184);
        doc.text("No specific quantities were logged. All counts were zero.", startX, currentY);
        currentY += 8;
      } else {
        // Table Header
        doc.setFillColor(248, 250, 252); // Slate-50 background header
        doc.rect(startX, currentY - 4, 182, 6, "F");
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105);
        doc.text("Desk Activity Category / Item Description", startX + 4, currentY);
        doc.text("Volume (Items)", startX + 140, currentY);
        currentY += 6;

        loggedItems.forEach(([key, val]) => {
          doc.setDrawColor(241, 245, 249);
          doc.line(startX, currentY + 1, startX + 182, currentY + 1);
          
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(51, 65, 85);
          doc.text(labelsMap[key] || key, startX + 4, currentY);
          
          doc.setFont("helvetica", "bold");
          doc.text(String(val), startX + 145, currentY);
          currentY += 5.5;
        });
        currentY += 5;
      }

      // Call Timestamps feed
      if (report.incomingCallTimes && report.incomingCallTimes.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10.5);
        doc.setTextColor(30, 41, 59);
        doc.text("LOGGED CALL TIMESTAMPS FEED", startX, currentY);
        doc.line(startX, currentY + 2, 196, currentY + 2);
        currentY += 8;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105);
        const stampText = report.incomingCallTimes.join("  |  ");
        const splitStamps = doc.splitTextToSize(stampText, 182);
        splitStamps.forEach((line: string) => {
          doc.text(line, startX + 4, currentY);
          currentY += 4.5;
        });
        currentY += 5;
      }

      // RSO RTO Origins
      if (report.receivedRsoRtoDetails && report.receivedRsoRtoDetails.length > 0) {
        if (currentY > 260) {
          doc.addPage();
          currentY = 20;
        }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10.5);
        doc.setTextColor(30, 41, 59);
        doc.text("RECEIVED RSO & RTO ORIGINS FEED", startX, currentY);
        doc.line(startX, currentY + 2, 196, currentY + 2);
        currentY += 8;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105);
        const originText = report.receivedRsoRtoDetails.join("  |  ");
        const splitOrigins = doc.splitTextToSize(originText, 182);
        splitOrigins.forEach((line: string) => {
          if (currentY > 275) {
            doc.addPage();
            currentY = 20;
          }
          doc.text(line, startX + 4, currentY);
          currentY += 4.5;
        });
        currentY += 5;
      }

      // Handcarry Locations
      if (report.incomingHandcarryDetails && report.incomingHandcarryDetails.length > 0) {
        if (currentY > 260) {
          doc.addPage();
          currentY = 20;
        }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10.5);
        doc.setTextColor(30, 41, 59);
        doc.text("INCOMING HANDCARRY CHECKPOINTS FEED", startX, currentY);
        doc.line(startX, currentY + 2, 196, currentY + 2);
        currentY += 8;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105);
        const handText = report.incomingHandcarryDetails.join("  |  ");
        const splitHands = doc.splitTextToSize(handText, 182);
        splitHands.forEach((line: string) => {
          if (currentY > 275) {
            doc.addPage();
            currentY = 20;
          }
          doc.text(line, startX + 4, currentY);
          currentY += 4.5;
        });
        currentY += 5;
      }

      // Narrative Statement
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(30, 41, 59);
      doc.text("NARRATIVE ACTIVITY STATEMENT", startX, currentY);
      doc.line(startX, currentY + 2, 196, currentY + 2);
      currentY += 8;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);

      const splitManualText = doc.splitTextToSize(report.manualSummaryText, 182);
      splitManualText.forEach((line: string) => {
        if (currentY > 275) {
          doc.addPage();
          currentY = 20;
        }
        doc.text(line, startX, currentY);
        currentY += 5;
      });

      // Bottom Watermark
      const footerY = 282;
      doc.setDrawColor(226, 232, 240);
      doc.line(startX, footerY, 196, footerY);

      doc.setFont("helvetica", "italic");
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text("Generated securely via RAMSync Local Ledger System.", startX, footerY + 4);
      doc.text(`Doc UUID: ${report.id.slice(-12)} - Page 1 of 1`, startX + 115, footerY + 4);

      const sanitizedDate = report.dateString.replace(/[\s,]+/g, "_");
      doc.save(`RAMSync_Report_${report.id.slice(-6)}_${sanitizedDate}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to export PDF format. Please contact administration.");
    }
  };

  const handleExportAllPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      // Cover Bar
      doc.setFillColor(30, 41, 59); // Slate-800
      doc.rect(0, 0, 210, 38, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255);
      doc.text("RAMSync Operational Ledger", 14, 18);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(203, 213, 225); // Slate-300
      doc.text(`Consolidated Shifts Activity Summary | Total Logs: ${reports.length}`, 14, 26);
      doc.text(`Exported on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 14, 31);

      let currentY = 50;
      const startX = 14;

      const labelsMap: Record<string, string> = {
        incomingCalls: "Incoming Calls",
        receivedRsoRto: "Received RSO/RTO",
        incomingHandcarryFiles: "Incoming Handcarry Files",
        scanFiles: "Scan Files",
        stampedDocuments: "Stamped Documents",
        filesAdRamsHead: "AD-RAMS Submissions",
        processedSecondCopiesCo: "CO 2nd Copies",
        messengerialCoPsp: "CO  PSP logs",
        messengerialPsp: "PSP dispatches",
        messengerialGeneral: "General Mess.",
        messengerialPostal: "Postal Send",
        inventoryRecords: "Reg Inventory",
        outgoingDocuments: "Outgoing Docs",
        outgoingRsoRto: "Outgoing RSO/RTO",
        outgoingSecondCopies: "Outgoing 2nd Copies",
        other: "Other Activities",
      };

      reports.forEach((report, index) => {
        if (currentY > 235) {
          doc.addPage();
          currentY = 25;
        }

        // Section header
        doc.setFillColor(241, 245, 249);
        doc.rect(startX, currentY - 5, 182, 8, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(15, 23, 42);
        doc.text(`Log Record #${reports.length - index} | ID: ...${report.id.slice(-6)}`, startX + 3, currentY);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105);
        doc.text(`${report.dateString} at ${report.timeString}`, startX + 105, currentY);
        currentY += 9;

        // Metric counts
        const logged = Object.entries(report.counts).filter(([_, val]) => Number(val) > 0);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(100, 116, 139);
        doc.text("Quantities Logged:", startX + 3, currentY);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(51, 65, 85);
        if (logged.length === 0) {
          doc.text("None logged", startX + 38, currentY);
          currentY += 4.5;
        } else {
          const textBreakdown = logged.map(([key, value]) => `${labelsMap[key] || key}: ${value}`).join(", ");
          const splitText = doc.splitTextToSize(textBreakdown, 140);
          let subY = currentY;
          splitText.forEach((line: string, lineIndex: number) => {
            if (subY > 275) {
              doc.addPage();
              subY = 20;
            }
            // indent only first line or render list nicely
            doc.text(line, startX + (lineIndex === 0 ? 38 : 6), subY);
            subY += 4.5;
          });
          currentY = subY;
        }

        // Call Times
        if (report.incomingCallTimes && report.incomingCallTimes.length > 0) {
          if (currentY > 275) {
            doc.addPage();
            currentY = 20;
          }
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8.5);
          doc.setTextColor(100, 116, 139);
          doc.text("Registered Calls:", startX + 3, currentY);

          doc.setFont("helvetica", "normal");
          doc.setTextColor(51, 65, 85);
          const stampsJoin = report.incomingCallTimes.join(" | ");
          const splitStamps = doc.splitTextToSize(stampsJoin, 140);
          let subY = currentY;
          splitStamps.forEach((line: string, lineIndex: number) => {
            if (subY > 275) {
              doc.addPage();
              subY = 20;
            }
            doc.text(line, startX + (lineIndex === 0 ? 38 : 6), subY);
            subY += 4.5;
          });
          currentY = subY;
        }

        // Received RSO RTO Details
        if (report.receivedRsoRtoDetails && report.receivedRsoRtoDetails.length > 0) {
          if (currentY > 275) {
            doc.addPage();
            currentY = 20;
          }
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8.5);
          doc.setTextColor(100, 116, 139);
          doc.text("Received RSO & RTO:", startX + 3, currentY);

          doc.setFont("helvetica", "normal");
          doc.setTextColor(51, 65, 85);
          const rsoJoin = report.receivedRsoRtoDetails.join(" | ");
          const splitRso = doc.splitTextToSize(rsoJoin, 140);
          let subY = currentY;
          splitRso.forEach((line: string, lineIndex: number) => {
            if (subY > 275) {
              doc.addPage();
              subY = 20;
            }
            doc.text(line, startX + (lineIndex === 0 ? 38 : 6), subY);
            subY += 4.5;
          });
          currentY = subY;
        }

        // Incoming Handcarry Details
        if (report.incomingHandcarryDetails && report.incomingHandcarryDetails.length > 0) {
          if (currentY > 275) {
            doc.addPage();
            currentY = 20;
          }
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8.5);
          doc.setTextColor(100, 116, 139);
          doc.text("Incoming Handcarry:", startX + 3, currentY);

          doc.setFont("helvetica", "normal");
          doc.setTextColor(51, 65, 85);
          const handJoin = report.incomingHandcarryDetails.join(" | ");
          const splitHand = doc.splitTextToSize(handJoin, 140);
          let subY = currentY;
          splitHand.forEach((line: string, lineIndex: number) => {
            if (subY > 275) {
              doc.addPage();
              subY = 20;
            }
            doc.text(line, startX + (lineIndex === 0 ? 38 : 6), subY);
            subY += 4.5;
          });
          currentY = subY;
        }

        // Summary statement
        if (currentY > 275) {
          doc.addPage();
          currentY = 20;
        }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(100, 116, 139);
        doc.text("Compiled Summary Statement:", startX + 3, currentY);
        currentY += 4.5;

        doc.setFont("helvetica", "normal");
        doc.setTextColor(15, 23, 42);
        const splitTextSummary = doc.splitTextToSize(report.manualSummaryText, 175);
        splitTextSummary.forEach((line: string) => {
          if (currentY > 275) {
            doc.addPage();
            currentY = 20;
          }
          doc.text(line, startX + 3, currentY);
          currentY += 4.5;
        });

        currentY += 7; // spacing
      });

      // Footer page tags
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "italic");
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.setDrawColor(241, 245, 249);
        doc.line(startX, 282, 196, 282);
        doc.text(`RAMSync Consolidated Shift Ledger Audit Export`, startX, 286);
        doc.text(`Page ${i} of ${totalPages}`, 178, 286);
      }

      const formattedStamp = new Date().toISOString().slice(0, 10);
      doc.save(`RAMSync_Shift_Ledger_${formattedStamp}.pdf`);
    } catch (err) {
      console.error("Shift ledger export failed", err);
      alert("Failed to consolidate shift ledger to PDF. Please try again.");
    }
  };

  const handleIncrementEditDigit = (key: keyof BaseCounters) => {
    if (!editCounts) return;
    setEditCounts({
      ...editCounts,
      [key]: (editCounts[key] || 0) + 1,
    });
  };

  const handleDecrementEditDigit = (key: keyof BaseCounters) => {
    if (!editCounts) return;
    setEditCounts({
      ...editCounts,
      [key]: Math.max(0, (editCounts[key] || 0) - 1),
    });
  };

  const filteredReports = reports.filter((report) => {
    const textQuery = searchQuery.toLowerCase();
    const matchesSummary = report.manualSummaryText.toLowerCase().includes(textQuery);
    const matchesDate = report.dateString.toLowerCase().includes(textQuery);
    const matchesComments = report.comments.some((c) => c.toLowerCase().includes(textQuery));
    return matchesSummary || matchesDate || matchesComments;
  });

  return (
    <div id="report-archive-section" className="bg-white rounded-xl border border-slate-200 shadow-3xs p-6">
      {/* Header and corrections notice */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-4 mb-5 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 text-base flex flex-wrap items-center gap-2 leading-tight">
              📁 Archived Task Reports
              <span className="flex items-center gap-1 text-[10px] bg-amber-50 text-amber-700 border border-amber-200/60 px-2 py-0.5 rounded-full font-bold select-none">
                Corrections &amp; Removals Enabled
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Chronological log of completed desk activities. Remove entries or make offline corrections in place.
            </p>
          </div>
        </div>

        {/* Search Input bar & Global PDF Export */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          {reports.length > 0 && (
            <button
              onClick={handleExportAllPDF}
              className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-lg shadow-2xs hover:shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer leading-tight font-sans"
              title="Download all archived reports as a single consolidated PDF audit ledger"
            >
              <FileDown className="w-4 h-4 shrink-0" />
              Export All PDF
            </button>
          )}

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search archived logs & dates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 bg-slate-50 focus:bg-white rounded-lg text-xs text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500 placeholder-slate-400 transition-all font-sans"
              id="archive-search-input"
            />
          </div>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-12 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
          <div className="mx-auto w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-3">
            <FileText className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-sm font-semibold text-slate-700">No reports recorded yet</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 font-sans">
            Increase counts in your active draft above, fill in any relevant custom comment notes, and click the <strong className="text-slate-600">&quot;Summarize &amp; Log Activity&quot;</strong> button to generate your first archival log entry.
          </p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-xs text-slate-400 italic font-sans">No historical records match your search criteria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex justify-between">
            <span>Showing {filteredReports.length} of {reports.length} Logs</span>
            <span className="text-blue-600 flex items-center gap-1 font-bold font-sans select-none">
              ● Live Historical Ledger
            </span>
          </div>
          
          <div className="grid gap-4">
            {filteredReports.map((report) => {
              const isEditingThis = editingId === report.id;
              const countsToUse = isEditingThis && editCounts ? editCounts : report.counts;
              const totalItems = (Object.keys(countsToUse) as Array<keyof BaseCounters>).reduce(
                (acc, key) => acc + Number(countsToUse[key] || 0),
                0
              );

              return (
                <div
                  key={report.id}
                  id={`report-entry-${report.id}`}
                  className={`bg-white border border-slate-200 rounded-xl p-4 transition-all flex flex-col justify-between gap-4 select-text relative ${
                    isEditingThis 
                      ? "ring-2 ring-amber-500 border-transparent shadow-md bg-amber-50/5" 
                      : "border-l-4 border-l-blue-500 hover:border-blue-300 hover:shadow-xs"
                  }`}
                >
                  {/* Left Column Area: Details and editing switches */}
                  <div className="flex-1 space-y-3 text-left">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                        <span className="flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50/70 border border-blue-100 px-2.5 py-0.5 rounded-lg font-sans">
                          <Calendar className="w-3 h-3 text-blue-500" />
                          {report.dateString}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 font-sans">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {report.timeString}
                        </span>
                        <span className="text-[11px] bg-slate-150 text-slate-650 font-black px-2 py-0.5 rounded-md font-mono select-none">
                          Items: {totalItems}
                        </span>
                      </div>

                      {/* Editing badge highlight */}
                      {isEditingThis && (
                        <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded animate-pulse">
                          ✎ Tweak Workspace Mode
                        </span>
                      )}
                    </div>

                    {/* Report Text Display / Textarea Area */}
                    {isEditingThis ? (
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-amber-800 uppercase block select-none">
                          Edit Automated Summary Text narrative
                        </label>
                        <textarea
                          value={editSummaryText}
                          onChange={(e) => setEditSummaryText(e.target.value)}
                          className="w-full min-h-[80px] p-2.5 border border-amber-300 bg-white rounded-lg text-xs text-slate-800 font-sans focus:outline-hidden focus:ring-1 focus:ring-amber-500 resize-y leading-relaxed"
                        />
                      </div>
                    ) : (
                      <div className="bg-slate-50 border border-slate-150 p-3 rounded-lg text-xs text-slate-700 font-sans leading-relaxed">
                        {report.manualSummaryText}
                      </div>
                    )}

                    {/* Timestamp display list if logged */}
                    {report.incomingCallTimes && report.incomingCallTimes.length > 0 && (
                      <div className="bg-blue-50/30 border border-blue-100/60 p-2.5 rounded-lg text-[11px] leading-snug text-slate-700">
                        <p className="font-bold text-blue-800 mb-1 flex items-center gap-1 text-[11px]">
                          📞 Logged Call Timestamps:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {report.incomingCallTimes.map((item, idx) => (
                            <span key={idx} className="bg-white border border-blue-200 px-1.5 py-0.5 rounded-sm font-mono text-[10px] text-blue-700">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {report.receivedRsoRtoDetails && report.receivedRsoRtoDetails.length > 0 && (
                      <div className="bg-indigo-50/30 border border-indigo-100/60 p-2.5 rounded-lg text-[11px] leading-snug text-slate-700 mt-2">
                        <p className="font-bold text-indigo-800 mb-1 flex items-center gap-1 text-[11px]">
                          📝 Received RSO & RTO Origins:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {report.receivedRsoRtoDetails.map((item, idx) => (
                            <span key={idx} className="bg-white border border-indigo-200 px-1.5 py-0.5 rounded-sm font-sans text-[10px] text-indigo-750">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {report.incomingHandcarryDetails && report.incomingHandcarryDetails.length > 0 && (
                      <div className="bg-amber-50/30 border border-amber-100/60 p-2.5 rounded-lg text-[11px] leading-snug text-slate-700 mt-2">
                        <p className="font-bold text-amber-800 mb-1 flex items-center gap-1 text-[11px]">
                          💼 Incoming Handcarry Locations:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {report.incomingHandcarryDetails.map((item, idx) => (
                            <span key={idx} className="bg-white border border-amber-200 px-1.5 py-0.5 rounded-sm font-sans text-[10px] text-amber-750">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {report.todayTasks && report.todayTasks.length > 0 && (
                      <div className="bg-emerald-50/20 border border-emerald-100/60 p-2.5 rounded-lg text-[11px] leading-snug text-slate-700 mt-2">
                        <p className="font-bold text-emerald-800 mb-1 flex items-center gap-1 text-[11px]">
                          ✓ Today's Checklist Tasks:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {report.todayTasks.map((item, idx) => (
                            <span key={idx} className={`px-2 py-0.5 rounded-md font-sans text-[10px] border ${
                              item.completed 
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 line-through" 
                                : "bg-white text-slate-650 border-slate-200"
                            }`}>
                              {item.completed ? "✓ " : "⏳ "}{item.text}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {report.rushDocuments && report.rushDocuments.length > 0 && (
                      <div className="bg-amber-50/25 border border-amber-100/40 p-2.5 rounded-lg text-[11px] leading-snug text-slate-700 mt-2">
                        <p className="font-bold text-amber-900 mb-1 flex items-center gap-1 text-[11px]">
                          ⚡ Urgent Rush Documents:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {report.rushDocuments.map((item, idx) => (
                            <span key={idx} className={`px-2 py-0.5 rounded-md font-sans text-[10px] border ${
                              item.completed 
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 line-through" 
                                : "bg-amber-50/50 text-amber-850 border-amber-200"
                            }`}>
                              {item.completed ? "✓ " : "⏳ "}{item.title} (Target: {item.targetTime})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {report.thingsLearned && report.thingsLearned.trim() && (
                      <div className="bg-indigo-50/30 border border-indigo-100/40 p-2.5 rounded-lg text-[11px] leading-snug text-slate-700 mt-2">
                        <p className="font-bold text-indigo-800 mb-1 text-[11px]">
                          🎓 Key Wisdom & Lessons Gained:
                        </p>
                        <p className="bg-white/80 border border-indigo-100 px-2 py-1.5 rounded-lg italic text-slate-650 leading-relaxed">
                          "{report.thingsLearned.trim()}"
                        </p>
                      </div>
                    )}

                    {report.officeAdvice && report.officeAdvice.trim() && (
                      <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-[11px] leading-snug text-slate-700 mt-2">
                        <p className="font-bold text-slate-800 mb-1 text-[11px]">
                          💡 Coworker & Supervisor Advice:
                        </p>
                        <p className="bg-white border border-slate-150 px-2 py-1.5 rounded-lg italic text-slate-650 leading-relaxed">
                          "{report.officeAdvice.trim()}"
                        </p>
                      </div>
                    )}

                    {/* Dynamic Counts Correction Dashboard Grid */}
                    <div className="space-y-1.5 pt-1">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">
                        Logged Counts breakdown {isEditingThis ? " (Modify quantities below)" : ""}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(countsToUse).map(([key, value]) => {
                          // Labels mapped in order
                          const labelMap: Record<string, string> = {
                            incomingCalls: "Incoming Calls",
                            receivedRsoRto: "Received RSO/RTO",
                            incomingHandcarryFiles: "Incoming Handcarry Files",
                            scanFiles: "Scan Files",
                            stampedDocuments: "Stamped Documents",
                            filesAdRamsHead: "AD-RAMS Submissions",
                            processedSecondCopiesCo: "CO 2nd Copies",
                            messengerialCoPsp: "CO  PSP logs",
                            messengerialPsp: "PSP dispatches",
                            messengerialGeneral: "General Mess.",
                            messengerialPostal: "Postal Send",
                            inventoryRecords: "Reg Inventory",
                            outgoingDocuments: "Outgoing Docs",
                            outgoingRsoRto: "Outgoing RSO/RTO",
                            outgoingSecondCopies: "Outgoing 2nd Copies",
                            other: "Other Activities",
                          };

                          const label = labelMap[key] || key;

                          // Render correction knobs only in editing mode or pill if value > 0
                          if (!isEditingThis) {
                            if (value === 0) return null;
                            return (
                              <span
                                key={key}
                                className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 font-mono select-none"
                              >
                                <strong>{label}:</strong> {value}
                              </span>
                            );
                          } else {
                            // Editable inline widget panel
                            return (
                              <div
                                key={key}
                                className="flex items-center gap-1.5 bg-amber-50/50 border border-amber-100 px-2 py-1 rounded-lg text-[11px] font-mono select-none"
                              >
                                <span className="font-semibold text-slate-700 pr-1">{label}:</span>
                                <button
                                  type="button"
                                  onClick={() => handleDecrementEditDigit(key as keyof BaseCounters)}
                                  className="w-5 h-5 bg-white hover:bg-amber-100 border border-amber-200 text-slate-600 rounded flex items-center justify-center font-bold text-xs active:scale-95 transition-transform"
                                >
                                  -
                                </button>
                                <span className="w-6 text-center font-black text-amber-900">{value}</span>
                                <button
                                  type="button"
                                  onClick={() => handleIncrementEditDigit(key as keyof BaseCounters)}
                                  className="w-5 h-5 bg-white hover:bg-amber-100 border border-amber-200 text-slate-600 rounded flex items-center justify-center font-bold text-xs active:scale-95 transition-transform"
                                >
                                  +
                                </button>
                              </div>
                            );
                          }
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Actions Tray: Right or Bottom depending on screen spacing */}
                  <div className="flex flex-row flex-wrap md:flex-col items-center justify-end md:justify-between border-t md:border-t-0 border-slate-150 pt-3 md:pt-0 gap-2 md:gap-4 shrink-0">
                    
                    {/* Operation State Knobs */}
                    {isEditingThis ? (
                      <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto">
                        <button
                          onClick={() => handleSaveEdit(report)}
                          className="flex items-center justify-center gap-1 text-[11px] font-bold tracking-wide text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg shadow-sm transition-all flex-1 md:flex-none cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          Save Tweaks
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="flex items-center justify-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-all flex-1 md:flex-none cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto select-none">
                        {/* Normal operation buttons */}
                        <button
                          onClick={() => handleStartEdit(report)}
                          className="flex items-center justify-center gap-1 text-[11px] font-bold text-slate-700 hover:text-blue-700 bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-200 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                          id={`btn-archive-edit-${report.id}`}
                        >
                          <Edit className="w-3.5 h-3.5" />
                          Edit Report
                        </button>

                        <button
                          onClick={() => handleDownloadSinglePDF(report)}
                          className="flex items-center justify-center gap-1 text-[11px] font-bold text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 border border-blue-200 hover:border-transparent px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                          id={`btn-download-pdf-${report.id}`}
                          title="Download this specific logs entry as a PDF receipt"
                        >
                          <FileDown className="w-3.5 h-3.5" />
                          Download PDF
                        </button>
 
                        <button
                          onClick={() =>
                            handleCopyToClipboard(
                              report.id,
                              `--- WORK LOG: ${report.dateString} @ ${report.timeString} ---\n${report.manualSummaryText}`
                            )
                          }
                          className={`flex items-center justify-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                            copiedId === report.id
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-white hover:bg-slate-50 text-slate-600 hover:text-blue-600 border-slate-200 hover:border-blue-200 shadow-3xs"
                          }`}
                          id={`btn-copy-${report.id}`}
                        >
                          {copiedId === report.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600 animate-scale-in" />
                              Copied Code!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              Copy Text
                            </>
                          )}
                        </button>
 
                        {confirmDeleteId === report.id ? (
                          <div className="flex items-center gap-1 bg-rose-50 border border-rose-100 p-1 rounded-lg animate-fade-in font-sans">
                            <button
                              onClick={() => handleRemoveClick(report.id)}
                              className="flex items-center justify-center gap-1 text-[10px] font-black text-white bg-rose-600 hover:bg-rose-700 px-2.5 py-1.5 rounded-md shadow-xs cursor-pointer transition-all"
                              id={`btn-archive-confirm-remove-${report.id}`}
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="flex items-center justify-center gap-1 text-[10px] font-bold text-slate-500 bg-white hover:bg-slate-150 px-2 py-1.5 rounded-md border border-slate-200 cursor-pointer transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(report.id)}
                            className="flex items-center justify-center gap-1 text-[11px] font-bold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-150 hover:border-transparent px-3 py-1.5 rounded-lg shadow-3xs transition-all cursor-pointer"
                            id={`btn-archive-remove-${report.id}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete Log
                          </button>
                        )}
                      </div>
                    )}

                    <div className="text-[10px] text-slate-400 flex items-center justify-end gap-1 mt-1 md:mt-0 italic select-none">
                      <Lock className="w-3 h-3 text-slate-350" />
                      ID: {report.id.substring(7, 13)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
