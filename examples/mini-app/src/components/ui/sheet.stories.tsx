import type { Meta, StoryObj } from "@storybook/react"
import { Button } from "./button"
import {
  Sheet,
  SheetTrigger,
  SheetPortal,
  SheetOverlay,
  SheetBottomPanelContent,
} from "./sheet"
import { ScrollArea } from "./scroll-area"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "./table"
import { Cog } from "lucide-react"
import { cn } from "../../lib/utils"

const meta = {
  title: "UI/Sheet",
  component: Sheet,
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "var(--background)" },
        { name: "dark", value: "var(--background)" },
      ],
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Sheet>

export default meta
type Story = StoryObj<typeof meta>

export const BottomPanelInfoExample: Story = {
  name: "Info",
  render: (args) => (
    <Sheet {...args}>
      <SheetTrigger asChild>
        <Button variant="outline">Open Info</Button>
      </SheetTrigger>
      <SheetPortal>
        <SheetOverlay className="!bg-black/60" />
        <SheetBottomPanelContent
          className={cn(
            "!h-auto !max-h-[70%]",
            "p-5 sm:p-6",
            "bg-card text-card-foreground",
          )}
        >
          <div className="grid grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-3 sm:gap-y-4 text-sm">
            <div>
              <p className="text-muted-foreground">Win chance:</p>
              <p className="font-semibold text-base">50%</p>
            </div>
            <div>
              <p className="text-muted-foreground">RNG fee:</p>
              <p className="font-semibold text-base">0 POL</p>
            </div>
            <div>
              <p className="text-muted-foreground">Target payout:</p>
              <p className="font-semibold text-base">1.94 POL</p>
            </div>
            <div>
              <p className="text-muted-foreground">Gas price:</p>
              <p className="font-semibold text-base">34.2123 gwei</p>
            </div>
          </div>
        </SheetBottomPanelContent>
      </SheetPortal>
    </Sheet>
  ),
}

interface HistoryEntry {
  id: string
  status: "Won bet" | "Busted"
  multiplier: number | string
  payoutAmount: number | string
  payoutCurrencyIcon: React.ReactElement
  timestamp: string
}

const mockHistoryData: HistoryEntry[] = [
  {
    id: "1",
    status: "Won bet",
    multiplier: 1.94,
    payoutAmount: "1.94675",
    payoutCurrencyIcon: (
      <Cog className="h-3.5 w-3.5 text-orange-500 inline-block ml-1" />
    ),
    timestamp: "~24h ago",
  },
  {
    id: "2",
    status: "Busted",
    multiplier: 1.2,
    payoutAmount: 0.0,
    payoutCurrencyIcon: (
      <Cog className="h-3.5 w-3.5 text-orange-500 inline-block ml-1" />
    ),
    timestamp: "~2h ago",
  },
  {
    id: "3",
    status: "Won bet",
    multiplier: 1.94,
    payoutAmount: 1.94,
    payoutCurrencyIcon: (
      <Cog className="h-3.5 w-3.5 text-orange-500 inline-block ml-1" />
    ),
    timestamp: "~2h ago",
  },
  ...Array.from({ length: 10 }, (_, i) => ({
    id: (i + 4).toString(),
    status: Math.random() > 0.4 ? ("Won bet" as const) : ("Busted" as const),
    multiplier: (Math.random() * 2 + 1).toFixed(2),
    payoutAmount: (Math.random() * 5).toFixed(3),
    payoutCurrencyIcon: (
      <Cog className="h-3.5 w-3.5 text-orange-500 inline-block ml-1" />
    ),
    timestamp: `~${i + 1}m ago`,
  })),
]

export const BottomPanelHistoryExample: Story = {
  name: "History",
  render: (args) => (
    <Sheet {...args}>
      <SheetTrigger asChild>
        <Button variant="outline">Open History</Button>
      </SheetTrigger>
      <SheetPortal>
        <SheetOverlay className="!bg-black/60" />
        <SheetBottomPanelContent
          className={cn(
            "!h-[70%] !max-h-full",
            "p-0",
            "bg-card text-card-foreground",
          )}
        >
          <ScrollArea className="h-full w-full rounded-t-[16px] overflow-hidden">
            <div className="p-1 pt-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/50">
                    <TableHead className="px-3 py-2.5 text-muted-foreground font-normal top-0 bg-card sticky z-10">
                      Draw
                    </TableHead>
                    <TableHead className="px-3 py-2.5 text-right text-muted-foreground font-normal top-0 bg-card sticky z-10">
                      X
                    </TableHead>
                    <TableHead className="px-3 py-2.5 text-right text-muted-foreground font-normal top-0 bg-card sticky z-10">
                      Payout
                    </TableHead>
                    <TableHead className="px-3 py-2.5 text-right text-muted-foreground font-normal top-0 bg-card sticky z-10">
                      Time
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockHistoryData.map((entry) => (
                    <TableRow
                      key={entry.id}
                      className="border-b border-border/50 last:border-b-0"
                    >
                      <TableCell
                        className={cn(
                          "px-3 py-2.5 font-medium",
                          entry.status === "Won bet"
                            ? "text-green-500"
                            : "text-red-500",
                        )}
                      >
                        {entry.status}
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-right text-foreground">
                        {entry.multiplier}
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-right text-foreground">
                        {entry.payoutAmount}
                        {entry.payoutCurrencyIcon}
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-right text-muted-foreground">
                        {entry.timestamp}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        </SheetBottomPanelContent>
      </SheetPortal>
    </Sheet>
  ),
}
