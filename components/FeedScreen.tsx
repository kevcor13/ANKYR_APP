import React, { useEffect, useState } from 'react';
import { View, FlatList, Text } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PostCard from '@/components/PostCard';
import {useGlobal} from "@/context/GlobalProvider"; // A component to display individual posts

// @ts-ignore
const FeedScreen = ({ currentUserId }) => {
    const { ngrokAPI } = useGlobal();
    const [feedPosts, setFeedPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFeed = async () => {
        const token = await AsyncStorage.getItem("token");
        try {
            const response = await axios.post(`${ngrokAPI}/feed`, { token, userId: currentUserId });
            if (response.data.status === "success") {
                setFeedPosts(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching feed", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeed();
    }, []);

    if (loading) {
        return <Text style={{ color: 'white' }}>Loading feed...</Text>;
    }

    return (
        <View>
            <FlatList
                data={feedPosts}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => <PostCard post={item} />}
            />
        </View>
    );
};

export default FeedScreen;
