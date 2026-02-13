import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    FlatList,
} from 'react-native';
import { Check, X, Bell, Shield } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface TrackingRequest {
    id: string;
    parent_id: string;
    status: string;
    created_at: string;
    parent_name: string;
    parent_role: string;
}

export default function TrackingRequests() {
    const { user } = useAuth();
    const { colors } = useTheme();
    const { t } = useLanguage();
    const [requests, setRequests] = useState<TrackingRequest[]>([]);
    const [loading, setLoading] = useState(true);

    const styles = makeStyles(colors);

    const loadRequests = useCallback(async () => {
        if (!user) return;
        setLoading(true);

        try {
            const { data: links } = await supabase
                .from('user_links')
                .select('id, parent_id, status, created_at')
                .eq('student_id', user.id)
                .order('created_at', { ascending: false });

            if (!links || links.length === 0) {
                setRequests([]);
                setLoading(false);
                return;
            }

            const parentIds = links.map(l => l.parent_id);
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, full_name, role')
                .in('id', parentIds);

            const result = links.map(link => {
                const profile = profiles?.find(p => p.id === link.parent_id);
                return {
                    ...link,
                    parent_name: profile?.full_name || 'Unknown',
                    parent_role: profile?.role || 'parent',
                };
            });

            setRequests(result);
        } catch (err) {
            console.error('Error loading requests:', err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadRequests();
    }, [loadRequests]);

    const updateStatus = async (linkId: string, newStatus: 'approved' | 'rejected') => {
        const { error } = await supabase
            .from('user_links')
            .update({ status: newStatus })
            .eq('id', linkId);

        if (!error) {
            setRequests(prev =>
                prev.map(r =>
                    r.id === linkId ? { ...r, status: newStatus } : r
                )
            );
        }
    };

    const pendingCount = requests.filter(r => r.status === 'pending').length;

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.tint} />
            </View>
        );
    }

    if (requests.length === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Shield color={colors.tint} size={20} />
                <Text style={styles.title}>
                    {t('trackingRequests') || 'Запросы на отслеживание'}
                </Text>
                {pendingCount > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{pendingCount}</Text>
                    </View>
                )}
            </View>

            {requests.map(request => (
                <View key={request.id} style={styles.requestCard}>
                    <View style={styles.requestInfo}>
                        <View style={styles.avatarCircle}>
                            <Text style={styles.avatarText}>
                                {request.parent_name.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.nameText}>{request.parent_name}</Text>
                            <Text style={styles.roleText}>
                                {t(request.parent_role as any) || request.parent_role}
                            </Text>
                        </View>
                    </View>

                    {request.status === 'pending' ? (
                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={[styles.actionBtn, styles.approveBtn]}
                                onPress={() => updateStatus(request.id, 'approved')}
                            >
                                <Check color="#FFF" size={16} />
                                <Text style={styles.actionBtnText}>
                                    {t('approve') || 'Принять'}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionBtn, styles.rejectBtn]}
                                onPress={() => updateStatus(request.id, 'rejected')}
                            >
                                <X color="#FFF" size={16} />
                                <Text style={styles.actionBtnText}>
                                    {t('reject') || 'Отклонить'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={[
                            styles.statusBadge,
                            request.status === 'approved' ? styles.statusApproved : styles.statusRejected,
                        ]}>
                            <Text style={[
                                styles.statusText,
                                request.status === 'approved' ? styles.statusTextApproved : styles.statusTextRejected,
                            ]}>
                                {request.status === 'approved'
                                    ? (t('approved') || 'Одобрено')
                                    : (t('rejected') || 'Отклонено')
                                }
                            </Text>
                        </View>
                    )}
                </View>
            ))}
        </View>
    );
}

const makeStyles = (colors: any) => StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginBottom: 16,
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
        gap: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
        flex: 1,
    },
    badge: {
        backgroundColor: colors.error,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 6,
    },
    badgeText: {
        color: '#FFF',
        fontSize: 11,
        fontWeight: '700',
    },
    requestCard: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
    },
    requestInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    avatarCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.tint,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '700',
    },
    textContainer: {
        marginLeft: 10,
        flex: 1,
    },
    nameText: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.text,
    },
    roleText: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 1,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        borderRadius: 10,
        gap: 4,
    },
    approveBtn: {
        backgroundColor: '#22C55E',
    },
    rejectBtn: {
        backgroundColor: '#EF4444',
    },
    actionBtnText: {
        color: '#FFF',
        fontSize: 13,
        fontWeight: '600',
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusApproved: {
        backgroundColor: '#DCFCE7',
    },
    statusRejected: {
        backgroundColor: '#FEE2E2',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    statusTextApproved: {
        color: '#16A34A',
    },
    statusTextRejected: {
        color: '#DC2626',
    },
});
