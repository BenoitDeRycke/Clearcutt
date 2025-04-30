type Props = {
  status: string;
};

export default function StatusBadge({ status }: Props) {
  const normalized = status.toLowerCase();

  const base = 'px-2 py-0.5 text-xs font-medium rounded-full inline-block whitespace-nowrap';
  const variants: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    draft: 'bg-blue-100 text-blue-700',
    archived: 'bg-gray-100 text-gray-600',
  };

  return (
    <span className={`${base} ${variants[normalized] || 'bg-gray-100 text-gray-600'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
    </span>
  );
}
