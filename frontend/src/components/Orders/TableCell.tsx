type TableCellProps = React.TdHTMLAttributes<HTMLTableCellElement> & {
  children: React.ReactNode;
};

const TableCell = ({ children, className = '', ...props }: TableCellProps) => (
  <td className={`text-[13px] px-4 py-2 text-left ${className}`} {...props}>
    {children}
  </td>
);

export default TableCell;
