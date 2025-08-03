
"use client";
import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Navbar from "./Navbar";
import Hero from "./Hero";
import Services from "./Services";
import Products from "./Products";
import Projects from "./Projects";
import About from "./About";
import BlogSection from "./BlogSection";
import Contact from "./Contact";
import Footer from "./Footer";
import WhatsAppChatButton from "../components/WhatsAppChatButton";
import FloatingQuoteButton from "../components/FloatingQuoteButton";
import QuoteModal from "../components/QuoteModal";

export default function Home() {
  // Section refs for smooth scroll
  const heroRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const productsRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const blogRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  const [activeSection, setActiveSection] = useState("hero");
  const [showNav, setShowNav] = useState(false);
  const [showQuoteButton, setShowQuoteButton] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        { id: "hero", ref: heroRef },
        { id: "services", ref: servicesRef },
        { id: "products", ref: productsRef },
        { id: "projects", ref: projectsRef },
        { id: "about", ref: aboutRef },
        { id: "blog", ref: blogRef },
        { id: "contact", ref: contactRef },
      ];
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = sections[i].ref.current;
        if (el && el.getBoundingClientRect().top <= 120) {
          setActiveSection(sections[i].id);
          break;
        }
      }
      setShowNav(window.scrollY > 0);
      setShowQuoteButton(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const sectionNav = [
    { id: "hero", label: "Hero", ref: heroRef },
    { id: "services", label: "Services", ref: servicesRef },
    { id: "products", label: "Products", ref: productsRef },
    { id: "projects", label: "Projects", ref: projectsRef },
    { id: "about", label: "About", ref: aboutRef },
    { id: "blog", label: "Blog", ref: blogRef },
    { id: "contact", label: "Contact", ref: contactRef },
  ];

  return (
    <div className="font-sans min-h-screen w-full bg-white">
      {/* Floating Section Navigation */}
      {showNav && (
        <nav className="fixed left-4 top-1/2 z-[9999] flex flex-col gap-2 -translate-y-1/2 hidden sm:flex bg-white/40 backdrop-blur-md rounded-2xl p-3 shadow-lg border border-white/30">
          {sectionNav.map((s) => (
            <button
              key={s.id}
              onClick={() => s.ref.current?.scrollIntoView({ behavior: 'smooth' })}
              className={`w-2.5 h-2.5 rounded-full border-2 ${activeSection === s.id ? 'bg-[#bfa76a] border-[#bfa76a] scale-110' : 'bg-white border-[#e5e2d6]'} shadow transition-all duration-300`}
              aria-label={s.label}
            />
          ))}
        </nav>
      )}
      <Navbar />
      {/* Hero Section */}
      <div ref={heroRef} id="hero">
        <Hero />
      </div>
      {/* Main Content Sections */}
      <main className="w-full">
        {/* Services Section */}
        <div ref={servicesRef} id="services">
          <Services />
        </div>
        {/* Products Section */}
        <div ref={productsRef} id="products">
          <Products />
        </div>
        {/* Projects Section */}
        <div ref={projectsRef} id="projects">
          <Projects />
        </div>
        {/* About Section */}
        <div ref={aboutRef} id="about">
          <About />
        </div>
        {/* News/Blog Section */}
        <div ref={blogRef} id="blog">
          <BlogSection />
        </div>
        {/* Contact Section */}
        <section ref={contactRef} id="contact" className="py-20 px-8 sm:px-20 bg-gray-50">
          <Contact />
        </section>
      </main>
      <Footer />
      {showQuoteButton && (
        <FloatingQuoteButton onClick={() => setIsQuoteModalOpen(true)} />
      )}
      <QuoteModal isOpen={isQuoteModalOpen} onClose={() => setIsQuoteModalOpen(false)} />
      <WhatsAppChatButton />
    </div>
  );
}