"use client";
import React, { useEffect, useState } from 'react';
import { parseISO, isValid } from 'date-fns';
import { supabase } from '../lib/supabase';
import dynamic from 'next/dynamic';

// Dynamically import react-big-calendar to prevent SSR issues
const Calendar = dynamic(() => import('react-big-calendar').then(mod => mod.Calendar), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500">Loading Calendar...</p>
      </div>
    </div>
  )
});

// Import CSS only on client side
if (typeof window !== 'undefined') {
  require('react-big-calendar/lib/css/react-big-calendar.css');
}

interface Project {
  id: string;
  title: string;
  name?: string; // Alternative field name
  start_date?: string;
  end_date?: string;
  status?: string;
  description?: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource?: any;
  allDay?: boolean;
}

const ProjectCalendar: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [localizer, setLocalizer] = useState<any>(null);

  // Client-side hydration check
  useEffect(() => {
    setIsClient(true);
    
    // Initialize localizer on client side
    const initializeLocalizer = async () => {
      try {
        const moment = await import('moment');
        const { momentLocalizer } = await import('react-big-calendar');
        const loc = momentLocalizer(moment.default);
        setLocalizer(loc);
      } catch (err) {
        console.error('Error initializing localizer:', err);
        setError('Failed to initialize calendar');
      }
    };

    initializeLocalizer();
  }, []);

  useEffect(() => {
    if (!isClient || !localizer) return;

    const fetchProjects = async () => {
      setIsLoading(true);
      setError('');

      try {
        const { data, error: supabaseError } = await supabase
          .from('projects')
          .select('id, title, name, start_date, end_date, status, description');

        if (supabaseError) {
          throw new Error(supabaseError.message);
        }

        if (!data) {
          setEvents([]);
          return;
        }

        // Transform projects to calendar events
        const transformedEvents: CalendarEvent[] = data
          .filter((proj: Project) => {
            // Filter projects that have valid dates
            return proj.start_date && proj.end_date;
          })
          .map((proj: Project) => {
            const startDate = parseISO(proj.start_date!);
            const endDate = parseISO(proj.end_date!);
            
            // Validate dates
            if (!isValid(startDate) || !isValid(endDate)) {
              console.warn(`Invalid dates for project ${proj.id}:`, {
                start_date: proj.start_date,
                end_date: proj.end_date
              });
              return null;
            }

            return {
              id: proj.id,
              title: proj.title || proj.name || 'Untitled Project',
              start: startDate,
              end: endDate,
              resource: {
                id: proj.id,
                status: proj.status,
                description: proj.description
              },
              allDay: false
            };
          })
          .filter((event): event is CalendarEvent => event !== null);

        setEvents(transformedEvents);
      } catch (err) {
        console.error('Failed to fetch projects:', err);
        setError('Failed to load project data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [isClient, localizer]);

  const handleSelectEvent = (event: CalendarEvent) => {
    if (event.resource) {
      alert(`Project: ${event.title}\nStatus: ${event.resource.status || 'Unknown'}\nDescription: ${event.resource.description || 'No description'}`);
    }
  };

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    const title = window.prompt('Enter project title:');
    if (title) {
      const newEvent: CalendarEvent = {
        id: `temp-${Date.now()}`,
        title,
        start,
        end,
        allDay: false
      };
      
      // You could add logic here to save to database
      setEvents(prev => [...prev, newEvent]);
    }
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    const status = event.resource?.status;
    let backgroundColor = '#3174ad'; // Default blue
    
    switch (status) {
      case 'completed':
        backgroundColor = '#10b981'; // Green
        break;
      case 'in_progress':
        backgroundColor = '#f59e0b'; // Orange
        break;
      case 'planning':
        backgroundColor = '#6366f1'; // Purple
        break;
      case 'on_hold':
        backgroundColor = '#ef4444'; // Red
        break;
      case 'cancelled':
        backgroundColor = '#6b7280'; // Gray
        break;
      default:
        backgroundColor = '#3174ad'; // Blue
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  // Don't render on server-side
  if (!isClient) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          📅 Project Calendar
        </h2>
        <div className="h-96 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading Calendar...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          📅 Project Calendar
        </h2>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (isLoading || !localizer) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          📅 Project Calendar
        </h2>
        <div className="h-96 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading Calendar...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center">
          📅 Project Calendar
        </h2>
        <div className="text-sm text-gray-500">
          {events.length} project{events.length !== 1 ? 's' : ''} scheduled
        </div>
      </div>
      
      {/* Legend */}
      <div className="mb-4 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
          <span>Planning</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-orange-500 rounded mr-2"></div>
          <span>In Progress</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
          <span>Completed</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
          <span>On Hold</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-gray-500 rounded mr-2"></div>
          <span>Cancelled</span>
        </div>
      </div>

      <div className="calendar-container">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          eventPropGetter={eventStyleGetter}
          views={['month', 'week', 'day', 'agenda']}
          defaultView="month"
          popup
          showMultiDayTimes
          step={60}
          showAllEvents
          messages={{
            allDay: 'All Day',
            previous: '←',
            next: '→',
            today: 'Today',
            month: 'Month',
            week: 'Week',
            day: 'Day',
            agenda: 'Agenda',
            date: 'Date',
            time: 'Time',
            event: 'Project',
            noEventsInRange: 'No projects scheduled in this range.',
            showMore: (total: number) => `+${total} more`
          }}
        />
      </div>

      <style jsx global>{`
        .calendar-container .rbc-calendar {
          font-family: inherit;
        }
        
        .calendar-container .rbc-header {
          background-color: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          padding: 10px;
          font-weight: 600;
        }
        
        .calendar-container .rbc-event {
          border-radius: 4px;
          font-size: 12px;
          padding: 2px 5px;
        }
        
        .calendar-container .rbc-today {
          background-color: #fef3c7;
        }
        
        .calendar-container .rbc-off-range-bg {
          background-color: #f9fafb;
        }
        
        .calendar-container .rbc-toolbar {
          margin-bottom: 1rem;
          padding: 1rem;
          background-color: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }
        
        .calendar-container .rbc-toolbar button {
          background-color: white;
          border: 1px solid #d1d5db;
          color: #374151;
          padding: 6px 12px;
          border-radius: 6px;
          margin: 0 2px;
          transition: all 0.2s;
        }
        
        .calendar-container .rbc-toolbar button:hover {
          background-color: #f3f4f6;
          border-color: #9ca3af;
        }
        
        .calendar-container .rbc-toolbar button.rbc-active {
          background-color: #3b82f6;
          border-color: #3b82f6;
          color: white;
        }
        
        .calendar-container .rbc-month-view {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .calendar-container .rbc-date-cell {
          padding: 8px;
        }
        
        .calendar-container .rbc-date-cell.rbc-selected {
          background-color: #dbeafe;
        }
      `}</style>
    </div>
  );
};

export default ProjectCalendar;
