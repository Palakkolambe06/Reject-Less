import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { parseRoute, AppRoute } from './routes';
import { storageService } from '../services/storageService';
import { DemoUser, DEMO_USERS } from '../types/user';
import { AuthModal } from '../components/auth/AuthModal';
import { ChatWidget } from '../components/chat/ChatWidget';

// Pages
import { LandingPage } from '../pages/LandingPage';
import { DashboardPage } from '../pages/DashboardPage';
import { BatchesPage } from '../pages/BatchesPage';
import { CreateBatchPage } from '../pages/CreateBatchPage';
import { BatchDetailsPage } from '../pages/BatchDetailsPage';
import { ReadinessPage } from '../pages/ReadinessPage';
import { RecipientsPage } from '../pages/RecipientsPage';
import { HandoverPage } from '../pages/HandoverPage';
import { HistoryPage } from '../pages/HistoryPage';
import { SettingsPage } from '../pages/SettingsPage';
import { NotificationsPage } from '../pages/NotificationsPage';
import { AiTriagePage } from '../pages/AiTriagePage';
import { MapPage } from '../pages/MapPage';
import { AssistantPage } from '../pages/AssistantPage';
import { IncomingOffersPage } from '../pages/recipient/IncomingOffersPage';
import { ReceiptConfirmationPage } from '../pages/recipient/ReceiptConfirmationPage';
import { MaterialRequirementsPage } from '../pages/recipient/MaterialRequirementsPage';
import { PickupQueuePage } from '../pages/operator/PickupQueuePage';

export const MainApp: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.hash ? window.location.hash.substring(1) : '/';
    }
    return '/';
  });

  const [route, setRoute] = useState<AppRoute>(() => parseRoute(currentPath));
  const [dataVersion, setDataVersion] = useState(0);
  const [activeUser, setActiveUser] = useState<DemoUser>(DEMO_USERS[0]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  useEffect(() => {
    const init = async () => {
      await storageService.initialize();
      const session = await storageService.getSession();
      setIsAuthenticated(session.isAuthenticated);
      if (session.user) {
        setActiveUser(session.user);
      } else {
        const defaultUser = await storageService.getActiveUser();
        setActiveUser(defaultUser);
      }
    };
    init();
  }, []);

  // Listen to hashchange
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.hash ? window.location.hash.substring(1) : '/';
      setCurrentPath(path);
      setRoute(parseRoute(path));
    };
    window.addEventListener('hashchange', handleLocationChange);
    return () => window.removeEventListener('hashchange', handleLocationChange);
  }, []);

  const navigate = (path: string) => {
    window.location.hash = path;
    setCurrentPath(path);
    setRoute(parseRoute(path));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectUser = async (user: DemoUser) => {
    await storageService.setActiveUser(user.id);
    setActiveUser(user);
    setIsAuthenticated(true);
    setDataVersion((v) => v + 1);
    // If switching role from a role-specific page, redirect to root dashboard
    if (currentPath.includes('/recipient/') || currentPath.includes('/operator/')) {
      navigate('/');
    }
  };

  const handleSignOut = async () => {
    await storageService.signOut();
    setIsAuthenticated(false);
    setDataVersion((v) => v + 1);
    navigate('/home');
  };

  const handleAuthSuccess = (user: DemoUser) => {
    setActiveUser(user);
    setIsAuthenticated(true);
    setAuthModalOpen(false);
    setDataVersion((v) => v + 1);
    navigate('/');
  };

  const handleOpenAuth = (mode?: 'signin' | 'signup') => {
    setAuthModalMode(mode || 'signin');
    setAuthModalOpen(true);
  };

  const handleRefreshData = () => {
    setDataVersion((v) => v + 1);
  };

  const effectiveUser = activeUser || DEMO_USERS[0];

  const renderCurrentPage = () => {
    switch (route.type) {
      case 'home':
        return (
          <LandingPage
            onNavigate={navigate}
            onOpenAuth={handleOpenAuth}
            isAuthenticated={isAuthenticated}
          />
        );
      case 'dashboard':
        if (!isAuthenticated) {
          return (
            <LandingPage
              onNavigate={navigate}
              onOpenAuth={handleOpenAuth}
              isAuthenticated={isAuthenticated}
            />
          );
        }
        return (
          <DashboardPage
            key={`${effectiveUser.id}-${dataVersion}`}
            activeUser={effectiveUser}
            onNavigate={navigate}
            onSelectBatch={(id) => navigate(`/batches/${id}`)}
          />
        );
      case 'batches':
        return (
          <BatchesPage
            key={dataVersion}
            onNavigate={navigate}
            onSelectBatch={(id) => navigate(`/batches/${id}`)}
          />
        );
      case 'create_batch':
        return (
          <CreateBatchPage
            onNavigate={navigate}
            onBatchCreated={(id) => navigate(`/batches/${id}`)}
          />
        );
      case 'batch_details':
        return (
          <BatchDetailsPage
            key={`${route.batchId}-${dataVersion}`}
            batchId={route.batchId}
            onNavigate={navigate}
            onSelectBatchForReadiness={(id) => navigate(`/readiness?batchId=${id}`)}
            onSelectBatchForMatching={(id) => navigate(`/recipients?batchId=${id}`)}
            onSelectBatchForHandover={(id) => navigate(`/handovers?batchId=${id}`)}
          />
        );
      case 'ai_triage':
        return <AiTriagePage onNavigate={navigate} />;
      case 'map':
        return <MapPage activeUser={effectiveUser} onNavigate={navigate} />;
      case 'assistant':
        return <AssistantPage activeUser={effectiveUser} onNavigate={navigate} />;
      case 'readiness':
        return (
          <ReadinessPage
            key={`${route.batchId || 'default'}-${dataVersion}`}
            initialBatchId={route.batchId}
            onNavigate={navigate}
            onProceedToMatching={(id) => navigate(`/recipients?batchId=${id}`)}
          />
        );
      case 'recipients':
        return (
          <RecipientsPage
            key={`${route.batchId || 'default'}-${dataVersion}`}
            initialBatchId={route.batchId}
            activeUser={effectiveUser}
            onNavigate={navigate}
            onRecipientMatched={(batchId, _recipientId) =>
              navigate(`/handovers?batchId=${batchId}`)
            }
          />
        );
      case 'handovers':
        return (
          <HandoverPage
            key={`${route.batchId || 'default'}-${dataVersion}`}
            initialBatchId={route.batchId}
            activeUser={effectiveUser}
            onNavigate={navigate}
          />
        );
      case 'notifications':
        return (
          <NotificationsPage
            key={`${effectiveUser.id}-${dataVersion}`}
            activeUser={effectiveUser}
            onNavigate={navigate}
          />
        );
      case 'history':
        return (
          <HistoryPage
            key={dataVersion}
            onNavigate={navigate}
            onSelectBatch={(id) => navigate(`/batches/${id}`)}
          />
        );
      case 'settings':
        return <SettingsPage onDataReset={handleRefreshData} />;

      // Recipient routes
      case 'recipient_offers':
      case 'recipient_accepted':
      case 'recipient_rejected':
        return (
          <IncomingOffersPage
            key={`${effectiveUser.id}-${dataVersion}`}
            activeUser={effectiveUser}
            onNavigate={navigate}
            onSelectBatch={(id) => navigate(`/batches/${id}`)}
          />
        );
      case 'recipient_receipt_confirmation':
        return (
          <ReceiptConfirmationPage
            key={`${effectiveUser.id}-${dataVersion}`}
            activeUser={effectiveUser}
            onNavigate={navigate}
            onSelectBatch={(id) => navigate(`/batches/${id}`)}
          />
        );
      case 'recipient_requirements':
        return <MaterialRequirementsPage activeUser={effectiveUser} />;
      case 'recipient_schedule':
        return (
          <PickupQueuePage
            key={`${effectiveUser.id}-${dataVersion}`}
            activeUser={effectiveUser}
            onNavigate={navigate}
            onSelectBatch={(id) => navigate(`/batches/${id}`)}
          />
        );

      // Operator routes
      case 'operator_pickup_queue':
      case 'operator_schedule':
      case 'operator_active':
      case 'operator_evidence':
      case 'operator_exceptions':
      case 'operator_completed':
        return (
          <PickupQueuePage
            key={`${effectiveUser.id}-${dataVersion}`}
            activeUser={effectiveUser}
            onNavigate={navigate}
            onSelectBatch={(id) => navigate(`/batches/${id}`)}
          />
        );
      default:
        return (
          <DashboardPage
            key={`${effectiveUser.id}-${dataVersion}`}
            activeUser={effectiveUser}
            onNavigate={navigate}
            onSelectBatch={(id) => navigate(`/batches/${id}`)}
          />
        );
    }
  };

  return (
    <>
      <AppLayout
        currentPath={currentPath}
        activeUser={isAuthenticated ? activeUser : null}
        isAuthenticated={isAuthenticated}
        onSelectUser={handleSelectUser}
        onNavigate={navigate}
        onOpenAuth={handleOpenAuth}
        onSignOut={handleSignOut}
        onRefreshData={handleRefreshData}
        showDemoNotice={true}
      >
        {renderCurrentPage()}
      </AppLayout>

      {/* Floating Gemini AI Waste Assistant */}
      <ChatWidget
        activeContext={{
          role: effectiveUser.role,
        }}
        onNavigate={navigate}
      />

      {/* Global Auth Modal for Sign In and Sign Up */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
};
