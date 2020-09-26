package response

import (
	"encoding/json"
	"log"
)

type Response struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}

func CreateResponse(code int, message string) string {
	res := Response{
		Code:    code,
		Message: message,
	}
	jsonBytes, err := json.Marshal(res)
	if err != nil {
		log.Printf("failed to convert json: %v", err)
		return ""
	}
	return string(jsonBytes)
}
