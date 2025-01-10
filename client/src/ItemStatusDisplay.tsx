import { useState, useEffect, useRef } from 'react';

interface Item {
  item_id: number;
  type: string;
  available: boolean;
}

interface WebSocketUpdate {
  item_id: number;
  available: boolean;
  type: string;
}

const ItemStatusDisplay = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // Add function to fetch items
  const fetchItems = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/items');
      const data = await response.json();
      if (data.data) {  // Assuming your API returns data in { data: [...items] } format
        console.log('Fetched items:', data.data);
        setItems(data.data);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  // Call fetchItems when component mounts
  useEffect(() => {
    fetchItems();
  }, []);

  // WebSocket connection effect
  useEffect(() => {
    const connectWebSocket = () => {
      const wsUrl = `ws://localhost:8080/api/ws`;
      console.log('Attempting to connect to:', wsUrl);
      
      const websocket = new WebSocket(wsUrl);
      wsRef.current = websocket;

      websocket.onopen = () => {
        console.log('WebSocket connection established');
        setIsConnected(true);
      };

      websocket.onmessage = (event: MessageEvent) => {
        try {
          const update = JSON.parse(event.data) as WebSocketUpdate;
          console.log('Received WebSocket update:', update);
          setItems(prevItems => 
            prevItems.map(item => 
              item.item_id === update.item_id 
                ? { ...item, available: update.available }
                : item
            )
          );
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      websocket.onclose = (event) => {
        console.log('WebSocket closed:', event);
        setIsConnected(false);
        setTimeout(connectWebSocket, 3000);
      };

      websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        console.log('Cleaning up WebSocket connection');
        wsRef.current.close();
      }
    };
  }, []);

  // Add loading state
  if (items.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="text-center">Loading items...</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Item Status Monitor</h1>
        <div className={`text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
          {isConnected ? 'Connected to real-time updates' : 'Connecting...'}
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        {items.map((item) => (
          <div
            key={item.item_id}
            className={`p-4 rounded-lg border shadow-sm ${
              item.available ? 'bg-green-100 border-green-200' : 'bg-red-100 border-red-200'
            }`}
          >
            <div className="font-medium">
              {item.type} #{item.item_id}
            </div>
            <div className="text-sm mt-1">
              Status: {item.available ? 'Available' : 'In Use'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItemStatusDisplay;