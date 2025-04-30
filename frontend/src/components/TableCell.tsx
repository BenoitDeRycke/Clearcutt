import { isZero, currencyFormatter } from '../utils/utils';

type TableCellProps = React.TdHTMLAttributes<HTMLTableCellElement> & {
  children?: React.ReactNode;
  currency?: string;
};

const TableCell = ({ children, currency = '€', className = '', ...props }: TableCellProps) => {
  let content = children;
  let applyGray = false;

  if (typeof children === 'number') {
    if (isZero(children)) {
      content = '-';
      applyGray = true;
    } else {
      content = currencyFormatter(currency, children);
    }
  }

  const alignmentClass = className.includes('text-') ? '' : 'text-right';

  return (
    <td
      className={`text-[12px] px-4 py-2 ${alignmentClass} ${applyGray ? 'text-gray-400' : ''} ${className}`}
      {...props}
    >
      {content}
    </td>
  );
};

export default TableCell;
