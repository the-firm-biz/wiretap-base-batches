import { create } from 'zustand';

interface BannersGetters {
  lowBalanceBannerPresent: boolean;
}

export type BannersSetterFn = <K extends keyof BannersGetters>(
  key: K,
  value: BannersGetters[K]
) => void;

interface BannersStore extends BannersGetters {
  setStoreValue: BannersSetterFn;
}

const initialState: BannersGetters = {
  lowBalanceBannerPresent: false
};

const useBannerStore = create<BannersStore>()((set) => ({
  ...initialState,
  setStoreValue: (key, value) => set((state) => ({ ...state, [key]: value }))
}));

export default useBannerStore;
