// ==============================
// FRONTEND: script.js
// ==============================

const mqtt = require("mqtt");

// MQTT Broker & Topic
const mqttBroker = "ws://test.mosquitto.org:8080/ws";
const topic = "tox/press/data";

// Connect to MQTT
const client = mqtt.connect(mqttBroker);

// Chart Data
let distanceData = [];
let forceData = [];
let labels = [];

// UI Elements Force & Distance
const distanceSpan = document.getElementById("temp");
const forceSpan = document.getElementById("hum");


// When connected
client.on("connect", () => {
  console.log("✅ Frontend connected to MQTT");
  client.subscribe(topic);
});

client.on("message", (topic, message) => {
  try {
    const data = JSON.parse(message.toString());
    console.log("📩 Received:", data);

    const distance = parseFloat(data.distance);
    const force = parseFloat(data.force);
    const time = new Date().toLocaleTimeString();

    // --- Force & Distance chart update ---
    if (!isNaN(distance) && !isNaN(force)) {
      updateChart(distance, force, time);
      distanceSpan.textContent = distance.toFixed(2);
      forceSpan.textContent = force.toFixed(2);
    }

    
  } catch (e) {
    console.error("❌ Invalid message:", e);
  }
});

// Chart.js Setup
const ctx = document.getElementById("mqttChart").getContext("2d");
const chart = new Chart(ctx, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "Distance (mm)",
        borderColor: "green",
        data: [],
        yAxisID: "y1",
      },
      {
        label: "Force (N)",
        borderColor: "purple",
        data: [],
        yAxisID: "y2",
      },
    ],
  },
  options: {
    responsive: true,
    scales: {
      x: {
        title: { display: true, text: "Time" },
      },
      y1: {
        type: "linear",
        position: "left",
        beginAtZero: true,
        title: { display: true, text: "Distance (mm)" },
      },
      y2: {
        type: "linear",
        position: "right",
        beginAtZero: true,
        title: { display: true, text: "Force (N)" },
        grid: { drawOnChartArea: false },
      },
    },
  },
});

// Update Chart
function updateChart(distance, force, label) {
  if (labels.length >= 20) {
    labels.shift();
    distanceData.shift();
    forceData.shift();
  }
  labels.push(label);
  distanceData.push(distance);
  forceData.push(force);

  chart.data.labels = labels;
  chart.data.datasets[0].data = distanceData;
  chart.data.datasets[1].data = forceData;
  chart.update();
}
