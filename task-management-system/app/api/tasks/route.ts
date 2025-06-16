import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      include: {
        customer: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, details, term, employee, customerId } = await request.json()

    const task = await prisma.task.create({
      data: {
        title,
        details,
        term,
        employee,
        customerId,
      },
      include: {
        customer: true,
      },
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 })
  }
}
