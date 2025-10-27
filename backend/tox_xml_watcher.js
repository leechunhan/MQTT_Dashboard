// ==============================
// BACKEND: tox_xml_watcher.js
// ==============================

const mqtt = require("mqtt");
const fs = require("fs");
const path = require("path");
const xml2js = require("xml2js");
const chokidar = require("chokidar");

// ==== CONFIG ====
const broker = "ws://test.mosquitto.org:8080/ws"; // MQTT broker
const topic = "tox/press/data";                    // Topic name
const watchFolder = "C:/Users/Public/TOXSoftware3/export"; // Export folder path
const archiveFolder = path.join(watchFolder, "archive");  // Archive subfolder
// ================

// Ensure archive folder exists
if (!fs.existsSync(archiveFolder)) {
  fs.mkdirSync(archiveFolder, { recursive: true });
}

// Connect to MQTT broker
const client = mqtt.connect(broker);

client.on("connect", () => {
  console.log("✅ Connected to MQTT Broker:", broker);
  console.log("👀 Watching folder:", watchFolder);

  // Track timers per file
  const fileTimers = {};

  chokidar.watch(watchFolder, { persistent: true }).on("add", (filePath) => {
    if (filePath.endsWith(".xml")) {
      console.log("📂 Detected new XML:", filePath);

      // Clear any existing timer for this file
      if (fileTimers[filePath]) clearTimeout(fileTimers[filePath]);

      // Wait 3 seconds before processing (ensure writing finished)
      fileTimers[filePath] = setTimeout(() => {
        processXml(filePath);
        delete fileTimers[filePath];
      }, 3000);
    }
  });
});

// ========== PROCESS XML FUNCTION ==========
function processXml(filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) return console.error("❌ File read error:", err);

    xml2js.parseString(data, (err, result) => {
      if (err) return console.error("❌ XML parse error:", err);

      let payload = {}; // define early to avoid ReferenceError

      try {
        const item = result?.ExportDataList?.item?.[0];
        if (!item) throw new Error("No <item> found in XML");

        // Extract measurement values
        const final = item?.finalMeasurement?.[0];
        const distance = parseFloat(final?.x?.[0]?.value?.[0] || 0);
        const forceKN = parseFloat(final?.y?.[0]?.value?.[0] || 0);
        const force = forceKN * 1000; // kN → N

        // Quality / Process flags with fallback (false if missing)
        const processOK = item?.processOK?.[0] === "true" || false;
        const processNOK = item?.processNOK?.[0] === "true" || false;
        const qualityOK = item?.qualityOK?.[0] === "true" || false;
        const qualityNOK = item?.qualityNOK?.[0] === "true" || false;

        // Skip incomplete files (no OK or NG flag)
        if (!processOK && !processNOK && !qualityOK && !qualityNOK) {
          console.log("⚙️ Skipping incomplete file (no OK/NOK flags).");
          return;
        }

        // Build payload
        payload = { distance, force, processOK, processNOK, qualityOK, qualityNOK };

        // Publish to MQTT broker
        client.publish(topic, JSON.stringify(payload));
        console.log("📤 Published to MQTT:", payload);

        // Move file → archive
        const fileName = path.basename(filePath);
        const archivePath = path.join(archiveFolder, fileName);

        fs.rename(filePath, archivePath, (err) => {
          if (err) console.error("⚠ Could not move file:", err);
          else console.log(`📦 Moved ${fileName} → archive`);
        });
      } catch (e) {
        console.error(`⚠ Missing fields in XML (${path.basename(filePath)}):`, e.message);
      }
    });
  });
}

client.on("error", (err) => {
  console.error("❌ MQTT Error:", err);
});
