CREATE TABLE "invitation" (
  "id" uuid UNIQUE DEFAULT uuid_generate_v4(),
  "creator" uuid REFERENCES "member" ("id") ON DELETE CASCADE,
  "item_id" uuid REFERENCES "item" ("id") ON DELETE CASCADE,
  "name" character varying(100) DEFAULT NULL,
  "email" character varying(100) NOT NULL,
  -- todo: use permission type
  "permission" permissions_enum NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc'),
  PRIMARY KEY ("item_id","email")
);
