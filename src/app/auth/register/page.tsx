import type { Metadata } from 'next';
import RegisterForm from './RegisterForm';
import { AuthGatewayLayout } from '../AuthGatewayLayout';

export const metadata: Metadata = {
  title: 'Join the Frontier | OpCEO.AI',
  description: 'Create your builder profile on OpCEO.AI. Ship weekly logs, track your streak, and get signal-bet by investors.',
};

export default async function RegisterPage() {
  return (
    <AuthGatewayLayout mode="register">
      <RegisterForm />
    </AuthGatewayLayout>
  );
}
