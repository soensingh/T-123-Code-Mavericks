const API_BASE_URL = 'http://192.168.10.124:5001/api';

class ApiService {
  async fetchZones() {
    try {
      const response = await fetch(`${API_BASE_URL}/zones`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching zones:', error);
      return { safeZones: [], dangerZones: [] };
    }
  }

  async createZone(zoneData) {
    try {
      const response = await fetch(`${API_BASE_URL}/zones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(zoneData)
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error creating zone:', error);
      return null;
    }
  }

  async fetchPins() {
    try {
      const response = await fetch(`${API_BASE_URL}/pins`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching pins:', error);
      return [];
    }
  }

  async createPin(pinData) {
    try {
      const response = await fetch(`${API_BASE_URL}/pins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pinData)
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error creating pin:', error);
      return null;
    }
  }

  async deletePin(pinId) {
    try {
      const response = await fetch(`${API_BASE_URL}/pins/${pinId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error deleting pin:', error);
      return null;
    }
  }

  async checkServerHealth() {
    try {
      const response = await fetch('http://192.168.10.124:5001/health');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Server health check failed:', error);
      return null;
    }
  }

  // Incident management
  async fetchIncidents() {
    try {
      const response = await fetch(`${API_BASE_URL}/incidents`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching incidents:', error);
      return [];
    }
  }

  async fetchPendingIncidents() {
    try {
      const response = await fetch(`${API_BASE_URL}/incidents/pending`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching pending incidents:', error);
      return [];
    }
  }

  async createIncident(incidentData) {
    try {
      const response = await fetch(`${API_BASE_URL}/incidents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incidentData)
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error creating incident:', error);
      return null;
    }
  }

  async volunteerAction(incidentId, actionData) {
    try {
      const response = await fetch(`${API_BASE_URL}/incidents/${incidentId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actionData)
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error processing volunteer action:', error);
      return null;
    }
  }
}

export default new ApiService();