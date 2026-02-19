import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Platform } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/lib/useTheme';
import { useApp } from '@/lib/store';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { user } = useApp();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;

  const initials = user.fullName.split(' ').map(n => n[0]).join('').toUpperCase();

  const menuItems = [
    { icon: 'person-outline' as const, label: 'Informations personnelles', lib: 'ion' as const },
    { icon: 'document-text-outline' as const, label: 'Mes documents', lib: 'ion' as const },
    { icon: 'notifications-outline' as const, label: 'Notifications', lib: 'ion' as const },
    { icon: 'shield-checkmark-outline' as const, label: 'Vérification', lib: 'ion' as const },
    { icon: 'help-circle-outline' as const, label: 'Centre d\'aide', lib: 'ion' as const },
    { icon: 'information-circle-outline' as const, label: 'À propos de LOUMA', lib: 'ion' as const },
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
                <Text style={[styles.name, { color: colors.textPrimary }]}>{user.fullName}</Text>
                <Text style={[styles.phone, { color: colors.textSecondary }]}>{user.phone}</Text>
                <View style={styles.roleRow}>
                  <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>Locataire</Text>
                  </View>
                </View>
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300)} style={styles.scoreSection}>
            <View style={[styles.scoreCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.scoreHeader}>
                <Text style={[styles.scoreTitle, { color: colors.textPrimary }]}>Score de qualification</Text>
                <Text style={[styles.scoreValue, { color: '#B8F53A' }]}>{user.completionPercent}%</Text>
              </View>
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: `${user.completionPercent}%` }]} />
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
                style={({ pressed }) => [
                  styles.menuItem,
                  { backgroundColor: pressed ? colors.border : 'transparent', borderBottomColor: colors.border },
                  i === menuItems.length - 1 && { borderBottomWidth: 0 },
                ]}
              >
                <View style={styles.menuLeft}>
                  <Ionicons name={item.icon as any} size={22} color={colors.textSecondary} />
                  <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>{item.label}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </Pressable>
            ))}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(500)} style={styles.logoutSection}>
            <Pressable style={styles.logoutBtn}>
              <Ionicons name="log-out-outline" size={20} color={colors.danger} />
              <Text style={[styles.logoutText, { color: colors.danger }]}>Se déconnecter</Text>
            </Pressable>
          </Animated.View>

          <Text style={[styles.version, { color: colors.textMuted }]}>LOUMA v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '800' as const },
  profileCard: { paddingHorizontal: 20, marginBottom: 20 },
  avatarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    gap: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#B8F53A',
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 0.5,
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuLabel: { fontSize: 15 },
  logoutSection: { paddingHorizontal: 20, marginBottom: 16 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 16 },
  logoutText: { fontSize: 15, fontWeight: '600' as const },
  version: { textAlign: 'center', fontSize: 12, marginTop: 8 },
});
