import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    Pressable,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/useTheme';
import ImageUploaderGrid from './ImageUploaderGrid';
import { PropertyImage } from '@/lib/types';

interface PropertyImageModalProps {
    visible: boolean;
    onClose: () => void;
    propertyId: string;
    images: PropertyImage[];
    onImagesChange: () => void;
}

export default function PropertyImageModal({
    visible,
    onClose,
    propertyId,
    images,
    onImagesChange,
}: PropertyImageModalProps) {
    const { colors } = useTheme();

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={[styles.content, { backgroundColor: colors.background }]}>
                    <View style={[styles.header, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.title, { color: colors.textPrimary }]}>Gérer les images</Text>
                        <Pressable onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color={colors.textPrimary} />
                        </Pressable>
                    </View>

                    <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
                        <ImageUploaderGrid
                            propertyId={propertyId}
                            images={images}
                            onImagesChange={onImagesChange}
                        />
                        <View style={{ height: 40 }} />
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    content: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: '800',
    },
    closeBtn: {
        padding: 4,
    },
    body: {
        padding: 20,
    },
});
