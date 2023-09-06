if (typeof importScripts === "function") {
    importScripts('../../js/vendor/dexie.min.js');
    var db = new Dexie('database');
    db.version(1).stores({
        schemas: "name,schema",
        changes: "name,change",
        datasets: "name, source, dataset",
        metadata: "name,metadata"
    });
} else {
    var Dexie = require('dexie').default;
    let db = new Dexie('database');
    db.version(1).stores({
        schemas: "name,schema",
        changes: "name,change",
        datasets: "name, source, dataset",
        metadata: "name,metadata"
    });
    module.exports = db;
}