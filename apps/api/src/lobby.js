import { ClientLobbyMessageSchema } from '@monster-proto/shared';
export class LobbyRoom {
    state;
    env;
    sessions = new Map();
    matchQueue = [];
    constructor(state, env) {
        this.state = state;
        this.env = env;
    }
    async fetch(request) {
        const url = new URL(request.url);
        if (url.pathname === '/ws') {
            const upgradeHeader = request.headers.get('Upgrade');
            if (upgradeHeader !== 'websocket') {
                return new Response('Expected WebSocket upgrade', { status: 426 });
            }
            const playerId = url.searchParams.get('playerId') || 'guest-' + Math.random().toString(36).substring(7);
            const playerName = url.searchParams.get('name') || 'Trainer';
            const pair = new WebSocketPair();
            const [client, server] = [pair[0], pair[1]];
            this.handleSession(server, {
                id: playerId,
                name: playerName,
                avatar: 0,
                x: 5,
                y: 5
            });
            return new Response(null, { status: 101, webSocket: client });
        }
        return new Response('Not found', { status: 404 });
    }
    handleSession(ws, player) {
        ws.accept();
        this.sessions.set(ws, { player });
        // Send snapshot of current players to newcomer
        const playersList = [];
        for (const s of this.sessions.values()) {
            playersList.push(s.player);
        }
        this.send(ws, { type: 'presence_snapshot', players: playersList });
        // Notify other players
        this.broadcast({ type: 'player_joined', player }, ws);
        ws.addEventListener('message', async (event) => {
            try {
                const raw = JSON.parse(event.data.toString());
                const parsed = ClientLobbyMessageSchema.safeParse(raw);
                if (!parsed.success)
                    return;
                const msg = parsed.data;
                if (msg.type === 'move') {
                    player.x = msg.x;
                    player.y = msg.y;
                    this.broadcast({ type: 'player_moved', id: player.id, x: msg.x, y: msg.y }, ws);
                }
                else if (msg.type === 'quick_match') {
                    this.handleQuickMatch(player.id, ws);
                }
                else if (msg.type === 'challenge') {
                    this.forwardChallenge(player, msg.targetPlayerId);
                }
                else if (msg.type === 'respond_challenge') {
                    this.handleChallengeResponse(player, msg.fromPlayerId, msg.accepted);
                }
            }
            catch {
                // ignore malformed packets
            }
        });
        ws.addEventListener('close', () => {
            this.sessions.delete(ws);
            this.matchQueue = this.matchQueue.filter(q => q.ws !== ws);
            this.broadcast({ type: 'player_left', id: player.id });
        });
    }
    handleQuickMatch(playerId, ws) {
        this.matchQueue = this.matchQueue.filter(q => q.playerId !== playerId);
        if (this.matchQueue.length > 0) {
            const opponent = this.matchQueue.shift();
            const battleId = crypto.randomUUID();
            const p1Session = this.sessions.get(ws);
            const p2Session = this.sessions.get(opponent.ws);
            this.send(ws, {
                type: 'match_start',
                battleId,
                opponentName: p2Session?.player.name || 'Opponent'
            });
            this.send(opponent.ws, {
                type: 'match_start',
                battleId,
                opponentName: p1Session?.player.name || 'Opponent'
            });
        }
        else {
            this.matchQueue.push({ playerId, ws });
        }
    }
    forwardChallenge(challenger, targetPlayerId) {
        for (const [socket, session] of this.sessions.entries()) {
            if (session.player.id === targetPlayerId) {
                this.send(socket, {
                    type: 'challenged',
                    fromPlayerId: challenger.id,
                    fromPlayerName: challenger.name
                });
                break;
            }
        }
    }
    handleChallengeResponse(responder, fromPlayerId, accepted) {
        for (const [socket, session] of this.sessions.entries()) {
            if (session.player.id === fromPlayerId) {
                if (accepted) {
                    const battleId = crypto.randomUUID();
                    this.send(socket, { type: 'match_start', battleId, opponentName: responder.name });
                    // find responder socket
                    for (const [rSocket, rSession] of this.sessions.entries()) {
                        if (rSession.player.id === responder.id) {
                            this.send(rSocket, { type: 'match_start', battleId, opponentName: session.player.name });
                            break;
                        }
                    }
                }
                else {
                    this.send(socket, { type: 'challenge_declined', fromPlayerName: responder.name });
                }
                break;
            }
        }
    }
    send(ws, msg) {
        try {
            ws.send(JSON.stringify(msg));
        }
        catch {
            // socket closed
        }
    }
    broadcast(msg, ignore) {
        const payload = JSON.stringify(msg);
        for (const ws of this.sessions.keys()) {
            if (ws !== ignore) {
                try {
                    ws.send(payload);
                }
                catch {
                    // ignore dead sockets
                }
            }
        }
    }
}
