import {View, Text, TouchableOpacity} from 'react-native'
import React from 'react'


// @ts-ignore
const CustomButton = ({handlePress, title} ) => {
    return (
        <TouchableOpacity className="bg-white rounded-2xl py-4 mt-7 justify-center"
            onPress={handlePress}
            activeOpacity={0.7}
        >
            <View className="flex flex-row items-center justify-center">
                <Text className="font-poppins-semibold text-center text-lg">{title}</Text>
            </View>
        </TouchableOpacity>
    )
}
export default CustomButton
