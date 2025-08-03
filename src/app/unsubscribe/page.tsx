"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabase"; // Adjust path if needed


export default function UnsubscribePage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleUnsubscribe = async () => {
    setStatus("loading");
    const { error } = await supabase
      .from("newsletter_subscribers") // <-- use your table name here
      .update({ unsubscribed: true })
      .eq("email", email);

    if (error) setStatus("error");
    else setStatus("success");
  };

  if (!email) {
    return <div className="max-w-lg mx-auto mt-20 text-center text-red-600">Invalid unsubscribe link.</div>;
  }

  return (
    <div className="max-w-lg mx-auto mt-20 p-6 bg-white rounded shadow text-center">
      <h1 className="text-2xl font-bold mb-4">Unsubscribe from Newsletter</h1>
      {status === "idle" && (
        <>
          <p className="mb-6">Are you sure you want to unsubscribe <b>{email}</b> from the SLK Newsletter?</p>
          <button
            onClick={handleUnsubscribe}
            className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
          >
            Yes, Unsubscribe Me
          </button>
        </>
      )}
      {status === "loading" && <p>Processing...</p>}
      {status === "success" && (
        <p className="text-green-600 font-semibold">
          You have been unsubscribed. We're sorry to see you go!
        </p>
      )}
      {status === "error" && (
        <p className="text-red-600 font-semibold">
          Something went wrong. Please try again later.
        </p>
      )}
    </div>
  );
}