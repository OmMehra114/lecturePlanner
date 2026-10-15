import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import LandingPage from '../components/LandingPage';

export default async function Page() {
  const { userId } = await auth();

  // If user is already authenticated, navigate directly to /dashboard
  if (userId) {
    redirect('/dashboard');
  }

  // Otherwise, render the landing page on /
  return <LandingPage />;
}