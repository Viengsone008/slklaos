"use client";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const ScrollToHash = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get hash from URL
    const hash = window.location.hash;

    if (!hash) return;

    const id = hash.replace("#", "");
    const element = document.getElementById(id);

    if (element) {
      // Small delay to ensure the page has rendered
      const timeoutId = setTimeout(() => {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        });
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [pathname, searchParams]);

  // Also handle hash changes that occur after initial load
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;

      if (!hash) return;

      const id = hash.replace("#", "");
      const element = document.getElementById(id);

      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        });
      }
    };

    // Listen for hash changes
    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  return null;
};

export default ScrollToHash;
