import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    useColorScheme,
    Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/lib/AuthContext';
import { getColors, spacing, borderRadius } from '@/constants/colors';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';

type Tab = 'login' | 'register';
type Role = 'TENANT' | 'OWNER' | 'AGENCY';

const ROLES: { value: Role; label: string; emoji: string }[] = [
    { value: 'TENANT', label: 'Locataire', emoji: '🔍' },
    { value: 'OWNER', label: 'Propriétaire', emoji: '🏠' },
    { value: 'AGENCY', label: 'Agence', emoji: '🏢' },
];

export default function AuthScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const colors = getColors(isDark);

    const { login, register, isLoading, error, clearError } = useAuth();

    const [tab, setTab] = useState<Tab>('login');

    // Login state
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // Register state
    const [fullName, setFullName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regConfirm, setRegConfirm] = useState('');
    const [role, setRole] = useState<Role>('TENANT');

    // Visibility state
    const [showLoginPass, setShowLoginPass] = useState(false);
    const [showRegPass, setShowRegPass] = useState(false);
    const [showRegConfirm, setShowRegConfirm] = useState(false);

    const handleLogin = async () => {
        if (!loginEmail.trim() || !loginPassword) {
            Alert.alert('Champs requis', 'Veuillez remplir tous les champs.');
            return;
        }
        
        try {
            await login({ email: loginEmail.trim(), password: loginPassword });
            router.back();
        } catch (err) {
            // L'erreur est gérée par le contexte Auth
            console.error('Login error:', err);
        }
    };

    const handleRegister = async () => {
        if (!fullName.trim() || !regEmail.trim() || !regPassword) {
            Alert.alert('Champs requis', 'Veuillez remplir tous les champs.');
            return;
        }
        
        if (regPassword !== regConfirm) {
            Alert.alert('Mots de passe', 'Les mots de passe ne correspondent pas.');
            return;
        }
        
        if (regPassword.length < 8) {
            Alert.alert('Mot de passe faible', 'Le mot de passe doit contenir au moins 8 caractères.');
            return;
        }
        
        try {
            await register({
                fullName: fullName.trim(),
                email: regEmail.trim(),
                password: regPassword,
                role
            });
            router.back();
        } catch (err) {
            // L'erreur est gérée par le contexte Auth
            console.error('Register error:', err);
        }
    };

    const s = makeStyles(colors, isDark);

    return (
        <View style={s.root}>
            <KeyboardAwareScrollViewCompat
                contentContainerStyle={s.scroll}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={s.header}>
                    <View style={s.logoMark}>
                        <Text style={s.logoText}>L</Text>
                    </View>
                    <Text style={s.brand}>LOUMA</Text>
                    <Text style={s.tagline}>L&apos;immobilier guinéen, simplifié.</Text>
                </View>

                {/* Tab switcher */}
                <View style={s.tabs}>
                    {(['login', 'register'] as Tab[]).map(t => (
                        <TouchableOpacity
                            key={t}
                            style={[s.tab, tab === t && s.tabActive]}
                            onPress={() => { setTab(t); clearError(); }}
                        >
                            <Text style={[s.tabText, tab === t && s.tabTextActive]}>
                                {t === 'login' ? 'Connexion' : 'Inscription'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Error banner */}
                {error ? (
                    <View style={s.errorBanner}>
                        <Text style={s.errorText}>⚠️ {error}</Text>
                    </View>
                ) : null}

                {/* Form */}
                {tab === 'login' ? (
                    <View style={s.form}>
                        <Text style={s.label}>Adresse Email</Text>
                        <TextInput
                            style={s.input}
                            placeholder="votre@email.com"
                            placeholderTextColor={colors.textMuted}
                            value={loginEmail}
                            onChangeText={setLoginEmail}
                            keyboardType="email-address"
                            autoComplete="email"
                            autoCapitalize="none"
                        />

                        <Text style={s.label}>Mot de passe</Text>
                        <View style={s.passwordContainer}>
                            <TextInput
                                style={[s.input, { flex: 1, borderRightWidth: 0, borderTopRightRadius: 0, borderBottomRightRadius: 0 }]}
                                placeholder="••••••••"
                                placeholderTextColor={colors.textMuted}
                                value={loginPassword}
                                onChangeText={setLoginPassword}
                                secureTextEntry={!showLoginPass}
                                autoComplete="current-password"
                            />
                            <Pressable 
                                style={s.eyeButton} 
                                onPress={() => setShowLoginPass(!showLoginPass)}
                            >
                                <Ionicons 
                                    name={showLoginPass ? 'eye-off-outline' : 'eye-outline'} 
                                    size={20} 
                                    color={colors.textSecondary} 
                                />
                            </Pressable>
                        </View>

                        <TouchableOpacity style={s.primaryBtn} onPress={handleLogin} disabled={isLoading}>
                            {isLoading
                                ? <ActivityIndicator color="#000" />
                                : <Text style={s.primaryBtnText}>Se connecter</Text>}
                        </TouchableOpacity>

                        <TouchableOpacity style={s.link} onPress={() => setTab('register')}>
                            <Text style={s.linkText}>Pas encore de compte ? <Text style={s.linkAccent}>S&apos;inscrire</Text></Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={s.form}>
                        <Text style={s.label}>Nom complet</Text>
                        <TextInput
                            style={s.input}
                            placeholder="Mamadou Diallo"
                            placeholderTextColor={colors.textMuted}
                            value={fullName}
                            onChangeText={setFullName}
                            autoCapitalize="words"
                            autoComplete="name"
                        />

                        <Text style={s.label}>Adresse Email</Text>
                        <TextInput
                            style={s.input}
                            placeholder="votre@email.com"
                            placeholderTextColor={colors.textMuted}
                            value={regEmail}
                            onChangeText={setRegEmail}
                            keyboardType="email-address"
                            autoComplete="email"
                            autoCapitalize="none"
                        />


                        <Text style={s.label}>Mot de passe</Text>
                        <View style={s.passwordContainer}>
                            <TextInput
                                style={[s.input, { flex: 1, borderRightWidth: 0, borderTopRightRadius: 0, borderBottomRightRadius: 0 }]}
                                placeholder="8 caractères minimum"
                                placeholderTextColor={colors.textMuted}
                                value={regPassword}
                                onChangeText={setRegPassword}
                                secureTextEntry={!showRegPass}
                                autoComplete="new-password"
                            />
                            <Pressable 
                                style={s.eyeButton} 
                                onPress={() => setShowRegPass(!showRegPass)}
                            >
                                <Ionicons 
                                    name={showRegPass ? 'eye-off-outline' : 'eye-outline'} 
                                    size={20} 
                                    color={colors.textSecondary} 
                                />
                            </Pressable>
                        </View>

                        <Text style={s.label}>Confirmer le mot de passe</Text>
                        <View style={s.passwordContainer}>
                            <TextInput
                                style={[s.input, { flex: 1, borderRightWidth: 0, borderTopRightRadius: 0, borderBottomRightRadius: 0 }]}
                                placeholder="••••••••"
                                placeholderTextColor={colors.textMuted}
                                value={regConfirm}
                                onChangeText={setRegConfirm}
                                secureTextEntry={!showRegConfirm}
                            />
                            <Pressable 
                                style={s.eyeButton} 
                                onPress={() => setShowRegConfirm(!showRegConfirm)}
                            >
                                <Ionicons 
                                    name={showRegConfirm ? 'eye-off-outline' : 'eye-outline'} 
                                    size={20} 
                                    color={colors.textSecondary} 
                                />
                            </Pressable>
                        </View>

                        <Text style={[s.label, { marginTop: spacing.lg }]}>Vous êtes ?</Text>
                        <View style={s.roleRow}>
                            {ROLES.map(r => (
                                <TouchableOpacity
                                    key={r.value}
                                    style={[s.roleChip, role === r.value && s.roleChipActive]}
                                    onPress={() => setRole(r.value)}
                                >
                                    <Text style={s.roleEmoji}>{r.emoji}</Text>
                                    <Text style={[s.roleLabel, role === r.value && s.roleLabelActive]}>{r.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity style={s.primaryBtn} onPress={handleRegister} disabled={isLoading}>
                            {isLoading
                                ? <ActivityIndicator color="#000" />
                                : <Text style={s.primaryBtnText}>Créer mon compte</Text>}
                        </TouchableOpacity>

                        <TouchableOpacity style={s.link} onPress={() => setTab('login')}>
                            <Text style={s.linkText}>Déjà un compte ? <Text style={s.linkAccent}>Se connecter</Text></Text>
                        </TouchableOpacity>
                    </View>
                )}

                <TouchableOpacity style={s.skip} onPress={() => router.back()}>
                    <Text style={s.skipText}>Continuer sans compte →</Text>
                </TouchableOpacity>
            </KeyboardAwareScrollViewCompat>
        </View>
    );
}

function makeStyles(colors: ReturnType<typeof getColors>, isDark: boolean) {
    return StyleSheet.create({
        root: { flex: 1, backgroundColor: colors.background },
        scroll: { flexGrow: 1, paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
        header: { alignItems: 'center', paddingTop: spacing.xxl, paddingBottom: spacing.xl },
        logoMark: {
            width: 64,
            height: 64,
            borderRadius: borderRadius.lg,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: spacing.md,
        },
        logoText: { fontSize: 36, fontFamily: 'Inter_900Black', color: '#000' },
        brand: { fontSize: 28, fontFamily: 'Inter_900Black', color: colors.textPrimary, letterSpacing: 2 },
        tagline: { fontSize: 14, fontFamily: 'Inter_400Regular', color: colors.textSecondary, marginTop: spacing.xs },

        tabs: {
            flexDirection: 'row',
            backgroundColor: colors.surface,
            borderRadius: borderRadius.xl,
            padding: 4,
            marginBottom: spacing.lg,
        },
        tab: { flex: 1, paddingVertical: spacing.sm + 2, alignItems: 'center', borderRadius: borderRadius.lg },
        tabActive: { backgroundColor: colors.primary },
        tabText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: colors.textSecondary },
        tabTextActive: { color: '#000' },

        errorBanner: {
            backgroundColor: isDark ? 'rgba(255,68,68,0.15)' : '#FFF0F0',
            borderRadius: borderRadius.md,
            padding: spacing.md,
            marginBottom: spacing.md,
            borderWidth: 1,
            borderColor: 'rgba(255,68,68,0.3)',
        },
        errorText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: colors.danger },

        form: { gap: spacing.sm },
        label: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: colors.textSecondary, marginTop: spacing.sm },
        input: {
            backgroundColor: colors.surface,
            borderRadius: borderRadius.md,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm + 4,
            fontFamily: 'Inter_400Regular',
            fontSize: 16,
            color: colors.textPrimary,
            borderWidth: 1,
            borderColor: colors.border,
        },
        passwordContainer: {
            flexDirection: 'row',
            alignItems: 'stretch',
        },
        eyeButton: {
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderLeftWidth: 0,
            borderColor: colors.border,
            borderTopRightRadius: borderRadius.md,
            borderBottomRightRadius: borderRadius.md,
            paddingHorizontal: spacing.md,
            justifyContent: 'center',
            alignItems: 'center',
        },

        primaryBtn: {
            backgroundColor: colors.primary,
            borderRadius: borderRadius.xl,
            paddingVertical: spacing.md,
            alignItems: 'center',
            marginTop: spacing.lg,
        },
        primaryBtnText: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#000' },

        roleRow: { flexDirection: 'row', gap: spacing.sm },
        roleChip: {
            flex: 1,
            backgroundColor: colors.surface,
            borderRadius: borderRadius.md,
            padding: spacing.md,
            alignItems: 'center',
            borderWidth: 2,
            borderColor: colors.border,
        },
        roleChipActive: { borderColor: colors.primary, backgroundColor: isDark ? 'rgba(184,245,58,0.1)' : 'rgba(184,245,58,0.15)' },
        roleEmoji: { fontSize: 22, marginBottom: spacing.xs },
        roleLabel: { fontFamily: 'Inter_500Medium', fontSize: 12, color: colors.textSecondary },
        roleLabelActive: { color: colors.textPrimary },

        link: { alignItems: 'center', marginTop: spacing.md },
        linkText: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.textSecondary },
        linkAccent: { fontFamily: 'Inter_600SemiBold', color: colors.primary },

        skip: { alignItems: 'center', marginTop: spacing.xl },
        skipText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: colors.textMuted },
    });
}
