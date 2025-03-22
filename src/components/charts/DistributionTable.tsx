interface DistributionTableProps {
  title: string;
  bins: number[];
  counts: number[];
  percentages: number[];
  theme?: 'blue' | 'orange';
}

const themeColors = {
  blue: {
    header: 'bg-blue-100',
    title: 'text-blue-800',
    tableHeader: 'text-blue-900',
    row: 'hover:bg-blue-100',
    oddRow: 'bg-blue-50/70',
    totalRow: 'bg-blue-100'
  },
  orange: {
    header: 'bg-orange-100',
    title: 'text-orange-800',
    tableHeader: 'text-orange-900',
    row: 'hover:bg-orange-100',
    oddRow: 'bg-orange-50/70',
    totalRow: 'bg-orange-100'
  }
};

export default function DistributionTable({
  title,
  bins,
  counts,
  percentages,
  theme = 'blue'
}: DistributionTableProps) {
  const colors = themeColors[theme];

  // 导出为CSV函数
  const exportToCSV = () => {
    // 创建CSV内容
    const headers = ['Range', 'Count', 'Percentage'];
    const rows = bins.slice(0, -1).map((bin, index) => [
      `${bin.toFixed(3)} - ${bins[index + 1].toFixed(3)}`,
      counts[index],
      `${percentages[index].toFixed(1)}%`
    ]);
    const total = ['Total', counts.reduce((a, b) => a + b, 0), '100%'];
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
      total.join(',')
    ].join('\n');

    // 创建并下载文件
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/\s+/g, '-')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className={`px-6 py-4 ${colors.header} border-b flex justify-between items-center`}>
        <h3 className={`text-lg font-semibold ${colors.title}`}>{title}</h3>
        <button
          onClick={exportToCSV}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
        >
          Export CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className={`${colors.tableHeader} text-white`}>
              <th className="px-6 py-3 text-left text-sm font-semibold">Range</th>
              <th className="px-6 py-3 text-center text-sm font-semibold">Count</th>
              <th className="px-6 py-3 text-center text-sm font-semibold">Percentage</th>
            </tr>
          </thead>
          <tbody>
            {bins.slice(0, -1).map((bin, index) => (
              <tr 
                key={bin}
                className={`
                  ${index % 2 === 0 ? colors.oddRow : colors.row}
                  ${colors.row} transition-colors duration-150
                `}
              >
                <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                  {`${bin.toFixed(3)} - ${bins[index + 1].toFixed(3)}`}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 text-center">
                  {counts[index]}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 text-center">
                  {`${percentages[index].toFixed(1)}%`}
                </td>
              </tr>
            ))}
            <tr className={`${colors.totalRow} font-medium`}>
              <td className="px-6 py-4 text-sm text-gray-700">Total</td>
              <td className="px-6 py-4 text-sm text-gray-700 text-center">
                {counts.reduce((a, b) => a + b, 0)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-700 text-center">
                100%
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
} 