// src/app/dashboard/page.tsx
"use client";
import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend
} from 'chart.js';
import { connectWebSocket, sendData } from '@/services/websocket';
import styles from './dashboard.module.css';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const MAX_DATA_POINTS = 50; // Define the maximum number of data points to display

const Dashboard = () => {
  const [chartData, setChartData] = useState({
    labels: [] as string[],
    datasets: [
      {
        label: 'Live Data',
        data: [] as number[],
        borderColor: 'rgba(75,192,192,1)',
        fill: false,
      },
    ],
  });
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    const websocket = connectWebSocket(
      'wss://echo.websocket.org/',
      (incomingData: string) => {
        console.log('Received data:', incomingData);

        // Convert incoming data to a number if it's valid
        const value = parseFloat(incomingData);
        if (!isNaN(value)) {
          const currentTime = new Date().toLocaleTimeString();
          setChartData((prevData) => {
            // Add new data point
            const updatedLabels = [...prevData.labels, currentTime];
            const updatedData = [...prevData.datasets[0].data, value];

            // Remove old data points if exceeding the limit
            if (updatedLabels.length > MAX_DATA_POINTS) {
              updatedLabels.shift();
              updatedData.shift();
            }

            return {
              labels: updatedLabels,
              datasets: [
                {
                  ...prevData.datasets[0],
                  data: updatedData,
                },
              ],
            };
          });
        } else {
          console.error('Unexpected data format:', incomingData);
        }
      },
      () => {
        console.log('WebSocket connection established');
      },
      (error) => {
        console.error('WebSocket error:', error);
      }
    );

    setWs(websocket);

    return () => {
      if (websocket) {
        websocket.close();
      }
    };
  }, []);

  const sendDataToServer = (data: number) => {
    if (ws) {
      sendData(ws, data);
    }
  };

  // Example: Send data every 500 milliseconds
  useEffect(() => {
    const interval = setInterval(() => {
      sendDataToServer(Math.random() * 100); // Send a random float value
    }, 500);

    return () => clearInterval(interval);
  }, [ws]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem: any) => `Value: ${tooltipItem.raw}`,
        },
      },
    },
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Real-Time Dashboard</h1>
      <div className={styles.chartContainer}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default Dashboard;
