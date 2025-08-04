"use client";
import React, { useEffect, useState, useRef } from 'react';
// CountUp component for animated numbers
const CountUp = ({ end, duration = 1.2, suffix = '+', className = '' }: { end: number, duration?: number, suffix?: string, className?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let start = 0;
    const increment = end / (duration * 60);
    let frame: number;
    function animate() {
      start += increment;
      if (start < end) {
        setCount(Math.floor(start));
        frame = requestAnimationFrame(animate);
      } else {
        setCount(end);
        cancelAnimationFrame(frame);
      }
    }
    animate();
    return () => cancelAnimationFrame(frame);
  }, [end, duration]);
  return <span ref={ref} className={className}>{count}{suffix}</span>;
};
import { ExternalLink, Calendar, MapPin, ArrowRight, User } from 'lucide-react';
import AnimatedSection from '../components/AnimatedSection';
import { useLanguage } from '../contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import Trans from '../components/Trans';

interface Project {
  id: string;
  title: string;
  category: string;
  location: string;
  year: string;
  image: string;
  description: string;
  clientName?: string;
  clientAvatar?: string;
}

const Projects = () => {
  const { t } = useLanguage();
  const router = useRouter();
  const [groupedProjects, setGroupedProjects] = useState<Record<string, Project[]>>({});
  // Stats and client logos (replace with real data as needed)
  const [totalProjects, setTotalProjects] = useState<number>(0);
  const yearsExperience = 25;
  const clientSatisfaction = 99;
  const clientLogos: string[] = [
    // ...
  ];

  // Animated stats on scroll into view
  const [statsAnimated, setStatsAnimated] = useState({ projects: false, years: false, satisfaction: false });
  const statsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new window.IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setStatsAnimated({ projects: true, years: true, satisfaction: true });
          }
        });
      },
      { threshold: 0.4 }
    );
    if (statsRef.current) {
      observer.observe(statsRef.current);
    }
    return () => {
      if (statsRef.current) observer.unobserve(statsRef.current);
    };
  }, []);

  const toTitleCase = (str: string) =>
    str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

  // Shuffle utility
  const shuffleArray = (array: Project[]) => {
    return array.sort(() => Math.random() - 0.5);
  };
  
  // Fetch projects and total count from Supabase
  useEffect(() => {
    const fetchProjects = async () => {
      // Fetch all projects for total count
      const { count, error: countError } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true });
      if (!countError && typeof count === 'number') {
        setTotalProjects(count);
      }

      // Fetch project data for display
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('year', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error.message);
        return;
      }

      // Only keep Residential and Commercial category, and map 'client' and 'clientAvatar' columns
      const filtered = data?.filter((project: any) =>
        ['residential', 'commercial'].includes(project.category)
      ).map((project: any) => ({
        ...project,
        clientName: project.client, // map 'client' column to 'clientName' for UI
        clientAvatar: project.clientAvatar, // map 'clientAvatar' column for avatar image
      }));

      // Shuffle before grouping
      const shuffled = shuffleArray(filtered ?? []);

      // Group by category and slice to show 3 projects per category
      const grouped: Record<string, Project[]> = {};
      filtered?.forEach((project: Project) => {
        if (!grouped[project.category]) grouped[project.category] = [];
        if (grouped[project.category].length < 3) {
          grouped[project.category].push(project);
        }
      });

      setGroupedProjects(grouped);
    };

    fetchProjects();
  }, []);

  const handleViewProject = (projectId: string) => {
    // Link to the project-details/page with the project ID as a query param
    router.push(`/project-details?id=${projectId}`);
  };

  const handleViewAllProjects = () => {
    router.push('/projects');
  };

  return (
    <section id="projects" className="py-20 bg-light">
      <div className="max-w-[1540px] mx-auto px-2 sm:px-4">
        {/* Project Stats */}
        <div ref={statsRef} className="flex flex-col md:flex-row items-center justify-center gap-8 mb-10">
          <div className="bg-white/80 glass-morphism rounded-2xl px-8 py-6 flex flex-col items-center shadow-md min-w-[180px] relative group">
            {/* Sparkle SVG */}
            <svg className="absolute -top-3 -right-3 w-7 h-7 text-yellow-400 opacity-80 animate-pulse pointer-events-none" fill="none" viewBox="0 0 24 24"><path d="M12 2l2.09 6.26L20 9.27l-5 3.64L16.18 20 12 16.77 7.82 20 9 12.91l-5-3.64 5.91-.91z" fill="currentColor"/></svg>
            <span className="text-3xl font-extrabold text-[#6dbeb0] drop-shadow-lg animate-glow">
              {statsAnimated.projects ? (totalProjects < 20 ? <CountUp end={20} /> : <CountUp end={totalProjects} />) : 0}
            </span>
            <span className="text-gray-700 font-medium mt-1"><Trans as="span">Projects</Trans></span>
          </div>
          <div className="bg-white/80 glass-morphism rounded-2xl px-8 py-6 flex flex-col items-center shadow-md min-w-[180px] relative group">
            <svg className="absolute -top-3 -right-3 w-7 h-7 text-yellow-400 opacity-80 animate-pulse pointer-events-none" fill="none" viewBox="0 0 24 24"><path d="M12 2l2.09 6.26L20 9.27l-5 3.64L16.18 20 12 16.77 7.82 20 9 12.91l-5-3.64 5.91-.91z" fill="currentColor"/></svg>
            <span className="text-3xl font-extrabold text-[#3d9392] drop-shadow-lg animate-glow">
              {statsAnimated.years ? <CountUp end={yearsExperience} /> : 0}
            </span>
            <span className="text-gray-700 font-medium mt-1"><Trans as="span">Years Experience</Trans></span>
          </div>
          <div className="bg-white/80 glass-morphism rounded-2xl px-8 py-6 flex flex-col items-center shadow-md min-w-[180px] relative group">
            <svg className="absolute -top-3 -right-3 w-7 h-7 text-yellow-400 opacity-80 animate-pulse pointer-events-none" fill="none" viewBox="0 0 24 24"><path d="M12 2l2.09 6.26L20 9.27l-5 3.64L16.18 20 12 16.77 7.82 20 9 12.91l-5-3.64 5.91-.91z" fill="currentColor"/></svg>
            <span className="text-3xl font-extrabold text-[#1b3d5a] drop-shadow-lg animate-glow">
              {statsAnimated.satisfaction ? <CountUp end={clientSatisfaction} suffix="%" /> : 0}
            </span>
            <span className="text-gray-700 font-medium mt-1"><Trans as="span">Client Satisfaction</Trans></span>
          </div>
        </div>

        {/* Client Logos */}
        <div className="flex items-center justify-center gap-8 mb-14 flex-wrap">
          {clientLogos.map((logo, i) => (
            <img
              key={i}
              src={logo}
              alt={`Client logo ${i+1}`}
              className="h-12 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300 drop-shadow-md bg-white/80 rounded-xl p-2"
              loading="lazy"
            />
          ))}
        </div>
        <AnimatedSection>
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              <Trans as="span">Our</Trans> <span className="text-[#3d9392]"><Trans as="span">Projects</Trans></span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover our portfolio of exceptional construction projects, showcasing innovative design, superior craftsmanship, and uncompromising quality across residential and commercial developments.
            </p>
          </div>
        </AnimatedSection>

        {/* Loop through grouped projects */}
        {Object.entries(groupedProjects).map(([category, projects]) => (
          <div key={category} className="mb-16">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-left pl-2">
              {t(toTitleCase(category))}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project, index) => (
                <AnimatedSection key={project.id} delay={index * 0.15}>
                  <div
                    className="glass-morphism bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl border border-[#e5f1f1] hover:border-[#6dbeb0] transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.03] hover:shadow-2xl overflow-hidden group flex flex-col h-full cursor-pointer relative"
                    style={{ boxShadow: '0 8px 32px 0 rgba(31,38,135,0.10)' }}
                    onClick={() => handleViewProject(project.id)}
                  >
                    {/* Image Section */}
                    <div className="relative">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-60 object-cover group-hover:scale-105 transition-transform duration-500 rounded-t-3xl"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-gradient-to-br from-[#6dbeb0] via-[#3d9392] to-[#1b3d5a] text-white px-3 py-1 rounded-full text-sm font-semibold capitalize shadow-lg animate-pulse">
                          {project.category}
                        </span>
                      </div>
                    </div>
                    {/* Content Section */}
                    <div className="p-6 flex flex-col justify-between flex-grow rounded-b-3xl">
                      <h3
                        className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#6dbeb0] transition-colors drop-shadow-lg"
                      >
                        {project.title}
                      </h3>
                      {/* Client Info */}
                      {project.clientName && (
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-5 h-5 text-[#6dbeb0]" />
                          <span className="text-sm font-medium text-gray-700">
                          <span className="font-semibold text-gray-600 mr-1">{t('Client:')}</span> {project.clientName}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center text-gray-600 mb-1 text-sm">
                        <MapPin className="h-4 w-4 mr-2 text-[#6dbeb0]" />
                        {project.location}
                      </div>
                      <div className="flex items-center text-gray-600 mb-4 text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-[#3d9392]" />
                        {project.year}
                      </div>
                      <p className="text-gray-700 mb-6 line-clamp-2">
                        {t(project.description)}
                      </p>
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          handleViewProject(project.id);
                        }}
                        className="inline-flex items-center bg-gradient-to-r from-[#3d9392] to-[#6dbeb0] text-white px-6 py-3 rounded-xl hover:from-[#6dbeb0] hover:to-[#3d9392] transition-all duration-300 font-semibold text-base shadow-lg hover:shadow-xl transform hover:scale-105 relative overflow-hidden"
                      >
                        {t('Project Details')}
                        <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:scale-110" />
                      </button>
                    </div>
                    {/* Hover Reveal Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#6dbeb0]/90 via-[#3d9392]/80 to-[#1b3d5a]/90 bg-opacity-90 text-white flex flex-col justify-center items-center px-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 cursor-pointer rounded-3xl backdrop-blur-md">
                      <h4 className="text-2xl font-bold mb-2 text-white drop-shadow-lg">{project.title}</h4>
                      <p className="text-white/90 text-base mb-4 text-center drop-shadow-md line-clamp-5">{t(project.description)}</p>
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          handleViewProject(project.id);
                        }}
                        className="inline-flex items-center bg-gradient-to-r from-[#3d9392] to-[#6dbeb0] text-white px-6 py-3 rounded-xl hover:from-[#6dbeb0] hover:to-[#3d9392] transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 relative overflow-hidden"
                      >
                        {t('Project Details')}
                        <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:scale-110" />
                      </button>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        ))}

        {/* View All Projects Button after category sections */}
        <AnimatedSection delay={0.4}>
          <div className="text-center mt-16 mb-12">
            <button
              onClick={handleViewAllProjects}
              className="inline-flex items-center bg-gradient-to-r from-[#3d9392] to-[#6dbeb0] text-white px-10 py-4 rounded-xl hover:from-[#6dbeb0] hover:to-[#3d9392] transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 relative overflow-hidden"
            >
              {t('View All Projects')}
              <ExternalLink className="h-6 w-6 ml-3 transition-transform group-hover:scale-110" />
            </button>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default Projects;
