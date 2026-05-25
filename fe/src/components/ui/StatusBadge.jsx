import { getStatusBadgeClass } from '../../utils/getStatusBadgeClass.js';

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getStatusBadgeClass(status)}`}>
      {status}
    </span>
  );
}

export default StatusBadge;
