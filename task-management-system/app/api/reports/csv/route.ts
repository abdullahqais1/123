import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      include: {
        customer: true,
      },
      orderBy: { createdAt: "desc" },
    })

    const csvHeader = "العنوان,العميل,الموظف,المدة,الحالة,التاريخ,تاريخ انتهاء العقد"
    const csvRows = tasks.map((task) => {
      const status = task.done ? "مكتملة" : "معلقة"
      const date = new Date(task.createdAt).toLocaleDateString("ar-SA")
      const contractEnd = new Date(task.customer.contractEnd).toLocaleDateString("ar-SA")

      return `"${task.title}","${task.customer.name}","${task.employee}","${task.term}","${status}","${date}","${contractEnd}"`
    })

    const csvContent = [csvHeader, ...csvRows].join("\n")

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="tasks-report.csv"',
      },
    })
  } catch (error) {
    console.error("Error generating CSV:", error)
    return NextResponse.json({ error: "Failed to generate CSV" }, { status: 500 })
  }
}
