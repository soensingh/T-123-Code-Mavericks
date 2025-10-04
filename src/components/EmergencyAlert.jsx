import React, { useState, useEffect } from 'react'
import { Zap, Phone, MapPin, Clock, Shield, AlertTriangle, Users } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const EmergencyAlert = ({ userLocation }) => {
  const { user } = useAuth()
  const [isEmergencyActive, setIsEmergencyActive] = useState(false)
  const [emergencyTimer, setEmergencyTimer] = useState(0)
  const [emergencyType, setEmergencyType] = useState('')
  const [contacts, setContacts] = useState([
    { name: 'Police', number: '100', icon: Shield },
    { name: 'Women Helpline', number: '181', icon: Users },
    { name: 'Emergency Services', number: '108', icon: AlertTriangle }
  ])

  useEffect(() => {
    let interval
    if (isEmergencyActive) {
      interval = setInterval(() => {
        setEmergencyTimer(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isEmergencyActive])

  const startEmergency = (type) => {
    setIsEmergencyActive(true)
    setEmergencyType(type)
    setEmergencyTimer(0)
    
    // In a real app, this would:
    // 1. Send location to emergency contacts
    // 2. Alert nearby volunteers
    // 3. Start recording audio/video
    // 4. Send SMS to emergency contacts
    
    console.log('🚨 EMERGENCY ALERT ACTIVATED', {
      user: user.name,
      type,
      location: userLocation,
      timestamp: new Date().toISOString()
    })
  }

  const stopEmergency = () => {
    setIsEmergencyActive(false)
    setEmergencyTimer(0)
    setEmergencyType('')
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div style={{ 
      padding: '20px',
      minHeight: '100vh',
      background: isEmergencyActive 
        ? 'linear-gradient(135deg, #ff4757 0%, #ff6b7a 100%)'
        : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
    }}>
      {/* Header */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '30px',
        color: isEmergencyActive ? 'white' : '#333'
      }}>
        <Zap size={48} color={isEmergencyActive ? 'white' : '#ff4757'} />
        <h1 style={{ 
          margin: '10px 0', 
          fontSize: '28px', 
          fontWeight: 'bold' 
        }}>
          Emergency Alert
        </h1>
        <p style={{ 
          margin: 0, 
          fontSize: '16px',
          opacity: 0.8
        }}>
          {isEmergencyActive ? 'Emergency in progress...' : 'Quick access to emergency services'}
        </p>
      </div>

      {isEmergencyActive ? (
        /* Active Emergency */
        <div style={{ textAlign: 'center' }}>
          {/* Emergency Status */}
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '20px',
            padding: '30px',
            marginBottom: '30px',
            border: '2px solid rgba(255,255,255,0.3)'
          }}>
            <div style={{
              background: 'white',
              color: '#ff4757',
              borderRadius: '50%',
              width: '80px',
              height: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
              animation: 'pulse 2s infinite'
            }}>
              <Zap size={32} />
            </div>
            
            <h2 style={{ color: 'white', margin: '0 0 10px 0', fontSize: '24px' }}>
              {emergencyType} ALERT ACTIVE
            </h2>
            
            <div style={{ 
              fontSize: '32px', 
              fontWeight: 'bold', 
              color: 'white',
              marginBottom: '15px'
            }}>
              {formatTime(emergencyTimer)}
            </div>
            
            <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>
              Emergency services have been notified<br />
              Your location is being shared with trusted contacts
            </div>
          </div>

          {/* Emergency Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <button
              onClick={stopEmergency}
              style={{
                background: 'rgba(255,255,255,0.9)',
                color: '#ff4757',
                border: 'none',
                borderRadius: '15px',
                padding: '20px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              STOP EMERGENCY ALERT
            </button>

            {userLocation && (
              <div style={{
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '15px',
                padding: '15px',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <MapPin size={20} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: '600' }}>Current Location</div>
                  <div style={{ fontSize: '12px', opacity: 0.8 }}>
                    {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Emergency Options */
        <div>
          {/* Quick Emergency Buttons */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ marginBottom: '20px', color: '#333', textAlign: 'center' }}>
              Quick Emergency Alert
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
              {[
                { type: 'IMMEDIATE DANGER', color: '#ff4757', icon: AlertTriangle },
                { type: 'FEELING UNSAFE', color: '#ff6b7a', icon: Shield },
                { type: 'NEED HELP', color: '#ff8e9e', icon: Users }
              ].map(emergency => (
                <button
                  key={emergency.type}
                  onClick={() => startEmergency(emergency.type)}
                  style={{
                    background: `linear-gradient(135deg, ${emergency.color}, ${emergency.color}dd)`,
                    color: 'white',
                    border: 'none',
                    borderRadius: '15px',
                    padding: '20px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    minHeight: '120px'
                  }}
                >
                  <emergency.icon size={32} />
                  {emergency.type}
                </button>
              ))}
            </div>
          </div>

          {/* Emergency Contacts */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ marginBottom: '20px', color: '#333', textAlign: 'center' }}>
              Emergency Contacts
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {contacts.map(contact => (
                <div
                  key={contact.number}
                  style={{
                    background: 'white',
                    borderRadius: '15px',
                    padding: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    border: '1px solid #eee'
                  }}
                >
                  <div style={{
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    borderRadius: '12px',
                    padding: '12px',
                    color: 'white'
                  }}>
                    <contact.icon size={24} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', color: '#333', marginBottom: '5px' }}>
                      {contact.name}
                    </div>
                    <div style={{ color: '#666', fontSize: '14px' }}>
                      Emergency Helpline
                    </div>
                  </div>
                  <button
                    onClick={() => window.open(`tel:${contact.number}`)}
                    style={{
                      background: '#2ed573',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '10px 20px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontWeight: '600'
                    }}
                  >
                    <Phone size={16} />
                    {contact.number}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Safety Tips */}
          <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>Safety Tips</h4>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#666', fontSize: '14px', lineHeight: '1.6' }}>
              <li>Keep your phone charged and location services enabled</li>
              <li>Share your location with trusted contacts when traveling</li>
              <li>Use well-lit, populated routes when possible</li>
              <li>Trust your instincts - if something feels wrong, seek help</li>
              <li>Emergency alerts notify nearby volunteers and authorities</li>
            </ul>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.8; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}
      </style>
    </div>
  )
}

export default EmergencyAlert