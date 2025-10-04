import { useState } from 'react'
import { Users, MapPin, Clock, Star, UserCheck, MessageCircle, Calendar } from 'lucide-react'

const VolunteerCoordination = () => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [volunteerStatus, setVolunteerStatus] = useState('offline')
  
  const volunteers = [
    {
      id: 1,
      name: 'Sarah Mitchell',
      status: 'online',
      location: 'Times Square Area',
      rating: 4.9,
      shifts: 24,
      joinedDate: '2024-08-15',
      specialties: ['Night Patrol', 'Emergency Response']
    },
    {
      id: 2,
      name: 'Mike Rodriguez',
      status: 'online',
      location: 'Central Park West',
      rating: 4.8,
      shifts: 18,
      joinedDate: '2024-09-02',
      specialties: ['Community Outreach', 'Safety Education']
    },
    {
      id: 3,
      name: 'Anna Kim',
      status: 'offline',
      location: 'East Village',
      rating: 4.7,
      shifts: 31,
      joinedDate: '2024-07-10',
      specialties: ['First Aid', 'Crisis Support']
    },
    {
      id: 4,
      name: 'David Thompson',
      status: 'on-patrol',
      location: 'Brooklyn Bridge Area',
      rating: 4.9,
      shifts: 42,
      joinedDate: '2024-06-20',
      specialties: ['Night Patrol', 'Technology Support']
    }
  ]

  const upcomingShifts = [
    {
      id: 1,
      area: 'Times Square',
      date: '2025-10-04',
      time: '8:00 PM - 12:00 AM',
      volunteers: 3,
      needed: 5
    },
    {
      id: 2,
      area: 'Central Park',
      date: '2025-10-04',
      time: '10:00 PM - 2:00 AM',
      volunteers: 2,
      needed: 4
    },
    {
      id: 3,
      area: 'East Village',
      date: '2025-10-05',
      time: '9:00 PM - 1:00 AM',
      volunteers: 4,
      needed: 6
    }
  ]

  const renderDashboard = () => (
    <div className="responsive-grid-2">
      <div className="card">
        <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>Your Volunteer Status</h3>
        
        <div style={{ 
          background: volunteerStatus === 'online' ? 'linear-gradient(135deg, #2ed573, #1dd1a1)' : '#95a5a6',
          color: 'white',
          padding: '20px',
          borderRadius: '10px',
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          <UserCheck size={32} style={{ marginBottom: '10px' }} />
          <h4 style={{ margin: '0 0 10px 0' }}>
            Status: {volunteerStatus === 'online' ? 'Online & Available' : 'Offline'}
          </h4>
          <button
            onClick={() => setVolunteerStatus(volunteerStatus === 'online' ? 'offline' : 'online')}
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '2px solid white',
              padding: '10px 20px',
              borderRadius: '20px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            {volunteerStatus === 'online' ? 'Go Offline' : 'Go Online'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div style={{ 
            textAlign: 'center', 
            padding: '20px', 
            background: 'linear-gradient(135deg, #cce7ff, #b3d9ff)', 
            borderRadius: '12px',
            border: '2px solid #99ccff',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
          }}>
            <Clock size={28} color="#004085" />
            <h4 style={{ margin: '12px 0 8px 0', color: '#004085', fontSize: '16px', fontWeight: 'bold' }}>Hours This Month</h4>
            <p style={{ 
              margin: 0, 
              fontSize: '32px', 
              fontWeight: 'bold', 
              color: '#004085',
              textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
            }}>28</p>
          </div>
          <div style={{ 
            textAlign: 'center', 
            padding: '20px', 
            background: 'linear-gradient(135deg, #fff3cd, #ffeaa7)', 
            borderRadius: '12px',
            border: '2px solid #ffe066',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
          }}>
            <Star size={28} color="#856404" />
            <h4 style={{ margin: '12px 0 8px 0', color: '#856404', fontSize: '16px', fontWeight: 'bold' }}>Rating</h4>
            <p style={{ 
              margin: 0, 
              fontSize: '32px', 
              fontWeight: 'bold', 
              color: '#856404',
              textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
            }}>4.8</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>Upcoming Shifts</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {upcomingShifts.map(shift => (
            <div
              key={shift.id}
              style={{
                padding: '15px',
                border: '1px solid #eee',
                borderRadius: '8px',
                background: '#f8f9fa'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <h4 style={{ margin: 0, color: '#2c3e50' }}>{shift.area}</h4>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  background: shift.volunteers < shift.needed ? '#fff3cd' : '#d4edda',
                  color: shift.volunteers < shift.needed ? '#856404' : '#155724'
                }}>
                  {shift.volunteers}/{shift.needed} volunteers
                </span>
              </div>
              <p style={{ margin: '5px 0', color: '#666', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Calendar size={14} />
                {shift.date} • {shift.time}
              </p>
              <button style={{
                background: shift.volunteers < shift.needed ? '#667eea' : '#95a5a6',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '15px',
                cursor: shift.volunteers < shift.needed ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                marginTop: '10px'
              }}>
                {shift.volunteers < shift.needed ? 'Sign Up' : 'Full'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderVolunteerList = () => (
    <div className="card">
      <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>Active Community Volunteers</h3>
      
      <div className="responsive-grid-3">
        {volunteers.map(volunteer => (
          <div
            key={volunteer.id}
            style={{
              padding: '20px',
              border: '1px solid #eee',
              borderRadius: '10px',
              background: '#f8f9fa'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#2c3e50' }}>{volunteer.name}</h4>
                <p style={{ margin: '0', color: '#666', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <MapPin size={14} />
                  {volunteer.location}
                </p>
              </div>
              <div style={{
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 'bold',
                background: volunteer.status === 'online' ? '#d4edda' : 
                           volunteer.status === 'on-patrol' ? '#cce7ff' : '#f8d7da',
                color: volunteer.status === 'online' ? '#155724' : 
                       volunteer.status === 'on-patrol' ? '#004085' : '#721c24'
              }}>
                {volunteer.status === 'on-patrol' ? 'On Patrol' : volunteer.status}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <div style={{ textAlign: 'center' }}>
                <Star size={16} color="#f39c12" />
                <p style={{ margin: '5px 0 0 0', fontSize: '14px', fontWeight: 'bold' }}>{volunteer.rating}</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <Clock size={16} color="#667eea" />
                <p style={{ margin: '5px 0 0 0', fontSize: '14px', fontWeight: 'bold' }}>{volunteer.shifts} shifts</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <Calendar size={16} color="#2ed573" />
                <p style={{ margin: '5px 0 0 0', fontSize: '14px', fontWeight: 'bold' }}>
                  {new Date(volunteer.joinedDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold', color: '#666' }}>Specialties:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {volunteer.specialties.map((specialty, index) => (
                  <span
                    key={index}
                    style={{
                      padding: '3px 8px',
                      background: '#667eea',
                      color: 'white',
                      borderRadius: '10px',
                      fontSize: '12px'
                    }}
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>

            <button style={{
              width: '100%',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              padding: '10px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <MessageCircle size={16} />
              Contact
            </button>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div>
      <div className="button-group responsive-flex" style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => setActiveTab('dashboard')}
          style={{
            padding: '12px 24px',
            border: activeTab === 'dashboard' ? '2px solid #667eea' : '1px solid #ddd',
            background: activeTab === 'dashboard' ? '#667eea' : 'white',
            color: activeTab === 'dashboard' ? 'white' : '#666',
            borderRadius: '25px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          My Dashboard
        </button>
        <button 
          onClick={() => setActiveTab('volunteers')}
          style={{
            padding: '12px 24px',
            border: activeTab === 'volunteers' ? '2px solid #667eea' : '1px solid #ddd',
            background: activeTab === 'volunteers' ? '#667eea' : 'white',
            color: activeTab === 'volunteers' ? 'white' : '#666',
            borderRadius: '25px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Community Volunteers
        </button>
      </div>

      {activeTab === 'dashboard' ? renderDashboard() : renderVolunteerList()}
    </div>
  )
}

export default VolunteerCoordination