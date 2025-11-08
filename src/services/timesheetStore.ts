import { create } from "zustand";
import { shopDB } from "./database";
import { TimesheetEntry, MonthlyTimesheetSummary } from "../models/Timesheet";

interface TimesheetState {
  entries: TimesheetEntry[];
  currentMonthEntries: TimesheetEntry[];
  allEmployeeEntries: TimesheetEntry[];
  isLoading: boolean;
  error: string | null;

  // Employee actions
  addEntry: (
    employeeId: string,
    employeeName: string,
    date: Date,
    workDescription: string,
    hoursWorked: number
  ) => Promise<void>;
  updateEntry: (entry: TimesheetEntry) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  loadEmployeeEntriesForMonth: (
    employeeId: string,
    month: number,
    year: number
  ) => Promise<void>;
  getEntryForDate: (
    employeeId: string,
    date: Date
  ) => Promise<TimesheetEntry | null>;

  // Admin actions
  loadAllEntriesForMonth: (month: number, year: number) => Promise<void>;
  getMonthlyTimesheetSummaries: (
    month: number,
    year: number
  ) => MonthlyTimesheetSummary[];

  // Utility
  clearError: () => void;
}

export const useTimesheetStore = create<TimesheetState>((set, get) => ({
  entries: [],
  currentMonthEntries: [],
  allEmployeeEntries: [],
  isLoading: false,
  error: null,

  addEntry: async (
    employeeId: string,
    employeeName: string,
    date: Date,
    workDescription: string,
    hoursWorked: number
  ) => {
    set({ isLoading: true, error: null });
    try {
      const entry: TimesheetEntry = {
        id: crypto.randomUUID(),
        employeeId,
        employeeName,
        date,
        workDescription,
        hoursWorked,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const newEntry = await shopDB.addTimesheetEntry(entry);
      set((state) => ({
        entries: [...state.entries, newEntry],
        currentMonthEntries: [...state.currentMonthEntries, newEntry],
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to add entry",
        isLoading: false,
      });
      throw error;
    }
  },

  updateEntry: async (entry: TimesheetEntry) => {
    set({ isLoading: true, error: null });
    try {
      const updatedEntry = await shopDB.updateTimesheetEntry(entry);
      set((state) => ({
        entries: state.entries.map((e) =>
          e.id === updatedEntry.id ? updatedEntry : e
        ),
        currentMonthEntries: state.currentMonthEntries.map((e) =>
          e.id === updatedEntry.id ? updatedEntry : e
        ),
        allEmployeeEntries: state.allEmployeeEntries.map((e) =>
          e.id === updatedEntry.id ? updatedEntry : e
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to update entry",
        isLoading: false,
      });
      throw error;
    }
  },

  deleteEntry: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await shopDB.deleteTimesheetEntry(id);
      set((state) => ({
        entries: state.entries.filter((e) => e.id !== id),
        currentMonthEntries: state.currentMonthEntries.filter(
          (e) => e.id !== id
        ),
        allEmployeeEntries: state.allEmployeeEntries.filter((e) => e.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to delete entry",
        isLoading: false,
      });
      throw error;
    }
  },

  loadEmployeeEntriesForMonth: async (
    employeeId: string,
    month: number,
    year: number
  ) => {
    set({ isLoading: true, error: null });
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      const entries = await shopDB.getTimesheetEntriesByEmployee(
        employeeId,
        startDate,
        endDate
      );

      set({
        currentMonthEntries: entries,
        entries: entries,
        isLoading: false,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to load entries",
        isLoading: false,
      });
      throw error;
    }
  },

  getEntryForDate: async (employeeId: string, date: Date) => {
    try {
      const entry = await shopDB.getTimesheetEntryByDate(employeeId, date);
      return entry;
    } catch (error) {
      console.error("Failed to get entry for date:", error);
      return null;
    }
  },

  loadAllEntriesForMonth: async (month: number, year: number) => {
    set({ isLoading: true, error: null });
    try {
      const entries = await shopDB.getAllTimesheetEntriesByMonth(month, year);
      set({
        allEmployeeEntries: entries,
        isLoading: false,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to load all entries",
        isLoading: false,
      });
      throw error;
    }
  },

  getMonthlyTimesheetSummaries: (month: number, year: number) => {
    const { allEmployeeEntries } = get();

    // Group entries by employee
    const employeeMap = new Map<string, TimesheetEntry[]>();

    allEmployeeEntries.forEach((entry) => {
      if (!employeeMap.has(entry.employeeId)) {
        employeeMap.set(entry.employeeId, []);
      }
      employeeMap.get(entry.employeeId)!.push(entry);
    });

    // Create summaries
    const summaries: MonthlyTimesheetSummary[] = [];

    employeeMap.forEach((entries, employeeId) => {
      const totalHours = entries.reduce(
        (sum, entry) => sum + entry.hoursWorked,
        0
      );

      summaries.push({
        employeeId,
        employeeName: entries[0].employeeName,
        month,
        year,
        totalHours,
        entries: entries.sort(
          (a, b) => a.date.getTime() - b.date.getTime()
        ),
      });
    });

    return summaries.sort((a, b) => a.employeeName.localeCompare(b.employeeName));
  },

  clearError: () => set({ error: null }),
}));
