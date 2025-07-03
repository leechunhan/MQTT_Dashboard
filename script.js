//const mqttBroker = 'ws://localhost:8080';
//const mqttBroker = 'ws://test.mosquitto.org:8080';
const mqttBroker = 'wss://broker.hivemq.com:8884/mqtt';
const topic = 'sensors/data';

const client = mqtt.connect(mqttBroker);
let distanceData = [];
let forceData = [];
let labels = [];

const distanceSpan = document.getElementById('temp');   // Reusing same span IDs
const forceSpan = document.getElementById('hum');

client.on('connect', () => {
  console.log('✅ Connected to MQTT Broker');
  client.subscribe(topic);
});

client.on('message', (topic, message) => {
  try {
    const payload = JSON.parse(message.toString());
    const distance = parseFloat(payload.distance);
    const force = parseFloat(payload.force);
    const time = new Date().toLocaleTimeString();

    if (!isNaN(distance) && !isNaN(force)) {
      updateChart(distance, force, time);
      distanceSpan.textContent = distance.toFixed(2);
      forceSpan.textContent = force.toFixed(2);
    }
  } catch (e) {
    console.error('Invalid message format:', e);
  }
});

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
        title: { display: true, text: 'Distance (cm)' }
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
