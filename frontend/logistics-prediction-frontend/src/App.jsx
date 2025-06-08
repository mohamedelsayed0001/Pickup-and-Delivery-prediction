import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Loader2, Package, Truck, Wifi, WifiOff } from 'lucide-react';
import './App.css';

const App = () => {
  const [apiStatus, setApiStatus] = useState('checking');
  const [pickupData, setPickupData] = useState({
    pickup_distance_km: '',
    pickup_hour: '',
    accept_time_hour: '',
    time_diff: ''
  });

  const [deliveryData, setDeliveryData] = useState({
    order_id: '',
    region_id: '',
    city: '',
    courier_id: '',
    lng: '',
    lat: '',
    aoi_id: '',
    aoi_type: '',
    accept_gps_lng: '',
    accept_gps_lat: '',
    delivery_gps_lng: '',
    delivery_gps_lat: '',
    ds: '',
    delivery_day: '',
    delivery_hour: '',
    delivery_weekday: '',
    delivery_weekend: ''
  });

  const [pickupResult, setPickupResult] = useState(null);
  const [deliveryResult, setDeliveryResult] = useState(null);
  const [pickupLoading, setPickupLoading] = useState(false);
  const [deliveryLoading, setDeliveryLoading] = useState(false);

  const API_BASE_URL = 'http://localhost:8000';

  // API Status Check
  const checkApiStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (response.ok) {
        setApiStatus('online');
      } else {
        setApiStatus('offline');
      }
    } catch (error) {
      setApiStatus('offline');
      console.error('API Status Error:', error);
    }
  };

  useEffect(() => {
    checkApiStatus();
    const interval = setInterval(checkApiStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Generic prediction function
  const makePrediction = async (endpoint, data, setResult, setLoading) => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const predictionValue = result.prediction || result.predicted_time || result;
      
      setResult({
        success: true,
        value: Math.round(predictionValue * 10) / 10
      });
    } catch (error) {
      console.error('Prediction Error:', error);
      setResult({
        success: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  // Form submission handlers
  const handlePickupSubmit = () => {
    const formData = {
      pickup_distance_km: parseFloat(pickupData.pickup_distance_km),
      pickup_hour: parseInt(pickupData.pickup_hour),
      accept_time_hour: parseInt(pickupData.accept_time_hour),
      time_diff: parseFloat(pickupData.time_diff)
    };

    
    // Validate form data
    const allFieldsFilled = Object.values(formData).every(
      val => val !== '' && val !== null && val !== undefined && !isNaN(val)
    );

    if (!allFieldsFilled) {
      setPickupResult({
        success: false,
        error: 'Please fill in all fields correctly.'
      });
      return;
    }

    makePrediction('predict-pickup', formData, setPickupResult, setPickupLoading);
  };

  const handleDeliverySubmit = () => {
  const formData = {
    order_id: deliveryData.order_id,
    region_id: parseInt(deliveryData.region_id),
    city: parseInt(deliveryData.city),
    courier_id: parseInt(deliveryData.courier_id),
    lng: parseFloat(deliveryData.lng),
    lat: parseFloat(deliveryData.lat),
    aoi_id: parseInt(deliveryData.aoi_id),
    aoi_type: parseInt(deliveryData.aoi_type),
    accept_gps_lng: parseFloat(deliveryData.accept_gps_lng),
    accept_gps_lat: parseFloat(deliveryData.accept_gps_lat),
    delivery_gps_lng: parseFloat(deliveryData.delivery_gps_lng),
    delivery_gps_lat: parseFloat(deliveryData.delivery_gps_lat),
    ds: parseInt(deliveryData.ds),
    delivery_day: parseInt(deliveryData.delivery_day),
    delivery_hour: parseInt(deliveryData.delivery_hour),
    delivery_weekday: parseInt(deliveryData.delivery_weekday),
    delivery_weekend: parseInt(deliveryData.delivery_weekend)
  };

  const allFieldsFilled = Object.values(formData).every(val => val !== '' && val !== null && val !== undefined && !(typeof val === 'number' && isNaN(val)));
  if (!allFieldsFilled) {
    setDeliveryResult({
        success: false,
        error: 'Please fill in all fields correctly.'
      });
      return;
    }

    makePrediction('predict-delivery', formData, setDeliveryResult, setDeliveryLoading);
  };


  // Input change handlers
  const handlePickupChange = (field, value) => {
    setPickupData(prev => ({ ...prev, [field]: value }));
  };

  const handleDeliveryChange = (field, value) => {
    setDeliveryData(prev => ({ ...prev, [field]: value }));
  };

  // Fill sample data for testing
  const fillSampleData = (type) => {
    if (type === 'pickup') {
      setPickupData({
        pickup_distance_km: '4.35478',
        pickup_hour: '14',
        accept_time_hour: '13',
        time_diff: '15.6'
      });
    } else {
      setDeliveryData({
          order_id: '3014923',
          region_id: '10',
          city: '0',
          courier_id: '3605',
          lng: '108.71630',
          lat: '30.90315',
          aoi_id: ' 50',
          aoi_type: '14',
          accept_gps_lng: '108.71812',
          accept_gps_lat: '30.95610',
          delivery_gps_lng: '108.71580',
          delivery_gps_lat: '30.90385',
          ds: '2450',
          delivery_day: '15',
          delivery_hour: '14',
          delivery_weekday: '3',
          delivery_weekend: '0'
      });
    }
  };

  // Status component
  const ApiStatus = () => {
    let statusClass = 'api-status ';
    let icon = null;
    
    if (apiStatus === 'online') {
      statusClass += 'online';
      icon = <Wifi className="icon" />;
    } else if (apiStatus === 'offline') {
      statusClass += 'offline';
      icon = <WifiOff className="icon" />;
    } else {
      statusClass += 'checking';
      icon = <Loader2 className="icon animate-spin" />;
    }
    
    return (
      <div className={statusClass}>
        {icon}
        API Status: {apiStatus === 'online' ? 'Connected and Ready' : apiStatus === 'offline' ? 'Offline or Unreachable' : 'Checking connection...'}
      </div>
    );
  };

  // Form component
  const PredictionForm = ({ 
    title, 
    icon: Icon, 
    data, 
    onChange, 
    onSubmit, 
    loading, 
    result, 
    iconColor,
    buttonText,
    type
  }) => {
    const iconClass = `form-icon ${iconColor}`;
    
    return (
      <div className="prediction-form">
        <div className="form-header">
          <div className={iconClass}>
            <Icon className="icon-white" />
          </div>
          <h2>{title}</h2>
      </div>
      
      <div className="form-content">
        {type === 'delivery' ? (
          <>
            {/* Delivery-specific inputs */}
            <div className="form-grid">
              <div className="form-group">
                <label>Order ID</label>
                <input type="text" value={data.order_id} onChange={(e) => onChange('order_id', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Region ID</label>
                <input type="number" value={data.region_id} onChange={(e) => onChange('region_id', e.target.value)} />
              </div>
              <div className="form-group">
                <label>City</label>
                <input
                  type="number"
                  min="0"
                  max="3"
                  step="1"
                  value={data.city}
                  onChange={(e) => onChange('city', parseInt(e.target.value))}
                />
              </div>
              <div className="form-group">
                <label>Courier ID</label>
                <input type="number" value={data.courier_id} onChange={(e) => onChange('courier_id', e.target.value)} />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Longitude</label>
                <input type="number" step="0.0001" value={data.lng} onChange={(e) => onChange('lng', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Latitude</label>
                <input type="number" step="0.0001" value={data.lat} onChange={(e) => onChange('lat', e.target.value)} />
              </div>
              <div className="form-group">
                <label>AOI ID</label>
                <input
                  type="number"
                  step="1"
                  value={data.aoi_id}
                  onChange={(e) => onChange('aoi_id', parseInt(e.target.value))}
                />
              </div>
              <div className="form-group">
                <label>AOI Type</label>
                <input
                  type="number"
                  step="1"
                  value={data.aoi_type}
                  onChange={(e) => onChange('aoi_type', parseInt(e.target.value))}
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Accept GPS Latitude</label>
                <input type="number" step="0.0001" value={data.accept_gps_lat} onChange={(e) => onChange('accept_gps_lat', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Accept GPS Longitude</label>
                <input type="number" step="0.0001" value={data.accept_gps_lng} onChange={(e) => onChange('accept_gps_lng', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Delivery GPS Latitude</label>
                <input type="number" step="0.0001" value={data.delivery_gps_lat} onChange={(e) => onChange('delivery_gps_lat', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Delivery GPS Longitude</label>
                <input type="number" step="0.0001" value={data.delivery_gps_lng} onChange={(e) => onChange('delivery_gps_lng', e.target.value)} />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Date (ds)</label>
                <input type="date" value={data.ds} onChange={(e) => onChange('ds', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Delivery Day</label>
                <input type="number" value={data.delivery_day} onChange={(e) => onChange('delivery_day', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Delivery Hour</label>
                <input type="number" value={data.delivery_hour} onChange={(e) => onChange('delivery_hour', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Delivery Weekday (0=Mon, 6=Sun)</label>
                <input type="number" value={data.delivery_weekday} onChange={(e) => onChange('delivery_weekday', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Delivery Weekend (0 or 1)</label>
                <input type="number" value={data.delivery_weekend} onChange={(e) => onChange('delivery_weekend', e.target.value)} />
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Default form (non-delivery) */}
            <div className="form-grid">
              <div className="form-group">
                <label>Pickup Distance (km)</label>
                <input type="number" step="0.1" min="0" value={data.pickup_distance_km} onChange={(e) => onChange('pickup_distance_km', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Pickup Hour (0-23)</label>
                <input type="number" min="0" max="23" value={data.pickup_hour} onChange={(e) => onChange('pickup_hour', e.target.value)} />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Accept Time Hour (0-23)</label>
                <input type="number" min="0" max="23" value={data.accept_time_hour} onChange={(e) => onChange('accept_time_hour', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Time Difference (mins)</label>
                <input type="number" min="0" value={data.time_diff} onChange={(e) => onChange('time_diff', e.target.value)} />
              </div>
            </div>
          </>
        )}

        {/* Buttons and result section remain unchanged */}
        <div className="form-actions">
          <button onClick={onSubmit} disabled={loading} className="submit-button">
            {loading ? (
              <>
                <Loader2 className="icon animate-spin" />
                Predicting...
              </>
            ) : (
              buttonText
            )}
          </button>
          <button onClick={() => fillSampleData(type)} className="sample-button">
            Sample Data
          </button>
        </div>



        {result && (
          <div className={`result-container ${result.success ? 'success' : 'error'}`}>
            <div className="result-header">
              {result.success ? <CheckCircle className="icon" /> : <AlertCircle className="icon" />}
              {result.success ? 'Predicted Time' : 'Prediction Error'}
            </div>
            <div className="result-value">
              {result.success ? `${result.value} minutes` : result.error}
            </div>
          </div>
        )}
      </div>
      </div>
    );
  };

  return (
    <div className="app-container">
      <div className="app-content">
        {/* Header */}
        <div className="app-header">
          <h1>🚚 Logistics Prediction System</h1>
          <p>AI-Powered Pickup and Delivery Time Predictions</p>
        </div>

        {/* API Status */}
        <ApiStatus />

        {/* Main Content */}
        <div className="main-content">
          {/* Pickup Prediction */}
          <PredictionForm
            title="Pickup Time Prediction"
            icon={Package}
            data={pickupData}
            onChange={handlePickupChange}
            onSubmit={handlePickupSubmit}
            loading={pickupLoading}
            result={pickupResult}
            iconColor="pickup-icon"
            buttonText="Predict Pickup Time"
            type="pickup"
          />

          {/* Delivery Prediction */}
          <PredictionForm
            title="Delivery Time Prediction"
            icon={Truck}
            data={deliveryData}
            onChange={handleDeliveryChange}
            onSubmit={handleDeliverySubmit}
            loading={deliveryLoading}
            result={deliveryResult}
            iconColor="delivery-icon"
            buttonText="Predict Delivery Time"
            type="delivery"
          />
        </div>

        {/* Footer */}
        <div className="app-footer">
          <p>Powered by LightGBM (Pickup) and LinearSVR (Delivery) Models</p>
        </div>
      </div>
    </div>
  );
};

export default App;