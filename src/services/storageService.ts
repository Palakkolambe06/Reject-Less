import { WasteBatch } from '../types/batch';
import { Recipient } from '../types/recipient';
import { InferenceConfig } from '../types/ai';
import { RecipientOffer } from '../types/offer';
import { AppNotification } from '../types/notification';
import { DemoUser, DEMO_USERS, AuthSession, UserRole } from '../types/user';
import { DEMO_BATCHES } from '../data/demoBatches';
import { DEMO_RECIPIENTS } from '../data/demoRecipients';
import { DEMO_OFFERS } from '../data/demoOffers';
import { DEMO_NOTIFICATIONS } from '../data/demoNotifications';

const STORAGE_KEYS = {
  BATCHES: 'rejectless_batches_v2',
  RECIPIENTS: 'rejectless_recipients_v2',
  OFFERS: 'rejectless_offers_v2',
  NOTIFICATIONS: 'rejectless_notifications_v2',
  ACTIVE_USER_ID: 'rejectless_active_user_v2',
  AI_CONFIG: 'rejectless_ai_config_v2',
  INITIALIZED: 'rejectless_seed_initialized_v2',
  AUTH_SESSION: 'rejectless_auth_session_v2',
  REGISTERED_USERS: 'rejectless_registered_users_v2',
};

export const DEFAULT_AI_CONFIG: InferenceConfig = {
  mode: 'demo_simulation',
  modelId: 'yangy50/garbage-classification-vit',
  apiEndpoint: 'https://api-inference.huggingface.co/models/yangy50/garbage-classification',
  apiToken: '',
  timeoutMs: 15000,
};

export interface AppSettings {
  aiConfig: InferenceConfig;
  activeUserId: string;
  showDemoNotice: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  aiConfig: DEFAULT_AI_CONFIG,
  activeUserId: 'USR-GEN-01', // Default to Waste Generator
  showDemoNotice: true,
};

class StorageService {
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  public async initialize(): Promise<void> {
    if (!this.isBrowser()) return;
    const initialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
    if (!initialized) {
      this.resetToDemoData();
    }
  }

  public resetToDemoData(): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(DEMO_BATCHES));
    localStorage.setItem(STORAGE_KEYS.RECIPIENTS, JSON.stringify(DEMO_RECIPIENTS));
    localStorage.setItem(STORAGE_KEYS.OFFERS, JSON.stringify(DEMO_OFFERS));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(DEMO_NOTIFICATIONS));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, 'USR-GEN-01');
    localStorage.setItem(STORAGE_KEYS.AI_CONFIG, JSON.stringify(DEFAULT_SETTINGS));
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    // Initialize session as authenticated with default generator for seamless dev/prototype preview
    localStorage.setItem(
      STORAGE_KEYS.AUTH_SESSION,
      JSON.stringify({
        isAuthenticated: true,
        user: DEMO_USERS[0],
        authMethod: 'demo_session',
      })
    );
  }

  public clearAllData(): void {
    if (!this.isBrowser()) return;
    localStorage.removeItem(STORAGE_KEYS.BATCHES);
    localStorage.removeItem(STORAGE_KEYS.RECIPIENTS);
    localStorage.removeItem(STORAGE_KEYS.OFFERS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER_ID);
    localStorage.removeItem(STORAGE_KEYS.INITIALIZED);
    localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
    localStorage.removeItem(STORAGE_KEYS.REGISTERED_USERS);
  }

  // --- AUTHENTICATION & SESSION MANAGEMENT ---
  public async getSession(): Promise<AuthSession> {
    if (!this.isBrowser()) {
      return { isAuthenticated: true, user: DEMO_USERS[0], authMethod: 'demo_session' };
    }
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.user) return parsed;
      } catch (e) {
        console.error('Failed to parse auth session', e);
      }
    }
    // Fallback default: Logged in as demo user 1
    const defaultUser = await this.getActiveUser();
    return { isAuthenticated: true, user: defaultUser, authMethod: 'demo_session' };
  }

  public async setSession(session: AuthSession): Promise<void> {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));
    if (session.user) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, session.user.id);
    }
  }

  public async signIn(email: string, _password?: string): Promise<{ success: boolean; user?: DemoUser; error?: string }> {
    const trimmedEmail = email.trim().toLowerCase();
    const allUsers = await this.getAllUsers();
    const found = allUsers.find(
      (u) => (u.email && u.email.toLowerCase() === trimmedEmail) || u.name.toLowerCase().includes(trimmedEmail)
    );

    if (found) {
      const session: AuthSession = {
        isAuthenticated: true,
        user: found,
        authMethod: 'demo_session',
      };
      await this.setSession(session);
      return { success: true, user: found };
    }

    // If not matched by exact email, allow sign in as generator if email is provided
    if (trimmedEmail.includes('@')) {
      const initials = trimmedEmail.substring(0, 2).toUpperCase();
      const tempUser: DemoUser = {
        id: `USR-${Date.now()}`,
        name: email.split('@')[0].replace('.', ' '),
        email: email,
        role: 'generator',
        organization: 'Independent Eco-Participant',
        avatarInitial: initials,
        description: 'Registered user via client sign-in portal',
      };
      const session: AuthSession = {
        isAuthenticated: true,
        user: tempUser,
        authMethod: 'demo_session',
      };
      await this.setSession(session);
      return { success: true, user: tempUser };
    }

    return {
      success: false,
      error: 'Account not recognized. Please use one of the available demo accounts or sign up below.',
    };
  }

  public async signUp(
    name: string,
    email: string,
    role: UserRole,
    organization?: string
  ): Promise<{ success: boolean; user?: DemoUser; error?: string }> {
    if (role === 'admin') {
      return {
        success: false,
        error: 'Administrator credentials cannot be self-provisioned via public registration.',
      };
    }

    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'US';

    const newUser: DemoUser = {
      id: `USR-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      role,
      organization: organization || (role === 'generator' ? 'Registered Generator Bay' : role === 'recipient' ? 'Local Material Recycler' : 'Express Logistics Carrier'),
      avatarInitial: initials,
      description: `Registered as ${role} for RejectLess circular recovery`,
    };

    // Save to registered users list
    const registered = await this.getRegisteredUsers();
    registered.push(newUser);
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(registered));
    }

    const session: AuthSession = {
      isAuthenticated: true,
      user: newUser,
      authMethod: 'demo_session',
    };
    await this.setSession(session);
    return { success: true, user: newUser };
  }

  public async signOut(): Promise<void> {
    if (!this.isBrowser()) return;
    const session: AuthSession = {
      isAuthenticated: false,
      user: null,
      authMethod: 'guest',
    };
    localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));
  }

  public async getRegisteredUsers(): Promise<DemoUser[]> {
    if (!this.isBrowser()) return [];
    const raw = localStorage.getItem(STORAGE_KEYS.REGISTERED_USERS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  public async getAllUsers(): Promise<DemoUser[]> {
    const custom = await this.getRegisteredUsers();
    return [...DEMO_USERS, ...custom];
  }

  // --- ACTIVE USER & ROLE ---
  public async getActiveUser(): Promise<DemoUser> {
    if (!this.isBrowser()) return DEMO_USERS[0];
    const storedId = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID);
    const all = await this.getAllUsers();
    const user = all.find((u) => u.id === storedId);
    return user || DEMO_USERS[0];
  }

  public async setActiveUser(userId: string): Promise<DemoUser> {
    const all = await this.getAllUsers();
    const user = all.find((u) => u.id === userId) || DEMO_USERS[0];
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, user.id);
      localStorage.setItem(
        STORAGE_KEYS.AUTH_SESSION,
        JSON.stringify({
          isAuthenticated: true,
          user,
          authMethod: 'demo_session',
        })
      );
    }
    return user;
  }

  // --- BATCHES ---
  public async getBatches(): Promise<WasteBatch[]> {
    if (!this.isBrowser()) return DEMO_BATCHES;
    const raw = localStorage.getItem(STORAGE_KEYS.BATCHES);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error('Failed to parse batches from localStorage', e);
      return [];
    }
  }

  public async getBatchById(id: string): Promise<WasteBatch | null> {
    const batches = await this.getBatches();
    return batches.find((b) => b.id === id) || null;
  }

  public async saveBatches(batches: WasteBatch[]): Promise<void> {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(batches));
  }

  public async saveBatch(batch: WasteBatch): Promise<WasteBatch> {
    const batches = await this.getBatches();
    const index = batches.findIndex((b) => b.id === batch.id);
    if (index >= 0) {
      batches[index] = { ...batch, updatedAt: new Date().toISOString() };
    } else {
      batches.unshift(batch);
    }
    await this.saveBatches(batches);
    return batch;
  }

  public async deleteBatch(id: string): Promise<boolean> {
    const batches = await this.getBatches();
    const filtered = batches.filter((b) => b.id !== id);
    if (filtered.length !== batches.length) {
      await this.saveBatches(filtered);
      return true;
    }
    return false;
  }

  // --- RECIPIENTS ---
  public async getRecipients(): Promise<Recipient[]> {
    if (!this.isBrowser()) return DEMO_RECIPIENTS;
    const raw = localStorage.getItem(STORAGE_KEYS.RECIPIENTS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error('Failed to parse recipients from localStorage', e);
      return [];
    }
  }

  public async getRecipientById(id: string): Promise<Recipient | null> {
    const recipients = await this.getRecipients();
    return recipients.find((r) => r.id === id) || null;
  }

  public async saveRecipients(recipients: Recipient[]): Promise<void> {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.RECIPIENTS, JSON.stringify(recipients));
  }

  // --- OFFERS ---
  public async getOffers(): Promise<RecipientOffer[]> {
    if (!this.isBrowser()) return DEMO_OFFERS;
    const raw = localStorage.getItem(STORAGE_KEYS.OFFERS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  public async saveOffers(offers: RecipientOffer[]): Promise<void> {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.OFFERS, JSON.stringify(offers));
  }

  public async saveOffer(offer: RecipientOffer): Promise<RecipientOffer> {
    const offers = await this.getOffers();
    const idx = offers.findIndex((o) => o.id === offer.id);
    if (idx >= 0) {
      offers[idx] = offer;
    } else {
      offers.unshift(offer);
    }
    await this.saveOffers(offers);
    return offer;
  }

  // --- NOTIFICATIONS ---
  public async getNotifications(): Promise<AppNotification[]> {
    if (!this.isBrowser()) return DEMO_NOTIFICATIONS;
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  public async saveNotifications(notifs: AppNotification[]): Promise<void> {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  }

  public async addNotification(notif: AppNotification): Promise<void> {
    const notifs = await this.getNotifications();
    notifs.unshift(notif);
    await this.saveNotifications(notifs);
  }

  public async markNotificationRead(id: string): Promise<void> {
    const notifs = await this.getNotifications();
    const idx = notifs.findIndex((n) => n.id === id);
    if (idx >= 0) {
      notifs[idx].isRead = true;
      await this.saveNotifications(notifs);
    }
  }

  // --- SETTINGS ---
  public async getSettings(): Promise<AppSettings> {
    if (!this.isBrowser()) return DEFAULT_SETTINGS;
    const raw = localStorage.getItem(STORAGE_KEYS.AI_CONFIG);
    if (!raw) return DEFAULT_SETTINGS;
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  public async saveSettings(settings: AppSettings): Promise<void> {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.AI_CONFIG, JSON.stringify(settings));
  }

  // --- BACKUP & EXPORT ---
  public async exportAllJson(): Promise<string> {
    const batches = await this.getBatches();
    const recipients = await this.getRecipients();
    const offers = await this.getOffers();
    const notifications = await this.getNotifications();
    const settings = await this.getSettings();
    const session = await this.getSession();
    return JSON.stringify(
      {
        version: '2.5-auth-redesign',
        exportedAt: new Date().toISOString(),
        session,
        batches,
        recipients,
        offers,
        notifications,
        settings,
      },
      null,
      2
    );
  }
}

export const storageService = new StorageService();
