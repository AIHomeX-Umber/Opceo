import type { Metadata } from 'next';
import { Suspense } from 'react';
import LoginFormInner from './LoginFormInner';
import { AuthGatewayLayout } from '../AuthGatewayLayout';

export const metadata: Metadata = {
  title: 'Sign In | OpCEO.AI',
  description: 'Sign in to your OpCEO.AI builder profile and keep shipping.',
};

export default async function LoginPage() {
  return (
    <AuthGatewayLayout mode="login">
      <Suspense
        fallback={
          <div className="flex w-full items-center justify-center py-12">
            <span className="font-body-serif text-sm text-black/35">Loading…</span>
          </div>
        }
      >
          <LoginFormInner />
      </Suspense>
    </AuthGatewayLayout>
  );
}
