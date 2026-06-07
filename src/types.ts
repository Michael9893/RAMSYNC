/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface BaseCounters {
  incomingCalls: number;
  receivedRsoRto: number;
  incomingHandcarryFiles: number;
  scanFiles: number;
  stampedDocuments: number;
  filesAdRamsHead: number;
  processedSecondCopiesCo: number;
  messengerialCoPsp: number;
  messengerialPsp: number;
  messengerialGeneral: number;
  messengerialPostal: number;
  inventoryRecords: number;
  outgoingDocuments: number;
  outgoingRsoRto: number;
  outgoingSecondCopies: number;
  other: number;
}

export interface TaskConfig {
  key: keyof BaseCounters;
  label: string;
  category: "incoming" | "processed" | "outgoing" | "other";
  iconName: string; // Resolves to Lucide icon dynamically
  description: string;
}

export interface TodayTask {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

export interface RushDocument {
  id: string;
  title: string;
  targetTime: string;
  completed: boolean;
}

export interface Report {
  id: string; // unique chronological timestamp ID
  timestamp: string; // ISO string
  dateString: string; // e.g., "June 6, 2026"
  timeString: string; // e.g., "11:03 AM"
  counts: BaseCounters;
  comments: string[]; // custom "Other" typed tasks
  manualSummaryText: string; // compiled human-readable summary
  incomingCallTimes?: string[]; // timestamps of logged incoming calls
  receivedRsoRtoDetails?: string[];
  incomingHandcarryDetails?: string[];
  messengerialCoPspDetails?: string[];
  messengerialPspDetails?: string[];
  messengerialGeneralDetails?: string[];
  messengerialPostalDetails?: string[];
  todayTasks?: TodayTask[];
  rushDocuments?: RushDocument[];
  thingsLearned?: string;
  officeAdvice?: string;
}

export const TASK_CONFIGS: TaskConfig[] = [
  {
    key: "incomingCalls",
    label: "Incoming Calls",
    category: "incoming",
    iconName: "PhoneCall",
    description: "Track all incoming telephone inquiries and requests",
  },
  {
    key: "receivedRsoRto",
    label: "Received RSO & RTO",
    category: "incoming",
    iconName: "FileSpreadsheet",
    description: "Received Regional Special Orders / Travel Orders",
  },
  {
    key: "incomingHandcarryFiles",
    label: "Incoming Handcarry Files",
    category: "incoming",
    iconName: "FileDown",
    description: "Files hand-delivered directly to the desk",
  },
  {
    key: "scanFiles",
    label: "Scan Files",
    category: "processed",
    iconName: "Scan",
    description: "Scanning and online filing task entries",
  },
  {
    key: "stampedDocuments",
    label: "Stamped Documents",
    category: "processed",
    iconName: "Stamp",
    description: "Affixing official office stamps onto documents",
  },
  {
    key: "filesAdRamsHead",
    label: "Files for AD-RAMS Head",
    category: "processed",
    iconName: "FolderHeart",
    description: "Documentation submitted for AD-RAMS Department",
  },
  {
    key: "processedSecondCopiesCo",
    label: "Processed 2nd Copies & CO Copies",
    category: "processed",
    iconName: "Copy",
    description: "Second copies and official copies processed from CO",
  },
  {
    key: "messengerialCoPsp",
    label: "Processed Mess.: CO.PSP",
    category: "processed",
    iconName: "SendToBack",
    description: "Central Office Personal Service Provider logs",
  },
  {
    key: "messengerialPsp",
    label: "Processed Mess.: PSP",
    category: "processed",
    iconName: "Send",
    description: "Personal Service Provider messengerial tasks",
  },
  {
    key: "messengerialGeneral",
    label: "Processed Mess.: Messengerial",
    category: "processed",
    iconName: "Truck",
    description: "Standard dispatch and messengerial operations",
  },
  {
    key: "messengerialPostal",
    label: "Processed Mess.: Postal",
    category: "processed",
    iconName: "MailOpen",
    description: "Postal mailing operations and physical postage",
  },
  {
    key: "inventoryRecords",
    label: "Inventory Records Holding",
    category: "processed",
    iconName: "Archive",
    description: "Official log of inventory record holding entries",
  },
  {
    key: "outgoingDocuments",
    label: "Outgoing Documents",
    category: "outgoing",
    iconName: "FileCheck",
    description: "Dispatched letters, memos, or folders",
  },
  {
    key: "outgoingRsoRto",
    label: "Outgoing RSO & RTO Copies",
    category: "outgoing",
    iconName: "FileSymlink",
    description: "Dispatched copies of Regional Special / Travel Orders",
  },
  {
    key: "outgoingSecondCopies",
    label: "Outgoing 2nd Copies",
    category: "outgoing",
    iconName: "Files",
    description: "Dispatched second copies of general files",
  },
  {
    key: "other",
    label: "Other Desktop Actions",
    category: "other",
    iconName: "ClipboardCopy",
    description: "Custom task entries with details and direct notes",
  },
];
