"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Play,
  Square,
  Plus,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  LogOut,
  Timer,
  List,
  Moon,
  Sun,
  Search,
  Calendar,
} from "lucide-react"
import { useTheme } from "@/components/theme-provider"

interface User {
  id: number
  username: string
  name: string
  role: string
}

interface Task {
  id: number
  customerName: string
  description: string
  status: "completed" | "pending-short" | "pending-long"
  timestamp: string
  contractExpired: boolean
  employeeId: number
  employeeName: string
  pendingDate?: string
}

interface PendingTask {
  id: number
  customerName: string
  description: string
  type: "short" | "long"
  createdDate: string
  employeeId: number
}

interface Customer {
  id: number
  name: string
  contractEnd: string
  expired: boolean
}

export default function EmployeePage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [shiftStarted, setShiftStarted] = useState(false)
  const [shiftStartTime, setShiftStartTime] = useState<string>("")
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showPendingTasks, setShowPendingTasks] = useState(false)
  const [pendingTaskType, setPendingTaskType] = useState<"short" | "long">("short")
  const [customerName, setCustomerName] = useState("")
  const [taskDescription, setTaskDescription] = useState("")
  const [todayTasks, setTodayTasks] = useState<Task[]>([])
  const [contractStatus, setContractStatus] = useState<string>("")
  const [showDailyReport, setShowDailyReport] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [pendingDate, setPendingDate] = useState("")
  const [showPendingDate, setShowPendingDate] = useState(false)
  const [pendingTaskStatus, setPendingTaskStatus] = useState<"pending-short" | "pending-long">("pending-short")
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  // Enhanced customer data with Arabic name variations
  const customers: Customer[] = [
    { id: 1, name: "مطعم الرافدين", contractEnd: "2025-07-15", expired: false },
    { id: 2, name: "شركة النور للتجارة", contractEnd: "2025-05-20", expired: false },
    { id: 3, name: "مؤسسة الأمل", contractEnd: "2024-12-30", expired: true },
    { id: 4, name: "مكتب الهندسة المتقدمة", contractEnd: "2025-08-10", expired: false },
    { id: 5, name: "صيدلية الشفاء", contractEnd: "2024-11-15", expired: true },
    { id: 6, name: "الشركة العامة للنقل", contractEnd: "2025-09-20", expired: false },
    { id: 7, name: "مستشفى الحكمة", contractEnd: "2025-06-30", expired: false },
    { id: 8, name: "معهد التدريب المهني", contractEnd: "2024-10-15", expired: true },
  ]

  // Mock pending tasks
  const [pendingTasks, setPendingTasks] = useState<PendingTask[]>([
    {
      id: 1,
      customerName: "مطعم الرافدين",
      description: "Review inventory system",
      type: "short",
      createdDate: "2025-06-10",
      employeeId: 1,
    },
    {
      id: 2,
      customerName: "شركة النور",
      description: "Annual audit preparation",
      type: "long",
      createdDate: "2025-06-05",
      employeeId: 1,
    },
    {
      id: 3,
      customerName: "مؤسسة الأمل",
      description: "Database update",
      type: "short",
      createdDate: "2025-06-12",
      employeeId: 2,
    },
    {
      id: 4,
      customerName: "مكتب الهندسة",
      description: "Project documentation",
      type: "long",
      createdDate: "2025-06-08",
      employeeId: 1,
    },
  ])

  useEffect(() => {
    const user = localStorage.getItem("currentUser")
    if (user) {
      const userData = JSON.parse(user)
      setCurrentUser(userData)

      // Load today's tasks for this employee
      const savedTasks = localStorage.getItem(`tasks_${userData.id}_${new Date().toDateString()}`)
      if (savedTasks) {
        setTodayTasks(JSON.parse(savedTasks))
      }

      // Check if shift is already started
      const shiftStatus = localStorage.getItem(`shift_${userData.id}_${new Date().toDateString()}`)
      if (shiftStatus) {
        const shiftData = JSON.parse(shiftStatus)
        setShiftStarted(shiftData.started)
        setShiftStartTime(shiftData.startTime)
      }
    } else {
      router.push("/login")
    }
  }, [router])

  // Enhanced Arabic text comparison function
  const normalizeArabicText = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/^ال/, "") // Remove definite article
      .replace(/ة/g, "ه") // Replace ة with ه
      .replace(/ه/g, "ة") // Also check reverse
      .replace(/ظ/g, "ض") // Replace ظ with ض
      .replace(/ض/g, "ظ") // Also check reverse
      .trim()
  }

  const findCustomerByName = (searchName: string): Customer | null => {
    const normalizedSearch = normalizeArabicText(searchName)

    return (
      customers.find((customer) => {
        const normalizedCustomer = normalizeArabicText(customer.name)
        return (
          normalizedCustomer.includes(normalizedSearch) ||
          normalizedSearch.includes(normalizedCustomer) ||
          customer.name.toLowerCase().includes(searchName.toLowerCase()) ||
          searchName.toLowerCase().includes(customer.name.toLowerCase())
        )
      }) || null
    )
  }

  const startShift = () => {
    const startTime = new Date().toLocaleString("en-US")
    setShiftStarted(true)
    setShiftStartTime(startTime)

    if (currentUser) {
      localStorage.setItem(
        `shift_${currentUser.id}_${new Date().toDateString()}`,
        JSON.stringify({
          started: true,
          startTime: startTime,
        }),
      )
    }
  }

  const endShift = () => {
    setShowDailyReport(true)
  }

  const checkCustomerContract = () => {
    const customer = findCustomerByName(customerName)

    if (customer) {
      if (customer.expired) {
        setContractStatus("⚠️ Warning: This customer's contract has expired")
      } else {
        setContractStatus("✅ Contract is active and valid")
      }
    } else {
      setContractStatus("❌ Customer not found in database")
    }
  }

  const addTask = (status: "completed" | "pending-short" | "pending-long") => {
    if (!customerName || !taskDescription || !currentUser) return

    // If it's a pending task, require a date
    if ((status === "pending-short" || status === "pending-long") && !pendingDate) {
      alert("Please select a date for the pending task")
      return
    }

    const customer = findCustomerByName(customerName)

    const newTask: Task = {
      id: Date.now(),
      customerName,
      description: taskDescription,
      status,
      timestamp: new Date().toLocaleString("en-US"),
      contractExpired: customer?.expired || false,
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      pendingDate: status === "pending-short" || status === "pending-long" ? pendingDate : undefined,
    }

    const updatedTasks = [...todayTasks, newTask]
    setTodayTasks(updatedTasks)

    // Save to localStorage
    localStorage.setItem(`tasks_${currentUser.id}_${new Date().toDateString()}`, JSON.stringify(updatedTasks))

    // Also save to global pending tasks if it's pending
    if (status === "pending-short" || status === "pending-long") {
      const globalPendingTasks = JSON.parse(localStorage.getItem("globalPendingTasks") || "[]")
      globalPendingTasks.push(newTask)
      localStorage.setItem("globalPendingTasks", JSON.stringify(globalPendingTasks))
    }

    // Clear form
    setCustomerName("")
    setTaskDescription("")
    setContractStatus("")
    setPendingDate("")
    setShowTaskForm(false)
  }

  const retrievePendingTask = (task: PendingTask) => {
    setCustomerName(task.customerName)
    setTaskDescription(task.description)
    setShowPendingTasks(false)
    setShowTaskForm(true)

    // Auto-check contract status
    setTimeout(() => {
      checkCustomerContract()
    }, 100)
  }

  const logout = () => {
    localStorage.removeItem("currentUser")
    localStorage.removeItem("authToken")
    router.push("/login")
  }

  const completedTasks = todayTasks.filter((task) => task.status === "completed")
  const pendingTasksToday = todayTasks.filter((task) => task.status.includes("pending"))
  const longTermPending = todayTasks.filter((task) => task.status === "pending-long")
  const shortTermPending = todayTasks.filter((task) => task.status === "pending-short")

  const filteredPendingTasks = pendingTasks.filter(
    (task) =>
      task.type === pendingTaskType &&
      task.employeeId === currentUser?.id &&
      task.customerName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Welcome, {currentUser.name}</h1>
            <p className="text-xl text-muted-foreground">Employee Dashboard</p>
            {shiftStarted && (
              <div className="flex items-center gap-2 mt-3">
                <Timer className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-600">Shift started: {shiftStartTime}</span>
              </div>
            )}
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

        {!shiftStarted ? (
          /* Clock In */
          <Card className="mb-8 shadow-lg">
            <CardHeader className="text-center pb-8">
              <div className="mx-auto w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-4">
                <Play className="h-10 w-10 text-primary-foreground" />
              </div>
              <CardTitle className="text-3xl font-bold">Start Your Workday</CardTitle>
              <CardDescription className="text-lg">
                Click the button below to clock in and begin your shift
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pb-8">
              <Button onClick={startShift} size="lg" className="px-16 py-6 text-xl font-bold">
                <Play className="h-6 w-6 mr-3" />
                Clock In
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Daily Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="shadow-lg border-l-4 border-l-green-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Completed Tasks</p>
                      <p className="text-3xl font-bold text-green-600">{completedTasks.length}</p>
                    </div>
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-l-4 border-l-orange-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pending Tasks</p>
                      <p className="text-3xl font-bold text-orange-600">{pendingTasksToday.length}</p>
                    </div>
                    <Clock className="h-10 w-10 text-orange-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                      <p className="text-3xl font-bold text-blue-600">{todayTasks.length}</p>
                    </div>
                    <List className="h-10 w-10 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-l-4 border-l-purple-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Work Hours</p>
                      <p className="text-3xl font-bold text-purple-600">
                        {shiftStartTime
                          ? Math.floor((Date.now() - new Date(shiftStartTime).getTime()) / (1000 * 60 * 60))
                          : 0}
                        h
                      </p>
                    </div>
                    <Timer className="h-10 w-10 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Button
                onClick={() => setShowTaskForm(true)}
                className="h-20 flex flex-col gap-2 text-lg font-semibold shadow-lg"
              >
                <Plus className="h-6 w-6" />
                Create Task
              </Button>

              <Button
                onClick={() => {
                  setPendingTaskType("short")
                  setShowPendingTasks(true)
                }}
                className="h-20 flex flex-col gap-2 text-lg font-semibold shadow-lg"
                variant="outline"
              >
                <Clock className="h-6 w-6" />
                Short-Term Pending
                <Badge variant="secondary">{shortTermPending.length}</Badge>
              </Button>

              <Button
                onClick={() => {
                  setPendingTaskType("long")
                  setShowPendingTasks(true)
                }}
                className="h-20 flex flex-col gap-2 text-lg font-semibold shadow-lg"
                variant="outline"
              >
                <Timer className="h-6 w-6" />
                Long-Term Pending
                <Badge variant="secondary">{longTermPending.length}</Badge>
              </Button>

              <Button
                onClick={endShift}
                className="h-20 flex flex-col gap-2 text-lg font-semibold shadow-lg"
                variant="destructive"
              >
                <Square className="h-6 w-6" />
                Clock Out
              </Button>
            </div>

            {/* Task Form */}
            {showTaskForm && (
              <Card className="mb-8 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">Create New Task</CardTitle>
                  <CardDescription>Enter customer information and task details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="customer" className="text-base font-semibold">
                      Customer Name
                    </Label>
                    <div className="flex gap-3">
                      <Input
                        id="customer"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Enter customer name (Arabic/English)"
                        className="flex-1 h-12"
                      />
                      <Button onClick={checkCustomerContract} variant="outline" className="px-6">
                        <Search className="h-4 w-4 mr-2" />
                        Check
                      </Button>
                    </div>
                    {contractStatus && (
                      <Alert
                        className={
                          contractStatus.includes("expired")
                            ? "border-red-500 bg-red-50"
                            : contractStatus.includes("active")
                              ? "border-green-500 bg-green-50"
                              : "border-yellow-500 bg-yellow-50"
                        }
                      >
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="font-medium">{contractStatus}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="description" className="text-base font-semibold">
                      Task Description
                    </Label>
                    <Textarea
                      id="description"
                      value={taskDescription}
                      onChange={(e) => setTaskDescription(e.target.value)}
                      placeholder="Enter detailed task description..."
                      rows={4}
                      className="resize-none"
                    />
                  </div>

                  {showPendingDate && (
                    <div className="space-y-3">
                      <Label htmlFor="pendingDate" className="text-base font-semibold">
                        Pending Until Date
                      </Label>
                      <Input
                        id="pendingDate"
                        type="date"
                        value={pendingDate}
                        onChange={(e) => setPendingDate(e.target.value)}
                        className="h-12"
                        required
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                      onClick={() => {
                        setShowPendingDate(true)
                        setPendingTaskStatus("pending-long")
                        setTimeout(() => addTask("pending-long"), 100)
                      }}
                      className="h-14 font-semibold"
                      variant="outline"
                    >
                      <Timer className="h-5 w-5 mr-2" />
                      Long-Term Pending
                    </Button>
                    <Button
                      onClick={() => {
                        setShowPendingDate(true)
                        setPendingTaskStatus("pending-short")
                        setTimeout(() => addTask("pending-short"), 100)
                      }}
                      className="h-14 font-semibold"
                      variant="outline"
                    >
                      <Clock className="h-5 w-5 mr-2" />
                      Short-Term Pending
                    </Button>
                    <Button onClick={() => addTask("completed")} className="h-14 font-semibold">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Mark Completed
                    </Button>
                  </div>

                  <Button onClick={() => setShowTaskForm(false)} variant="ghost" className="w-full h-12 font-semibold">
                    Cancel
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Today's Tasks List */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Today's Tasks</CardTitle>
                <CardDescription className="text-lg">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {todayTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`p-6 border rounded-lg transition-all hover:shadow-md ${
                        task.contractExpired
                          ? "border-red-300 bg-red-50 dark:bg-red-950/20"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-lg">{task.customerName}</h3>
                            {task.contractExpired && (
                              <Badge variant="destructive" className="font-semibold">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Contract Expired
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground mb-3 leading-relaxed">{task.description}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{task.timestamp}</span>
                          </div>
                        </div>
                        <Badge
                          variant={
                            task.status === "completed"
                              ? "default"
                              : task.status === "pending-short"
                                ? "secondary"
                                : "outline"
                          }
                          className={`font-semibold text-sm px-3 py-1 ${
                            task.status === "completed"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                              : task.status === "pending-short"
                                ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                          }`}
                        >
                          {task.status === "completed"
                            ? "✅ Completed"
                            : task.status === "pending-short"
                              ? "⏰ Short-Term"
                              : "⏳ Long-Term"}
                        </Badge>
                      </div>
                    </div>
                  ))}

                  {todayTasks.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <List className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-xl font-medium">No tasks added yet</p>
                      <p>Click "Create Task" to get started</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Pending Tasks Dialog */}
        <Dialog open={showPendingTasks} onOpenChange={setShowPendingTasks}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                {pendingTaskType === "short" ? "Short-Term" : "Long-Term"} Pending Tasks
              </DialogTitle>
              <DialogDescription>Select a task to retrieve and work on</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="space-y-3">
                {filteredPendingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => retrievePendingTask(task)}
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{task.customerName}</h3>
                      <p className="text-muted-foreground">{task.description}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Created: {new Date(task.createdDate).toLocaleDateString("en-US")}
                      </p>
                    </div>
                    <Button size="sm" className="font-semibold">
                      Retrieve Task
                    </Button>
                  </div>
                ))}

                {filteredPendingTasks.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">No {pendingTaskType}-term pending tasks found</p>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Daily Report Dialog */}
        <Dialog open={showDailyReport} onOpenChange={setShowDailyReport}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-3xl font-bold flex items-center gap-3">
                <FileText className="h-8 w-8" />
                Daily Report - {currentUser.name}
              </DialogTitle>
              <DialogDescription className="text-lg">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-8">
              {/* Summary Statistics */}
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-6 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200">
                  <p className="text-4xl font-bold text-green-600 mb-2">{completedTasks.length}</p>
                  <p className="text-lg font-semibold text-green-700 dark:text-green-400">Completed Tasks</p>
                </div>
                <div className="text-center p-6 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200">
                  <p className="text-4xl font-bold text-orange-600 mb-2">{pendingTasksToday.length}</p>
                  <p className="text-lg font-semibold text-orange-700 dark:text-orange-400">Pending Tasks</p>
                </div>
              </div>

              {/* Completed Tasks */}
              <div>
                <h3 className="text-2xl font-bold mb-4 text-green-600">✅ Completed Tasks</h3>
                <div className="space-y-3">
                  {completedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex justify-between items-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200"
                    >
                      <div className="flex-1">
                        <h4 className="font-bold text-lg">{task.customerName}</h4>
                        <p className="text-muted-foreground">{task.description}</p>
                        <p className="text-sm text-muted-foreground mt-1">{task.timestamp}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 font-semibold">
                        Completed
                      </Badge>
                    </div>
                  ))}
                  {completedTasks.length === 0 && (
                    <p className="text-center py-8 text-muted-foreground text-lg">No completed tasks today</p>
                  )}
                </div>
              </div>

              {/* Pending Tasks */}
              <div>
                <h3 className="text-2xl font-bold mb-4 text-orange-600">⏳ Pending Tasks</h3>
                <div className="space-y-3">
                  {pendingTasksToday.map((task) => (
                    <div
                      key={task.id}
                      className="flex justify-between items-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200"
                    >
                      <div className="flex-1">
                        <h4 className="font-bold text-lg">{task.customerName}</h4>
                        <p className="text-muted-foreground">{task.description}</p>
                        <p className="text-sm text-muted-foreground mt-1">{task.timestamp}</p>
                      </div>
                      <Badge
                        className={`font-semibold ${
                          task.status === "pending-short"
                            ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                        }`}
                      >
                        {task.status === "pending-short" ? "Short-Term" : "Long-Term"}
                      </Badge>
                    </div>
                  ))}
                  {pendingTasksToday.length === 0 && (
                    <p className="text-center py-8 text-muted-foreground text-lg">No pending tasks</p>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button onClick={() => setShowDailyReport(false)} className="flex-1 h-12 text-lg font-semibold">
                  Close Report
                </Button>
                <Button
                  onClick={() => {
                    setShiftStarted(false)
                    setTodayTasks([])
                    setShowDailyReport(false)
                    if (currentUser) {
                      localStorage.removeItem(`shift_${currentUser.id}_${new Date().toDateString()}`)
                      localStorage.removeItem(`tasks_${currentUser.id}_${new Date().toDateString()}`)
                    }
                  }}
                  variant="outline"
                  className="flex-1 h-12 text-lg font-semibold"
                >
                  End Shift
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
