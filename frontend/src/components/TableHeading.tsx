type TableCellProps = React.TdHTMLAttributes<HTMLTableCellElement> & {
  children: React.ReactNode;
};

function TableCell({ children, className = '' }: TableCellProps) {
  const alignmentClass = className.includes('text-') ? '' : 'text-right';

  return (
    <th className={`font-bold ${alignmentClass} text-[14px] px-4 py-2 ${className}`}>{children}</th>
  );
}

export default TableCell;
