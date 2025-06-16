import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(customers)
  } catch (error) {
    console.error("Error fetching customers:", error)
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, contractEnd } = await request.json()

    const customer = await prisma.customer.create({
      data: {
        name,
        contractEnd: new Date(contractEnd),
      },
    })

    return NextResponse.json(customer, { status: 201 })
  } catch (error) {
    console.error("Error creating customer:", error)
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 })
  }
}
