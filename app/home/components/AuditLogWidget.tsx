import React from 'react';
import { AuditLogEntry } from './index';

interface AuditLogWidgetProps {
  auditLogs: AuditLogEntry[];
  loading: boolean;
  formatDate: (dateString: string) => string;
}

const AuditLogWidget: React.FC<AuditLogWidgetProps> = ({ auditLogs, loading, formatDate }) => {
  const getActionStyle = (actionType: string) => {
    switch (actionType) {
      case 'INSERT':
        return {
          style: 'bg-green-100 text-green-800',
          label: 'Added'
        };
      case 'UPDATE':
        return {
          style: 'bg-blue-100 text-blue-800',
          label: 'Updated'
        };
      case 'DELETE':
        return {
          style: 'bg-red-100 text-red-800',
          label: 'Deleted'
        };
      default:
        return {
          style: 'bg-gray-100 text-gray-800',
          label: actionType
        };
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col">
      <h2 className="text-lg font-medium text-gray-800 mb-4">Activity History</h2>
      
      {loading ? (
        <div className="flex-grow flex items-center justify-center">
          <p className="text-gray-700">Loading activity history...</p>
        </div>
      ) : auditLogs.length === 0 ? (
        <div className="flex-grow flex items-center justify-center">
          <p className="text-gray-700">No activity records found.</p>
        </div>
      ) : (
        <div 
          className="overflow-auto flex-grow" 
          style={{ 
            height: "300px", // Fixed height that matches climate widget height
            maxHeight: "calc(100% - 2rem)" 
          }}
        >
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
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
            <tbody className="bg-white divide-y divide-gray-200">
              {auditLogs.map((log, index) => {
                const { style, label } = getActionStyle(log.action_type);
                
                return (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}>
                        {label}
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
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-2 text-xs text-gray-500 text-right">
        Showing {auditLogs.length} activities
      </div>
    </div>
  );
};

export default AuditLogWidget; 