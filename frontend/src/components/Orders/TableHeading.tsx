type TableCellProps = {
  children: React.ReactNode;
};

function TableCell({ children }: TableCellProps) {
  return <th className="font-bold text-left text-[13px] px-4 py-2 ">{children}</th>;
}

export default TableCell;
