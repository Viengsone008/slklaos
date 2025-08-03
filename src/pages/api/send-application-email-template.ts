import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { status, jobTitle } = req.body;

  if (!status || !jobTitle) {
    return res.status(400).json({ error: "Status and job title are required." });
  }

  const { data, error } = await supabase
    .from("job_applications")
    .select("id, name, email")
    .eq("status", status)
    .eq("job_title", jobTitle);

  if (error) {
    return res.status(500).json({ error: "Failed to fetch applicants", details: error.message });
  }

  const emails = (data || []).map(app => {
    let subject = "";
    let message = "";

    switch (status) {
      case "shortlisted":
        subject = `Invitation to Interview - ${jobTitle}`;
        message = `Dear ${app.name},\n\nWe are pleased to inform you that you have been shortlisted for an interview for the position of ${jobTitle} at SLK Trading & Design Construction Co., Ltd.\nPlease await further instructions regarding the interview schedule.\n\nBest regards,\nSLK HR Team`;
        break;
      case "rejected":
        subject = `Invitation to Interview - ${jobTitle}`;
        message = `Dear ${app.name},\n\nThank you for your interest in the position of ${jobTitle} at SLK Trading & Design Construction Co., Ltd.\nAfter careful consideration, we regret to inform you that your application was not selected for further process.\nWe appreciate your time and wish you success in your future endeavors.\n\nBest regards,\nSLK HR Team`;
        break;
      default:
        subject = `Application Received - ${jobTitle}`;
        message = `Dear ${app.name},\n\nThank you for your application for the position of ${jobTitle}.\nWe will review your submission and contact you if you are shortlisted.\n\nBest regards,\nSLK HR Team`;
    }

    return {
      to: app.email,
      subject,
      message,
    };
  });

  let generalSubject = "";
  let generalMessage = "";

  switch (status) {
    case "shortlisted":
      generalSubject = `Invitation to Interview - ${jobTitle}`;
      generalMessage = `Dear Applicant,\n\nWe are pleased to inform you that you have been shortlisted for an interview for the position of ${jobTitle} at SLK Trading & Design Construction Co., Ltd.\nPlease await further instructions regarding the interview schedule.\n\nBest regards,\nSLK HR Team`;
      break;
    case "rejected":
      generalSubject = `Application Update - ${jobTitle}`;
      generalMessage = `Dear Applicant,\n\nThank you for your interest in the position of ${jobTitle} at SLK Trading & Design Construction Co., Ltd.\nAfter careful consideration, we regret to inform you that your application was not selected for further process.\nWe appreciate your time and wish you success in your future endeavors.\n\nBest regards,\nSLK HR Team`;
      break;
    default:
      generalSubject = `Application Received - ${jobTitle}`;
      generalMessage = `Dear Applicant,\n\nThank you for your application for the position of ${jobTitle}.\nWe will review your submission and contact you if you are shortlisted.\n\nBest regards,\nSLK HR Team`;
  }

  res.status(200).json({ emails, subject: generalSubject, message: generalMessage });
}