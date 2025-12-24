// MQTT Broker & Topic
const mqttBroker = 'wss://broker.hivemq.com:8884/mqtt';
const topic = 'sensors/data';

// Connect to MQTT
const client = mqtt.connect(mqttBroker);

// Chart Data Arrays
let distanceData = [];
let forceData = [];
let labels = [];

// UI Elements
const distanceSpan = document.getElementById('temp');
const forceSpan = document.getElementById('hum');

// When MQTT Connected
client.on('connect', () => {
  console.log('✅ Connected to MQTT Broker');
  client.subscribe(topic);
});

// When MQTT Message Received
    client.on('message', function (topic, message) {
  try {
    const data = JSON.parse(message.toString());
    const distance = parseFloat(data.distance);
    const force = parseFloat(data.force);
    const time = new Date().toLocaleTimeString(); // for chart
    //const timestamp = new Date().toISOString();  // for Firebase

   

   //  Update UI and Chart
    if (!isNaN(distance) && !isNaN(force)) {
      updateChart(distance, force, time);
      distanceSpan.textContent = distance.toFixed(2);
      forceSpan.textContent = force.toFixed(2);
    }
  } catch (e) {
    console.error('Invalid message format:', e);
  }
  });

// Chart.js Setup
const ctx = document.getElementById('mqttChart').getContext('2d');
const chart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: [],
    datasets: [
      {
        label: 'Distance (mm)',
        borderColor: 'green',
        data: [],
        yAxisID: 'y1'
      },
      {
        label: 'Force (N)',
        borderColor: 'purple',
        data: [],
        yAxisID: 'y2'
      }
    ]
  },
  options: {
    responsive: true,
    scales: {
      x: {
        title: { display: true, text: 'Time' }
      },
      y1: {
        type: 'linear',
        position: 'left',
        beginAtZero: true,
        title: { display: true, text: 'Distance (mm)' }
      },
      y2: {
        type: 'linear',
        position: 'right',
        beginAtZero: true,
        title: { display: true, text: 'Force (N)' },
        grid: { drawOnChartArea: false }
      }
    }
  }
});

// Chart Update Function
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


