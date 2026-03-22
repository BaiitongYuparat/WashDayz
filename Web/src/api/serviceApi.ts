import axios from "axios";

const MAIN_API = "http://localhost:8080/mainservices"; 
const ADDON_API = "http://localhost:8080/addonservice"; 
export type MainService = {
     main_service_id: string
    name: string
    description: string
    price_per_unit: number
}

export type AddonService = {
     addon_service_id: string
    name: string
    description: string
    price: number
}

export type ServiceResponse = {
    main: MainService[]
    addon: AddonService[]
}

export const getMainService = async (): Promise<MainService[]> => {
    const res = await axios.get<MainService[]>(MAIN_API);
    return res.data;
};

export const getAddonService = async (): Promise<AddonService[]> => {
    const res = await axios.get<AddonService[]>(ADDON_API);
    return res.data;
};

export const getService = async (): Promise<ServiceResponse> => {
    const [mainRes, addonRes] = await Promise.all([
        axios.get<MainService[]>(MAIN_API),
        axios.get<AddonService[]>(ADDON_API)
    ]);

    return {
        main: mainRes.data,
        addon: addonRes.data
    };
};

export const deleteMainService = async (id: string): Promise<void> => {
  await axios.delete(`${MAIN_API}/${id}`);
};

export const deleteAddonService = async (id: string): Promise<void> => {
  await axios.delete(`${ADDON_API}/${id}`);
};

export const updateAddonService = async (id: string, data: { name: string; description: string;   price_per_unit: number; }): Promise<void> => {
  await axios.put(`${ADDON_API}/${id}`, data);
};

export const updateMainService = async (id: string, data: { name: string; description: string;  price: number; }): Promise<void> => {
  await axios.put(`${MAIN_API}/${id}`, data);
};