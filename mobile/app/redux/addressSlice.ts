import { UserAddress, UserAddresses } from "@/services/address";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AddressState {
    selectedAddress: UserAddresses | null;
}
const initialState: AddressState = {
  selectedAddress: null, 
};

const addressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {
    setSelectedAddress: (state, action: PayloadAction<UserAddresses>) => {
      state.selectedAddress = action.payload; 
    },
    clearSelectedAddress: (state) => {
      state.selectedAddress = null;
    },
  },
});

export const { setSelectedAddress, clearSelectedAddress } = addressSlice.actions;
export default addressSlice.reducer;