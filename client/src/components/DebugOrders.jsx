import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";

const DebugOrders = () => {
  const { axios } = useContext(AppContext);
  const [debugInfo, setDebugInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const testOrdersAPI = async () => {
    setLoading(true);
    try {
      console.log("Testing orders API...");
      
      // Test seller auth first
      const authResponse = await axios.get("/api/seller/is-auth");
      console.log("Auth response:", authResponse.data);
      
      // Test debug orders endpoint first to check for issues
      const debugResponse = await axios.get("/api/debug/orders");
      console.log("Debug orders response:", debugResponse.data);
      
      // Test orders endpoint
      const ordersResponse = await axios.get("/api/order/seller", {
        params: { page: 1, limit: 10 }
      });
      console.log("Orders response:", ordersResponse.data);
      
      setDebugInfo({
        auth: authResponse.data,
        orders: ordersResponse.data,
        debug: debugResponse.data
      });
      
    } catch (error) {
      console.error("Debug test error:", error);
      setDebugInfo({
        error: {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        }
      });
    }
    setLoading(false);
  };

  const cleanupOrders = async () => {
    setLoading(true);
    try {
      console.log("Cleaning up invalid orders...");
      const response = await axios.post("/api/debug/cleanup-orders");
      console.log("Cleanup response:", response.data);
      
      // Refresh the debug info after cleanup
      await testOrdersAPI();
      
    } catch (error) {
      console.error("Cleanup error:", error);
      setDebugInfo(prev => ({
        ...prev,
        cleanupError: {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        }
      }));
    }
    setLoading(false);
  };

  useEffect(() => {
    testOrdersAPI();
  }, []);

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Debug Orders API</h1>
      
      <div className="mb-4 space-x-2">
        <button 
          onClick={testOrdersAPI}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {loading ? "Testing..." : "Test API"}
        </button>
        
        <button 
          onClick={cleanupOrders}
          disabled={loading}
          className="px-4 py-2 bg-red-500 text-white rounded disabled:opacity-50"
        >
          {loading ? "Cleaning..." : "Cleanup Invalid Data"}
        </button>
      </div>
      
      {debugInfo && (
        <div className="bg-white p-4 rounded shadow">
          <pre className="text-xs overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default DebugOrders;