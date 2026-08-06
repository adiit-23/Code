"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Flame } from "lucide-react";
export const dynamic = "force-dynamic";
interface UserStatsProps {
  easy: number;
  medium: number;
  hard: number;
  streak: number;
}

export default function UserStatsChart({ easy, medium, hard, streak }: UserStatsProps) {
  const totalSolved = easy + medium + hard;

  // Chart data configuration
  const data = [
    { name: "Easy", value: easy, color: "#22c55e" },   // Green
    { name: "Medium", value: medium, color: "#eab308" }, // Yellow
    { name: "Hard", value: hard, color: "#ef4444" },   // Red
  ];

  return (
    <div className="relative w-64 h-64 flex items-center justify-center bg-white dark:bg-gray-900 rounded-xl shadow-sm border p-4">
      
      {/* 1. The Donut Chart */}
      <div className="absolute inset-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70} // Creates the donut hole
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ fontWeight: 'bold' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* 2. The Center Content (Streak) */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        <div className="flex items-center text-orange-500 font-bold text-3xl">
          <Flame className="h-7 w-7 fill-current mr-1" />
          {streak}
        </div>
        <span className="text-sm text-gray-500 font-medium">Day Streak</span>
        <span className="text-xs text-gray-400 mt-1">{totalSolved} Solved</span>
      </div>

    </div>
  );
}