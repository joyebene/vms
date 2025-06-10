'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { visitorAPI, Visitor } from '@/lib/api';
import { Calendar, Clock, User, Building, FileText, CheckCircle, XCircle } from 'lucide-react';

interface VisitHistoryTableProps {
  visitorId?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  location?: string;
}

export default function VisitHistoryTable({
  visitorId,
  startDate,
  endDate,
  status,
  location,
}: VisitHistoryTableProps) {
  const [visits, setVisits] = useState<Visitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchVisitHistory = async () => {
      if (!token) return;

      setIsLoading(true);
      setError(null);

      try {
        let visitData: Visitor[];

        try {
          if (visitorId) {
            // Get visit history for a specific visitor
            visitData = await visitorAPI.getVisitorHistory(visitorId, token);
          } else {
            // Get all visit history with optional filters
            visitData = await visitorAPI.getVisitHistory(token, startDate, endDate, status, location);
          }

          if (Array.isArray(visitData) && visitData.length > 0) {
            setVisits(visitData);
            return;
          }
        } catch (apiError) {
          console.error('API error fetching visit history:', apiError);
          // Continue to fallback
        }

        // If we get here, either the API call failed or returned no data
        // Try to get visitors as a fallback
        try {
          const visitors = await visitorAPI.getVisitorsByHost(token);

          if (Array.isArray(visitors) && visitors.length > 0) {
            // Filter visitors based on the provided filters
            let filteredVisitors = [...visitors];

            if (startDate) {
              const startDateObj = new Date(startDate);
              filteredVisitors = filteredVisitors.filter(v =>
                new Date(v.visitStartDate) >= startDateObj
              );
            }

            if (endDate) {
              const endDateObj = new Date(endDate);
              filteredVisitors = filteredVisitors.filter(v =>
                new Date(v.visitStartDate) <= endDateObj
              );
            }

            if (status) {
              filteredVisitors = filteredVisitors.filter(v =>
                v.status === status
              );
            }

            if (visitorId) {
              filteredVisitors = filteredVisitors.filter(v =>
                v._id === visitorId
              );
            }

            setVisits(filteredVisitors);
            return;
          }
        } catch (visitorError) {
          console.error('Error fetching visitors as fallback:', visitorError);
          setError('Failed to load visit history. Please check your connection and try again.');
        }

      } catch (err) {
        console.error('Error in visit history component:', err);
        setError(err instanceof Error ? err.message : 'Failed to load visit history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVisitHistory();
  }, [token, visitorId, startDate, endDate, status, location]);



  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'checked-in':
        return 'bg-green-100 text-green-800';
      case 'checked-out':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Calendar className="h-4 w-4" />;
      case 'checked-in':
        return <CheckCircle className="h-4 w-4" />;
      case 'checked-out':
        return <Clock className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8" role="status" aria-live="polite">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" aria-hidden="true"></div>
        <span className="ml-2 text-gray-600">Loading visit history...</span>
        <span className="sr-only">Loading visit history, please wait</span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4"
        role="alert"
        aria-labelledby="error-heading"
      >
        <p id="error-heading" className="font-medium">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  if (visits.length === 0) {
    return (
      <div
        className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center"
        role="status"
        aria-live="polite"
      >
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" aria-hidden="true" />
        <h3 className="text-lg font-medium text-gray-900">No visit history found</h3>
        <p className="text-gray-600 mt-1">
          {visitorId
            ? 'This visitor has no recorded visits.'
            : 'No visits match the selected filters.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      {/* Desktop view */}
      <div className="overflow-x-auto hidden md:block">
        <table className="min-w-full divide-y divide-gray-200" aria-label="Visit history">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Visitor
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Host
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Visit Date
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Check-in
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Check-out
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Purpose
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {visits.map((visit) => (
              <tr key={visit._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center" aria-hidden="true">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {visit.firstName} {visit.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{visit.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Building className="h-4 w-4 text-gray-500 mr-2" aria-hidden="true" />
                    <span className="text-sm text-gray-900">{visit.hostEmployee}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(visit.visitStartDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatTime(visit.checkInTime)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatTime(visit.checkOutTime)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                      visit.status
                    )}`}
                    aria-label={`Status: ${visit.status}`}
                  >
                    <span aria-hidden="true">{getStatusIcon(visit.status)}</span>
                    <span className="ml-1 capitalize">{visit.status}</span>
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {visit.purpose}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile view */}
      <div className="md:hidden">
        <ul className="divide-y divide-gray-200" aria-label="Visit history">
          {visits.map((visit) => (
            <li key={visit._id} className="p-4 hover:bg-gray-50">
              <div className="flex items-center mb-3">
                <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center" aria-hidden="true">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900">
                    {visit.firstName} {visit.lastName}
                  </div>
                  <div className="text-xs text-gray-500">{visit.email}</div>
                </div>
                <div className="ml-auto">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                      visit.status
                    )}`}
                    aria-label={`Status: ${visit.status}`}
                  >
                    <span aria-hidden="true">{getStatusIcon(visit.status)}</span>
                    <span className="ml-1 capitalize">{visit.status}</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="font-medium text-gray-500">Host:</span>
                  <div className="flex items-center mt-1">
                    <Building className="h-3 w-3 text-gray-500 mr-1" aria-hidden="true" />
                    <span className="text-gray-900">{visit.hostEmployee}</span>
                  </div>
                </div>

                <div>
                  <span className="font-medium text-gray-500">Visit Date:</span>
                  <div className="mt-1 text-gray-900">{formatDate(visit.visitStartDate)}</div>
                </div>

                <div>
                  <span className="font-medium text-gray-500">Check-in:</span>
                  <div className="mt-1 text-gray-900">{formatTime(visit.checkInTime)}</div>
                </div>

                <div>
                  <span className="font-medium text-gray-500">Check-out:</span>
                  <div className="mt-1 text-gray-900">{formatTime(visit.checkOutTime)}</div>
                </div>

                <div className="col-span-2">
                  <span className="font-medium text-gray-500">Purpose:</span>
                  <div className="mt-1 text-gray-900">{visit.purpose}</div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
