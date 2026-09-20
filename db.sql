-- =========================
-- DROP EXISTING TABLES
-- =========================

DROP TABLE IF EXISTS story_characters CASCADE;
DROP TABLE IF EXISTS story_places CASCADE;

DROP TABLE IF EXISTS stories CASCADE;
DROP TABLE IF EXISTS characters CASCADE;
DROP TABLE IF EXISTS places CASCADE;


-- =========================
-- DROP EXISTING TYPES
-- =========================

DROP TYPE IF EXISTS character_gender CASCADE;


-- =========================
-- ENUMS
-- =========================

CREATE TYPE character_gender AS ENUM (
    'male',
    'female',
    'group'
);


-- =========================
-- STORIES
-- =========================

CREATE TABLE stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT,
    summary TEXT,
    tags TEXT[] DEFAULT '{}',
    sources TEXT[] DEFAULT '{}',
    image TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =========================
-- CHARACTERS
-- =========================

CREATE TABLE characters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    gender character_gender NOT NULL DEFAULT 'male',
    bio TEXT,
    image TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =========================
-- PLACES
-- =========================

CREATE TABLE places (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    region TEXT,
    description TEXT,
    image TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =========================
-- STORY ↔ CHARACTER
-- =========================

CREATE TABLE story_characters (
    story_id UUID NOT NULL
        REFERENCES stories(id)
        ON DELETE CASCADE,
    character_id UUID NOT NULL
        REFERENCES characters(id)
        ON DELETE CASCADE,
    PRIMARY KEY (story_id, character_id)
);


-- =========================
-- STORY ↔ PLACE
-- =========================

CREATE TABLE story_places (
    story_id UUID NOT NULL
        REFERENCES stories(id)
        ON DELETE CASCADE,
    place_id UUID NOT NULL
        REFERENCES places(id)
        ON DELETE CASCADE,
    PRIMARY KEY (story_id, place_id)
);


-- =========================
-- INDEXES
-- =========================

CREATE INDEX idx_stories_tags
    ON stories USING GIN (tags);
CREATE INDEX idx_characters_tags
    ON characters USING GIN (tags);
CREATE INDEX idx_places_tags
    ON places USING GIN (tags);
CREATE INDEX idx_story_characters_character
    ON story_characters(character_id);
CREATE INDEX idx_story_places_place
    ON story_places(place_id);


-- =========================
-- UPDATED_AT
-- =========================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER stories_updated_at
BEFORE UPDATE ON stories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();


CREATE TRIGGER characters_updated_at
BEFORE UPDATE ON characters
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();


CREATE TRIGGER places_updated_at
BEFORE UPDATE ON places
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();


-- =========================
-- ROW LEVEL SECURITY (RLS)
-- =========================

ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_places ENABLE ROW LEVEL SECURITY;

-- -------------------------
-- STORIES
-- -------------------------
CREATE POLICY "Allow public select on stories"
    ON stories FOR SELECT
    USING (true);

CREATE POLICY "Allow public insert on stories"
    ON stories FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow public update on stories"
    ON stories FOR UPDATE
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow public delete on stories"
    ON stories FOR DELETE
    USING (true);

-- -------------------------
-- CHARACTERS
-- -------------------------
CREATE POLICY "Allow public select on characters"
    ON characters FOR SELECT
    USING (true);

CREATE POLICY "Allow public insert on characters"
    ON characters FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow public update on characters"
    ON characters FOR UPDATE
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow public delete on characters"
    ON characters FOR DELETE
    USING (true);

-- -------------------------
-- PLACES
-- -------------------------
CREATE POLICY "Allow public select on places"
    ON places FOR SELECT
    USING (true);

CREATE POLICY "Allow public insert on places"
    ON places FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow public update on places"
    ON places FOR UPDATE
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow public delete on places"
    ON places FOR DELETE
    USING (true);

-- -------------------------
-- STORY ↔ CHARACTER (Junction)
-- -------------------------
CREATE POLICY "Allow public select on story_characters"
    ON story_characters FOR SELECT
    USING (true);

CREATE POLICY "Allow public insert on story_characters"
    ON story_characters FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow public delete on story_characters"
    ON story_characters FOR DELETE
    USING (true);

-- -------------------------
-- STORY ↔ PLACE (Junction)
-- -------------------------
CREATE POLICY "Allow public select on story_places"
    ON story_places FOR SELECT
    USING (true);

CREATE POLICY "Allow public insert on story_places"
    ON story_places FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow public delete on story_places"
    ON story_places FOR DELETE
    USING (true);

