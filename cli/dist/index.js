#!/usr/bin/env node
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all7) => {
  for (var name in all7)
    __defProp(target, name, { get: all7[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// cli/shims/settings.js
var import_dotenv, import_path, import_app, import_firestore, import_auth, import_database, domoticaConfig, taxiConfig, domoticaApp, dbDomotica, rtdbDomotica, taxiApp, dbTaxi, cashflowConfig, cashflowApp, db, auth, FIREBASE_API_KEY, COL_CASHFLOW_ACCOUNTS_MASTER, COL_CASHFLOW_TRANSACTIONS, COL_TAXI_DRIVERS, COL_TAXI_VEHICLES, COL_TENANTS, COL_USERS, COL_DOMOTICA_TRANSACTIONS, COL_SYSTEM_PERF_LOGS;
var init_settings = __esm({
  "cli/shims/settings.js"() {
    import_dotenv = __toESM(require("dotenv"));
    import_path = require("path");
    import_app = require("firebase/app");
    import_firestore = require("firebase/firestore");
    import_auth = require("firebase/auth");
    import_database = require("firebase/database");
    import_dotenv.default.config({ path: (0, import_path.resolve)(process.cwd(), ".env.production") });
    domoticaConfig = {
      apiKey: process.env.VITE_DOMOTICA_API_KEY,
      authDomain: process.env.VITE_DOMOTICA_AUTH_DOMAIN,
      databaseURL: process.env.VITE_DOMOTICA_DATABASE_URL,
      projectId: process.env.VITE_DOMOTICA_PROJECT_ID,
      storageBucket: process.env.VITE_DOMOTICA_STORAGE_BUCKET,
      messagingSenderId: process.env.VITE_DOMOTICA_MESSAGING_SENDER_ID,
      appId: process.env.VITE_DOMOTICA_APP_ID
    };
    taxiConfig = {
      apiKey: process.env.VITE_TAXI_API_KEY,
      authDomain: process.env.VITE_TAXI_AUTH_DOMAIN,
      databaseURL: process.env.VITE_TAXI_DATABASE_URL,
      projectId: process.env.VITE_TAXI_PROJECT_ID,
      storageBucket: process.env.VITE_TAXI_STORAGE_BUCKET,
      messagingSenderId: process.env.VITE_TAXI_MESSAGING_SENDER_ID,
      appId: process.env.VITE_TAXI_APP_ID
    };
    domoticaApp = (0, import_app.initializeApp)(domoticaConfig, "domotica");
    dbDomotica = (0, import_firestore.getFirestore)(domoticaApp);
    rtdbDomotica = (0, import_database.getDatabase)(domoticaApp);
    taxiApp = (0, import_app.initializeApp)(taxiConfig, "taxi");
    dbTaxi = (0, import_firestore.getFirestore)(taxiApp);
    cashflowConfig = {
      apiKey: process.env.VITE_FIREBASE_API_KEY,
      authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
      databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.VITE_FIREBASE_APP_ID
    };
    cashflowApp = (0, import_app.initializeApp)(cashflowConfig, "cashflow");
    db = (0, import_firestore.getFirestore)(cashflowApp);
    auth = (0, import_auth.initializeAuth)(cashflowApp, { persistence: import_auth.inMemoryPersistence });
    FIREBASE_API_KEY = process.env.VITE_FIREBASE_API_KEY;
    COL_CASHFLOW_ACCOUNTS_MASTER = "CashFlow_AccountsMaster";
    COL_CASHFLOW_TRANSACTIONS = "CashFlow_Transactions";
    COL_TAXI_DRIVERS = "Taxi_conductores";
    COL_TAXI_VEHICLES = "Taxi_vehiculos";
    COL_TENANTS = "Admin_Tenants";
    COL_USERS = "users";
    COL_DOMOTICA_TRANSACTIONS = "Domotica_transactions";
    COL_SYSTEM_PERF_LOGS = "System_perf_logs";
  }
});

// src/services/firebase/system/perfLogs.js
var perfLogs_exports = {};
__export(perfLogs_exports, {
  getPerfLogs: () => getPerfLogs,
  measureAndLog: () => measureAndLog,
  writePerfLog: () => writePerfLog
});
var import_firestore2, SLOW_THRESHOLD_MS, writePerfLog, getPerfLogs, measureAndLog;
var init_perfLogs = __esm({
  "src/services/firebase/system/perfLogs.js"() {
    import_firestore2 = require("firebase/firestore");
    init_settings();
    init_firebaseClient();
    SLOW_THRESHOLD_MS = 2e3;
    writePerfLog = async (entry) => {
      try {
        await (0, import_firestore2.addDoc)((0, import_firestore2.collection)(db, COL_SYSTEM_PERF_LOGS), {
          ...entry,
          timestamp: (0, import_firestore2.serverTimestamp)()
        });
      } catch {
      }
    };
    getPerfLogs = async () => {
      const q = (0, import_firestore2.query)((0, import_firestore2.collection)(db, COL_SYSTEM_PERF_LOGS), (0, import_firestore2.orderBy)("timestamp", "desc"), (0, import_firestore2.limit)(200));
      const snap = await firestoreCall(() => (0, import_firestore2.getDocs)(q));
      return snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        timestamp: d.data().timestamp?.toDate?.() ?? null
      }));
    };
    measureAndLog = async (label, operation) => {
      const start = performance.now();
      try {
        const result = await operation();
        const ms = Math.round(performance.now() - start);
        if (ms > SLOW_THRESHOLD_MS) {
          writePerfLog({
            label,
            durationMs: ms,
            route: window.location.hash,
            username: localStorage.getItem("username"),
            slow: true
          });
        }
        return result;
      } catch (err) {
        const ms = Math.round(performance.now() - start);
        writePerfLog({
          label,
          durationMs: ms,
          route: window.location.hash,
          username: localStorage.getItem("username"),
          slow: ms > SLOW_THRESHOLD_MS,
          error: err?.message ?? String(err)
        });
        throw err;
      }
    };
  }
});

// src/services/firebase/firebaseClient.js
function normalizeError(err) {
  const userMessage = ERROR_MESSAGES[err.code] ?? err.message ?? "Error desconocido";
  const normalized = new Error(userMessage);
  normalized.code = err.code;
  normalized.original = err;
  return normalized;
}
async function handleAuthFailure() {
  try {
    await (0, import_auth2.signOut)(auth);
  } catch {
  }
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  localStorage.removeItem("sessionId");
  localStorage.removeItem("landingPage");
  window.location.hash = "#/login";
}
function isRetryable(err) {
  return RETRYABLE_CODES.has(err.code);
}
function sleep(ms) {
  return new Promise((resolve2) => setTimeout(resolve2, ms));
}
async function firestoreCall(operation, { retries = 1, label } = {}) {
  let lastErr;
  const start = performance.now();
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      if (auth.currentUser) {
        await auth.currentUser.getIdToken(attempt > 0);
      }
      const result = await operation();
      const ms2 = Math.round(performance.now() - start);
      if (ms2 > 2e3 && label) {
        Promise.resolve().then(() => (init_perfLogs(), perfLogs_exports)).then(
          ({ writePerfLog: writePerfLog2 }) => writePerfLog2({ label, durationMs: ms2, route: window.location.hash, username: localStorage.getItem("username"), slow: true })
        );
      }
      return result;
    } catch (err) {
      lastErr = err;
      if (err.code === "permission-denied" || err.code === "unauthenticated") {
        await handleAuthFailure();
        throw normalizeError(err);
      }
      if (isRetryable(err) && attempt < retries) {
        await sleep(400 * 2 ** attempt);
        continue;
      }
      break;
    }
  }
  const ms = Math.round(performance.now() - start);
  if (label) {
    Promise.resolve().then(() => (init_perfLogs(), perfLogs_exports)).then(
      ({ writePerfLog: writePerfLog2 }) => writePerfLog2({ label, durationMs: ms, route: window.location.hash, username: localStorage.getItem("username"), slow: ms > 2e3, error: lastErr?.message })
    );
  }
  throw normalizeError(lastErr);
}
async function openProjectCall(operation, { retries = 1 } = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (err) {
      lastErr = err;
      if (isRetryable(err) && attempt < retries) {
        await sleep(400 * 2 ** attempt);
        continue;
      }
      break;
    }
  }
  throw normalizeError(lastErr);
}
var import_auth2, ERROR_MESSAGES, RETRYABLE_CODES, domoticaCall, taxiCall;
var init_firebaseClient = __esm({
  "src/services/firebase/firebaseClient.js"() {
    import_auth2 = require("firebase/auth");
    init_settings();
    ERROR_MESSAGES = {
      "permission-denied": "Sin permisos para esta operaci\xF3n",
      unauthenticated: "Sesi\xF3n expirada \u2014 inicie sesi\xF3n nuevamente",
      "not-found": "Registro no encontrado",
      unavailable: "Firebase no disponible, intente m\xE1s tarde",
      "resource-exhausted": "Demasiadas solicitudes, espere un momento",
      cancelled: "Operaci\xF3n cancelada",
      "data-loss": "Error de integridad de datos",
      "deadline-exceeded": "Tiempo de espera agotado"
    };
    RETRYABLE_CODES = /* @__PURE__ */ new Set(["unavailable", "deadline-exceeded", "resource-exhausted"]);
    domoticaCall = (op, opts) => openProjectCall(op, opts);
    taxiCall = (op, opts) => openProjectCall(op, opts);
  }
});

// cli/index.js
var import_commander7 = require("commander");

// cli/commands/voltage.js
var import_commander = require("commander");
var import_chalk = __toESM(require("chalk"));
var import_cli_table3 = __toESM(require("cli-table3"));

// cli/store/store.js
var import_toolkit8 = require("@reduxjs/toolkit");
var import_redux_saga = __toESM(require("redux-saga"));

// src/reducers/domotica/domoticaTransactionReducer.js
var import_toolkit2 = require("@reduxjs/toolkit");

// src/actions/domotica/domoticaTransactionActions.js
var import_toolkit = require("@reduxjs/toolkit");
var fetchRequest = (0, import_toolkit.createAction)("fetch domotica transactions");
var beginRequestFetch = (0, import_toolkit.createAction)("begin request fetch domotica transactions");
var successRequestFetch = (0, import_toolkit.createAction)("fetch domotica transactions success");
var errorRequestFetch = (0, import_toolkit.createAction)("request fetch domotica transactions error");
var createRequest = (0, import_toolkit.createAction)("request create domotica transaction");
var beginRequestCreate = (0, import_toolkit.createAction)("begin request create domotica transaction");
var successRequestCreate = (0, import_toolkit.createAction)("request create domotica transaction success");
var errorRequestCreate = (0, import_toolkit.createAction)("request create domotica transaction error");
var updateRequest = (0, import_toolkit.createAction)("request update domotica transaction");
var beginRequestUpdate = (0, import_toolkit.createAction)("begin request update domotica transaction");
var successRequestUpdate = (0, import_toolkit.createAction)("request update domotica transaction success");
var errorRequestUpdate = (0, import_toolkit.createAction)("request update domotica transaction error");
var deleteRequest = (0, import_toolkit.createAction)("request delete domotica transaction");
var beginRequestDelete = (0, import_toolkit.createAction)("begin request delete domotica transaction");
var successRequestDelete = (0, import_toolkit.createAction)("request delete domotica transaction success");
var errorRequestDelete = (0, import_toolkit.createAction)("request delete domotica transaction error");
var fetchVoltageRequest = (0, import_toolkit.createAction)("fetch domotica voltage history");
var fetchVoltageSuccess = (0, import_toolkit.createAction)("fetch domotica voltage history success");
var fetchVoltageError = (0, import_toolkit.createAction)("fetch domotica voltage history error");
var fetchCurrentRequest = (0, import_toolkit.createAction)("fetch domotica current history");
var fetchCurrentSuccess = (0, import_toolkit.createAction)("fetch domotica current history success");
var fetchCurrentError = (0, import_toolkit.createAction)("fetch domotica current history error");
var cleanupPreviewRequest = (0, import_toolkit.createAction)("domotica transactions cleanup preview request");
var cleanupPreviewSuccess = (0, import_toolkit.createAction)("domotica transactions cleanup preview success");
var cleanupPreviewError = (0, import_toolkit.createAction)("domotica transactions cleanup preview error");
var cleanupDeleteRequest = (0, import_toolkit.createAction)("domotica transactions cleanup delete request");
var cleanupDeleteSuccess = (0, import_toolkit.createAction)("domotica transactions cleanup delete success");
var cleanupDeleteError = (0, import_toolkit.createAction)("domotica transactions cleanup delete error");

// src/reducers/domotica/domoticaTransactionReducer.js
var domoticaTransactionSlice = (0, import_toolkit2.createSlice)({
  name: "domoticaTransaction",
  initialState: {
    data: null,
    error: {},
    fetching: false,
    isError: false,
    voltageData: null,
    voltageFetching: false,
    currentData: null,
    currentFetching: false,
    cleanupPreviewing: false,
    cleanupPreview: null,
    cleanupDeleting: false,
    cleanupDeleted: null,
    cleanupError: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchRequest, (state) => {
      state.fetching = true;
      state.isError = false;
    }).addCase(beginRequestFetch, (state) => {
      state.fetching = true;
    }).addCase(successRequestFetch, (state, { payload }) => {
      state.data = payload;
      state.fetching = false;
    }).addCase(errorRequestFetch, (state, { payload }) => {
      state.error = payload;
      state.fetching = false;
      state.isError = true;
    }).addCase(beginRequestCreate, (state) => {
      state.fetching = true;
    }).addCase(successRequestCreate, (state, { payload }) => {
      state.data = state.data ? [payload, ...state.data] : [payload];
      state.fetching = false;
    }).addCase(errorRequestCreate, (state, { payload }) => {
      state.error = payload;
      state.fetching = false;
      state.isError = true;
    }).addCase(beginRequestUpdate, (state) => {
      state.fetching = true;
    }).addCase(successRequestUpdate, (state, { payload }) => {
      if (state.data) {
        state.data = state.data.map((t) => t.id === payload.id ? payload : t);
      }
      state.fetching = false;
    }).addCase(errorRequestUpdate, (state, { payload }) => {
      state.error = payload;
      state.fetching = false;
      state.isError = true;
    }).addCase(beginRequestDelete, (state) => {
      state.fetching = true;
    }).addCase(successRequestDelete, (state, { payload }) => {
      if (state.data) {
        state.data = state.data.filter((t) => t.id !== payload.id);
      }
      state.fetching = false;
    }).addCase(errorRequestDelete, (state, { payload }) => {
      state.error = payload;
      state.fetching = false;
      state.isError = true;
    }).addCase(fetchVoltageRequest, (state) => {
      state.voltageFetching = true;
    }).addCase(fetchVoltageSuccess, (state, { payload }) => {
      state.voltageData = payload;
      state.voltageFetching = false;
    }).addCase(fetchVoltageError, (state) => {
      state.voltageFetching = false;
    }).addCase(fetchCurrentRequest, (state) => {
      state.currentFetching = true;
    }).addCase(fetchCurrentSuccess, (state, { payload }) => {
      state.currentData = payload;
      state.currentFetching = false;
    }).addCase(fetchCurrentError, (state) => {
      state.currentFetching = false;
    }).addCase(cleanupPreviewRequest, (state) => {
      state.cleanupPreviewing = true;
      state.cleanupPreview = null;
      state.cleanupError = null;
      state.cleanupDeleted = null;
    }).addCase(cleanupPreviewSuccess, (state, { payload }) => {
      state.cleanupPreviewing = false;
      state.cleanupPreview = payload;
    }).addCase(cleanupPreviewError, (state, { payload }) => {
      state.cleanupPreviewing = false;
      state.cleanupError = payload;
    }).addCase(cleanupDeleteRequest, (state) => {
      state.cleanupDeleting = true;
      state.cleanupError = null;
      state.cleanupDeleted = null;
    }).addCase(cleanupDeleteSuccess, (state, { payload }) => {
      state.cleanupDeleting = false;
      state.cleanupDeleted = payload;
      state.cleanupPreview = null;
    }).addCase(cleanupDeleteError, (state, { payload }) => {
      state.cleanupDeleting = false;
      state.cleanupError = payload;
    });
  }
});
var domoticaTransactionReducer_default = domoticaTransactionSlice.reducer;

// src/utils/crudFactory.js
var import_toolkit3 = require("@reduxjs/toolkit");
var createCRUDActions = (entity) => ({
  fetchRequest: (0, import_toolkit3.createAction)(`${entity}/fetchRequest`),
  beginRequestFetch: (0, import_toolkit3.createAction)(`${entity}/beginFetch`),
  successRequestFetch: (0, import_toolkit3.createAction)(`${entity}/fetchSuccess`),
  errorRequestFetch: (0, import_toolkit3.createAction)(`${entity}/fetchError`),
  createRequest: (0, import_toolkit3.createAction)(`${entity}/createRequest`),
  beginRequestCreate: (0, import_toolkit3.createAction)(`${entity}/beginCreate`),
  successRequestCreate: (0, import_toolkit3.createAction)(`${entity}/createSuccess`),
  errorRequestCreate: (0, import_toolkit3.createAction)(`${entity}/createError`),
  updateRequest: (0, import_toolkit3.createAction)(`${entity}/updateRequest`),
  beginRequestUpdate: (0, import_toolkit3.createAction)(`${entity}/beginUpdate`),
  successRequestUpdate: (0, import_toolkit3.createAction)(`${entity}/updateSuccess`),
  errorRequestUpdate: (0, import_toolkit3.createAction)(`${entity}/updateError`),
  deleteRequest: (0, import_toolkit3.createAction)(`${entity}/deleteRequest`),
  beginRequestDelete: (0, import_toolkit3.createAction)(`${entity}/beginDelete`),
  successRequestDelete: (0, import_toolkit3.createAction)(`${entity}/deleteSuccess`),
  errorRequestDelete: (0, import_toolkit3.createAction)(`${entity}/deleteError`)
});
var createCRUDReducer = (sliceName, actions, {
  sortKey = null,
  writeFlag = "fetching",
  idKey = "id",
  prependOnCreate = false,
  beginUpdate = false,
  beginDelete = false,
  initialState: extra = {},
  extraCases = null
} = {}) => {
  const sortFn = sortKey ? (arr) => [...arr].sort((a, b) => (a[sortKey] ?? "").localeCompare(b[sortKey] ?? "")) : null;
  const addToData = (data, item) => {
    const arr = data ? prependOnCreate ? [item, ...data] : [...data, item] : [item];
    return sortFn ? sortFn(arr) : arr;
  };
  return (0, import_toolkit3.createSlice)({
    name: sliceName,
    initialState: {
      data: null,
      error: {},
      fetching: false,
      isError: false,
      ...writeFlag === "saving" ? { saving: false } : {},
      ...extra
    },
    reducers: {},
    extraReducers: (builder) => {
      builder.addCase(actions.fetchRequest, (s) => {
        s.fetching = true;
        s.isError = false;
      }).addCase(actions.beginRequestFetch, (s) => {
        s.fetching = true;
      }).addCase(actions.successRequestFetch, (s, { payload }) => {
        s.data = payload;
        s.fetching = false;
      }).addCase(actions.errorRequestFetch, (s, { payload }) => {
        s.error = payload;
        s.fetching = false;
        s.isError = true;
      }).addCase(actions.beginRequestCreate, (s) => {
        s[writeFlag] = true;
      }).addCase(actions.successRequestCreate, (s, { payload }) => {
        s.data = addToData(s.data, payload);
        s[writeFlag] = false;
      }).addCase(actions.errorRequestCreate, (s, { payload }) => {
        s.error = payload;
        s[writeFlag] = false;
        s.isError = true;
      });
      if (beginUpdate) {
        builder.addCase(actions.beginRequestUpdate, (s) => {
          s[writeFlag] = true;
          s.isError = false;
        });
      }
      builder.addCase(actions.successRequestUpdate, (s, { payload }) => {
        if (s.data) {
          const mapped = s.data.map(
            (r) => r[idKey] === payload[idKey] ? { ...r, ...payload } : r
          );
          s.data = sortFn ? sortFn(mapped) : mapped;
        }
        if (beginUpdate) s[writeFlag] = false;
      }).addCase(actions.errorRequestUpdate, (s, { payload }) => {
        s.error = payload;
        if (beginUpdate) s[writeFlag] = false;
        s.isError = true;
      });
      if (beginDelete) {
        builder.addCase(actions.beginRequestDelete, (s) => {
          s[writeFlag] = true;
        });
      }
      builder.addCase(actions.successRequestDelete, (s, { payload }) => {
        if (s.data) s.data = s.data.filter((r) => r[idKey] !== payload[idKey]);
        if (beginDelete) s[writeFlag] = false;
      }).addCase(actions.errorRequestDelete, (s, { payload }) => {
        s.error = payload;
        if (beginDelete) s[writeFlag] = false;
        s.isError = true;
      });
      if (extraCases) extraCases(builder);
    }
  });
};

// src/actions/taxi/taxiDriverActions.js
var taxiDriverActions_exports = {};
__export(taxiDriverActions_exports, {
  beginRequestCreate: () => beginRequestCreate2,
  beginRequestDelete: () => beginRequestDelete2,
  beginRequestFetch: () => beginRequestFetch2,
  beginRequestUpdate: () => beginRequestUpdate2,
  createRequest: () => createRequest2,
  deleteRequest: () => deleteRequest2,
  errorRequestCreate: () => errorRequestCreate2,
  errorRequestDelete: () => errorRequestDelete2,
  errorRequestFetch: () => errorRequestFetch2,
  errorRequestUpdate: () => errorRequestUpdate2,
  fetchRequest: () => fetchRequest2,
  successRequestCreate: () => successRequestCreate2,
  successRequestDelete: () => successRequestDelete2,
  successRequestFetch: () => successRequestFetch2,
  successRequestUpdate: () => successRequestUpdate2,
  updateRequest: () => updateRequest2
});
var {
  fetchRequest: fetchRequest2,
  beginRequestFetch: beginRequestFetch2,
  successRequestFetch: successRequestFetch2,
  errorRequestFetch: errorRequestFetch2,
  createRequest: createRequest2,
  beginRequestCreate: beginRequestCreate2,
  successRequestCreate: successRequestCreate2,
  errorRequestCreate: errorRequestCreate2,
  updateRequest: updateRequest2,
  beginRequestUpdate: beginRequestUpdate2,
  successRequestUpdate: successRequestUpdate2,
  errorRequestUpdate: errorRequestUpdate2,
  deleteRequest: deleteRequest2,
  beginRequestDelete: beginRequestDelete2,
  successRequestDelete: successRequestDelete2,
  errorRequestDelete: errorRequestDelete2
} = createCRUDActions("taxiDriver");

// src/reducers/taxi/taxiDriverReducer.js
var taxiDriverReducer_default = createCRUDReducer("taxiDriver", taxiDriverActions_exports, { sortKey: "name", beginUpdate: true }).reducer;

// src/actions/taxi/taxiVehicleActions.js
var taxiVehicleActions_exports = {};
__export(taxiVehicleActions_exports, {
  beginRequestCreate: () => beginRequestCreate3,
  beginRequestDelete: () => beginRequestDelete3,
  beginRequestFetch: () => beginRequestFetch3,
  beginRequestUpdate: () => beginRequestUpdate3,
  createRequest: () => createRequest3,
  deleteRequest: () => deleteRequest3,
  errorRequestCreate: () => errorRequestCreate3,
  errorRequestDelete: () => errorRequestDelete3,
  errorRequestFetch: () => errorRequestFetch3,
  errorRequestUpdate: () => errorRequestUpdate3,
  errorRequestUpdateRestrictions: () => errorRequestUpdateRestrictions,
  fetchRequest: () => fetchRequest3,
  successRequestCreate: () => successRequestCreate3,
  successRequestDelete: () => successRequestDelete3,
  successRequestFetch: () => successRequestFetch3,
  successRequestUpdate: () => successRequestUpdate3,
  successRequestUpdateRestrictions: () => successRequestUpdateRestrictions,
  updateRequest: () => updateRequest3,
  updateRestrictionsRequest: () => updateRestrictionsRequest
});
var import_toolkit4 = require("@reduxjs/toolkit");
var {
  fetchRequest: fetchRequest3,
  beginRequestFetch: beginRequestFetch3,
  successRequestFetch: successRequestFetch3,
  errorRequestFetch: errorRequestFetch3,
  createRequest: createRequest3,
  beginRequestCreate: beginRequestCreate3,
  successRequestCreate: successRequestCreate3,
  errorRequestCreate: errorRequestCreate3,
  updateRequest: updateRequest3,
  beginRequestUpdate: beginRequestUpdate3,
  successRequestUpdate: successRequestUpdate3,
  errorRequestUpdate: errorRequestUpdate3,
  deleteRequest: deleteRequest3,
  beginRequestDelete: beginRequestDelete3,
  successRequestDelete: successRequestDelete3,
  errorRequestDelete: errorRequestDelete3
} = createCRUDActions("taxiVehicle");
var updateRestrictionsRequest = (0, import_toolkit4.createAction)("taxiVehicle/updateRestrictionsRequest");
var successRequestUpdateRestrictions = (0, import_toolkit4.createAction)(
  "taxiVehicle/updateRestrictionsSuccess"
);
var errorRequestUpdateRestrictions = (0, import_toolkit4.createAction)("taxiVehicle/updateRestrictionsError");

// src/reducers/taxi/taxiVehicleReducer.js
var taxiVehicleReducer_default = createCRUDReducer("taxiVehicle", taxiVehicleActions_exports, {
  sortKey: "plate",
  beginUpdate: true,
  extraCases: (builder) => {
    builder.addCase(successRequestUpdateRestrictions, (s, { payload }) => {
      if (s.data) {
        s.data = s.data.map(
          (r) => r.id === payload.id ? { ...r, restrictions: payload.restrictions } : r
        );
      }
    }).addCase(errorRequestUpdateRestrictions, (s, { payload }) => {
      s.error = payload;
      s.isError = true;
    });
  }
}).reducer;

// src/actions/cashflow/accountsMasterActions.js
var accountsMasterActions_exports = {};
__export(accountsMasterActions_exports, {
  beginRequestCreate: () => beginRequestCreate4,
  beginRequestDelete: () => beginRequestDelete4,
  beginRequestFetch: () => beginRequestFetch4,
  beginRequestUpdate: () => beginRequestUpdate4,
  createRequest: () => createRequest4,
  deleteRequest: () => deleteRequest4,
  errorRequestCreate: () => errorRequestCreate4,
  errorRequestDelete: () => errorRequestDelete4,
  errorRequestFetch: () => errorRequestFetch4,
  errorRequestUpdate: () => errorRequestUpdate4,
  fetchRequest: () => fetchRequest4,
  patchManyComplete: () => patchManyComplete,
  patchManyError: () => patchManyError,
  patchManyProgress: () => patchManyProgress,
  patchManyRequest: () => patchManyRequest,
  seedComplete: () => seedComplete,
  seedError: () => seedError,
  seedProgressUpdate: () => seedProgressUpdate,
  seedRequest: () => seedRequest,
  successRequestCreate: () => successRequestCreate4,
  successRequestDelete: () => successRequestDelete4,
  successRequestFetch: () => successRequestFetch4,
  successRequestUpdate: () => successRequestUpdate4,
  updateRequest: () => updateRequest4
});
var import_toolkit5 = require("@reduxjs/toolkit");
var {
  fetchRequest: fetchRequest4,
  beginRequestFetch: beginRequestFetch4,
  successRequestFetch: successRequestFetch4,
  errorRequestFetch: errorRequestFetch4,
  createRequest: createRequest4,
  beginRequestCreate: beginRequestCreate4,
  successRequestCreate: successRequestCreate4,
  errorRequestCreate: errorRequestCreate4,
  updateRequest: updateRequest4,
  beginRequestUpdate: beginRequestUpdate4,
  successRequestUpdate: successRequestUpdate4,
  errorRequestUpdate: errorRequestUpdate4,
  deleteRequest: deleteRequest4,
  beginRequestDelete: beginRequestDelete4,
  successRequestDelete: successRequestDelete4,
  errorRequestDelete: errorRequestDelete4
} = createCRUDActions("accountsMaster");
var seedRequest = (0, import_toolkit5.createAction)("accountsMaster/seedRequest");
var seedProgressUpdate = (0, import_toolkit5.createAction)("accountsMaster/seedProgressUpdate");
var seedComplete = (0, import_toolkit5.createAction)("accountsMaster/seedComplete");
var seedError = (0, import_toolkit5.createAction)("accountsMaster/seedError");
var patchManyRequest = (0, import_toolkit5.createAction)("accountsMaster/patchManyRequest");
var patchManyProgress = (0, import_toolkit5.createAction)("accountsMaster/patchManyProgress");
var patchManyComplete = (0, import_toolkit5.createAction)("accountsMaster/patchManyComplete");
var patchManyError = (0, import_toolkit5.createAction)("accountsMaster/patchManyError");

// src/reducers/cashflow/accountsMasterReducer.js
var accountsMasterReducer_default = createCRUDReducer("accountsMaster", accountsMasterActions_exports, {
  writeFlag: "saving",
  beginUpdate: true,
  initialState: { seeding: false, seedProgress: 0, patching: false, patchProgress: 0 },
  extraCases: (builder) => {
    builder.addCase(seedRequest, (s) => {
      s.seeding = true;
      s.seedProgress = 0;
    }).addCase(seedProgressUpdate, (s, { payload }) => {
      s.seedProgress = payload;
    }).addCase(seedComplete, (s) => {
      s.seeding = false;
      s.seedProgress = 100;
    }).addCase(seedError, (s, { payload }) => {
      s.seeding = false;
      s.error = payload;
      s.isError = true;
    }).addCase(patchManyRequest, (s) => {
      s.patching = true;
      s.patchProgress = 0;
    }).addCase(patchManyProgress, (s, { payload }) => {
      s.patchProgress = payload;
    }).addCase(patchManyComplete, (s) => {
      s.patching = false;
      s.patchProgress = 100;
    }).addCase(patchManyError, (s, { payload }) => {
      s.patching = false;
      s.error = payload;
      s.isError = true;
    });
  }
}).reducer;

// src/actions/cashflow/transactionActions.js
var transactionActions_exports = {};
__export(transactionActions_exports, {
  beginRequestCreate: () => beginRequestCreate5,
  beginRequestDelete: () => beginRequestDelete5,
  beginRequestFetch: () => beginRequestFetch5,
  beginRequestUpdate: () => beginRequestUpdate5,
  createRequest: () => createRequest5,
  deleteRequest: () => deleteRequest5,
  errorRequestCreate: () => errorRequestCreate5,
  errorRequestDelete: () => errorRequestDelete5,
  errorRequestFetch: () => errorRequestFetch5,
  errorRequestUpdate: () => errorRequestUpdate5,
  fetchRequest: () => fetchRequest5,
  importComplete: () => importComplete,
  importError: () => importError,
  importProgressUpdate: () => importProgressUpdate,
  importRequest: () => importRequest,
  successRequestCreate: () => successRequestCreate5,
  successRequestDelete: () => successRequestDelete5,
  successRequestFetch: () => successRequestFetch5,
  successRequestUpdate: () => successRequestUpdate5,
  updateRequest: () => updateRequest5
});
var import_toolkit6 = require("@reduxjs/toolkit");
var {
  fetchRequest: fetchRequest5,
  beginRequestFetch: beginRequestFetch5,
  successRequestFetch: successRequestFetch5,
  errorRequestFetch: errorRequestFetch5,
  createRequest: createRequest5,
  beginRequestCreate: beginRequestCreate5,
  successRequestCreate: successRequestCreate5,
  errorRequestCreate: errorRequestCreate5,
  updateRequest: updateRequest5,
  beginRequestUpdate: beginRequestUpdate5,
  successRequestUpdate: successRequestUpdate5,
  errorRequestUpdate: errorRequestUpdate5,
  deleteRequest: deleteRequest5,
  beginRequestDelete: beginRequestDelete5,
  successRequestDelete: successRequestDelete5,
  errorRequestDelete: errorRequestDelete5
} = createCRUDActions("transaction");
var importRequest = (0, import_toolkit6.createAction)("transaction/importRequest");
var importProgressUpdate = (0, import_toolkit6.createAction)("transaction/importProgressUpdate");
var importComplete = (0, import_toolkit6.createAction)("transaction/importComplete");
var importError = (0, import_toolkit6.createAction)("transaction/importError");

// src/reducers/cashflow/transactionReducer.js
var transactionReducer_default = createCRUDReducer("transaction", transactionActions_exports, {
  writeFlag: "saving",
  prependOnCreate: true,
  beginUpdate: true,
  initialState: { importing: false, importProgress: 0 },
  extraCases: (builder) => {
    builder.addCase(importRequest, (s) => {
      s.importing = true;
      s.importProgress = 0;
    }).addCase(importProgressUpdate, (s, { payload }) => {
      s.importProgress = payload;
    }).addCase(importComplete, (s, { payload }) => {
      s.importing = false;
      s.importProgress = 100;
      s.data = payload;
    }).addCase(importError, (s, { payload }) => {
      s.importing = false;
      s.error = payload;
      s.isError = true;
    });
  }
}).reducer;

// src/reducers/notificationsSlice.js
var import_toolkit7 = require("@reduxjs/toolkit");
var notificationsSlice = (0, import_toolkit7.createSlice)({
  name: "notifications",
  initialState: [],
  reducers: {
    push: (state, { payload }) => {
      state.push({ id: Date.now() + Math.random(), ...payload });
    },
    dismiss: (state, { payload }) => state.filter((n) => n.id !== payload)
  }
});
var { push, dismiss } = notificationsSlice.actions;
var notificationsSlice_default = notificationsSlice.reducer;

// cli/store/rootSaga.js
var import_effects6 = require("redux-saga/effects");

// src/sagas/domotica/domoticaTransactionSagas.js
var import_effects = require("redux-saga/effects");

// src/services/firebase/domotica/domoticaTransactions.js
init_settings();
init_firebaseClient();
var import_firestore3 = require("firebase/firestore");
var mapDoc = (d) => {
  const data = d.data();
  const ts = data.createdAt;
  return {
    id: d.id,
    type: data.type ?? null,
    device: data.device ?? null,
    description: data.description ?? null,
    amount: data.amount ?? null,
    unit: data.unit ?? null,
    date: data.date?.toDate?.()?.toISOString() ?? data.date ?? null,
    notes: data.notes ?? null,
    value: data.voltage ?? data.value ?? data.amps ?? data.amount ?? null,
    percent: data.percent ?? data.soc ?? null,
    solar: data.solar ?? null,
    status: data.status ?? null,
    createdAt: ts?.toDate?.()?.toISOString() ?? null
  };
};
var fetchTransactionHistory = async ({ type, startDate, endDate } = {}) => {
  const constraints = [];
  if (type) constraints.push((0, import_firestore3.where)("type", "==", type));
  if (startDate) constraints.push((0, import_firestore3.where)("createdAt", ">=", import_firestore3.Timestamp.fromDate(new Date(startDate))));
  if (endDate) constraints.push((0, import_firestore3.where)("createdAt", "<=", import_firestore3.Timestamp.fromDate(new Date(endDate))));
  constraints.push((0, import_firestore3.orderBy)("createdAt", "asc"), (0, import_firestore3.limit)(500));
  const q = (0, import_firestore3.query)((0, import_firestore3.collection)(dbDomotica, COL_DOMOTICA_TRANSACTIONS), ...constraints);
  let data = [];
  try {
    const snap = await domoticaCall(() => (0, import_firestore3.getDocs)(q));
    data = snap.docs.map(mapDoc);
    return data;
  } catch (e) {
    console.error("[fetchTransactionHistory]", e);
  }
  return data;
};
var fetchTransactions = async () => {
  const q = (0, import_firestore3.query)((0, import_firestore3.collection)(dbDomotica, COL_DOMOTICA_TRANSACTIONS), (0, import_firestore3.orderBy)("createdAt", "desc"));
  const snap = await domoticaCall(() => (0, import_firestore3.getDocs)(q));
  return snap.docs.map(mapDoc);
};
var createTransaction = async (data) => {
  const ref = await domoticaCall(
    () => (0, import_firestore3.addDoc)((0, import_firestore3.collection)(dbDomotica, COL_DOMOTICA_TRANSACTIONS), {
      type: data.type,
      description: data.description || null,
      amount: data.amount != null ? Number(data.amount) : null,
      unit: data.unit || null,
      device: data.device || null,
      date: data.date,
      notes: data.notes || null,
      createdAt: (0, import_firestore3.serverTimestamp)()
    })
  );
  return ref.id;
};
var updateTransaction = async (id, data) => {
  await domoticaCall(
    () => (0, import_firestore3.updateDoc)((0, import_firestore3.doc)(dbDomotica, COL_DOMOTICA_TRANSACTIONS, id), {
      type: data.type,
      description: data.description || null,
      amount: data.amount != null ? Number(data.amount) : null,
      unit: data.unit || null,
      device: data.device || null,
      date: data.date,
      notes: data.notes || null
    })
  );
};
var deleteTransaction = async (id) => {
  await domoticaCall(() => (0, import_firestore3.deleteDoc)((0, import_firestore3.doc)(dbDomotica, COL_DOMOTICA_TRANSACTIONS, id)));
};
var buildRangeConstraints = ({ from, to, type }) => {
  const constraints = [
    (0, import_firestore3.where)("createdAt", ">=", import_firestore3.Timestamp.fromDate(new Date(from))),
    (0, import_firestore3.where)("createdAt", "<=", import_firestore3.Timestamp.fromDate(new Date(to)))
  ];
  if (type) constraints.push((0, import_firestore3.where)("type", "==", type));
  return constraints;
};
var fetchTransactionsByRange = async (params) => {
  const q = (0, import_firestore3.query)(
    (0, import_firestore3.collection)(dbDomotica, COL_DOMOTICA_TRANSACTIONS),
    ...buildRangeConstraints(params),
    (0, import_firestore3.orderBy)("createdAt", "asc")
  );
  const snap = await domoticaCall(() => (0, import_firestore3.getDocs)(q));
  return snap.docs.map(mapDoc);
};
var deleteTransactionsByRange = async (params) => {
  const q = (0, import_firestore3.query)((0, import_firestore3.collection)(dbDomotica, COL_DOMOTICA_TRANSACTIONS), ...buildRangeConstraints(params));
  const snap = await domoticaCall(() => (0, import_firestore3.getDocs)(q));
  const docs = snap.docs;
  for (let i = 0; i < docs.length; i += 500) {
    const batch = (0, import_firestore3.writeBatch)(dbDomotica);
    docs.slice(i, i + 500).forEach((d) => batch.delete(d.ref));
    await domoticaCall(() => batch.commit());
  }
  return docs.length;
};

// src/constants/domotica.js
var TRANSACTION_TYPE_VOLTAGE = "voltaje";
var TRANSACTION_TYPE_CURRENT = "current";

// src/sagas/domotica/domoticaTransactionSagas.js
var getLast24hRange = () => {
  const endDate = /* @__PURE__ */ new Date();
  const startDate = /* @__PURE__ */ new Date();
  startDate.setHours(startDate.getHours() - 24);
  return { startDate, endDate };
};
function* fetchTransactions2() {
  try {
    yield (0, import_effects.put)(beginRequestFetch());
    const data = yield (0, import_effects.call)(fetchTransactions);
    yield (0, import_effects.put)(successRequestFetch(data));
  } catch (e) {
    yield (0, import_effects.put)(errorRequestFetch(e.message));
  }
}
function* createTransaction2({ payload }) {
  try {
    yield (0, import_effects.put)(beginRequestCreate());
    const id = yield (0, import_effects.call)(createTransaction, payload);
    yield (0, import_effects.put)(successRequestCreate({ id, ...payload, amount: Number(payload.amount) }));
  } catch (e) {
    yield (0, import_effects.put)(errorRequestCreate(e.message));
  }
}
function* updateTransaction2({ payload }) {
  try {
    yield (0, import_effects.put)(beginRequestUpdate());
    yield (0, import_effects.call)(updateTransaction, payload.id, payload);
    yield (0, import_effects.put)(successRequestUpdate(payload));
  } catch (e) {
    yield (0, import_effects.put)(errorRequestUpdate(e.message));
  }
}
function* deleteTransaction2({ payload }) {
  try {
    yield (0, import_effects.put)(beginRequestDelete());
    yield (0, import_effects.call)(deleteTransaction, payload.id);
    yield (0, import_effects.put)(successRequestDelete(payload));
  } catch (e) {
    yield (0, import_effects.put)(errorRequestDelete(e.message));
  }
}
var toDateRange = (payload) => {
  if (!payload?.startDate) return getLast24hRange();
  return { startDate: new Date(payload.startDate), endDate: new Date(payload.endDate) };
};
function* fetchVoltageHistory({ payload } = {}) {
  try {
    const data = yield (0, import_effects.call)(fetchTransactionHistory, { type: TRANSACTION_TYPE_VOLTAGE, ...toDateRange(payload) });
    yield (0, import_effects.put)(fetchVoltageSuccess(data));
  } catch (e) {
    yield (0, import_effects.put)(fetchVoltageError(e.message));
  }
}
function* fetchCurrentHistory({ payload } = {}) {
  try {
    const data = yield (0, import_effects.call)(fetchTransactionHistory, { type: TRANSACTION_TYPE_CURRENT, ...toDateRange(payload) });
    yield (0, import_effects.put)(fetchCurrentSuccess(data));
  } catch (e) {
    yield (0, import_effects.put)(fetchCurrentError(e.message));
  }
}
function* cleanupPreview({ payload }) {
  try {
    const docs = yield (0, import_effects.call)(fetchTransactionsByRange, payload);
    yield (0, import_effects.put)(cleanupPreviewSuccess(docs));
  } catch (e) {
    yield (0, import_effects.put)(cleanupPreviewError(e.message));
  }
}
function* cleanupDelete({ payload }) {
  try {
    const deleted = yield (0, import_effects.call)(deleteTransactionsByRange, payload);
    yield (0, import_effects.put)(cleanupDeleteSuccess(deleted));
  } catch (e) {
    yield (0, import_effects.put)(cleanupDeleteError(e.message));
  }
}
function* rootSagas() {
  yield (0, import_effects.all)([
    (0, import_effects.takeLatest)(fetchRequest, fetchTransactions2),
    (0, import_effects.takeLatest)(createRequest, createTransaction2),
    (0, import_effects.takeLatest)(updateRequest, updateTransaction2),
    (0, import_effects.takeLatest)(deleteRequest, deleteTransaction2),
    (0, import_effects.takeLatest)(fetchVoltageRequest, fetchVoltageHistory),
    (0, import_effects.takeLatest)(fetchCurrentRequest, fetchCurrentHistory),
    (0, import_effects.takeLatest)(cleanupPreviewRequest, cleanupPreview),
    (0, import_effects.takeLatest)(cleanupDeleteRequest, cleanupDelete)
  ]);
}

// src/sagas/taxi/taxiDriverSagas.js
var import_effects2 = require("redux-saga/effects");

// src/services/firebase/taxi/taxiDrivers.js
init_settings();
var import_firestore4 = require("firebase/firestore");
init_firebaseClient();

// src/services/tenantContext.js
var STORAGE_KEY = "_cf_tid";
var SECRET = "cf_multitenant_2025";
var xor = (str, key) => Array.from(str).map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length))).join("");
var encrypt = (value) => btoa(xor(value, SECRET));
var decrypt = (encoded) => xor(atob(encoded), SECRET);
var _tenantId = null;
try {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) _tenantId = decrypt(stored);
} catch (_) {
}
var setTenantId = (id) => {
  _tenantId = id ?? null;
  try {
    if (id) {
      localStorage.setItem(STORAGE_KEY, encrypt(id));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (_) {
  }
};
var getTenantId = () => _tenantId;

// src/services/firebase/taxi/taxiDrivers.js
var getDrivers = async () => {
  const q = (0, import_firestore4.query)((0, import_firestore4.collection)(dbTaxi, COL_TAXI_DRIVERS), (0, import_firestore4.where)("tenantId", "==", getTenantId()));
  const snap = await taxiCall(() => (0, import_firestore4.getDocs)(q));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      name: data.name,
      idNumber: data.idNumber,
      phone: data.phone,
      defaultAmount: data.defaultAmount,
      defaultAmountSunday: data.defaultAmountSunday,
      defaultVehicle: data.defaultVehicle,
      active: data.active !== false,
      startDate: data.startDate ?? null,
      endDate: data.endDate ?? null
    };
  }).sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
};
var addDriver = async ({
  name,
  idNumber,
  phone,
  defaultAmount,
  defaultAmountSunday,
  defaultVehicle,
  active,
  startDate
}) => {
  const ref = await taxiCall(
    () => (0, import_firestore4.addDoc)((0, import_firestore4.collection)(dbTaxi, COL_TAXI_DRIVERS), {
      name,
      idNumber,
      phone: phone || null,
      defaultAmount: defaultAmount ? Number(defaultAmount) : null,
      defaultAmountSunday: defaultAmountSunday ? Number(defaultAmountSunday) : null,
      defaultVehicle: defaultVehicle || null,
      active: active !== false,
      startDate: startDate || null,
      endDate: null,
      tenantId: getTenantId(),
      createdAt: (0, import_firestore4.serverTimestamp)()
    })
  );
  return ref.id;
};
var updateDriver = async (id, {
  name,
  idNumber,
  phone,
  defaultAmount,
  defaultAmountSunday,
  defaultVehicle,
  active,
  startDate,
  endDate
}) => {
  await taxiCall(
    () => (0, import_firestore4.updateDoc)((0, import_firestore4.doc)(dbTaxi, COL_TAXI_DRIVERS, id), {
      name,
      idNumber,
      phone: phone || null,
      defaultAmount: defaultAmount ? Number(defaultAmount) : null,
      defaultAmountSunday: defaultAmountSunday ? Number(defaultAmountSunday) : null,
      defaultVehicle: defaultVehicle || null,
      active: active !== false,
      startDate: startDate || null,
      endDate: endDate || null
    })
  );
};
var deleteDriver = async (id) => {
  await taxiCall(() => (0, import_firestore4.deleteDoc)((0, import_firestore4.doc)(dbTaxi, COL_TAXI_DRIVERS, id)));
};

// src/sagas/taxi/taxiDriverSagas.js
function* fetchDrivers() {
  try {
    yield (0, import_effects2.put)(beginRequestFetch2());
    const data = yield (0, import_effects2.call)(getDrivers);
    yield (0, import_effects2.put)(successRequestFetch2(data));
  } catch (e) {
    yield (0, import_effects2.put)(errorRequestFetch2(e.message));
  }
}
function* createDriver({ payload }) {
  try {
    yield (0, import_effects2.put)(beginRequestCreate2());
    const id = yield (0, import_effects2.call)(addDriver, payload);
    yield (0, import_effects2.put)(
      successRequestCreate2({
        id,
        ...payload,
        defaultAmount: payload.defaultAmount ? Number(payload.defaultAmount) : null,
        defaultAmountSunday: payload.defaultAmountSunday ? Number(payload.defaultAmountSunday) : null,
        defaultVehicle: payload.defaultVehicle || null
      })
    );
  } catch (e) {
    yield (0, import_effects2.put)(errorRequestCreate2(e.message));
  }
}
function* updateDriver2({ payload }) {
  try {
    yield (0, import_effects2.put)(beginRequestUpdate2());
    yield (0, import_effects2.call)(updateDriver, payload.id, payload);
    yield (0, import_effects2.put)(successRequestUpdate2(payload));
  } catch (e) {
    yield (0, import_effects2.put)(errorRequestUpdate2(e.message));
  }
}
function* deleteDriver2({ payload }) {
  try {
    yield (0, import_effects2.put)(beginRequestDelete2());
    yield (0, import_effects2.call)(deleteDriver, payload.id);
    yield (0, import_effects2.put)(successRequestDelete2(payload));
  } catch (e) {
    yield (0, import_effects2.put)(errorRequestDelete2(e.message));
  }
}
function* rootSagas2() {
  yield (0, import_effects2.all)([
    (0, import_effects2.takeLatest)(fetchRequest2, fetchDrivers),
    (0, import_effects2.takeLatest)(createRequest2, createDriver),
    (0, import_effects2.takeLatest)(updateRequest2, updateDriver2),
    (0, import_effects2.takeLatest)(deleteRequest2, deleteDriver2)
  ]);
}

// src/sagas/taxi/taxiVehicleSagas.js
var import_effects3 = require("redux-saga/effects");

// src/services/firebase/taxi/taxiVehicles.js
var taxiVehicles_exports = {};
__export(taxiVehicles_exports, {
  addVehicle: () => addVehicle,
  deleteVehicle: () => deleteVehicle,
  getVehicles: () => getVehicles,
  updateRestrictions: () => updateRestrictions,
  updateVehicle: () => updateVehicle
});
init_settings();
var import_firestore5 = require("firebase/firestore");
init_firebaseClient();
var getVehicles = async () => {
  const q = (0, import_firestore5.query)((0, import_firestore5.collection)(dbTaxi, COL_TAXI_VEHICLES), (0, import_firestore5.where)("tenantId", "==", getTenantId()));
  const snap = await taxiCall(() => (0, import_firestore5.getDocs)(q));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      plate: data.plate,
      brand: data.brand,
      model: data.model,
      year: data.year,
      active: data.active !== false,
      restrictions: data.restrictions ?? {}
    };
  }).sort((a, b) => (a.plate ?? "").localeCompare(b.plate ?? ""));
};
var addVehicle = async ({ plate, brand, model, year, active }) => {
  const ref = await taxiCall(
    () => (0, import_firestore5.addDoc)((0, import_firestore5.collection)(dbTaxi, COL_TAXI_VEHICLES), {
      plate: plate.toUpperCase(),
      brand,
      model,
      year,
      active: active !== false,
      restrictions: {},
      tenantId: getTenantId(),
      createdAt: (0, import_firestore5.serverTimestamp)()
    })
  );
  return ref.id;
};
var updateVehicle = async (id, { plate, brand, model, year, active }) => {
  await taxiCall(
    () => (0, import_firestore5.updateDoc)((0, import_firestore5.doc)(dbTaxi, COL_TAXI_VEHICLES, id), {
      plate: plate.toUpperCase(),
      brand,
      model,
      year,
      active: active !== false
    })
  );
};
var updateRestrictions = async (id, restrictions) => {
  await taxiCall(() => (0, import_firestore5.updateDoc)((0, import_firestore5.doc)(dbTaxi, COL_TAXI_VEHICLES, id), { restrictions }));
};
var deleteVehicle = async (id) => {
  await taxiCall(() => (0, import_firestore5.deleteDoc)((0, import_firestore5.doc)(dbTaxi, COL_TAXI_VEHICLES, id)));
};

// src/services/idb/db.js
var DB_NAME = "my-admin-local";
var DB_VERSION = 6;
var STORES = {
  SALARY_DISTRIBUTION: "salary-distribution",
  MY_PROJECTS: "my-projects",
  ASSETS: "assets",
  ACCOUNTS_MASTER: "accounts-master",
  METADATA: "metadata",
  TAXI_VEHICLES: "taxi-vehicles"
};
function openDB() {
  return new Promise((resolve2, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db2 = e.target.result;
      if (!db2.objectStoreNames.contains(STORES.SALARY_DISTRIBUTION)) {
        db2.createObjectStore(STORES.SALARY_DISTRIBUTION);
      }
      if (!db2.objectStoreNames.contains(STORES.MY_PROJECTS)) {
        db2.createObjectStore(STORES.MY_PROJECTS, { keyPath: "id" });
      }
      if (!db2.objectStoreNames.contains(STORES.ASSETS)) {
        db2.createObjectStore(STORES.ASSETS, { keyPath: "id" });
      }
      if (!db2.objectStoreNames.contains(STORES.ACCOUNTS_MASTER)) {
        db2.createObjectStore(STORES.ACCOUNTS_MASTER, { keyPath: "id" });
      }
      if (!db2.objectStoreNames.contains(STORES.METADATA)) {
        db2.createObjectStore(STORES.METADATA);
      }
      if (!db2.objectStoreNames.contains(STORES.TAXI_VEHICLES)) {
        db2.createObjectStore(STORES.TAXI_VEHICLES, { keyPath: "id" });
      }
    };
    req.onsuccess = (e) => resolve2(e.target.result);
    req.onerror = (e) => reject(e.target.error);
  });
}
var DB_STORES = STORES;

// src/services/idb/cashflow/taxiVehicles.js
async function saveVehicles(vehicles) {
  const db2 = await openDB();
  const tx = db2.transaction(DB_STORES.TAXI_VEHICLES, "readwrite");
  const store2 = tx.objectStore(DB_STORES.TAXI_VEHICLES);
  store2.clear();
  for (const v of vehicles) {
    store2.put(v);
  }
  await new Promise((resolve2, reject) => {
    tx.oncomplete = resolve2;
    tx.onerror = () => reject(tx.error);
  });
}

// src/services/facade/taxi/taxiVehicleFacade.js
var getVehicles2 = async () => {
  const data = await getVehicles();
  try {
    await saveVehicles(data);
  } catch (_) {
  }
  return data;
};
var { addVehicle: addVehicle2, updateVehicle: updateVehicle2, deleteVehicle: deleteVehicle2, updateRestrictions: updateRestrictions2 } = taxiVehicles_exports;

// src/sagas/taxi/taxiVehicleSagas.js
function* fetchVehicles() {
  try {
    yield (0, import_effects3.put)(beginRequestFetch3());
    const data = yield (0, import_effects3.call)(getVehicles2);
    yield (0, import_effects3.put)(successRequestFetch3(data));
  } catch (e) {
    yield (0, import_effects3.put)(errorRequestFetch3(e.message));
  }
}
function* createVehicle({ payload }) {
  try {
    yield (0, import_effects3.put)(beginRequestCreate3());
    const id = yield (0, import_effects3.call)(addVehicle2, payload);
    yield (0, import_effects3.put)(
      successRequestCreate3({
        id,
        ...payload,
        plate: payload.plate?.toUpperCase(),
        restrictions: {}
      })
    );
  } catch (e) {
    yield (0, import_effects3.put)(errorRequestCreate3(e.message));
  }
}
function* updateVehicle3({ payload }) {
  try {
    yield (0, import_effects3.put)(beginRequestUpdate3());
    yield (0, import_effects3.call)(updateVehicle2, payload.id, payload);
    yield (0, import_effects3.put)(successRequestUpdate3({ ...payload, plate: payload.plate?.toUpperCase() }));
  } catch (e) {
    yield (0, import_effects3.put)(errorRequestUpdate3(e.message));
  }
}
function* deleteVehicle3({ payload }) {
  try {
    yield (0, import_effects3.put)(beginRequestDelete3());
    yield (0, import_effects3.call)(deleteVehicle2, payload.id);
    yield (0, import_effects3.put)(successRequestDelete3(payload));
  } catch (e) {
    yield (0, import_effects3.put)(errorRequestDelete3(e.message));
  }
}
function* updateRestrictions3({ payload }) {
  try {
    yield (0, import_effects3.call)(updateRestrictions2, payload.id, payload.restrictions);
    yield (0, import_effects3.put)(successRequestUpdateRestrictions(payload));
  } catch (e) {
    yield (0, import_effects3.put)(errorRequestUpdateRestrictions(e.message));
  }
}
function* rootSagas3() {
  yield (0, import_effects3.all)([
    (0, import_effects3.takeLatest)(fetchRequest3, fetchVehicles),
    (0, import_effects3.takeLatest)(createRequest3, createVehicle),
    (0, import_effects3.takeLatest)(updateRequest3, updateVehicle3),
    (0, import_effects3.takeLatest)(deleteRequest3, deleteVehicle3),
    (0, import_effects3.takeLatest)(updateRestrictionsRequest, updateRestrictions3)
  ]);
}

// cli/sagas/accountsMasterSaga.js
var import_effects4 = require("redux-saga/effects");

// src/services/firebase/cashflow/accountsMaster.js
init_settings();
var import_firestore6 = require("firebase/firestore");
init_firebaseClient();
var getAccountsMaster = async () => {
  const q = (0, import_firestore6.query)(
    (0, import_firestore6.collection)(db, COL_CASHFLOW_ACCOUNTS_MASTER),
    (0, import_firestore6.where)("tenantId", "==", getTenantId())
  );
  const snap = await firestoreCall(() => (0, import_firestore6.getDocs)(q));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      name: data.name ?? null,
      type: data.type ?? null,
      code: data.code ?? null,
      period: data.period ?? null,
      classification: data.classification ?? null,
      category: data.category ?? null,
      paymentMethod: data.paymentMethod ?? null,
      active: data.active !== false,
      accountingName: data.accountingName ?? null,
      defaultValue: data.defaultValue ?? 0,
      targetAmount: data.targetAmount ?? 0,
      maxDatePay: data.maxDatePay ?? null,
      monthStartAt: data.monthStartAt ?? null,
      important: data.important ?? false,
      description: data.description ?? null,
      notes: data.notes ?? null,
      definition: data.definition ?? null,
      created_at: data.created_at?.toDate?.()?.toISOString() ?? null
    };
  }).sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
};

// cli/sagas/accountsMasterSaga.js
function* fetchAccountsMaster() {
  try {
    yield (0, import_effects4.put)(beginRequestFetch4());
    const data = yield (0, import_effects4.call)(getAccountsMaster);
    yield (0, import_effects4.put)(successRequestFetch4(data));
  } catch (e) {
    yield (0, import_effects4.put)(errorRequestFetch4(e.message));
  }
}
function* rootSaga() {
  yield (0, import_effects4.all)([(0, import_effects4.takeLatest)(fetchRequest4, fetchAccountsMaster)]);
}

// src/sagas/cashflow/transactionSagas.js
var import_effects5 = require("redux-saga/effects");

// src/services/firebase/cashflow/transactions.js
init_settings();
var import_firestore7 = require("firebase/firestore");
init_firebaseClient();
var getTransactions = async (year) => {
  const q = (0, import_firestore7.query)((0, import_firestore7.collection)(db, COL_CASHFLOW_TRANSACTIONS), (0, import_firestore7.where)("tenantId", "==", getTenantId()));
  const snap = await firestoreCall(() => (0, import_firestore7.getDocs)(q));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      created_at: data.created_at?.toMillis?.() ?? null
    };
  }).filter((d) => d.date >= `${year}-01-01` && d.date <= `${year}-12-31`).sort((a, b) => b.date.localeCompare(a.date));
};
var addTransaction = async (payload) => {
  const ref = await firestoreCall(
    () => (0, import_firestore7.addDoc)((0, import_firestore7.collection)(db, COL_CASHFLOW_TRANSACTIONS), {
      ...payload,
      tenantId: getTenantId(),
      created_at: (0, import_firestore7.serverTimestamp)()
    })
  );
  return ref.id;
};
var updateTransaction3 = async (id, payload) => {
  const { id: _id, created_at: _ca, ...rest } = payload;
  await firestoreCall(() => (0, import_firestore7.updateDoc)((0, import_firestore7.doc)(db, COL_CASHFLOW_TRANSACTIONS, id), rest));
};
var deleteTransaction3 = async (id) => {
  await firestoreCall(() => (0, import_firestore7.deleteDoc)((0, import_firestore7.doc)(db, COL_CASHFLOW_TRANSACTIONS, id)));
};

// src/sagas/cashflow/transactionSagas.js
function* fetchTransactions3({ payload }) {
  try {
    yield (0, import_effects5.put)(beginRequestFetch5());
    const data = yield (0, import_effects5.call)(getTransactions, payload?.year ?? (/* @__PURE__ */ new Date()).getFullYear());
    yield (0, import_effects5.put)(successRequestFetch5(data));
  } catch (e) {
    yield (0, import_effects5.put)(errorRequestFetch5(e.message));
    yield (0, import_effects5.put)(push({ type: "error", message: e.message }));
  }
}
function* createTransaction3({ payload }) {
  try {
    yield (0, import_effects5.put)(beginRequestCreate5());
    const id = yield (0, import_effects5.call)(addTransaction, payload);
    yield (0, import_effects5.put)(successRequestCreate5({ id, ...payload }));
  } catch (e) {
    yield (0, import_effects5.put)(errorRequestCreate5(e.message));
    yield (0, import_effects5.put)(push({ type: "error", message: e.message }));
  }
}
function* updateTransaction4({ payload }) {
  try {
    yield (0, import_effects5.put)(beginRequestUpdate5());
    yield (0, import_effects5.call)(updateTransaction3, payload.id, payload);
    yield (0, import_effects5.put)(successRequestUpdate5(payload));
  } catch (e) {
    yield (0, import_effects5.put)(errorRequestUpdate5(e.message));
    yield (0, import_effects5.put)(push({ type: "error", message: e.message }));
  }
}
function* deleteTransaction4({ payload }) {
  try {
    yield (0, import_effects5.put)(beginRequestDelete5());
    yield (0, import_effects5.call)(deleteTransaction3, payload.id);
    yield (0, import_effects5.put)(successRequestDelete5(payload));
  } catch (e) {
    yield (0, import_effects5.put)(errorRequestDelete5(e.message));
    yield (0, import_effects5.put)(push({ type: "error", message: e.message }));
  }
}
function* importTransactions({ payload }) {
  try {
    for (let i = 0; i < payload.length; i++) {
      yield (0, import_effects5.call)(addTransaction, payload[i]);
      yield (0, import_effects5.put)(importProgressUpdate(Math.round((i + 1) / payload.length * 100)));
    }
    const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
    const data = yield (0, import_effects5.call)(getTransactions, currentYear);
    yield (0, import_effects5.put)(importComplete(data));
  } catch (e) {
    yield (0, import_effects5.put)(importError(e.message));
    yield (0, import_effects5.put)(push({ type: "error", message: e.message }));
  }
}
function* rootSagas4() {
  yield (0, import_effects5.all)([
    (0, import_effects5.takeLatest)(fetchRequest5, fetchTransactions3),
    (0, import_effects5.takeLatest)(createRequest5, createTransaction3),
    (0, import_effects5.takeLatest)(updateRequest5, updateTransaction4),
    (0, import_effects5.takeLatest)(deleteRequest5, deleteTransaction4),
    (0, import_effects5.takeLatest)(importRequest, importTransactions)
  ]);
}

// cli/store/rootSaga.js
function* rootSaga2() {
  yield (0, import_effects6.all)([
    rootSagas(),
    rootSagas2(),
    rootSagas3(),
    rootSaga(),
    rootSagas4()
  ]);
}

// cli/store/store.js
var sagaMiddleware = (0, import_redux_saga.default)();
var store = (0, import_toolkit8.configureStore)({
  reducer: {
    domoticaTransaction: domoticaTransactionReducer_default,
    taxiDriver: taxiDriverReducer_default,
    taxiVehicle: taxiVehicleReducer_default,
    accountsMaster: accountsMasterReducer_default,
    transaction: transactionReducer_default,
    notifications: notificationsSlice_default
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }).concat(sagaMiddleware)
});
sagaMiddleware.run(rootSaga2);
var store_default = store;

// cli/utils/dispatch.js
function waitForSaga(store2, action, { isFetching, getResult }) {
  return new Promise((resolve2, reject) => {
    let started = false;
    let unsub;
    const timer = setTimeout(() => {
      unsub?.();
      reject(new Error("Saga timed out after 30s"));
    }, 3e4);
    unsub = store2.subscribe(() => {
      const state = store2.getState();
      const fetching = isFetching(state);
      if (fetching) started = true;
      if (started && !fetching) {
        clearTimeout(timer);
        unsub();
        resolve2(getResult(state));
      }
    });
    store2.dispatch(action);
  });
}

// cli/commands/voltage.js
var voltageColor = (val) => {
  if (val == null) return import_chalk.default.gray("-");
  const n = parseFloat(val);
  if (n >= 12.5) return import_chalk.default.green(String(val));
  if (n >= 11.8) return import_chalk.default.yellow(String(val));
  return import_chalk.default.red(String(val));
};
var voltageCommand = new import_commander.Command("voltage").description("Voltage history from Domotica_transactions").option("--from <date>", "Start date ISO, e.g. 2026-05-01").option("--to <date>", "End date ISO, e.g. 2026-05-20").option("--limit <n>", "Max rows to display", "100").option("--format <fmt>", "Output format: table | json", "table").action(async (opts) => {
  const payload = {};
  if (opts.from) payload.startDate = opts.from;
  if (opts.to) payload.endDate = opts.to;
  process.stdout.write(import_chalk.default.cyan("Fetching voltage history...\n"));
  try {
    const data = await waitForSaga(
      store_default,
      fetchVoltageRequest(Object.keys(payload).length ? payload : void 0),
      {
        isFetching: (s) => s.domoticaTransaction.voltageFetching,
        getResult: (s) => s.domoticaTransaction.voltageData ?? []
      }
    );
    const rows = data.slice(0, parseInt(opts.limit, 10));
    if (opts.format === "json") {
      console.log(JSON.stringify(rows, null, 2));
      process.exit(0);
    }
    if (rows.length === 0) {
      console.log(import_chalk.default.yellow("No records found for the specified range."));
      process.exit(0);
    }
    const table = new import_cli_table3.default({
      head: ["#", "Date", "Value", "Unit", "Device", "Description"].map(
        (h) => import_chalk.default.bold.white(h)
      ),
      style: { compact: true, "padding-left": 1 }
    });
    rows.forEach((r, i) => {
      table.push([
        import_chalk.default.gray(i + 1),
        import_chalk.default.dim(r.createdAt?.slice(0, 19).replace("T", " ") ?? "-"),
        voltageColor(r.value ?? r.amount),
        r.unit ?? "-",
        import_chalk.default.cyan(r.device ?? "-"),
        r.description ?? "-"
      ]);
    });
    const range = opts.from || opts.to ? import_chalk.default.dim(`  ${opts.from ?? "last 24h"} \u2192 ${opts.to ?? "now"}`) : import_chalk.default.dim("  Last 24 hours");
    console.log(import_chalk.default.bold.blue(`
Voltage History \u2014 ${rows.length} records`) + "  " + range);
    console.log(table.toString());
    console.log();
  } catch (err) {
    console.error(import_chalk.default.red(`
Error: ${err.message}`));
    process.exit(1);
  }
  process.exit(0);
});

// cli/commands/drivers.js
var import_commander2 = require("commander");
var import_chalk2 = __toESM(require("chalk"));
var import_cli_table32 = __toESM(require("cli-table3"));
var driversCommand = new import_commander2.Command("drivers").description("List taxi drivers from tapsi").requiredOption("--tenant <id>", "Tenant ID (required)").option("--inactive", "Include inactive drivers", false).option("--format <fmt>", "Output format: table | json", "table").action(async (opts) => {
  setTenantId(opts.tenant);
  process.stdout.write(import_chalk2.default.cyan("Fetching drivers...\n"));
  try {
    const data = await waitForSaga(store_default, fetchRequest2(), {
      isFetching: (s) => s.taxiDriver.fetching,
      getResult: (s) => s.taxiDriver.data ?? []
    });
    const rows = opts.inactive ? data : data.filter((d) => d.active !== false);
    if (opts.format === "json") {
      console.log(JSON.stringify(rows, null, 2));
      process.exit(0);
    }
    if (rows.length === 0) {
      console.log(import_chalk2.default.yellow("No drivers found."));
      process.exit(0);
    }
    const table = new import_cli_table32.default({
      head: ["#", "Name", "ID", "Phone", "Default $", "Sunday $", "Vehicle", "Active"].map(
        (h) => import_chalk2.default.bold.white(h)
      ),
      style: { compact: true, "padding-left": 1 }
    });
    rows.forEach((d, i) => {
      const active2 = d.active !== false;
      table.push([
        import_chalk2.default.gray(i + 1),
        active2 ? import_chalk2.default.white(d.name ?? "-") : import_chalk2.default.dim(d.name ?? "-"),
        import_chalk2.default.dim(d.idNumber ?? "-"),
        d.phone ?? "-",
        d.defaultAmount != null ? import_chalk2.default.green(`$${d.defaultAmount.toLocaleString()}`) : "-",
        d.defaultAmountSunday != null ? import_chalk2.default.yellow(`$${d.defaultAmountSunday.toLocaleString()}`) : "-",
        import_chalk2.default.cyan(d.defaultVehicle ?? "-"),
        active2 ? import_chalk2.default.green("yes") : import_chalk2.default.red("no")
      ]);
    });
    const total = data.length;
    const active = data.filter((d) => d.active !== false).length;
    console.log(
      import_chalk2.default.bold.blue(`
Drivers \u2014 ${rows.length} shown`) + import_chalk2.default.dim(`  (${active} active / ${total} total)`)
    );
    console.log(table.toString());
    console.log();
  } catch (err) {
    console.error(import_chalk2.default.red(`
Error: ${err.message}`));
    process.exit(1);
  }
  process.exit(0);
});

// cli/commands/vehicles.js
var import_commander3 = require("commander");
var import_chalk3 = __toESM(require("chalk"));
var import_cli_table33 = __toESM(require("cli-table3"));
var vehiclesCommand = new import_commander3.Command("vehicles").description("List taxi vehicles from tapsi").requiredOption("--tenant <id>", "Tenant ID (required)").option("--inactive", "Include inactive vehicles", false).option("--format <fmt>", "Output format: table | json", "table").action(async (opts) => {
  setTenantId(opts.tenant);
  process.stdout.write(import_chalk3.default.cyan("Fetching vehicles...\n"));
  try {
    const data = await waitForSaga(store_default, fetchRequest3(), {
      isFetching: (s) => s.taxiVehicle.fetching,
      getResult: (s) => s.taxiVehicle.data ?? []
    });
    const rows = opts.inactive ? data : data.filter((v) => v.active !== false);
    if (opts.format === "json") {
      console.log(JSON.stringify(rows, null, 2));
      process.exit(0);
    }
    if (rows.length === 0) {
      console.log(import_chalk3.default.yellow("No vehicles found."));
      process.exit(0);
    }
    const table = new import_cli_table33.default({
      head: ["#", "Plate", "Brand", "Model", "Year", "Active"].map(
        (h) => import_chalk3.default.bold.white(h)
      ),
      style: { compact: true, "padding-left": 1 }
    });
    rows.forEach((v, i) => {
      const active2 = v.active !== false;
      table.push([
        import_chalk3.default.gray(i + 1),
        import_chalk3.default.bold.cyan(v.plate ?? "-"),
        v.brand ?? "-",
        v.model ?? "-",
        v.year ?? "-",
        active2 ? import_chalk3.default.green("yes") : import_chalk3.default.red("no")
      ]);
    });
    const total = data.length;
    const active = data.filter((v) => v.active !== false).length;
    console.log(
      import_chalk3.default.bold.blue(`
Vehicles \u2014 ${rows.length} shown`) + import_chalk3.default.dim(`  (${active} active / ${total} total)`)
    );
    console.log(table.toString());
    console.log();
  } catch (err) {
    console.error(import_chalk3.default.red(`
Error: ${err.message}`));
    process.exit(1);
  }
  process.exit(0);
});

// cli/commands/finance/accountStatus.js
var import_commander4 = require("commander");
var import_chalk4 = __toESM(require("chalk"));
var import_cli_table34 = __toESM(require("cli-table3"));
var import_auth3 = require("firebase/auth");
init_settings();
var import_firestore10 = require("firebase/firestore");

// src/services/firebase/admin/tenants.js
init_settings();
var import_firestore8 = require("firebase/firestore");
init_firebaseClient();
var getTenants = async () => {
  const q = (0, import_firestore8.query)((0, import_firestore8.collection)(db, COL_TENANTS), (0, import_firestore8.orderBy)("name", "asc"));
  const snap = await firestoreCall(() => (0, import_firestore8.getDocs)(q));
  return snap.docs.map((d) => {
    const { createdAt, ...rest } = d.data();
    return { id: d.id, ...rest, createdAt: createdAt?.toDate().toISOString() ?? null };
  });
};

// src/services/firebase/security/users.js
init_settings();
var import_firestore9 = require("firebase/firestore");
init_firebaseClient();
var hashPassword = async (plainText) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(plainText);
  const buffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
};
var getUserForAuth = async (username) => {
  const snap = await firestoreCall(() => (0, import_firestore9.getDoc)((0, import_firestore9.doc)(db, COL_USERS, username)));
  if (!snap.exists()) return null;
  return { username: snap.id, ...snap.data() };
};
var getAllUsers = async () => {
  const q = (0, import_firestore9.query)((0, import_firestore9.collection)(db, COL_USERS), (0, import_firestore9.orderBy)("name", "asc"));
  const snap = await firestoreCall(() => (0, import_firestore9.getDocs)(q));
  return snap.docs.map((d) => {
    const { passwordHash: _, createdAt, ...rest } = d.data();
    return { username: d.id, ...rest, createdAt: createdAt?.toDate().toISOString() ?? null };
  });
};

// cli/commands/finance/accountStatus.js
var now = /* @__PURE__ */ new Date();
var CURRENT_YEAR = now.getFullYear();
var CURRENT_MONTH = now.getMonth() + 1;
var MONTH_NAMES2 = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];
var fmt = (n) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n ?? 0);
function isApplicableToMonth(account, month) {
  if (!account.active) return false;
  if (account.period === "Mensuales") return true;
  if (account.period === "Anuales") return MONTH_NAMES2.indexOf(account.monthStartAt) + 1 === month;
  if (account.period === "Trimestrales" || account.period === "Cuatrimestrales" || account.period === "Semestrales") {
    const startMonth = MONTH_NAMES2.indexOf(account.monthStartAt) + 1;
    if (startMonth === 0) return false;
    const interval = account.period === "Trimestrales" ? 3 : account.period === "Cuatrimestrales" ? 4 : 6;
    return (month - startMonth + 12) % interval === 0;
  }
  return true;
}
function getStatus(account, payments, monthStr) {
  const paid = payments.reduce((s, t) => s + (t.amount || 0), 0);
  const target = account.targetAmount > 0 ? account.targetAmount : null;
  if (target !== null) {
    if (paid >= target) return { label: "Pagado", paid };
    if (paid > 0) return { label: "Parcial", paid, remaining: target - paid };
    const [y2, m2] = monthStr.split("-").map(Number);
    const due2 = new Date(y2, m2 - 1, account.maxDatePay || 31);
    return today > due2 ? { label: "Vencido", paid: 0, remaining: target } : { label: "Pendiente", paid: 0, remaining: target };
  }
  if (paid > 0 && account.defaultValue > 0 && paid < account.defaultValue)
    return { label: "Parcial", paid };
  if (paid > 0) return { label: "Pagado", paid };
  const [y, m] = monthStr.split("-").map(Number);
  const due = new Date(y, m - 1, account.maxDatePay || 31);
  return today > due ? { label: "Vencido", paid: 0 } : { label: "Pendiente", paid: 0 };
}
var today = /* @__PURE__ */ new Date();
var STATUS_COLOR = {
  Pagado: import_chalk4.default.green,
  Parcial: import_chalk4.default.cyan,
  Vencido: import_chalk4.default.red,
  Pendiente: import_chalk4.default.yellow
};
async function signIn(username, pass) {
  const email = `${username.toLowerCase().trim()}@cashflow.app`;
  try {
    await (0, import_auth3.signInWithEmailAndPassword)(auth, email, pass);
  } catch (err) {
    if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential" || err.code === "auth/invalid-email") {
      const firestoreUser = await getUserForAuth(username.trim());
      if (!firestoreUser) throw new Error("Credenciales incorrectas");
      if (firestoreUser.active === false) throw new Error("Usuario inactivo");
      const inputHash = await hashPassword(pass);
      if (inputHash !== firestoreUser.passwordHash) throw new Error("Credenciales incorrectas");
      try {
        await (0, import_auth3.createUserWithEmailAndPassword)(auth, email, pass);
      } catch {
      }
    } else {
      throw new Error(err.message);
    }
  }
}
async function listTenants() {
  const tenants = await getTenants();
  if (tenants.length === 0) {
    console.log(import_chalk4.default.yellow("No tenants found."));
    return;
  }
  const table = new import_cli_table34.default({
    head: ["ID", "Name", "Slug", "Plan", "Active"].map((h) => import_chalk4.default.bold.white(h)),
    style: { compact: true, "padding-left": 1 }
  });
  tenants.forEach((t) => {
    table.push([
      import_chalk4.default.dim(t.id),
      import_chalk4.default.white(t.name ?? "-"),
      t.slug ?? "-",
      t.plan ?? "-",
      t.active !== false ? import_chalk4.default.green("yes") : import_chalk4.default.red("no")
    ]);
  });
  console.log(import_chalk4.default.bold.blue(`
Tenants \u2014 ${tenants.length} found`));
  console.log(table.toString());
  console.log(import_chalk4.default.dim("\n  Re-run with --tenant <ID> to see account status\n"));
}
var accountStatusCommand = new import_commander4.Command("account-status").description("Monthly account status from CashFlow").option("--tenant <id>", "Tenant ID (omit to list tenants)").option("--month <n>", "Month 1-12", String(CURRENT_MONTH)).option("--year <n>", "Year", String(CURRENT_YEAR)).option("--type <t>", "Incoming | Outcoming | all", "all").option("--user <username>", "CashFlow username for auth").option("--pass <password>", "CashFlow password for auth").option("--format <fmt>", "table | json", "table").action(async (opts) => {
  if (opts.user && opts.pass) {
    try {
      process.stdout.write(import_chalk4.default.cyan("Authenticating...\n"));
      await signIn(opts.user, opts.pass);
      if (auth.currentUser) {
        process.stdout.write(import_chalk4.default.dim(`  Signed in as ${auth.currentUser.email}
`));
      } else {
        process.stdout.write(import_chalk4.default.yellow("  Warning: authenticated via legacy hash \u2014 Firebase token unavailable. Firestore calls may fail.\n"));
      }
    } catch (err) {
      console.error(import_chalk4.default.red(`Auth failed: ${err.message}`));
      process.exit(1);
    }
  }
  if (!opts.tenant) {
    if (opts.user) {
      try {
        const snap = await (0, import_firestore10.getDoc)((0, import_firestore10.doc)(db, "users", opts.user.trim()));
        if (snap.exists()) opts.tenant = snap.data().tenantId ?? null;
      } catch {
      }
    }
    if (!opts.tenant) {
      process.stdout.write(import_chalk4.default.cyan("Fetching tenants...\n"));
      try {
        await listTenants();
      } catch (err) {
        console.error(import_chalk4.default.red(`
Error: ${err.message}`));
        console.error(import_chalk4.default.dim("  Pass --tenant <id> to skip tenant discovery."));
        process.exit(1);
      }
      process.exit(0);
    }
    process.stdout.write(import_chalk4.default.dim(`  Tenant: ${opts.tenant}
`));
  }
  setTenantId(opts.tenant);
  const month = parseInt(opts.month, 10);
  const year = parseInt(opts.year, 10);
  const monthStr = `${year}-${String(month).padStart(2, "0")}`;
  process.stdout.write(import_chalk4.default.cyan("Fetching data...\n"));
  try {
    const [masters, transactions] = await Promise.all([
      waitForSaga(store_default, fetchRequest4(), {
        isFetching: (s) => s.accountsMaster.fetching,
        getResult: (s) => {
          if (s.accountsMaster.isError) throw new Error(s.accountsMaster.error ?? "Failed to fetch accounts");
          return s.accountsMaster.data ?? [];
        }
      }),
      waitForSaga(store_default, fetchRequest5({ year }), {
        isFetching: (s) => s.transaction.fetching,
        getResult: (s) => {
          if (s.transaction.isError) throw new Error(s.transaction.error ?? "Failed to fetch transactions");
          return s.transaction.data ?? [];
        }
      })
    ]);
    const masterPaymentsMap = {};
    transactions.forEach((t) => {
      const period = t.accountMonth ?? t.date?.slice(0, 7);
      if (t.accountMasterId && period === monthStr) {
        if (!masterPaymentsMap[t.accountMasterId]) masterPaymentsMap[t.accountMasterId] = [];
        masterPaymentsMap[t.accountMasterId].push(t);
      }
    });
    const applicable = masters.filter((a) => {
      if (!a.active) return false;
      if (opts.type !== "all" && a.type !== opts.type) return false;
      return isApplicableToMonth(a, month);
    }).sort((a, b) => (a.maxDatePay || 31) - (b.maxDatePay || 31));
    const rows = applicable.map((a) => {
      const payments = masterPaymentsMap[a.id] ?? [];
      const status = getStatus(a, payments, monthStr);
      return { ...a, status };
    });
    if (opts.format === "json") {
      console.log(JSON.stringify(rows, null, 2));
      process.exit(0);
    }
    if (rows.length === 0) {
      console.log(import_chalk4.default.yellow("No accounts applicable for this period."));
      process.exit(0);
    }
    const table = new import_cli_table34.default({
      head: ["#", "Name", "Type", "Status", "Paid", "Expected", "Due"].map(
        (h) => import_chalk4.default.bold.white(h)
      ),
      style: { compact: true, "padding-left": 1 }
    });
    rows.forEach((r, i) => {
      const colorFn = STATUS_COLOR[r.status.label] ?? import_chalk4.default.white;
      table.push([
        import_chalk4.default.gray(i + 1),
        import_chalk4.default.white(r.name ?? "-"),
        r.type === "Incoming" ? import_chalk4.default.green(r.type) : import_chalk4.default.magenta(r.type),
        colorFn(r.status.label),
        r.status.paid > 0 ? import_chalk4.default.green(fmt(r.status.paid)) : import_chalk4.default.dim("-"),
        r.defaultValue ? import_chalk4.default.dim(fmt(r.defaultValue)) : import_chalk4.default.dim("-"),
        r.maxDatePay ? import_chalk4.default.dim(`day ${r.maxDatePay}`) : import_chalk4.default.dim("-")
      ]);
    });
    const paidCount = rows.filter((r) => r.status.label === "Pagado").length;
    const pendingCount = rows.filter(
      (r) => ["Pendiente", "Parcial"].includes(r.status.label)
    ).length;
    const overdueCount = rows.filter((r) => r.status.label === "Vencido").length;
    const totalPaid = rows.reduce((s, r) => s + (r.status.paid || 0), 0);
    const totalExpected = rows.reduce((s, r) => s + (r.defaultValue || 0), 0);
    console.log(
      import_chalk4.default.bold.blue(`
Account Status \u2014 ${monthStr}`) + import_chalk4.default.dim(`  ${rows.length} accounts`)
    );
    console.log(table.toString());
    console.log(
      import_chalk4.default.green(`  Paid: ${paidCount}`) + import_chalk4.default.yellow(`  Pending: ${pendingCount}`) + import_chalk4.default.red(`  Overdue: ${overdueCount}`) + import_chalk4.default.dim(`  Total: ${fmt(totalPaid)} / ${fmt(totalExpected)}`)
    );
    console.log();
  } catch (err) {
    console.error(import_chalk4.default.red(`
Error: ${err.message}`));
    process.exit(1);
  }
  process.exit(0);
});

// cli/commands/sys/tenants.js
var import_commander5 = require("commander");
var import_chalk5 = __toESM(require("chalk"));
var import_cli_table35 = __toESM(require("cli-table3"));
var import_auth4 = require("firebase/auth");
init_settings();
async function signIn2(username, pass) {
  const email = `${username.toLowerCase().trim()}@cashflow.app`;
  await (0, import_auth4.signInWithEmailAndPassword)(auth, email, pass);
}
var tenantsCommand = new import_commander5.Command("tenants").description("List all tenants").option("--user <username>", "CashFlow username for auth").option("--pass <password>", "CashFlow password for auth").option("--inactive", "Include inactive tenants").option("--format <fmt>", "table | json", "table").action(async (opts) => {
  if (opts.user && opts.pass) {
    try {
      process.stdout.write(import_chalk5.default.cyan("Authenticating...\n"));
      await signIn2(opts.user, opts.pass);
      process.stdout.write(import_chalk5.default.dim(`  Signed in as ${auth.currentUser?.email}
`));
    } catch (err) {
      console.error(import_chalk5.default.red(`Auth failed: ${err.message}`));
      process.exit(1);
    }
  }
  process.stdout.write(import_chalk5.default.cyan("Fetching tenants...\n"));
  try {
    const all7 = await getTenants();
    const rows = opts.inactive ? all7 : all7.filter((t) => t.active !== false);
    if (opts.format === "json") {
      console.log(JSON.stringify(rows, null, 2));
      process.exit(0);
    }
    if (rows.length === 0) {
      console.log(import_chalk5.default.yellow("No tenants found."));
      process.exit(0);
    }
    const table = new import_cli_table35.default({
      head: ["ID", "Name", "Slug", "Plan", "Contact", "Active"].map((h) => import_chalk5.default.bold.white(h)),
      style: { compact: true, "padding-left": 1 }
    });
    rows.forEach((t) => {
      table.push([
        import_chalk5.default.dim(t.id),
        import_chalk5.default.white(t.name ?? "-"),
        t.slug ?? "-",
        t.plan ?? "-",
        t.contactEmail ?? t.contactName ?? "-",
        t.active !== false ? import_chalk5.default.green("yes") : import_chalk5.default.red("no")
      ]);
    });
    console.log(import_chalk5.default.bold.blue(`
Tenants \u2014 ${rows.length} found`));
    console.log(table.toString());
    console.log();
  } catch (err) {
    console.error(import_chalk5.default.red(`
Error: ${err.message}`));
    process.exit(1);
  }
  process.exit(0);
});

// cli/commands/sys/users.js
var import_commander6 = require("commander");
var import_chalk6 = __toESM(require("chalk"));
var import_cli_table36 = __toESM(require("cli-table3"));
var import_auth5 = require("firebase/auth");
init_settings();
async function signIn3(username, pass) {
  const email = `${username.toLowerCase().trim()}@cashflow.app`;
  await (0, import_auth5.signInWithEmailAndPassword)(auth, email, pass);
}
var usersCommand = new import_commander6.Command("users").description("List all users").option("--user <username>", "CashFlow username for auth").option("--pass <password>", "CashFlow password for auth").option("--tenant <id>", "Filter by tenant ID").option("--inactive", "Include inactive users").option("--format <fmt>", "table | json", "table").action(async (opts) => {
  if (opts.user && opts.pass) {
    try {
      process.stdout.write(import_chalk6.default.cyan("Authenticating...\n"));
      await signIn3(opts.user, opts.pass);
      process.stdout.write(import_chalk6.default.dim(`  Signed in as ${auth.currentUser?.email}
`));
    } catch (err) {
      console.error(import_chalk6.default.red(`Auth failed: ${err.message}`));
      process.exit(1);
    }
  }
  process.stdout.write(import_chalk6.default.cyan("Fetching users...\n"));
  try {
    let rows = await getAllUsers();
    if (!opts.inactive) rows = rows.filter((u) => u.active !== false);
    if (opts.tenant) rows = rows.filter((u) => u.tenantId === opts.tenant);
    if (opts.format === "json") {
      console.log(JSON.stringify(rows, null, 2));
      process.exit(0);
    }
    if (rows.length === 0) {
      console.log(import_chalk6.default.yellow("No users found."));
      process.exit(0);
    }
    const table = new import_cli_table36.default({
      head: ["Username", "Name", "Role", "Email", "Tenant", "Active"].map(
        (h) => import_chalk6.default.bold.white(h)
      ),
      style: { compact: true, "padding-left": 1 }
    });
    rows.forEach((u) => {
      table.push([
        import_chalk6.default.white(u.username),
        u.name ?? "-",
        u.role ?? "-",
        import_chalk6.default.dim(u.email ?? "-"),
        import_chalk6.default.dim(u.tenantId ?? "-"),
        u.active !== false ? import_chalk6.default.green("yes") : import_chalk6.default.red("no")
      ]);
    });
    console.log(import_chalk6.default.bold.blue(`
Users \u2014 ${rows.length} found`));
    console.log(table.toString());
    console.log();
  } catch (err) {
    console.error(import_chalk6.default.red(`
Error: ${err.message}`));
    process.exit(1);
  }
  process.exit(0);
});

// cli/index.js
if (typeof localStorage === "undefined")
  global.localStorage = { removeItem() {
  }, getItem() {
    return null;
  }, setItem() {
  } };
if (typeof window === "undefined") global.window = { location: { hash: "" } };
var program = new import_commander7.Command().name("my-admin").description("My Admin CLI \u2014 same Redux/Saga stack, terminal output").version("1.0.0");
program.addCommand(voltageCommand);
program.addCommand(driversCommand);
program.addCommand(vehiclesCommand);
var financeCommand = new import_commander7.Command("finance").description("CashFlow finance commands");
financeCommand.addCommand(accountStatusCommand);
program.addCommand(financeCommand);
var sysCommand = new import_commander7.Command("sys").description("System admin commands");
sysCommand.addCommand(tenantsCommand);
sysCommand.addCommand(usersCommand);
program.addCommand(sysCommand);
program.parse(process.argv);
