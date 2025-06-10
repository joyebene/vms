'use client';

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface ChartProps {
  data: any;
  type: 'bar' | 'line' | 'pie';
  title: string;
  height?: number;
}

export default function VisitorChart({ data, type, title, height = 300 }: ChartProps) {
  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: []
  });

  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold'
        }
      },
    },
  };

  useEffect(() => {
    if (!data) return;

    // Format data based on chart type
    if (type === 'bar' || type === 'line') {
      // For visitor counts by day
      if (data.visitorsByDay) {
        const labels = data.visitorsByDay.map((item: any) => {
          // Format date to MM/DD
          const date = new Date(item.date);
          return `${date.getMonth() + 1}/${date.getDate()}`;
        });

        const chartData = {
          labels,
          datasets: [
            {
              label: 'Visitors',
              data: data.visitorsByDay.map((item: any) => item.count),
              backgroundColor: 'rgba(53, 162, 235, 0.5)',
              borderColor: 'rgb(53, 162, 235)',
              borderWidth: 1,
            },
          ],
        };
        setChartData(chartData);
      }
      // For access data by day
      else if (data.accessesByDay) {
        const labels = data.accessesByDay.map((item: any) => {
          const date = new Date(item.date);
          return `${date.getMonth() + 1}/${date.getDate()}`;
        });

        const chartData = {
          labels,
          datasets: [
            {
              label: 'Accesses',
              data: data.accessesByDay.map((item: any) => item.count),
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
              borderColor: 'rgb(75, 192, 192)',
              borderWidth: 1,
            },
          ],
        };
        setChartData(chartData);
      }
      // For training data by day
      else if (data.trainingsByDay) {
        const labels = data.trainingsByDay.map((item: any) => {
          const date = new Date(item.date);
          return `${date.getMonth() + 1}/${date.getDate()}`;
        });

        const chartData = {
          labels,
          datasets: [
            {
              label: 'Trainings',
              data: data.trainingsByDay.map((item: any) => item.count),
              backgroundColor: 'rgba(153, 102, 255, 0.5)',
              borderColor: 'rgb(153, 102, 255)',
              borderWidth: 1,
            },
          ],
        };
        setChartData(chartData);
      }
    }
    // For pie charts
    else if (type === 'pie') {
      // For visitor status distribution
      if ('checkedIn' in data && 'checkedOut' in data) {
        const chartData = {
          labels: ['Checked In', 'Checked Out', 'Scheduled', 'Cancelled'],
          datasets: [
            {
              data: [data.checkedIn, data.checkedOut, data.scheduled, data.cancelled],
              backgroundColor: [
                'rgba(75, 192, 192, 0.6)',
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 206, 86, 0.6)',
                'rgba(255, 99, 132, 0.6)',
              ],
              borderColor: [
                'rgba(75, 192, 192, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(255, 99, 132, 1)',
              ],
              borderWidth: 1,
            },
          ],
        };
        setChartData(chartData);
      }
      // For visitor purpose distribution
      else if (data.visitorsByPurpose) {
        const chartData = {
          labels: data.visitorsByPurpose.map((item: any) => item.purpose || 'Other'),
          datasets: [
            {
              data: data.visitorsByPurpose.map((item: any) => item.count),
              backgroundColor: [
                'rgba(255, 99, 132, 0.6)',
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 206, 86, 0.6)',
                'rgba(75, 192, 192, 0.6)',
                'rgba(153, 102, 255, 0.6)',
                'rgba(255, 159, 64, 0.6)',
              ],
              borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
              ],
              borderWidth: 1,
            },
          ],
        };
        setChartData(chartData);
      }
    }
  }, [data, type, title]);

  return (
    <div style={{ height: `${height}px` }}>
      {type === 'bar' && <Bar  data={chartData} options={chartOptions} />}
      {type === 'line' && <Line data={chartData} options={chartOptions} />}
      {type === 'pie' && <Pie data={chartData} options={chartOptions} />}
    </div>
  );
}
