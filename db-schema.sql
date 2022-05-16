CREATE TABLE "invitation" (
  "id" uuid UNIQUE DEFAULT uuid_generate_v4(),
  "creator" uuid REFERENCES "member" ("id") ON DELETE CASCADE,
  "item_path" ltree REFERENCES "item" ("path") ON DELETE CASCADE ON UPDATE CASCADE,
  "name" character varying(100) DEFAULT NULL,
  "email" character varying(100) NOT NULL,
  "permission" permissions_enum NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc'),
  "updated_at" timestamp NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc'),
  PRIMARY KEY ("item_path","email")
);

CREATE TRIGGER "invitation_set_timestamp"
BEFORE UPDATE ON "invitation"
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();
