import { useState } from 'react';
import { RefreshCcw, Loader2 } from 'lucide-react';

type Props = {
  onClick: () => Promise<void>; // must return a promise now
};

const SyncButton = ({ onClick }: Props) => {
  const [cooldown, setCooldown] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (cooldown || loading) return;

    setLoading(true);
    await onClick();
    setLoading(false);

    setCooldown(true);
    setTimeout(() => {
      setCooldown(false);
    }, 60 * 1000); // 1 minute cooldown
  };

  return (
    <div className="relative group">
      <button
        onClick={handleClick}
        disabled={cooldown || loading}
        className={`p-1.5 rounded transition ${
          cooldown || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800'
        }`}
      >
        {loading ? (
          <Loader2 className="animate-spin text-white w-5 h-5" />
        ) : (
          <RefreshCcw className="text-white w-5 h-5" />
        )}
      </button>
    </div>
  );
};

export default SyncButton;
