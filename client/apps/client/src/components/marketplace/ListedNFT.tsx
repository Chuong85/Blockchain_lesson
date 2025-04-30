import { ethers } from "ethers"
import React, { useState } from "react"
import { useAccount } from "wagmi"
import { ListedNFT as ListedNFTType, useListNFT, useMutateBuyNFT } from "../../hooks/useNFT"
import { BuyNFTModal } from "../ui/BuyNFTModal"
import { NFTCard } from "../ui/NFTCard"
import { Spinner } from "./spinner"

export const ListedNFT = () => {
  const { address } = useAccount()
  const { data, isLoading, isError, fetchNextPage, hasNextPage } = useListNFT()
  const [selectedNFT, setSelectedNFT] = useState<ListedNFTType | null>(null)
  const [purchaseError, setPurchaseError] = useState<string | null>(null)
  
  // Create the buy mutation hook with the selected NFT details
  const { mutate: buyNFT, isPending: isBuying } = selectedNFT 
    ? useMutateBuyNFT(
        selectedNFT.contractAddress,
        selectedNFT.tokenId,
        ethers.formatEther(selectedNFT.price)
      ) 
    : { mutate: () => {}, isPending: false }
  
  // Handle the purchase confirmation
  const handleConfirmPurchase = () => {
    if (!selectedNFT) return
    
    setPurchaseError(null)
    
    buyNFT(undefined, {
      onSuccess: () => {
        // Close the modal and clear selection on success
        setSelectedNFT(null)
      },
      onError: (error: any) => {
        console.error("Purchase error:", error)
        setPurchaseError(error.message || "Failed to complete purchase")
      }
    })
  }

  return (
    <>
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Available NFTs {isLoading && <Spinner />}</h2>
      <div className="grid grid-cols-4 gap-6">
        {data?.pages.map((group, i) => (
          <React.Fragment key={i}>
            {group.map((item) => (
              <NFTCard
                key={`${item.id}`}
                tokenId={item.tokenId}
                name={item.name}
                nftAddress={item.contractAddress}
                seller={item.seller}
                price={BigInt(item.price)}
                actionLabel={item.seller === address ? "Cancel" : "Buy"}
                onAction={() => setSelectedNFT(item)}
              />
            ))}
          </React.Fragment>
        ))}
      </div>
    </section>
    {selectedNFT && (
        <BuyNFTModal
          isOpen={!!selectedNFT}
          onClose={() => setSelectedNFT(null)}
          onConfirm={handleConfirmPurchase}
          tokenId={selectedNFT.tokenId}
          price={BigInt(selectedNFT.price)}
          seller={selectedNFT.seller}
          isLoading={isBuying}
          error={purchaseError}
        />
      )}
    </>
  )
}
