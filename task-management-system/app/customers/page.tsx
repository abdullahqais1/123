"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Calendar, AlertTriangle, CheckCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Customer {
  id: number
  name: string
  contractEnd: string
  _count: {
    tasks: number
  }
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [newCustomerName, setNewCustomerName] = useState("")
  const [newContractEnd, setNewContractEnd] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/customers")
      const data = await response.json()
      setCustomers(data)
    } catch (error) {
      console.error("Error fetching customers:", error)
    } finally {
      setLoading(false)
    }
  }

  const addCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCustomerName || !newContractEnd) return

    setSubmitting(true)
    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCustomerName,
          contractEnd: new Date(newContractEnd).toISOString(),
        }),
      })

      if (response.ok) {
        setNewCustomerName("")
        setNewContractEnd("")
        fetchCustomers()
      } else {
        alert("حدث خطأ في إضافة العميل")
      }
    } catch (error) {
      alert("حدث خطأ في الاتصال")
    } finally {
      setSubmitting(false)
    }
  }

  const isContractExpired = (contractEnd: string) => {
    return new Date(contractEnd) < new Date()
  }

  const getDaysUntilExpiry = (contractEnd: string) => {
    const days = Math.ceil((new Date(contractEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return days
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>جاري تحميل العملاء...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">إدارة العملاء</h1>
          <p className="text-gray-600 mt-2">إضافة وإدارة بيانات العملاء وعقودهم</p>
        </div>

        {/* Add Customer Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              إضافة عميل جديد
            </CardTitle>
            <CardDescription>أدخل اسم العميل وتاريخ انتهاء العقد</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={addCustomer} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">اسم العميل</Label>
                <Input
                  id="name"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  placeholder="أدخل اسم العميل"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contractEnd">تاريخ انتهاء العقد</Label>
                <Input
                  id="contractEnd"
                  type="date"
                  value={newContractEnd}
                  onChange={(e) => setNewContractEnd(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" disabled={submitting} className="w-full">
                  <Plus className="h-4 w-4 ml-2" />
                  {submitting ? "جاري الحفظ..." : "إضافة العميل"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Customers Table */}
        <Card>
          <CardHeader>
            <CardTitle>قائمة العملاء</CardTitle>
            <CardDescription>عرض جميع العملاء وحالة عقودهم ({customers.length} عميل)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>اسم العميل</TableHead>
                    <TableHead>تاريخ انتهاء العقد</TableHead>
                    <TableHead>الأيام المتبقية</TableHead>
                    <TableHead>عدد المهام</TableHead>
                    <TableHead>حالة العقد</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => {
                    const daysUntilExpiry = getDaysUntilExpiry(customer.contractEnd)
                    const isExpired = isContractExpired(customer.contractEnd)

                    return (
                      <TableRow key={customer.id} className={isExpired ? "bg-red-50" : ""}>
                        <TableCell className="font-semibold">{customer.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            {new Date(customer.contractEnd).toLocaleDateString("ar-SA")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`font-medium ${
                              daysUntilExpiry < 0
                                ? "text-red-600"
                                : daysUntilExpiry < 30
                                  ? "text-orange-600"
                                  : "text-green-600"
                            }`}
                          >
                            {daysUntilExpiry < 0 ? `متأخر ${Math.abs(daysUntilExpiry)} يوم` : `${daysUntilExpiry} يوم`}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{customer._count.tasks} مهمة</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={isExpired ? "destructive" : "default"}
                            className={isExpired ? "" : "bg-green-100 text-green-800"}
                          >
                            {isExpired ? (
                              <>
                                <AlertTriangle className="h-3 w-3 ml-1" />
                                منتهي
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-3 w-3 ml-1" />
                                نشط
                              </>
                            )}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>

              {customers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-lg">لا يوجد عملاء مسجلين</p>
                  <p>قم بإضافة عميل جديد باستخدام النموذج أعلاه</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
