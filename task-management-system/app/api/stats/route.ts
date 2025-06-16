import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const totalTasks = await prisma.task.count()
    const completedTasks = await prisma.task.count({ where: { done: true } })
    const pendingTasks = await prisma.task.count({ where: { done: false } })
    const totalCustomers = await prisma.customer.count()

    // Count expired contracts
    const expiredContracts = await prisma.customer.count({
      where: {
        contractEnd: {
          lt: new Date(),
        },
      },
    })

    // Count today's tasks
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayTasks = await prisma.task.count({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    })

    return NextResponse.json({
      totalTasks,
      completedTasks,
      pendingTasks,
      expiredContracts,
      todayTasks,
      totalCustomers,
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
