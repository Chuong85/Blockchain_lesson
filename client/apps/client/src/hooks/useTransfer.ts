import { useMutation } from "@tanstack/react-query";

export const useTransfer = () => {
  return useMutation({
    mutationFn: async ({ tokenAddress, recipient, amount }: { tokenAddress: string, recipient: string, amount: string }) => {
      return ''
    },
  })
}
