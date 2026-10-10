import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { ELEMENT_TYPES, SaveStateSchema } from '@monster-proto/shared';
import { LobbyRoom } from './lobby.js';
import { BattleRoom } from './battle.js';
export { LobbyRoom, BattleRoom };
const app = new Hono();
app.use('*', cors());
// Upgrade routing to Lobby DO
app.get('/ws/lobby', async (c) => {
    const id = c.env.LOBBY_DO.idFromName('global-lobby');
    const obj = c.env.LOBBY_DO.get(id);
    const url = new URL(c.req.url);
    url.pathname = '/ws';
    return obj.fetch(new Request(url.toString(), c.req.raw));
});
// Upgrade routing to Battle DO
app.get('/ws/battle/:id', async (c) => {
    const battleId = c.req.param('id');
    const id = c.env.BATTLE_DO.idFromName(battleId);
    const obj = c.env.BATTLE_DO.get(id);
    const url = new URL(c.req.url);
    url.pathname = '/ws';
    return obj.fetch(new Request(url.toString(), c.req.raw));
});
// Health check
app.get('/api/health', (c) => {
    return c.json({
        status: 'ok',
        game: 'Monster Proto',
        supportedTypes: ELEMENT_TYPES,
        timestamp: new Date().toISOString()
    });
});
// Helper: hash guest token with SHA-256
async function hashToken(token) {
    const enc = new TextEncoder().encode(token);
    const buf = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
}
// 1. Session endpoint (create or restore guest)
app.post('/api/session', async (c) => {
    const authHeader = c.req.header('Authorization');
    let token = authHeader?.replace('Bearer ', '');
    if (!token) {
        // Generate new secure guest token
        const randomBytes = new Uint8Array(24);
        crypto.getRandomValues(randomBytes);
        token = Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
    }
    const tokenHash = await hashToken(token);
    const db = c.env.DB;
    if (!db) {
        // Fallback if running without local D1 binding
        return c.json({
            token,
            playerId: 'guest-offline',
            name: 'Trainer',
            isNew: false
        });
    }
    // Check if player exists
    const existing = await db
        .prepare('SELECT id, name, avatar, pos_x, pos_y FROM players WHERE token_hash = ?')
        .bind(tokenHash)
        .first();
    if (existing) {
        return c.json({
            token,
            playerId: existing.id,
            name: existing.name,
            avatar: existing.avatar,
            isNew: false
        });
    }
    // Create new guest player
    const playerId = crypto.randomUUID();
    const guestName = `Trainer-${Math.floor(1000 + Math.random() * 9000)}`;
    await db
        .prepare('INSERT INTO players (id, token_hash, name, avatar) VALUES (?, ?, ?, 0)')
        .bind(playerId, tokenHash, guestName)
        .run();
    return c.json({
        token,
        playerId,
        name: guestName,
        avatar: 0,
        isNew: true
    });
});
// 2. Load state
app.get('/api/state', async (c) => {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (!token)
        return c.json({ error: 'Unauthorized' }, 401);
    const tokenHash = await hashToken(token);
    const db = c.env.DB;
    if (!db)
        return c.json({ error: 'Database unavailable' }, 503);
    const player = await db
        .prepare('SELECT * FROM players WHERE token_hash = ?')
        .bind(tokenHash)
        .first();
    if (!player)
        return c.json({ error: 'Player not found' }, 404);
    // Load monsters
    const monsters = await db
        .prepare('SELECT * FROM player_monsters WHERE player_id = ? ORDER BY caught_at ASC')
        .bind(player.id)
        .all();
    // Load dex
    const dexEntries = await db
        .prepare('SELECT species_id, caught FROM dex WHERE player_id = ?')
        .bind(player.id)
        .all();
    const dexMap = {};
    for (const entry of dexEntries.results || []) {
        dexMap[entry.species_id] = entry.caught === 1;
    }
    const party = [];
    const box = [];
    for (const row of monsters.results || []) {
        const mon = {
            id: row.id,
            speciesId: row.species_id,
            nickname: row.nickname,
            level: row.level,
            xp: row.xp,
            currentHp: row.current_hp,
            maxHp: row.current_hp, // re-calibrated on client
            moves: JSON.parse(row.moves),
            partySlot: row.party_slot
        };
        if (row.party_slot !== null && row.party_slot !== undefined) {
            party.push(mon);
        }
        else {
            box.push(mon);
        }
    }
    return c.json({
        player: {
            id: player.id,
            name: player.name,
            avatar: player.avatar,
            posX: player.pos_x,
            posY: player.pos_y,
            championBeaten: player.champion_beaten
        },
        party,
        box,
        dex: dexMap
    });
});
// 3. Save state snapshot
app.put('/api/state', async (c) => {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (!token)
        return c.json({ error: 'Unauthorized' }, 401);
    const tokenHash = await hashToken(token);
    const db = c.env.DB;
    if (!db)
        return c.json({ error: 'Database unavailable' }, 503);
    const player = await db
        .prepare('SELECT id FROM players WHERE token_hash = ?')
        .bind(tokenHash)
        .first();
    if (!player)
        return c.json({ error: 'Player not found' }, 404);
    const body = await c.req.json();
    const parsed = SaveStateSchema.safeParse(body);
    if (!parsed.success) {
        return c.json({ error: 'Invalid state format', issues: parsed.error.issues }, 400);
    }
    const data = parsed.data;
    // Update player position & stats
    await db
        .prepare('UPDATE players SET pos_x = ?, pos_y = ?, champion_beaten = ?, last_seen = datetime("now") WHERE id = ?')
        .bind(data.posX, data.posY, data.championBeaten, player.id)
        .run();
    // Clear existing monsters & replace with snapshot
    await db.prepare('DELETE FROM player_monsters WHERE player_id = ?').bind(player.id).run();
    for (let slot = 0; slot < data.party.length; slot++) {
        const m = data.party[slot];
        await db
            .prepare('INSERT INTO player_monsters (id, player_id, species_id, nickname, level, xp, current_hp, moves, party_slot) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
            .bind(m.id, player.id, m.speciesId, m.nickname, m.level, m.xp, m.currentHp, JSON.stringify(m.moves), slot)
            .run();
    }
    for (const m of data.box) {
        await db
            .prepare('INSERT INTO player_monsters (id, player_id, species_id, nickname, level, xp, current_hp, moves, party_slot) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL)')
            .bind(m.id, player.id, m.speciesId, m.nickname, m.level, m.xp, m.currentHp, JSON.stringify(m.moves))
            .run();
    }
    // Update pokedex entries
    for (const [speciesId, caught] of Object.entries(data.dex)) {
        await db
            .prepare('INSERT OR REPLACE INTO dex (player_id, species_id, caught) VALUES (?, ?, ?)')
            .bind(player.id, Number(speciesId), caught ? 1 : 0)
            .run();
    }
    return c.json({ status: 'saved', timestamp: new Date().toISOString() });
});
export default app;
