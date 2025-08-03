"use client";
import React, { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
import { Project } from "@/types/project";

// Dynamically import ProgressDonut to prevent SSR issues
const ProgressDonut = dynamic(() => import("./ProgressDonut"), {
  ssr: false,
  loading: () => (
    <div className="w-16 h-16 bg-gray-100 animate-pulse rounded-full flex items-center justify-center">
      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
    </div>
  )
});

interface Props {
  projects: Project[];
}

const ProjectProgressOverview: React.FC<Props> = ({ projects }) => {
  const [isClient, setIsClient] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Client-side hydration check
  useEffect(() => {
    setIsClient(true);
    setMounted(true);
  }, []);

  // Filter projects safely
  const filtered = React.useMemo(() => {
    if (!mounted || !projects) return [];
    
    return projects.filter(
      (p) => typeof p.progress === "number" && p.status === "in_progress"
    );
  }, [projects, mounted]);

  // Don't render on server-side to prevent hydration issues
  if (!isClient || !mounted) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">📈 Project Progress Overview</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-100 animate-pulse rounded-full"></div>
              <div className="mt-2 w-20 h-4 bg-gray-100 animate-pulse rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h2 className="text-lg font-semibold mb-4">📈 Project Progress Overview</h2>

      {filtered.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg 
              className="w-8 h-8 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
              />
            </svg>
          </div>
          <p className="text-sm text-gray-500">No in-progress projects found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {filtered.map((project) => (
            <div key={project.id} className="flex flex-col items-center group">
              <div className="transition-transform group-hover:scale-105">
                <ProgressDonut percent={project.progress ?? 0} />
              </div>
              <p className="mt-2 text-sm text-center font-medium text-gray-700 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {project.title || project.name || 'Untitled Project'}
              </p>
              <div className="mt-1 text-xs text-gray-500">
                {project.progress ?? 0}% Complete
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Project Summary */}
      {filtered.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{filtered.length}</div>
              <div className="text-sm text-gray-500">Active Projects</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {Math.round(
                  filtered.reduce((sum, p) => sum + (p.progress ?? 0), 0) / filtered.length
                )}%
              </div>
              <div className="text-sm text-gray-500">Average Progress</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {filtered.filter(p => (p.progress ?? 0) >= 90).length}
              </div>
              <div className="text-sm text-gray-500">Near Completion</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectProgressOverview;
