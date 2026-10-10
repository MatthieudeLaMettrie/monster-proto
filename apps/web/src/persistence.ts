import { MonsterInstance, SaveStatePayload } from '@monster-proto/shared';

const TOKEN_KEY = 'monster_proto_guest_token';

export interface GameState {
  player: {
    id: string;
    name: string;
    avatar: number;
    posX: number;
    posY: number;
    championBeaten: number;
  };
  party: MonsterInstance[];
  box: MonsterInstance[];
  dex: Record<string, boolean>;
}

export class PersistenceManager {
  private static token: string | null = null;

  static getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem(TOKEN_KEY);
    }
    return this.token;
  }

  static setToken(token: string) {
    this.token = token;
    localStorage.setItem(TOKEN_KEY, token);
  }

  // Restore guest account with recovery code
  static restoreWithToken(token: string) {
    this.setToken(token);
  }

  // Authenticate or create guest session
  static async initSession(): Promise<{ playerId: string; name: string; isNew: boolean }> {
    const existing = this.getToken();
    const headers: Record<string, string> = {};
    if (existing) {
      headers['Authorization'] = `Bearer ${existing}`;
    }

    try {
      const res = await fetch('/api/session', {
        method: 'POST',
        headers
      });
      if (res.ok) {
        const data = await res.json();
        this.setToken(data.token);
        return { playerId: data.playerId, name: data.name, isNew: data.isNew };
      }
    } catch {
      // offline fallback
    }

    return { playerId: 'guest-local', name: 'Trainer', isNew: false };
  }

  // Load save state
  static async loadState(): Promise<GameState | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const res = await fetch('/api/state', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // offline
    }
    return null;
  }

  // Save current state snapshot
  static async saveState(state: SaveStatePayload): Promise<boolean> {
    const token = this.getToken();
    if (!token) return false;

    try {
      const res = await fetch('/api/state', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(state)
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}
