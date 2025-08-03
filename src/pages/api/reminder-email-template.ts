import { supabase } from "@/lib/supabase";

export async function getAppointmentForCandidate(candidateEmail: string) {
  const { data, error } = await supabase
    .from("appointments")
    .select("date, time")
    .eq("candidate_email", candidateEmail)
    .eq("status", "confirmed")
    .single();

  if (error || !data) {
    return { slotSelected: false };
  }

  return {
    slotSelected: true,
    interviewDate: data.date,
    interviewTime: data.time,
  };
}

export function getReminderEmailTemplate({
  candidateName,
  interviewDate,
  interviewTime,
  slotSelected,
}: {
  candidateName: string;
  interviewDate?: string;
  interviewTime?: string;
  slotSelected: boolean;
}) {
  let subject = "Interview Appointment Reminder";
  let message = "";

  const footer = `
------------------------------------------------------------
This message was sent by SLK Trading & Design Construction Co., Ltd.
Website: www.slklaos.la
Email: info@slklaos.la | hr@slklaos.la
Location: Vientiane, Laos
© ${new Date().getFullYear()} SLK Trading & Design Construction Co., Ltd. All rights reserved.
`;

  if (!slotSelected) {
    message = `Dear ${candidateName},

We hope this message finds you well.

You have been shortlisted for an interview at SLK Trading & Design Construction Co., Ltd. But you haven't selected your interview appointment slot yet. To proceed, please select your preferred interview appointment slot as soon as possible using the link provided in your previous email.

If you have any questions or require assistance, feel free to contact our HR team.

Best regards,
SLK HR Team
${footer}`;
  } else {
    message = `Dear ${candidateName},

This is a friendly reminder of your upcoming interview at SLK Trading & Design Construction Co., Ltd.

Interview Date: ${interviewDate}
Interview Time: ${interviewTime}

Please ensure you arrive on time and bring any necessary documents.

If you need to reschedule or have any questions, please go to the appointment link in your previous email then enter your name and cancel/reschedule your appointment or contact our HR team.

Best regards,
SLK HR Team
${footer}`;
  }

  return { subject, message };
}

// POSTMAN-ready API handler
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { candidateName, candidateEmail } = req.body;

  if (!candidateName || !candidateEmail) {
    return res.status(400).json({ error: "Missing candidateName or candidateEmail" });
  }

  const appointment = await getAppointmentForCandidate(candidateEmail);

  const email = getReminderEmailTemplate({
    candidateName,
    interviewDate: appointment.interviewDate,
    interviewTime: appointment.interviewTime,
    slotSelected: appointment.slotSelected,
  });

  res.status(200).json(email);
}