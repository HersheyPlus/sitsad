import { create } from 'zustand'

interface ILoader {
    loading: boolean
    toggle: (by: boolean) => void
}

const useLoaderStore = create<ILoader>((set) => ({
    loading: false,
    toggle: (status) => set(() => ({ loading: status })),
}))

export default useLoaderStore
