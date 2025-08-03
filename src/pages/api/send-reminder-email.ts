import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";
import { getReminderEmailTemplate } from "./reminder-email-template";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { recipients } = req.body;

  if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
    return res.status(400).json({ error: "Missing or invalid recipients array" });
  }

  // Configure nodemailer
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const results = [];

  for (const r of recipients) {
    const { candidateName, candidateEmail } = r;
    if (!candidateName || !candidateEmail) {
      results.push({ candidateEmail, status: "skipped", reason: "Missing name or email" });
      continue;
    }

    // Get appointment info for candidate
    const { data, error } = await supabase
      .from("appointments")
      .select("date, time, status")
      .eq("candidate_email", candidateEmail)
      .maybeSingle();

    const slotSelected = data && (data.status === "confirmed" || data.status === "pending");

    const { subject, message } = getReminderEmailTemplate({
      candidateName,
      interviewDate: data?.date,
      interviewTime: data?.time,
      slotSelected,
    });

    try {
      await transporter.sendMail({
        from: `"SLK Trading" <${process.env.FROM_EMAIL}>`,
        to: candidateEmail,
        subject,
        text: message,
      });
      results.push({ candidateEmail, status: "sent" });
    } catch (err) {
      results.push({ candidateEmail, status: "failed", reason: err.message });
    }
  }

  return res.status(200).json({ success: true, results });
}