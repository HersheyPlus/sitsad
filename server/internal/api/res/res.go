package res

type BaseResponse struct {
    IsSuccess bool        `json:"success"`
    Msg       string      `json:"message"`
    Payload   interface{} `json:"data"`
}


func NewResponse(success bool, message string, data interface{}) *BaseResponse {
    return &BaseResponse{
        IsSuccess: success,
        Msg:       message,
        Payload:   data,
    }
}
