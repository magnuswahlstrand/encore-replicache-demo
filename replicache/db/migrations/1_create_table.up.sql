CREATE TABLE IF NOT EXISTS "replicache_clients" (
    "id"                text PRIMARY KEY NOT NULL,
    "last_mutation_id"  integer NOT NULL
);

CREATE TABLE IF NOT EXISTS "spaces" (
   "id" text PRIMARY KEY NOT NULL,
   "version" integer NOT NULL
);

CREATE TABLE IF NOT EXISTS "messages" (
    "key"           text PRIMARY KEY NOT NULL,
    "type"          text NOT NULL,
    "data"          jsonb NOT NULL,
    "deleted"       boolean NOT NULL,
    "version"       integer NOT NULL,
    "space_id" text NOT NULL REFERENCES "spaces" ("id") ON DELETE no action ON UPDATE no action
);


INSERT INTO "spaces" ("id", "version") VALUES ('default', 0);