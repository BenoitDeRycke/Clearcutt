type MetricCardProps = {
  title: string;
  value: string;
  change?: string;
};

function MetricCard({ title, value, change }: MetricCardProps) {
  return (
    <div className="bg-white rounded-xl border shadow-sm p-4 flex flex-col gap-2">
      <h2 className="text-[20px] font-semibold text-black leading-none pb-2">{value}</h2>
      <p className="text-xs uppercase text-gray-500 font-semibold">{title}</p>

      {change && <p className="text-sm text-clearcut-dark font-medium">{change}</p>}
    </div>
  );
}

export default MetricCard;
