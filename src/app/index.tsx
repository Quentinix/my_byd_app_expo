import { useAuth } from '@/context/AuthContext';
import { Redirect } from 'expo-router';

export default function HomeScreen() {
  const { status, session } = useAuth();

  if (status === 'authenticated' && session) {
    return <Redirect href="/Dashboard" />;
  } else {
    return <Redirect href="/Authentication" />;
  }
}
