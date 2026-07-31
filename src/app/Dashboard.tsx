import { useAuth } from '@/context/AuthContext';
import { ScreenLayout } from '@/components/byd/ScreenLayout';
import { SessionDashboard } from '@/components/byd/SessionDashboard';

export default function DashboardScreen() {
  const {
    session,
    vehicles,
    activeVehicle,
    savedUsername,
    logout,
    selectVehicle,
    refreshVehicleRealtime,
  } = useAuth();

  if (!session) {
    return <>Pas de session</>;
  }

  return (
    <ScreenLayout>
      <SessionDashboard
        activeVehicle={activeVehicle}
        vehicles={vehicles}
        session={session}
        username={savedUsername}
        onSelectVehicle={selectVehicle}
        onLogout={logout}
        onRefresh={refreshVehicleRealtime}
      />
    </ScreenLayout>
  );
}

