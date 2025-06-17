'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, Users, CheckCircle, AlertTriangle, Plus, FileText, Database, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { supabase, type DashboardStats } from '@/lib/supabase'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useAuthContext } from '@/components/auth/AuthProvider'

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    expiredContracts: 0,
    todayTasks: 0,
    totalCustomers: 0,
  })
  const [loading, setLoading] = useState(true)
  const { user, isAdmin } = useAuthContext()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Get total customers
      const { count: totalCustomers } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })

      // Get expired contracts
      const { count: expiredContracts } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .lt('contract_end_date', new Date().toISOString().split('T')[0])

      // Get tasks stats
      const { count: totalTasks } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })

      const { count: completedTasks } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('is_completed', true)

      const { count: pendingTasks } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('is_completed', false)

      // Get today's tasks
      const today = new Date().toISOString().split('T')[0]
      const { count: todayTasks } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', `${today}T00:00:00`)
        .lt('created_at', `${today}T23:59:59`)

      setStats({
        totalTasks: totalTasks || 0,
        completedTasks: completedTasks || 0,
        pendingTasks: pendingTasks || 0,
        expiredContracts: expiredContracts || 0,
        todayTasks: todayTasks || 0,
        totalCustomers: totalCustomers || 0,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6" dir="rtl">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              مرحباً، {user?.profile?.full_name || user?.email}
            </h1>
            <p className="text-gray-600 text-lg">نظام إدارة المهام - لوحة التحكم الرئيسية</p>
            <div className="flex items-center gap-2 mt-2">
              <Database className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600 font-medium">متصل بقاعدة البيانات Supabase</span>
              <Badge variant={isAdmin ? "default" : "secondary"}>
                {isAdmin ? 'مدير' : 'مستخدم'}
              </Badge>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي المهام</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {loading ? '...' : stats.totalTasks}
                </div>
                <p className="text-xs text-muted-foreground">
                  مكتملة: {stats.completedTasks} | معلقة: {stats.pendingTasks}
                </p>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ 
                        width: stats.totalTasks > 0 ? `${(stats.completedTasks / stats.totalTasks) * 100}%` : '0%' 
                      }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">مهام اليوم</CardTitle>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {loading ? '...' : stats.todayTasks}
                </div>
                <p className="text-xs text-muted-foreground">المهام المضافة اليوم</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-600">نشاط جيد</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">العملاء</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {loading ? '...' : stats.totalCustomers}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {stats.expiredContracts > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {stats.expiredContracts} عقد منتهي
                    </Badge>
                  )}
                  {stats.expiredContracts === 0 && (
                    <Badge className="text-xs bg-green-100 text-green-800">
                      جميع العقود نشطة
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Link href="/customers">
              <Button className="w-full h-20 flex flex-col gap-2 text-lg shadow-lg hover:shadow-xl transition-all">
                <Users className="h-6 w-6" />
                إدارة العملاء
              </Button>
            </Link>

            <Link href="/tasks">
              <Button className="w-full h-20 flex flex-col gap-2 text-lg shadow-lg hover:shadow-xl transition-all" variant="outline">
                <Plus className="h-6 w-6" />
                إدارة المهام
              </Button>
            </Link>

            <Link href="/reports">
              <Button className="w-full h-20 flex flex-col gap-2 text-lg shadow-lg hover:shadow-xl transition-all" variant="outline">
                <FileText className="h-6 w-6" />
                التقارير والإحصائيات
              </Button>
            </Link>

            {isAdmin && (
              <Link href="/admin">
                <Button className="w-full h-20 flex flex-col gap-2 text-lg shadow-lg hover:shadow-xl transition-all" variant="secondary">
                  <Database className="h-6 w-6" />
                  لوحة الإدارة
                </Button>
              </Link>
            )}
          </div>

          {/* Recent Activity */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>معلومات النظام</CardTitle>
              <CardDescription>تفاصيل قاعدة البيانات والإعدادات</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <Database className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">قاعدة بيانات Supabase</p>
                      <p className="text-sm text-gray-600">PostgreSQL مع أمان على مستوى الصفوف</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">نشطة</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-2xl font-bold text-blue-600">{stats.totalCustomers}</p>
                    <p className="text-sm text-gray-600">عدد العملاء</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-2xl font-bold text-purple-600">{stats.totalTasks}</p>
                    <p className="text-sm text-gray-600">إجمالي المهام</p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
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
    </ProtectedRoute>
  )
}