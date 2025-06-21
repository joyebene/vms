'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import TrainingEnrollment from '@/components/TrainingEnrollment';
import { trainingAPI, Training, newVisitorAPI, VisitorForm } from '@/lib/api';
import { BookOpen, Search, AlertCircle, CheckCircle, XCircle, Edit, Trash2, Plus } from 'lucide-react';
import Link from 'next/link';

export default function TrainingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVisitorId, setSelectedVisitorId] = useState<string | null>(null);
  const [visitors, setVisitors] = useState<VisitorForm[]>([]);
  const [filteredVisitors, setFilteredVisitors] = useState<VisitorForm[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [isLoadingVisitors, setIsLoadingVisitors] = useState(true);
  const [isLoadingTrainings, setIsLoadingTrainings] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token, user } = useAuth();

  useEffect(() => {
    if (token) {
      fetchVisitors();
      fetchTrainings();
    }
  }, [token]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredVisitors(visitors);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = visitors.filter(
        (visitor) =>
          visitor.firstName.toLowerCase().includes(query) ||
          visitor.lastName.toLowerCase().includes(query) ||
          visitor.email.toLowerCase().includes(query) 

      );
      setFilteredVisitors(filtered);
    }
  }, [searchQuery, visitors]);

  const fetchVisitors = async () => {
    if (!token) return;

    setIsLoadingVisitors(true);
    setError(null);

    try {
      // For admin users, get all visitors; for others, get only their hosted visitors
      const visitorData = await newVisitorAPI.getAll()
        // : await visitorAPI.getVisitorsByHost(token);
      setVisitors(visitorData);
      setFilteredVisitors(visitorData);

      // Select the first visitor by default if available
      if (visitorData.length > 0) {
        setSelectedVisitorId(visitorData[0]._id);
      }
    } catch (err) {
      console.error('Error fetching visitors:', err);
      setError(err instanceof Error ? err.message : 'Failed to load visitors');
    } finally {
      setIsLoadingVisitors(false);
    }
  };

  const fetchTrainings = async () => {
    if (!token) return;

    setIsLoadingTrainings(true);

    try {
      const trainingData = await trainingAPI.getAllTrainings(token);
      console.log(trainingData)
      setTrainings(trainingData);
    } catch (err) {
      console.error('Error fetching trainings:', err);
      // We don't set the error here to avoid overriding visitor loading errors
    } finally {
      setIsLoadingTrainings(false);
    }
  };

  const handleEnrollmentSuccess = () => {
    // Refresh the visitor list after successful enrollment
    fetchVisitors();
  };

  if (!user) {
    return null; // Layout will handle unauthorized access
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Training Management</h1>
        <p className="mt-2 text-gray-600">
          Manage training modules and visitor enrollments.
        </p>
      </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
            <div>
              <p className="font-medium">Error</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <BookOpen className="h-5 w-5 text-blue-600 mr-2" />
                Available Trainings
              </h2>

              {isLoadingTrainings ? (
                <div className="flex justify-center items-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  <span className="ml-2 text-gray-600">Loading trainings...</span>
                </div>
              ) : trainings?.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No trainings available</h3>
                  <p className="text-gray-500 mt-1">Create a new training to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {trainings?.map((training) => (
                    <div
                      key={training._id}
                      className={`p-4 rounded-md border ${
                        training.isActive ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">{training.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">{training.description}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit Training"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-800"
                            title="Delete Training"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center">
                        <span className="text-xs font-medium mr-2">Type:</span>
                        <span className="text-xs capitalize bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                          {training.type}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center">
                        <span className="text-xs font-medium mr-2">Status:</span>
                        {training.isActive ? (
                          <span className="text-xs flex items-center text-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </span>
                        ) : (
                          <span className="text-xs flex items-center text-red-600">
                            <XCircle className="h-3 w-3 mr-1" />
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6">
                <Link href="/admin/training/create" className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Training
                </Link>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <BookOpen className="h-5 w-5 text-blue-600 mr-2" />
                Enroll Visitor in Training
              </h2>

              <div className="mb-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search visitors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {isLoadingVisitors ? (
                <div className="flex justify-center items-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  <span className="ml-2 text-gray-600">Loading visitors...</span>
                </div>
              ) : filteredVisitors.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No visitors found</h3>
                  <p className="text-gray-500 mt-1">Try adjusting your search criteria.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {filteredVisitors.map((visitor) => (
                    <button
                      key={visitor._id}
                      onClick={() => setSelectedVisitorId(visitor._id)}
                      className={`text-left p-4 rounded-md border ${
                        selectedVisitorId === visitor._id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium text-gray-900">
                        {visitor.firstName} {visitor.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{visitor.email}</div>
                      {visitor.company && (
                        <div className="text-xs text-gray-400 mt-1">{visitor.company}</div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {selectedVisitorId && (
                <TrainingEnrollment
                  visitorId={selectedVisitorId}
                  onEnrollmentSuccess={handleEnrollmentSuccess}
                />
              )}
            </div>
          </div>
        </div>
    </>
  );
}
