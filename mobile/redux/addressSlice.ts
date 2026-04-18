import { UserAddress, UserAddresses } from "@/services/address";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
type SelectedLocation = {
  latitude: number;
  longitude: number;
};

interface AddressState {
    selectedAddress: UserAddresses | null;
    selectedLocation: SelectedLocation | null; 
    geoAddress: {
    houseNo?: string;
    district?: string;
    subDistrict?: string;
    province?: string;
    postal_code?: string;
    details?: string;
  } | null;
}
const initialState: AddressState = {
  selectedAddress: null, 
  selectedLocation: null,
  geoAddress: null,
};

const addressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {
    setSelectedLocation: (state, action: PayloadAction<SelectedLocation>) => {
      state.selectedLocation = action.payload;
    },
    setSelectedAddress: (state, action: PayloadAction<UserAddresses>) => {
      state.selectedAddress = action.payload; 
    },
    clearSelectedAddress: (state) => {
      state.selectedAddress = null;
    },
    setGeoAddress: (state, action: PayloadAction<AddressState["geoAddress"]>) => {
  state.geoAddress = action.payload;
},
clearGeoAddress: (state) => {
  state.geoAddress = null;
},
  },
});

export const { setSelectedAddress, clearSelectedAddress , setSelectedLocation, setGeoAddress, clearGeoAddress } = addressSlice.actions;
export default addressSlice.reducer;