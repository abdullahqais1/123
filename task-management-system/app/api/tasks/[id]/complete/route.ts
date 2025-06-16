import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const taskId = Number.parseInt(params.id)

    const task = await prisma.task.update({
      where: { id: taskId },
      data: { done: true },
      include: {
        customer: true,
      },
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error("Error completing task:", error)
    return NextResponse.json({ error: "Failed to complete task" }, { status: 500 })
  }
}
