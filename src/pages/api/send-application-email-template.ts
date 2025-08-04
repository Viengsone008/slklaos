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
        subject = `🎉 Congratulations! Interview Invitation - ${jobTitle} Position`;
        message = `Dear ${app.name},\n\nCongratulations! We are delighted to inform you that your application for the ${jobTitle} position at SLK Trading & Design Construction Co., Ltd has been successfully shortlisted.\n\nYour qualifications and experience have impressed our hiring team, and we would like to invite you for an interview to discuss this exciting opportunity further.\n\n📅 Next Steps:\nPlease schedule your interview at your convenience using our online booking system:\n__Make Interview Appointment__\n\nWhat to expect:\n• Professional interview discussion about your background\n• Overview of the role and company culture\n• Opportunity to ask questions about SLK and the position\n\nWe look forward to meeting you and learning more about how you can contribute to our growing team.\n\nWarm regards,\nSLK Human Resources Team\nSLK Trading & Design Construction Co., Ltd\n📧 careers@slklaos.la | 📞 +856 21 773 737`;
        break;
      case "rejected":
        subject = `Thank You for Your Interest - ${jobTitle} Application Update`;
        message = `Dear ${app.name},\n\nThank you for taking the time to apply for the ${jobTitle} position at SLK Trading & Design Construction Co., Ltd. We truly appreciate your interest in joining our team.\n\nAfter careful review and consideration of all applications, we have decided to proceed with other candidates whose experience more closely aligns with our current requirements for this specific role.\n\nPlease know that this decision does not reflect negatively on your qualifications or potential. The competition was strong, and we had many qualified applicants to choose from.\n\nWe encourage you to:\n• Keep an eye on our careers page for future opportunities\n• Consider applying for other positions that match your skills\n• Connect with us on LinkedIn for company updates\n\nWe wish you all the best in your career journey and hope our paths may cross again in the future.\n\nBest wishes,\nSLK Human Resources Team\nSLK Trading & Design Construction Co., Ltd\n🌐 www.slklaos.la | 📧 careers@slklaos.la`;
        break;
      default:
        subject = `✅ Application Received - ${jobTitle} Position`;
        message = `Dear ${app.name},\n\nThank you for your interest in the ${jobTitle} position at SLK Trading & Design Construction Co., Ltd. We have successfully received your application and appreciate you considering us as your next career opportunity.\n\nWhat happens next:\n📋 Our hiring team will carefully review your application\n⏰ Review process typically takes 5-7 business days\n📞 We will contact you directly if you are selected for the next stage\n📧 You will receive updates on your application status\n\nAbout SLK Trading & Design Construction:\nWe are a leading construction company in Laos, specializing in design construction, waterproofing materials, and flooring materials. We pride ourselves on quality excellence, professional expertise, and timely delivery.\n\nIf you have any questions about your application or the position, please don't hesitate to reach out to us.\n\nThank you once again for your interest in joining our team.\n\nBest regards,\nSLK Human Resources Team\nSLK Trading & Design Construction Co., Ltd\n📧 careers@slklaos.la | 📞 +856 21 773 737`;
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
      generalSubject = `🎉 Congratulations! Interview Invitation - ${jobTitle} Position`;
      generalMessage = `Dear Applicant,\n\nCongratulations! We are delighted to inform you that your application for the ${jobTitle} position at SLK Trading & Design Construction Co., Ltd has been successfully shortlisted.\n\nYour qualifications and experience have impressed our hiring team, and we would like to invite you for an interview to discuss this exciting opportunity further.\n\n📅 Next Steps:\nOur HR team will contact you shortly with detailed interview instructions and scheduling information.\n\nWhat to expect:\n• Professional interview discussion about your background\n• Overview of the role and company culture\n• Opportunity to ask questions about SLK and the position\n\nWe look forward to meeting you and learning more about how you can contribute to our growing team.\n\nWarm regards,\nSLK Human Resources Team\nSLK Trading & Design Construction Co., Ltd\n📧 careers@slklaos.la | 📞 +856 21 773 737`;
      break;
    case "rejected":
      generalSubject = `Thank You for Your Interest - ${jobTitle} Application Update`;
      generalMessage = `Dear Applicant,\n\nThank you for taking the time to apply for the ${jobTitle} position at SLK Trading & Design Construction Co., Ltd. We truly appreciate your interest in joining our team.\n\nAfter careful review and consideration of all applications, we have decided to proceed with other candidates whose experience more closely aligns with our current requirements for this specific role.\n\nPlease know that this decision does not reflect negatively on your qualifications or potential. The competition was strong, and we had many qualified applicants to choose from.\n\nWe encourage you to:\n• Keep an eye on our careers page for future opportunities\n• Consider applying for other positions that match your skills\n• Connect with us on LinkedIn for company updates\n\nWe wish you all the best in your career journey and hope our paths may cross again in the future.\n\nBest wishes,\nSLK Human Resources Team\nSLK Trading & Design Construction Co., Ltd\n🌐 www.slklaos.la | 📧 careers@slklaos.la`;
      break;
    default:
      generalSubject = `✅ Application Received - ${jobTitle} Position`;
      generalMessage = `Dear Applicant,\n\nThank you for your interest in the ${jobTitle} position at SLK Trading & Design Construction Co., Ltd. We have successfully received your application and appreciate you considering us as your next career opportunity.\n\nWhat happens next:\n📋 Our hiring team will carefully review your application\n⏰ Review process typically takes 5-7 business days\n📞 We will contact you directly if you are selected for the next stage\n📧 You will receive updates on your application status\n\nAbout SLK Trading & Design Construction:\nWe are a leading construction company in Laos, specializing in design construction, waterproofing materials, and flooring materials. We pride ourselves on quality excellence, professional expertise, and timely delivery.\n\nIf you have any questions about your application or the position, please don't hesitate to reach out to us.\n\nThank you once again for your interest in joining our team.\n\nBest regards,\nSLK Human Resources Team\nSLK Trading & Design Construction Co., Ltd\n📧 careers@slklaos.la | 📞 +856 21 773 737`;
  }

  res.status(200).json({ emails, subject: generalSubject, message: generalMessage });
}