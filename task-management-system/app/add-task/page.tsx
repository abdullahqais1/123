"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight, Save } from "lucide-react"
import Link from "next/link"

interface Customer {
  id: number
  name: string
  contractEnd: string
}

export default function AddTask() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [customerId, setCustomerId] = useState("")
  const [title, setTitle] = useState("")
  const [details, setDetails] = useState("")
  const [term, setTerm] = useState("")
  const [employee, setEmployee] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

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
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: Number.parseInt(customerId),
          title,
          details,
          term,
          employee,
        }),
      })

      if (response.ok) {
        router.push("/tasks")
      } else {
        alert("حدث خطأ في إضافة المهمة")
      }
    } catch (error) {
      alert("حدث خطأ في الاتصال")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowRight className="h-4 w-4 ml-2" />
            العودة للرئيسية
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">إضافة مهمة جديدة</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>تفاصيل المهمة</CardTitle>
            <CardDescription>أدخل تفاصيل المهمة والعميل المرتبط بها</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="customer">العميل</Label>
                <Select value={customerId} onValueChange={setCustomerId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر العميل" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => {
                      const isExpired = new Date(customer.contractEnd) < new Date()
                      return (
                        <SelectItem key={customer.id} value={customer.id.toString()}>
                          <div className="flex items-center justify-between w-full">
                            <span>{customer.name}</span>
                            {isExpired && <span className="text-red-500 text-xs mr-2">عقد منتهي</span>}
                          </div>
                        </SelectItem>
                      )
                    })}
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

              <div className="space-y-2">
                <Label htmlFor="details">تفاصيل المهمة</Label>
                <Textarea
                  id="details"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="أدخل تفاصيل المهمة"
                  rows={4}
                  required
                />
              </div>

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
                <Label htmlFor="employee">اسم الموظف</Label>
                <Select value={employee} onValueChange={setEmployee} required>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الموظف" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="علي">علي</SelectItem>
                    <SelectItem value="فاطمة">فاطمة</SelectItem>
                    <SelectItem value="محمد">محمد</SelectItem>
                    <SelectItem value="زينب">زينب</SelectItem>
                    <SelectItem value="أحمد">أحمد</SelectItem>
                    <SelectItem value="مريم">مريم</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  <Save className="h-4 w-4 ml-2" />
                  {loading ? "جاري الحفظ..." : "حفظ المهمة"}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  إلغاء
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
