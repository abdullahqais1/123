'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download, FileText, BarChart3, TrendingUp, Users } from 'lucide-react'
import Link from 'next/link'
import { supabase, type TaskWithCustomer } from '@/lib/supabase'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useAuthContext } from '@/components/auth/AuthProvider'

interface ReportStats {
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  employeeStats: { [key: string]: number }
  monthlyStats: { [key: string]: number }
  customerStats: { [key: string]: number }
}

export default function ReportsPage() {
  const [stats, setStats] = useState<ReportStats>({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    employeeStats: {},
    monthlyStats: {},
    customerStats: {},
  })
  const [tasks, setTasks] = useState<TaskWithCustomer[]>([])
  const [loading, setLoading] = useState(true)
  const { user, isAdmin } = useAuthContext()

  useEffect(() => {
    fetchReportData()
  }, [])

  const fetchReportData = async () => {
    try {
      // Fetch tasks with customer data
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          *,
          customer:customers(*)
        `)
        .order('created_at', { ascending: false })

      if (tasksError) throw tasksError

      const allTasks = tasksData || []
      setTasks(allTasks)

      // Calculate statistics
      const totalTasks = allTasks.length
      const completedTasks = allTasks.filter(task => task.is_completed).length
      const pendingTasks = totalTasks - completedTasks

      // Employee statistics
      const employeeStats: { [key: string]: number } = {}
      allTasks.forEach(task => {
        employeeStats[task.employee] = (employeeStats[task.employee] || 0) + 1
      })

      // Monthly statistics
      const monthlyStats: { [key: string]: number } = {}
      const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
      
      allTasks.forEach(task => {
        const date = new Date(task.created_at)
        const monthName = months[date.getMonth()]
        monthlyStats[monthName] = (monthlyStats[monthName] || 0) + 1
      })

      // Customer statistics
      const customerStats: { [key: string]: number } = {}
      allTasks.forEach(task => {
        customerStats[task.customer.name] = (customerStats[task.customer.name] || 0) + 1
      })

      setStats({
        totalTasks,
        completedTasks,
        pendingTasks,
        employeeStats,
        monthlyStats,
        customerStats,
      })
    } catch (error) {
      console.error('Error fetching report data:', error)
    } finally {
      setLoading(false)
    }
  }

  const downloadCSV = () => {
    const csvHeader = 'العنوان,العميل,الموظف,المدة,الحالة,التاريخ,تاريخ انتهاء العقد'
    const csvRows = tasks.map(task => {
      const status = task.is_completed ? 'مكتملة' : 'معلقة'
      const date = new Date(task.created_at).toLocaleDateString('ar-SA')
      const contractEnd = new Date(task.customer.contract_end_date).toLocaleDateString('ar-SA')

      return `"${task.title}","${task.customer.name}","${task.employee}","${task.term}","${status}","${date}","${contractEnd}"`
    })

    const csvContent = [csvHeader, ...csvRows].join('\n')
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `tasks-report-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const downloadEmployeeReport = () => {
    const csvHeader = 'اسم الموظف,عدد المهام,المهام المكتملة,المهام المعلقة,معدل الإنجاز'
    const csvRows = Object.entries(stats.employeeStats).map(([employee, totalTasks]) => {
      const employeeTasks = tasks.filter(task => task.employee === employee)
      const completedTasks = employeeTasks.filter(task => task.is_completed).length
      const pendingTasks = totalTasks - completedTasks
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

      return `"${employee}","${totalTasks}","${completedTasks}","${pendingTasks}","${completionRate}%"`
    })

    const csvContent = [csvHeader, ...csvRows].join('\n')
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `employee-report-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>جاري تحميل التقارير...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6" dir="rtl">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <Link href="/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
              <ArrowLeft className="h-4 w-4 ml-2" />
              العودة للوحة التحكم
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">التقارير والإحصائيات</h1>
            <p className="text-gray-600 mt-2">عرض وتحميل تقارير شاملة عن المهام والأداء</p>
          </div>

          {/* Export Actions */}
          <Card className="mb-6 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                تصدير البيانات
              </CardTitle>
              <CardDescription>تحميل التقارير بصيغ مختلفة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button onClick={downloadCSV} className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  تحميل تقرير المهام CSV
                </Button>
                <Button onClick={downloadEmployeeReport} variant="outline" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  تحميل تقرير الموظفين CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  إجمالي المهام
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{stats.totalTasks}</div>
                <div className="text-sm text-gray-500 mt-2">
                  مكتملة: {stats.completedTasks} | معلقة: {stats.pendingTasks}
                </div>
                <div className="mt-3">
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

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  معدل الإنجاز
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%
                </div>
                <div className="text-sm text-gray-500 mt-2">من إجمالي المهام</div>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-600">أداء ممتاز</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  الموظفين النشطين
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">
                  {Object.keys(stats.employeeStats).length}
                </div>
                <div className="text-sm text-gray-500 mt-2">موظف يعمل على المهام</div>
              </CardContent>
            </Card>
          </div>

          {/* Employee Statistics */}
          <Card className="mb-6 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                إحصائيات الموظفين
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(stats.employeeStats)
                  .sort(([,a], [,b]) => b - a)
                  .map(([employee, count]) => {
                    const employeeTasks = tasks.filter(task => task.employee === employee)
                    const completedTasks = employeeTasks.filter(task => task.is_completed).length
                    const completionRate = count > 0 ? Math.round((completedTasks / count) * 100) : 0
                    
                    return (
                      <div key={employee} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{employee}</span>
                            <div className="flex items-center gap-4">
                              <span className="text-sm text-gray-600">
                                {completedTasks}/{count} مكتملة
                              </span>
                              <span className="text-sm font-bold">{count} مهمة</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{
                                  width: `${Math.max(...Object.values(stats.employeeStats)) > 0 ? (count / Math.max(...Object.values(stats.employeeStats))) * 100 : 0}%`,
                                }}
                              ></div>
                            </div>
                            <div className="text-sm font-medium text-green-600">
                              {completionRate}% إنجاز
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Statistics */}
          <Card className="mb-6 shadow-lg">
            <CardHeader>
              <CardTitle>الإحصائيات الشهرية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(stats.monthlyStats)
                  .filter(([, count]) => count > 0)
                  .sort(([,a], [,b]) => b - a)
                  .map(([month, count]) => (
                    <div key={month} className="flex items-center justify-between">
                      <span className="font-medium">{month}</span>
                      <div className="flex items-center gap-4">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.max(...Object.values(stats.monthlyStats)) > 0 ? (count / Math.max(...Object.values(stats.monthlyStats))) * 100 : 0}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold w-12 text-left">{count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Customer Statistics */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>إحصائيات العملاء</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(stats.customerStats)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 10)
                  .map(([customer, count]) => (
                    <div key={customer} className="flex items-center justify-between">
                      <span className="font-medium">{customer}</span>
                      <div className="flex items-center gap-4">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.max(...Object.values(stats.customerStats)) > 0 ? (count / Math.max(...Object.values(stats.customerStats))) * 100 : 0}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold w-12 text-left">{count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}