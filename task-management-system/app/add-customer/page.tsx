"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowRight, Save } from "lucide-react"
import Link from "next/link"

export default function AddCustomer() {
  const [name, setName] = useState("")
  const [contractEnd, setContractEnd] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, contractEnd }),
      })

      if (response.ok) {
        router.push("/tasks")
      } else {
        alert("حدث خطأ في إضافة العميل")
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
          <h1 className="text-3xl font-bold text-gray-900">إضافة عميل جديد</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>بيانات العميل</CardTitle>
            <CardDescription>أدخل اسم العميل وتاريخ انتهاء العقد</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">اسم العميل</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="أدخل اسم العميل"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contractEnd">تاريخ انتهاء العقد</Label>
                <Input
                  id="contractEnd"
                  type="date"
                  value={contractEnd}
                  onChange={(e) => setContractEnd(e.target.value)}
                  required
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  <Save className="h-4 w-4 ml-2" />
                  {loading ? "جاري الحفظ..." : "حفظ العميل"}
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
