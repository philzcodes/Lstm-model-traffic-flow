// const API_URL = "http://127.0.0.1:8000/predict/";

// async function predictTraffic() {
//     let inputText = document.getElementById("trafficInput").value;
    
//     // Convert input to an array
//     let trafficValues = inputText.split(",").map(Number).filter(n => !isNaN(n));
    
//     // Ensure exactly 10 values are provided
//     if (trafficValues.length !== 10) {
//         document.getElementById("result").innerHTML = "⚠️ Please enter exactly 10 numerical values.";
//         return;
//     }

//     try {
//         let response = await fetch(API_URL, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ traffic_values: trafficValues }) // Ensure correct format
//         });

//         let data = await response.json();
        
//         if (data.predicted_traffic_volume) {
//             document.getElementById("result").innerHTML = `🚗 Predicted Traffic Volume: <span class="text-green-600">${data.predicted_traffic_volume.toFixed(2)}</span>`;
//         } else {
//             document.getElementById("result").innerHTML = "❌ Error in prediction.";
//         }
//     } catch (error) {
//         console.error("Error:", error);
//         document.getElementById("result").innerHTML = "❌ Failed to connect to the server.";
//     }
// }

const API_URL = "http://127.0.0.1:8000/predict/";
let chartInstance = null;

async function predictTraffic() {
    let inputText = document.getElementById("trafficInput").value;
    
    // Convert input to an array
    let trafficValues = inputText.split(",").map(Number).filter(n => !isNaN(n));
    
    // Ensure exactly 10 values are provided
    if (trafficValues.length !== 10) {
        document.getElementById("result").innerHTML = "⚠️ Please enter exactly 10 numerical values.";
        return;
    }

    try {
        let response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ traffic_values: trafficValues })
        });

        let data = await response.json();
        
        if (data.predicted_traffic_volume) {
            document.getElementById("result").innerHTML = `🚗 Predicted Traffic Volume: <span class="text-green-600">${data.predicted_traffic_volume.toFixed(2)}</span>`;
            
            // Update Chart
            updateChart(trafficValues, data.predicted_traffic_volume);
        } else {
            document.getElementById("result").innerHTML = "❌ Error in prediction.";
        }
    } catch (error) {
        console.error("Error:", error);
        document.getElementById("result").innerHTML = "❌ Failed to connect to the server.";
    }
}

function updateChart(trafficValues, predictedValue) {
    let ctx = document.getElementById("trafficChart").getContext("2d");

    // Labels for the last 10 time points + "Prediction"
    let labels = [...Array(10).keys()].map(i => `T-${10 - i}`).concat(["Prediction"]);
    
    // Data points including the predicted value
    let trafficData = [...trafficValues, predictedValue];

    // Destroy existing chart to prevent duplication
    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Traffic Volume",
                data: trafficData,
                borderColor: "blue",
                backgroundColor: "rgba(0, 0, 255, 0.2)",
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: false }
            }
        }
    });
}
