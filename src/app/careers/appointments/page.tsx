"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Calendar, Clock, User } from "lucide-react";
import Navbar from "@/app/Navbar";
import Footer from "@/app/Footer";

// --- Hero Section Component - Luxury Upgrade ---
const HeroSection = () => (
  <section
    className="relative flex items-center justify-center min-h-[520px] md:min-h-[700px] rounded-xl mb-10 shadow-gold overflow-hidden luxury-card-glass"
  >
    {/* Background Image */}
    <img
      src="https://qawxuytlwqmsomsqlrsc.supabase.co/storage/v1/object/public/image//Career-Banner2.png"
      alt="Interview Illustration"
      className="absolute inset-0 w-full h-full object-cover opacity-70 scale-105 blur-[2px] pointer-events-none select-none"
      style={{ zIndex: 0 }}
    />
    <div className="absolute inset-0 bg-gradient-to-r from-[#3d9392]/80 via-[#bfa76a]/30 to-[#1b3d5a]/80"></div>
    <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]"></div>
    <div className="relative z-10 max-w-2xl mx-auto px-6 text-center mt-18 luxury-card-glass bg-white/30 backdrop-blur-xl border border-[#bfa76a]/30 rounded-3xl shadow-gold py-12">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-6 luxury-gradient-text drop-shadow-[0_6px_32px_rgba(191,167,106,0.45)]">
        <span className="luxury-gold-text luxury-fade-text drop-shadow-gold">Welcome to SLK Interview Scheduler</span>
      </h1>
      <p className="text-lg md:text-xl mb-8 leading-relaxed text-[#bfa76a] luxury-fade-text drop-shadow-gold font-medium">
        Easily book your interview slot online.<br />
        <span className="luxury-gold-text font-bold">Only shortlisted candidates can reserve a time.</span>
      </p>
      <div className="flex justify-center gap-4 mt-4">
        <a
          href="#appointment"
          className="luxury-card-glass bg-gradient-to-r from-[#bfa76a] via-[#e5e2d6] to-[#bfa76a] hover:from-[#e5e2d6] hover:to-[#bfa76a] text-[#1b3d5a] font-bold px-10 py-4 rounded-xl shadow-gold border border-[#bfa76a]/40 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#bfa76a] text-lg"
        >
          <span className="luxury-gold-text">Book Interview Slot</span>
        </a>
      </div>
    </div>
  </section>
);

const AppointmentLanding: React.FC = () => {
  // Scroll progress indicator
  const [scrollProgress, setScrollProgress] = useState(0);
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const [slots, setSlots] = useState<any[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [bookedSlotId, setBookedSlotId] = useState<string | null>(null);
  const [alreadyBooked, setAlreadyBooked] = useState<any | null>(null);

  // Fetch slots
  useEffect(() => {
    const fetchSlots = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("appointments")
        .select("id, date, time, candidate_name, candidate_email")
        .order("date", { ascending: true })
        .order("time", { ascending: true });
      if (!error && data) {
        setSlots(data.filter((slot: any) => !slot.candidate_name));
      }
      setLoading(false);
    };
    fetchSlots();
  }, [success]);

  // Check if candidate already booked when name changes
  useEffect(() => {
    const checkAlreadyBooked = async () => {
      if (!candidateName) {
        setAlreadyBooked(null);
        return;
      }
      const { data, error } = await supabase
        .from("appointments")
        .select("id, date, time")
        .ilike("candidate_name", candidateName) // <-- case-insensitive
        .limit(1);
      if (!error && data && data.length > 0) {
        setAlreadyBooked(data[0]);
        setBookedSlotId(data[0].id);
      } else {
        setAlreadyBooked(null);
        setBookedSlotId(null);
      }
    };
    checkAlreadyBooked();
  }, [candidateName, success]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!selectedSlotId || !candidateName || !candidateEmail) {
      setErrorMsg("Please enter your name, email, and select a slot.");
      return;
    }
    setLoading(true);

    // Check if candidateName is in job_applications with status 'shortlisted'
    const { data: shortlisted, error: shortlistError } = await supabase
      .from("job_applications")
      .select("id")
      .ilike("name", candidateName)
      .eq("status", "shortlisted")
      .limit(1);

    if (shortlistError) {
      setErrorMsg("Error checking shortlisted candidates. Please try again.");
      setLoading(false);
      return;
    }

    if (!shortlisted || shortlisted.length === 0) {
      setErrorMsg(
        <>
          Your name is not on our shortlisted candidates. Please contact our HR if you believe this is a mistake at{" "}
          <a
            href="mailto:hr@slklaos.la"
            className="text-blue-600 underline"
          >
            hr@slklaos.la
          </a>
        </>
      );
      setLoading(false);
      return;
    }

    // --- Prevent double booking by name ---
    if (alreadyBooked) {
      setErrorMsg("You have already booked an interview slot. Only one booking is allowed per candidate.");
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("appointments")
      .update({ candidate_name: candidateName, candidate_email: candidateEmail })
      .eq("id", selectedSlotId);

    setLoading(false);
    if (!error) {
      // Call API to send confirmation email
      try {
        await fetch("/api/send-appointment-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ appointmentId: selectedSlotId }),
        });
      } catch (e) {
        // Optionally handle email error, but don't block booking success
        console.error("Failed to send confirmation email", e);
      }
      setSuccess(true);
      setBookedSlotId(selectedSlotId);
    } else {
      setErrorMsg("Failed to book slot. Please try again.");
    }
  };

  // Cancel booking handler
  const handleCancelBooking = async () => {
    if (!candidateName) {
      setErrorMsg("Please enter your name to cancel your booking.");
      return;
    }
    setLoading(true);
    // Find the slot booked by this candidate (case-insensitive)
    const { data: booked, error } = await supabase
      .from("appointments")
      .select("id, date")
      .ilike("candidate_name", candidateName)
      .limit(1);

    if (error || !booked || booked.length === 0) {
      setErrorMsg("No booking found to cancel.");
      setLoading(false);
      return;
    }

    // Check if today is at least 3 days before the interview date
    const interviewDate = new Date(booked[0].date);
    const today = new Date();
    // Remove time part for accurate day diff
    interviewDate.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    const diffDays = Math.ceil((interviewDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 3) {
      setErrorMsg("You can only cancel or reschedule at least 3 days before your interview date.");
      setLoading(false);
      return;
    }

    // Clear the booking
    await supabase
      .from("appointments")
      .update({ candidate_name: null, candidate_email: null })
      .eq("id", booked[0].id);

    setSuccess(false);
    setSelectedSlotId(null);
    setBookedSlotId(null);
    setAlreadyBooked(null);
    setLoading(false);
    setErrorMsg("");
  };

  if (success) {
    return (
      <>
        <Navbar />
        <HeroSection />
        <div className="min-h-screen w-full bg-white flex items-center justify-center">
          <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="flex justify-center mb-4">
              <User className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-700 mb-2">Appointment Confirmed</h2>
            <p className="text-gray-700 mb-4">
              Thank you, <span className="font-semibold">{candidateName}</span>.<br />
              Your interview slot has been booked successfully.<br />
              Confirmation sent to: <span className="font-semibold">{candidateEmail}</span>
            </p>
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded text-green-800 font-medium">
              Please ensure you arrive at the interview location on time. Being punctual is important for your application process.
            </div>
            <button
              onClick={handleCancelBooking}
              className="inline-block mt-4 bg-red-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-600 transition"
              disabled={loading}
            >
              {loading ? "Cancelling..." : "Cancel / Reschedule"}
            </button>
            {errorMsg && (
              <div className="text-red-600 font-semibold text-sm mt-4">{errorMsg}</div>
            )}
            <a
              href="/"
              className="inline-block mt-4 ml-4 bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600 transition"
            >
              Back to Home
            </a>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 z-[9999]">
        <div
          className="h-full bg-gradient-to-r from-[#bfa76a] to-[#e5e2d6] transition-all duration-200"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
      <Navbar />
      <div className="bg-gray-50 min-h-screen w-full">
        <HeroSection />
        <div className="flex justify-center items-start py-12">
          <div
            id="appointment"
            className="w-full max-w-6xl bg-white rounded-2xl shadow-xl p-10 mb-20"
          >
            <div className="flex items-center gap-3 mb-8">
              <Calendar className="w-8 h-8 text-orange-500" />
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                Interview Appointment Booking
              </h1>
            </div>
            <p className="mb-8 text-gray-700 text-base md:text-lg">
              Please select an available date and time slot for your interview.<br />
              Once booked, your slot will be reserved and you will receive a confirmation.
            </p>
            <form onSubmit={handleSubmit} className="space-y-7">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Your Name */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-900">
                    Your Name
                  </label>
                  <input
                    type="text"
                    className="border border-gray-300 rounded-lg px-4 py-3 w-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                    placeholder="Enter your full name"
                    value={candidateName}
                    onChange={e => setCandidateName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                {/* Your Email */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-900">
                    Your Email
                  </label>
                  <input
                    type="email"
                    className="border border-gray-300 rounded-lg px-4 py-3 w-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                    placeholder="Enter your email address"
                    value={candidateEmail}
                    onChange={e => setCandidateEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              {alreadyBooked && (
                <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-4 text-yellow-800 text-center">
                  <div className="mb-2 font-semibold">
                    You have already booked an interview slot.
                  </div>
                  <div>
                    <span className="font-medium">Date:</span> {new Date(alreadyBooked.date).toLocaleDateString()}<br />
                    <span className="font-medium">Time:</span> {alreadyBooked.time}
                  </div>
                  <button
                    type="button"
                    onClick={handleCancelBooking}
                    className="mt-4 bg-red-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-600 transition"
                    disabled={loading}
                  >
                    {loading ? "Cancelling..." : "Cancel / Reschedule"}
                  </button>
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-900">
                  Available Slots
                </label>
                <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg bg-gray-50 p-3">
                  {loading ? (
                    <div className="text-gray-500 py-4 text-center">
                      Loading slots...
                    </div>
                  ) : slots.length === 0 ? (
                    <div className="text-gray-500 py-4 text-center">
                      No available slots at this time.
                    </div>
                  ) : (
                    // Group slots by date and show day of week
                    (() => {
                      const slotsByDate: Record<string, any[]> = {};
                      slots.forEach(slot => {
                        if (!slotsByDate[slot.date]) slotsByDate[slot.date] = [];
                        slotsByDate[slot.date].push(slot);
                      });
                      const sortedDates = Object.keys(slotsByDate).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
                      return (
                        <div>
                          {sortedDates.map(date => {
                            const dayName = new Date(date).toLocaleDateString(undefined, { weekday: 'long' });
                            const formattedDate = new Date(date).toLocaleDateString(undefined, {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            }); // e.g. 27 July 2025
                            return (
                              <div key={date} className="mb-4">
                                <div className="font-bold text-orange-600 mb-2">
                                  {dayName}, {formattedDate}:
                                </div>
                                <ul>
                                  {slotsByDate[date].map(slot => (
                                    <li key={slot.id} className="mb-2">
                                      <label
                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition
                                          ${selectedSlotId === slot.id
                                            ? "bg-orange-100 border border-orange-400"
                                            : "hover:bg-gray-100"}
                                        `}
                                      >
                                        <input
                                          type="radio"
                                          name="slot"
                                          value={slot.id}
                                          checked={selectedSlotId === slot.id}
                                          onChange={() => setSelectedSlotId(slot.id)}
                                          required
                                          disabled={loading || alreadyBooked}
                                          className="accent-orange-500"
                                        />
                                        <span className="flex items-center gap-2 text-gray-900 font-medium">
                                          <Clock className="w-4 h-4 text-gray-400" />
                                          {slot.time}
                                        </span>
                                      </label>
                                    </li>
                                  ))}
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
              {errorMsg && (
                <div className="text-red-600 font-semibold text-sm">{errorMsg}</div>
              )}
              <button
                type="submit"
                className={`w-full bg-orange-500 text-white px-6 py-3 rounded-lg font-bold text-lg hover:bg-orange-600 transition ${loading || alreadyBooked ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={loading || alreadyBooked}
              >
                {loading ? "Booking..." : "Book Selected Slot"}
              </button>
            </form>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default AppointmentLanding;