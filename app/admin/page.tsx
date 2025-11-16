'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, LogOut, Check, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AdminDonation {
  id: number;
  user_name: string;
  user_email?: string;
  user_url?: string;
  amount: number;
  payment_method: string;
  status: string;
  created_at: string;
  user_message?: string;
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [donations, setDonations] = useState<AdminDonation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'confirmed'>('pending');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const credentials = btoa(`admin:${password}`);
      const response = await fetch('/api/admin/donations', {
        headers: { 'Authorization': `Basic ${credentials}` }
      });

      if (response.ok) {
        setAuthenticated(true);
        const data = await response.json();
        setDonations(data.donations);
      } else {
        setError('Invalid password');
      }
    } catch (err) {
      console.error('[v0] Login error:', err);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id: number) => {
    setLoading(true);
    try {
      const credentials = btoa(`admin:${password}`);
      
      const response = await fetch('/api/admin/donations', {
        method: 'PUT',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id })
      });

      if (response.ok) {
        setDonations(prev => 
          prev.map(d => d.id === id ? { ...d, status: 'confirmed' } : d)
        );
        setSuccessMessage('Donation confirmed!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('[v0] Confirm error:', err);
      setError('Failed to confirm donation');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id: number) => {
    setLoading(true);
    try {
      const credentials = btoa(`admin:${password}`);
      
      const response = await fetch('/api/admin/donations', {
        method: 'DELETE',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id })
      });

      if (response.ok) {
        setDonations(prev => 
          prev.map(d => d.id === id ? { ...d, status: 'rejected' } : d)
        );
        setSuccessMessage('Donation rejected');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('[v0] Reject error:', err);
      setError('Failed to reject donation');
    } finally {
      setLoading(false);
    }
  };

  const filteredDonations = filterStatus === 'all' 
    ? donations 
    : donations.filter(d => d.status === filterStatus);

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8">
          <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
          <p className="text-gray-600 mb-6">Enter your admin password</p>
          
          {error && (
            <Alert className="mb-4 bg-red-50 border-red-200">
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin password"
              required
            />
            <Button disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Login'
              )}
            </Button>
          </form>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          <Button
            variant="outline"
            onClick={() => {
              setAuthenticated(false);
              setPassword('');
              setDonations([]);
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        {successMessage && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-6 bg-red-50 border-red-200">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold">Donations Management</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Total: {donations.length} | 
                  Pending: {donations.filter(d => d.status === 'pending').length} | 
                  Confirmed: {donations.filter(d => d.status === 'confirmed').length}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={filterStatus === 'pending' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('pending')}
              >
                Pending
              </Button>
              <Button
                size="sm"
                variant={filterStatus === 'confirmed' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('confirmed')}
              >
                Confirmed
              </Button>
              <Button
                size="sm"
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
              >
                All
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left font-medium">Donor</th>
                  <th className="px-6 py-3 text-left font-medium">Email</th>
                  <th className="px-6 py-3 text-left font-medium">Amount</th>
                  <th className="px-6 py-3 text-left font-medium">Method</th>
                  <th className="px-6 py-3 text-left font-medium">Message</th>
                  <th className="px-6 py-3 text-left font-medium">Status</th>
                  <th className="px-6 py-3 text-left font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredDonations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      No donations found
                    </td>
                  </tr>
                ) : (
                  filteredDonations.map(donation => (
                    <tr key={donation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{donation.user_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{donation.user_email || '-'}</td>
                      <td className="px-6 py-4 font-semibold">¥{donation.amount.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm">{donation.payment_method}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-xs">
                        {donation.user_message || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          donation.status === 'confirmed' 
                            ? 'bg-green-100 text-green-800'
                            : donation.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {donation.status === 'confirmed' ? 'Confirmed' : donation.status === 'rejected' ? 'Rejected' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {donation.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleConfirm(donation.id)}
                                disabled={loading}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                {loading ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <Check className="mr-1 h-4 w-4" />
                                    Confirm
                                  </>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleReject(donation.id)}
                                disabled={loading}
                              >
                                {loading ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <X className="mr-1 h-4 w-4" />
                                    Reject
                                  </>
                                )}
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
