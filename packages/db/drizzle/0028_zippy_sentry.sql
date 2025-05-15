ALTER TABLE "tokens" ADD COLUMN "creator_token_index" integer;--> statement-breakpoint
WITH ranked_tokens AS (
  SELECT id,
    ROW_NUMBER() OVER (
      PARTITION BY account_entity_id
      ORDER BY block ASC, id ASC
    ) AS rank
  FROM tokens
)
UPDATE tokens AS t
SET creator_token_index = rt.rank
FROM ranked_tokens rt
WHERE t.id = rt.id;--> statement-breakpoint
ALTER TABLE "tokens" ALTER COLUMN "creator_token_index" SET NOT NULL;