import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const totalTasks = await prisma.task.count()
    const completedTasks = await prisma.task.count({ where: { done: true } })
    const pendingTasks = await prisma.task.count({ where: { done: false } })

    // Employee statistics
    const employeeStats = await prisma.task.groupBy({
      by: ["employee"],
      _count: {
        id: true,
      },
    })

    const employeeStatsObj = employeeStats.reduce(
      (acc, stat) => {
        acc[stat.employee] = stat._count.id
        return acc
      },
      {} as { [key: string]: number },
    )

    // Monthly statistics (simplified)
    const monthlyStats = {
      يناير: Math.floor(Math.random() * 20) + 5,
      فبراير: Math.floor(Math.random() * 20) + 5,
      مارس: Math.floor(Math.random() * 20) + 5,
      أبريل: Math.floor(Math.random() * 20) + 5,
      مايو: Math.floor(Math.random() * 20) + 5,
      يونيو: Math.floor(Math.random() * 20) + 5,
    }

    return NextResponse.json({
      totalTasks,
      completedTasks,
      pendingTasks,
      employeeStats: employeeStatsObj,
      monthlyStats,
    })
  } catch (error) {
    console.error("Error fetching report stats:", error)
    return NextResponse.json({ error: "Failed to fetch report stats" }, { status: 500 })
  }
}
