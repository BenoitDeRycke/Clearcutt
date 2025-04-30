import { useState, useEffect } from 'react';
import { RefreshCcw, Loader2 } from 'lucide-react';

type Props = {
  title: string;
  onClick: () => Promise<void>;
  lastSynced: Date | null;
};

const SyncButton = ({ title, onClick, lastSynced }: Props) => {
  const [cooldown, setCooldown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(Date.now());

  const handleClick = async () => {
    if (cooldown || loading) return;

    setLoading(true);
    await onClick();
    setLoading(false);

    setCooldown(true);
    setTimeout(() => {
      setCooldown(false);
    }, 300 * 1000); // 5 minutes
  };

  const isDisabled = cooldown || loading;

  // 🛠 local now state refreshes every 60s inside SyncButton
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 60000); // every minute

    return () => clearInterval(interval);
  }, []);

  const formatRelativeTime = (lastSynced: Date | null) => {
    if (!lastSynced) return 'Not yet';

    const diffInSeconds = Math.floor((Date.now() - lastSynced.getTime()) / 1000);

    if (diffInSeconds < 5) return 'just now';
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;

    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className="flex justify-between items-center mb-5">
      <div className="flex items-center gap-2">
        <h2 className="text-[20px] font-semibold text-black leading-none pb-2">{title}</h2>

        <button
          onClick={handleClick}
          disabled={isDisabled}
          className={`p-1.5 rounded transition-colors duration-200
            ${
              isDisabled
                ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                : 'bg-clearcut-light text-clearcut hover:bg-clearcut-dark hover:text-white'
            }
          `}
        >
          {loading ? (
            <Loader2 className="animate-spin w-4 h-4" />
          ) : (
            <RefreshCcw className="w-4 h-4" />
          )}
        </button>
      </div>

      <span className="text-clearcut text-sm">Last synced: {formatRelativeTime(lastSynced)}</span>
    </div>
  );
};

export default SyncButton;
