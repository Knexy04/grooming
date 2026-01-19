-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Leaflet" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "publicCode" TEXT NOT NULL,
    "printCount" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'active',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Leaflet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Distributor" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Distributor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeafletAssignment" (
    "id" TEXT NOT NULL,
    "leafletId" TEXT NOT NULL,
    "distributorId" TEXT NOT NULL,
    "rewardPerClient" INTEGER NOT NULL,
    "note" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unassignedAt" TIMESTAMP(3),

    CONSTRAINT "LeafletAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activation" (
    "id" TEXT NOT NULL,
    "leafletId" TEXT NOT NULL,
    "assignmentId" TEXT,
    "note" TEXT,
    "activatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activatedById" TEXT NOT NULL,

    CONSTRAINT "Activation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Leaflet_publicCode_key" ON "Leaflet"("publicCode");

-- CreateIndex
CREATE INDEX "Leaflet_campaignId_idx" ON "Leaflet"("campaignId");

-- CreateIndex
CREATE INDEX "Leaflet_publicCode_idx" ON "Leaflet"("publicCode");

-- CreateIndex
CREATE INDEX "Distributor_phone_idx" ON "Distributor"("phone");

-- CreateIndex
CREATE INDEX "LeafletAssignment_leafletId_unassignedAt_idx" ON "LeafletAssignment"("leafletId", "unassignedAt");

-- CreateIndex
CREATE INDEX "LeafletAssignment_distributorId_idx" ON "LeafletAssignment"("distributorId");

-- CreateIndex
CREATE INDEX "Activation_leafletId_activatedAt_idx" ON "Activation"("leafletId", "activatedAt");

-- CreateIndex
CREATE INDEX "Activation_assignmentId_idx" ON "Activation"("assignmentId");

-- AddForeignKey
ALTER TABLE "Leaflet" ADD CONSTRAINT "Leaflet_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeafletAssignment" ADD CONSTRAINT "LeafletAssignment_leafletId_fkey" FOREIGN KEY ("leafletId") REFERENCES "Leaflet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeafletAssignment" ADD CONSTRAINT "LeafletAssignment_distributorId_fkey" FOREIGN KEY ("distributorId") REFERENCES "Distributor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activation" ADD CONSTRAINT "Activation_leafletId_fkey" FOREIGN KEY ("leafletId") REFERENCES "Leaflet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activation" ADD CONSTRAINT "Activation_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "LeafletAssignment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activation" ADD CONSTRAINT "Activation_activatedById_fkey" FOREIGN KEY ("activatedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

