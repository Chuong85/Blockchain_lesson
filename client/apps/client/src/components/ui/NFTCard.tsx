import { formatEther } from 'ethers'
import { useCallback, useState } from 'react'
import { useAccount } from 'wagmi'
import { useMutateCancelListing, useMutateBuyNFT } from '../../hooks/useNFT'
import { NFTImage } from './NFTImage'
import { BuyNFTModal } from './BuyNFTModal'

interface NFTCardProps {
  tokenId: string
  name?: string
  nftAddress?: string
  price?: bigint
  seller?: string
  onAction?: () => void
  actionLabel?: string
  showBuyOption?: boolean
}

export function NFTCard({
  tokenId,
  name = `NFT #${tokenId}`,
  nftAddress,
  price,
  seller,
  onAction,
  actionLabel,
  showBuyOption = true,
}: NFTCardProps) {
  const { address } = useAccount()
  const { mutate: cancelListing } = useMutateCancelListing(nftAddress!, tokenId)
  const { mutate: buyNFT, isPending: isBuying } = useMutateBuyNFT(nftAddress!, tokenId, price ? formatEther(price) : '0')
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const handleAction = useCallback(() => {
    if (seller === address) {
      cancelListing()
    } else if (showBuyOption && price) {
      setIsModalOpen(true)
    } else {
      onAction?.()
    }
  }, [address, seller, cancelListing, onAction, showBuyOption, price])
  
  const handleConfirmPurchase = async () => {
    setError(null)
    buyNFT(undefined, {
      onError: (err: any) => {
        console.error('Error buying NFT:', err)
        
        // Check if the error is a user rejection
        const errorMessage = err?.message || '';
        const isUserRejection = 
          errorMessage.includes('User denied transaction signature') || 
          errorMessage.includes('User rejected the request') ||
          errorMessage.includes('MetaMask Tx Signature: User denied');
        
        // Only set error state if it's not a user rejection
        if (!isUserRejection) {
          setError(err.message || 'Failed to buy NFT');
        }
        
        // Close the modal regardless of error type
        setIsModalOpen(false);
      },
      onSuccess: () => {
        // Close the modal on success
        setIsModalOpen(false);
      }
    })
  }
  
  const formattedPrice = price ? formatEther(price.toString()) : null
  
  // Determine the button label based on context
  const getButtonLabel = () => {
    if (seller === address) return 'Cancel Listing'
    if (showBuyOption && price) return isBuying ? 'Processing...' : 'Buy NFT'
    return actionLabel
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border hover:shadow-lg transition-shadow">
      <div className="aspect-square relative overflow-hidden rounded-t-xl">
        <NFTImage
          nftAddress={nftAddress}
          tokenId={tokenId}
          className="w-full h-full"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900">{name}</h3>
        <div className="mt-2 space-y-2">
          <p className="text-sm text-gray-600">Token ID: {tokenId}</p>
          {formattedPrice && (
            <p className="text-lg font-medium text-gray-900">
              {formattedPrice} ETH
            </p>
          )}
          {seller && (
            <p className="text-sm text-gray-500">
              Seller: {seller.slice(0, 6)}...{seller.slice(-4)}
            </p>
          )}
          
          {error && <p className="text-sm text-red-500">{error}</p>}
          
          {(onAction || seller === address || (showBuyOption && price)) && (
            <button
              onClick={handleAction}
              disabled={isBuying}
              className={`w-full mt-3 px-4 py-2 ${
                isBuying 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              } rounded-lg transition-colors`}
            >
              {getButtonLabel()}
            </button>
          )}
        </div>
      </div>
      
      {nftAddress && price && seller && (
        <BuyNFTModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirmPurchase}
          tokenId={tokenId}
          price={price}
          seller={seller}
        />
      )}
    </div>
  )
}
