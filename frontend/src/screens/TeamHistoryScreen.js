import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    Alert,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
    RefreshControl,
    TextInput,
    ScrollView,
    StatusBar,
    Modal,
    Animated,
    Dimensions
} from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { AuthContext } from '../AuthContext';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

const { width } = Dimensions.get('window');

const TeamHistoryScreen = ({ navigation }) => {
    const { userToken } = useContext(AuthContext);
    const [interactions, setInteractions] = useState([]);
    const [clients, setClients] = useState([]);
    const [engineers, setEngineers] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [selectedEngineer, setSelectedEngineer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Filter dropdown states
    const [showClientPicker, setShowClientPicker] = useState(false);
    const [showEngineerPicker, setShowEngineerPicker] = useState(false);
    const [clientSearch, setClientSearch] = useState('');
    const [engineerSearch, setEngineerSearch] = useState('');

    useEffect(() => {
        fetchClients();
        fetchEngineers();
        fetchInteractions();
    }, []);

    useEffect(() => {
        fetchInteractions();
    }, [selectedClient, selectedEngineer]);

    const fetchClients = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/clients`);
            setClients(response.data);
        } catch (error) {
            console.log('Error fetching clients:', error);
        }
    };

    const fetchEngineers = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/team-engineers`, {
                headers: { Authorization: `Bearer ${userToken}` }
            });
            setEngineers(response.data);
        } catch (error) {
            console.log('Error fetching engineers:', error);
        }
    };

    const fetchInteractions = async () => {
        try {
            let url = `${API_BASE_URL}/team-interactions`;
            const params = [];
            if (selectedClient) params.push(`client_id=${selectedClient}`);
            if (selectedEngineer) params.push(`engineer_id=${selectedEngineer}`);
            if (params.length > 0) url += `?${params.join('&')}`;

            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${userToken}` }
            });
            setInteractions(response.data);
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch team interactions');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchInteractions();
    };

    const clearFilters = () => {
        setSelectedClient(null);
        setSelectedEngineer(null);
        setClientSearch('');
        setEngineerSearch('');
    };

    const getEngineerInitial = (name) => {
        if (!name) return '?';
        return name.charAt(0).toUpperCase();
    };

    const getSelectedClientName = () => {
        if (!selectedClient) return 'All Clients';
        const client = clients.find(c => c.id === selectedClient);
        return client ? client.name : 'All Clients';
    };

    const getSelectedEngineerName = () => {
        if (!selectedEngineer) return 'All Engineers';
        const engineer = engineers.find(e => e.id === selectedEngineer);
        return engineer ? (engineer.name || engineer.email) : 'All Engineers';
    };

    const getFilteredClients = () => {
        if (!clientSearch.trim()) return clients;
        return clients.filter(c =>
            c.name.toLowerCase().includes(clientSearch.toLowerCase())
        );
    };

    const getFilteredEngineers = () => {
        if (!engineerSearch.trim()) return engineers;
        return engineers.filter(e =>
            (e.name || e.email).toLowerCase().includes(engineerSearch.toLowerCase())
        );
    };

    const getStatusColor = (status) => {
        return status === 'done' ? colors.success : colors.warning;
    };

    const getTypeColor = (type) => {
        const typeColors = {
            'call': colors.call,
            'email': colors.email,
            'message': colors.message
        };
        return typeColors[type?.toLowerCase()] || colors.direction;
    };

    // Get initials for avatar
    const getInitials = (name) => {
        if (!name) return '?';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('InteractionDetail', { interaction: item })}
            activeOpacity={0.8}
        >
            <View style={styles.cardHeader}>
                <View style={styles.engineerInfo}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{getEngineerInitial(item.engineer_name)}</Text>
                    </View>
                    <View style={styles.engineerDetails}>
                        <Text style={styles.engineerName}>{item.engineer_name}</Text>
                        <Text style={styles.clientName}>Client: {item.client_name}</Text>
                    </View>
                </View>
                <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleDateString()}</Text>
            </View>

            <View style={styles.badgesContainer}>
                <View style={[styles.badge, { backgroundColor: getTypeColor(item.interaction_type) }]}>
                    <Text style={styles.badgeText}>{item.interaction_type?.toUpperCase()}</Text>
                </View>
                <View style={[styles.badge, styles.directionBadge]}>
                    <Text style={styles.badgeText}>{item.direction?.toUpperCase()}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={styles.badgeText}>
                        {item.status === 'done' ? '✓ DONE' : '⏳ PENDING'}
                    </Text>
                </View>
            </View>

            <Text style={styles.summary} numberOfLines={2}>{item.summary}</Text>
        </TouchableOpacity>
    );

    // Professional Filter Modal Component
    const FilterModal = ({ visible, onClose, title, data, selectedValue, onSelect, searchValue, onSearchChange, type }) => (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    {/* Modal Header */}
                    <View style={styles.modalHeader}>
                        <View style={styles.modalHeaderLeft}>
                            <View style={styles.modalIconContainer}>
                                <Text style={styles.modalIcon}>{type === 'client' ? '🏢' : '👷'}</Text>
                            </View>
                            <Text style={styles.modalTitle}>{title}</Text>
                        </View>
                        <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
                            <Text style={styles.modalCloseText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Professional Search Bar */}
                    <View style={styles.searchWrapper}>
                        <View style={styles.searchBarContainer}>
                            <View style={styles.searchIconWrapper}>
                                <Text style={styles.searchIcon}>🔍</Text>
                            </View>
                            <TextInput
                                style={styles.modalSearchInput}
                                placeholder={`Search ${type === 'client' ? 'clients' : 'engineers'}...`}
                                value={searchValue}
                                onChangeText={onSearchChange}
                                placeholderTextColor={colors.textLight}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                            {searchValue.length > 0 && (
                                <TouchableOpacity
                                    style={styles.clearSearchButton}
                                    onPress={() => onSearchChange('')}
                                >
                                    <Text style={styles.clearSearchText}>✕</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                        <Text style={styles.searchHint}>
                            {data.length} {type === 'client' ? 'clients' : 'engineers'} available
                        </Text>
                    </View>

                    {/* Options List */}
                    <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                        {/* All Option */}
                        <TouchableOpacity
                            style={[
                                styles.modalItem,
                                !selectedValue && styles.modalItemSelected
                            ]}
                            onPress={() => {
                                onSelect(null);
                                onClose();
                                onSearchChange('');
                            }}
                            activeOpacity={0.7}
                        >
                            <View style={styles.modalItemLeft}>
                                <View style={[styles.itemAvatar, styles.allItemAvatar]}>
                                    <Text style={styles.allItemAvatarText}>∞</Text>
                                </View>
                                <View style={styles.itemInfo}>
                                    <Text style={[
                                        styles.modalItemText,
                                        !selectedValue && styles.modalItemTextSelected
                                    ]}>
                                        All {type === 'client' ? 'Clients' : 'Engineers'}
                                    </Text>
                                    <Text style={styles.itemSubtext}>Show all records</Text>
                                </View>
                            </View>
                            {!selectedValue && (
                                <View style={styles.checkmarkContainer}>
                                    <Text style={styles.checkmark}>✓</Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        <View style={styles.dividerContainer}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>
                                {type === 'client' ? 'CLIENTS' : 'ENGINEERS'}
                            </Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {data.map((item, index) => {
                            const itemId = item.id;
                            const itemName = item.name || item.email;
                            const isSelected = selectedValue === itemId;

                            return (
                                <TouchableOpacity
                                    key={itemId}
                                    style={[
                                        styles.modalItem,
                                        isSelected && styles.modalItemSelected,
                                        index === data.length - 1 && styles.lastModalItem
                                    ]}
                                    onPress={() => {
                                        onSelect(itemId);
                                        onClose();
                                        onSearchChange('');
                                    }}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.modalItemLeft}>
                                        <View style={[
                                            styles.itemAvatar,
                                            isSelected && styles.itemAvatarSelected
                                        ]}>
                                            <Text style={[
                                                styles.itemAvatarText,
                                                isSelected && styles.itemAvatarTextSelected
                                            ]}>
                                                {getInitials(itemName)}
                                            </Text>
                                        </View>
                                        <View style={styles.itemInfo}>
                                            <Text style={[
                                                styles.modalItemText,
                                                isSelected && styles.modalItemTextSelected
                                            ]}>
                                                {itemName}
                                            </Text>
                                            {item.email && item.name && (
                                                <Text style={styles.itemSubtext}>{item.email}</Text>
                                            )}
                                        </View>
                                    </View>
                                    {isSelected && (
                                        <View style={styles.checkmarkContainer}>
                                            <Text style={styles.checkmark}>✓</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}

                        {data.length === 0 && (
                            <View style={styles.noResultsContainer}>
                                <Text style={styles.noResultsIcon}>🔎</Text>
                                <Text style={styles.noResultsText}>No results found</Text>
                                <Text style={styles.noResultsSubtext}>Try a different search term</Text>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Loading team history...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor={colors.primary} translucent={false} />
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Text style={styles.backText}>← Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Team Work History</Text>
                </View>

                {/* Professional Filters Card */}
                <View style={styles.filtersCard}>
                    {/* Filter Header */}
                    <View style={styles.filterCardHeader}>
                        <View style={styles.filterHeaderLeft}>
                            <Text style={styles.filterHeaderIcon}>⚙️</Text>
                            <Text style={styles.filterHeaderTitle}>Filters</Text>
                        </View>
                        {(selectedClient || selectedEngineer) && (
                            <TouchableOpacity style={styles.clearAllButton} onPress={clearFilters}>
                                <Text style={styles.clearAllIcon}>↺</Text>
                                <Text style={styles.clearAllText}>Reset</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Filter Buttons Row */}
                    <View style={styles.filterButtonsRow}>
                        {/* Client Filter Button */}
                        <TouchableOpacity
                            style={[
                                styles.filterSelectButton,
                                selectedClient && styles.filterSelectButtonActive
                            ]}
                            onPress={() => setShowClientPicker(true)}
                            activeOpacity={0.8}
                        >
                            <View style={styles.filterButtonContent}>
                                <View style={styles.filterButtonIconWrapper}>
                                    <Text style={styles.filterButtonIcon}>🏢</Text>
                                </View>
                                <View style={styles.filterButtonTextContainer}>
                                    <Text style={styles.filterButtonLabel}>Client</Text>
                                    <Text
                                        style={[
                                            styles.filterButtonValue,
                                            selectedClient && styles.filterButtonValueActive
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {getSelectedClientName()}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.filterButtonArrowContainer}>
                                <Text style={[
                                    styles.filterButtonArrow,
                                    selectedClient && styles.filterButtonArrowActive
                                ]}>▼</Text>
                            </View>
                        </TouchableOpacity>

                        {/* Engineer Filter Button */}
                        <TouchableOpacity
                            style={[
                                styles.filterSelectButton,
                                selectedEngineer && styles.filterSelectButtonActive
                            ]}
                            onPress={() => setShowEngineerPicker(true)}
                            activeOpacity={0.8}
                        >
                            <View style={styles.filterButtonContent}>
                                <View style={styles.filterButtonIconWrapper}>
                                    <Text style={styles.filterButtonIcon}>👷</Text>
                                </View>
                                <View style={styles.filterButtonTextContainer}>
                                    <Text style={styles.filterButtonLabel}>Engineer</Text>
                                    <Text
                                        style={[
                                            styles.filterButtonValue,
                                            selectedEngineer && styles.filterButtonValueActive
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {getSelectedEngineerName()}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.filterButtonArrowContainer}>
                                <Text style={[
                                    styles.filterButtonArrow,
                                    selectedEngineer && styles.filterButtonArrowActive
                                ]}>▼</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Active Filters Chips */}
                    {(selectedClient || selectedEngineer) && (
                        <View style={styles.activeFiltersContainer}>
                            <Text style={styles.activeFiltersLabel}>Active:</Text>
                            <View style={styles.activeFiltersChips}>
                                {selectedClient && (
                                    <View style={styles.filterChip}>
                                        <Text style={styles.filterChipIcon}>🏢</Text>
                                        <Text style={styles.filterChipText} numberOfLines={1}>
                                            {getSelectedClientName()}
                                        </Text>
                                        <TouchableOpacity
                                            style={styles.filterChipClose}
                                            onPress={() => setSelectedClient(null)}
                                        >
                                            <Text style={styles.filterChipCloseText}>✕</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                                {selectedEngineer && (
                                    <View style={styles.filterChip}>
                                        <Text style={styles.filterChipIcon}>👷</Text>
                                        <Text style={styles.filterChipText} numberOfLines={1}>
                                            {getSelectedEngineerName()}
                                        </Text>
                                        <TouchableOpacity
                                            style={styles.filterChipClose}
                                            onPress={() => setSelectedEngineer(null)}
                                        >
                                            <Text style={styles.filterChipCloseText}>✕</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </View>
                    )}
                </View>

                {/* Filter Modals */}
                <FilterModal
                    visible={showClientPicker}
                    onClose={() => {
                        setShowClientPicker(false);
                        setClientSearch('');
                    }}
                    title="Select Client"
                    data={getFilteredClients()}
                    selectedValue={selectedClient}
                    onSelect={setSelectedClient}
                    searchValue={clientSearch}
                    onSearchChange={setClientSearch}
                    type="client"
                />

                <FilterModal
                    visible={showEngineerPicker}
                    onClose={() => {
                        setShowEngineerPicker(false);
                        setEngineerSearch('');
                    }}
                    title="Select Engineer"
                    data={getFilteredEngineers()}
                    selectedValue={selectedEngineer}
                    onSelect={setSelectedEngineer}
                    searchValue={engineerSearch}
                    onSearchChange={setEngineerSearch}
                    type="engineer"
                />

                {/* Stats Bar */}
                <View style={styles.statsBar}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{interactions.length}</Text>
                        <Text style={styles.statLabel}>Total</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: colors.success }]}>
                            {interactions.filter(i => i.status === 'done').length}
                        </Text>
                        <Text style={styles.statLabel}>Done</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: colors.warning }]}>
                            {interactions.filter(i => i.status !== 'done').length}
                        </Text>
                        <Text style={styles.statLabel}>Pending</Text>
                    </View>
                </View>

                {/* Interactions List */}
                {interactions.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>📋</Text>
                        <Text style={styles.emptyText}>No interactions found</Text>
                        <Text style={styles.emptySubtext}>
                            {(selectedClient || selectedEngineer) ? 'Try adjusting your filters' : 'Team interactions will appear here'}
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={interactions}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContent}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={[colors.accent]}
                            />
                        }
                    />
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.primary
    },
    container: {
        flex: 1,
        backgroundColor: colors.backgroundLight
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.backgroundLight
    },
    loadingText: {
        marginTop: spacing.sm,
        color: colors.textMuted,
        fontSize: typography.fontSize.lg
    },
    header: {
        backgroundColor: colors.primary,
        paddingTop: spacing.sm,
        paddingBottom: spacing.lg,
        paddingHorizontal: spacing.lg,
        flexDirection: 'row',
        alignItems: 'center'
    },
    backButton: {
        marginRight: spacing.lg
    },
    backText: {
        color: colors.textWhite,
        fontSize: typography.fontSize.lg
    },
    headerTitle: {
        color: colors.textWhite,
        fontSize: typography.fontSize.xxl,
        fontWeight: typography.fontWeight.bold
    },

    // Professional Filter Card Styles
    filtersCard: {
        backgroundColor: colors.background,
        marginHorizontal: spacing.md,
        marginTop: spacing.md,
        marginBottom: spacing.sm,
        borderRadius: borderRadius.lg,
        ...shadows.md,
        overflow: 'hidden'
    },
    filterCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        backgroundColor: colors.primaryLight,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.2)'
    },
    filterHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    filterHeaderIcon: {
        fontSize: 18,
        marginRight: spacing.sm
    },
    filterHeaderTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        color: colors.textWhite
    },
    clearAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: spacing.sm,
        paddingVertical: 6,
        borderRadius: borderRadius.round
    },
    clearAllIcon: {
        fontSize: 14,
        color: colors.textWhite,
        marginRight: 4
    },
    clearAllText: {
        fontSize: typography.fontSize.sm,
        color: colors.textWhite,
        fontWeight: typography.fontWeight.medium
    },
    filterButtonsRow: {
        flexDirection: 'row',
        padding: spacing.md,
        gap: spacing.sm
    },
    filterSelectButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.backgroundLight,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
        borderWidth: 2,
        borderColor: colors.border
    },
    filterSelectButtonActive: {
        borderColor: colors.primary,
        backgroundColor: '#E6F7FA'
    },
    filterButtonContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center'
    },
    filterButtonIconWrapper: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.backgroundDark,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.sm
    },
    filterButtonIcon: {
        fontSize: 18
    },
    filterButtonTextContainer: {
        flex: 1
    },
    filterButtonLabel: {
        fontSize: typography.fontSize.xs,
        color: colors.textLight,
        fontWeight: typography.fontWeight.medium,
        textTransform: 'uppercase',
        letterSpacing: 0.5
    },
    filterButtonValue: {
        fontSize: typography.fontSize.md,
        color: colors.textSecondary,
        fontWeight: typography.fontWeight.semibold,
        marginTop: 2
    },
    filterButtonValueActive: {
        color: colors.primary
    },
    filterButtonArrowContainer: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.backgroundDark,
        justifyContent: 'center',
        alignItems: 'center'
    },
    filterButtonArrow: {
        fontSize: 10,
        color: colors.textMuted
    },
    filterButtonArrowActive: {
        color: colors.primary
    },

    // Active Filter Chips
    activeFiltersContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.md,
        flexWrap: 'wrap',
        gap: spacing.xs
    },
    activeFiltersLabel: {
        fontSize: typography.fontSize.sm,
        color: colors.textMuted,
        marginRight: spacing.xs
    },
    activeFiltersChips: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.xs
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        paddingLeft: spacing.sm,
        paddingRight: 4,
        paddingVertical: 6,
        borderRadius: borderRadius.round,
        maxWidth: 150
    },
    filterChipIcon: {
        fontSize: 12,
        marginRight: 4
    },
    filterChipText: {
        fontSize: typography.fontSize.sm,
        color: colors.textWhite,
        fontWeight: typography.fontWeight.medium,
        flex: 1
    },
    filterChipClose: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 4
    },
    filterChipCloseText: {
        fontSize: 10,
        color: colors.textWhite,
        fontWeight: typography.fontWeight.bold
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end'
    },
    modalContainer: {
        backgroundColor: colors.background,
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        maxHeight: '80%',
        ...shadows.lg
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.backgroundLight
    },
    modalHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    modalIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md
    },
    modalIcon: {
        fontSize: 20
    },
    modalTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.textSecondary
    },
    modalCloseButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.backgroundDark,
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalCloseText: {
        fontSize: 16,
        color: colors.textMuted,
        fontWeight: typography.fontWeight.bold
    },

    // Search Bar Styles
    searchWrapper: {
        padding: spacing.md,
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight
    },
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.backgroundLight,
        borderRadius: borderRadius.lg,
        borderWidth: 2,
        borderColor: colors.border,
        paddingHorizontal: spacing.sm
    },
    searchIconWrapper: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center'
    },
    searchIcon: {
        fontSize: 16
    },
    modalSearchInput: {
        flex: 1,
        fontSize: typography.fontSize.lg,
        color: colors.textSecondary,
        paddingVertical: spacing.sm
    },
    clearSearchButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center'
    },
    clearSearchText: {
        fontSize: 12,
        color: colors.textMuted,
        fontWeight: typography.fontWeight.bold
    },
    searchHint: {
        fontSize: typography.fontSize.sm,
        color: colors.textLight,
        marginTop: spacing.xs,
        textAlign: 'center'
    },

    // Modal List Styles
    modalScroll: {
        maxHeight: 400
    },
    modalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight
    },
    modalItemSelected: {
        backgroundColor: '#E6F7FA'
    },
    lastModalItem: {
        borderBottomWidth: 0,
        marginBottom: spacing.lg
    },
    modalItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1
    },
    itemAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.backgroundDark,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md
    },
    itemAvatarSelected: {
        backgroundColor: colors.primary
    },
    allItemAvatar: {
        backgroundColor: colors.accent
    },
    itemAvatarText: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.bold,
        color: colors.textMuted
    },
    itemAvatarTextSelected: {
        color: colors.textWhite
    },
    allItemAvatarText: {
        fontSize: 18,
        color: colors.textWhite
    },
    itemInfo: {
        flex: 1
    },
    modalItemText: {
        fontSize: typography.fontSize.lg,
        color: colors.textSecondary,
        fontWeight: typography.fontWeight.medium
    },
    modalItemTextSelected: {
        color: colors.primary,
        fontWeight: typography.fontWeight.bold
    },
    itemSubtext: {
        fontSize: typography.fontSize.sm,
        color: colors.textLight,
        marginTop: 2
    },
    checkmarkContainer: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center'
    },
    checkmark: {
        fontSize: 14,
        color: colors.textWhite,
        fontWeight: typography.fontWeight.bold
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.border
    },
    dividerText: {
        fontSize: typography.fontSize.xs,
        color: colors.textLight,
        fontWeight: typography.fontWeight.semibold,
        marginHorizontal: spacing.md,
        letterSpacing: 1
    },
    noResultsContainer: {
        alignItems: 'center',
        paddingVertical: spacing.xxxl
    },
    noResultsIcon: {
        fontSize: 48,
        marginBottom: spacing.md
    },
    noResultsText: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textSecondary
    },
    noResultsSubtext: {
        fontSize: typography.fontSize.md,
        color: colors.textLight,
        marginTop: spacing.xs
    },

    // Stats Bar
    statsBar: {
        flexDirection: 'row',
        backgroundColor: colors.background,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        alignItems: 'center'
    },
    statItem: {
        flex: 1,
        alignItems: 'center'
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: colors.border
    },
    statNumber: {
        fontSize: typography.fontSize.xxl + 2,
        fontWeight: typography.fontWeight.bold,
        color: colors.accent
    },
    statLabel: {
        fontSize: typography.fontSize.xs,
        color: colors.textMuted,
        marginTop: 2
    },

    // List & Cards
    listContent: {
        padding: spacing.md
    },
    card: {
        backgroundColor: colors.background,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
        ...shadows.sm
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.md
    },
    engineerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.accent,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md
    },
    avatarText: {
        color: colors.textWhite,
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold
    },
    engineerDetails: {
        flex: 1
    },
    engineerName: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textSecondary
    },
    clientName: {
        fontSize: typography.fontSize.sm,
        color: colors.textMuted,
        marginTop: 2
    },
    timestamp: {
        fontSize: typography.fontSize.sm,
        color: colors.textLight
    },
    badgesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginBottom: spacing.sm
    },
    badge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: borderRadius.lg
    },
    directionBadge: {
        backgroundColor: colors.direction
    },
    badgeText: {
        color: colors.textWhite,
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.semibold
    },
    summary: {
        fontSize: typography.fontSize.md,
        color: colors.textMuted,
        lineHeight: typography.lineHeight.tight
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.xxxl
    },
    emptyIcon: {
        fontSize: 60,
        marginBottom: spacing.lg
    },
    emptyText: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textSecondary,
        marginBottom: spacing.sm
    },
    emptySubtext: {
        fontSize: typography.fontSize.md,
        color: colors.textMuted,
        textAlign: 'center'
    }
});

export default TeamHistoryScreen;
