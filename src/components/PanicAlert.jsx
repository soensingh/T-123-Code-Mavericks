import { useState, useEffect } from 'react'
import { AlertTriangle, Phone, MapPin, Zap, Users, Wifi, WifiOff } from 'lucide-react'

const PanicAlert = () => {
  const [alertActive, setAlertActive] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [iotDevices, setIotDevices] = useState([
    {
      id: 1,
      name: 'Smart Siren Station A',
      location: 'Broadway & 42nd St',
      type: 'siren',
      status: 'online',
      lastPing: '2 min ago'
    },
    {
      id: 2,
      name: 'Emergency Light Alert B',
      location: 'Central Park West',
      type: 'light',
      status: 'online',
      lastPing: '1 min ago'
    },
    {
      id: 3,
      name: 'Smart Siren Station C',
      location: '5th Ave & 23rd St',
      type: 'siren',
      status: 'offline',
      lastPing: '15 min ago'
    },
    {
      id: 4,
      name: 'Emergency Light Alert D',
      location: 'Times Square',
      type: 'light',
      status: 'online',
      lastPing: '30 sec ago'
    }
  ])

  const [nearbyVolunteers] = useState([
    { name: 'Sarah M.', distance: '0.2 miles', eta: '2 min' },
    { name: 'Mike R.', distance: '0.4 miles', eta: '4 min' },
    { name: 'Anna K.', distance: '0.6 miles', eta: '6 min' }
  ])

  useEffect(() => {
    let interval
    if (alertActive && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1)
      }, 1000)
    } else if (countdown === 0 && alertActive) {
      // Alert timeout - automatically dispatch
      console.log('Alert dispatched to authorities and volunteers')
    }
    return () => clearInterval(interval)
  }, [alertActive, countdown])

  const activateEmergencyAlert = () => {
    setAlertActive(true)
    setCountdown(10) // 10 second countdown before auto-dispatch
  }

  const cancelAlert = () => {
    setAlertActive(false)
    setCountdown(0)
  }

  const triggerIoTDevices = () => {
    // Simulate triggering nearby IoT devices
    const onlineDevices = iotDevices.filter(device => device.status === 'online')
    alert(`Triggering ${onlineDevices.length} nearby IoT safety devices!`)
  }

  if (alertActive) {
    return (
      <div className="card" style={{ 
        background: 'linear-gradient(135deg, #ff4757, #ff3742)',
        color: 'white',
        textAlign: 'center',
        padding: '40px'
      }}>
        <AlertTriangle size={64} style={{ marginBottom: '20px', animation: 'pulse 1s infinite' }} />
        
        <h1 style={{ margin: '0 0 20px 0', fontSize: '2.5rem' }}>
          EMERGENCY ALERT ACTIVE
        </h1>
        
        {countdown > 0 ? (
          <div>
            <p style={{ fontSize: '1.5rem', margin: '20px 0' }}>
              Auto-dispatching in: <span style={{ fontSize: '3rem', fontWeight: 'bold' }}>{countdown}</span>
            </p>
            <p style={{ fontSize: '1.1rem', opacity: '0.9', margin: '20px 0' }}>
              Authorities and nearby volunteers will be notified automatically.
              Cancel if this was activated by mistake.
            </p>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: '1.5rem', margin: '20px 0' }}>
              🚨 ALERT DISPATCHED 🚨
            </p>
            <p style={{ fontSize: '1.1rem', opacity: '0.9', margin: '20px 0' }}>
              Emergency services and volunteers have been notified.
              Help is on the way!
            </p>
          </div>
        )}

        <div style={{ 
          background: 'rgba(255,255,255,0.2)', 
          padding: '20px', 
          borderRadius: '10px',
          margin: '30px 0'
        }}>
          <h3 style={{ margin: '0 0 15px 0' }}>Nearby Volunteers Notified:</h3>
          {nearbyVolunteers.map((volunteer, index) => (
            <div key={index} style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              margin: '8px 0',
              padding: '8px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '5px'
            }}>
              <span>{volunteer.name}</span>
              <span>{volunteer.distance} • ETA: {volunteer.eta}</span>
            </div>
          ))}
        </div>

        <div className="button-group responsive-flex" style={{ flexWrap: 'wrap' }}>
          {countdown > 0 && (
            <button
              onClick={cancelAlert}
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '2px solid white',
                padding: '15px 30px',
                borderRadius: '25px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Cancel Alert
            </button>
          )}
          
          <button
            onClick={triggerIoTDevices}
            style={{
              background: 'white',
              color: '#ff4757',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '25px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <Zap size={20} />
            Activate IoT Sirens
          </button>
          
          <a
            href="tel:911"
            style={{
              background: '#2c3e50',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '25px',
              fontSize: '18px',
              fontWeight: 'bold',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <Phone size={20} />
            Call 911
          </a>
        </div>

        <style jsx>{`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="responsive-grid-2">
      {/* Emergency Button */}
      <div className="card" style={{ textAlign: 'center' }}>
        <h2 style={{ margin: '0 0 30px 0', color: '#2c3e50' }}>Emergency Alert System</h2>
        
        <div className="emergency-circle" style={{ 
          background: 'linear-gradient(135deg, #ff4757, #ff3742)',
          borderRadius: '50%',
          width: '200px',
          height: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 30px auto',
          cursor: 'pointer',
          transition: 'transform 0.2s ease',
          boxShadow: '0 10px 30px rgba(255,71,87,0.3)'
        }}
        onClick={activateEmergencyAlert}
        onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
        onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
        >
          <div style={{ textAlign: 'center', color: 'white' }}>
            <AlertTriangle size={48} style={{ marginBottom: '10px' }} />
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>
              EMERGENCY
            </h3>
            <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem' }}>
              Tap to Alert
            </p>
          </div>
        </div>

        <div style={{ 
          background: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '10px',
          textAlign: 'left'
        }}>
          <h4 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>When you activate emergency alert:</h4>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#666' }}>
            <li>Nearby volunteers will be immediately notified</li>
            <li>Your location will be shared with responders</li>
            <li>IoT safety devices in your area will be triggered</li>
            <li>Emergency services will be contacted</li>
            <li>10-second countdown before auto-dispatch</li>
          </ul>
        </div>

        <div style={{ 
          marginTop: '20px',
          padding: '15px',
          background: 'linear-gradient(135deg, #2c3e50, #3498db)',
          borderRadius: '10px',
          color: 'white'
        }}>
          <h4 style={{ margin: '0 0 10px 0' }}>Direct Emergency Contact</h4>
          <a
            href="tel:911"
            style={{
              background: 'white',
              color: '#2c3e50',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '20px',
              textDecoration: 'none',
              fontWeight: 'bold',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Phone size={18} />
            Call 911
          </a>
        </div>
      </div>

      {/* IoT Devices Status */}
      <div className="card">
        <h2 style={{ margin: '0 0 20px 0', color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Zap size={24} />
          IoT Safety Network Status
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '15px',
          marginBottom: '20px'
        }}>
          <div style={{ 
            background: '#d4edda', 
            padding: '15px', 
            borderRadius: '8px', 
            textAlign: 'center',
            border: '1px solid #c3e6cb'
          }}>
            <Wifi size={24} color="#155724" />
            <h4 style={{ margin: '10px 0 5px 0', color: '#155724' }}>Online Devices</h4>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#155724' }}>
              {iotDevices.filter(d => d.status === 'online').length}
            </p>
          </div>
          <div style={{ 
            background: '#f8d7da', 
            padding: '15px', 
            borderRadius: '8px', 
            textAlign: 'center',
            border: '1px solid #f5c6cb'
          }}>
            <WifiOff size={24} color="#721c24" />
            <h4 style={{ margin: '10px 0 5px 0', color: '#721c24' }}>Offline Devices</h4>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#721c24' }}>
              {iotDevices.filter(d => d.status === 'offline').length}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {iotDevices.map(device => (
            <div
              key={device.id}
              style={{
                padding: '15px',
                border: '1px solid #eee',
                borderRadius: '8px',
                background: device.status === 'online' ? '#f8fff9' : '#fff8f8',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {device.type === 'siren' ? '📢' : '💡'} {device.name}
                </h4>
                <p style={{ margin: '0', color: '#666', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <MapPin size={14} />
                  {device.location}
                </p>
                <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#888' }}>
                  Last ping: {device.lastPing}
                </p>
              </div>
              <div style={{
                padding: '6px 12px',
                borderRadius: '15px',
                fontSize: '12px',
                fontWeight: 'bold',
                background: device.status === 'online' ? '#d4edda' : '#f8d7da',
                color: device.status === 'online' ? '#155724' : '#721c24',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                {device.status === 'online' ? <Wifi size={12} /> : <WifiOff size={12} />}
                {device.status}
              </div>
            </div>
          ))}
        </div>

        <div style={{ 
          marginTop: '20px',
          padding: '15px',
          background: 'linear-gradient(135deg, #f093fb, #f5576c)',
          borderRadius: '8px',
          color: 'white',
          textAlign: 'center'
        }}>
          <h4 style={{ margin: '0 0 10px 0' }}>Network Coverage</h4>
          <p style={{ margin: '0', fontSize: '14px', opacity: '0.9' }}>
            {Math.round((iotDevices.filter(d => d.status === 'online').length / iotDevices.length) * 100)}% of IoT safety devices are currently online and ready to respond
          </p>
        </div>
      </div>
    </div>
  )
}

export default PanicAlert