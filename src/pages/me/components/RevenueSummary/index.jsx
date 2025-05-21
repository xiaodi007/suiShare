
export default function RevenueSummary({ data, onClaim }) {
  return (
    <div className="w-[90%] m-auto py-10 flex justify-between items-center px-6 py-4 bg-white rounded-xl shadow-sm">
      {/* Revenue Data */}
      <div className="flex flex-col">
        <div className="mb-2 text-sm text-gray-500">Revenue Data Overview</div>
        <span className="text-2xl font-semibold"> {data.revenue || 0} SUI </span>
      </div>

      {/* Compare to Previous Day */}
      <div className="flex flex-col items-center">
        <div className="mb-2 text-sm text-gray-500">Compared to Previous Day</div>
        <span className="text-green-500 font-semibold flex items-center text-2xl">
          {data.growth || 0}%
        </span>
      </div>

      {/* Withdrawable Earnings */}
      <div className="flex flex-col items-end">
        <div className="mb-2 text-sm text-gray-500">Total Withdrawable Earnings</div>
        <span className="text-2xl font-semibold"> {data.withdrawable || 0} SUI </span>
      </div>

      {/* Claim Button */}
      {/* <button
        onClick={onClaim}
        className="ml-6 px-5 py-1.5 rounded-md bg-[#4C49F3] text-white hover:bg-[#3836c7] transition"
      >
        Claim
      </button> */}
    </div>
  );
}
