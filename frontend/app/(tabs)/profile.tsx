import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import { useTheme } from '@/lib/useTheme';
import { useAuth } from '@/lib/AuthContext';
import ProfileEditModal from '@/components/ProfileEditModal';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const [showEditModal, setShowEditModal] = React.useState(false);

  // ── Not authenticated ──────────────────────────────────────────────────────
  if (!isAuthenticated || !user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.unauthContainer, { paddingTop: topInset + 40 }]}>
          <Animated.View entering={FadeInDown.delay(100)} style={styles.unauthContent}>
            <View style={styles.unauthIcon}>
              <Ionicons name="person-outline" size={48} color={colors.textMuted} />
            </View>
            <Text style={[styles.unauthTitle, { color: colors.textPrimary }]}>Bienvenue sur LOUMA</Text>
            <Text style={[styles.unauthSub, { color: colors.textSecondary }]}>
              Connectez-vous pour gérer votre profil, vos favoris et vos demandes.
            </Text>
            <TouchableOpacity
              style={[styles.loginBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/auth' as any)}
            >
              <Text style={styles.loginBtnText}>Se connecter / S'inscrire</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    );
  }

  // ── Authenticated ──────────────────────────────────────────────────────────
  const initials = user?.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';
  const roleLabels: Record<string, string> = { TENANT: 'Locataire', OWNER: 'Propriétaire', AGENCY: 'Agence' };

  const menuItems = [
    { icon: 'person-outline' as const, label: 'Informations personnelles', onPress: () => setShowEditModal(true) },
    { icon: 'document-text-outline' as const, label: 'Mes documents' },
    { icon: 'notifications-outline' as const, label: 'Notifications' },
    { icon: 'shield-checkmark-outline' as const, label: 'Vérification' },
    { icon: 'help-circle-outline' as const, label: "Centre d'aide" },
    { icon: 'information-circle-outline' as const, label: 'À propos de LOUMA' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View style={{ paddingTop: topInset + 8 }}>
          <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Profil</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200)} style={styles.profileCard}>
            <View style={[styles.avatarWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.avatar}>
                <Text style={styles.initials}>{initials}</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={[styles.name, { color: colors.textPrimary }]}>{user?.fullName}</Text>
                <Text style={[styles.phone, { color: colors.textSecondary }]}>{user?.phone}</Text>
                <View style={styles.roleRow}>
                  <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>{user ? (roleLabels[user.role] ?? user.role) : ''}</Text>
                  </View>
                  {user?.isVerified && (
                    <View style={[styles.roleBadge, { backgroundColor: 'rgba(0,122,255,0.12)', marginLeft: 6 }]}>
                      <Text style={[styles.roleText, { color: '#007AFF' }]}>✓ Vérifié</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300)} style={styles.scoreSection}>
            <View style={[styles.scoreCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.scoreHeader}>
                <Text style={[styles.scoreTitle, { color: colors.textPrimary }]}>Score de qualification</Text>
                <Text style={[styles.scoreValue, { color: '#B8F53A' }]}>{user?.completionPercent}%</Text>
              </View>
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: `${user?.completionPercent || 0}%` as any }]} />
              </View>
              <Text style={[styles.scoreHint, { color: colors.textMuted }]}>
                Complétez votre profil pour augmenter votre score et améliorer vos chances
              </Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400)} style={styles.menuSection}>
            {menuItems.map((item, i) => (
              <Pressable
                key={item.label}
                onPress={item.onPress}
                style={({ pressed }) => [
                  styles.menuItem,
                  { backgroundColor: pressed ? colors.border : 'transparent', borderBottomColor: colors.border },
                  i === menuItems.length - 1 && { borderBottomWidth: 0 },
                ]}
              >
                <View style={styles.menuLeft}>
                  <Ionicons name={item.icon} size={22} color={colors.textSecondary} />
                  <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>{item.label}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </Pressable>
            ))}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(500)} style={styles.logoutSection}>
            <Pressable style={styles.logoutBtn} onPress={logout}>
              <Ionicons name="log-out-outline" size={20} color={colors.danger} />
              <Text style={[styles.logoutText, { color: colors.danger }]}>Se déconnecter</Text>
            </Pressable>
          </Animated.View>

          <Text style={[styles.version, { color: colors.textMuted }]}>LOUMA v1.0.0</Text>
        </View>
      </ScrollView>

      {user && (
        <ProfileEditModal
          visible={showEditModal}
          onClose={() => setShowEditModal(false)}
          user={user}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Unauthenticated
  unauthContainer: { flex: 1, paddingHorizontal: 24 },
  unauthContent: { alignItems: 'center' },
  unauthIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(184,245,58,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  unauthTitle: { fontSize: 22, fontWeight: '800' as const, textAlign: 'center', marginBottom: 12 },
  unauthSub: { fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  loginBtn: { borderRadius: 24, paddingVertical: 16, paddingHorizontal: 32, width: '100%', alignItems: 'center' },
  loginBtnText: { fontSize: 16, fontWeight: '700' as const, color: '#000' },

  // Authenticated
  header: { paddingHorizontal: 20, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '800' as const },
  profileCard: { paddingHorizontal: 20, marginBottom: 20 },
  avatarWrap: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, borderWidth: 1, gap: 16 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#B8F53A', alignItems: 'center', justifyContent: 'center' },
  initials: { fontSize: 22, fontWeight: '800' as const, color: '#0D0D0D' },
  profileInfo: { flex: 1 },
  name: { fontSize: 18, fontWeight: '700' as const },
  phone: { fontSize: 13, marginTop: 2 },
  roleRow: { flexDirection: 'row', marginTop: 6 },
  roleBadge: { backgroundColor: 'rgba(184,245,58,0.15)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  roleText: { fontSize: 11, fontWeight: '600' as const, color: '#B8F53A' },
  scoreSection: { paddingHorizontal: 20, marginBottom: 24 },
  scoreCard: { padding: 16, borderRadius: 16, borderWidth: 1 },
  scoreHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  scoreTitle: { fontSize: 15, fontWeight: '700' as const },
  scoreValue: { fontSize: 22, fontWeight: '900' as const },
  progressBg: { height: 6, backgroundColor: 'rgba(184,245,58,0.15)', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#B8F53A', borderRadius: 3 },
  scoreHint: { fontSize: 12, marginTop: 10, lineHeight: 18 },
  menuSection: { paddingHorizontal: 20, marginBottom: 16 },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 0.5 },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuLabel: { fontSize: 15 },
  logoutSection: { paddingHorizontal: 20, marginBottom: 16 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 16 },
  logoutText: { fontSize: 15, fontWeight: '600' as const },
  version: { textAlign: 'center', fontSize: 12, marginTop: 8 },
});
