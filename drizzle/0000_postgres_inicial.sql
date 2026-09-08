CREATE TYPE "public"."contactType" AS ENUM('whatsapp', 'email');--> statement-breakpoint
CREATE TYPE "public"."currentMoment" AS ENUM('understand_method', 'ready_to_start', 'still_evaluating');--> statement-breakpoint
CREATE TYPE "public"."fragmentedArea" AS ENUM('emotional', 'relationships', 'family', 'professional', 'prosperity', 'purpose', 'faith');--> statement-breakpoint
CREATE TYPE "public"."interestStage" AS ENUM('know_more', 'talk_to_team');--> statement-breakpoint
CREATE TYPE "public"."journeyFocus" AS ENUM('understand_fit', 'restore_dialogue', 'renew_connection', 'align_direction');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "coupleMentoringInterests" (
	"id" serial PRIMARY KEY NOT NULL,
	"fullName" varchar(120) NOT NULL,
	"partnerName" varchar(120),
	"contactType" "contactType" NOT NULL,
	"contactValue" varchar(320) NOT NULL,
	"interestStage" "interestStage" NOT NULL,
	"journeyFocus" "journeyFocus" DEFAULT 'understand_fit' NOT NULL,
	"consent" integer NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interaEvaluationRequests" (
	"id" serial PRIMARY KEY NOT NULL,
	"fullName" varchar(120) NOT NULL,
	"contactType" "contactType" NOT NULL,
	"contactValue" varchar(320) NOT NULL,
	"fragmentedArea" "fragmentedArea" NOT NULL,
	"currentMoment" "currentMoment" DEFAULT 'still_evaluating' NOT NULL,
	"consent" integer NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" "role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
