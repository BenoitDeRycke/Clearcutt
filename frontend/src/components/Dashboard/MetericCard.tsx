type MetericCardProps = {
  title: string;
  value: string | number;
};

function MetericCard({ title, value }: MetericCardProps) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
export default MetericCard;
