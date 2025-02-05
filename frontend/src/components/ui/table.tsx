import type React from "react"

interface TableProps {
  children: React.ReactNode
}

export function Table({ children, ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-auto">
      <table className={`w-full caption-bottom text-sm ${props.className || ""}`} {...props}>
        {children}
      </table>
    </div>
  )
}

export function TableHeader({ children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={`[&_tr]:border-b ${props.className || ""}`} {...props}>
      {children}
    </thead>
  )
}

export function TableBody({ children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={`[&_tr:last-child]:border-0 ${props.className || ""}`} {...props}>
      {children}
    </tbody>
  )
}

export function TableFooter({ children }: TableProps) {
  return <tfoot className="bg-zinc-900 font-medium text-zinc-50">{children}</tfoot>
}

export function TableRow({ children, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={`border-b transition-colors hover:bg-zinc-800/50 data-[state=selected]:bg-zinc-800 ${props.className || ""}`}
      {...props}
    >
      {children}
    </tr>
  )
}

export function TableHead({ children, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={`h-12 px-4 text-left align-middle font-medium text-zinc-400 [&:has([role=checkbox])]:pr-0 ${props.className || ""}`}
      {...props}
    >
      {children}
    </th>
  )
}

export function TableCell({ children, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${props.className || ""}`} {...props}>
      {children}
    </td>
  )
}

export function TableCaption({ children }: TableProps) {
  return <caption className="mt-4 text-sm text-zinc-500">{children}</caption>
}

