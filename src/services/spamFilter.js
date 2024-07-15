import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http()
})

export const isSpam = async (userAddress, senderAddress) => {
  try {
    // Check if the sender has any ETH balance
    const balance = await publicClient.getBalance({ address: senderAddress })
    
    // Check if the sender has any transactions
    const transactionCount = await publicClient.getTransactionCount({ address: senderAddress })
    
    // If the sender has no balance and no transactions, consider it potential spam
    if (balance === 0n && transactionCount === 0) {
      return 'requests'
    }
    
    // Check if there's any transaction history between the user and sender
    const userTransactions = await publicClient.getTransactionCount({ address: userAddress })
    const senderTransactions = await publicClient.getTransactionCount({ address: senderAddress })
    
    if (userTransactions > 0 && senderTransactions > 0) {
      return 'primary'
    }
    
    // If none of the above conditions are met, categorize as general
    return 'general'
  } catch (error) {
    console.error("Error categorizing address:", error)
    return 'requests' // Default to requests if there's an error
  }
}
