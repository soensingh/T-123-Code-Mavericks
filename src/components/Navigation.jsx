import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Shield, AlertTriangle, Zap, Users, Settings, MapPin, LogOut, Menu, X } from 'lucide-react'

const Navigation = ({ activeSection, setActiveSection }) => {
  const { user, logout, hasRole } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const getMenuItems = () => {
    const items = []

    // Safety Map - Available to all roles
    items.push({
      id: 'map',
      label: 'Safety Map',
      icon: MapPin,
      description: 'Interactive safety mapping'
    })

    // Report Incident - Available to all roles
    items.push({
      id: 'incident',
      label: 'Report Incident',
      icon: AlertTriangle,
      description: 'Report safety concerns'
    })

    // Role-specific items
    if (hasRole('woman')) {
      items.push({
        id: 'emergency',
        label: 'Emergency Alert',
        icon: Zap,
        description: 'Quick emergency assistance'
      })
    }

    if (hasRole('volunteer')) {
      items.push({
        id: 'volunteer-hub',
        label: 'Volunteer Hub',
        icon: Shield,
        description: 'Community assistance center'
      })
    }

    if (hasRole('admin')) {
      items.push({
        id: 'emergency',
        label: 'Emergency Alert',
        icon: Zap,
        description: 'Emergency management'
      })
      items.push({
        id: 'volunteer-hub',
        label: 'Volunteer Hub',
        icon: Shield,
        description: 'Volunteer coordination'
      })
      items.push({
        id: 'admin-panel',
        label: 'Admin Panel',
        icon: Settings,
        description: 'System administration'
      })
    }

    return items
  }

  const getRoleColor = () => {
    switch (user?.role) {
      case 'woman': return '#ff6b9d'
      case 'volunteer': return '#2ed573'
      case 'admin': return '#667eea'
      default: return '#666'
    }
  }

  const getRoleBadge = () => {
    switch (user?.role) {
      case 'woman': return { label: 'Woman', icon: Users }
      case 'volunteer': return { label: 'Volunteer', icon: Shield }
      case 'admin': return { label: 'Admin', icon: Settings }
      default: return { label: 'User', icon: Users }
    }
  }

  const menuItems = getMenuItems()
  const roleBadge = getRoleBadge()
  const roleColor = getRoleColor()

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          zIndex: 1002,
          background: roleColor,
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          padding: '10px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        <span style={{ fontSize: '14px', fontWeight: '600' }}>
          {isMenuOpen ? 'Close' : 'Menu'}
        </span>
      </button>

      {/* Navigation Sidebar */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: isMenuOpen ? 0 : '-320px',
        width: '320px',
        height: '100vh',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRight: '1px solid rgba(0,0,0,0.1)',
        boxShadow: '4px 0 20px rgba(0,0,0,0.1)',
        zIndex: 1001,
        transition: 'left 0.3s ease-in-out',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid rgba(0,0,0,0.1)',
          background: `linear-gradient(135deg, ${roleColor}, ${roleColor}dd)`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
            <Shield size={32} color="white" />
            <div>
              <h2 style={{ margin: 0, color: 'white', fontSize: '20px', fontWeight: 'bold' }}>
                GuardAid
              </h2>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.9)', fontSize: '12px' }}>
                Community Safety Network
              </p>
            </div>
          </div>

          {/* User Info */}
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '12px',
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <roleBadge.icon size={20} color="white" />
            <div style={{ flex: 1 }}>
              <div style={{ color: 'white', fontWeight: '600', fontSize: '14px' }}>
                {user?.name}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>
                {roleBadge.label}
              </div>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div style={{ flex: 1, padding: '20px', overflow: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {menuItems.map(item => {
              const isActive = activeSection === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id)
                    setIsMenuOpen(false)
                  }}
                  style={{
                    background: isActive ? `${roleColor}20` : 'transparent',
                    border: isActive ? `2px solid ${roleColor}` : '2px solid transparent',
                    borderRadius: '12px',
                    padding: '16px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                    ':hover': {
                      background: `${roleColor}10`
                    }
                  }}
                >
                  <item.icon 
                    size={20} 
                    color={isActive ? roleColor : '#666'} 
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontWeight: '600', 
                      fontSize: '14px',
                      color: isActive ? roleColor : '#333',
                      marginBottom: '2px'
                    }}>
                      {item.label}
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#666',
                      lineHeight: '1.3'
                    }}>
                      {item.description}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '20px', borderTop: '1px solid rgba(0,0,0,0.1)' }}>
          <button
            onClick={logout}
            style={{
              width: '100%',
              background: 'linear-gradient(45deg, #ff4757, #ff6b7a)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>

      {/* Overlay */}
      {isMenuOpen && (
        <div
          onClick={() => setIsMenuOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.3)',
            zIndex: 1000
          }}
        />
      )}
    </>
  )
}

export default Navigation