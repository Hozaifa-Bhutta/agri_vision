import React from 'react';
import { AuditLogEntry } from './index';

interface AuditLogWidgetProps {
  auditLogs: AuditLogEntry[];
  loading: boolean;
  formatDate: (dateString: string) => string;
}

const AuditLogWidget: React.FC<AuditLogWidgetProps> = ({ auditLogs, loading, formatDate }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-medium text-gray-800 mb-4">Activity History</h2>
      {loading ? (
        <p className="text-gray-700">Loading activity history...</p>
      ) : auditLogs.length === 0 ? (
        <p className="text-gray-700">No activity records found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50"> {/* This is the header of the table */}
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Crop
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Yield
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200"> {/* body of the table */}
              {/* create a row for each log */}
              {auditLogs.map((log, index) => ( 
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}> {/* alternate row colors */}
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      log.action_type === 'INSERT' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {log.action_type === 'INSERT' ? 'Added' : 'Deleted'}
                    </span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(log.action_timestamp)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                    {log.crop_type}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                    {log.yieldacre ? `${log.yieldacre} bu/acre` : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AuditLogWidget; 