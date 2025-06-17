'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Users,
  FileText,
  Download,
  Plus,
  Calendar,
  AlertTriangle,
  CheckCircle,
  UserPlus,
  Building,
  Shield,
  ArrowLeft,
  Edit,
  Trash2,
} from 'lucide-react'
import Link from 'next/link'
import { supabase, type Profile, type Customer, type TaskWithCustomer } from '@/lib/supabase'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export default function AdminPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [tasks, setTasks] = useState<TaskWithCustomer[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddUser, setShowAddUser] = useState(false)
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserName, setNewUserName] = useState('')
  const [newUserRole, setNewUserRole] = useState<'admin' | 'user'>('user')
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCustomers: 0,
    totalTasks: 0,
    completedTasks: 0,
    expiredContracts: 0,
  })

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      // Fetch profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (profilesError) throw profilesError

      // Fetch customers
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false })

      if (customersError) throw customersError

      // Fetch tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          *,
          customer:customers(*),
          profile:profiles(*)
        `)
        .order('created_at', { ascending: false })

      if (tasksError) throw tasksError

      setProfiles(profilesData || [])
      setCustomers(customersData || [])
      setTasks(tasksData || [])

      // Calculate stats
      const totalUsers = profilesData?.length || 0
      const totalCustomers = customersData?.length || 0
      const totalTasks = tasksData?.length || 0
      const completedTasks = tasksData?.filter(task => task.is_completed).length || 0
      const expiredContracts = customersData?.filter(customer => 
        new Date(customer.contract_end_date) < new Date()
      ).length || 0

      setStats({
        totalUsers,
        totalCustomers,
        totalTasks,
        completedTasks,
        expiredContracts,
      })
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: 'admin' | 'user') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error
      fetchAdminData()
    } catch (error) {
      console.error('Error updating user role:', error)
      alert('حدث خطأ في تحديث دور المستخدم')
    }
  }

  const deleteUser = async (userId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟ سيتم حذف جميع بياناته.')) {
      return
    }

    try {
      // Delete from auth.users (this will cascade to profiles)
      const { error } = await supabase.auth.admin.deleteUser(userId)
      if (error) throw error
      
      fetchAdminData()
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('حدث خطأ في حذف المستخدم')
    }
  }

  const downloadUsersReport = () => {
    const csvHeader = 'الاسم,البريد الإلكتروني,الدور,تاريخ التسجيل,عدد المهام'
    const csvRows = profiles.map(profile => {
      const userTasks = tasks.filter(task => task.user_id === profile.id).length
      const date = new Date(profile.created_at).toLocaleDateString('ar-SA')
      return `"${profile.full_name || ''}","${profile.email || ''}","${profile.role === 'admin' ? 'مدير' : 'مستخدم'}","${date}","${userTasks}"`
    })

    const csvContent = [csvHeader, ...csvRows].join('\n')
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `users-report-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const downloadSystemReport = () => {
    const csvHeader = 'النوع,العدد,التفاصيل'
    const csvRows = [
      `"إجمالي المستخدمين","${stats.totalUsers}","مدراء وموظفين"`,
      `"إجمالي العملاء","${stats.totalCustomers}","عملاء مسجلين"`,
      `"إجمالي المهام","${stats.totalTasks}","جميع المهام"`,
      `"المهام المكتملة","${stats.completedTasks}","مهام منجزة"`,
      `"العقود المنتهية","${stats.expiredContracts}","عقود تحتاج تجديد"`,
    ]

    const csvContent = [csvHeader, ...csvRows].join('\n')
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `system-report-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  if (loading) {
    return (
      <ProtectedRoute requireAdmin>
        <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>جاري تحميل بيانات الإدارة...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-6" dir="rtl">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
              <ArrowLeft className="h-4 w-4 ml-2" />
              العودة للوحة التحكم
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <Shield className="h-8 w-8 text-purple-600" />
              <h1 className="text-4xl font-bold text-gray-900">لوحة الإدارة</h1>
            </div>
            <p className="text-gray-600 text-lg">إدارة المستخدمين والنظام</p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card className="shadow-lg border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">المستخدمين</CardTitle>
                <Users className="h-5 w-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">مستخدم نشط</p>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">العملاء</CardTitle>
                <Building className="h-5 w-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{stats.totalCustomers}</div>
                <p className="text-xs text-muted-foreground">عميل مسجل</p>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-l-4 border-l-purple-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">المهام</CardTitle>
                <FileText className="h-5 w-5 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">{stats.totalTasks}</div>
                <p className="text-xs text-muted-foreground">
                  مكتملة: {stats.completedTasks}
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-l-4 border-l-orange-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">معدل الإنجاز</CardTitle>
                <CheckCircle className="h-5 w-5 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">
                  {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">من إجمالي المهام</p>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-l-4 border-l-red-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">عقود منتهية</CardTitle>
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{stats.expiredContracts}</div>
                <p className="text-xs text-red-600">تحتاج تجديد</p>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-8">
            <Button onClick={downloadUsersReport} className="flex items-center gap-2 font-semibold">
              <Download className="h-4 w-4" />
              تحميل تقرير المستخدمين
            </Button>

            <Button onClick={downloadSystemReport} variant="outline" className="flex items-center gap-2 font-semibold">
              <Download className="h-4 w-4" />
              تحميل تقرير النظام
            </Button>
          </div>

          {/* Users Management */}
          <Card className="shadow-lg mb-8">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">إدارة المستخدمين</CardTitle>
              <CardDescription className="text-lg">
                إدارة حسابات المستخدمين وصلاحياتهم ({profiles.length} مستخدم)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-bold">الاسم</TableHead>
                      <TableHead className="font-bold">البريد الإلكتروني</TableHead>
                      <TableHead className="font-bold">الدور</TableHead>
                      <TableHead className="font-bold">عدد المهام</TableHead>
                      <TableHead className="font-bold">تاريخ التسجيل</TableHead>
                      <TableHead className="font-bold">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profiles.map((profile) => {
                      const userTasks = tasks.filter(task => task.user_id === profile.id).length
                      return (
                        <TableRow key={profile.id}>
                          <TableCell className="font-semibold text-lg">
                            {profile.full_name || 'غير محدد'}
                          </TableCell>
                          <TableCell className="font-medium" dir="ltr">
                            {profile.email}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={profile.role}
                              onValueChange={(value: 'admin' | 'user') => updateUserRole(profile.id, value)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">مستخدم</SelectItem>
                                <SelectItem value="admin">مدير</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-semibold">
                              {userTasks} مهمة
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(profile.created_at).toLocaleDateString('ar-SA')}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteUser(profile.id)}
                              className="font-semibold"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              حذف
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>

                {profiles.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-xl font-medium">لا يوجد مستخدمين</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Tasks */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">المهام الحديثة</CardTitle>
              <CardDescription className="text-lg">
                آخر المهام المضافة في النظام
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-bold">العنوان</TableHead>
                      <TableHead className="font-bold">العميل</TableHead>
                      <TableHead className="font-bold">المستخدم</TableHead>
                      <TableHead className="font-bold">الموظف</TableHead>
                      <TableHead className="font-bold">الحالة</TableHead>
                      <TableHead className="font-bold">التاريخ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks.slice(0, 10).map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">{task.title}</TableCell>
                        <TableCell>{task.customer.name}</TableCell>
                        <TableCell>{task.profile?.full_name || 'غير محدد'}</TableCell>
                        <TableCell>{task.employee}</TableCell>
                        <TableCell>
                          {task.is_completed ? (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              مكتملة
                            </Badge>
                          ) : (
                            <Badge variant="outline">معلقة</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(task.created_at).toLocaleDateString('ar-SA')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {tasks.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-xl font-medium">لا توجد مهام</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}