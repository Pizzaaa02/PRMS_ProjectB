import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../api';

const AgentContext = createContext();

export const useAgent = () => {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error('useAgent must be used within an AgentProvider');
  }
  return context;
};

export const AgentProvider = ({ children }) => {
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAgent() {
      try {
        const { data } = await apiClient.get('/auth/me');
        if (data?.data) {
          setAgent({
            id: data.data.id,
            email: data.data.email,
            fullName: data.data.full_name,
            role: data.data.role,
          });
        }
      } catch (error) {
        console.error('Error fetching agent data:', error);
        setAgent(null);
      } finally {
        setLoading(false);
      }
    }

    fetchAgent();
  }, []);

  const value = {
    agent,
    loading,
    login: async (email, password) => {
      const { data } = await apiClient.post('/auth/login', { email, password });
      return data;
    },
    logout: async () => {
      await apiClient.post('/auth/logout');
      setAgent(null);
    },
    registerAgent: async (userData) => {
      await apiClient.post('/auth/register', userData);
    },
  };

  return (
    <AgentContext.Provider value={value}>
      {children}
    </AgentContext.Provider>
  );
};
