import React from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { AssessmentResult } from '../types';
import { Trophy, Target, TrendingUp, Award } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface ScoreVisualizationProps {
  result: AssessmentResult;
}

export const ScoreVisualization: React.FC<ScoreVisualizationProps> = ({ result }) => {
  const barData = {
    labels: Object.keys(result.categoryScores),
    datasets: [
      {
        label: 'Score (%)',
        data: Object.values(result.categoryScores),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(236, 72, 153, 1)',
        ],
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const doughnutData = {
    labels: ['Correct', 'Incorrect'],
    datasets: [
      {
        data: [result.score, 100 - result.score],
        backgroundColor: ['#10B981', '#EF4444'],
        borderColor: ['#059669', '#DC2626'],
        borderWidth: 2,
      },
    ],
  };

  const lineData = {
    labels: Object.keys(result.categoryScores),
    datasets: [
      {
        label: 'Your Score',
        data: Object.values(result.categoryScores),
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Average Score',
        data: Object.keys(result.categoryScores).map(() => 70),
        borderColor: 'rgba(107, 114, 128, 1)',
        backgroundColor: 'rgba(107, 114, 128, 0.1)',
        tension: 0.4,
        fill: false,
        borderDash: [5, 5],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return { level: 'Excellent', color: 'text-green-600', icon: Trophy };
    if (score >= 75) return { level: 'Good', color: 'text-blue-600', icon: Award };
    if (score >= 60) return { level: 'Average', color: 'text-yellow-600', icon: Target };
    return { level: 'Needs Improvement', color: 'text-red-600', icon: TrendingUp };
  };

  const performance = getPerformanceLevel(result.score);
  const PerformanceIcon = performance.icon;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Score Visualization</h2>
        <p className="text-gray-600">Detailed analysis of your assessment performance</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">{result.score}%</div>
          <div className="text-blue-800 font-medium">Overall Score</div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">{Math.round(result.score * result.totalQuestions / 100)}</div>
          <div className="text-green-800 font-medium">Correct Answers</div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">{Math.floor(result.timeSpent / 60)}m</div>
          <div className="text-purple-800 font-medium">Time Taken</div>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 text-center">
          <PerformanceIcon className={`w-8 h-8 ${performance.color} mx-auto mb-2`} />
          <div className={`font-bold ${performance.color}`}>{performance.level}</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Category Performance</h3>
          <div className="h-64">
            <Bar data={barData} options={chartOptions} />
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Overall Performance</h3>
          <div className="h-64 flex items-center justify-center">
            <div className="w-48 h-48">
              <Doughnut 
                data={doughnutData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom' as const,
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Performance Comparison</h3>
        <div className="h-64">
          <Line 
            data={lineData} 
            options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      return `${context.dataset.label}: ${context.parsed.y}%`;
                    }
                  }
                }
              }
            }}
          />
        </div>
      </div>

      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <div className="bg-green-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-green-800 mb-3">Strong Areas</h3>
          <ul className="space-y-2">
            {Object.entries(result.categoryScores)
              .filter(([_, score]) => score >= 75)
              .map(([category, score]) => (
                <li key={category} className="flex justify-between items-center">
                  <span className="text-green-700">{category}</span>
                  <span className="font-bold text-green-600">{score}%</span>
                </li>
              ))}
          </ul>
        </div>
        
        <div className="bg-red-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-red-800 mb-3">Areas for Improvement</h3>
          <ul className="space-y-2">
            {Object.entries(result.categoryScores)
              .filter(([_, score]) => score < 75)
              .map(([category, score]) => (
                <li key={category} className="flex justify-between items-center">
                  <span className="text-red-700">{category}</span>
                  <span className="font-bold text-red-600">{score}%</span>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  );
};