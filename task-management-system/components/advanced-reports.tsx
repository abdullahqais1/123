"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Users, BarChart3, Filter } from "lucide-react"

interface TaskReport {
  customerName: string
  completedTasks: number
  pendingTasks: number
  totalTasks: number
  lastTaskDate: string
}

interface EmployeeReport {
  employeeName: string
  completedTasks: number
  pendingTasks: number
  totalTasks: number
  completionRate: number
}

export function AdvancedReports() {
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [selectedEmployee, setSelectedEmployee] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState("")
  const [reportType, setReportType] = useState("")

  // Mock data - في التطبيق الحقيقي ستأتي من API
  const customerReports: TaskReport[] = [
    { customerName: "مطعم الرافدين", completedTasks: 15, pendingTasks: 3, totalTasks: 18, lastTaskDate: "2025-06-15" },
    {
      customerName: "شركة النور للتجارة",
      completedTasks: 12,
      pendingTasks: 2,
      totalTasks: 14,
      lastTaskDate: "2025-06-14",
    },
    { customerName: "مؤسسة الأمل", completedTasks: 8, pendingTasks: 5, totalTasks: 13, lastTaskDate: "2025-06-13" },
    {
      customerName: "مكتب الهندسة المتقدمة",
      completedTasks: 10,
      pendingTasks: 1,
      totalTasks: 11,
      lastTaskDate: "2025-06-12",
    },
  ]

  const employeeReports: EmployeeReport[] = [
    { employeeName: "Ali Ahmed", completedTasks: 25, pendingTasks: 5, totalTasks: 30, completionRate: 83 },
    { employeeName: "Fatima Hassan", completedTasks: 20, pendingTasks: 3, totalTasks: 23, completionRate: 87 },
    { employeeName: "Mohammed Ali", completedTasks: 18, pendingTasks: 4, totalTasks: 22, completionRate: 82 },
    { employeeName: "Zainab Omar", completedTasks: 15, pendingTasks: 2, totalTasks: 17, completionRate: 88 },
  ]

  const employees = ["Ali Ahmed", "Fatima Hassan", "Mohammed Ali", "Zainab Omar", "Ahmed Khalil", "Maryam Saeed"]

  const downloadCustomerReport = () => {
    const csvContent = `Customer Name,Completed Tasks,Pending Tasks,Total Tasks,Completion Rate,Last Task Date
${customerReports
  .map(
    (report) =>
      `"${report.customerName}",${report.completedTasks},${report.pendingTasks},${report.totalTasks},${Math.round((report.completedTasks / report.totalTasks) * 100)}%,"${report.lastTaskDate}"`,
  )
  .join("\n")}`

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `customer_tasks_report_${new Date().toISOString().split("T")[0]}.csv`
    link.click()
  }

  const downloadEmployeeReport = () => {
    const csvContent = `Employee Name,Completed Tasks,Pending Tasks,Total Tasks,Completion Rate
${employeeReports
  .map(
    (report) =>
      `"${report.employeeName}",${report.completedTasks},${report.pendingTasks},${report.totalTasks},${report.completionRate}%`,
  )
  .join("\n")}`

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `employee_performance_report_${new Date().toISOString().split("T")[0]}.csv`
    link.click()
  }

  return (
    <div className="space-y-6">
      {/* Report Filters */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Advanced Report Filters
          </CardTitle>
          <CardDescription>Generate detailed reports with custom date ranges and filters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateFrom">From Date</Label>
              <Input id="dateFrom" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateTo">To Date</Label>
              <Input id="dateTo" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employee">Employee</Label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Employee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  {employees.map((employee) => (
                    <SelectItem key={employee} value={employee}>
                      {employee}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reportType">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Report Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Customer Tasks</SelectItem>
                  <SelectItem value="employee">Employee Performance</SelectItem>
                  <SelectItem value="monthly">Monthly Summary</SelectItem>
                  <SelectItem value="weekly">Weekly Summary</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Tasks Report */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Customer Tasks Report
          </CardTitle>
          <CardDescription>Task completion statistics for each customer</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-muted-foreground">Showing {customerReports.length} customers</div>
            <Button onClick={downloadCustomerReport} size="sm" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download Report
            </Button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bold">Customer Name</TableHead>
                  <TableHead className="font-bold">Completed</TableHead>
                  <TableHead className="font-bold">Pending</TableHead>
                  <TableHead className="font-bold">Total</TableHead>
                  <TableHead className="font-bold">Completion Rate</TableHead>
                  <TableHead className="font-bold">Last Task</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customerReports.map((report, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-semibold">{report.customerName}</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                        {report.completedTasks}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-orange-600">
                        {report.pendingTasks}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">{report.totalTasks}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(report.completedTasks / report.totalTasks) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">
                          {Math.round((report.completedTasks / report.totalTasks) * 100)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(report.lastTaskDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Employee Performance Report */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            Employee Performance Report
          </CardTitle>
          <CardDescription>Task completion performance for each employee</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-muted-foreground">Showing {employeeReports.length} employees</div>
            <Button onClick={downloadEmployeeReport} size="sm" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download Report
            </Button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bold">Employee Name</TableHead>
                  <TableHead className="font-bold">Completed</TableHead>
                  <TableHead className="font-bold">Pending</TableHead>
                  <TableHead className="font-bold">Total</TableHead>
                  <TableHead className="font-bold">Performance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employeeReports.map((report, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-semibold">{report.employeeName}</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                        {report.completedTasks}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-orange-600">
                        {report.pendingTasks}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">{report.totalTasks}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full ${
                              report.completionRate >= 85
                                ? "bg-green-500"
                                : report.completionRate >= 70
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                            }`}
                            style={{ width: `${report.completionRate}%` }}
                          ></div>
                        </div>
                        <Badge
                          variant={report.completionRate >= 85 ? "default" : "secondary"}
                          className={
                            report.completionRate >= 85
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                              : report.completionRate >= 70
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                          }
                        >
                          {report.completionRate}%
                        </Badge>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
