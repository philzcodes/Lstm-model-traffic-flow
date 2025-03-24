from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import pandas as pd
import tensorflow as tf
from keras.models import load_model
from sklearn.preprocessing import MinMaxScaler

# Initialize FastAPI app
app = FastAPI()

# Allow requests from your frontend (adjust origins as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500"],  # Replace with frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the trained model
model = load_model("traffic_flow_predictor.h5")

# Load and preprocess the dataset (for scaling)
data = pd.read_csv('https://archive.ics.uci.edu/ml/machine-learning-databases/00492/Metro_Interstate_Traffic_Volume.csv.gz')

scaler = MinMaxScaler()
traffic_volume_scaled = scaler.fit_transform(data['traffic_volume'].values.reshape(-1, 1))

# Function to prepare the input data
def prepare_input(data, n_steps=10):
    data_scaled = scaler.transform(np.array(data).reshape(-1, 1))
    input_data = np.array([data_scaled[-n_steps:]])  # Last `n_steps` values
    return input_data.reshape(1, n_steps, 1)  # Reshape for LSTM model

# Define request body structure
class TrafficData(BaseModel):
    traffic_values: list[float]  # Ensuring it accepts list of floats

# Define a prediction endpoint
@app.post("/predict/")
def predict(data: TrafficData):
    """
    Accepts the last 10 traffic values and returns the predicted traffic volume.
    """
    traffic_values = data.traffic_values  # Extract values from request body

    if len(traffic_values) != 10:
        return {"error": "Please provide exactly 10 recent traffic volume values"}

    # Prepare input for LSTM
    input_data = prepare_input(traffic_values)

    # Make prediction
    prediction = model.predict(input_data)

    # Inverse transform to get actual value
    predicted_value = scaler.inverse_transform(prediction)[0][0]

    return {"predicted_traffic_volume": float(predicted_value)}

# Define a health check endpoint
@app.get("/health/")  # This will be accessible at `http:// ... /health/`           
def health():
    return {"status": "ok"}

# Define a welcome message
@app.get("/")  # This will be accessible at `http:// ... /`
def welcome():
    return {"message": "Welcome to the traffic flow predictor API!"}

# Run the app with `uvicorn app:app --reload`
# The `--reload` flag will automatically reload the server on code changes
