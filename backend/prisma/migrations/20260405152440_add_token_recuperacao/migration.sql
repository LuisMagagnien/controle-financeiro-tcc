-- CreateTable
CREATE TABLE "TokenRecuperacao" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "expiracao" TIMESTAMP(3) NOT NULL,
    "usado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TokenRecuperacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TokenRecuperacao_token_key" ON "TokenRecuperacao"("token");

-- AddForeignKey
ALTER TABLE "TokenRecuperacao" ADD CONSTRAINT "TokenRecuperacao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
