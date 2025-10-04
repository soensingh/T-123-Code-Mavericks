import React, { useState } from 'react'
import { Shield, Users, UserCheck, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const Login = () => {
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    role: 'woman'
  })
  const [showQuickLogin, setShowQuickLogin] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const userData = {
      id: `user-${Date.now()}`,
      name: formData.name,
      phone: formData.phone,
      role: formData.role,
      joinedAt: new Date().toISOString()
    }

    login(userData)
  }

  const quickLogin = (role, name) => {
    const userData = {
      id: `user-${Date.now()}`,
      name: name,
      phone: '9876543210',
      role: role,
      joinedAt: new Date().toISOString()
    }
    login(userData)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '40px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        textAlign: 'center'
      }}>
        {/* Logo */}
        <div style={{ marginBottom: '30px' }}>
          <Shield size={48} color="#667eea" style={{ marginBottom: '10px' }} />
          <h1 style={{ 
            margin: 0, 
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: '28px',
            fontWeight: 'bold'
          }}>
            GuardAid
          </h1>
          <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>
            Community-Driven Night Safety Network
          </p>
        </div>

        {/* Quick Login Toggle */}
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => setShowQuickLogin(!showQuickLogin)}
            style={{
              background: 'none',
              border: '1px solid #667eea',
              color: '#667eea',
              padding: '8px 16px',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              margin: '0 auto'
            }}
          >
            {showQuickLogin ? <EyeOff size={14} /> : <Eye size={14} />}
            {showQuickLogin ? 'Show Form' : 'Quick Demo Login'}
          </button>
        </div>

        {showQuickLogin ? (
          /* Quick Login Options */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Quick Demo Access</h3>
            
            <button
              onClick={() => quickLogin('woman', 'Priya Sharma')}
              style={{
                background: 'linear-gradient(45deg, #ff6b9d, #ff8e9e)',
                color: 'white',
                border: 'none',
                padding: '15px',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              <Users size={20} />
              Login as Woman User
            </button>

            <button
              onClick={() => quickLogin('volunteer', 'Rajesh Kumar')}
              style={{
                background: 'linear-gradient(45deg, #2ed573, #17a2b8)',
                color: 'white',
                border: 'none',
                padding: '15px',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              <Shield size={20} />
              Login as Volunteer
            </button>

            <button
              onClick={() => quickLogin('admin', 'Admin User')}
              style={{
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                color: 'white',
                border: 'none',
                padding: '15px',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              <UserCheck size={20} />
              Login as Admin
            </button>
          </div>
        ) : (
          /* Registration Form */
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Join GuardAid Community</h3>
            
            <div>
              <input
                type="text"
                placeholder="Your Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '15px',
                  border: '1px solid #ddd',
                  borderRadius: '12px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
                required
              />
            </div>

            <div>
              <input
                type="tel"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                style={{
                  width: '100%',
                  padding: '15px',
                  border: '1px solid #ddd',
                  borderRadius: '12px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555', textAlign: 'left' }}>
                I am joining as:
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                style={{
                  width: '100%',
                  padding: '15px',
                  border: '1px solid #ddd',
                  borderRadius: '12px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              >
                <option value="woman">Woman - Seeking Safety</option>
                <option value="volunteer">Volunteer - Community Helper</option>
                <option value="admin">Admin - System Manager</option>
              </select>
            </div>

            <button
              type="submit"
              style={{
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                color: 'white',
                border: 'none',
                padding: '15px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}
            >
              <Shield size={20} />
              Join GuardAid Network
            </button>
          </form>
        )}

        {/* Footer */}
        <div style={{ marginTop: '30px', fontSize: '12px', color: '#888' }}>
          <p style={{ margin: 0 }}>Secure • Anonymous • Community-Driven</p>
        </div>
      </div>
    </div>
  )
}

export default Login