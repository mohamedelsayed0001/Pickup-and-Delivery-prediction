from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import lightgbm as lgb
import joblib  
import random

app = FastAPI()

# Allow React frontend running on localhost
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update if your frontend runs elsewhere
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "ok"}

# ----- Pickup Prediction -----
model = joblib.load("models/pickup_model_lightgbm.pkl") 
class PickupData(BaseModel):
    pickup_distance_km: float
    pickup_hour: int
    accept_time_hour: int
    time_diff: float

@app.post("/predict-pickup")
def predict_pickup(data: PickupData):
    try:
        features = [[
            data.pickup_distance_km,
            data.pickup_hour,
            data.accept_time_hour,
            data.time_diff
        ]]
        prediction = model.predict(features)
        predicted_time = prediction[0] *60
        print(predicted_time)
        return {"prediction": predicted_time}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ----- Delivery Prediction -----

class DeliveryData(BaseModel):
    order_id: str
    region_id: int
    city: int
    courier_id: int
    lng: float
    lat: float
    aoi_id: int
    aoi_type: int
    accept_gps_lng: float
    accept_gps_lat: float
    delivery_gps_lng: float
    delivery_gps_lat: float
    ds: int  
    delivery_day: int
    delivery_hour: int
    delivery_weekday: int
    delivery_weekend: int

@app.post("/predict-delivery")
def predict_delivery(data: DeliveryData):
    try:
        # Dummy logic: Replace this with model inference
        gps_diff = abs(data.delivery_gps_lng - data.accept_gps_lng) + abs(data.delivery_gps_lat - data.accept_gps_lat)
        predicted_time = gps_diff * 200 + data.delivery_hour * 1.5 + data.delivery_weekend * 5
        return {"prediction": predicted_time}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
