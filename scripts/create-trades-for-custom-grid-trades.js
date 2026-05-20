const admin = require('firebase-admin');
const { resolve } = require('path');

// 1. Configuración de la ruta del Service Account
const PROD_SA = resolve(__dirname, '../notifier/service-account.json');

// 2. Inicializar Firebase
admin.initializeApp({
  credential: admin.credential.cert(PROD_SA)
});

const db = admin.firestore();
const collectionName = 'Finance_Custom_Grid_Trades';

/**
 * Datos extraídos íntegramente de image_e02a99.png
 */
const rawData =
  [
    { fecha: "2025-08-15 08:39", price: 118161.20, quantity: 0.00846 },
    { fecha: "2025-08-15 10:53", price: 117186.65, quantity: 0.00852 },
    { fecha: "2025-08-17 13:55", price: 117400.00, quantity: 0.00846 },
    { fecha: "2025-08-17 18:59", price: 117389.98, quantity: 0.01703 },
    { fecha: "2025-08-17 21:28", price: 115856.15, quantity: 0.00863 },
    { fecha: "2025-08-17 23:56", price: 115470.21, quantity: 0.00866 },
    { fecha: "2025-08-18 07:43", price: 115236.61, quantity: 0.01735 },
    { fecha: "2025-08-19 09:26", price: 114591.05, quantity: 0.00862 },
    { fecha: "2025-08-19 09:31", price: 114148.36, quantity: 0.00862 },
    { fecha: "2025-08-19 09:49", price: 113822.74, quantity: 0.00878 },
    { fecha: "2025-08-19 12:00", price: 113340.68, quantity: 0.00025 },
    { fecha: "2025-08-24 19:36", price: 112825.43, quantity: 0.00886 },
    { fecha: "2025-08-29 03:55", price: 109644.45, quantity: 0.00911 },
    { fecha: "2025-08-30 04:34", price: 108482.51, quantity: 0.00922 },
    { fecha: "2025-09-25 15:05", price: 109446.49, quantity: 0.00913 },
    { fecha: "2025-10-09 11:41", price: 120900.00, quantity: 0.00827 },
    { fecha: "2025-10-10 10:18", price: 120000.00, quantity: 0.00833 },
    { fecha: "2025-10-10 10:33", price: 118689.52, quantity: 0.00421 },
    { fecha: "2025-10-10 14:26", price: 116810.92, quantity: 0.01713 },
    { fecha: "2025-10-10 16:41", price: 111526.82, quantity: 0.02690 },
    { fecha: "2025-10-10 20:41", price: 111540.30, quantity: 0.00896 },
    { fecha: "2025-10-11 00:31", price: 112073.59, quantity: 0.01784 },
    { fecha: "2025-10-13 18:59", price: 115150.11, quantity: 0.00868 },
    { fecha: "2025-10-14 07:21", price: 111076.68, quantity: 0.01801 },
    { fecha: "2025-10-14 10:15", price: 111133.56, quantity: 0.01799 },
    { fecha: "2025-10-15 07:11", price: 112006.39, quantity: 0.00892 },
    { fecha: "2025-10-15 08:48", price: 110830.38, quantity: 0.01804 },
    { fecha: "2025-10-17 17:00", price: 107344.97, quantity: 0.00465 },
    { fecha: "2025-10-21 17:36", price: 108931.99, quantity: 0.01836 },
    { fecha: "2025-10-24 09:27", price: 109782.79, quantity: 0.00910 },
    { fecha: "2025-10-28 15:26", price: 112739.15, quantity: 0.00887 },
    { fecha: "2025-10-29 13:39", price: 109874.76, quantity: 0.00910 },
    { fecha: "2025-10-30 07:32", price: 108910.80, quantity: 0.00459 },
    { fecha: "2025-11-03 11:35", price: 106330.01, quantity: 0.00470 },
    { fecha: "2025-11-04 06:31", price: 104304.01, quantity: 0.00192 },
    { fecha: "2025-11-04 06:33", price: 104468.66, quantity: 0.00287 },
    { fecha: "2025-11-04 13:11", price: 100981.43, quantity: 0.00099 },
    { fecha: "2025-11-18 11:50", price: 93448.79,  quantity: 0.00535 },
    { fecha: "2025-12-05 18:09", price: 88961.96,  quantity: 0.00688 },
    { fecha: "2026-01-08 09:56", price: 89946.00,  quantity: 0.00555 },
    { fecha: "2026-01-10 07:33", price: 90692.95,  quantity: 0.00551 }
  ]
;

async function uploadData() {
    console.log(`🚀 Iniciando carga de ${rawData.length} registros en ${collectionName}...`);

    // Usamos batch para eficiencia
    const batch = db.batch();
    const now = new Date().toISOString();

    rawData.forEach((item) => {
        const docRef = db.collection(collectionName).doc();

        // Mapeo exacto según image_e02d9f.png
        const tradeData = {
            price: item.price,
            quantity: item.quantity,
            fecha: item.fecha,
            notes: "",
            createdAt: now,
            updatedAt: now
        };

        batch.set(docRef, tradeData);
    });

    try {
        await batch.commit();
        console.log('✅ ¡Éxito! Se han insertado todas las filas correctamente.');
    } catch (error) {
        console.error('❌ Error al insertar datos:', error);
    }
}

uploadData();


