ALTER TABLE "users" ADD COLUMN "stripe_customer_id" varchar(255);
ALTER TABLE "users" ADD COLUMN "stripe_subscription_id" varchar(255);
ALTER TABLE "users" ADD COLUMN "subscription_status" varchar(50); 