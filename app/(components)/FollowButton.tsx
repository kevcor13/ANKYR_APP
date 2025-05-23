import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useGlobal} from "@/context/GlobalProvider";

// @ts-ignore
const FollowButton = ({ currentUserId, targetUserId, isFollowing, onStatusChange }) => {
    const { ngrokAPI } = useGlobal();

    const handlePress = async () => {
        const token = await AsyncStorage.getItem("token");
        try {
            if (isFollowing) {
                // Unfollow
                const response = await axios.post(`${ngrokAPI}/unfollow`, {
                    userId: currentUserId,
                    targetId: targetUserId
                });
                if(response.data.status === "success"){
                    onStatusChange(false);
                }
            } else {
                // Follow
                const response = await axios.post(`${ngrokAPI}/follow`, {
                    userId: currentUserId,
                    targetId: targetUserId
                });
                if(response.data.status === "success"){
                    onStatusChange(true);
                }
            }
        } catch (error) {
            console.error("Error changing follow status:", error);
        }
    };

    return (
        <TouchableOpacity onPress={handlePress}>
            <View style={{ padding: 10, backgroundColor: isFollowing ? 'gray' : 'blue' }}>
                <Text style={{ color: 'white' }}>{isFollowing ? 'Unfollow' : 'Follow'}</Text>
            </View>
        </TouchableOpacity>
    );
};

export default FollowButton;
