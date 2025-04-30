import { useState } from 'react';
import { ReceiveModal } from '../components/ReceiveModal';
import { SendTokenModal } from '../components/SendTokenModal';
import { ImportTokenModal } from '../components/ImportTokenModal';
import { NETWORKS } from '../constants/networks';
import { useWallet } from '../hooks/useWallet';
import { useBalances } from '../hooks/useBalance';
import { Activity } from '../components/Activity';

type Tab = 'tokens' | 'activity';

export function WalletPage() {
  const {
    address,
    isUnlocked,
    network,
    importWallet,
    unlockWallet,
    switchNetwork
  } = useWallet();

  const { data, nativeBalance } = useBalances();
  const [activeTab, setActiveTab] = useState<Tab>('tokens');

  const [showImport, setShowImport] = useState(false);
  const [showNetworkMenu, setShowNetworkMenu] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [privateKey, setPrivateKey] = useState('');
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [showImportTokenModal, setShowImportTokenModal] = useState(false);

  const handleImport = async () => {
    try {
      await importWallet(privateKey, passcode);
      setShowImport(false);
      setPrivateKey('');
      setPasscode('');
      setError('');
    } catch (err) {
      setError('Invalid private key or passcode');
    }
  };

  const handleUnlock = async () => {
    console.log("🚀 ~ handleUnlock ~ passcode:", passcode)
    await unlockWallet(passcode);
  };

  const handleNetworkSwitch = async (chainId: number) => {
    try {
      await switchNetwork(chainId);
      setShowNetworkMenu(false);
    } catch (err) {
      console.error('Failed to switch network:', err);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(address || '');
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!isUnlocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
        {!showImport ? (
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Unlock Wallet</h2>
            <input
              type="password"
              placeholder="Enter passcode"
              className="w-full p-2 mb-4 bg-gray-700 rounded"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
            />
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <button
              onClick={handleUnlock}
              className="w-full bg-blue-600 p-2 rounded hover:bg-blue-700"
            >
              Unlock
            </button>
            <button
              onClick={() => setShowImport(true)}
              className="w-full mt-4 bg-gray-700 p-2 rounded hover:bg-gray-600"
            >
              Import New Wallet
            </button>
          </div>
        ) : (
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Import Wallet</h2>
            <input
              type="text"
              placeholder="Private Key (64 characters hex)"
              className="w-full p-2 mb-4 bg-gray-700 rounded"
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
            />
            <input
              type="password"
              placeholder="Set Passcode"
              className="w-full p-2 mb-4 bg-gray-700 rounded"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
            />
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <button
              onClick={handleImport}
              className="w-full bg-blue-600 p-2 rounded hover:bg-blue-700"
            >
              Import
            </button>
            <button
              onClick={() => setShowImport(false)}
              className="w-full mt-4 bg-gray-700 p-2 rounded hover:bg-gray-600"
            >
              Back to Unlock
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold">{nativeBalance?.balance} {network.symbol}</h1>
                <div className="relative">
                  <button
                    onClick={() => setShowNetworkMenu(!showNetworkMenu)}
                    className="px-3 py-1 text-sm bg-blue-600 rounded-full hover:bg-blue-700 flex items-center gap-2"
                  >
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    {network.name}
                  </button>
                  {showNetworkMenu && (
                    <div className="absolute top-full mt-2 right-0 bg-gray-800 rounded-lg shadow-lg p-2 min-w-[150px]">
                      {Object.values(NETWORKS).map((net) => (
                        <button
                          key={net.chainId}
                          onClick={() => handleNetworkSwitch(net.chainId)}
                          className={`w-full text-left px-3 py-2 rounded hover:bg-gray-700 ${net.chainId === network.chainId ? 'bg-gray-700' : ''
                            }`}
                        >
                          {net.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-gray-400 text-sm">{address}</p>
                <button
                  onClick={copyToClipboard}
                  className="p-1 hover:bg-gray-700 rounded transition-colors"
                  title="Copy address"
                >
                  <span className={`material-icons-outlined text-sm ${isCopied ? 'text-green-400' : 'text-gray-400'}`}>
                    {isCopied ? 'check' : 'content_copy'}
                  </span>
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSendModal(true)}
                className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
              >
                Send
              </button>
              <button
                onClick={() => setShowReceiveModal(true)}
                className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
              >
                Receive
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex gap-8 mb-6">
            <button onClick={() => setActiveTab('tokens')} className="text-blue-400 border-b-2 border-blue-400 pb-2">
              Tokens
            </button>
            <button onClick={() => setActiveTab('activity')} className="text-gray-400 pb-2">
              Activity
            </button>
          </div>

          <div className="space-y-4">
            {activeTab === 'tokens' && (
              <>{data.filter(Boolean).map((token) => (
                <div key={token?.address} className="flex items-center justify-between p-2 hover:bg-gray-700 rounded">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
                    <div>
                      <p className="font-medium">{token?.symbol}</p>
                      <p className="text-sm text-gray-400">{token?.balance}</p>
                    </div>
                  </div>
                  <p className="font-medium">{token?.balance} {token?.symbol}</p>
                </div>
              ))}<button
                onClick={() => setShowImportTokenModal(true)}
                className="w-full mt-4 py-3 text-sm text-blue-400 border border-blue-400/30 rounded-lg hover:bg-blue-400/10 transition-colors flex items-center justify-center gap-2"
              >
                  <span className="material-icons-outlined text-sm">add_circle_outline</span>
                  Import Token
                </button></>
            )}

            {activeTab === 'activity' && (
              <Activity />
            )}


          </div>
        </div>
      </div>

      <SendTokenModal
        isOpen={showSendModal}
        onClose={() => setShowSendModal(false)}
      />

      <ReceiveModal
        isOpen={showReceiveModal}
        onClose={() => setShowReceiveModal(false)}
        address={address || ''}
      />

      <ImportTokenModal
        isOpen={showImportTokenModal}
        onClose={() => setShowImportTokenModal(false)}
      />
    </div>
  );
}
