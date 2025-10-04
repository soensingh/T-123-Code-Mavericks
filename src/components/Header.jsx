import { Shield, Users, AlertTriangle } from 'lucide-react'

const Header = () => {
  return (
    <header style={{
      background: 'linear-gradient(135deg, #2c3e50, #3498db)',
      color: 'white',
      padding: '20px 0',
      textAlign: 'center',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
          <Shield size={40} />
          <div>
            <h1 style={{ margin: '0', fontSize: '2.5rem', fontWeight: 'bold' }}>
              GuardAid
            </h1>
            <p style={{ margin: '5px 0 0 0', fontSize: '1.1rem', opacity: '0.9' }}>
              Community-Driven Night Safety Network
            </p>
          </div>
        </div>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '30px', 
          marginTop: '15px',
          fontSize: '0.9rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={16} />
            <span>24/7 Community Support</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} />
            <span>Real-time Safety Alerts</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={16} />
            <span>IoT Safety Network</span>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header