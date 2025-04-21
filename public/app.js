// Page Navigation
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.add('hidden'));
    document.getElementById(pageId).classList.remove('hidden');
}

// API endpoints
const API_URL = '/api';

// Form Handling
document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
        const response = await fetch(`${API_URL}/users/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: formData.get('name'),
                email: formData.get('email'),
                password: formData.get('password')
            })
        });
        
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.token);
            showPage('dashboard-page');
        } else {
            alert(data.message || 'Signup failed. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
});

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
        const response = await fetch(`${API_URL}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: formData.get('email'),
                password: formData.get('password')
            })
        });
        
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.token);
            showPage('dashboard-page');
        } else {
            alert(data.message || 'Login failed. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
});

// Check authentication status on load
window.addEventListener('load', () => {
    const token = localStorage.getItem('token');
    if (token) {
        showPage('dashboard-page');
    } else {
        showPage('landing-page');
    }
});

// Settings Page Functions

function logout() {
    localStorage.removeItem('token');
    showPage('landing-page');
}

// ThingSpeak Configuration
const THINGSPEAK_CHANNEL_ID = '2926407';
const THINGSPEAK_READ_API_KEY = 'RH570PWHWYRFXTS4';
const THINGSPEAK_WRITE_API_KEY = 'RFWACHYB24P38NGL';
const THINGSPEAK_API_URL = 'https://api.thingspeak.com';

async function fetchAndUpdateMetrics() {
    try {
        const response = await fetch(`${THINGSPEAK_API_URL}/channels/${THINGSPEAK_CHANNEL_ID}/feeds/last.json?api_key=${THINGSPEAK_READ_API_KEY}`);
        if (!response.ok) throw new Error(`Failed to fetch data: ${response.status}`);
        
        const data = await response.json();
        console.log('ThingSpeak Response:', data);
        
        const airQuality = parseFloat(data.field1) || 0;
        const temperature = parseFloat(data.field2) || 0;
        const humidity = parseFloat(data.field3) || 0;
        
        // Calculate Green Score
        let greenScore = 0;
        
        // Air Quality Score (0-100, lower is better)
        const airQualityScore = Math.max(0, 100 - airQuality);
        
        // Temperature Score (optimal range 20-25°C)
        let tempScore = 100;
        if (temperature < 20) {
            tempScore = Math.max(0, 100 - (20 - temperature) * 5);
        } else if (temperature > 25) {
            tempScore = Math.max(0, 100 - (temperature - 25) * 5);
        }
        
        // Humidity Score (optimal range 40-60%)
        let humidityScore = 100;
        if (humidity < 40) {
            humidityScore = Math.max(0, 100 - (40 - humidity) * 2.5);
        } else if (humidity > 60) {
            humidityScore = Math.max(0, 100 - (humidity - 60) * 2.5);
        }
        
        // Calculate final Green Score (weighted average)
        greenScore = Math.round(
            (airQualityScore * 0.4) + // Air quality has highest weight
            (tempScore * 0.3) +      // Temperature second
            (humidityScore * 0.3)    // Humidity third
        );
        
        // Update UI
        document.getElementById('airQuality').textContent = data.field1 || '--';
        document.getElementById('temperature').textContent = data.field2 ? `${data.field2} °C` : '--';
        document.getElementById('humidity').textContent = data.field3 ? `${data.field3} %` : '--';
        document.getElementById('buzzerStatus').textContent = data.field4 == '1' ? 'ON' : 'OFF';
        document.querySelector('.score').textContent = greenScore;
        
        console.log('Successfully updated metrics');
    } catch (error) {
        console.error('Error updating metrics:', error);
    }
}

async function toggleBuzzer() {
    const btn = document.getElementById('buzzerBtn');
    btn.disabled = true;
    btn.textContent = 'Finding Band... (16s)';
    document.getElementById('buzzerStatus').textContent = 'Searching';

    // Turn ON the buzzer
    await fetch(`${THINGSPEAK_API_URL}/update?api_key=${THINGSPEAK_WRITE_API_KEY}&field4=1`);

    // Wait 16 seconds then turn OFF
    setTimeout(async () => {
        await fetch(`${THINGSPEAK_API_URL}/update?api_key=${THINGSPEAK_WRITE_API_KEY}&field4=0`);
        document.getElementById('buzzerStatus').textContent = 'Ready';
        btn.disabled = false;
        btn.textContent = 'Find My Band';
    }, 16000);
}

// Start fetching data immediately and then every 5 seconds
let updateInterval = setInterval(fetchAndUpdateMetrics, 5000);
fetchAndUpdateMetrics();

function stopRealtimeUpdates() {
    if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
    }
}

// Add event listeners for page navigation to stop updates
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        stopRealtimeUpdates();
        if (btn.classList.contains('active')) {
            startRealtimeUpdates();
        }
    });
});

function startRealtimeUpdates() {
    if (!updateInterval) {
        fetchAndUpdateMetrics();
        updateInterval = setInterval(fetchAndUpdateMetrics, 5000);
    }
}

// History Page Functions
let currentTimeRange = 7;
let charts = {};

async function fetchHistoricalData(days) {
    try {
        const response = await fetch(`${THINGSPEAK_API_URL}/channels/${THINGSPEAK_CHANNEL_ID}/feeds.json?api_key=${THINGSPEAK_READ_API_KEY}&days=${days}`);
        if (!response.ok) throw new Error(`Failed to fetch data: ${response.status}`);
        const data = await response.json();
        return data.feeds;
    } catch (error) {
        console.error('Error fetching historical data:', error);
        return [];
    }
}

function initializeCharts() {
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'day',
                    displayFormats: {
                        day: 'MMM d'
                    }
                },
                grid: {
                    display: false
                },
                ticks: {
                    color: '#ffffff',
                    maxRotation: 45,
                    minRotation: 45,
                    font: {
                        size: 10
                    },
                    maxTicksLimit: 7
                }
            },
            y: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                    drawBorder: false
                },
                ticks: {
                    color: '#ffffff',
                    font: {
                        size: 10
                    },
                    maxTicksLimit: 6,
                    padding: 8
                }
            }
        },
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    color: '#ffffff',
                    boxWidth: 12,
                    padding: 15,
                    font: {
                        size: 11,
                        weight: 'bold'
                    }
                }
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleFont: {
                    size: 12
                },
                bodyFont: {
                    size: 11
                },
                padding: 10,
                displayColors: true
            }
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        },
        elements: {
            point: {
                radius: 3,
                hoverRadius: 5
            },
            line: {
                tension: 0.3,
                borderWidth: 2
            }
        }
    };

    charts.airQuality = new Chart(document.getElementById('airQualityChart'), {
        type: 'line',
        options: {
            ...commonOptions,
            scales: {
                ...commonOptions.scales,
                y: {
                    ...commonOptions.scales.y,
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Air Quality Index',
                        color: '#ffffff'
                    }
                }
            }
        }
    });

    charts.temperature = new Chart(document.getElementById('temperatureChart'), {
        type: 'line',
        options: {
            ...commonOptions,
            scales: {
                ...commonOptions.scales,
                y: {
                    ...commonOptions.scales.y,
                    title: {
                        display: true,
                        text: 'Temperature (°C)',
                        color: '#ffffff'
                    }
                }
            }
        }
    });

    charts.humidity = new Chart(document.getElementById('humidityChart'), {
        type: 'line',
        options: {
            ...commonOptions,
            scales: {
                ...commonOptions.scales,
                y: {
                    ...commonOptions.scales.y,
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Humidity (%)',
                        color: '#ffffff'
                    }
                }
            }
        }
    });
}

async function updateCharts(data) {
    const timestamps = data.map(entry => new Date(entry.created_at));
    const airQualityData = data.map(entry => parseFloat(entry.field1) || 0);
    const temperatureData = data.map(entry => parseFloat(entry.field2) || 0);
    const humidityData = data.map(entry => parseFloat(entry.field3) || 0);

    charts.airQuality.data = {
        labels: timestamps,
        datasets: [{
            label: 'Air Quality',
            data: airQualityData,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        }]
    };

    charts.temperature.data = {
        labels: timestamps,
        datasets: [{
            label: 'Temperature',
            data: temperatureData,
            borderColor: 'rgb(255, 99, 132)',
            tension: 0.1
        }]
    };

    charts.humidity.data = {
        labels: timestamps,
        datasets: [{
            label: 'Humidity',
            data: humidityData,
            borderColor: 'rgb(54, 162, 235)',
            tension: 0.1
        }]
    };

    Object.values(charts).forEach(chart => chart.update());
}

async function updateTimeRange(days) {
    currentTimeRange = days;
    document.querySelectorAll('.range-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.includes(days.toString())) {
            btn.classList.add('active');
        }
    });

    const data = await fetchHistoricalData(days);
    await updateCharts(data);
}

// Initialize charts when history page is shown
document.querySelector('.nav-btn:nth-child(2)').addEventListener('click', async () => {
    showPage('history-page');
    if (!charts.airQuality) {
        const data = await fetchHistoricalData(currentTimeRange);
        initializeCharts();
        await updateCharts(data);
    }
});
