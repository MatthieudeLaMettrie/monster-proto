import { ClientBattleMessageSchema, calculateDamage, calculateStat, getSpecies, MOVES, SeededRng } from '@monster-proto/shared';
export class BattleRoom {
    state;
    env;
    players = new Map();
    turnNumber = 0;
    rng;
    constructor(state, env) {
        this.state = state;
        this.env = env;
        this.rng = new SeededRng(Date.now());
    }
    async fetch(request) {
        const url = new URL(request.url);
        if (url.pathname === '/ws') {
            const upgradeHeader = request.headers.get('Upgrade');
            if (upgradeHeader !== 'websocket') {
                return new Response('Expected WebSocket upgrade', { status: 426 });
            }
            const playerId = url.searchParams.get('playerId') || 'p-' + Math.random().toString(36).substring(7);
            const playerName = url.searchParams.get('name') || 'Trainer';
            const pair = new WebSocketPair();
            const [client, server] = [pair[0], pair[1]];
            this.handlePlayer(server, playerId, playerName);
            return new Response(null, { status: 101, webSocket: client });
        }
        return new Response('Not found', { status: 404 });
    }
    handlePlayer(ws, playerId, playerName) {
        ws.accept();
        const playerObj = {
            id: playerId,
            name: playerName,
            ws,
            team: [],
            activeIdx: 0
        };
        this.players.set(playerId, playerObj);
        ws.addEventListener('message', (event) => {
            try {
                const raw = JSON.parse(event.data.toString());
                const parsed = ClientBattleMessageSchema.safeParse(raw);
                if (!parsed.success)
                    return;
                const msg = parsed.data;
                if (msg.type === 'pick_team') {
                    playerObj.team = msg.monsters.map((m) => {
                        // Scale to PvP Level 15
                        const spec = getSpecies(m.speciesId);
                        return {
                            ...m,
                            level: 15,
                            currentHp: m.maxHp,
                            species: spec
                        };
                    });
                    this.checkTeamsReady();
                }
                else if (msg.type === 'action') {
                    playerObj.pendingAction = {
                        type: msg.actionType,
                        moveId: msg.moveId
                    };
                    this.checkTurnActions();
                }
            }
            catch {
                // ignore malformed packets
            }
        });
        ws.addEventListener('close', () => {
            this.players.delete(playerId);
            this.broadcast({
                type: 'battle_over',
                winnerId: 'none',
                reason: `${playerName} disconnected`
            });
        });
    }
    checkTeamsReady() {
        if (this.players.size < 2) {
            for (const p of this.players.values()) {
                this.send(p.ws, { type: 'waiting_for_opponent' });
            }
            return;
        }
        const playerList = Array.from(this.players.values());
        if (playerList.every((p) => p.team.length > 0)) {
            const [p1, p2] = playerList;
            this.send(p1.ws, {
                type: 'battle_ready',
                yourTeam: p1.team,
                opponentTeam: p2.team,
                opponentName: p2.name
            });
            this.send(p2.ws, {
                type: 'battle_ready',
                yourTeam: p2.team,
                opponentTeam: p1.team,
                opponentName: p1.name
            });
        }
    }
    checkTurnActions() {
        const playerList = Array.from(this.players.values());
        if (playerList.length < 2)
            return;
        if (playerList.every((p) => p.pendingAction !== undefined)) {
            this.resolveTurn(playerList[0], playerList[1]);
        }
    }
    resolveTurn(p1, p2) {
        this.turnNumber++;
        const events = [];
        // Handle forfeits
        if (p1.pendingAction?.type === 'forfeit') {
            this.broadcast({ type: 'battle_over', winnerId: p2.id, reason: `${p1.name} forfeited` });
            return;
        }
        if (p2.pendingAction?.type === 'forfeit') {
            this.broadcast({ type: 'battle_over', winnerId: p1.id, reason: `${p2.name} forfeited` });
            return;
        }
        const mon1 = p1.team[p1.activeIdx];
        const mon2 = p2.team[p2.activeIdx];
        const spd1 = calculateStat(mon1.species.baseStats.spd, 15);
        const spd2 = calculateStat(mon2.species.baseStats.spd, 15);
        const p1First = spd1 >= spd2;
        const first = p1First ? p1 : p2;
        const second = p1First ? p2 : p1;
        const firstMon = p1First ? mon1 : mon2;
        const secondMon = p1First ? mon2 : mon1;
        // Step 1: First actor attack
        this.executeAttack(first, second, firstMon, secondMon, events);
        // Step 2: Second actor attacks if still alive
        if (secondMon.currentHp > 0 && firstMon.currentHp > 0) {
            this.executeAttack(second, first, secondMon, firstMon, events);
        }
        // Reset pending actions
        p1.pendingAction = undefined;
        p2.pendingAction = undefined;
        // Broadcast turn results
        this.send(p1.ws, {
            type: 'turn_result',
            turnNumber: this.turnNumber,
            events,
            yourActiveHp: mon1.currentHp,
            opponentActiveHp: mon2.currentHp
        });
        this.send(p2.ws, {
            type: 'turn_result',
            turnNumber: this.turnNumber,
            events,
            yourActiveHp: mon2.currentHp,
            opponentActiveHp: mon1.currentHp
        });
        // Check match termination
        if (mon1.currentHp <= 0) {
            this.broadcast({ type: 'battle_over', winnerId: p2.id, reason: `${mon1.nickname} fainted!` });
        }
        else if (mon2.currentHp <= 0) {
            this.broadcast({ type: 'battle_over', winnerId: p1.id, reason: `${mon2.nickname} fainted!` });
        }
    }
    executeAttack(attacker, defender, atkMon, defMon, events) {
        const moveId = attacker.pendingAction?.moveId || atkMon.moves[0];
        const move = MOVES[moveId] || MOVES['tackle'];
        const ctx = {
            attackerLevel: 15,
            attackerAtk: calculateStat(atkMon.species.baseStats.atk, 15),
            attackerType: atkMon.species.type,
            defenderDef: calculateStat(defMon.species.baseStats.def, 15),
            defenderType: defMon.species.type,
            move
        };
        const res = calculateDamage(ctx, this.rng);
        if (res.hit) {
            defMon.currentHp = Math.max(0, defMon.currentHp - res.damage);
            events.push({
                actorId: attacker.id,
                action: move.name,
                damage: res.damage,
                fainted: defMon.currentHp === 0,
                message: `${attacker.name}'s ${atkMon.nickname} used ${move.name} dealing ${res.damage} damage!`
            });
        }
        else {
            events.push({
                actorId: attacker.id,
                action: move.name,
                damage: 0,
                fainted: false,
                message: `${attacker.name}'s ${atkMon.nickname} attacked with ${move.name} but missed!`
            });
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
    broadcast(msg) {
        const payload = JSON.stringify(msg);
        for (const p of this.players.values()) {
            try {
                p.ws.send(payload);
            }
            catch {
                // ignore closed sockets
            }
        }
    }
}
