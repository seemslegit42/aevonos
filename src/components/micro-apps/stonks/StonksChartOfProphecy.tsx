
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Mock data as fetching historical data is out of scope.
const chartData = [
  { month: "January", desktop: 186 },
  { month: "February", desktop: 305 },
  { month: "March", desktop: 237 },
  { month: "April", desktop: 273 },
  { month: "May", desktop: 209 },
  { month: "June", desktop: 214 },
]

const chartConfig = {
  desktop: {
    label: "Price Action",
    color: "hsl(var(--stonks-green))",
  },
} satisfies ChartConfig

export default function StonksChartOfProphecy() {
  return (
    <Card className="bg-transparent border-dashed">
      <CardHeader className="p-0">
        <CardTitle className="text-sm">Chart of Prophecy</CardTitle>
        <CardDescription className="text-xs">Kabbalistic Runes & Chicken Bones Analysis</CardDescription>
      </CardHeader>
      <CardContent className="p-0 pt-2">
        <ChartContainer config={chartConfig} className="h-[150px] w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis hide={true} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
