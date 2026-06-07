/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BaseCounters, TASK_CONFIGS, TodayTask, RushDocument } from "./types";

/**
 * Compiles a clean, professional, human-readable paragraph summarizing the desk metrics
 */
export function generateAutomatedSummary(
  counts: BaseCounters,
  comments: string[],
  incomingCallTimes?: string[],
  receivedRsoRtoDetails?: string[],
  incomingHandcarryDetails?: string[],
  messengerialCoPspDetails?: string[],
  messengerialPspDetails?: string[],
  messengerialGeneralDetails?: string[],
  messengerialPostalDetails?: string[],
  todayTasks?: TodayTask[],
  rushDocuments?: RushDocument[],
  thingsLearned?: string,
  officeAdvice?: string
): string {
  const parts: string[] = [];

  // Categorize & translate counters into readable items
  if (counts.incomingCalls > 0) {
    let detailSuffix = "";
    if (incomingCallTimes && incomingCallTimes.length > 0) {
      const concerns = incomingCallTimes
        .map((item) => {
          const idx = item.indexOf(" - ");
          return idx !== -1 ? item.substring(idx + 3) : "";
        })
        .filter(Boolean);
      if (concerns.length > 0) {
        const uniqueConcerns = Array.from(new Set(concerns));
        detailSuffix = ` (${uniqueConcerns.join(", ")})`;
      }
    }
    parts.push(`Incoming Calls: ${counts.incomingCalls} call${counts.incomingCalls > 1 ? "s" : ""}${detailSuffix}`);
  }

  if (counts.receivedRsoRto > 0) {
    let detailSuffix = "";
    if (receivedRsoRtoDetails && receivedRsoRtoDetails.length > 0) {
      const origins = receivedRsoRtoDetails
        .map((item) => {
          const idx = item.indexOf(" from ");
          return idx !== -1 ? item.substring(idx + 6) : "";
        })
        .filter(Boolean);
      if (origins.length > 0) {
        const uniqueOrigins = Array.from(new Set(origins));
        detailSuffix = ` (${uniqueOrigins.join(", ")})`;
      }
    }
    parts.push(`Received RSO/RTO: ${counts.receivedRsoRto} order${counts.receivedRsoRto > 1 ? "s" : ""}${detailSuffix}`);
  }

  if (counts.incomingHandcarryFiles && counts.incomingHandcarryFiles > 0) {
    let detailSuffix = "";
    if (incomingHandcarryDetails && incomingHandcarryDetails.length > 0) {
      const locations = incomingHandcarryDetails
        .map((item) => {
          const idx = item.indexOf(" at ");
          return idx !== -1 ? item.substring(idx + 4) : "";
        })
        .filter(Boolean);
      if (locations.length > 0) {
        const uniqueLocations = Array.from(new Set(locations));
        detailSuffix = ` received at ${uniqueLocations.join(", ")}`;
      }
    }
    parts.push(`Incoming Handcarry Files: ${counts.incomingHandcarryFiles} file${counts.incomingHandcarryFiles > 1 ? "s" : ""}${detailSuffix}`);
  }

  if (counts.scanFiles && counts.scanFiles > 0) {
    parts.push(`Scan Files: ${counts.scanFiles} file${counts.scanFiles > 1 ? "s" : ""}`);
  }
  if (counts.stampedDocuments && counts.stampedDocuments > 0) {
    parts.push(`Stamped Documents: ${counts.stampedDocuments} doc${counts.stampedDocuments > 1 ? "s" : ""}`);
  }
  if (counts.filesAdRamsHead > 0) {
    parts.push(`Files for AD-RAMS Head: ${counts.filesAdRamsHead} file${counts.filesAdRamsHead > 1 ? "s" : ""}`);
  }
  if (counts.processedSecondCopiesCo > 0) {
    parts.push(`Processed 2nd Copies / CO Copies: ${counts.processedSecondCopiesCo} cop${counts.processedSecondCopiesCo > 1 ? "ies" : "y"}`);
  }

  // Messengerials
  const pspLog: string[] = [];
  if (counts.messengerialCoPsp > 0) {
    let detailSuffix = "";
    if (messengerialCoPspDetails && messengerialCoPspDetails.length > 0) {
      const offices = messengerialCoPspDetails
        .map((item) => {
          const idx = item.indexOf(" at ");
          return idx !== -1 ? item.substring(idx + 4) : "";
        })
        .filter(Boolean);
      if (offices.length > 0) {
        const uniqueOffices = Array.from(new Set(offices));
        detailSuffix = ` received at ${uniqueOffices.join(", ")}`;
      }
    }
    pspLog.push(`CO.PSP (${counts.messengerialCoPsp}${detailSuffix})`);
  }
  if (counts.messengerialPsp > 0) {
    let detailSuffix = "";
    if (messengerialPspDetails && messengerialPspDetails.length > 0) {
      const offices = messengerialPspDetails
        .map((item) => {
          const idx = item.indexOf(" at ");
          return idx !== -1 ? item.substring(idx + 4) : "";
        })
        .filter(Boolean);
      if (offices.length > 0) {
        const uniqueOffices = Array.from(new Set(offices));
        detailSuffix = ` received at ${uniqueOffices.join(", ")}`;
      }
    }
    pspLog.push(`PSP (${counts.messengerialPsp}${detailSuffix})`);
  }
  if (counts.messengerialGeneral > 0) {
    let detailSuffix = "";
    if (messengerialGeneralDetails && messengerialGeneralDetails.length > 0) {
      const offices = messengerialGeneralDetails
        .map((item) => {
          const idx = item.indexOf(" at ");
          return idx !== -1 ? item.substring(idx + 4) : "";
        })
        .filter(Boolean);
      if (offices.length > 0) {
        const uniqueOffices = Array.from(new Set(offices));
        detailSuffix = ` received at ${uniqueOffices.join(", ")}`;
      }
    }
    pspLog.push(`General (${counts.messengerialGeneral}${detailSuffix})`);
  }
  if (counts.messengerialPostal > 0) {
    let detailSuffix = "";
    if (messengerialPostalDetails && messengerialPostalDetails.length > 0) {
      const offices = messengerialPostalDetails
        .map((item) => {
          const idx = item.indexOf(" at ");
          return idx !== -1 ? item.substring(idx + 4) : "";
        })
        .filter(Boolean);
      if (offices.length > 0) {
        const uniqueOffices = Array.from(new Set(offices));
        detailSuffix = ` received at ${uniqueOffices.join(", ")}`;
      }
    }
    pspLog.push(`Postal (${counts.messengerialPostal}${detailSuffix})`);
  }

  if (pspLog.length > 0) {
    parts.push(`Processed Messengerials: ${pspLog.join(", ")}`);
  }

  if (counts.inventoryRecords > 0) {
    parts.push(`Inventory Records Holding Entries: ${counts.inventoryRecords} registr${counts.inventoryRecords > 1 ? "ies" : "y"}`);
  }
  if (counts.outgoingDocuments > 0) {
    parts.push(`Outgoing Documents: ${counts.outgoingDocuments} doc${counts.outgoingDocuments > 1 ? "s" : ""}`);
  }
  if (counts.outgoingRsoRto > 0) {
    parts.push(`Outgoing RSO/RTO Copies: ${counts.outgoingRsoRto} duplicate${counts.outgoingRsoRto > 1 ? "s" : ""}`);
  }
  if (counts.outgoingSecondCopies > 0) {
    parts.push(`Outgoing 2nd Copies: ${counts.outgoingSecondCopies} dispatch${counts.outgoingSecondCopies > 1 ? "es" : ""}`);
  }

  // Other Actions
  if (counts.other > 0 || comments.length > 0) {
    const customTaskCount = Math.max(counts.other, comments.length);
    const notesStr = comments.length > 0 
      ? ` (${comments.join("; ")})` 
      : "";
    parts.push(`Other Action Items: ${customTaskCount} task${customTaskCount > 1 ? "s" : ""}${notesStr}`);
  }

  let baseSummary = parts.length > 0
    ? `Task Summary Log — Processed ${parts.join("; ")}.`
    : "No desk activities logged today.";

  const plannerAdditions: string[] = [];

  // Today's Tasks
  if (todayTasks && todayTasks.length > 0) {
    const total = todayTasks.length;
    const finished = todayTasks.filter(t => t.completed).length;
    const list = todayTasks.map(t => `"${t.text}" [${t.completed ? "✓ Done" : "⏳ Pending"}]`).join(", ");
    plannerAdditions.push(`Daily Tasks Checklist: Finished ${finished}/${total} (${list})`);
  }

  // Rush Documents
  if (rushDocuments && rushDocuments.length > 0) {
    const rushList = rushDocuments.map(r => `"${r.title}" (Target: ${r.targetTime} - ${r.completed ? "✓ Completed" : "⏳ Pending"})`).join(", ");
    plannerAdditions.push(`Urgent Rush Documents: ${rushList}`);
  }

  // Key Learnings Today
  if (thingsLearned && thingsLearned.trim()) {
    plannerAdditions.push(`Key Knowledge Gained Today: "${thingsLearned.trim()}"`);
  }

  // Supervisor Advice
  if (officeAdvice && officeAdvice.trim()) {
    plannerAdditions.push(`Supervisor & Coworker Advice (Work Optimization): "${officeAdvice.trim()}"`);
  }

  if (plannerAdditions.length > 0) {
    return `${baseSummary}\n\nPlanner Notes & Mentorship Logs:\n• ${plannerAdditions.join("\n• ")}`;
  }

  return baseSummary;
}

/**
 * Formatting dates nicely
 */
export function getFriendlyDate(): { dateString: string; timeString: string } {
  const now = new Date();
  
  // Format like "Saturday, Jun 6, 2026"
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  
  // Format like "11:03 AM"
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  };

  return {
    dateString: now.toLocaleDateString("en-US", dateOptions),
    timeString: now.toLocaleTimeString("en-US", timeOptions),
  };
}

/**
 * Returns an empty counters state
 */
export function getInitialCounters(): BaseCounters {
  return {
    incomingCalls: 0,
    receivedRsoRto: 0,
    incomingHandcarryFiles: 0,
    scanFiles: 0,
    stampedDocuments: 0,
    filesAdRamsHead: 0,
    processedSecondCopiesCo: 0,
    messengerialCoPsp: 0,
    messengerialPsp: 0,
    messengerialGeneral: 0,
    messengerialPostal: 0,
    inventoryRecords: 0,
    outgoingDocuments: 0,
    outgoingRsoRto: 0,
    outgoingSecondCopies: 0,
    other: 0,
  };
}
