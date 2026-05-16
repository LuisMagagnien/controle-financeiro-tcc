-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "contaId" INTEGER;

-- CreateTable
CREATE TABLE "ContaCompartilhada" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContaCompartilhada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransacaoCompartilhada" (
    "id" SERIAL NOT NULL,
    "desc" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "data" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "autorNome" TEXT NOT NULL,
    "contaId" INTEGER NOT NULL,

    CONSTRAINT "TransacaoCompartilhada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetaCompartilhada" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "objetivo" DOUBLE PRECISION NOT NULL,
    "atual" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "icone" TEXT NOT NULL DEFAULT '🎯',
    "cor" TEXT NOT NULL DEFAULT '#4ade80',
    "contaId" INTEGER NOT NULL,

    CONSTRAINT "MetaCompartilhada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarteiraCompartilhada" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "saldo" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cor" TEXT NOT NULL DEFAULT '#60a5fa',
    "contaId" INTEGER NOT NULL,

    CONSTRAINT "CarteiraCompartilhada_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContaCompartilhada_codigo_key" ON "ContaCompartilhada"("codigo");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_contaId_fkey" FOREIGN KEY ("contaId") REFERENCES "ContaCompartilhada"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransacaoCompartilhada" ADD CONSTRAINT "TransacaoCompartilhada_contaId_fkey" FOREIGN KEY ("contaId") REFERENCES "ContaCompartilhada"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetaCompartilhada" ADD CONSTRAINT "MetaCompartilhada_contaId_fkey" FOREIGN KEY ("contaId") REFERENCES "ContaCompartilhada"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarteiraCompartilhada" ADD CONSTRAINT "CarteiraCompartilhada_contaId_fkey" FOREIGN KEY ("contaId") REFERENCES "ContaCompartilhada"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
