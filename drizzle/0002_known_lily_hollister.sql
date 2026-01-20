ALTER TABLE "ai_agent"."agent_runs" ADD COLUMN "question_embedding" vector(1536);--> statement-breakpoint
ALTER TABLE "ai_agent"."agent_runs" ADD COLUMN "embedding_model" varchar(50);