"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart3, PieChart, TrendingUp, Users } from "lucide-react"

interface ChartData {
  employeeStats: { [key: string]: number }
  taskStatusStats: { completed: number; pending: number; total: number }
  monthlyStats: { [key: string]: number }
  customerStats: { active: number; expired: number; total: number }
}

interface InteractiveChartsProps {
  data: ChartData
}

export function InteractiveCharts({ data }: InteractiveChartsProps) {
  const completionRate =
    data.taskStatusStats.total > 0 ? Math.round((data.taskStatusStats.completed / data.taskStatusStats.total) * 100) : 0

  const maxEmployeeTasks = Math.max(...Object.values(data.employeeStats))
  const maxMonthlyTasks = Math.max(...Object.values(data.monthlyStats))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Task Completion Pie Chart */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-blue-600" />
            Task Completion Overview
          </CardTitle>
          <CardDescription>Overall task completion statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-40 h-40">
              <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#10b981"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${completionRate * 2.51} 251`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{completionRate}%</div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{data.taskStatusStats.completed}</div>
              <div className="text-sm text-green-700 dark:text-green-400">Completed</div>
            </div>
            <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{data.taskStatusStats.pending}</div>
              <div className="text-sm text-orange-700 dark:text-orange-400">Pending</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee Performance Chart */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            Employee Performance
          </CardTitle>
          <CardDescription>Tasks completed by each employee</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(data.employeeStats).map(([employee, count]) => (
              <div key={employee} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm">{employee}</span>
                  <Badge variant="outline" className="font-semibold">
                    {count} tasks
                  </Badge>
                </div>
                <Progress value={maxEmployeeTasks > 0 ? (count / maxEmployeeTasks) * 100 : 0} className="h-3" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trends */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Monthly Task Trends
          </CardTitle>
          <CardDescription>Task completion trends over months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(data.monthlyStats).map(([month, count]) => (
              <div key={month} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm">{month}</span>
                  <Badge variant="secondary" className="font-semibold">
                    {count} tasks
                  </Badge>
                </div>
                <Progress value={maxMonthlyTasks > 0 ? (count / maxMonthlyTasks) * 100 : 0} className="h-3" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Customer Status Overview */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            Customer Contract Status
          </CardTitle>
          <CardDescription>Active vs expired contracts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="35"
                  stroke="#ef4444"
                  strokeWidth="10"
                  fill="none"
                  strokeDasharray={`${data.customerStats.total > 0 ? (data.customerStats.expired / data.customerStats.total) * 220 : 0} 220`}
                />
                <circle
                  cx="50"
                  cy="50"
                  r="35"
                  stroke="#10b981"
                  strokeWidth="10"
                  fill="none"
                  strokeDasharray={`${data.customerStats.total > 0 ? (data.customerStats.active / data.customerStats.total) * 220 : 0} 220`}
                  strokeDashoffset={`-${data.customerStats.total > 0 ? (data.customerStats.expired / data.customerStats.total) * 220 : 0}`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold">{data.customerStats.total}</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <div className="text-xl font-bold text-green-600">{data.customerStats.active}</div>
              <div className="text-sm text-green-700 dark:text-green-400">Active</div>
            </div>
            <div className="text-center p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
              <div className="text-xl font-bold text-red-600">{data.customerStats.expired}</div>
              <div className="text-sm text-red-700 dark:text-red-400">Expired</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
