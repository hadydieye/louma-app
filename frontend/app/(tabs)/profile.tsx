import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Platform, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@/lib/useTheme';
import { useAuth } from '@/lib/AuthContext';
import ProfileEditModal from '@/components/ProfileEditModal';
import InfoModal, { InfoModalType } from '@/components/InfoModal';
import { leadService } from '@/services/leadService';
import { propertyService } from '@/services/propertyService';
import { useApp } from '@/lib/store';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { colors, themeMode, setThemeMode } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [infoModalType, setInfoModalType] = React.useState<InfoModalType>(null);

  const { data: myProperties } = useQuery({
    queryKey: ['properties', 'mine'],
    queryFn: () => propertyService.getMyProperties(),
    enabled: !!user && (user.role === 'OWNER' || user.role === 'AGENCY'),
  });

  const { data: receivedLeads } = useQuery({
    queryKey: ['leads', 'received'],
    queryFn: () => leadService.getForOwner(),
    enabled: !!user && (user.role === 'OWNER' || user.role === 'AGENCY'),
  });

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
              <Text style={styles.loginBtnText}>Se connecter / S&apos;inscrire</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    );
  }

  // ── Authenticated ──────────────────────────────────────────────────────────
  const { favorites } = useApp();
  const initials = user?.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';
  const isOwner = user?.role === 'OWNER' || user?.role === 'AGENCY';
  const roleLabels: Record<string, string> = { TENANT: 'Locataire', OWNER: 'Propriétaire', AGENCY: 'Agence' };

  const { data: myLeads } = useQuery({
    queryKey: ['leads', 'sent'],
    queryFn: () => leadService.getMyLeads(),
    enabled: !!user && user.role === 'TENANT',
  });

  const ownerStats = [
    { label: 'Annonces', value: myProperties?.length || 0, icon: 'home-outline' as const },
    { label: 'Demandes', value: receivedLeads?.length || 0, icon: 'chatbubbles-outline' as const },
    { label: 'Visites', value: receivedLeads?.filter((l: any) => l.status === 'VISITED').length || 0, icon: 'calendar-outline' as const },
  ];

  const tenantStats = [
    { label: 'Favoris', value: favorites?.length || 0, icon: 'heart-outline' as const },
    { label: 'Demandes', value: myLeads?.length || 0, icon: 'paper-plane-outline' as const },
    { label: 'Visites', value: myLeads?.filter((l: any) => l.status === 'VISITED').length || 0, icon: 'calendar-outline' as const },
  ];

  const stats = isOwner ? ownerStats : tenantStats;

  const menuItems = [
    ...(isOwner ? [
      { icon: 'home-outline' as const, label: 'Gérer mes annonces', onPress: () => router.push('/profile/my-properties' as any) },
    ] : []),
    { icon: 'person-outline' as const, label: 'Informations personnelles', onPress: () => setShowEditModal(true) },
    { icon: 'heart-outline' as const, label: isOwner ? 'Favoris' : 'Mes Favoris', onPress: () => router.push('/(tabs)/favorites' as any) },
    { icon: 'chatbubbles-outline' as const, label: isOwner ? 'Demandes reçues' : 'Mes Demandes', onPress: () => router.push('/(tabs)/leads' as any) },
    { icon: 'document-text-outline' as const, label: 'Mes documents', onPress: () => setInfoModalType('DOCUMENTS') },
    { icon: 'notifications-outline' as const, label: 'Notifications', onPress: () => setInfoModalType('NOTIFICATIONS') },
    { icon: 'shield-checkmark-outline' as const, label: 'Vérification', onPress: () => setInfoModalType('VERIFICATION') },
    { icon: 'help-circle-outline' as const, label: "Centre d'aide", onPress: () => setInfoModalType('HELP') },
    { icon: 'information-circle-outline' as const, label: 'À propos de LOUMA', onPress: () => setInfoModalType('ABOUT') },
  ];

  const handleLogout = () => {
    Alert.alert(
      "Déconnexion",
      "Êtes-vous sûr de vouloir vous déconnecter ?",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Se déconnecter", style: "destructive", onPress: logout }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View style={{ paddingTop: topInset + 8 }}>
          <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Mon Profil</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200)} style={styles.profileCard}>
            <View style={[styles.avatarWrap, { backgroundColor: colors.surface, borderColor: isOwner ? '#B8F53A' : colors.border, borderWidth: isOwner ? 1.5 : 1 }]}>
              <View style={[styles.avatar, { backgroundColor: user?.avatar ? 'transparent' : (isOwner ? '#B8F53A' : '#E5E5E5') }]}>
                {user?.avatar ? (
                  <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
                ) : (
                  <Text style={[styles.initials, { color: isOwner ? '#0D0D0D' : colors.textPrimary }]}>{initials}</Text>
                )}
              </View>
              <View style={styles.profileInfo}>
                <Text style={[styles.name, { color: colors.textPrimary }]}>{user?.fullName}</Text>
                <Text style={[styles.phone, { color: colors.textSecondary }]}>{user?.phone}</Text>
                <View style={styles.roleRow}>
                  <View style={[styles.roleBadge, { backgroundColor: isOwner ? 'rgba(184,245,58,0.15)' : 'rgba(0,122,255,0.1)' }]}>
                    <Text style={[styles.roleText, { color: isOwner ? '#B8F53A' : '#007AFF' }]}>{user ? (roleLabels[user.role] ?? user.role) : ''}</Text>
                  </View>
                  {user?.completionPercent === 100 && (
                    <View style={[styles.roleBadge, { backgroundColor: 'rgba(52,199,89,0.12)', marginLeft: 6 }]}>
                      <Text style={[styles.roleText, { color: '#34C759' }]}>✓ Vérifié</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(250)} style={styles.statsSection}>
            <View style={[styles.statsRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {stats.map((stat, i) => (
                <View key={stat.label} style={[styles.statItem, i < stats.length - 1 && { borderRightWidth: 1, borderRightColor: colors.border }]}>
                  <Ionicons name={stat.icon} size={18} color={isOwner ? '#B8F53A' : colors.textMuted} />
                  <Text style={[styles.statValue, { color: colors.textPrimary }]}>{stat.value}</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300)} style={styles.scoreSection}>
            <View style={[styles.scoreCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.scoreHeader}>
                <Text style={[styles.scoreTitle, { color: colors.textPrimary }]}>
                  {isOwner ? 'Score de confiance' : 'Score de qualification'}
                </Text>
                <Text style={[styles.scoreValue, { color: isOwner ? '#B8F53A' : '#007AFF' }]}>{user?.completionPercent}%</Text>
              </View>
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: `${user?.completionPercent || 0}%` as any, backgroundColor: isOwner ? '#B8F53A' : '#007AFF' }]} />
              </View>
              <Text style={[styles.scoreHint, { color: colors.textMuted }]}>
                {isOwner 
                  ? "Un score élevé rassure les locataires et augmente la visibilité de vos biens."
                  : "Complétez votre profil pour rassurer les propriétaires et obtenir plus de réponses."}
              </Text>
            </View>
          </Animated.View>

          {isOwner && (
            <Animated.View entering={FadeInDown.delay(350)} style={styles.actionSection}>
              <TouchableOpacity 
                style={[styles.actionCard, { backgroundColor: '#B8F53A' }]}
                onPress={() => router.push('/property/create')}
              >
                <View style={styles.actionContent}>
                  <View style={styles.actionIcon}>
                    <Ionicons name="add-circle" size={24} color="#0D0D0D" />
                  </View>
                  <View>
                    <Text style={styles.actionTitle}>Publier une annonce</Text>
                    <Text style={styles.actionSub}>Mettez votre bien sur Louma</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#0D0D0D" />
              </TouchableOpacity>
            </Animated.View>
          )}

          <Animated.View entering={FadeInDown.delay(400)} style={styles.themeSection}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>APPARENCE</Text>
            <View style={[styles.themeToggle, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {[
                { id: 'light', icon: 'sunny-outline', label: 'Clair' },
                { id: 'dark', icon: 'moon-outline', label: 'Sombre' },
                { id: 'system', icon: 'settings-outline', label: 'Système' },
              ].map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => setThemeMode(item.id as any)}
                  style={[
                    styles.themeOption,
                    themeMode === item.id && { backgroundColor: colors.primary }
                  ]}
                >
                  <Ionicons 
                    name={item.icon as any} 
                    size={18} 
                    color={themeMode === item.id ? '#0D0D0D' : colors.textSecondary} 
                  />
                  <Text style={[
                    styles.themeOptionLabel, 
                    { color: themeMode === item.id ? '#0D0D0D' : colors.textPrimary }
                  ]}>
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(450)} style={styles.menuSection}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>COMPTE & PARAMÈTRES</Text>
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
            <Pressable style={styles.logoutBtn} onPress={handleLogout}>
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

      <InfoModal
        visible={!!infoModalType}
        type={infoModalType}
        onClose={() => setInfoModalType(null)}
      />
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
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#B8F53A', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%', resizeMode: 'cover' },
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
  progressFill: { height: '100%', borderRadius: 3 },
  scoreHint: { fontSize: 12, marginTop: 10, lineHeight: 18 },

  // Stats Section
  statsSection: { paddingHorizontal: 20, marginBottom: 24 },
  statsRow: { flexDirection: 'row', borderRadius: 16, borderWidth: 1, paddingVertical: 16 },
  statItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  statValue: { fontSize: 18, fontWeight: '800' as const },
  statLabel: { fontSize: 11, fontWeight: '600' as const, textTransform: 'uppercase' },

  // Action Section
  actionSection: { paddingHorizontal: 20, marginBottom: 24 },
  actionCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 16 },
  actionContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  actionIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.05)', alignItems: 'center', justifyContent: 'center' },
  actionTitle: { fontSize: 16, fontWeight: '700' as const, color: '#0D0D0D' },
  actionSub: { fontSize: 12, color: 'rgba(0,0,0,0.6)' },

  // Theme Toggle
  themeSection: { paddingHorizontal: 20, marginBottom: 24 },
  sectionLabel: { fontSize: 11, fontWeight: '700' as const, letterSpacing: 1, marginBottom: 12, textTransform: 'uppercase' },
  themeToggle: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 6,
    borderWidth: 1,
    gap: 4,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  themeOptionLabel: { fontSize: 13, fontWeight: '600' as const },

  menuSection: { paddingHorizontal: 20, marginBottom: 16 },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 0.5 },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuLabel: { fontSize: 15 },
  logoutSection: { paddingHorizontal: 20, marginBottom: 16 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 16 },
  logoutText: { fontSize: 15, fontWeight: '600' as const },
  version: { textAlign: 'center', fontSize: 12, marginTop: 8 },
});
