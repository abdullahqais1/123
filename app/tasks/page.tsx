'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, CheckCircle, Clock, AlertTriangle, Filter, ArrowLeft, Calendar, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { supabase, type Customer, type TaskWithCustomer } from '@/lib/supabase'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useAuthContext } from '@/components/auth/AuthProvider'

const employees = ['علي أحمد', 'فاطمة حسن', 'محمد علي', 'زينب عمر', 'أحمد خليل', 'مريم سعيد']

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskWithCustomer[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredTasks, setFilteredTasks] = useState<TaskWithCustomer[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Form states
  const [title, setTitle] = useState('')
  const [details, setDetails] = useState('')
  const [term, setTerm] = useState('')
  const [employee, setEmployee] = useState('')
  const [customerId, setCustomerId] = useState('')

  // Filter states
  const [activeFilter, setActiveFilter] = useState('all')

  const { user, isAdmin } = useAuthContext()

  useEffect(() => {
    fetchTasks()
    fetchCustomers()
  }, [])

  useEffect(() => {
    filterTasks()
  }, [tasks, activeFilter])

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          customer:customers(*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name')

      if (error) throw error
      setCustomers(data || [])
    } catch (error) {
      console.error('Error fetching customers:', error)
    }
  }

  const filterTasks = () => {
    let filtered = tasks
    const today = new Date().toDateString()

    switch (activeFilter) {
      case 'today':
        filtered = tasks.filter((task) => new Date(task.created_at).toDateString() === today)
        break
      case 'pending-short':
        filtered = tasks.filter((task) => !task.is_completed && task.term === 'قصير')
        break
      case 'pending-long':
        filtered = tasks.filter((task) => !task.is_completed && task.term === 'طويل')
        break
      case 'expired-contracts':
        filtered = tasks.filter((task) => new Date(task.customer.contract_end_date) < new Date())
        break
      case 'completed':
        filtered = tasks.filter((task) => task.is_completed)
        break
      case 'my-tasks':
        filtered = tasks.filter((task) => task.user_id === user?.id)
        break
      default:
        filtered = tasks
    }

    setFilteredTasks(filtered)
  }

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !details || !term || !employee || !customerId || !user) return

    setSubmitting(true)
    try {
      const { error } = await supabase
        .from('tasks')
        .insert({
          title,
          details,
          term,
          employee,
          customer_id: customerId,
          user_id: user.id,
        })

      if (error) throw error

      setTitle('')
      setDetails('')
      setTerm('')
      setEmployee('')
      setCustomerId('')
      fetchTasks()
    } catch (error) {
      console.error('Error adding task:', error)
      alert('حدث خطأ في إضافة المهمة')
    } finally {
      setSubmitting(false)
    }
  }

  const completeTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ is_completed: true })
        .eq('id', taskId)

      if (error) throw error
      fetchTasks()
    } catch (error) {
      console.error('Error completing task:', error)
    }
  }

  const deleteTask = async (taskId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه المهمة؟')) {
      return
    }

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

      if (error) throw error
      fetchTasks()
    } catch (error) {
      console.error('Error deleting task:', error)
      alert('حدث خطأ في حذف المهمة')
    }
  }

  const isContractExpired = (contractEnd: string) => {
    return new Date(contractEnd) < new Date()
  }

  const canEditTask = (task: TaskWithCustomer) => {
    return isAdmin || task.user_id === user?.id
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>جاري تحميل المهام...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">إدارة المهام</h1>
            <p className="text-gray-600 mt-2">إضافة وإدارة مهام العمل اليومية</p>
          </div>

          {/* Add Task Form */}
          <Card className="mb-8 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                إضافة مهمة جديدة
              </CardTitle>
              <CardDescription>أدخل تفاصيل المهمة والعميل المرتبط بها</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={addTask} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer">العميل</Label>
                    <Select value={customerId} onValueChange={setCustomerId} required>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر العميل" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{customer.name}</span>
                              {isContractExpired(customer.contract_end_date) && (
                                <span className="text-red-500 text-xs mr-2">عقد منتهي</span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">عنوان المهمة</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="أدخل عنوان المهمة"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="details">تفاصيل المهمة</Label>
                  <Textarea
                    id="details"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="أدخل تفاصيل المهمة"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="term">مدة المهمة</Label>
                    <Select value={term} onValueChange={setTerm} required>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر مدة المهمة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="قصير">قصيرة المدى</SelectItem>
                        <SelectItem value="طويل">طويلة المدى</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="employee">الموظف المسؤول</Label>
                    <Select value={employee} onValueChange={setEmployee} required>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الموظف" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((emp) => (
                          <SelectItem key={emp} value={emp}>
                            {emp}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button type="submit" disabled={submitting} className="w-full">
                  <Plus className="h-4 w-4 ml-2" />
                  {submitting ? 'جاري الحفظ...' : 'إضافة المهمة'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Filters */}
          <Card className="mb-6 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                فلترة المهام
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={activeFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveFilter('all')}
                >
                  جميع المهام ({tasks.length})
                </Button>
                <Button
                  variant={activeFilter === 'my-tasks' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveFilter('my-tasks')}
                >
                  مهامي ({tasks.filter(t => t.user_id === user?.id).length})
                </Button>
                <Button
                  variant={activeFilter === 'today' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveFilter('today')}
                >
                  <Calendar className="h-4 w-4 ml-1" />
                  مهام اليوم
                </Button>
                <Button
                  variant={activeFilter === 'pending-short' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveFilter('pending-short')}
                >
                  <Clock className="h-4 w-4 ml-1" />
                  معلقة قصيرة
                </Button>
                <Button
                  variant={activeFilter === 'pending-long' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveFilter('pending-long')}
                >
                  <Clock className="h-4 w-4 ml-1" />
                  معلقة طويلة
                </Button>
                <Button
                  variant={activeFilter === 'expired-contracts' ? 'destructive' : 'outline'}
                  size="sm"
                  onClick={() => setActiveFilter('expired-contracts')}
                >
                  <AlertTriangle className="h-4 w-4 ml-1" />
                  عقود منتهية
                </Button>
                <Button
                  variant={activeFilter === 'completed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveFilter('completed')}
                >
                  <CheckCircle className="h-4 w-4 ml-1" />
                  مكتملة
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tasks Table */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>قائمة المهام</CardTitle>
              <CardDescription>
                عرض {filteredTasks.length} من أصل {tasks.length} مهمة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>العنوان</TableHead>
                      <TableHead>العميل</TableHead>
                      <TableHead>الموظف</TableHead>
                      <TableHead>المدة</TableHead>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTasks.map((task) => (
                      <TableRow 
                        key={task.id} 
                        className={isContractExpired(task.customer.contract_end_date) ? 'bg-red-50' : ''}
                      >
                        <TableCell>
                          <div>
                            <div className="font-medium">{task.title}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">{task.details}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div>{task.customer.name}</div>
                            {isContractExpired(task.customer.contract_end_date) && (
                              <Badge variant="destructive" className="text-xs mt-1">
                                عقد منتهي
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{task.employee}</TableCell>
                        <TableCell>
                          <Badge variant={task.term === 'قصير' ? 'default' : 'secondary'}>
                            {task.term} المدى
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(task.created_at).toLocaleDateString('ar-SA')}</TableCell>
                        <TableCell>
                          {task.is_completed ? (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 ml-1" />
                              مكتملة
                            </Badge>
                          ) : (
                            <Badge variant="outline">معلقة</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {!task.is_completed && canEditTask(task) && (
                              <Button
                                size="sm"
                                onClick={() => completeTask(task.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 ml-1" />
                                اكتمل
                              </Button>
                            )}
                            {canEditTask(task) && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteTask(task.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {filteredTasks.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-lg">لا توجد مهام تطابق المعايير المحددة</p>
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