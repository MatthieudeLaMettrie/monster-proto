-- Initial schema for Monster Proto D1 database
CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  token_hash TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  avatar INTEGER NOT NULL DEFAULT 0,
  pos_x INTEGER NOT NULL DEFAULT 5,
  pos_y INTEGER NOT NULL DEFAULT 5,
  champion_beaten INTEGER NOT NULL DEFAULT 0,
  pvp_wins INTEGER NOT NULL DEFAULT 0,
  pvp_losses INTEGER NOT NULL DEFAULT 0,
  rating INTEGER NOT NULL DEFAULT 1000,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_seen TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS player_monsters (
  id TEXT PRIMARY KEY,
  player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  species_id INTEGER NOT NULL,
  nickname TEXT,
  level INTEGER NOT NULL,
  xp INTEGER NOT NULL DEFAULT 0,
  current_hp INTEGER NOT NULL,
  moves TEXT NOT NULL,
  party_slot INTEGER,
  caught_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_party ON player_monsters(player_id, party_slot) WHERE party_slot IS NOT NULL;

CREATE TABLE IF NOT EXISTS dex (
  player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  species_id INTEGER NOT NULL,
  caught INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (player_id, species_id)
);

CREATE TABLE IF NOT EXISTS pvp_matches (
  id TEXT PRIMARY KEY,
  p1_id TEXT NOT NULL,
  p2_id TEXT NOT NULL,
  winner_id TEXT,
  reason TEXT,
  turns INTEGER NOT NULL,
  p1_team TEXT NOT NULL,
  p2_team TEXT NOT NULL,
  finished_at TEXT NOT NULL DEFAULT (datetime('now'))
);
