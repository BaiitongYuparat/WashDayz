import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useDispatch } from 'react-redux';
import { setSelectedLocation } from '@/redux/addressSlice';

const { width, height } = Dimensions.get('window');

export default function AddressMapPicker() {
  const dispatch = useDispatch();
  const [userLocation, setUserLocation] = useState<any>(null);

  useEffect(() => {
    (async () => {
      // ขอ permission เข้าถึง location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('ต้องการสิทธิ์เข้าถึงตำแหน่งของคุณ!');
        return;
      }

      // ดึงตำแหน่งปัจจุบัน
      const location = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setUserLocation(coords);

      // บันทึกลง Redux
      dispatch(setSelectedLocation(coords));
    })();
  }, []);

  const handleSelectLocation = (event: any) => {
    const coord = event.nativeEvent.coordinate;
    setUserLocation(coord);
    dispatch(
      setSelectedLocation({
        latitude: coord.latitude,
        longitude: coord.longitude,
      })
    );
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        showsUserLocation={true}  // 🔹 แสดงตำแหน่งผู้ใช้
        initialRegion={{
          latitude: 13.7563,
          longitude: 100.5018,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        onPress={handleSelectLocation}
      >
        {userLocation && <Marker coordinate={userLocation} pinColor="red" />}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width, height },
});