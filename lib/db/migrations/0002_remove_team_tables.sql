-- Drop foreign key constraints first
ALTER TABLE IF EXISTS "activity_logs" DROP CONSTRAINT IF EXISTS "activity_logs_team_id_teams_id_fk";
ALTER TABLE IF EXISTS "activity_logs" DROP CONSTRAINT IF EXISTS "activity_logs_user_id_users_id_fk";
ALTER TABLE IF EXISTS "invitations" DROP CONSTRAINT IF EXISTS "invitations_team_id_teams_id_fk";
ALTER TABLE IF EXISTS "invitations" DROP CONSTRAINT IF EXISTS "invitations_invited_by_users_id_fk";
ALTER TABLE IF EXISTS "team_members" DROP CONSTRAINT IF EXISTS "team_members_user_id_users_id_fk";
ALTER TABLE IF EXISTS "team_members" DROP CONSTRAINT IF EXISTS "team_members_team_id_teams_id_fk";
ALTER TABLE IF EXISTS "canvases" DROP CONSTRAINT IF EXISTS "canvases_team_id_teams_id_fk";

-- Drop the tables
DROP TABLE IF EXISTS "activity_logs";
DROP TABLE IF EXISTS "invitations";
DROP TABLE IF EXISTS "team_members";
DROP TABLE IF EXISTS "teams"; 