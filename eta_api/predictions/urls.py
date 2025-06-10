from django.urls import path
from .views import PredictPickup, PredictDelivery

urlpatterns = [
    path('', home, name='home'),
    path('predict/pickup/', PredictPickup.as_view(), name='predict-pickup'),
    path('predict/delivery/', PredictDelivery.as_view(), name='predict-delivery'),
]