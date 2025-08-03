"use client";

import React, { useState, useEffect } from "react";
import MultiDatePicker from "react-multi-date-picker";

import { Calendar, Clock, User, X, UserPlus, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

function getTimeSlots(start: string, end: string, interval: number, lunchStart: string, lunchEnd: string) {
  const slots: string[] = [];
  let [h, m] = start.split(":").map(Number);
  let [eh, em] = end.split(":").map(Number);
  let [lh, lm] = lunchStart.split(":").map(Number);
  let [le, lem] = lunchEnd.split(":").map(Number);

  while (h < eh || (h === eh && m < em)) {
    const timeStr = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    if (
      timeStr < `${String(lh).padStart(2, "0")}:${String(lm).padStart(2, "0")}` ||
      timeStr >= `${String(le).padStart(2, "0")}:${String(lem).padStart(2, "0")}`
    ) {
      slots.push(timeStr);
    }
    m += interval;
    if (m >= 60) {
      h += Math.floor(m / 60);
      m = m % 60;
    }
  }
  return slots;
}

function exportSlotsToCSV(slots: any[]) {
  if (!slots.length) return;
  const header = ["Date", "Time", "Candidate"];
  const rows = slots.map(slot => [
    slot.date,
    slot.time,
    slot.candidate || ""
  ]);
  const csvContent =
    [header, ...rows]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(","))
      .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "interview_slots.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const statusOptions = ["pending", "confirmed", "completed", "cancelled"];

const InterviewAppointment: React.FC = () => {
  const [slots, setSlots] = useState<any[]>([]);
  const [dates, setDates] = useState<Date[]>([]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [interval, setInterval] = useState(30);
  const [lunchStart, setLunchStart] = useState("12:00");
  const [lunchEnd, setLunchEnd] = useState("13:00");
  const [loading, setLoading] = useState(false);
  const [assigningSlotId, setAssigningSlotId] = useState<string | null>(null);
  const [candidateName, setCandidateName] = useState("");
  const [editingStatusId, setEditingStatusId] = useState<string | null>(null);
  const [statusValue, setStatusValue] = useState<string>("pending");

  useEffect(() => {
    const fetchSlots = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("appointments")
        .select("id, date, time, candidate_name, status") // <-- add status here
        .order("date", { ascending: true })
        .order("time", { ascending: true });
      if (!error && data) {
        setSlots(
          data.map((row: any) => ({
            id: row.id,
            date: row.date,
            time: row.time,
            candidate: row.candidate_name || "",
            status: row.status || "", // <-- add status here
          }))
        );
      }
      setLoading(false);
    };
    fetchSlots();
  }, []);

  // Bulk slot creation
  const handleBulkCreateSlots = async () => {
    if (dates.length === 0 || !startTime || !endTime || !interval) return;
    setLoading(true);
    const allSlots: any[] = [];
    for (const dateObj of dates) {
      const dateStr = dateObj instanceof Date
        ? dateObj.toISOString().split("T")[0]
        : dateObj.format("YYYY-MM-DD"); // react-multi-date-picker returns objects with format()
      const times = getTimeSlots(startTime, endTime, interval, lunchStart, lunchEnd);
      for (const time of times) {
        allSlots.push({ date: dateStr, time, candidate_name: "" });
      }
    }
    const { data, error } = await supabase
      .from("appointments")
      .insert(allSlots)
      .select();
    if (!error && data) {
      setSlots((prev) => [
        ...prev,
        ...data.map((row: any) => ({
          id: row.id,
          date: row.date,
          time: row.time,
          candidate: row.candidate_name || "",
        })),
      ]);
    }
    setLoading(false);
  };

  // Assign candidate to slot
  const handleAssignCandidate = async (slotId: string) => {
    if (!candidateName) return;
    setLoading(true);
    const { error } = await supabase
      .from("appointments")
      .update({ candidate_name: candidateName })
      .eq("id", slotId);
    if (!error) {
      setSlots(slots.map(slot =>
        slot.id === slotId ? { ...slot, candidate: candidateName } : slot
      ));
      setCandidateName("");
      setAssigningSlotId(null);
    }
    setLoading(false);
  };

  // Update status handler
  const handleUpdateStatus = async (slotId: string, newStatus: string) => {
    setLoading(true);
    const { error } = await supabase
      .from("appointments")
      .update({ status: newStatus })
      .eq("id", slotId);
    if (!error) {
      setSlots(slots.map(slot =>
        slot.id === slotId ? { ...slot, status: newStatus } : slot
      ));
      setEditingStatusId(null);
    }
    setLoading(false);
  };

  // Delete slot
  const handleDeleteSlot = async (slotId: string) => {
    setLoading(true);
    const { error } = await supabase
      .from("appointments")
      .delete()
      .eq("id", slotId);
    if (!error) {
      setSlots(slots.filter(slot => slot.id !== slotId));
    }
    setLoading(false);
  };

  // Delete all slots
  const handleDeleteAllSlots = async () => {
    if (!slots.length) return;
    if (!window.confirm("Are you sure you want to delete ALL slots? This cannot be undone.")) return;
    setLoading(true);
    const ids = slots.map(slot => slot.id);
    const { error } = await supabase
      .from("appointments")
      .delete()
      .in("id", ids);
    if (!error) {
      setSlots([]);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-8xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-8">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900">
        <Calendar className="w-6 h-6 text-orange-500" />
        Interview Appointment System
      </h2>
      {/* Bulk Slot Setup */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3 text-gray-900">Bulk Slot Setup</h3>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-900">
              Select Dates
            </label>
            <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 flex flex-col items-center shadow-sm">
              <MultiDatePicker
                value={dates}
                onChange={setDates}
                multiple
                format="YYYY-MM-DD"
                minDate={new Date()}
                className="orange"
                placeholder="Click to select one or more dates"
                style={{
                  width: "100%",
                  fontSize: "1rem",
                  padding: "0.5rem",
                  borderRadius: "0.5rem",
                  border: "1px solid #e5e7eb",
                  background: "#fff",
                  color: "#1f2937",
                }}
              />
              <div className="mt-2 text-xs text-gray-500 text-center">
                Hold{" "}
                <span className="font-bold bg-gray-200 px-1 py-0.5 rounded">
                  Ctrl
                </span>{" "}
                (Windows) or{" "}
                <span className="font-bold bg-gray-200 px-1 py-0.5 rounded">
                  Cmd
                </span>{" "}
                (Mac) to select multiple dates.
              </div>
              {dates.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2 justify-center">
                  {dates.map((dateObj, idx) => (
                    <span
                      key={idx}
                      className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-medium"
                    >
                      {dateObj.format ? dateObj.format("YYYY-MM-DD") : String(dateObj)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-900">Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              className="border rounded-lg px-3 py-2 w-32 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-900">End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
              className="border rounded-lg px-3 py-2 w-32 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-900">Interval (minutes)</label>
            <input
              type="number"
              min={5}
              max={120}
              value={interval}
              onChange={e => setInterval(Number(e.target.value))}
              className="border rounded-lg px-3 py-2 w-24 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-900">Lunch Start</label>
            <input
              type="time"
              value={lunchStart}
              onChange={e => setLunchStart(e.target.value)}
              className="border rounded-lg px-3 py-2 w-32 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-900">Lunch End</label>
            <input
              type="time"
              value={lunchEnd}
              onChange={e => setLunchEnd(e.target.value)}
              className="border rounded-lg px-3 py-2 w-32 text-gray-900"
            />
          </div>
          <button
            onClick={handleBulkCreateSlots}
            className={`bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-600 transition ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={loading}
          >
            {loading ? "Processing..." : "Create Slots"}
          </button>
        </div>
      </div>
      {/* Action Buttons */}
      <div className="flex justify-end mb-4 gap-2">
        <button
          onClick={() => exportSlotsToCSV(slots)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
          disabled={slots.length === 0}
          title="Export to CSV"
        >
          Export to CSV
        </button>
        <button
          onClick={handleDeleteAllSlots}
          className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50"
          disabled={loading || slots.length === 0}
          title="Delete All Slots"
        >
          Delete All Slots
        </button>
      </div>
      {/* Slot List */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-900">Available Slots</h3>
        {loading ? (
          <div className="mb-4 text-gray-500">Loading slots...</div>
        ) : slots.length === 0 ? (
          <div className="mb-4 text-gray-500">No slots created yet.</div>
        ) : (
          // Group slots by date and show day of week
          (() => {
            // Group slots by date
            const slotsByDate: Record<string, any[]> = {};
            slots.forEach(slot => {
              if (!slotsByDate[slot.date]) slotsByDate[slot.date] = [];
              slotsByDate[slot.date].push(slot);
            });
            // Sort dates ascending
            const sortedDates = Object.keys(slotsByDate).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
            return (
              <div>
                {sortedDates.map(date => {
                  const dayName = new Date(date).toLocaleDateString(undefined, { weekday: 'long' });
                  const formattedDate = new Date(date).toLocaleDateString(undefined, {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  }); // e.g. 17 July 2025
                  return (
                    <div key={date} className="mb-6">
                      <div className="font-bold text-orange-600 text-lg mb-2">
                        {dayName}:
                        <span className="ml-2 text-gray-900 font-normal">{formattedDate}</span>
                      </div>
                      <ul className="divide-y divide-gray-200 text-gray-900">
                        {slotsByDate[date].map((slot) => {
                          const isAssigning = assigningSlotId === slot.id;
                          const isEditingStatus = editingStatusId === slot.id;
                          return (
                            <li
                              key={slot.id}
                              className={`relative py-3 flex items-center justify-between cursor-pointer transition-colors duration-200
                                ${slot.candidate
                                ? "bg-orange-50"
                                : isAssigning
                                  ? "bg-blue-100 border-blue-400 border"
                                  : "hover:bg-gray-50"}
                              `}
                            >
                              <div className="flex items-center gap-4">
                                <Clock className="w-5 h-5 text-orange-400" />
                                <span className="font-medium">
                                  {slot.time}
                                </span>
                                {slot.candidate ? (
                                  <span className="text-green-600 font-semibold flex items-center gap-1">
                                    <User className="w-4 h-4" /> {slot.candidate}
                                  </span>
                                ) : (
                                  <span className="text-gray-500">Unassigned</span>
                                )}
                              </div>
                              <div className="flex gap-2 items-center">
                                {/* Assign Button */}
                                {!slot.candidate && (
                                  <button
                                    className={`flex items-center gap-1 font-semibold px-2 py-1 rounded transition
                                      ${isAssigning
                                        ? "bg-blue-600 text-white"
                                        : "text-blue-600 hover:bg-blue-100 hover:text-blue-800"}
                                    `}
                                    onClick={() => setAssigningSlotId(slot.id)}
                                    title="Assign Candidate"
                                  >
                                    <UserPlus className="w-4 h-4" /> Assign
                                  </button>
                                )}
                                {/* Edit Button */}
                                {slot.candidate && (
                                  <button
                                    className="flex items-center justify-center px-2 py-1 rounded text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                                    onClick={() => {
                                      setAssigningSlotId(slot.id);
                                      setCandidateName(slot.candidate);
                                    }}
                                    title="Edit/Reassign Candidate"
                                    aria-label="Edit"
                                  >
                                    <Pencil className="w-5 h-5" />
                                  </button>
                                )}
                                {/* Editable Status Dropdown */}
                                {isEditingStatus ? (
                                  <div className="flex items-center gap-1">
                                    <select
                                      className="px-2 py-1 rounded text-xs font-semibold bg-gray-200 text-gray-700 min-w-[90px]"
                                      value={statusValue}
                                      onChange={e => setStatusValue(e.target.value)}
                                      disabled={loading}
                                    >
                                      {statusOptions.map(opt => (
                                        <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                                      ))}
                                    </select>
                                    <button
                                      className="ml-1 px-2 py-1 rounded bg-green-500 text-white text-xs font-semibold hover:bg-green-600"
                                      onClick={() => handleUpdateStatus(slot.id, statusValue)}
                                      disabled={loading}
                                    >
                                      Save
                                    </button>
                                    <button
                                      className="ml-1 px-2 py-1 rounded bg-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-400"
                                      onClick={() => setEditingStatusId(null)}
                                      disabled={loading}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    className="flex items-center justify-center px-2 py-1 rounded text-xs font-semibold bg-gray-200 text-gray-700 min-w-[90px] text-center hover:bg-gray-300"
                                    style={{ height: "32px" }}
                                    onClick={() => {
                                      setEditingStatusId(slot.id);
                                      setStatusValue(slot.status || "pending");
                                    }}
                                    title="Edit Status"
                                  >
                                    {slot.status ? slot.status.charAt(0).toUpperCase() + slot.status.slice(1) : "pending"}
                                  </button>
                                )}
                                {/* Delete Button */}
                                <button
                                  className="flex items-center justify-center px-2 py-1 rounded text-red-600 hover:text-red-800 hover:bg-red-100"
                                  onClick={() => {
                                    if (window.confirm("Are you sure you want to delete this slot?")) {
                                      handleDeleteSlot(slot.id);
                                    }
                                  }}
                                  title="Delete Slot"
                                  aria-label="Delete"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                              {/* Popup Assign/Reassign Candidate */}
                              {isAssigning && (
                                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center z-10 rounded-lg">
                                  <div
                                    className="bg-white bg-opacity-90 p-6 rounded-lg shadow-lg flex gap-2 items-center"
                                    onKeyDown={e => {
                                      if (e.key === "Enter" && candidateName && !loading) {
                                        handleAssignCandidate(slot.id);
                                      }
                                      if (e.key === "Escape") {
                                        setAssigningSlotId(null);
                                        setCandidateName("");
                                      }
                                    }}
                                    tabIndex={0}
                                  >
                                    <input
                                      type="text"
                                      className="border rounded-lg px-3 py-2 w-48 text-gray-900"
                                      placeholder="Candidate Name"
                                      value={candidateName}
                                      onChange={e => setCandidateName(e.target.value)}
                                      disabled={loading}
                                      autoFocus
                                    />
                                    <button
                                      onClick={() => handleAssignCandidate(slot.id)}
                                      className={`bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition ${loading || !candidateName ? "opacity-50 cursor-not-allowed" : ""}`}
                                      disabled={loading || !candidateName}
                                    >
                                      Assign
                                    </button>
                                    <button
                                      onClick={() => { setAssigningSlotId(null); setCandidateName(""); }}
                                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-400 transition"
                                      disabled={loading}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
              </div>
            );
          })()
        )}
      </div>
    </div>
  );
};

export default InterviewAppointment;