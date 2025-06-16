"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Users, CheckCircle, AlertTriangle, Plus, FileText, Database } from "lucide-react"

interface DashboardStats {
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  expiredContracts: number
  todayTasks: number
  totalCustomers: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    expiredContracts: 0,
    todayTasks: 0,
    totalCustomers: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/stats")
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error("Error fetching stats:", error)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">نظام إدارة المهام</h1>
          <p className="text-gray-600 text-lg">لوحة التحكم الرئيسية - قاعدة بيانات SQLite</p>
          <div className="flex items-center gap-2 mt-2">
            <Database className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-600 font-medium">متصل بقاعدة البيانات</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المهام</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.totalTasks}</div>
              <p className="text-xs text-muted-foreground">
                مكتملة: {stats.completedTasks} | معلقة: {stats.pendingTasks}
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">مهام اليوم</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.todayTasks}</div>
              <p className="text-xs text-muted-foreground">المهام المضافة اليوم</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">العملاء</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.totalCustomers}</div>
              <div className="flex items-center gap-2 mt-1">
                {stats.expiredContracts > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {stats.expiredContracts} عقد منتهي
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Link href="/customers">
            <Button className="w-full h-20 flex flex-col gap-2 text-lg">
              <Users className="h-6 w-6" />
              إدارة العملاء
            </Button>
          </Link>

          <Link href="/tasks">
            <Button className="w-full h-20 flex flex-col gap-2 text-lg" variant="outline">
              <Plus className="h-6 w-6" />
              إدارة المهام
            </Button>
          </Link>

          <Link href="/reports">
            <Button className="w-full h-20 flex flex-col gap-2 text-lg" variant="outline">
              <FileText className="h-6 w-6" />
              التقارير والإحصائيات
            </Button>
          </Link>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>معلومات النظام</CardTitle>
            <CardDescription>تفاصيل قاعدة البيانات والإعدادات</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Database className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">قاعدة بيانات SQLite</p>
                    <p className="text-sm text-gray-600">مخزنة في: /data/app.db</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">نشطة</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{stats.totalCustomers}</p>
                  <p className="text-sm text-gray-600">عدد العملاء</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{stats.totalTasks}</p>
                  <p className="text-sm text-gray-600">إجمالي المهام</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">
                    {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%
                  </p>
                  <p className="text-sm text-gray-600">معدل الإنجاز</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
