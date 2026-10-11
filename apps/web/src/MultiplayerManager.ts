import { PlayerPresence, ServerLobbyMessage, ClientLobbyMessage } from '@monster-proto/shared';
import { PersistenceManager } from './persistence.js';

type Listener = (players: PlayerPresence[]) => void;
type ChallengeListener = (fromId: string, fromName: string) => void;
type MatchStartListener = (battleId: string, opponentName: string) => void;

export class MultiplayerManager {
  private static instance: MultiplayerManager;
  private ws: WebSocket | null = null;
  private players: Map<string, PlayerPresence> = new Map();
  private updateListeners: Listener[] = [];
  private challengeListeners: ChallengeListener[] = [];
  private matchStartListeners: MatchStartListener[] = [];
  private isConnecting = false;

  private constructor() {}

  public static getInstance(): MultiplayerManager {
    if (!this.instance) {
      this.instance = new MultiplayerManager();
    }
    return this.instance;
  }

  public connect() {
    if (this.ws || this.isConnecting) return;
    this.isConnecting = true;

    const token = PersistenceManager.getToken();
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const url = `${protocol}//${host}/ws/lobby${token ? `?token=${encodeURIComponent(token)}` : ''}`;

    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.isConnecting = false;
      };

      this.ws.onmessage = (event) => {
        try {
          const msg: ServerLobbyMessage = JSON.parse(event.data);
          this.handleServerMessage(msg);
        } catch {}
      };

      this.ws.onclose = () => {
        this.ws = null;
        this.isConnecting = false;
        this.players.clear();
        this.notifyUpdate();
      };

      this.ws.onerror = () => {
        this.isConnecting = false;
      };
    } catch {
      this.isConnecting = false;
    }
  }

  private handleServerMessage(msg: ServerLobbyMessage) {
    if (msg.type === 'presence_snapshot') {
      this.players.clear();
      msg.players.forEach(p => this.players.set(p.id, p));
      this.notifyUpdate();
    } else if (msg.type === 'player_joined') {
      this.players.set(msg.player.id, msg.player);
      this.notifyUpdate();
    } else if (msg.type === 'player_moved') {
      const p = this.players.get(msg.id);
      if (p) {
        p.x = msg.x;
        p.y = msg.y;
        this.notifyUpdate();
      }
    } else if (msg.type === 'player_left') {
      this.players.delete(msg.id);
      this.notifyUpdate();
    } else if (msg.type === 'challenged') {
      this.challengeListeners.forEach(cb => cb(msg.fromPlayerId, msg.fromPlayerName));
    } else if (msg.type === 'match_start') {
      this.matchStartListeners.forEach(cb => cb(msg.battleId, msg.opponentName));
    }
  }

  public sendMove(x: number, y: number) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    const payload: ClientLobbyMessage = { type: 'move', x, y };
    this.ws.send(JSON.stringify(payload));
  }

  public challengePlayer(targetPlayerId: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    const payload: ClientLobbyMessage = { type: 'challenge', targetPlayerId };
    this.ws.send(JSON.stringify(payload));
  }

  public respondChallenge(fromPlayerId: string, accepted: boolean) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    const payload: ClientLobbyMessage = { type: 'respond_challenge', fromPlayerId, accepted };
    this.ws.send(JSON.stringify(payload));
  }

  public onPlayersUpdated(cb: Listener) {
    this.updateListeners.push(cb);
  }

  public onChallenged(cb: ChallengeListener) {
    this.challengeListeners.push(cb);
  }

  public onMatchStart(cb: MatchStartListener) {
    this.matchStartListeners.push(cb);
  }

  private notifyUpdate() {
    const list = Array.from(this.players.values());
    this.updateListeners.forEach(cb => cb(list));
  }

  public getOtherPlayers(): PlayerPresence[] {
    return Array.from(this.players.values());
  }
}
