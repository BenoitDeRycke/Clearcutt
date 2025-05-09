import { isZero, currencyFormatter } from '../utils/utils';

type TableCellProps = React.TdHTMLAttributes<HTMLTableCellElement> & {
  children?: React.ReactNode;
  currency?: string;
  format?: 'currency' | 'number' | 'raw'; // new prop
};

const TableCell = ({
  children,
  currency = '€',
  format = 'currency',
  className = '',
  ...props
}: TableCellProps) => {
  let content = children;
  let applyGray = false;

  if (typeof children === 'number') {
    if (isZero(children)) {
      content = '-';
      applyGray = true;
    } else {
      if (format === 'currency') {
        content = currencyFormatter(currency, children);
      } else if (format === 'number') {
        content = children.toLocaleString();
      }
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
