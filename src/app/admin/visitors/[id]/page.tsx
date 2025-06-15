'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { newVisitorAPI, visitorAPI, VisitorForm } from '@/lib/api';
import { ArrowLeft, QrCode, LogOut, Clock, BookOpen, CreditCard, FileText, AlertCircle } from 'lucide-react';
import QRCodeDisplay from '@/components/QRCodeDisplay';
import EnhancedTrainingModule from '@/components/EnhancedTrainingModule';
import DocumentUploader from '@/components/DocumentUploader';
import EnhancedDocumentViewer from '@/components/EnhancedDocumentViewer';

export default function VisitorDetails() {
  const [visitor, setVisitor] = useState<VisitorForm | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showQrCode, setShowQrCode] = useState(false);
  const [showTraining, setShowTraining] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [showDocuments, setShowDocuments] = useState(false);
  const [documentsUpdated, setDocumentsUpdated] = useState(0);

  const { id } = useParams();
  const { user, token, logout } = useAuth();
  const router = useRouter();

  // Redirect if not logged in
  useEffect(() => {
    if (!user || !token) {
      router.push('/login');
    }
  }, [user, token, router]);

  useEffect(() => {
    const fetchVisitor = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const visitorId = Array.isArray(id) ? id[0] : id;

        const data = await newVisitorAPI.getSingleVisitorById(visitorId);
        console.log(data);
        
        setVisitor(data);
      
      } catch (err) {
        console.error('Error fetching visitor:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch visitor details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVisitor();
  }, [id, router]);

  const handleCheckIn = async () => {
    if (!visitor || !id || !token) return;

    try {
      setCheckingIn(true);
      setError('');
      setSuccess('');

      const visitorId = Array.isArray(id) ? id[0] : id;
      await visitorAPI.checkInVisitor(visitorId, token);

      // Update visitor status locally
      setVisitor(prev => prev ? {
        ...prev,
        status: 'checked-in',
        checkInTime: new Date().toISOString()
      } : null);

      setSuccess('Visitor checked in successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check in visitor');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    if (!visitor || !id || !token) return;

    try {
      setCheckingOut(true);
      setError('');
      setSuccess('');

      const visitorId = Array.isArray(id) ? id[0] : id;
      await visitorAPI.checkOutVisitor(visitorId, token);

      // Update visitor status locally
      setVisitor(prev => prev ? {
        ...prev,
        status: 'checked-out',
        checkOutTime: new Date().toISOString()
      } : null);

      setSuccess('Visitor checked out successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check out visitor');
    } finally {
      setCheckingOut(false);
    }
  };

  const handleDocumentChange = () => {
    // Increment to trigger a re-render of the DocumentList component
    setDocumentsUpdated(prev => prev + 1);
    setSuccess('Document operation completed successfully');
  };

  if (!user || !token) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-0">
      {/* QR Code Modal */}
      {showQrCode && visitor && token && (
        <QRCodeDisplay
          visitorId={visitor._id}
          token={token}
          onClose={() => setShowQrCode(false)}
        />
      )}

      {/* Training Modal */}
      {showTraining && visitor && token && (
        <EnhancedTrainingModule
          visitorId={visitor._id}
          token={token}
          onComplete={(passed) => {
            setShowTraining(false);
            if (passed) {
              setSuccess('Training completed successfully!');
              // Update visitor training status locally
              setVisitor(prev => prev ? {
                ...prev,
                trainingCompleted: true
              } : null);
            }
          }}
          onClose={() => setShowTraining(false)}
        />
      )}

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/admin/dashboard"
            className="flex items-center text-blue-900 hover:text-blue-700"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Dashboard
          </Link>

          <button
            onClick={() => {
              logout();
              router.push('/');
            }}
            className="flex items-center text-red-600 hover:text-red-800"
          >
            <LogOut className="mr-2 h-5 w-5" />
            Logout
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 bg-blue-900 text-white">
            <h1 className="text-2xl font-bold">Visitor Details</h1>
          </div>

          {isLoading ? (
            <div className="p-6 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="p-6">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            </div>
          ) : success ? (
            <div className="p-6">
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                {success}
              </div>
              {visitor && (
                <VisitorInfo visitor={visitor} />
              )}
            </div>
          ) : visitor ? (
            <div className="p-6">
              <VisitorInfo visitor={visitor} />

              <div className="mt-8 flex flex-wrap gap-4">
                <button
                  onClick={() => setShowQrCode(true)}
                  className="flex items-center bg-blue-900 text-white px-2 md:px-4 py-1 md:py-2 rounded-lg text-sm md:text-base"
                >
                  <QrCode className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                  Show QR Code
                </button>

                <Link
                  href={`/badge/${visitor._id}`}
                  className="flex items-center bg-indigo-600 text-white px-2 md:px-4 py-1 md:py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm md:text-base"
                >
                  <CreditCard className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                  View Badge
                </Link>

                <button
                  onClick={() => setShowTraining(true)}
                  className={`flex items-center ${visitor.trainingCompleted ? 'bg-green-600' : 'bg-yellow-600'} text-white px-2 md:px-4 py-1 md:py-2 rounded-lg text-sm ms:text-base`}
                >
                  <BookOpen className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                  {visitor.trainingCompleted ? 'Training Completed' : 'Take Safety Training'}
                </button>
                {visitor.visitorCategory === "contractor" && (
                  <button
                  onClick={() => setShowDocuments(!showDocuments)}
                  className="flex items-center bg-purple-600 text-white px-2 md:px-4 py-1 md:py-2 rounded-lg hover:bg-purple-700 text-sm md:text-base"
                >
                  <FileText className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                  {showDocuments ? 'Hide Documents' : 'Manage Documents'}
                  {showDocuments && (
                    <div>
                      {documentsUpdated}
                    </div>
                  )}
                </button>
                )}
                

                {visitor.status === 'approved' && (
                  <button
                    onClick={handleCheckIn}
                    disabled={checkingIn || (visitor.trainingCompleted === false)}
                    className="flex items-center bg-green-600 text-white px-2 md:px-4 py-1 lg:py-2 rounded-lg disabled:bg-green-300 text-sm md:text-base"
                    title={visitor.trainingCompleted === false ? 'Complete safety training before check-in' : ''}
                  >
                    <Clock className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                    {checkingIn ? 'Processing...' : 'Check In'}
                  </button>
                )}

                {visitor.status === 'pending' && (
                  <div className="flex items-center bg-yellow-100 text-yellow-800 px-2 md:px-4 py-1 md:py-2 rounded-lg">
                    <AlertCircle className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                    Pending Approval
                  </div>
                )}

                {visitor.status === 'checked-in' && (
                  <button
                    onClick={handleCheckOut}
                    disabled={checkingOut}
                    className="flex items-center bg-red-600 text-white px-2 md:px-4 py-1 md:py-2 rounded-lg disabled:bg-red-300 text-sm md:text-base"
                  >
                    <LogOut className="mr-2 w-4 h-4 md:h-5 md:w-5" />
                    {checkingOut ? 'Processing...' : 'Check Out'}
                  </button>
                )}
              </div>

              {/* Document Management Section */}
              {showDocuments && (
                <div className="mt-8 space-y-6">
                  <div className="border-t border-gray-200 pt-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <FileText className="h-5 w-5 text-purple-600 mr-2" />
                      Document Management
                    </h2>

                    <div className="space-y-6">
                      <DocumentUploader
                        visitorId={visitor._id}
                        onUploadSuccess={handleDocumentChange}
                      />

                      <EnhancedDocumentViewer
                        visitorId={visitor._id}
                        onDocumentDeleted={handleDocumentChange}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6">
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                No visitor information found.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function VisitorInfo({ visitor }: { visitor: VisitorForm }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="font-medium">{visitor.firstName} {visitor.lastName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{visitor.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Phone</p>
            <p className="font-medium">{visitor.phone}</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Visit Information</h2>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-500">Purpose</p>
            <p className="font-medium">{visitor.purpose}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Host</p>
            <p className="font-medium">{visitor.hostEmployee}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Department</p>
            <p className="font-medium">{visitor.department || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Meeting Location</p>
            <p className="font-medium">{visitor.meetingLocation || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Visit Start Date & Time</p>
            <p className="font-medium">{visitor.visitStartDate ? new Date(visitor.visitStartDate).toLocaleString() : 'Not specified'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Visit End Date & Time</p>
            <p className="font-medium">{visitor.visitEndDate ? new Date(visitor.visitEndDate).toLocaleString() : 'Not specified'}</p>
          </div>
            <div>
              <p className="text-sm text-gray-500">Site Location</p>
              <p className="font-medium">{visitor.siteLocation}</p>
            </div>
      
          <div>
            <p className="text-sm text-gray-500">Visitor Category</p>
            <p className="font-medium">{visitor.visitorCategory || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className="font-medium">
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                ${visitor.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  visitor.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                  visitor.status === 'checked-in' ? 'bg-green-100 text-green-800' :
                  visitor.status === 'checked-out' ? 'bg-gray-100 text-gray-800' :
                  'bg-red-100 text-red-800'}`}>
                {visitor.status}
              </span>
            </p>
          </div>
          {visitor.visitorCategory === 'contractor' && (
            <div>
            <p className="text-sm text-gray-500">Training</p>
            <p className="font-medium">
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                ${visitor.trainingCompleted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {visitor.trainingCompleted ? 'Completed' : 'Required'}
              </span>
            </p>
          </div>
          )}
          
          {visitor.checkInTime && (
            <div>
              <p className="text-sm text-gray-500">Check-in Time</p>
              <p className="font-medium">{new Date(visitor.checkInTime).toLocaleString()}</p>
            </div>
          )}
          {visitor.checkOutTime && (
            <div>
              <p className="text-sm text-gray-500">Check-out Time</p>
              <p className="font-medium">{new Date(visitor.checkOutTime).toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
