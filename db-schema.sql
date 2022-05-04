CREATE TABLE "invitation" (
  "id" uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  "creator" uuid REFERENCES "member" ("id") ON DELETE CASCADE,
  "item_id" uuid REFERENCES "item" ("id") ON DELETE CASCADE,
  "name" character varying(100),
  "email" character varying(100),
  "permission" character varying(100),
  "created_at" timestamp NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc')
);
