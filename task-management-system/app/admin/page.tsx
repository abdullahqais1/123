"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  LogOut,
  Users,
  FileText,
  Download,
  Plus,
  Calendar,
  AlertTriangle,
  Moon,
  Sun,
  Search,
  Filter,
  Edit,
  UserPlus,
  Building,
  CheckCircle,
} from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { InteractiveCharts } from "@/components/interactive-charts"
import { AdvancedReports } from "@/components/advanced-reports"

interface User {
  id: number
  username: string
  name: string
  role: string
  password: string
}

interface Customer {
  id: number
  name: string
  contractEnd: string
  expired: boolean
}

interface Task {
  id: number
  customerName: string
  description: string
  status: string
  employeeName: string
  timestamp: string
  contractExpired: boolean
}

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [customers, setCustomers] = useState<Customer[]>([
    { id: 1, name: "مطعم الرافدين", contractEnd: "2025-07-15", expired: false },
    { id: 2, name: "شركة النور للتجارة", contractEnd: "2025-05-20", expired: false },
    { id: 3, name: "مؤسسة الأمل", contractEnd: "2024-12-30", expired: true },
    { id: 4, name: "مكتب الهندسة المتقدمة", contractEnd: "2025-08-10", expired: false },
    { id: 5, name: "صيدلية الشفاء", contractEnd: "2024-11-15", expired: true },
    { id: 6, name: "الشركة العامة للنقل", contractEnd: "2025-09-20", expired: false },
    { id: 7, name: "مستشفى الحكمة", contractEnd: "2025-06-30", expired: false },
    { id: 8, name: "معهد التدريب المهني", contractEnd: "2024-10-15", expired: true },
  ])

  const [employees, setEmployees] = useState<User[]>([
    { id: 1, username: "ali", name: "Ali Ahmed", password: "1", role: "employee" },
    { id: 2, username: "fatima", name: "Fatima Hassan", password: "2", role: "employee" },
    { id: 3, username: "mohammed", name: "Mohammed Ali", password: "3", role: "employee" },
    { id: 4, username: "zainab", name: "Zainab Omar", password: "4", role: "employee" },
    { id: 5, username: "ahmed", name: "Ahmed Khalil", password: "5", role: "employee" },
    { id: 6, username: "maryam", name: "Maryam Saeed", password: "6", role: "employee" },
  ])

  const [showAddCustomer, setShowAddCustomer] = useState(false)
  const [showAddEmployee, setShowAddEmployee] = useState(false)
  const [showEditCustomer, setShowEditCustomer] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [newCustomerName, setNewCustomerName] = useState("")
  const [newContractEnd, setNewContractEnd] = useState("")
  const [newEmployeeName, setNewEmployeeName] = useState("")
  const [newEmployeeUsername, setNewEmployeeUsername] = useState("")
  const [newEmployeePassword, setNewEmployeePassword] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [stats, setStats] = useState({
    totalEmployees: 6,
    totalCustomers: 8,
    expiredContracts: 3,
    totalTasks: 45,
    completedTasks: 32,
    pendingTasks: 13,
  })

  const router = useRouter()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const user = localStorage.getItem("currentUser")
    if (user) {
      const userData = JSON.parse(user)
      if (userData.role !== "admin") {
        router.push("/login")
      } else {
        setCurrentUser(userData)
      }
    } else {
      router.push("/login")
    }

    // Load saved data
    const savedCustomers = localStorage.getItem("customers")
    if (savedCustomers) {
      setCustomers(JSON.parse(savedCustomers))
    }

    const savedEmployees = localStorage.getItem("employees")
    if (savedEmployees) {
      setEmployees(JSON.parse(savedEmployees))
    }
  }, [router])

  const logout = () => {
    localStorage.removeItem("currentUser")
    localStorage.removeItem("authToken")
    router.push("/login")
  }

  const addCustomer = () => {
    if (!newCustomerName || !newContractEnd) return

    const isExpired = new Date(newContractEnd) < new Date()
    const newCustomer: Customer = {
      id: Date.now(),
      name: newCustomerName,
      contractEnd: newContractEnd,
      expired: isExpired,
    }

    const updatedCustomers = [...customers, newCustomer]
    setCustomers(updatedCustomers)
    localStorage.setItem("customers", JSON.stringify(updatedCustomers))

    // Update customers in localStorage
    localStorage.setItem("systemCustomers", JSON.stringify(updatedCustomers))

    setNewCustomerName("")
    setNewContractEnd("")
    setShowAddCustomer(false)

    setStats((prev) => ({
      ...prev,
      totalCustomers: prev.totalCustomers + 1,
      expiredContracts: isExpired ? prev.expiredContracts + 1 : prev.expiredContracts,
    }))
  }

  const addEmployee = () => {
    if (!newEmployeeName || !newEmployeeUsername || !newEmployeePassword) return

    const newEmployee: User = {
      id: Date.now(),
      username: newEmployeeUsername,
      name: newEmployeeName,
      password: newEmployeePassword,
      role: "employee",
    }

    const updatedEmployees = [...employees, newEmployee]
    setEmployees(updatedEmployees)

    // Update system users in localStorage
    const currentAdmin = JSON.parse(localStorage.getItem("currentUser") || "{}")
    const allUsers = [...updatedEmployees, currentAdmin]
    localStorage.setItem("systemUsers", JSON.stringify(allUsers))

    setNewEmployeeName("")
    setNewEmployeeUsername("")
    setNewEmployeePassword("")
    setShowAddEmployee(false)

    setStats((prev) => ({
      ...prev,
      totalEmployees: prev.totalEmployees + 1,
    }))
  }

  const editCustomer = (customer: Customer) => {
    setEditingCustomer(customer)
    setNewCustomerName(customer.name)
    setNewContractEnd(customer.contractEnd)
    setShowEditCustomer(true)
  }

  const updateCustomer = () => {
    if (!editingCustomer || !newCustomerName || !newContractEnd) return

    const isExpired = new Date(newContractEnd) < new Date()
    const updatedCustomers = customers.map((customer) =>
      customer.id === editingCustomer.id
        ? { ...customer, name: newCustomerName, contractEnd: newContractEnd, expired: isExpired }
        : customer,
    )

    setCustomers(updatedCustomers)
    localStorage.setItem("customers", JSON.stringify(updatedCustomers))

    setNewCustomerName("")
    setNewContractEnd("")
    setEditingCustomer(null)
    setShowEditCustomer(false)
  }

  const downloadCustomersReport = () => {
    const csvContent = `Customer Name,Contract End Date,Status,Days Until Expiry
${customers
  .map((customer) => {
    const daysUntilExpiry = Math.ceil(
      (new Date(customer.contractEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
    )
    return `"${customer.name}","${customer.contractEnd}","${customer.expired ? "Expired" : "Active"}","${daysUntilExpiry}"`
  })
  .join("\n")}`

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `customers_report_${new Date().toISOString().split("T")[0]}.csv`
    link.click()
  }

  const downloadEmployeesReport = () => {
    const csvContent = `Employee Name,Username,Role,Account Status
${employees.map((employee) => `"${employee.name}","${employee.username}","${employee.role}","Active"`).join("\n")}`

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `employees_report_${new Date().toISOString().split("T")[0]}.csv`
    link.click()
  }

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "active" && !customer.expired) ||
      (filterStatus === "expired" && customer.expired)
    return matchesSearch && matchesFilter
  })

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Administrator Dashboard</h1>
            <p className="text-xl text-muted-foreground">Welcome, {currentUser.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
            <Button onClick={logout} variant="outline" className="font-semibold">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Employees</CardTitle>
              <Users className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.totalEmployees}</div>
              <p className="text-xs text-muted-foreground">Active employees</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customers</CardTitle>
              <Building className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.totalCustomers}</div>
              <p className="text-xs text-muted-foreground">Total customers</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasks</CardTitle>
              <FileText className="h-5 w-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{stats.totalTasks}</div>
              <p className="text-xs text-muted-foreground">
                Completed: {stats.completedTasks} | Pending: {stats.pendingTasks}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-l-4 border-l-red-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expired Contracts</CardTitle>
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats.expiredContracts}</div>
              <p className="text-xs text-red-600">Need renewal</p>
            </CardContent>
          </Card>
        </div>

        {/* Interactive Charts */}
        <InteractiveCharts
          data={{
            employeeStats: {
              "Ali Ahmed": 12,
              "Fatima Hassan": 8,
              "Mohammed Ali": 10,
              "Zainab Omar": 7,
              "Ahmed Khalil": 5,
              "Maryam Saeed": 3,
            },
            taskStatusStats: {
              completed: stats.completedTasks,
              pending: stats.pendingTasks,
              total: stats.totalTasks,
            },
            monthlyStats: {
              January: 15,
              February: 12,
              March: 18,
              April: 10,
              May: 8,
              June: 6,
            },
            customerStats: {
              active: stats.totalCustomers - stats.expiredContracts,
              expired: stats.expiredContracts,
              total: stats.totalCustomers,
            },
          }}
        />

        {/* Advanced Reports */}
        <AdvancedReports />

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Dialog open={showAddCustomer} onOpenChange={setShowAddCustomer}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 font-semibold">
                <Plus className="h-4 w-4" />
                Add New Customer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Customer</DialogTitle>
                <DialogDescription>Enter customer information and contract details</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contractEnd">Contract End Date</Label>
                  <Input
                    id="contractEnd"
                    type="date"
                    value={newContractEnd}
                    onChange={(e) => setNewContractEnd(e.target.value)}
                  />
                </div>
                <div className="flex gap-4">
                  <Button onClick={addCustomer} className="flex-1">
                    Save Customer
                  </Button>
                  <Button onClick={() => setShowAddCustomer(false)} variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showAddEmployee} onOpenChange={setShowAddEmployee}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 font-semibold">
                <UserPlus className="h-4 w-4" />
                Add New Employee
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
                <DialogDescription>Create a new employee account</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="employeeName">Full Name</Label>
                  <Input
                    id="employeeName"
                    value={newEmployeeName}
                    onChange={(e) => setNewEmployeeName(e.target.value)}
                    placeholder="Enter employee full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employeeUsername">Username</Label>
                  <Input
                    id="employeeUsername"
                    value={newEmployeeUsername}
                    onChange={(e) => setNewEmployeeUsername(e.target.value)}
                    placeholder="Enter username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employeePassword">Password</Label>
                  <Input
                    id="employeePassword"
                    value={newEmployeePassword}
                    onChange={(e) => setNewEmployeePassword(e.target.value)}
                    placeholder="Enter password"
                  />
                </div>
                <div className="flex gap-4">
                  <Button onClick={addEmployee} className="flex-1">
                    Create Employee
                  </Button>
                  <Button onClick={() => setShowAddEmployee(false)} variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button onClick={downloadCustomersReport} variant="outline" className="flex items-center gap-2 font-semibold">
            <Download className="h-4 w-4" />
            Download Customer Report
          </Button>

          <Button onClick={downloadEmployeesReport} variant="outline" className="flex items-center gap-2 font-semibold">
            <Download className="h-4 w-4" />
            Download Employee Report
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Search and Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  <SelectItem value="active">Active Contracts</SelectItem>
                  <SelectItem value="expired">Expired Contracts</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Customers Table */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Customer Management</CardTitle>
            <CardDescription className="text-lg">
              Manage customer information and contracts ({filteredCustomers.length} of {customers.length} customers)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bold">Customer Name</TableHead>
                    <TableHead className="font-bold">Contract End Date</TableHead>
                    <TableHead className="font-bold">Days Until Expiry</TableHead>
                    <TableHead className="font-bold">Contract Status</TableHead>
                    <TableHead className="font-bold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => {
                    const daysUntilExpiry = Math.ceil(
                      (new Date(customer.contractEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
                    )
                    return (
                      <TableRow key={customer.id} className={customer.expired ? "bg-red-50 dark:bg-red-950/20" : ""}>
                        <TableCell className="font-semibold text-lg">{customer.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {new Date(customer.contractEnd).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`font-semibold ${
                              daysUntilExpiry < 0
                                ? "text-red-600"
                                : daysUntilExpiry < 30
                                  ? "text-orange-600"
                                  : "text-green-600"
                            }`}
                          >
                            {daysUntilExpiry < 0
                              ? `${Math.abs(daysUntilExpiry)} days overdue`
                              : `${daysUntilExpiry} days`}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={customer.expired ? "destructive" : "default"}
                            className={`font-semibold ${
                              customer.expired
                                ? ""
                                : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                            }`}
                          >
                            {customer.expired ? (
                              <>
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Expired
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Active
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => editCustomer(customer)}
                            className="font-semibold"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>

              {filteredCustomers.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Building className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-xl font-medium">No customers found</p>
                  <p>Try adjusting your search or filter criteria</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Edit Customer Dialog */}
        <Dialog open={showEditCustomer} onOpenChange={setShowEditCustomer}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Customer</DialogTitle>
              <DialogDescription>Update customer information and contract details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editCustomerName">Customer Name</Label>
                <Input
                  id="editCustomerName"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editContractEnd">Contract End Date</Label>
                <Input
                  id="editContractEnd"
                  type="date"
                  value={newContractEnd}
                  onChange={(e) => setNewContractEnd(e.target.value)}
                />
              </div>
              <div className="flex gap-4">
                <Button onClick={updateCustomer} className="flex-1">
                  Update Customer
                </Button>
                <Button onClick={() => setShowEditCustomer(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Employees Table */}
        <Card className="mt-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Employee Management</CardTitle>
            <CardDescription className="text-lg">
              Manage employee accounts and access ({employees.length} employees)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bold">Employee Name</TableHead>
                    <TableHead className="font-bold">Username</TableHead>
                    <TableHead className="font-bold">Role</TableHead>
                    <TableHead className="font-bold">Account Status</TableHead>
                    <TableHead className="font-bold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-semibold text-lg">{employee.name}</TableCell>
                      <TableCell className="font-medium">{employee.username}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-semibold">
                          <Users className="h-3 w-3 mr-1" />
                          Employee
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 font-semibold">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" className="font-semibold">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
