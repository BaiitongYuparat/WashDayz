import * as Location from "expo-location";
import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useDispatch } from "react-redux";
import { setSelectedLocation , setGeoAddress } from "@/redux/addressSlice";

const { width, height } = Dimensions.get("window");

export default function AddressMapPicker() {
  const dispatch = useDispatch();
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef<MapView>(null);
  const locationRef = useRef<{ latitude: number; longitude: number } | null>(
    null,
  );
  const BANGKOK = {
    latitude: 13.7563,
    longitude: 100.5018,
  };

  useEffect(() => {
  (async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    

    if (status !== "granted") {
      alert("ต้องการสิทธิ์เข้าถึงตำแหน่งของคุณ!");
    }

    // const coords = status === "granted"
    //   ? await Location.getCurrentPositionAsync({}).then((l) => ({
    //       latitude: l.coords.latitude,
    //       longitude: l.coords.longitude,
    //     }))
    //   : BANGKOK;

    // locationRef.current = coords;
    // setUserLocation(coords);
    // dispatch(setSelectedLocation(coords));

    const coords = BANGKOK; 

    const [geo] = await Location.reverseGeocodeAsync(coords);
    dispatch(setGeoAddress({
      district: geo.district ?? geo.subregion ?? "",
      subDistrict: geo.subregion ?? geo.district ?? "",
      province: geo.region ?? "",
      postal_code: geo.postalCode ?? "",
      details: geo.street ?? "",
    }));

    locationRef.current = coords;
    setUserLocation(coords);
    dispatch(setSelectedLocation(coords));
  })();
}, []);

  // animate เมื่อทั้ง map ready และมี location แล้ว
  useEffect(() => {
    if (mapReady && userLocation) {
      mapRef.current?.animateToRegion(
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000,
      );
    }
  }, [mapReady, userLocation]);

  const handleSelectLocation = async (event: any) => {
  const coord = event.nativeEvent.coordinate;
  setUserLocation(coord);
  dispatch(setSelectedLocation({ latitude: coord.latitude, longitude: coord.longitude }));

  try {
    const [geo] = await Location.reverseGeocodeAsync({
      latitude: coord.latitude,
      longitude: coord.longitude,
    });

    dispatch(setGeoAddress({
      district: geo.district ?? geo.subregion ?? "",
      subDistrict: geo.subregion ?? geo.district ?? "",
      province: geo.region ?? "",
      postal_code: geo.postalCode ?? "",
      details: geo.street ?? "",
    }));
  } catch (err) {
    console.log("reverse geocode error:", err);
  }
};

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        showsUserLocation={false}
        onMapReady={() => setMapReady(true)}
        initialRegion={{
          latitude: BANGKOK.latitude,
          longitude: BANGKOK.longitude,
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
