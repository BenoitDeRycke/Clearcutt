type TableCellProps = {
  children: React.ReactNode;
};

function TableCell({ children }: TableCellProps) {
  return <td className="text-[13px] px-4 py-2 text-left">{children}</td>;
}

export default TableCell;
