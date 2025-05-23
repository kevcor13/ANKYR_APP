import {View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator} from 'react-native'
import React, {useEffect, useState} from 'react'
import {SafeAreaView} from "react-native-safe-area-context";
import images from "@/constants/images"
import icons from "@/constants/icons"
import {useGlobal} from "@/context/GlobalProvider";
import {router} from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import PostCard from "../../components/PostCard";// Import the PostCard component

const Home = () => {
    const { userData, fetchFollowerUsers, fetchFollowingUsers, ngrokAPI} = useGlobal();
    const [isLoading, setIsLoading] = useState(true);
    const [followingUsers, setFollowingUsers] = useState([]);
    const [followersUsers, setFollowersUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [loadingPosts, setLoadingPosts] = useState(true);

    useEffect(() => {
        // Set a short timeout to ensure userData is loaded
        const timer = setTimeout(() => {
            setIsLoading(false);
            if (!userData) {
                router.push('/(root)/sign-in');
            } else {
                loadFollowingAndPosts();
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [userData]);

    const loadFollowingAndPosts = async () => {
        try {
            setLoadingPosts(true);

            // Get token for API calls
            const token = await AsyncStorage.getItem("token");
            if (!token) {
                console.error('No authentication token found');
                return;
            }

            // 1. Fetch followers list (users who follow the current user)
            const followers = await fetchFollowerUsers();
            setFollowersUsers(followers);

            // 2. Filter to get only followers with requestStatus = true
            const acceptedFollowers = followers
                .filter(u => u.requestStatus === true)
                .map(u => u.id);

            // 3. Fetch following list (users that the current user follows)
            const following = await fetchFollowingUsers(userData._id);
            setFollowingUsers(following);

            // 4. Filter to get only followings with requestStatus = true
            const acceptedFollowings = following
                .filter(u => u.requestStatus === true)
                .map(u => u.id);

            // 5. Combine both lists to get all users whose posts we want to show
            const combinedUserIds = [...new Set([...acceptedFollowings, ...acceptedFollowers])];

            // 6. Also include the current user's ID to show their own posts
            if (!combinedUserIds.includes(userData._id)) {
                combinedUserIds.push(userData._id);
            }

            // 7. Fetch posts for all users in the combined list
            let allPosts = [];
            for (const userId of combinedUserIds) {
                const resp = await axios.post(
                    `${ngrokAPI}/getUserPosts`,
                    { token, UserId: userId }
                );
                if (resp.data.status === 'success') {
                    allPosts = allPosts.concat(resp.data.data);
                } else {
                    console.error(`Failed to fetch posts for ${userId}:`, resp.data.message);
                }
            }

            // 8. Sort newest first and set state
            allPosts.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
            setPosts(allPosts);

        } catch (error) {
            console.error("Error loading feed:", error);
        } finally {
            setLoadingPosts(false);
            setIsLoading(false);
        }
    };

    const renderHeader = () => (
        <>
            <View className="my-6 px-4 space-y-6">
                <View className="justify-between items-start flex-row mb-6">
                    <View>
                        <Text className="font-poppins-medium text-gray-100">Welcome Back</Text>
                        <Text className="font-poppins-semibold text-2xl text-cyan-100">
                            {userData?.username || "User"}
                        </Text>
                    </View>
                    <View className="mt-[-20]">
                        <Image
                            source={images.ankyr}
                            className="w-20 h-20"
                            resizeMode="contain"/>
                    </View>
                </View>
            </View>
            <View className="mt-[-20] flex-row px-10">
                <View className="items-center">
                    <TouchableOpacity className="p-6 rounded-full bg-white">
                        <Image source={icons.headphonesIcon} className="w-8 h-8"/>
                    </TouchableOpacity>
                    <Text className="text-white font-poppins-semibold mt-4 text-center text-lg">Playlist</Text>
                </View>
                <View className="items-center px-12">
                    <TouchableOpacity className="p-6 rounded-full bg-white">
                        <Image source={icons.libraryIcon} className="w-8 h-8"/>
                    </TouchableOpacity>
                    <Text className="text-white font-poppins-semibold mt-4 text-center text-lg">Your library</Text>
                </View>
                <View className="items-center">
                    <TouchableOpacity
                        className="p-6 rounded-full bg-white"
                        onPress={() => router.push("/(components)/SearchScreen?query=")}
                    >
                        <Image source={icons.searchIcon} className="w-8 h-8" />
                    </TouchableOpacity>
                    <Text className="text-white font-poppins-semibold mt-4 text-center text-lg">Search</Text>
                </View>
            </View>

            <View className="mt-8 px-4">
                <Text className="text-white font-poppins-semibold text-xl mb-2">Your Feed</Text>
            </View>
        </>
    );

    const renderEmptyComponent = () => (
        <View className="flex-1 justify-center items-center py-10">
            {loadingPosts ? (
                <ActivityIndicator size="large" color="#FFFFFF" />
            ) : (
                <Text className="text-white text-center px-4">
                    No posts found. Start following users to see their posts here!
                </Text>
            )}
        </View>
    );

    if (isLoading) {
        return (
            <SafeAreaView className="bg-black h-full justify-center items-center">
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text className="text-white mt-4">Loading your data...</Text>
            </SafeAreaView>
        );
    }

    if (!userData) return null;

    return (
        <SafeAreaView className="bg-black h-full">
            <FlatList
                data={posts}
                //keyExtractor={(item) => item._id}
                renderItem={({item}) => <PostCard post={item} />}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={renderEmptyComponent}
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
                onRefresh={loadFollowingAndPosts}
                refreshing={loadingPosts}
            />
        </SafeAreaView>
    )
}

export default Home