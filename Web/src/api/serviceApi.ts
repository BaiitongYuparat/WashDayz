import axios from "axios";

const MAIN_API = "http://localhost:8080/mainservices";
const ADDON_API = "http://localhost:8080/addonservice";
const SERVICE_API = "http://localhost:8080/services";

export type MainService = {
    main_service_id: string
    name: string
    description: string
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

export type ServiceRelation = {
    main_service_id: string;
    addon_service_id: string;
    mainService: {
        name: string;
        description: string;
    };
    addonService: {
        name: string;
        description: string;
        price: number;
    };
};

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

export const updateAddonService = async (id: string, data: { name: string; description: string; price_per_unit: number; }): Promise<void> => {
    await axios.put(`${ADDON_API}/${id}`, data);
};

export const updateMainService = async (id: string, data: { name: string; description: string; price: number; }): Promise<void> => {
    await axios.put(`${MAIN_API}/${id}`, data);
};

export const getServiceRelations = async (): Promise<ServiceRelation[]> => {
    const res = await axios.get<ServiceRelation[]>(SERVICE_API);
    return res.data;
};

export const createServiceRelation = async (main_service_id: string, addon_service_id: string[]): Promise<void> => {
    await axios.post(SERVICE_API, { main_service_id, addon_service_id });
};

export const deleteServiceRelation = async (main_service_id: string, addon_service_id: string): Promise<void> => {
    await axios.delete(SERVICE_API, {
        data: { main_service_id, addon_service_id },
    });
};

export const createAddonService = async (data: any) => {
    const res = await axios.post(ADDON_API, data);
    return res.data;
}

export const createMainService = async (data: any) => {
    const res = await axios.post(MAIN_API, data);
    return res.data;
}