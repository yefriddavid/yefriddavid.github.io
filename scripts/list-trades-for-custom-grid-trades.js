const admin = require('firebase-admin');
const { resolve } = require('path');

// 1. Configuración de la ruta del Service Account
const PROD_SA = resolve(__dirname, '../notifier/service-account.json');

// 2. Inicializar Firebase
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(PROD_SA)
    });
}

const db = admin.firestore();
const collectionName = 'Finance_Custom_Grid_Trades';

async function listTrades() {
    try {
        console.log(`\n🔍 Recuperando registros de: ${collectionName}...\n`);

        // Consultamos la colección ordenada por fecha (opcional)
        const snapshot = await db.collection(collectionName)
            .orderBy('fecha', 'asc')
      .limit(5)
            .get();

        if (snapshot.empty) {
            console.log('No se encontraron registros en la tabla.');
            return;
        }

        // Encabezado de la tabla en consola
        console.log(''.padEnd(100, '-'));
        console.log(
            'ID'.padEnd(25) + ' | ' +
            'Fecha'.padEnd(20) + ' | ' +
            'Precio'.padEnd(12) + ' | ' +
            'Cant.'.padEnd(10) + ' | ' +
            'Notas'
        );
        console.log(''.padEnd(100, '-'));

        snapshot.forEach(doc => {
            const data = doc.data();

            // Formatear los datos para que se vean alineados
            const id = doc.id.padEnd(25);
            const fecha = (data.fecha || 'N/A').padEnd(20);
            const price = (data.price ? `$${data.price.toFixed(2)}` : '$0.00').padEnd(12);
            const quantity = (data.quantity ? data.quantity.toString() : '0').padEnd(10);
            const notes = data.notes || '';

            console.log(`${id} | ${fecha} | ${price} | ${quantity} | ${notes}`);
        });

        console.log(''.padEnd(100, '-'));
        console.log(`Total: ${snapshot.size} registros encontrados.\n`);

    } catch (error) {
        console.error('❌ Error al obtener los datos:', error);
    }
}

// Ejecutar
listTrades();
