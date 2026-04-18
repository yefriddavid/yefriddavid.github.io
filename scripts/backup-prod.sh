#!/bin/bash

# Script para sacar backup de Firestore Producción
# Proyecto: cashflow-9cbbc
# Los backups se guardan en un bucket de Google Cloud Storage

PROJECT_ID="cashflow-9cbbc"
BUCKET_NAME="gs://${PROJECT_ID}-backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="${BUCKET_NAME}/${TIMESTAMP}"

echo "🚀 Iniciando backup de Firestore para el proyecto: ${PROJECT_ID}"
echo "📂 Destino: ${BACKUP_PATH}"

# Verificar si el bucket existe, si no, crearlo (en la región us-east1 o la que prefieras)
gsutil ls -b ${BUCKET_NAME} > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "✨ Creando bucket de backups ${BUCKET_NAME}..."
    gsutil mb -l us-east1 ${BUCKET_NAME}
fi

# Ejecutar la exportación
gcloud firestore export ${BACKUP_PATH} --project=${PROJECT_ID}

if [ $? -eq 0 ]; then
    echo -e "\n✅ Backup completado exitosamente en: ${BACKUP_PATH}"
    echo "Para restaurar en otro proyecto usa:"
    echo "gcloud firestore import gs://${PROJECT_ID}-backups/${TIMESTAMP} --project=TU_PROYECTO_DESTINO"
else
    echo -e "\n❌ Error al realizar el backup."
    exit 1
fi
