import React from 'react';
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ProjectGallery: React.FC = () => {
  const [projects, setProjects] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [slideIdx, setSlideIdx] = React.useState(0);

  React.useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) setProjects(data);
      setLoading(false);
    };
    fetchProjects();
  }, []);

  // Gather all hero images and their project ids
  const allImages: { url: string, id: any, title?: string }[] = [];
  projects.forEach(p => {
    if (Array.isArray(p.images) && p.images.length > 0) {
      p.images.forEach((img: string) => allImages.push({ url: img, id: p.id, title: p.title }));
    } else if (p.image) {
      allImages.push({ url: p.image, id: p.id, title: p.title });
    }
  });

  // Show only one card (first project)
  const firstProject = projects[0];

  return (
    <div className="flex flex-wrap gap-8 justify-center">
      {loading ? (
        <div className="text-[#bfa76a] text-xl font-bold">Loading...</div>
      ) : !firstProject ? (
        <div className="text-[#bfa76a] text-xl font-bold">No projects found.</div>
      ) : (
        <div
          className="cursor-pointer group relative rounded-3xl overflow-hidden shadow-2xl bg-white/80 border border-[#bfa76a]/30 transition-transform duration-300 hover:scale-105 hover:shadow-3xl mx-auto max-w-[90vw] w-full min-h-[600px]"
          style={{ minHeight: 600, maxWidth: '1200px' }}
          onClick={() => setModalOpen(true)}
        >
          <img
            src={firstProject.image}
            alt={firstProject.title}
            className="w-full h-[540px] object-cover rounded-3xl transition-all duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#bfa76a]/40 to-transparent rounded-3xl" />
          {/* Always visible title/subtitle */}
          <div className="absolute bottom-16 left-16 text-[#1a2936] z-10">
            <h3 className="text-5xl font-extrabold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>{firstProject.title}</h3>
            <p className="text-3xl text-[#bfa76a] font-medium" style={{ fontFamily: 'Playfair Display, serif' }}>{firstProject.subtitle}</p>
          </div>
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-[#1a2936]/80 flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 p-10 rounded-3xl">
            <h3 className="text-4xl font-extrabold mb-4 text-[#bfa76a] text-center" style={{ fontFamily: 'Playfair Display, serif' }}>{firstProject.title}</h3>
            <p className="text-2xl text-white mb-2 text-center max-w-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>{firstProject.subtitle}</p>
            {firstProject.description && (
              <p className="text-lg text-white/90 mb-4 text-center max-w-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>{firstProject.description}</p>
            )}
            {firstProject.location && (
              <div className="text-lg text-[#bfa76a] font-semibold mb-1">Location: {firstProject.location}</div>
            )}
            {firstProject.timeline && (
              <div className="text-lg text-[#bfa76a] font-semibold mb-1">Timeline: {firstProject.timeline}</div>
            )}
            {firstProject.pricing && (
              <div className="text-lg text-[#bfa76a] font-semibold mb-1">Starting Price: {firstProject.pricing}</div>
            )}
          </div>
        </div>
      )}

      {/* Modal for all project hero images */}
      {modalOpen && allImages.length > 0 && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-[98vw] w-full p-0 overflow-hidden flex flex-col" style={{ maxWidth: '1600px' }}>
            {/* Close button */}
            <button
              className="absolute top-4 right-4 z-50 bg-[#bfa76a] text-white rounded-full p-2 shadow hover:bg-[#1a2936] transition"
              style={{ pointerEvents: 'auto' }}
              onClick={(e) => {
                e.stopPropagation();
                setModalOpen(false);
              }}
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            {/* Slideable images */}
            <div className="relative w-full h-[700px] bg-black flex items-center justify-center">
              {/* Prev button */}
              {allImages.length > 1 && (
                <button
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-[#bfa76a]/80 text-[#1a2936] rounded-full p-2 z-20 shadow"
                  onClick={() => setSlideIdx((prev) => (prev - 1 + allImages.length) % allImages.length)}
                  aria-label="Previous image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
              )}
              {/* Main image */}
              <div className="group relative w-full h-full flex items-center justify-center">
                <a
                  href={`/project-details?id=${allImages[slideIdx].id}`}
                  className="block w-full h-full"
                  tabIndex={0}
                >
                  <img
                    src={allImages[slideIdx].url}
                    alt={allImages[slideIdx].title || 'Project'}
                    className="object-cover w-full h-[680px] max-h-[680px] rounded-2xl cursor-pointer shadow-xl border-4 border-[#bfa76a]/20"
                    style={{ maxWidth: '100%', maxHeight: '680px' }}
                    onClick={() => {
                      window.location.href = `/project-details?id=${allImages[slideIdx].id}`;
                    }}
                  />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-[#1a2936]/80 flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 p-10 rounded-2xl pointer-events-none">
                    {projects[slideIdx]?.description ? (
                      <p className="text-1xl font-semibold mb-4 text-white text-center select-none max-w-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>
                        {projects[slideIdx].description}
                      </p>
                    ) : (
                      <h3 className="text-4xl font-extrabold mb-4 text-[#bfa76a] text-center select-none" style={{ fontFamily: 'Playfair Display, serif' }}>{allImages[slideIdx].title}</h3>
                    )}
                  </div>
                </a>
              </div>
              {/* Next button */}
              {allImages.length > 1 && (
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-[#bfa76a]/80 text-[#1a2936] rounded-full p-2 z-20 shadow"
                  onClick={() => setSlideIdx((prev) => (prev + 1) % allImages.length)}
                  aria-label="Next image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              )}
            </div>
            {/* Project info */}
            <div className="p-6 text-left">
              <div className="text-2xl font-extrabold mb-1" style={{ fontFamily: 'Playfair Display, serif', color: '#1a2936' }}>{allImages[slideIdx].title}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectGallery;
