import { useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const API = 'http://localhost:5080';

type Screen = 'signin' | 'dashboard' | 'approvals' | 'billing';

interface Dashboard {
  activeMembers: number;
  pendingCorrections: number;
  pendingLeave: number;
  seats: { planId: string; limit: number; active: number; reserved: number; available: number };
  people: { id: string; fullName: string; department: string; role: string }[];
}

interface Correction {
  id: string;
  original: string;
  requested: string;
  reason: string;
  status: string;
}

export function App() {
  const [screen, setScreen] = useState<Screen>('signin');
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('lerato@mzansiwork.co.za');
  const [password, setPassword] = useState('Password123');
  const [error, setError] = useState('');
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [corrections, setCorrections] = useState<Correction[]>([]);
  const [billingMessage, setBillingMessage] = useState('');

  const load = async (nextToken: string) => {
    const headers = { Authorization: `Bearer ${nextToken}` };
    const [home, inbox] = await Promise.all([
      fetch(`${API}/api/dashboard`, { headers }).then((response) => response.json()),
      fetch(`${API}/api/corrections`, { headers }).then((response) => response.json())
    ]);
    setDashboard(home);
    setCorrections(inbox);
  };

  const signIn = async () => {
    setError('');
    const response = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const body = await response.json();
    if (!response.ok) {
      setError(body.message ?? 'Sign-in failed.');
      return;
    }
    setToken(body.token);
    await load(body.token);
    setScreen('dashboard');
  };

  const decide = async (id: string, decision: string) => {
    const reason = decision === 'approved' ? 'Accepted from the employer app.' : 'Please add the project this time belongs to.';
    await fetch(`${API}/api/corrections/${id}/review`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision, reason })
    });
    await load(token);
  };

  const tryUpgrade = async (confirm: boolean) => {
    const response = await fetch(`${API}/api/subscription/change`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId: 'medium', frequency: 'monthly', users: 20, confirm })
    });
    const body = await response.json();
    setBillingMessage(body.message);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      {screen === 'signin' ? (
        <View style={styles.body}>
          <Text style={styles.brand}>MzansiWork</Text>
          <Text style={styles.lead}>Employer app for attendance, approvals and the paid subscription.</Text>
          <TextInput style={styles.input} autoCapitalize="none" value={email} onChangeText={setEmail} placeholder="Work email" />
          <TextInput style={styles.input} secureTextEntry value={password} onChangeText={setPassword} placeholder="Password" />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable style={styles.primary} onPress={signIn}><Text style={styles.primaryText}>Sign in</Text></Pressable>
        </View>
      ) : (
        <View style={styles.flex}>
          <ScrollView contentContainerStyle={styles.body}>
            {screen === 'dashboard' && dashboard && (
              <>
                <Text style={styles.title}>Today</Text>
                <View style={styles.metrics}>
                  <Metric label="Active" value={String(dashboard.activeMembers)} />
                  <Metric label="Corrections" value={String(dashboard.pendingCorrections)} />
                  <Metric label="Leave" value={String(dashboard.pendingLeave)} />
                  <Metric label="Seats left" value={String(dashboard.seats.available)} />
                </View>
                <Text style={styles.section}>People</Text>
                {dashboard.people.map((person) => (
                  <View key={person.id} style={styles.card}>
                    <Text style={styles.cardTitle}>{person.fullName}</Text>
                    <Text style={styles.muted}>{person.department} · {person.role}</Text>
                  </View>
                ))}
              </>
            )}
            {screen === 'approvals' && corrections.map((item) => (
              <View key={item.id} style={styles.card}>
                <Text style={styles.cardTitle}>{item.original}</Text>
                <Text style={styles.muted}>{item.requested}</Text>
                <Text style={styles.muted}>{item.reason}</Text>
                <Text style={styles.status}>{item.status}</Text>
                {item.status === 'pending' && (
                  <View style={styles.row}>
                    <Pressable style={styles.small} onPress={() => decide(item.id, 'approved')}><Text style={styles.primaryText}>Approve</Text></Pressable>
                    <Pressable style={styles.smallGhost} onPress={() => decide(item.id, 'info_requested')}><Text style={styles.ghostText}>Ask for detail</Text></Pressable>
                  </View>
                )}
              </View>
            ))}
            {screen === 'billing' && (
              <>
                <Text style={styles.title}>Subscription</Text>
                <Text style={styles.lead}>Plan changes do nothing until you confirm. Dismissing this screen leaves the current plan in place.</Text>
                <Pressable style={styles.primary} onPress={() => tryUpgrade(false)}><Text style={styles.primaryText}>Review without confirming</Text></Pressable>
                <Pressable style={styles.secondary} onPress={() => tryUpgrade(true)}><Text style={styles.ghostText}>Confirm Medium Business</Text></Pressable>
                {billingMessage ? <Text style={styles.cardTitle}>{billingMessage}</Text> : null}
              </>
            )}
          </ScrollView>
          <View style={styles.nav}>
            {(['dashboard', 'approvals', 'billing'] as Screen[]).map((item) => (
              <Pressable key={item} onPress={() => setScreen(item)}><Text style={screen === item ? styles.navOn : styles.navOff}>{item}</Text></Pressable>
            ))}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.muted}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  flex: { flex: 1 },
  body: { padding: 20, gap: 12 },
  brand: { fontSize: 28, fontWeight: '700', color: '#14213D' },
  title: { fontSize: 26, fontWeight: '700', color: '#0F172A' },
  lead: { color: '#64748B', lineHeight: 20 },
  section: { marginTop: 8, fontWeight: '600', color: '#64748B' },
  input: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderWidth: 1, borderRadius: 10, padding: 12, color: '#0F172A' },
  primary: { backgroundColor: '#2563EB', borderRadius: 12, padding: 14, alignItems: 'center' },
  secondary: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderWidth: 1, borderRadius: 12, padding: 14, alignItems: 'center' },
  primaryText: { color: '#FFFFFF', fontWeight: '600' },
  ghostText: { color: '#0F172A', fontWeight: '600' },
  error: { color: '#DC2626' },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metric: { width: '47%', backgroundColor: '#FFFFFF', borderRadius: 14, padding: 12 },
  metricValue: { fontSize: 22, fontWeight: '700', color: '#0F172A' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, gap: 4 },
  cardTitle: { color: '#0F172A', fontWeight: '600' },
  muted: { color: '#64748B' },
  status: { color: '#B45309', fontWeight: '600' },
  row: { flexDirection: 'row', gap: 8, marginTop: 8 },
  small: { backgroundColor: '#2563EB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  smallGhost: { backgroundColor: '#F1F5F9', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  nav: { flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingVertical: 12, backgroundColor: '#FFFFFF' },
  navOn: { color: '#2563EB', fontWeight: '700' },
  navOff: { color: '#64748B' }
});
