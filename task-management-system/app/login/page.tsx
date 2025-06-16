"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LogIn, Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/theme-provider"

const defaultUsers = [
  { id: 1, username: "ali", name: "Ali Ahmed", password: "1", role: "employee" },
  { id: 2, username: "fatima", name: "Fatima Hassan", password: "2", role: "employee" },
  { id: 3, username: "mohammed", name: "Mohammed Ali", password: "3", role: "employee" },
  { id: 4, username: "zainab", name: "Zainab Omar", password: "4", role: "employee" },
  { id: 5, username: "ahmed", name: "Ahmed Khalil", password: "5", role: "employee" },
  { id: 6, username: "maryam", name: "Maryam Saeed", password: "6", role: "employee" },
  { id: 7, username: "admin", name: "System Administrator", password: "7", role: "admin" },
]

export default function LoginPage() {
  const [selectedUser, setSelectedUser] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState(defaultUsers)
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const savedUsers = localStorage.getItem("systemUsers")
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers))
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const user = users.find((u) => u.id.toString() === selectedUser)

    if (user && user.password === password) {
      localStorage.setItem("currentUser", JSON.stringify(user))
      localStorage.setItem("authToken", "authenticated")

      if (user.role === "admin") {
        router.push("/admin")
      } else {
        router.push("/employee")
      }
    } else {
      alert("Invalid username or password")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="absolute top-4 right-4">
        <Button variant="outline" size="icon" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>

      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <LogIn className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold">Task Management System</CardTitle>
          <CardDescription className="text-lg">Select your account and enter password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="user" className="text-base font-semibold">
                Select User
              </Label>
              <Select value={selectedUser} onValueChange={setSelectedUser} required>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Choose your account" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium">{user.name}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          ({user.role === "admin" ? "Administrator" : "Employee"})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-base font-semibold">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="h-12"
                required
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full h-12 text-lg font-semibold">
              <LogIn className="h-5 w-5 mr-2" />
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
