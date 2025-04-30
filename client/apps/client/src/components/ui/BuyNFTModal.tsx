import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'
import { formatEther } from 'viem'

interface BuyNFTModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  tokenId: string
  price: bigint
  seller: string
}

export function BuyNFTModal({
  isOpen,
  onClose,
  onConfirm,
  tokenId,
  price,
  seller,
}: BuyNFTModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirmPurchase = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      
      // This will trigger the wallet confirmation dialog
      // The actual transaction logic should be in the onConfirm function
      await onConfirm();
      
      // Close the modal after successful purchase
      onClose();
    } catch (err) {
      console.error('Purchase failed:', err);
      setError(typeof err === 'object' && err !== null && 'message' in err 
        ? (err as Error).message 
        : 'Failed to complete the purchase. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Transition appear show={isOpen} as="div">
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as="div"
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as="div"
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium text-gray-900">
                  Confirm Purchase
                </Dialog.Title>

                <div className="mt-4 space-y-3">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to purchase this NFT?
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p className="text-sm text-gray-600">Token ID: {tokenId}</p>
                    <p className="text-lg font-medium text-gray-900">
                      Price: {formatEther(price)} ETH
                    </p>
                    <p className="text-sm text-gray-500">
                      Seller: {seller.slice(0, 6)}...{seller.slice(-4)}
                    </p>
                  </div>
                  
                  {error && (
                    <div className="mt-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                      {error}
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                    onClick={onClose}
                    disabled={isProcessing}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={`inline-flex justify-center rounded-lg px-4 py-2 text-sm font-medium text-white ${
                      isProcessing ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                    onClick={handleConfirmPurchase}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      'Confirm Purchase'
                    )}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
