package utils

func GetFloat64Value(ptr *float64) float64 {
    if ptr == nil {
        return 0
    }
    return *ptr
}