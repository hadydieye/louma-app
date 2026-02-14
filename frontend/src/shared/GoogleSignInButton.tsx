import React from "react";
import { TouchableOpacity, Text, ActivityIndicator, View } from "react-native";

interface GoogleSignInButtonProps {
  onPress: () => void;
  loading?: boolean;
  error?: string | null;
}

export const GoogleSignInButton = ({ onPress, loading, error }: GoogleSignInButtonProps) => {
  return (
    <View>
      <TouchableOpacity
        className="bg-white border-2 border-gray-300 p-4 rounded-lg items-center flex-row justify-center"
        onPress={onPress}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#1f2937" />
        ) : (
          <>
            <Text className="text-xl mr-2">G</Text>
            <Text className="text-gray-800 font-semibold">Connexion avec Google</Text>
          </>
        )}
      </TouchableOpacity>
      {error && (
        <View className="mt-2 bg-red-100 p-2 rounded">
          <Text className="text-red-700 text-xs text-center">{error}</Text>
        </View>
      )}
    </View>
  );
};
