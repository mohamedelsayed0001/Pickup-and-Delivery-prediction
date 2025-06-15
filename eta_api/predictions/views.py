from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import os
import joblib
import numpy as np

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
pickup_model = joblib.load(os.path.join(BASE_DIR, 'ml_models/pickup_model_lightgbm.pkl'))
delivery_model = joblib.load(os.path.join(BASE_DIR, 'ml_models/delivery_model_linearsvr.pkl'))

def home(request):
    return render(request, 'form.html')


class PredictPickup(APIView):
    def post(self, request):
        try:
            data = request.data
            features = [
                float(data.get('courier_id_pickup', 0)),
                float(data.get('lng_pickup', 0)),
                float(data.get('lat_pickup', 0)),
                float(data.get('aoi_type_pickup', 0)),
                float(data.get('pickup_gps_lng_pickup', 0)),
                float(data.get('pickup_gps_lat_pickup', 0)),
                float(data.get('accept_time_utc_pickup', 0)),
                float(data.get('time_window_start_utc_pickup', 0)),
                float(data.get('time_window_end_utc_pickup', 0))
            ]
            prediction = pickup_model.predict([features])[0]
            return Response({'pickup_prediction': prediction}, status=200)
        except Exception as e:
            return Response({'error': str(e)}, status=400)

class PredictDelivery(APIView):
    def post(self, request):
        try:
            data = request.data
            features = [
                float(data.get('courier_id_delivery', 0)),
                float(data.get('lng_delivery', 0)),
                float(data.get('lat_delivery', 0)),
                float(data.get('aoi_type_delivery', 0)),
                float(data.get('delivery_gps_lng', 0)),
                float(data.get('delivery_gps_lat', 0)),
                float(data.get('accept_time_utc_delivery', 0)),
                float(data.get('time_window_start_utc_delivery', 0)),
                float(data.get('time_window_end_utc_delivery', 0))
            ]
            prediction = delivery_model.predict([features])[0]
            return Response({'delivery_prediction': prediction}, status=200)
        except Exception as e:
            return Response({'error': str(e)}, status=400)
