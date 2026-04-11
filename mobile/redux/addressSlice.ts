import { UserAddress, UserAddresses } from "@/services/address";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
type SelectedLocation = {
  latitude: number;
  longitude: number;
};

interface AddressState {
    selectedAddress: UserAddresses | null;
    selectedLocation: SelectedLocation | null; 
}
const initialState: AddressState = {
  selectedAddress: null, 
  selectedLocation: null,
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
  },
});

export const { setSelectedAddress, clearSelectedAddress , setSelectedLocation } = addressSlice.actions;
export default addressSlice.reducer;