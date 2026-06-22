type TableProps = {
  headers: string[];
  data: (string | number)[][];
};

export default function Table({ headers, data }: TableProps) {
  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="p-2 border">
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50">
              {row.map((cell, j) => (
                <td key={j} className="p-2 border">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}