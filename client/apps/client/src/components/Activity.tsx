import { useActivity } from "../hooks/useActivity";

export const Activity = () => {
  const { data } = useActivity();
  console.log("🚀 ~ Activity ~ data:", data)

  return (
    <div>
      <p>Activity</p>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Block</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data?.events.map((item) => (
              <tr key={item.txHash} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.action}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.amount}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.from}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.to}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.blockNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.timestamp}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.txHash}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
