/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BaseCounters, TASK_CONFIGS } from "./types";

/**
 * Compiles a clean, professional, human-readable paragraph summarizing the desk metrics
 */
export function generateAutomatedSummary(
  counts: BaseCounters,
  comments: string[]
): string {
  const parts: string[] = [];

  // Categorize & translate counters into readable items
  if (counts.incomingCalls > 0) {
    parts.push(`Incoming Calls: ${counts.incomingCalls} call${counts.incomingCalls > 1 ? "s" : ""}`);
  }
  if (counts.receivedRsoRto > 0) {
    parts.push(`Received RSO/RTO: ${counts.receivedRsoRto} order${counts.receivedRsoRto > 1 ? "s" : ""}`);
  }
  if (counts.incomingHandcarryFiles && counts.incomingHandcarryFiles > 0) {
    parts.push(`Incoming Handcarry Files: ${counts.incomingHandcarryFiles} file${counts.incomingHandcarryFiles > 1 ? "s" : ""}`);
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
  if (counts.messengerialCoPsp > 0) pspLog.push(`CO.PSP (${counts.messengerialCoPsp})`);
  if (counts.messengerialPsp > 0) pspLog.push(`PSP (${counts.messengerialPsp})`);
  if (counts.messengerialGeneral > 0) pspLog.push(`General (${counts.messengerialGeneral})`);
  if (counts.messengerialPostal > 0) pspLog.push(`Postal (${counts.messengerialPostal})`);

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

  if (parts.length === 0) {
    return "No actions logged for this session.";
  }

  return `Task Summary Log — Processed ${parts.join("; ")}.`;
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
