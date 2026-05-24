import { useParams } from 'react-router-dom';
import { useStore } from '../lib/store';
import { ClusterDetail } from '../components/cluster/ClusterDetail';
import type { ClusterId } from '../lib/types';

export function ClusterPage() {
  const { id } = useParams<{ id: string }>();
  const { progress } = useStore();

  if (!progress) {
    return <div className="text-zinc-500">Loading...</div>;
  }

  const cluster = progress.clusters[id as ClusterId];

  if (!cluster) {
    return (
      <div className="text-zinc-500">
        Cluster not found
      </div>
    );
  }

  return <ClusterDetail cluster={cluster} logs={progress.logs} />;
}
