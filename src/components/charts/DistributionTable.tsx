import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

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
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

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
      <div className={`px-3 sm:px-6 py-3 sm:py-4 ${colors.header} border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0`}>
        <h3 className={`text-base sm:text-lg font-semibold ${colors.title}`}>{title}</h3>
        <button
          onClick={exportToCSV}
          className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-xs sm:text-sm flex items-center gap-1"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={isMobile ? "14" : "16"}
            height={isMobile ? "14" : "16"}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="flex-shrink-0"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {isMobile ? "CSV" : "Export CSV"}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[300px]">
          <thead>
            <tr className={`${colors.tableHeader} bg-blue-800 text-white`}>
              <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">Range</th>
              <th className="px-3 sm:px-6 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold whitespace-nowrap">Count</th>
              <th className="px-3 sm:px-6 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold whitespace-nowrap">Percentage</th>
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
                <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-700 font-medium whitespace-nowrap">
                  {`${bin.toFixed(3)} - ${bins[index + 1].toFixed(3)}`}
                </td>
                <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-600 text-center whitespace-nowrap">
                  {counts[index]}
                </td>
                <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-600 text-center whitespace-nowrap">
                  {`${percentages[index].toFixed(1)}%`}
                </td>
              </tr>
            ))}
            <tr className={`${colors.totalRow} font-medium`}>
              <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-700 whitespace-nowrap">Total</td>
              <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-700 text-center whitespace-nowrap">
                {counts.reduce((a, b) => a + b, 0)}
              </td>
              <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-700 text-center whitespace-nowrap">
                100%
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
} 