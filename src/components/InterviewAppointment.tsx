import React, { useState } from "react";
import { Calendar, Clock, User } from "lucide-react";

type Slot = {
  id: string;
  date: string; // ISO string
  time: string; // e.g. "09:00"
  candidate?: string;
};

const InterviewAppointment: React.FC = () => {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [candidate, setCandidate] = useState("");

  // Add new slot
  const handleAddSlot = () => {
    if (!date || !time) return;
    setSlots([
      ...slots,
      {
        id: `${date}-${time}`,
        date,
        time,
        candidate: "",
      },
    ]);
    setDate("");
    setTime("");
  };

  // Assign candidate to slot
  const handleAssignCandidate = (slotId: string) => {
    setSlots(
      slots.map((slot) =>
        slot.id === slotId ? { ...slot, candidate } : slot
      )
    );
    setCandidate("");
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-8">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Calendar className="w-6 h-6 text-orange-500" />
        Interview Appointment System
      </h2>
      {/* Add Slot */}
      <div className="mb-6 flex gap-4 items-end">
        <div>
          <label className="block text-sm font-semibold mb-1">Date</label>
          <input
            type="date"
            className="border rounded-lg px-3 py-2 w-40"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Time</label>
          <input
            type="time"
            className="border rounded-lg px-3 py-2 w-32"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
        <button
          onClick={handleAddSlot}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-600 transition"
        >
          Add Slot
        </button>
      </div>
      {/* Slot List */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Available Slots</h3>
        {slots.length === 0 ? (
          <div className="text-gray-500 mb-4">No slots created yet.</div>
        ) : (
          <ul className="divide-y divide-gray-200 mb-6">
            {slots.map((slot) => (
              <li
                key={slot.id}
                className={`py-3 flex items-center justify-between cursor-pointer ${
                  selectedSlot?.id === slot.id
                    ? "bg-orange-50"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => setSelectedSlot(slot)}
              >
                <div className="flex items-center gap-4">
                  <Calendar className="w-5 h-5 text-orange-400" />
                  <span className="font-medium">
                    {new Date(slot.date).toLocaleDateString()}{" "}
                    <Clock className="inline w-4 h-4 mx-1 text-gray-400" />
                    {slot.time}
                  </span>
                </div>
                <div>
                  {slot.candidate ? (
                    <span className="text-green-600 font-semibold flex items-center gap-1">
                      <User className="w-4 h-4" /> {slot.candidate}
                    </span>
                  ) : (
                    <span className="text-gray-400">Unassigned</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Assign Candidate */}
      {selectedSlot && (
        <div className="mb-6">
          <h4 className="font-semibold mb-2">
            Set Candidate for Slot:{" "}
            <span className="text-orange-600">
              {new Date(selectedSlot.date).toLocaleDateString()} {selectedSlot.time}
            </span>
          </h4>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              className="border rounded-lg px-3 py-2 w-64"
              placeholder="Candidate Name"
              value={candidate}
              onChange={(e) => setCandidate(e.target.value)}
            />
            <button
              onClick={() => handleAssignCandidate(selectedSlot.id)}
              className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition"
            >
              Assign
            </button>
          </div>
        </div>
      )}
      {/* Slot Preview */}
      {selectedSlot && (
        <div className="bg-gray-50 rounded-lg p-4 mt-4 border">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-400" />
            Selected Slot Details
          </h4>
          <div className="mb-1">
            <span className="font-semibold">Date:</span>{" "}
            {new Date(selectedSlot.date).toLocaleDateString()}
          </div>
          <div className="mb-1">
            <span className="font-semibold">Time:</span> {selectedSlot.time}
          </div>
          <div>
            <span className="font-semibold">Candidate:</span>{" "}
            {selectedSlot.candidate || <span className="text-gray-400">Unassigned</span>}
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewAppointment;