import { createContext, useContext, useEffect, useState } from "react";
import { getServices } from "../api/serviceApi";
import seedServices from "../data/services";

const ServicesContext = createContext(null);

export const ServicesProvider = ({ children }) => {
  const [services, setServices] = useState(seedServices);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getServices()
      .then((data) => {
        if (mounted && data.length > 0) setServices(data);
      })
      .catch(() => {
        // Keep seed data on error
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const refreshServices = async () => {
    try {
      const data = await getServices();
      if (data.length > 0) setServices(data);
    } catch {
      // Ignore
    }
  };

  return (
    <ServicesContext.Provider value={{ services, loading, refreshServices }}>
      {children}
    </ServicesContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useServices = () => {
  const context = useContext(ServicesContext);
  if (!context) {
    throw new Error("useServices must be used within a ServicesProvider");
  }
  return context;
};
