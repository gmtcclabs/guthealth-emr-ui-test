import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { UserState, TestStatus, ConsultationStatus, BrtStatus, ProbioticsStatus, PurchaseOption, Notification } from './types';

interface StoreContextType {
  user: UserState;
  buyItem: (option: PurchaseOption) => void;
  advanceTestStatus: (status: TestStatus) => void;
  scheduleConsultation: (date: Date) => void;
  scheduleBrt: (date: Date) => void;
  skipBrt: () => void;
  completeConsultation: () => void;
  completeQuestionnaire: () => void;
  purchaseProbiotics: () => void;
  shipProbiotics: () => void;
  markNotificationRead: (id: string) => void;
  resetSimulation: () => void;
}

const defaultUser: UserState = {
  name: 'Alex Doe',
  purchaseHistory: [],
  testStatus: TestStatus.NONE,
  consultationStatus: ConsultationStatus.NONE,
  brtStatus: BrtStatus.NONE,
  probioticsStatus: ProbioticsStatus.NONE,
  questionnaireStatus: { completed: false },
  notifications: [],
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserState>(() => {
    const saved = localStorage.getItem('gutHealthState');
    return saved ? JSON.parse(saved) : defaultUser;
  });

  useEffect(() => {
    localStorage.setItem('gutHealthState', JSON.stringify(user));
  }, [user]);

  const addNotification = (title: string, message: string, type: 'EMAIL' | 'SMS' | 'WHATSAPP' = 'EMAIL') => {
    setUser(prev => ({
      ...prev,
      notifications: [
        {
          id: Math.random().toString(36).substr(2, 9),
          type,
          title,
          message,
          timestamp: new Date().toISOString(),
          read: false
        },
        ...prev.notifications
      ]
    }));
  };

  const buyItem = (option: PurchaseOption) => {
    setUser((prev) => {
      let nextConsultStatus = prev.consultationStatus;
      let nextBrtStatus = prev.brtStatus;
      let nextTestStatus = prev.testStatus;

      if (option === PurchaseOption.BUNDLE) {
        // Option B: Complete Action Plan
        nextTestStatus = TestStatus.ORDERED;
        nextConsultStatus = ConsultationStatus.PURCHASED;
        nextBrtStatus = BrtStatus.OPTIONAL;
      } else if (option === PurchaseOption.TEST_ONLY) {
        // Option A: Discovery
        nextTestStatus = TestStatus.ORDERED;
        nextConsultStatus = ConsultationStatus.NONE;
        nextBrtStatus = BrtStatus.NONE;
      } else if (option === PurchaseOption.UPGRADE) {
        // Upgrade from Test Only
        nextConsultStatus = ConsultationStatus.PURCHASED;
        nextBrtStatus = BrtStatus.OPTIONAL;
      }

      return {
        ...prev,
        purchaseHistory: [...prev.purchaseHistory, option],
        testStatus: nextTestStatus,
        consultationStatus: nextConsultStatus,
        brtStatus: nextBrtStatus,
      };
    });

    if (option === PurchaseOption.BUNDLE) {
      addNotification("Order Confirmed #HK-8821", "Thank you for choosing the Complete Gut Restoration Plan. Your journey starts now.", "EMAIL");
      addNotification("Action Required: Health Questionnaire", "Please complete your pre-consultation intake form via our secure portal.", "WHATSAPP");
    } else if (option === PurchaseOption.TEST_ONLY) {
      addNotification("Order Confirmed #HK-8822", "Thank you for purchasing the Discovery Kit. Your kit is being prepared.", "EMAIL");
      addNotification("Action Required: Health Questionnaire", "Please complete your intake form so we can contextualize your results.", "WHATSAPP");
    } else if (option === PurchaseOption.UPGRADE) {
      addNotification("Upgrade Confirmed", "You have successfully upgraded to the Clinical Consultation plan.", "EMAIL");
    }
  };

  const advanceTestStatus = (status: TestStatus) => {
    setUser((prev) => {
      const updates: Partial<UserState> = { testStatus: status };
      
      // Generate mock results if we hit READY
      if (status === TestStatus.READY && !prev.labResults) {
        updates.labResults = {
          diversityScore: 65,
          goodBacteria: 72,
          badBacteria: 15,
          sensitivity: 'Gluten Mild',
          timestamp: new Date().toISOString()
        };
      }
      return { ...prev, ...updates };
    });

    // Trigger Notifications
    switch(status) {
      case TestStatus.RECEIVED:
        addNotification("Kit Delivered", "Your test kit has arrived at your shipping address.", "SMS");
        break;
      case TestStatus.MAILED:
        addNotification("Sample Mailed", "We've detected your return shipment.", "EMAIL");
        break;
      case TestStatus.PROCESSING:
        addNotification("Lab Received Sample", "Your sample has arrived at our lab and is being processed.", "EMAIL");
        break;
      case TestStatus.READY:
        addNotification("Results Ready", "Your gut microbiome analysis is complete. Log in to view details.", "SMS");
        break;
    }
  };

  const scheduleConsultation = (date: Date) => {
    setUser(prev => ({
      ...prev,
      consultationStatus: ConsultationStatus.SCHEDULED,
      consultationDate: date
    }));
    addNotification("Consultation Confirmed", `Your appointment with Dr. Chen is set for ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}.`, "EMAIL");
  };

  const scheduleBrt = (date: Date) => {
    setUser(prev => ({
      ...prev,
      brtStatus: BrtStatus.SCHEDULED,
      brtDate: date
    }));
    addNotification("BRT Session Confirmed", "Your complimentary Bio-Resonance Therapy session is confirmed.", "EMAIL");
  };

  const skipBrt = () => {
    setUser(prev => ({
      ...prev,
      brtStatus: BrtStatus.SKIPPED
    }));
  };

  const completeConsultation = () => {
    setUser(prev => ({
      ...prev,
      consultationStatus: ConsultationStatus.COMPLETED,
      probioticsStatus: ProbioticsStatus.RECOMMENDED
    }));
    addNotification("Protocol Ready", "Your specialist has prepared your personalized probiotic plan.", "EMAIL");
  };

  const completeQuestionnaire = () => {
    setUser(prev => ({
      ...prev,
      questionnaireStatus: { completed: true, date: new Date().toISOString() }
    }));
    addNotification("Questionnaire Received", "Thank you for submitting your health history.", "EMAIL");
  };

  const purchaseProbiotics = () => {
    setUser(prev => ({
      ...prev,
      probioticsStatus: ProbioticsStatus.PAID
    }));
    addNotification("Probiotics Ordered", "Your personalized supplements are being compounded.", "EMAIL");
  };

  const shipProbiotics = () => {
    setUser(prev => ({
      ...prev,
      probioticsStatus: ProbioticsStatus.SHIPPED
    }));
    addNotification("Order Shipped", "Your probiotics are on the way! Tracking: HK-99212", "SMS");
  };

  const markNotificationRead = (id: string) => {
    setUser(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => n.id === id ? { ...n, read: true } : n)
    }));
  };

  const resetSimulation = () => {
    setUser(defaultUser);
    localStorage.removeItem('gutHealthState');
  };

  return (
    <StoreContext.Provider value={{ 
      user, 
      buyItem, 
      advanceTestStatus, 
      scheduleConsultation, 
      scheduleBrt, 
      skipBrt,
      completeConsultation,
      completeQuestionnaire,
      purchaseProbiotics,
      shipProbiotics,
      markNotificationRead,
      resetSimulation 
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};