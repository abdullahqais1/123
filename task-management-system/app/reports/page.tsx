"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, FileText, BarChart3 } from "lucide-react"
import Link from "next/link"

interface ReportStats {
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  employeeStats: { [key: string]: number }
  monthlyStats: { [key: string]: number }
}

export default function ReportsPage() {
  const [stats, setStats] = useState<ReportStats>({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    employeeStats: {},
    monthlyStats: {},
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReportStats()
  }, [])

  const fetchReportStats = async () => {
    try {
      const response = await fetch("/api/reports/stats")
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error("Error fetching report stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const downloadCSV = async () => {
    try {
      const response = await fetch("/api/reports/csv")
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `tasks-report-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error downloading CSV:", error)
      alert("حدث خطأ في تحميل التقرير")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>جاري تحميل التقارير...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4 ml-2" />
            العودة للرئيسية
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">التقارير والإحصائيات</h1>
          <p className="text-gray-600 mt-2">عرض وتحميل تقارير شاملة عن المهام والأداء</p>
        </div>

        {/* Export Actions */}
        <Card className="mb-6">
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
                تحميل تقرير CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>إجمالي المهام</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.totalTasks}</div>
              <div className="text-sm text-gray-500 mt-2">
                مكتملة: {stats.completedTasks} | معلقة: {stats.pendingTasks}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>معدل الإنجاز</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-500 mt-2">من إجمالي المهام</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>المهام المعلقة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{stats.pendingTasks}</div>
              <div className="text-sm text-gray-500 mt-2">تحتاج متابعة</div>
            </CardContent>
          </Card>
        </div>

        {/* Employee Statistics */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              إحصائيات الموظفين
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.employeeStats).map(([employee, count]) => (
                <div key={employee} className="flex items-center justify-between">
                  <span className="font-medium">{employee}</span>
                  <div className="flex items-center gap-4">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${stats.totalTasks > 0 ? (count / stats.totalTasks) * 100 : 0}%`,
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

        {/* Monthly Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>الإحصائيات الشهرية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.monthlyStats).map(([month, count]) => (
                <div key={month} className="flex items-center justify-between">
                  <span className="font-medium">{month}</span>
                  <div className="flex items-center gap-4">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
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
      </div>
    </div>
  )
}
